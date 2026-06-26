import { DashboardCard } from "@/components/DashboardCard";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { GRADE_BAND_LABELS } from "@/lib/constants";
import { getCurriculumLessonDetailResult } from "@/lib/curriculum-data";

export const dynamic = "force-dynamic";

type AdminCurriculumLessonDetailPageProps = {
  params: Promise<{
    lessonId: string;
  }>;
};

function label(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function qaValue(value: string | number | null | undefined) {
  return value === null || value === undefined || value === "" ? "Missing" : String(value);
}

export default async function AdminCurriculumLessonDetailPage({ params }: AdminCurriculumLessonDetailPageProps) {
  const { lessonId } = await params;
  const lessonResult = await getCurriculumLessonDetailResult(lessonId);
  const lesson = lessonResult.data;

  if (!lesson) {
    return (
      <Layout>
        <PageHeader description="The requested curriculum lesson was not found." eyebrow="Platform admin" title="Lesson not found" />
        <DashboardCard description={lessonResult.error ?? `No lesson found for id ${lessonId}.`} eyebrow={lessonResult.mode} title="Unable to load lesson" />
      </Layout>
    );
  }

  const metadataChecks = [
    ["lesson_code", lesson.lessonCode],
    ["display_code", lesson.displayCode],
    ["unit", lesson.unitTitle],
    ["anchor_theme", lesson.anchorTheme],
    ["tool_use_status", lesson.toolUseStatus],
    ["i_can_statement", lesson.iCanStatement],
    ["student_challenge", lesson.studentChallenge],
    ["student_output", lesson.studentOutput],
    ["essential_question", lesson.essentialQuestion],
    ["learning_objectives", lesson.learningObjectives],
    ["materials_needed", lesson.materialsNeeded],
    ["vocabulary", lesson.vocabulary],
    ["teacher_prep_notes", lesson.teacherPrepNotes]
  ] as const;
  const completeMetadataCount = metadataChecks.filter(([, value]) => value !== null && value !== "").length;

  return (
    <Layout>
      <PageHeader
        description="Internal curriculum QA and import validation view. This is not the classroom delivery page."
        eyebrow={`${lesson.displayCode ?? lesson.lessonCode ?? "No lesson_code"} - ${GRADE_BAND_LABELS[lesson.gradeBand]}`}
        title={`Curriculum Review: ${lesson.title}`}
      />
      {lessonResult.error ? <DashboardCard description={lessonResult.error} eyebrow={lessonResult.mode} title="Unable to load full lesson detail" /> : null}
      <div className="grid gap-5 md:grid-cols-3">
        <DashboardCard description={lesson.unitTitle ?? "Not linked"} title="Unit" />
        <DashboardCard description={lesson.gradeLevel !== null ? `Grade ${lesson.gradeLevel}` : "Not set"} title="Grade" />
        <DashboardCard description={`${lesson.status} / ${lesson.contentVersion}`} title="Status" />
      </div>
      <DashboardCard description="Stable codes used by seed files, bulk import, and curriculum QA." title="Internal Import Codes">
        <div className="grid gap-3 md:grid-cols-2">
          <p className="rounded-md border border-[#dde3dc] bg-[#fbfcfa] p-3 text-sm text-[#42514a]">
            <span className="font-semibold text-[#17211c]">lesson_code:</span> {qaValue(lesson.lessonCode)}
          </p>
          <p className="rounded-md border border-[#dde3dc] bg-[#fbfcfa] p-3 text-sm text-[#42514a]">
            <span className="font-semibold text-[#17211c]">display_code:</span> {qaValue(lesson.displayCode)}
          </p>
        </div>
      </DashboardCard>
      <DashboardCard description={`${completeMetadataCount} of ${metadataChecks.length} required/recommended metadata fields populated.`} title="Metadata Completeness">
        <div className="grid gap-2 md:grid-cols-2">
          {metadataChecks.map(([name, value]) => (
            <div className="flex items-center justify-between gap-3 rounded-md border border-[#dde3dc] bg-[#fbfcfa] px-3 py-2 text-sm" key={name}>
              <span className="font-semibold text-[#42514a]">{name}</span>
              <span className={value ? "text-[#0b4d4f]" : "text-[#9a5b1f]"}>{value ? "Present" : "Missing"}</span>
            </div>
          ))}
        </div>
      </DashboardCard>
      <DashboardCard title="Master Lesson Fields">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#116466]">Anchor theme</p>
            <p className="mt-2 text-sm leading-6 text-[#42514a]">{qaValue(lesson.anchorTheme)}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#116466]">Tool-use status</p>
            <p className="mt-2 text-sm leading-6 text-[#42514a]">{qaValue(lesson.toolUseStatus)}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#116466]">I can statement</p>
            <p className="mt-2 text-sm leading-6 text-[#42514a]">{qaValue(lesson.iCanStatement)}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#116466]">Student challenge</p>
            <p className="mt-2 text-sm leading-6 text-[#42514a]">{qaValue(lesson.studentChallenge)}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#116466]">Student output</p>
            <p className="mt-2 text-sm leading-6 text-[#42514a]">{qaValue(lesson.studentOutput)}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#116466]">Essential question</p>
            <p className="mt-2 text-sm leading-6 text-[#42514a]">{lesson.essentialQuestion ?? "Not set"}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#116466]">Learning objectives</p>
            <p className="mt-2 text-sm leading-6 text-[#42514a]">{lesson.learningObjectives ?? "Not set"}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#116466]">Materials</p>
            <p className="mt-2 text-sm leading-6 text-[#42514a]">{lesson.materialsNeeded ?? "Not set"}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#116466]">Teacher prep</p>
            <p className="mt-2 text-sm leading-6 text-[#42514a]">{lesson.teacherPrepNotes ?? "Not set"}</p>
          </div>
        </div>
      </DashboardCard>
      <div className="grid gap-5 lg:grid-cols-2">
        <DashboardCard description={`${lesson.sections.length} section record(s) for internal QA/import validation.`} eyebrow="lesson_sections" title="Section Records">
          <div className="grid gap-3">
            {lesson.sections.map((section) => (
              <article className="rounded-md border border-[#dde3dc] bg-[#fbfcfa] p-4" key={section.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#116466]">{section.sectionCode ?? section.sectionType}</p>
                    <h2 className="mt-1 text-base font-semibold text-[#17211c]">{section.title}</h2>
                  </div>
                  <span className="rounded-md border border-[#cad6cf] bg-white px-2 py-1 text-xs font-semibold text-[#42514a]">{label(section.accessType)}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-[#66746d]">{section.content ?? "No content entered."}</p>
                <p className="mt-3 text-xs text-[#66746d]">
                  section_type: {section.sectionType} / sequence_order: {section.sequenceOrder}
                </p>
              </article>
            ))}
          </div>
        </DashboardCard>
        <DashboardCard description={`${lesson.activities.length} activity record(s) with structured activity classification.`} eyebrow="activities" title="Activity Records">
          <div className="grid gap-3">
            {lesson.activities.map((activity) => (
              <article className="rounded-md border border-[#dde3dc] bg-[#fbfcfa] p-4" key={activity.id}>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#116466]">{activity.activityCode ?? activity.activityType}</p>
                <h2 className="mt-1 text-base font-semibold text-[#17211c]">{activity.title}</h2>
                <p className="mt-3 text-sm text-[#66746d]">
                  {label(activity.accessType)} / {activity.isSmartboardReady ? "Smartboard-ready" : "Not smartboard-ready"}
                </p>
                <p className="mt-2 text-xs text-[#66746d]">
                  activity_type: {activity.activityType} / sequence_order: {activity.sequenceOrder}
                </p>
              </article>
            ))}
          </div>
        </DashboardCard>
        <DashboardCard description={`${lesson.resources.length} resource record(s) with content protection flags.`} eyebrow="lesson_resources" title="Resource Records">
          <div className="grid gap-3">
            {lesson.resources.map((resource) => (
              <article className="rounded-md border border-[#dde3dc] bg-[#fbfcfa] p-4" key={resource.id}>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#116466]">{resource.resourceCode ?? resource.resourceType}</p>
                <h2 className="mt-1 text-base font-semibold text-[#17211c]">{resource.title}</h2>
                <p className="mt-3 text-sm text-[#66746d]">
                  {label(resource.accessType)} / Printable: {resource.isPrintable ? "yes" : "no"} / Downloadable: {resource.isDownloadable ? "yes" : "no"}
                </p>
                <p className="mt-2 text-xs text-[#66746d]">
                  resource_type: {resource.resourceType} / sort_order: {resource.sortOrder}
                </p>
              </article>
            ))}
          </div>
        </DashboardCard>
        <DashboardCard description={`${lesson.assessmentTemplates.length} assessment template record(s) for content QA.`} eyebrow="assessment_templates" title="Assessment Template Records">
          <div className="grid gap-3">
            {lesson.assessmentTemplates.map((template) => (
              <article className="rounded-md border border-[#dde3dc] bg-[#fbfcfa] p-4" key={template.id}>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#116466]">{template.templateCode ?? template.assessmentType}</p>
                <h2 className="mt-1 text-base font-semibold text-[#17211c]">{template.title}</h2>
                <p className="mt-3 text-sm text-[#66746d]">{label(template.accessType)}</p>
                <p className="mt-2 text-xs text-[#66746d]">
                  assessment_type: {template.assessmentType} / sequence_order: {template.sequenceOrder}
                </p>
              </article>
            ))}
          </div>
        </DashboardCard>
      </div>
    </Layout>
  );
}
