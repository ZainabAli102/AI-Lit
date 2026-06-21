import { ArrowLeft, ClipboardCheck, FileText, MonitorUp } from "lucide-react";
import { Button } from "@/components/Button";
import { DashboardCard } from "@/components/DashboardCard";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { DELIVERY_MODE_LABELS, GRADE_BAND_LABELS } from "@/lib/constants";
import {
  getK6ClassLessonAssessment,
  getLessonForClass,
  getLessonResourcesResult,
  getTeacherClassResult,
  PREVIEW_TEACHER_PROFILE_ID,
  type K6AssessmentInput
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
    return "Current assessment saved to class_lesson_assessments.";
  }

  if (status === "local_preview") {
    return "Assessment captured in local preview mode. It will write to class_lesson_assessments when Supabase is configured.";
  }

  if (status === "error") {
    return "Assessment could not be saved. Check the Supabase table constraints and try again.";
  }

  return null;
}

function resourceTypeLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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
  const resourcesResult = await getLessonResourcesResult(lessonId);
  const resources = resourcesResult.data;
  const assessmentResult = await getK6ClassLessonAssessment(classId, lessonId);
  const existingAssessment = assessmentResult.data;
  const message = assessmentMessage(assessment);
  const isK6TeacherLed = classInfo?.gradeBand === "k_to_6" && classInfo.deliveryMode === "teacher_led";
  const objectiveMet = existingAssessment?.objectiveMet ?? "partly";
  const activityCompleted = existingAssessment?.activityCompleted ?? "partly";
  const studentsExplainedThinking = existingAssessment?.studentsExplainedThinking ?? "partly";
  const overallStatus = existingAssessment?.overallStatus ?? "completed";

  if (!classInfo) {
    return (
      <Layout>
        <PageHeader description="The requested class was not returned from Supabase or preview data." eyebrow="Teacher workspace" title="Class not found." />
        <DashboardCard description={classResult.error ?? `No class found for id ${classId}.`} eyebrow={classResult.mode} title="Class lookup failed" />
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
            <Button href="/teacher/smartboard/sample-activity" icon={<MonitorUp aria-hidden="true" className="h-4 w-4" />}>
              Smartboard
            </Button>
          </>
        }
        description={lesson?.summary ?? "Lesson detail for K to Grade 6 teacher-led class delivery."}
        eyebrow={classInfo ? `${classInfo.name} - ${GRADE_BAND_LABELS[classInfo.gradeBand]} - ${DELIVERY_MODE_LABELS[classInfo.deliveryMode]}` : "Teacher workspace"}
        title={lesson?.title ?? decodeURIComponent(lessonId)}
      />

      {message ? (
        <div className="rounded-md border border-[#b9d8c8] bg-[#edf8f1] px-4 py-3 text-sm font-semibold text-[#0b4d4f]">{message}</div>
      ) : null}

      {classResult.error || resourcesResult.error || assessmentResult.error ? (
        <DashboardCard
          description={[classResult.error, resourcesResult.error, assessmentResult.error].filter(Boolean).join(" ")}
          eyebrow={classResult.mode}
          title="Supabase query notice"
        />
      ) : null}

      {!isK6TeacherLed ? (
          <DashboardCard
          description="This MVP 1 assessment form is intentionally limited to K to Grade 6 teacher-led classes and class-level assessment only."
          title="Teacher-led K to Grade 6 only"
        />
      ) : null}

      <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <DashboardCard eyebrow="lesson_resources" title="Lesson Resources">
          <div className="grid gap-3">
            {resources.length > 0 ? (
              resources.map((resource) => (
                <article className="rounded-md border border-[#dde3dc] bg-[#fbfcfa] p-4" key={resource.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#116466]">{resourceTypeLabel(resource.resourceType)}</p>
                      <h2 className="mt-1 text-base font-semibold text-[#17211c]">{resource.title}</h2>
                    </div>
                    <FileText aria-hidden="true" className="h-5 w-5 text-[#116466]" />
                  </div>
                  {resource.description ? <p className="mt-3 text-sm leading-6 text-[#66746d]">{resource.description}</p> : null}
                  {resource.content ? <p className="mt-3 rounded-md bg-white p-3 text-sm leading-6 text-[#42514a]">{resource.content}</p> : null}
                  {resource.fileUrl ? <p className="mt-3 text-sm font-semibold text-[#0b4d4f]">{resource.fileUrl}</p> : null}
                </article>
              ))
            ) : (
              <p className="text-sm leading-6 text-[#66746d]">No lesson_resources rows were found for this lesson. Add resources before using the lesson in a live teacher-led session.</p>
            )}
          </div>
        </DashboardCard>

        <DashboardCard eyebrow="class_lesson_assessments" title="Class Assessment">
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
