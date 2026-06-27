import { ArrowLeft, ClipboardCheck, MonitorUp } from "lucide-react";
import { Button } from "@/components/Button";
import { DashboardCard } from "@/components/DashboardCard";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { DELIVERY_MODE_LABELS, GRADE_BAND_LABELS } from "@/lib/constants";
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

function assessmentMessage(status?: string) {
  if (status === "supabase") {
    return "Current class assessment saved.";
  }

  if (status === "local_preview") {
    return "Assessment captured in local preview mode.";
  }

  if (status === "error") {
    return "Assessment could not be saved. Check the form and try again.";
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

function TeacherContentDetails({ value }: { value: unknown }) {
  if (!isRecord(value) || Object.keys(value).length === 0) {
    return null;
  }

  const teacherNote = typeof value.teacher_note === "string" ? value.teacher_note : null;
  const sentenceFrame = typeof value.sentence_frame === "string" ? value.sentence_frame : null;
  const steps = stringArray(value.steps);
  const lookFor = stringArray(value.look_for);

  return (
    <div className="mt-3 space-y-3 rounded-md bg-white p-3 text-sm leading-6 text-[#42514a]">
      {teacherNote ? (
        <p>
          <span className="font-semibold text-[#17211c]">Teacher note:</span> {teacherNote}
        </p>
      ) : null}
      {sentenceFrame ? (
        <p>
          <span className="font-semibold text-[#17211c]">Sentence frame:</span> {sentenceFrame}
        </p>
      ) : null}
      {steps.length > 0 ? (
        <ol className="list-decimal space-y-1 pl-5">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      ) : null}
      {lookFor.length > 0 ? (
        <ul className="list-disc space-y-1 pl-5">
          {lookFor.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function ActivityDetails({ activityType, value }: { activityType: string; value: unknown }) {
  if (!isRecord(value) || Object.keys(value).length === 0) {
    return null;
  }

  const prompt = typeof value.prompt === "string" ? value.prompt : null;
  const categories = stringArray(value.categories);
  const sampleResponses = stringArray(value.sampleResponses);
  const scenarios = stringArray(value.scenarios);
  const cards = Array.isArray(value.cards) ? value.cards.filter(isRecord) : [];
  const patterns = Array.isArray(value.patterns) ? value.patterns.filter(isRecord) : [];

  return (
    <div className="mt-3 space-y-3 rounded-md bg-white p-3 text-sm leading-6 text-[#42514a]">
      {prompt ? (
        <p>
          <span className="font-semibold text-[#17211c]">Prompt:</span> {prompt}
        </p>
      ) : null}
      {categories.length > 0 ? (
        <div>
          <p className="font-semibold text-[#17211c]">Categories</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {categories.map((category) => (
              <span className="rounded-md border border-[#cad6cf] bg-[#fbfcfa] px-2 py-1 text-xs font-semibold text-[#42514a]" key={category}>
                {category}
              </span>
            ))}
          </div>
        </div>
      ) : null}
      {cards.length > 0 ? (
        <div>
          <p className="font-semibold text-[#17211c]">{activityType === "sorting_cards" ? "Sorting cards" : "Cards"}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {cards.map((card, index) => {
              const label = typeof card.label === "string" ? card.label : `Card ${index + 1}`;
              const correctCategory = typeof card.correctCategory === "string" ? card.correctCategory : null;
              return <li key={`${label}-${index}`}>{correctCategory ? `${label} -> ${correctCategory}` : label}</li>;
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
              return <li key={`${items}-${index}`}>{answer ? `${items} -> ${answer}` : items}</li>;
            })}
          </ul>
        </div>
      ) : null}
      {scenarios.length > 0 ? (
        <div>
          <p className="font-semibold text-[#17211c]">Scenario cards</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {scenarios.map((scenario) => (
              <li key={scenario}>{scenario}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {sampleResponses.length > 0 ? (
        <div>
          <p className="font-semibold text-[#17211c]">Sample responses</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {sampleResponses.map((response) => (
              <li key={response}>{response}</li>
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
        const label = typeof criterion.label === "string" ? criterion.label : `Criterion ${index + 1}`;
        return <li key={`${label}-${index}`}>{label}</li>;
      })}
    </ul>
  );
}

function AccessBadge({ value }: { value: string }) {
  if (value === "platform_only") {
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
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#116466]">{resourceTypeLabel(section.sectionType)}</p>
          <h3 className="mt-1 text-base font-semibold text-[#17211c]">{section.title}</h3>
        </div>
        <AccessBadge value={section.accessType} />
      </div>
      {section.content && !hasStructuredSteps ? <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#42514a]">{section.content}</p> : null}
      <TeacherContentDetails value={section.contentJson} />
      {section.estimatedMinutes ? <p className="mt-3 text-xs font-semibold text-[#66746d]">{section.estimatedMinutes} minutes</p> : null}
    </article>
  );
}

function ActivityCard({ activity, classId, lessonId }: { activity: LessonActivity; classId: string; lessonId: string }) {
  const smartboardHref = `/teacher/smartboard/${activity.id}?classId=${encodeURIComponent(classId)}&lessonId=${encodeURIComponent(lessonId)}`;

  return (
    <article className="rounded-md border border-[#dde3dc] bg-[#fbfcfa] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#116466]">{resourceTypeLabel(activity.activityType)}</p>
          <h3 className="mt-1 text-base font-semibold text-[#17211c]">{activity.title}</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <AccessBadge value={activity.accessType} />
          {activity.isSmartboardReady ? (
            <span className="rounded-md border border-[#b9d8c8] bg-[#edf8f1] px-2 py-1 text-xs font-semibold text-[#0b4d4f]">Smartboard Activity</span>
          ) : null}
        </div>
      </div>
      {activity.instructions ? <p className="mt-3 text-sm leading-6 text-[#42514a]">{activity.instructions}</p> : null}
      <ActivityDetails activityType={activity.activityType} value={activity.activityJson} />
      {activity.isSmartboardReady ? (
        <div className="mt-4">
          <Button href={smartboardHref} icon={<MonitorUp aria-hidden="true" className="h-4 w-4" />}>
            Open Smartboard Activity
          </Button>
        </div>
      ) : null}
    </article>
  );
}

function ResourceCard({ resource }: { resource: LessonResource }) {
  const shouldShowPrintableBadge = resource.isPrintable || resource.accessType === "printable";

  return (
    <article className="rounded-md border border-[#dde3dc] bg-[#fbfcfa] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#116466]">{resourceTypeLabel(resource.resourceType)}</p>
          <h3 className="mt-1 text-base font-semibold text-[#17211c]">{resource.title}</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {resource.accessType !== "printable" ? <AccessBadge value={resource.accessType} /> : null}
          {shouldShowPrintableBadge ? <span className="rounded-md border border-[#d7c49a] bg-[#fff8e8] px-2 py-1 text-xs font-semibold text-[#6d4c11]">Printable</span> : null}
          {resource.isDownloadable ? <span className="rounded-md border border-[#cad6cf] bg-white px-2 py-1 text-xs font-semibold text-[#42514a]">Downloadable</span> : null}
        </div>
      </div>
      {resource.description ? <p className="mt-3 text-sm leading-6 text-[#66746d]">{resource.description}</p> : null}
      {resource.content ? <p className="mt-3 rounded-md bg-white p-3 text-sm leading-6 text-[#42514a]">{resource.content}</p> : null}
      {resource.fileUrl && resource.isDownloadable ? <p className="mt-3 text-sm font-semibold text-[#0b4d4f]">{resource.fileUrl}</p> : null}
      {shouldShowPrintableBadge ? (
        <p className="mt-3 text-xs font-semibold text-[#66746d]">
          {resource.estimatedPages ? `${resource.estimatedPages} page${resource.estimatedPages === 1 ? "" : "s"} ` : ""}
          {resource.estimatedPages ? <span aria-hidden="true">&middot; </span> : null}
          Classroom material
        </p>
      ) : null}
    </article>
  );
}

function AssessmentTemplateCard({ template }: { template: AssessmentTemplate }) {
  return (
    <article className="rounded-md border border-[#dde3dc] bg-[#fbfcfa] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#116466]">{template.assessmentType}</p>
          <h3 className="mt-1 text-base font-semibold text-[#17211c]">{template.title}</h3>
        </div>
        <AccessBadge value={template.accessType} />
      </div>
      {template.description ? <p className="mt-3 text-sm leading-6 text-[#66746d]">{template.description}</p> : null}
      <AssessmentCriteria value={template.criteriaJson} />
    </article>
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
    <fieldset className="rounded-md border border-[#dde3dc] bg-[#fbfcfa] p-4">
      <legend className="px-1 text-sm font-semibold text-[#17211c]">{legend}</legend>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {responseOptions.map((option) => (
          <label className="flex min-h-10 items-center gap-2 rounded-md border border-[#dde3dc] bg-white px-3 text-sm text-[#42514a]" key={option.value}>
            <input className="h-4 w-4 accent-[#116466]" defaultChecked={option.value === value} name={name} type="radio" value={option.value} />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
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
  const sections = sectionsResult.data;
  const activities = activitiesResult.data;
  const resources = resourcesResult.data;
  const printableResources = resources.filter((resource) => resource.isPrintable || resource.accessType === "printable");
  const platformResources = resources.filter((resource) => !resource.isPrintable && resource.accessType !== "downloadable");
  const downloadableResources = resources.filter((resource) => resource.isDownloadable || resource.accessType === "downloadable");
  const smartboardActivities = activities.filter((activity) => activity.isSmartboardReady);
  const assessmentTemplates = assessmentTemplatesResult.data;
  const overviewSections = sections.filter((section) => ["overview", "learning_objectives"].includes(section.sectionType));
  const beforeLessonSections = sections.filter((section) => section.sectionType === "teacher_script");
  const lessonFlowSections = sections.filter((section) => ["lesson_flow", "guided_activity", "discussion_prompt"].includes(section.sectionType));
  const followUpSections = sections.filter((section) => ["reflection", "extension", "differentiation"].includes(section.sectionType));
  const assessmentGuidanceSections = sections.filter((section) => section.sectionType === "assessment_guidance");
  const groupedSectionIds = new Set(
    [...overviewSections, ...beforeLessonSections, ...lessonFlowSections, ...followUpSections, ...assessmentGuidanceSections].map((section) => section.id)
  );
  const otherSections = sections.filter((section) => !groupedSectionIds.has(section.id));
  const assessmentResult = await getK6ClassLessonAssessment(classId, lessonId);
  const existingAssessment = assessmentResult.data;
  const message = assessmentMessage(assessment);
  const isK6TeacherLed = classInfo?.gradeBand === "k_to_6" && classInfo.deliveryMode === "teacher_led";
  const firstSmartboardActivity = smartboardActivities[0];
  const objectiveMet = existingAssessment?.objectiveMet ?? "partly";
  const activityCompleted = existingAssessment?.activityCompleted ?? "partly";
  const studentsExplainedThinking = existingAssessment?.studentsExplainedThinking ?? "partly";
  const overallStatus = existingAssessment?.overallStatus ?? "completed";

  if (!classInfo) {
    return (
      <Layout>
        <PageHeader description="The requested class is not available for this teacher workspace." eyebrow="Teacher workspace" title="Class not found." />
        <DashboardCard description="Return to your class list and open an assigned K to Grade 6 class." title="Class unavailable" />
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHeader
        actions={
          <>
            <Button href={`/teacher/classes/${classId}?${teacherQuery}`} icon={<ArrowLeft aria-hidden="true" className="h-4 w-4" />} variant="secondary">
              Class
            </Button>
            {firstSmartboardActivity ? (
              <Button href={`/teacher/smartboard/${firstSmartboardActivity.id}?classId=${encodeURIComponent(classId)}&lessonId=${encodeURIComponent(lessonId)}`} icon={<MonitorUp aria-hidden="true" className="h-4 w-4" />}>
                Smartboard
              </Button>
            ) : null}
          </>
        }
        description={lesson?.summary ?? "Lesson materials are not available for this class yet."}
        eyebrow={classInfo ? `${classInfo.name} - ${GRADE_BAND_LABELS[classInfo.gradeBand]} - ${DELIVERY_MODE_LABELS[classInfo.deliveryMode]}` : "Teacher workspace"}
        title={lesson?.title ?? "Lesson not found"}
      />

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

      <section className="space-y-6">
        <DashboardCard eyebrow={lesson?.displayCode ?? lesson?.lessonCode ?? "lesson"} title="1. Lesson Overview">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#116466]">Essential question</p>
                <p className="mt-2 text-sm leading-6 text-[#42514a]">{lesson?.essentialQuestion ?? "No essential question has been added yet."}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#116466]">Learning objectives</p>
                <p className="mt-2 text-sm leading-6 text-[#42514a]">{lesson?.learningObjectives ?? "No learning objectives have been added yet."}</p>
              </div>
              {overviewSections.length > 0 ? (
                <div className="grid gap-3">
                  {overviewSections.map((section) => (
                    <LessonSectionCard key={section.id} section={section} />
                  ))}
                </div>
              ) : null}
            </div>
            <div className="grid gap-3 rounded-md border border-[#dde3dc] bg-[#fbfcfa] p-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#116466]">Duration</p>
                <p className="mt-1 text-sm leading-6 text-[#42514a]">{lesson?.durationMinutes ?? lesson?.estimatedMinutes ?? "Not set"} minutes</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#116466]">Materials</p>
                <p className="mt-1 text-sm leading-6 text-[#42514a]">{lesson?.materialsNeeded ?? "No materials list has been added yet."}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#116466]">Vocabulary</p>
                <p className="mt-1 text-sm leading-6 text-[#42514a]">{lesson?.vocabulary ?? "No vocabulary has been added yet."}</p>
              </div>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard eyebrow="teacher prep" title="2. Before the Lesson">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#116466]">Teacher prep</p>
              <p className="mt-2 text-sm leading-6 text-[#42514a]">{lesson?.teacherPrepNotes ?? "No teacher prep notes have been added yet."}</p>
            </div>
            {beforeLessonSections.length > 0 ? (
              <div className="grid gap-3">
                {beforeLessonSections.map((section) => (
                  <LessonSectionCard key={section.id} section={section} />
                ))}
              </div>
            ) : null}
            {platformResources.length > 0 ? (
              <div className="grid gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#116466]">Protected teacher resources</p>
                {platformResources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            ) : null}
          </div>
        </DashboardCard>

        <DashboardCard eyebrow="teaching sequence" title="3. Lesson Flow">
          <div className="grid gap-3">
            {lessonFlowSections.length > 0 ? (
              lessonFlowSections.map((section) => <LessonSectionCard key={section.id} section={section} />)
            ) : (
              <EmptyState>No teaching sequence has been added yet.</EmptyState>
            )}
          </div>
        </DashboardCard>

        <DashboardCard eyebrow="class activity" title="4. Smartboard Activity">
          <div className="grid gap-3">
            {smartboardActivities.length > 0 ? (
              smartboardActivities.map((activity) => <ActivityCard activity={activity} classId={classId} key={activity.id} lessonId={lessonId} />)
            ) : activities.length > 0 ? (
              activities.map((activity) => <ActivityCard activity={activity} classId={classId} key={activity.id} lessonId={lessonId} />)
            ) : (
              <EmptyState>No smartboard activity has been added yet.</EmptyState>
            )}
          </div>
        </DashboardCard>

        {followUpSections.length > 0 || otherSections.length > 0 ? (
          <DashboardCard eyebrow="after activity" title="5. Reflection, Extension, and Support">
            <div className="grid gap-3">
              {[...followUpSections, ...otherSections].map((section) => (
                <LessonSectionCard key={section.id} section={section} />
              ))}
            </div>
          </DashboardCard>
        ) : null}

        <DashboardCard eyebrow="classroom materials" title="6. Printable Classroom Materials">
          <div className="grid gap-3">
            {printableResources.length > 0 ? (
              printableResources.map((resource) => <ResourceCard key={resource.id} resource={resource} />)
            ) : (
              <EmptyState>No printable classroom materials have been marked for this lesson.</EmptyState>
            )}
          </div>
        </DashboardCard>

        {downloadableResources.length > 0 ? (
          <DashboardCard eyebrow="classroom files" title="Downloadable Resources">
            <div className="grid gap-3">
              {downloadableResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          </DashboardCard>
        ) : null}

        <DashboardCard eyebrow="assessment guidance" title="7. Assessment Guidance">
          <div className="grid gap-3">
            {assessmentGuidanceSections.length > 0 ? (
              assessmentGuidanceSections.map((section) => <LessonSectionCard key={section.id} section={section} />)
            ) : null}
            {assessmentTemplates.length > 0 ? (
              assessmentTemplates.map((template) => <AssessmentTemplateCard key={template.id} template={template} />)
            ) : assessmentGuidanceSections.length === 0 ? (
              <EmptyState>No assessment guidance or template has been attached yet. The class-level assessment form is still available below.</EmptyState>
            ) : null}
          </div>
        </DashboardCard>

        <DashboardCard eyebrow="class-level assessment" title="8. Class Assessment Form">
          {existingAssessment ? (
            <div className="mb-4 rounded-md border border-[#b9d8c8] bg-[#edf8f1] px-4 py-3 text-sm text-[#0b4d4f]">
              Current assessment loaded. Last saved {new Date(existingAssessment.updatedAt).toLocaleString()}.
            </div>
          ) : (
            <div className="mb-4 rounded-md border border-[#dde3dc] bg-[#fbfcfa] px-4 py-3 text-sm text-[#66746d]">
              No saved assessment yet for this class and lesson.
            </div>
          )}
          <form action={submitK6AssessmentAction} className="space-y-4">
            <input name="classId" type="hidden" value={classId} />
            <input name="lessonId" type="hidden" value={lessonId} />
            <input name="teacherId" type="hidden" value={selectedTeacherProfileId} />
            <input name="teacherProfileId" type="hidden" value={selectedTeacherProfileId} />

            <ResponseGroup legend="Objective met" name="objectiveMet" value={objectiveMet} />
            <ResponseGroup legend="Activity completed" name="activityCompleted" value={activityCompleted} />
            <ResponseGroup legend="Students explained their thinking" name="studentsExplainedThinking" value={studentsExplainedThinking} />

            <label className="block">
              <span className="text-sm font-semibold text-[#42514a]">Students needing support</span>
              <textarea
                className="mt-2 min-h-24 w-full rounded-md border border-[#cad6cf] bg-[#fbfcfa] px-3 py-2 text-sm outline-none transition focus:border-[#116466] focus:ring-2 focus:ring-[#c9dfd8]"
                name="studentsNeedingSupport"
                placeholder="Names, groups, or support notes. No student accounts are used for K to 6."
                defaultValue={existingAssessment?.studentsNeedingSupport ?? ""}
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-[#42514a]">Teacher notes</span>
              <textarea
                className="mt-2 min-h-24 w-full rounded-md border border-[#cad6cf] bg-[#fbfcfa] px-3 py-2 text-sm outline-none transition focus:border-[#116466] focus:ring-2 focus:ring-[#c9dfd8]"
                name="teacherNotes"
                placeholder="Whole-class observations, misconceptions, or next lesson adjustments."
                defaultValue={existingAssessment?.teacherNotes ?? ""}
              />
            </label>

            <fieldset className="rounded-md border border-[#dde3dc] bg-[#fbfcfa] p-4">
              <legend className="px-1 text-sm font-semibold text-[#17211c]">Overall status</legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <label className="flex min-h-10 items-center gap-2 rounded-md border border-[#dde3dc] bg-white px-3 text-sm text-[#42514a]">
                  <input className="h-4 w-4 accent-[#116466]" defaultChecked={overallStatus === "completed"} name="overallStatus" type="radio" value="completed" />
                  <span>Completed</span>
                </label>
                <label className="flex min-h-10 items-center gap-2 rounded-md border border-[#dde3dc] bg-white px-3 text-sm text-[#42514a]">
                  <input className="h-4 w-4 accent-[#116466]" defaultChecked={overallStatus === "needs_review"} name="overallStatus" type="radio" value="needs_review" />
                  <span>Needs review</span>
                </label>
              </div>
            </fieldset>

            <Button className="w-full" disabled={!isK6TeacherLed} icon={<ClipboardCheck aria-hidden="true" className="h-4 w-4" />} type="submit">
              {existingAssessment ? "Update class assessment" : "Save class assessment"}
            </Button>
          </form>
        </DashboardCard>
      </section>
    </Layout>
  );
}
