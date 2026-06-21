import { BookOpen, MonitorUp } from "lucide-react";
import { Button } from "@/components/Button";
import { DashboardCard } from "@/components/DashboardCard";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { DELIVERY_MODE_LABELS, GRADE_BAND_LABELS } from "@/lib/constants";
import { getLessonsForClassResult, getTeacherClassResult, PREVIEW_TEACHER_PROFILE_ID } from "@/lib/teacher-led-data";

export const dynamic = "force-dynamic";

type ClassDetailPageProps = {
  params: Promise<{
    classId: string;
  }>;
  searchParams?: Promise<{
    teacherProfileId?: string;
  }>;
};

export default async function ClassDetailPage({ params, searchParams }: ClassDetailPageProps) {
  const { classId } = await params;
  const query = await searchParams;
  const selectedTeacherProfileId = query?.teacherProfileId?.trim() || PREVIEW_TEACHER_PROFILE_ID;
  const teacherQuery = `teacherProfileId=${encodeURIComponent(selectedTeacherProfileId)}`;
  const classResult = await getTeacherClassResult(classId);
  const classInfo = classResult.data;
  const lessonsResult = classInfo ? await getLessonsForClassResult(classInfo) : { data: [], mode: classResult.mode, error: null };
  const lessons = lessonsResult.data;
  const title = classInfo?.name ?? decodeURIComponent(classId);
  const isK6TeacherLed = classInfo?.gradeBand === "k_to_6" && classInfo.deliveryMode === "teacher_led";

  if (!classInfo) {
    return (
      <Layout>
        <PageHeader
          description="The requested class was not returned from Supabase or preview data."
          eyebrow="Teacher workspace"
          title="Class not found."
        />
        <DashboardCard description={classResult.error ?? `No class found for id ${classId}.`} eyebrow={classResult.mode} title="Class lookup failed" />
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHeader
        actions={
          <>
            {lessons[0] ? (
              <Button href={`/teacher/classes/${classId}/lessons/${lessons[0].id}?${teacherQuery}`} icon={<BookOpen aria-hidden="true" className="h-4 w-4" />} variant="secondary">
                First lesson
              </Button>
            ) : null}
            <Button href="/teacher/smartboard/sample-activity" icon={<MonitorUp aria-hidden="true" className="h-4 w-4" />}>
              Smartboard
            </Button>
          </>
        }
        description="Class detail for teacher-led lesson delivery, lesson resources, and class-level K to Grade 6 assessment."
        eyebrow="Teacher workspace"
        title={title}
      />
      {classResult.error || lessonsResult.error ? (
        <DashboardCard description={[classResult.error, lessonsResult.error].filter(Boolean).join(" ")} eyebrow={classResult.mode} title="Supabase query notice" />
      ) : null}
      <div className="grid gap-5 md:grid-cols-3">
        <DashboardCard description={`${GRADE_BAND_LABELS[classInfo.gradeBand]} (${classInfo.gradeBand})`} title="Grade band" />
        <DashboardCard description={`Grade ${classInfo.gradeLevel}`} title="Grade level" />
        <DashboardCard description={`${DELIVERY_MODE_LABELS[classInfo.deliveryMode]} (${classInfo.deliveryMode})`} title="Delivery mode" />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <DashboardCard description={isK6TeacherLed ? "No student accounts. Assessment is recorded at class level for each lesson." : "This class is outside the active MVP 1 K-6 teacher-led scope."} title="Progress model" />
        <DashboardCard description={classInfo.schoolName} title="School" />
        <DashboardCard description={selectedTeacherProfileId} title="Preview teacher profile" />
      </div>
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-[#17211c]">Lessons</h2>
          <p className="mt-1 text-sm leading-6 text-[#66746d]">
            {isK6TeacherLed
              ? "Available K to Grade 6 lessons for teacher-led delivery."
              : "Lessons are shown when the class delivery mode is supported by this MVP workflow."}
          </p>
        </div>
        <div className="grid gap-4">
          {lessons.length > 0 ? (
            lessons.map((lesson) => (
              <DashboardCard description={lesson.summary} key={lesson.id} title={lesson.title}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-[#66746d]">
                    Lesson {lesson.sequenceOrder}
                    {lesson.estimatedMinutes ? ` - ${lesson.estimatedMinutes} minutes` : ""}
                  </p>
                  <Button href={`/teacher/classes/${classId}/lessons/${lesson.id}?${teacherQuery}`} variant="secondary">
                    Open lesson
                  </Button>
                </div>
              </DashboardCard>
            ))
          ) : (
            <DashboardCard description={lessonsResult.error ?? "No active K to Grade 6 lessons were returned for this class grade band. Check seeded lessons and lesson resources."} title="No lessons found" />
          )}
        </div>
      </section>
    </Layout>
  );
}
