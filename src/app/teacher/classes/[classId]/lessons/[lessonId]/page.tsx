import { ArrowLeft, ClipboardCheck, MonitorUp } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/Button";
import { DashboardCard } from "@/components/DashboardCard";
import { Layout } from "@/components/Layout";
import {
  getAssessmentTemplatesResult,
  getK6ClassLessonAssessment,
  getLessonActivitiesResult,
  getLessonForClass,
  getLessonResourcesResult,
  getLessonSectionsResult,
  getTeacherClassResult,
  PREVIEW_TEACHER_PROFILE_ID,
  type AssessmentTemplate,
  type K6AssessmentInput,
  type LessonActivity,
  type LessonResource,
  type LessonSection
} from "@/lib/teacher-led-data";
import { submitK6AssessmentAction } from "@/app/teacher/classes/[classId]/lessons/[lessonId]/actions";

type ClassLessonPageProps = {
  params: Promise<{
    classId: string;
    lessonId: string;
  }>;
  searchParams: Promise<{
    assessment?: string;
    teacherProfileId?: string;
  }>;
};

const responseOptions = [
  { label: "Yes", value: "yes" },
  { label: "Partly", value: "partly" },
  { label: "No", value: "no" }
];

const lessonFitOptions = ["Very strong", "Good", "Needs adjustment", "Difficult to teach"] as const;

function assessmentMessage(status?: string) {
  if (status === "supabase") {
    return "Reflection saved.";
  }

  if (status === "local_preview") {
    return "Reflection captured in local preview mode.";
  }

  if (status === "error") {
    return "Reflection could not be saved. Check the form and try again.";
  }

  return null;
}

function resourceTypeLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function accessTypeLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function firstText(...values: Array<string | null | undefined>) {
  return values.map((value) => value?.trim()).find(Boolean) ?? null;
}

function cleanTeacherText(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return value
    .replace(/\s*[\u2013\u2014]\s*/g, ": ")
    .replace(/\s*&\s*/g, " and ")
    .replace(/^(HOOK)\s*:\s*/i, "Hook: ")
    .replace(/^(MAIN)\s*:\s*/i, "Main Activity: ")
    .replace(/^(CLOSURE)\s*:\s*/i, "Closure: ")
    .replace(/^(READ-ALOUD)\s*:\s*/i, "Read-aloud: ")
    .replace(/^(READ ALOUD)\s*:\s*/i, "Read-aloud: ")
    .replace(/^(BOARD STEM)\s*:\s*/i, "Board stem: ")
    .replace(/^(REFLECT)\s*:\s*/i, "Reflect: ")
    .replace(/:\s*([a-z])/g, (_, letter: string) => `: ${letter.toUpperCase()}`)
    .replace(/\s{2,}/g, " ")
    .trim();
}

function cleanTeacherItems(items: string[]) {
  return items.map(cleanTeacherText).filter(Boolean);
}

function parseTeacherReflection(notes: string | null | undefined) {
  const reflection = {
    overallLessonFit: "Good",
    whatWorkedWell: "",
    whatConfusedStudents: "",
    whatToRevisit: "",
    assetOrActivityIssue: "",
    lessonImprovementNotes: ""
  };

  if (!notes) {
    return reflection;
  }

  const fieldMap: Record<string, keyof typeof reflection> = {
    "overall lesson fit": "overallLessonFit",
    "what worked well": "whatWorkedWell",
    "what confused students": "whatConfusedStudents",
    "what should be revisited next lesson": "whatToRevisit",
    "activity, printable, or board task issue": "assetOrActivityIssue",
    "any asset or activity issue": "assetOrActivityIssue",
    "notes or suggestions to improve this lesson": "lessonImprovementNotes",
    "notes for the next lesson": "lessonImprovementNotes"
  };

  let foundStructuredField = false;

  notes.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^([^:]+):\s*(.*)$/);

    if (!match) {
      return;
    }

    const key = fieldMap[match[1].trim().toLowerCase()];
    if (!key) {
      return;
    }

    foundStructuredField = true;
    reflection[key] = cleanTeacherText(match[2]);
  });

  if (!foundStructuredField) {
    reflection.lessonImprovementNotes = cleanTeacherText(notes);
  }

  if (!lessonFitOptions.includes(reflection.overallLessonFit as (typeof lessonFitOptions)[number])) {
    reflection.overallLessonFit = "Good";
  }

  return reflection;
}

function sectionHasType(section: LessonSection, sectionTypes: string[]) {
  return sectionTypes.includes(section.sectionType);
}

function searchableText(...values: unknown[]) {
  return values
    .map((value) => {
      if (typeof value === "string") {
        return value;
      }

      if (value === null || value === undefined) {
        return "";
      }

      return JSON.stringify(value);
    })
    .join(" ")
    .toLowerCase();
}

function isPatternDetectivesLesson(lesson: Awaited<ReturnType<typeof getLessonForClass>>) {
  const text = searchableText(lesson?.title, lesson?.summary, lesson?.studentChallenge, lesson?.studentOutput);
  return text.includes("pattern detective") || text.includes("pattern hunt");
}

function isLegacyAiDemoText(text: string) {
  return [
    "what is ai",
    "ai helper",
    "ai helpers",
    "people helpers",
    "ordinary tools",
    "picture sort",
    "translation app",
    "voice helper",
    "named a familiar ai",
    "name one ai",
    "naming an ai",
    "computer helper made by people"
  ].some((keyword) => text.includes(keyword));
}

function isCurrentLessonContent(
  lesson: Awaited<ReturnType<typeof getLessonForClass>>,
  item: LessonSection | LessonActivity | LessonResource | AssessmentTemplate
) {
  if (!isPatternDetectivesLesson(lesson)) {
    return true;
  }

  if ("activityType" in item && item.title.toLowerCase().includes("pattern or not")) {
    return true;
  }

  return !isLegacyAiDemoText(searchableText(item));
}

function activityPrompt(activity: LessonActivity) {
  if (isRecord(activity.activityJson) && typeof activity.activityJson.prompt === "string") {
    return cleanTeacherText(activity.activityJson.prompt);
  }

  return cleanTeacherText(activity.instructions);
}

function assessmentLookFors(sections: LessonSection[], templates: AssessmentTemplate[]) {
  const lookFors = cleanTeacherItems(sections.flatMap((section) => (isRecord(section.contentJson) ? stringArray(section.contentJson.look_for) : [])));

  if (lookFors.length > 0) {
    return lookFors;
  }

  return templates.flatMap((template) => {
    if (!isRecord(template.criteriaJson) || !Array.isArray(template.criteriaJson.criteria)) {
      return [];
    }

    return template.criteriaJson.criteria.reduce<string[]>((items, criterion, index) => {
      if (isRecord(criterion)) {
        items.push(typeof criterion.label === "string" ? cleanTeacherText(criterion.label) : `Look-for ${index + 1}`);
      }

      return items;
    }, []);
  });
}

function criteriaFromLesson(value: unknown) {
  if (!isRecord(value)) {
    return [];
  }

  return cleanTeacherItems(stringArray(value.criteria));
}

