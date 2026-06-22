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

  return (
    <Layout>
      <PageHeader
        description="Read-only curriculum content review. Protected lesson content is stored in structured platform tables rather than downloadable PDFs."
        eyebrow={`${lesson.lessonCode ?? "No lesson_code"} - ${GRADE_BAND_LABELS[lesson.gradeBand]}`}
        title={lesson.title}
      />
      {lessonResult.error ? <DashboardCard description={lessonResult.error} eyebrow={lessonResult.mode} title="Unable to load full lesson detail" /> : null}
      <div className="grid gap-5 md:grid-cols-3">
        <DashboardCard description={lesson.unitTitle ?? "Not linked"} title="Unit" />
        <DashboardCard description={lesson.gradeLevel !== null ? `Grade ${lesson.gradeLevel}` : "Not set"} title="Grade" />
        <DashboardCard description={`${lesson.status} / ${lesson.contentVersion}`} title="Status" />
      </div>
      <DashboardCard title="Lesson Metadata">
        <div className="grid gap-4 md:grid-cols-2">
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
        <DashboardCard description={`${lesson.sections.length} section record(s)`} eyebrow="lesson_sections" title="Lesson Sections">
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
              </article>
            ))}
          </div>
        </DashboardCard>
        <DashboardCard description={`${lesson.activities.length} activity record(s)`} eyebrow="activities" title="Activities">
          <div className="grid gap-3">
            {lesson.activities.map((activity) => (
              <article className="rounded-md border border-[#dde3dc] bg-[#fbfcfa] p-4" key={activity.id}>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#116466]">{activity.activityCode ?? activity.activityType}</p>
                <h2 className="mt-1 text-base font-semibold text-[#17211c]">{activity.title}</h2>
                <p className="mt-3 text-sm text-[#66746d]">
                  {label(activity.accessType)} / {activity.isSmartboardReady ? "Smartboard-ready" : "Not smartboard-ready"}
                </p>
              </article>
            ))}
          </div>
        </DashboardCard>
        <DashboardCard description={`${lesson.resources.length} resource record(s)`} eyebrow="lesson_resources" title="Resources">
          <div className="grid gap-3">
            {lesson.resources.map((resource) => (
              <article className="rounded-md border border-[#dde3dc] bg-[#fbfcfa] p-4" key={resource.id}>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#116466]">{resource.resourceCode ?? resource.resourceType}</p>
                <h2 className="mt-1 text-base font-semibold text-[#17211c]">{resource.title}</h2>
                <p className="mt-3 text-sm text-[#66746d]">
                  {label(resource.accessType)} / Printable: {resource.isPrintable ? "yes" : "no"} / Downloadable: {resource.isDownloadable ? "yes" : "no"}
                </p>
              </article>
            ))}
          </div>
        </DashboardCard>
        <DashboardCard description={`${lesson.assessmentTemplates.length} assessment template record(s)`} eyebrow="assessment_templates" title="Assessment Templates">
          <div className="grid gap-3">
            {lesson.assessmentTemplates.map((template) => (
              <article className="rounded-md border border-[#dde3dc] bg-[#fbfcfa] p-4" key={template.id}>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#116466]">{template.templateCode ?? template.assessmentType}</p>
                <h2 className="mt-1 text-base font-semibold text-[#17211c]">{template.title}</h2>
                <p className="mt-3 text-sm text-[#66746d]">{label(template.accessType)}</p>
              </article>
            ))}
          </div>
        </DashboardCard>
      </div>
    </Layout>
  );
}
