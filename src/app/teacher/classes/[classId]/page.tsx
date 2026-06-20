import { BookOpen, MonitorUp } from "lucide-react";
import { Button } from "@/components/Button";
import { DashboardCard } from "@/components/DashboardCard";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { DELIVERY_MODE_LABELS, GRADE_BAND_LABELS } from "@/lib/constants";
import { getLessonsForClass, getTeacherClass } from "@/lib/teacher-led-data";

type ClassDetailPageProps = {
  params: Promise<{
    classId: string;
  }>;
};

export default async function ClassDetailPage({ params }: ClassDetailPageProps) {
  const { classId } = await params;
  const classInfo = await getTeacherClass(classId);
  const lessons = classInfo ? await getLessonsForClass(classInfo) : [];
  const title = classInfo?.name ?? decodeURIComponent(classId);
  const isK6TeacherLed = classInfo?.gradeBand === "k_to_6" && classInfo.deliveryMode === "teacher_led";

  return (
    <Layout>
      <PageHeader
        actions={
          <>
            {lessons[0] ? (
              <Button href={`/teacher/classes/${classId}/lessons/${lessons[0].id}`} icon={<BookOpen aria-hidden="true" className="h-4 w-4" />} variant="secondary">
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
      <div className="grid gap-5 md:grid-cols-3">
        <DashboardCard description={classInfo ? GRADE_BAND_LABELS[classInfo.gradeBand] : "Grade band will resolve from Supabase later."} title="Grade band" />
        <DashboardCard description={classInfo ? DELIVERY_MODE_LABELS[classInfo.deliveryMode] : "Delivery mode will resolve from class settings later."} title="Delivery mode" />
        <DashboardCard description={isK6TeacherLed ? "No student accounts. Assessment is recorded at class level." : "Future student-account workflow."} title="Progress model" />
      </div>
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-[#17211c]">Lessons</h2>
          <p className="mt-1 text-sm leading-6 text-[#66746d]">
            {isK6TeacherLed
              ? "Available K to Grade 6 lessons for teacher-led delivery."
              : "This class is reserved for the later Grades 7 to 12 student-account workflow."}
          </p>
        </div>
        <div className="grid gap-4">
          {lessons.map((lesson) => (
            <DashboardCard description={lesson.summary} key={lesson.id} title={lesson.title}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-[#66746d]">
                  Lesson {lesson.sequenceOrder}
                  {lesson.estimatedMinutes ? ` - ${lesson.estimatedMinutes} minutes` : ""}
                </p>
                <Button href={`/teacher/classes/${classId}/lessons/${lesson.id}`} variant="secondary">
                  Open lesson
                </Button>
              </div>
            </DashboardCard>
          ))}
        </div>
      </section>
    </Layout>
  );
}