function mainActivityLabel(lesson: Awaited<ReturnType<typeof getLessonForClass>>, activities: LessonActivity[]) {
  const lessonText = searchableText(lesson?.title, lesson?.studentChallenge, lesson?.studentOutput);

  if (lessonText.includes("pattern hunt")) {
    return "Pattern Hunt";
  }

  return cleanTeacherText(firstText(lesson?.studentOutput, lesson?.studentChallenge, activities.find((activity) => !activity.isSmartboardReady)?.title)) ?? "Main activity will appear here when added.";
}

function toolUseLabel(lesson: Awaited<ReturnType<typeof getLessonForClass>>, hasBoardExtension: boolean) {
  const rawStatus = lesson?.toolUseStatus;

  if ((rawStatus === "no_tool" || rawStatus === "unplugged") && hasBoardExtension) {
    return "Unplugged, optional teacher-led board extension available.";
  }

  if (hasBoardExtension) {
    return `${rawStatus ? resourceTypeLabel(rawStatus) : "Teacher-led"}, optional board extension available.`;
  }

  return rawStatus ? resourceTypeLabel(rawStatus) : "Teacher-led.";
}

function lessonPromise(lesson: Awaited<ReturnType<typeof getLessonForClass>>) {
  if (isPatternDetectivesLesson(lesson)) {
    return "Students find repeating patterns in the classroom and explain what repeats.";
  }

  return cleanTeacherText(firstText(lesson?.summary, lesson?.learningObjectives)) || "Students explore the lesson idea through a teacher-led classroom activity.";
}

function unitLabel(lesson: Awaited<ReturnType<typeof getLessonForClass>>) {
  const unitMatch = lesson?.lessonCode?.match(/-U(\d+)-/);
  const unit = unitMatch ? `Unit ${unitMatch[1]}` : "Unit";
  const grade = lesson?.gradeLevel ? `Grade ${lesson.gradeLevel}` : "Grade";
  return `${grade} / ${unit}`;
}

function revisitGuidance(sections: LessonSection[]) {
  for (const section of sections) {
    if (isRecord(section.contentJson) && typeof section.contentJson.not_yet_ok === "string") {
      return cleanTeacherText(section.contentJson.not_yet_ok);
    }
  }

  return null;
}

function SectionList({ emptyMessage, sections }: { emptyMessage?: string; sections: LessonSection[] }) {
  if (sections.length === 0) {
    return emptyMessage ? <EmptyState>{emptyMessage}</EmptyState> : null;
  }

  return (
    <div className="grid gap-3">
      {sections.map((section) => (
        <LessonSectionCard key={section.id} section={section} />
      ))}
    </div>
  );
}

function CompactResourceList({ resources }: { resources: LessonResource[] }) {
  if (resources.length === 0) {
    return <EmptyState>No printables or teacher resources have been attached yet.</EmptyState>;
  }

  return (
    <div className="overflow-hidden rounded-md border border-[#dde3dc] bg-white">
      <div className="grid grid-cols-[minmax(0,1fr)_7rem_9rem_8rem] gap-3 border-b border-[#eef2ee] bg-[#fbfcfa] px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#66746d]">
        <span>Resource</span>
        <span>Use</span>
        <span>Status</span>
        <span>Action</span>
      </div>
      <div className="divide-y divide-[#eef2ee]">
        {resources.map((resource) => {
          const isPrintable = resource.isPrintable || resource.accessType === "printable";
          const hasUploadedFile = Boolean(resource.fileUrl || resource.storagePath);
          return (
            <div className="grid grid-cols-[minmax(0,1fr)_7rem_9rem_8rem] gap-3 px-3 py-3 text-sm text-[#42514a]" key={resource.id}>
              <div>
                <p className="font-semibold text-[#17211c]">{cleanTeacherText(resource.title)}</p>
                {resource.description ? <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#66746d]">{cleanTeacherText(resource.description)}</p> : null}
              </div>
              <div className="text-xs font-semibold text-[#66746d]">{isPrintable ? "Printable" : resourceTypeLabel(resource.resourceType)}</div>
              <div className="text-xs font-semibold text-[#66746d]">
                {isPrintable && !hasUploadedFile ? "File not uploaded yet" : resource.isDownloadable ? "Downloadable" : "Ready"}
              </div>
              <div className="text-xs font-semibold text-[#66746d]">
                {resource.fileUrl && resource.isDownloadable ? "Open file" : hasUploadedFile ? "Ready" : "No file"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TeacherContentDetails({ value }: { value: unknown }) {
  if (!isRecord(value) || Object.keys(value).length === 0) {
    return null;
  }

  const teacherNote = typeof value.teacher_note === "string" ? value.teacher_note : null;
  const sentenceFrame = typeof value.sentence_frame === "string" ? value.sentence_frame : null;
  const notYetOk = typeof value.not_yet_ok === "string" ? value.not_yet_ok : null;
  const steps = stringArray(value.steps);
  const lookFor = stringArray(value.look_for);
  const prompts = stringArray(value.prompts);
  const watchFor = stringArray(value.watch_for);
  const teacherMoves = stringArray(value.teacher_moves);

  return (
    <div className="mt-3 space-y-3 rounded-md bg-white p-3 text-sm leading-6 text-[#42514a]">
      {teacherNote ? (
        <p>
          <span className="font-semibold text-[#17211c]">Teacher note:</span> {cleanTeacherText(teacherNote)}
        </p>
      ) : null}
      {sentenceFrame ? (
        <p>
          <span className="font-semibold text-[#17211c]">Sentence frame:</span> {cleanTeacherText(sentenceFrame)}
        </p>
      ) : null}
      {steps.length > 0 ? (
        <ol className="list-decimal space-y-1 pl-5">
          {steps.map((step) => (
            <li key={step}>{cleanTeacherText(step)}</li>
          ))}
        </ol>
      ) : null}
      {lookFor.length > 0 ? (
        <ul className="list-disc space-y-1 pl-5">
          {lookFor.map((item) => (
            <li key={item}>{cleanTeacherText(item)}</li>
          ))}
        </ul>
      ) : null}
      {prompts.length > 0 ? (
        <div>
          <p className="font-semibold text-[#17211c]">Ask:</p>
          <ul className="list-disc space-y-1 pl-5">
            {prompts.map((item) => (
              <li key={item}>{cleanTeacherText(item)}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {watchFor.length > 0 || teacherMoves.length > 0 || notYetOk ? (
        <div>
          <p className="font-semibold text-[#17211c]">Teacher support:</p>
          <ul className="list-disc space-y-1 pl-5">
            {[...watchFor, ...teacherMoves, notYetOk].filter((item): item is string => Boolean(item)).map((item) => (
              <li key={item}>{cleanTeacherText(item)}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function ActivityDetails({ activityType, value }: { activityType: string; value: unknown }) {
  if (!isRecord(value) || Object.keys(value).length === 0) {
    return null;
  }

  const prompt = typeof value.prompt === "string" ? value.prompt : null;
  const rawTargetCategory = value.target_category ?? value.targetCategory;
  const targetCategory = typeof rawTargetCategory === "string" ? rawTargetCategory : null;
  const categories = stringArray(value.categories);
  const sampleResponses = stringArray(value.sampleResponses);
  const scenarioStrings = stringArray(value.scenarios);
  const scenarioObjects = Array.isArray(value.scenarios) ? value.scenarios.filter(isRecord) : [];
  const cards = Array.isArray(value.cards) ? value.cards.filter(isRecord) : [];
  const patterns = Array.isArray(value.patterns) ? value.patterns.filter(isRecord) : [];
  const rounds = Array.isArray(value.rounds) ? value.rounds.filter(isRecord) : [];
  const accessibilityNotes = isRecord(value.accessibility)
    ? Object.entries(value.accessibility)
        .flatMap(([key, entry]) => {
          const label = resourceTypeLabel(key);
          if (typeof entry === "string" && entry.trim()) {
            return [`${label}: ${entry}`];
          }
          if (Array.isArray(entry)) {
            const values = entry.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
            return values.length > 0 ? [`${label}: ${values.join(", ")}`] : [];
          }
          return entry === true ? [label] : [];
        })
    : [];

  return (
    <div className="mt-3 space-y-3 rounded-md bg-white p-3 text-sm leading-6 text-[#42514a]">
      {prompt ? (
        <p>
          <span className="font-semibold text-[#17211c]">Prompt:</span> {cleanTeacherText(prompt)}
        </p>
      ) : null}
      {categories.length > 0 ? (
        <div>
          <p className="font-semibold text-[#17211c]">Categories</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {categories.map((category) => (
              <span className="rounded-md border border-[#cad6cf] bg-[#fbfcfa] px-2 py-1 text-xs font-semibold text-[#42514a]" key={category}>
                {cleanTeacherText(category)}
              </span>
            ))}
          </div>
        </div>
      ) : null}
      {targetCategory ? (
        <p>
          <span className="font-semibold text-[#17211c]">Focus:</span> Sort examples and non-examples of {cleanTeacherText(targetCategory)}.
        </p>
      ) : null}
      {cards.length > 0 ? (
        <div>
          <p className="font-semibold text-[#17211c]">{activityType === "sorting_cards" ? "Sorting cards" : "Cards"}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {cards.map((card, index) => {
              const label = typeof card.label === "string" ? card.label : `Card ${index + 1}`;
              const correctCategory = typeof card.correctCategory === "string" ? card.correctCategory : null;
              const confidence = typeof card.confidence === "string" ? card.confidence : null;
              return (
                <li key={`${label}-${index}`}>
                  {correctCategory ? `${cleanTeacherText(label)} to ${cleanTeacherText(correctCategory)}` : cleanTeacherText(label)}
                  {confidence ? ` | Confidence: ${cleanTeacherText(confidence)}` : ""}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
      {patterns.length > 0 ? (
        <div>
          <p className="font-semibold text-[#17211c]">Patterns</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {patterns.map((pattern, index) => {
              const items = Array.isArray(pattern.items) ? pattern.items.map(String).join(", ") : `Pattern ${index + 1}`;
              const answer = typeof pattern.answer === "string" ? pattern.answer : null;
              return <li key={`${items}-${index}`}>{answer ? `${cleanTeacherText(items)} to ${cleanTeacherText(answer)}` : cleanTeacherText(items)}</li>;
            })}
          </ul>
        </div>
      ) : null}
      {rounds.length > 0 ? (
        <div>
          <p className="font-semibold text-[#17211c]">Pattern rounds</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {rounds.map((round, index) => {
              const sequence = stringArray(round.sequence).join(", ");
              const options = stringArray(round.options).join(", ");
              const next = typeof round.next === "string" ? round.next : null;
              return (
                <li key={`${sequence}-${index}`}>
                  {cleanTeacherText(sequence || `Round ${index + 1}`)}
                  {next ? ` to ${cleanTeacherText(next)}` : ""}
                  {options ? ` | Choices: ${cleanTeacherText(options)}` : ""}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
      {scenarioObjects.length > 0 ? (
        <div>
          <p className="font-semibold text-[#17211c]">Scenario reveal rounds</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {scenarioObjects.map((scenario, index) => {
              const scenarioText = typeof scenario.scenario === "string" ? scenario.scenario : `Round ${index + 1}`;
              const reveal = typeof scenario.reveal === "string" ? scenario.reveal : null;
              return <li key={`${scenarioText}-${index}`}>{reveal ? `${cleanTeacherText(scenarioText)} to ${cleanTeacherText(reveal)}` : cleanTeacherText(scenarioText)}</li>;
            })}
          </ul>
        </div>
      ) : null}
      {scenarioStrings.length > 0 ? (
        <div>
          <p className="font-semibold text-[#17211c]">Scenario cards</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {scenarioStrings.map((scenario) => (
              <li key={scenario}>{cleanTeacherText(scenario)}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {accessibilityNotes.length > 0 ? (
        <p>
          <span className="font-semibold text-[#17211c]">Teacher support:</span> {accessibilityNotes.map(cleanTeacherText).join(" ")}
        </p>
      ) : null}
      {sampleResponses.length > 0 ? (
        <div>
          <p className="font-semibold text-[#17211c]">Sample responses</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {sampleResponses.map((response) => (
              <li key={response}>{cleanTeacherText(response)}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function AssessmentCriteria({ value }: { value: unknown }) {
  if (!isRecord(value) || !Array.isArray(value.criteria)) {
    return null;
  }

  const criteria = value.criteria.filter(isRecord);

  if (criteria.length === 0) {
    return null;
  }

  return (
    <ul className="mt-3 list-disc space-y-1 rounded-md bg-white p-3 pl-7 text-sm leading-6 text-[#42514a]">
      {criteria.map((criterion, index) => {
        const label = typeof criterion.label === "string" ? cleanTeacherText(criterion.label) : `Criterion ${index + 1}`;
        return <li key={`${label}-${index}`}>{label}</li>;
      })}
    </ul>
  );
}

function AccessBadge({ value }: { value: string }) {
  if (value === "platform_only" || value === "teacher_only") {
    return null;
  }

  return (
    <span className="rounded-md border border-[#cad6cf] bg-white px-2 py-1 text-xs font-semibold text-[#42514a]">
      {accessTypeLabel(value)}
    </span>
  );
}

function EmptyState({ children }: { children: string }) {
  return <p className="rounded-md border border-dashed border-[#cad6cf] bg-[#fbfcfa] p-4 text-sm leading-6 text-[#66746d]">{children}</p>;
}

function LessonSectionCard({ section }: { section: LessonSection }) {
  const hasStructuredSteps = isRecord(section.contentJson) && stringArray(section.contentJson.steps).length > 0;

  return (
    <article className="rounded-md border border-[#dde3dc] bg-[#fbfcfa] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-[#17211c]">{cleanTeacherText(section.title)}</h3>
          {section.estimatedMinutes ? <p className="mt-1 text-xs font-semibold text-[#66746d]">{section.estimatedMinutes} minutes</p> : null}
        </div>
        <AccessBadge value={section.accessType} />
      </div>
      {section.content && !hasStructuredSteps ? <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#42514a]">{cleanTeacherText(section.content)}</p> : null}
      <TeacherContentDetails value={section.contentJson} />
    </article>
  );
}

function BoardExtensionCard({ activity, classId, lessonId }: { activity: LessonActivity; classId: string; lessonId: string }) {
  const smartboardHref = `/teacher/smartboard/${activity.id}?classId=${encodeURIComponent(classId)}&lessonId=${encodeURIComponent(lessonId)}`;
  const prompt = activityPrompt(activity);

  return (
    <article className="rounded-md bg-[#f4faf7] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#116466]">Optional board extension</p>
          <h3 className="mt-1 text-[21px] font-semibold text-[#17211c]">{cleanTeacherText(activity.title)}</h3>
          <p className="mt-1 text-sm font-semibold text-[#66746d]">{resourceTypeLabel(activity.activityType)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {activity.isSmartboardReady ? (
            <span className="rounded-md border border-[#b9d8c8] bg-[#edf8f1] px-2 py-1 text-xs font-semibold text-[#0b4d4f]">Smartboard Activity</span>
          ) : null}
        </div>
      </div>
      <p className="mt-3 text-base leading-7 text-[#42514a]">
        This is optional teacher-led board support. The lesson can still be taught unplugged without opening the activity.
      </p>
      {prompt ? (
        <p className="mt-3 rounded-md bg-white/80 p-4 text-base leading-7 text-[#42514a]">
          <span className="font-semibold text-[#17211c]">Teacher prompt:</span> {cleanTeacherText(prompt)}
        </p>
      ) : null}
      {activity.isSmartboardReady ? (
        <div className="mt-4">
          <Button href={smartboardHref} icon={<MonitorUp aria-hidden="true" className="h-4 w-4" />}>
            Open Board Activity
          </Button>
        </div>
      ) : null}
    </article>
  );
}

function ResourceCard({ resource }: { resource: LessonResource }) {
  const shouldShowPrintableBadge = resource.isPrintable || resource.accessType === "printable";
  const hasUploadedFile = Boolean(resource.fileUrl || resource.storagePath);

  return (
    <article className="rounded-md border border-[#dde3dc] bg-[#fbfcfa] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#116466]">{resourceTypeLabel(resource.resourceType)}</p>
          <h3 className="mt-1 text-base font-semibold text-[#17211c]">{cleanTeacherText(resource.title)}</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {resource.accessType !== "printable" ? <AccessBadge value={resource.accessType} /> : null}
          {shouldShowPrintableBadge ? <span className="rounded-md border border-[#d7c49a] bg-[#fff8e8] px-2 py-1 text-xs font-semibold text-[#6d4c11]">Printable</span> : null}
          {resource.isDownloadable ? <span className="rounded-md border border-[#cad6cf] bg-white px-2 py-1 text-xs font-semibold text-[#42514a]">Downloadable</span> : null}
        </div>
      </div>
      {resource.description ? <p className="mt-3 text-sm leading-6 text-[#66746d]">{cleanTeacherText(resource.description)}</p> : null}
      {resource.content ? <p className="mt-3 rounded-md bg-white p-3 text-sm leading-6 text-[#42514a]">{cleanTeacherText(resource.content)}</p> : null}
      {resource.fileUrl && resource.isDownloadable ? <p className="mt-3 text-sm font-semibold text-[#0b4d4f]">{resource.fileUrl}</p> : null}
      {shouldShowPrintableBadge ? (
        <div className="mt-3 space-y-1 text-xs font-semibold text-[#66746d]">
          <p>
            {resource.estimatedPages ? `${resource.estimatedPages} page${resource.estimatedPages === 1 ? "" : "s"} ` : ""}
            {resource.estimatedPages ? <span aria-hidden="true">&middot; </span> : null}
            Classroom material
          </p>
          {!hasUploadedFile ? <p className="text-[#8a6b20]">Printable file not uploaded yet.</p> : null}
        </div>
      ) : null}
    </article>
  );
}

function AssessmentTemplateCard({ template }: { template: AssessmentTemplate }) {
  return (
    <article className="rounded-md border border-[#dde3dc] bg-[#fbfcfa] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#116466]">Class checklist</p>
          <h3 className="mt-1 text-base font-semibold text-[#17211c]">{cleanTeacherText(template.title)}</h3>
        </div>
        <AccessBadge value={template.accessType} />
      </div>
      {template.description ? <p className="mt-3 text-sm leading-6 text-[#66746d]">{cleanTeacherText(template.description)}</p> : null}
      <AssessmentCriteria value={template.criteriaJson} />
    </article>
  );
}

function GuideSection({
  children,
  defaultOpen = false,
  description,
  title
}: {
  children: ReactNode;
  defaultOpen?: boolean;
  description?: string;
  title: string;
}) {
  return (
    <details className="group rounded-md border border-[#dde3dc] bg-white p-0 shadow-sm" open={defaultOpen}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-md px-5 py-4 text-left">
        <div>
          <h2 className="text-lg font-semibold text-[#17211c]">{title}</h2>
          {description ? <p className="mt-1 text-sm leading-6 text-[#66746d]">{description}</p> : null}
        </div>
        <span className="shrink-0 rounded-md border border-[#cad6cf] px-2 py-1 text-xs font-semibold text-[#42514a] group-open:hidden">Open</span>
        <span className="hidden shrink-0 rounded-md border border-[#cad6cf] px-2 py-1 text-xs font-semibold text-[#42514a] group-open:inline">Close</span>
      </summary>
      <div className="border-t border-[#eef2ee] p-5">{children}</div>
    </details>
  );
}

function TodaysLessonCard({
  assessmentLookForItems,
  classId,
  lesson,
  lessonId,
  mainActivity,
  printableResources,
  smartboardActivity,
  toolUse
}: {
  assessmentLookForItems: string[];
  classId: string;
  lesson: Awaited<ReturnType<typeof getLessonForClass>>;
  lessonId: string;
  mainActivity: string;
  printableResources: LessonResource[];
  smartboardActivity?: LessonActivity;
  toolUse: string;
}) {
  const smartboardHref = smartboardActivity
    ? `/teacher/smartboard/${smartboardActivity.id}?classId=${encodeURIComponent(classId)}&lessonId=${encodeURIComponent(lessonId)}`
    : null;
  const successCriteria = criteriaFromLesson(lesson?.successCriteriaJson);
  const materials = [
    lesson?.materialsNeeded,
    ...printableResources.slice(0, 3).map((resource) => resource.title)
  ].filter((item): item is string => Boolean(item));

  return (
    <section className="rounded-md border border-[#dde3dc] bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#116466]">{lesson?.displayCode ?? lesson?.lessonCode ?? "today"}</p>
          <h2 className="mt-1 text-xl font-semibold text-[#17211c]">{lesson?.title ?? "Today's Lesson"}</h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-[#42514a]">{lesson?.summary ?? lesson?.learningObjectives ?? "Lesson goal will appear here when added."}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button href="#teach-the-lesson">Teach Lesson</Button>
          {smartboardHref ? (
            <Button href={smartboardHref} icon={<MonitorUp aria-hidden="true" className="h-4 w-4" />} variant="secondary">
              Board Extension
            </Button>
          ) : null}
          <Button href="#before-class" variant="secondary">Printables</Button>
          <Button href="#class-reflection" variant="secondary">Class Reflection</Button>
        </div>
      </div>
      <div className="mt-4 grid gap-3 text-sm leading-6 text-[#42514a] md:grid-cols-2 xl:grid-cols-4">
        <p><span className="font-semibold text-[#17211c]">I can:</span> {lesson?.iCanStatement ?? "Not added yet."}</p>
        <p><span className="font-semibold text-[#17211c]">Challenge:</span> {lesson?.studentChallenge ?? "Not added yet."}</p>
        <p><span className="font-semibold text-[#17211c]">Main activity:</span> {mainActivity}</p>
        <p><span className="font-semibold text-[#17211c]">Tool use:</span> {toolUse}</p>
      </div>
      {assessmentLookForItems.length > 0 || successCriteria.length > 0 || materials.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs leading-5 text-[#66746d]">
          {assessmentLookForItems.length > 0 || successCriteria.length > 0 ? (
            <p><span className="font-semibold text-[#42514a]">Look for:</span> {[...assessmentLookForItems, ...successCriteria].slice(0, 2).join("; ")}</p>
          ) : null}
          {materials.length > 0 ? <p><span className="font-semibold text-[#42514a]">Materials:</span> {materials.slice(0, 2).join("; ")}</p> : null}
        </div>
      ) : null}
    </section>
  );
}

function TeacherSupportCallout({ children, title = "Teacher Support" }: { children: ReactNode; title?: string }) {
  return (
    <div className="rounded-md border border-[#d8dfd8] bg-[#fbfcfa] p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#116466]">{title}</p>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}

function parseTeachingLine(line: string) {
  const text = cleanTeacherText(line);
  const match = text.match(/^(Hook|Main Activity|Main|Closure|Read-aloud|Read aloud|Board stem|Reflect|Ask)\s*:\s*(.+)$/i);

  if (!match) {
    return { label: "Teacher does", text };
  }

  const rawLabel = match[1].toLowerCase();
  const label =
    rawLabel === "main" || rawLabel === "main activity"
      ? "Main Activity"
      : rawLabel === "read-aloud" || rawLabel === "read aloud"
        ? "Teacher says"
        : rawLabel === "board stem"
          ? "Board stem"
          : rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);

  return { label, text: match[2] };
}

function TeachingFlowLines({ lines }: { lines: string[] }) {
  const parsedLines = lines.map(parseTeachingLine).filter((line) => line.text);

  if (parsedLines.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 space-y-4">
      {parsedLines.map((line, index) => {
        const isScript = line.label === "Teacher says" || line.label === "Board stem";

        return (
          <div className={isScript ? "rounded-md bg-[#f4faf7] p-4" : ""} key={`${line.label}-${line.text}-${index}`}>
            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#116466]">{line.label}</p>
            <p className={`${isScript ? "mt-2 text-[17px] leading-8 text-[#23332b]" : "mt-1 text-base leading-7 text-[#42514a]"}`}>
              {isScript ? `"${line.text}"` : line.text}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function splitTeachingFlowText(value: string | null | undefined) {
  if (!value) {
    return [];
  }

  const normalized = value
    .replace(/\r/g, "")
    .replace(/(?:^|\n)\s*\d+[\.)]\s*/g, "\n")
    .replace(/\s+(HOOK|MAIN|CLOSURE|READ-ALOUD|READ ALOUD|BOARD STEM|REFLECT|ASK)\s*[\u2013\u2014:]/gi, "\n$1:");

  return normalized
    .split(/\n+/)
    .map(cleanTeacherText)
    .filter(Boolean);
}

function PracticalTeachingBlock({ section }: { section: LessonSection }) {
  const contentJson = isRecord(section.contentJson) ? section.contentJson : {};
  const steps = cleanTeacherItems(stringArray(contentJson.steps));
  const lookFor = cleanTeacherItems([...stringArray(contentJson.look_for), ...stringArray(contentJson.listen_for)]);
  const supportItems = [
    typeof contentJson.teacher_note === "string" ? contentJson.teacher_note : null,
    typeof contentJson.not_yet_ok === "string" ? contentJson.not_yet_ok : null,
    ...stringArray(contentJson.watch_for),
    ...stringArray(contentJson.teacher_moves)
  ].filter((item): item is string => Boolean(item)).map(cleanTeacherText);
  const sentenceFrame = typeof contentJson.sentence_frame === "string" ? contentJson.sentence_frame : null;
  const teacherSays = cleanTeacherText(firstText(typeof contentJson.teacher_says === "string" ? contentJson.teacher_says : null, sentenceFrame));
  const teacherDoes = cleanTeacherText(firstText(typeof contentJson.teacher_does === "string" ? contentJson.teacher_does : null));
  const studentsDo = cleanTeacherText(firstText(typeof contentJson.students_do === "string" ? contentJson.students_do : null));
  const askItems = cleanTeacherItems([...stringArray(contentJson.prompts), ...stringArray(contentJson.ask)]);
  const extendItems = cleanTeacherItems(stringArray(contentJson.extend));
  const askContent = sectionHasType(section, ["hook_opening", "discussion_prompt"]) ? cleanTeacherText(section.content) : null;
  const doesContent = sectionHasType(section, ["lesson_flow", "guided_activity", "worked_example", "reflection", "closure"]) ? cleanTeacherText(section.content) : null;
  const flowContentLines = splitTeachingFlowText(doesContent);
  const shouldRenderFlowLines = steps.length > 0 || flowContentLines.some((line) => /^(Hook|Main Activity|Main|Closure|Read-aloud|Read aloud|Board stem|Reflect|Ask)\s*:/i.test(line));
  const teacherSaysDisplay = teacherSays.replace(/^Read-aloud:\s*/i, "");

  return (
    <article className="bg-white">
      <h4 className="text-[17px] font-semibold text-[#17211c]">{cleanTeacherText(section.title)}</h4>
      <div className="mt-4 space-y-4">
        {teacherSays ? (
          <div className="rounded-md bg-[#f4faf7] p-4">
            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#116466]">Teacher says</p>
            <p className="mt-2 text-[17px] leading-8 text-[#23332b]">&ldquo;{teacherSaysDisplay}&rdquo;</p>
          </div>
        ) : null}
        {teacherDoes || doesContent || steps.length > 0 ? (
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#116466]">Teacher does</p>
            {teacherDoes ? (
              <p className="mt-1 whitespace-pre-line text-base leading-7 text-[#42514a]">{teacherDoes}</p>
            ) : shouldRenderFlowLines ? (
              <TeachingFlowLines lines={steps.length > 0 ? steps : flowContentLines} />
            ) : (
              <p className="mt-1 whitespace-pre-line text-base leading-7 text-[#42514a]">{doesContent}</p>
            )}
          </div>
        ) : null}
        {studentsDo ? (
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#116466]">Students do</p>
            <p className="mt-1 whitespace-pre-line text-base leading-7 text-[#42514a]">{studentsDo}</p>
          </div>
        ) : null}
        {askContent || askItems.length > 0 ? (
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#116466]">Ask</p>
            {askItems.length > 0 ? (
              <ul className="mt-2 list-disc space-y-2 pl-5 text-base leading-7 text-[#42514a]">
                {askItems.map((item) => (
                  <li key={item}>{cleanTeacherText(item)}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 whitespace-pre-line text-base leading-7 text-[#42514a]">{askContent}</p>
            )}
          </div>
        ) : null}
        {lookFor.length > 0 ? (
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#116466]">Listen for</p>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-base leading-7 text-[#42514a]">
              {lookFor.map((item) => (
                <li key={item}>{cleanTeacherText(item)}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {section.content && !studentsDo && !askContent && !doesContent && steps.length === 0 ? (
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#116466]">Students do</p>
            <p className="mt-1 whitespace-pre-line text-base leading-7 text-[#42514a]">{cleanTeacherText(section.content)}</p>
          </div>
        ) : null}
        {supportItems.length > 0 ? (
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#116466]">Support</p>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-base leading-7 text-[#42514a]">
              {supportItems.map((item) => (
                <li key={item}>{cleanTeacherText(item)}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {extendItems.length > 0 ? (
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#116466]">Extend</p>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-base leading-7 text-[#42514a]">
              {extendItems.map((item) => (
                <li key={item}>{cleanTeacherText(item)}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function supportLine(section: LessonSection) {
  if (isRecord(section.contentJson)) {
    return firstText(
      stringArray(section.contentJson.teacher_moves)[0],
      stringArray(section.contentJson.watch_for)[0],
      typeof section.contentJson.teacher_note === "string" ? section.contentJson.teacher_note : null,
      typeof section.contentJson.language_integration === "string" ? section.contentJson.language_integration : null
    );
  }

  return section.content;
}

function InlineSupportNotes({
  differentiationSections,
  expectedResponseSections,
  localizationSections
}: {
  differentiationSections: LessonSection[];
  expectedResponseSections: LessonSection[];
  localizationSections: LessonSection[];
}) {
  const notes = [
    ...expectedResponseSections.slice(0, 1).map((section) => ({ title: "Common mistake", text: supportLine(section) })),
    ...differentiationSections.slice(0, 1).map((section) => ({ title: "Accessibility note", text: supportLine(section) })),
    ...localizationSections.slice(0, 2).map((section) => ({
      title: section.sectionType === "language_integration" ? "Language note" : "Local connection",
      text: supportLine(section)
    }))
  ].filter((note): note is { title: string; text: string } => Boolean(note.text));

  if (notes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 rounded-md border border-[#d8dfd8] bg-[#fbfcfa] p-4">
      {notes.map((note) => (
        <p className="text-sm leading-6 text-[#42514a]" key={`${note.title}-${note.text}`}>
          <span className="font-semibold text-[#17211c]">{note.title}:</span> {note.text}
        </p>
      ))}
    </div>
  );
}

function TeachingPath({
  differentiationSections,
  expectedResponseSections,
  localizationSections,
  sections
}: {
  differentiationSections: LessonSection[];
  expectedResponseSections: LessonSection[];
  localizationSections: LessonSection[];
  sections: LessonSection[];
}) {
  if (sections.length === 0) {
    return <EmptyState>No teaching sequence has been added yet.</EmptyState>;
  }

  const opening = sections.filter((section) => sectionHasType(section, ["hook_opening"]));
  const closure = sections.filter((section) => sectionHasType(section, ["reflection", "closure"]));
  const mainActivity = sections.filter((section) => !opening.includes(section) && !closure.includes(section));

  const groups = [
    { title: "Open", sections: opening },
    { title: "Explore", sections: mainActivity },
    { title: "Share", sections: closure }
  ].filter((group) => group.sections.length > 0);

  return (
    <div className="relative space-y-8">
      {groups.map((group, index) => (
        <section className="relative pl-14" key={group.title}>
          {index < groups.length - 1 ? <span className="absolute left-[18px] top-12 h-[calc(100%-1rem)] w-px bg-[#d8e2dc]" aria-hidden="true" /> : null}
          <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-[#116466] text-sm font-bold text-white shadow-sm">
            {index + 1}
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#116466]">Step {index + 1}</p>
              <h3 className="mt-1 text-[22px] font-semibold text-[#17211c]">{group.title}</h3>
            </div>
            {group.sections.map((section) => (
              <PracticalTeachingBlock key={section.id} section={section} />
            ))}
            {group.title === "Explore" ? (
              <InlineSupportNotes
                differentiationSections={differentiationSections}
                expectedResponseSections={expectedResponseSections}
                localizationSections={localizationSections}
              />
            ) : null}
          </div>
        </section>
      ))}
    </div>
  );
}

function TeacherMoment({
  children,
  defaultOpen = false,
  description,
  id,
  title
}: {
  children: ReactNode;
  defaultOpen?: boolean;
  description: string;
  id: string;
  title: string;
}) {
  const isTeach = title === "Teach";

  return (
    <details
      className={`group rounded-md border bg-white shadow-sm ${isTeach ? "border-[#b9d8c8] ring-1 ring-[#d9ebe3]" : "border-[#dde3dc]"}`}
      id={id}
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
        <div>
          <h2 className="text-2xl font-semibold text-[#17211c]">{title}</h2>
          <p className="mt-1 text-base leading-7 text-[#66746d]">{description}</p>
        </div>
        <span className="shrink-0 rounded-md border border-[#cad6cf] px-2 py-1 text-xs font-semibold text-[#42514a] group-open:hidden">Open</span>
        <span className="hidden shrink-0 rounded-md border border-[#cad6cf] px-2 py-1 text-xs font-semibold text-[#42514a] group-open:inline">Close</span>
      </summary>
      <div className="border-t border-[#eef2ee] px-5 py-6">{children}</div>
    </details>
  );
}

function ResponseGroup({
  legend,
  name,
  value
}: {
  legend: string;
  name: string;
  value: K6AssessmentInput["objectiveMet"];
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-[#17211c]">{legend}</p>
      <div className="mt-2 inline-flex flex-wrap gap-1 rounded-md bg-[#eef3ef] p-1">
        {responseOptions.map((option) => (
          <label className="relative" key={option.value}>
            <input className="peer sr-only" defaultChecked={option.value === value} name={name} type="radio" value={option.value} />
            <span className="flex min-h-9 min-w-20 cursor-pointer items-center justify-center rounded-md border border-transparent bg-transparent px-3 text-sm font-semibold text-[#42514a] transition peer-checked:border-[#9cc7ba] peer-checked:bg-white peer-checked:text-[#0b4d4f] peer-focus-visible:ring-2 peer-focus-visible:ring-[#c9dfd8]">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function LessonFitGroup({ value }: { value: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-[#17211c]">Overall lesson fit</p>
      <div className="mt-2 flex flex-wrap gap-1 rounded-md bg-[#eef3ef] p-1">
        {lessonFitOptions.map((option) => (
          <label className="relative" key={option}>
            <input className="peer sr-only" defaultChecked={value === option} name="overallLessonFit" type="radio" value={option} />
            <span className="flex min-h-9 cursor-pointer items-center justify-center rounded-md border border-transparent bg-transparent px-3 text-sm font-semibold text-[#42514a] transition peer-checked:border-[#9cc7ba] peer-checked:bg-white peer-checked:text-[#0b4d4f] peer-focus-visible:ring-2 peer-focus-visible:ring-[#c9dfd8]">
              {option}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function ReflectionTextArea({
  defaultValue,
  label,
  name,
  placeholder,
  tall = false
}: {
  defaultValue: string;
  label: string;
  name: string;
  placeholder: string;
  tall?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#17211c]">{label}</span>
      <textarea
        className={`mt-2 w-full rounded-md border border-[#d7e0da] bg-[#fbfcfa] px-3 py-2 text-sm leading-6 text-[#42514a] outline-none transition placeholder:text-[#8a9791] focus:border-[#116466] focus:bg-white focus:ring-2 focus:ring-[#c9dfd8] ${tall ? "min-h-28" : "min-h-16"}`}
        defaultValue={defaultValue}
        name={name}
        placeholder={placeholder}
      />
    </label>
  );
}

export default async function ClassLessonPage({ params, searchParams }: ClassLessonPageProps) {
  const { classId, lessonId } = await params;
  const { assessment, teacherProfileId } = await searchParams;
  const selectedTeacherProfileId = teacherProfileId?.trim() || PREVIEW_TEACHER_PROFILE_ID;
  const teacherQuery = `teacherProfileId=${encodeURIComponent(selectedTeacherProfileId)}`;
  const classResult = await getTeacherClassResult(classId);
  const classInfo = classResult.data;
  const lesson = classInfo ? await getLessonForClass(classInfo, lessonId) : null;
  const [sectionsResult, activitiesResult, resourcesResult, assessmentTemplatesResult] = await Promise.all([
    getLessonSectionsResult(lessonId),
    getLessonActivitiesResult(lessonId),
    getLessonResourcesResult(lessonId),
    getAssessmentTemplatesResult(lessonId)
  ]);
  const sections = sectionsResult.data.filter((section) => isCurrentLessonContent(lesson, section));
  const activities = activitiesResult.data.filter((activity) => isCurrentLessonContent(lesson, activity));
  const resources = resourcesResult.data.filter((resource) => isCurrentLessonContent(lesson, resource));
  const assessmentTemplates = assessmentTemplatesResult.data.filter((template) => isCurrentLessonContent(lesson, template));
  const filteredOutContentCount =
    sectionsResult.data.length + activitiesResult.data.length + resourcesResult.data.length + assessmentTemplatesResult.data.length -
    (sections.length + activities.length + resources.length + assessmentTemplates.length);
  const printableResources = resources.filter((resource) => resource.isPrintable || resource.accessType === "printable");
  const teacherResources = resources.filter((resource) => !resource.isPrintable && resource.accessType !== "downloadable");
  const downloadableResources = resources.filter((resource) => resource.isDownloadable || resource.accessType === "downloadable");
  const smartboardActivities = activities.filter((activity) => activity.isSmartboardReady);
  const beforeLessonSections = sections.filter((section) => sectionHasType(section, ["teacher_script", "teacher_prep", "materials", "resources", "tool_platform_setup"]));
  const safetySections = sections.filter((section) => sectionHasType(section, ["safety_policy_notes", "data_privacy_setup", "movement_play_notes", "academic_integrity_note", "ai_use_disclosure"]));
  const teachingFlowSections = sections.filter((section) =>
    sectionHasType(section, ["hook_opening", "lesson_flow", "guided_activity", "discussion_prompt", "worked_example", "reflection", "closure"])
  );
  const expectedResponseSections = sections.filter((section) => sectionHasType(section, ["misconceptions_pitfalls", "expected_responses"]));
  const assessmentGuidanceSections = sections.filter((section) => section.sectionType === "assessment_guidance");
  const differentiationSections = sections.filter((section) => sectionHasType(section, ["differentiation", "accessibility", "extension"]));
  const localizationSections = sections.filter((section) => sectionHasType(section, ["mena_contextualization", "language_integration"]));
  const familySections = sections.filter((section) => section.sectionType === "family_home_connection");
  const assessmentResult = await getK6ClassLessonAssessment(classId, lessonId);
  const existingAssessment = assessmentResult.data;
  const message = assessmentMessage(assessment);
  const isK6TeacherLed = classInfo?.gradeBand === "k_to_6" && classInfo.deliveryMode === "teacher_led";
  const firstSmartboardActivity = smartboardActivities[0];
  const lookForItems = assessmentLookFors(assessmentGuidanceSections, assessmentTemplates);
  const mainActivity = mainActivityLabel(lesson, activities);
  const currentToolUse = toolUseLabel(lesson, Boolean(firstSmartboardActivity));
  const revisitText = revisitGuidance(assessmentGuidanceSections);
  const objectiveMet = existingAssessment?.objectiveMet ?? "partly";
  const activityCompleted = existingAssessment?.activityCompleted ?? "partly";
  const studentsExplainedThinking = existingAssessment?.studentsExplainedThinking ?? "partly";
  const teacherReflection = parseTeacherReflection(existingAssessment?.teacherNotes);

  if (!classInfo) {
    return (
      <Layout>
        <DashboardCard description="Return to your class list and open an assigned K to Grade 6 class." title="Class unavailable" />
      </Layout>
    );
  }

  if (filteredOutContentCount > 0) {
    console.warn(
      `[CONNECTED MENA] Filtered ${filteredOutContentCount} legacy/demo curriculum item(s) from teacher display for ${lesson?.displayCode ?? lesson?.lessonCode ?? lessonId}.`
    );
  }

  return (
    <Layout>
      <div className="space-y-5" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <header className="rounded-md border border-[#dde3dc] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#116466]">{lesson?.displayCode ?? lesson?.lessonCode ?? "Lesson"}</p>
            <h1 className="mt-1 text-[34px] font-semibold leading-tight tracking-normal text-[#17211c]">{cleanTeacherText(lesson?.title) || "Lesson not found"}</h1>
            <p className="mt-2 max-w-3xl text-base leading-7 text-[#42514a]">{lessonPromise(lesson)}</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#66746d]">
              <span>{unitLabel(lesson)}</span>
              <span>{lesson?.durationMinutes ?? lesson?.estimatedMinutes ?? "Not set"} minutes</span>
              <span>{currentToolUse}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button href={`/teacher/classes/${classId}?${teacherQuery}`} icon={<ArrowLeft aria-hidden="true" className="h-4 w-4" />} variant="secondary">
              Back to Class
            </Button>
            <Button href={`/teacher/classes/${classId}/lessons/${lessonId}/guide?${teacherQuery}`} variant="secondary">
              View Teacher Guide PDF
            </Button>
            {firstSmartboardActivity ? (
              <Button href={`/teacher/smartboard/${firstSmartboardActivity.id}?classId=${encodeURIComponent(classId)}&lessonId=${encodeURIComponent(lessonId)}`} icon={<MonitorUp aria-hidden="true" className="h-4 w-4" />}>
                Board Extension
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      <nav className="sticky top-3 z-10 rounded-md border border-[#dde3dc] bg-white/95 p-2 shadow-sm backdrop-blur">
        <div className="flex flex-wrap gap-2 text-sm font-semibold">
          <a className="rounded-md bg-[#116466] px-4 py-2 text-white" href="#teach-the-lesson">Teach</a>
          <a className="rounded-md px-4 py-2 text-[#42514a] hover:bg-[#edf2ee] hover:text-[#17211c]" href="#before-class">Prepare</a>
          <a className="rounded-md px-4 py-2 text-[#42514a] hover:bg-[#edf2ee] hover:text-[#17211c]" href="#reflect">Reflect</a>
          <a className="rounded-md px-4 py-2 text-[#42514a] hover:bg-[#edf2ee] hover:text-[#17211c]" href={`/teacher/classes/${classId}/lessons/${lessonId}/guide?${teacherQuery}`}>Teacher Guide PDF</a>
        </div>
      </nav>

      {message ? (
        <div className="rounded-md border border-[#b9d8c8] bg-[#edf8f1] px-4 py-3 text-sm font-semibold text-[#0b4d4f]">{message}</div>
      ) : null}

      {sectionsResult.error || activitiesResult.error || resourcesResult.error || assessmentTemplatesResult.error ? (
        <DashboardCard
          description="Some lesson materials could not be loaded. You can still review the visible lesson content and use the class assessment form."
          title="Lesson materials partially unavailable"
        />
      ) : null}

      {!isK6TeacherLed ? (
        <DashboardCard
          description="This MVP 1 assessment form is intentionally limited to K to Grade 6 teacher-led classes and class-level assessment only."
          title="Teacher-led K to Grade 6 only"
        />
      ) : null}

      <section className="space-y-5">
        <TeacherMoment defaultOpen description="Follow this path during classroom delivery." id="teach-the-lesson" title="Teach">
          <div className="space-y-5">
            <TeachingPath
              differentiationSections={differentiationSections}
              expectedResponseSections={expectedResponseSections}
              localizationSections={localizationSections}
              sections={teachingFlowSections}
            />
            {firstSmartboardActivity ? (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-[#17211c]">Optional Board Extension</h3>
                <BoardExtensionCard activity={firstSmartboardActivity} classId={classId} lessonId={lessonId} />
              </div>
            ) : null}
          </div>
        </TeacherMoment>

        <TeacherMoment description="Print, set up, and prepare what you need before students begin." id="before-class" title="Prepare">
          <div className="space-y-5">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#116466]">Prepare</p>
                <p className="mt-2 text-sm leading-6 text-[#42514a]">{cleanTeacherText(lesson?.teacherPrepNotes ?? lesson?.materialsNeeded) || "No preparation notes have been added yet."}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#116466]">Materials</p>
                <p className="mt-2 text-sm leading-6 text-[#42514a]">{cleanTeacherText(lesson?.materialsNeeded) || "Materials will appear here when added."}</p>
              </div>
            </div>

            {beforeLessonSections.length > 0 ? <SectionList sections={beforeLessonSections} /> : null}
            {safetySections.length > 0 ? (
              <TeacherSupportCallout title="Safety and Setup">
                <SectionList sections={safetySections} />
              </TeacherSupportCallout>
            ) : null}
            {printableResources.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-[#17211c]">Printables and Resources</h3>
                <CompactResourceList resources={[...printableResources, ...teacherResources, ...downloadableResources]} />
              </div>
            ) : teacherResources.length > 0 || downloadableResources.length > 0 ? (
              <CompactResourceList resources={[...teacherResources, ...downloadableResources]} />
            ) : (
              <EmptyState>No printables or teacher resources have been attached yet.</EmptyState>
            )}
          </div>
        </TeacherMoment>

        <TeacherMoment description="Capture what the class understood and what should improve next time." id="reflect" title="Reflect on the Lesson">
          <form action={submitK6AssessmentAction} className="space-y-5" id="class-reflection">
            <input name="classId" type="hidden" value={classId} />
            <input name="lessonId" type="hidden" value={lessonId} />
            <input name="teacherId" type="hidden" value={selectedTeacherProfileId} />
            <input name="teacherProfileId" type="hidden" value={selectedTeacherProfileId} />

            <section className="rounded-md border border-[#dde3dc] bg-[#fbfcfa] p-5">
              <div>
                <h3 className="text-xl font-semibold text-[#17211c]">Quick Class Check</h3>
                <p className="mt-1 text-sm leading-6 text-[#66746d]">A two-minute whole-class check before you move on.</p>
              </div>

              {lookForItems.length > 0 || criteriaFromLesson(lesson?.successCriteriaJson).length > 0 ? (
                <div className="mt-4 rounded-md bg-white px-4 py-3">
                  <p className="text-sm font-semibold text-[#17211c]">Lesson look-fors</p>
                  <ul className="mt-2 grid gap-x-6 gap-y-1 text-sm leading-6 text-[#42514a] md:grid-cols-2">
                    {[...lookForItems, ...criteriaFromLesson(lesson?.successCriteriaJson)].slice(0, 5).map((item) => (
                      <li className="flex gap-2" key={item}>
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#79a99c]" aria-hidden="true" />
                        <span>{cleanTeacherText(item)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="mt-5 grid gap-5 lg:grid-cols-3">
                <ResponseGroup legend="Class understanding" name="objectiveMet" value={objectiveMet} />
                <ResponseGroup legend="Activity completed" name="activityCompleted" value={activityCompleted} />
                <ResponseGroup legend="Students explained their thinking" name="studentsExplainedThinking" value={studentsExplainedThinking} />
              </div>

              <div className="mt-5">
                <ReflectionTextArea
                  defaultValue={existingAssessment?.studentsNeedingSupport ?? ""}
                  label="What should I revisit next lesson?"
                  name="studentsNeedingSupport"
                  placeholder="Class-level follow-up or concept to revisit."
                />
              </div>

              {revisitText ? (
                <p className="mt-4 rounded-md bg-white px-4 py-3 text-sm leading-6 text-[#42514a]">
                  <span className="font-semibold text-[#17211c]">If many students struggle:</span> {revisitText}
                </p>
              ) : null}
            </section>

            <section className="rounded-md border border-[#dde3dc] bg-white p-5">
              <div>
                <h3 className="text-xl font-semibold text-[#17211c]">Curriculum Feedback</h3>
                <p className="mt-1 text-sm leading-6 text-[#66746d]">Short notes here help improve the lesson, activity, and classroom materials.</p>
              </div>

              <div className="mt-5">
                <LessonFitGroup value={teacherReflection.overallLessonFit} />
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <ReflectionTextArea
                  defaultValue={teacherReflection.whatWorkedWell}
                  label="What worked well?"
                  name="whatWorkedWell"
                  placeholder="A prompt, material, or classroom moment that helped."
                />
                <ReflectionTextArea
                  defaultValue={teacherReflection.whatConfusedStudents}
                  label="What confused students?"
                  name="whatConfusedStudents"
                  placeholder="A word, example, or activity step to clarify."
                />
                <ReflectionTextArea
                  defaultValue={teacherReflection.assetOrActivityIssue}
                  label="Activity or material issue"
                  name="assetOrActivityIssue"
                  placeholder="Timing, instructions, printable, or board flow."
                />
                <ReflectionTextArea
                  defaultValue={teacherReflection.lessonImprovementNotes}
                  label="Suggestion to improve"
                  name="lessonImprovementNotes"
                  placeholder="Optional note for the curriculum team."
                />
              </div>

              {familySections.length > 0 ? (
                <div className="mt-5 rounded-md bg-[#fbfcfa] px-4 py-3">
                  <p className="text-sm font-semibold text-[#17211c]">Family connection</p>
                  <div className="mt-2">
                    <SectionList sections={familySections} />
                  </div>
                </div>
              ) : null}
            </section>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button disabled={!isK6TeacherLed} icon={<ClipboardCheck aria-hidden="true" className="h-4 w-4" />} type="submit">
                Save Reflection
              </Button>
              {existingAssessment ? (
                <p className="text-sm leading-6 text-[#0b4d4f]">Last saved {new Date(existingAssessment.updatedAt).toLocaleString()}.</p>
              ) : (
                <p className="text-sm leading-6 text-[#66746d]">No saved reflection yet.</p>
              )}
            </div>
          </form>
        </TeacherMoment>

      </section>
      </div>
    </Layout>
  );
}
