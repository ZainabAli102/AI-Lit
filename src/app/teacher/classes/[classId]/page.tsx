import { BookOpen, MonitorUp } from "lucide-react";
import { Button } from "@/components/Button";
import { DashboardCard } from "@/components/DashboardCard";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { DELIVERY_MODE_LABELS, GRADE_BAND_LABELS } from "@/lib/constants";
import { sampleClasses } from "@/lib/sample-data";

type ClassDetailPageProps = {
  params: Promise<{
    classId: string;
  }>;
};

export default async function ClassDetailPage({ params }: ClassDetailPageProps) {
  const { classId } = await params;
  const classInfo = sampleClasses.find((item) => item.id === classId);
  const title = classInfo?.name ?? decodeURIComponent(classId);

  return (
    <Layout>
      <PageHeader
        actions={
          <>
            <Button href="/teacher/lessons/sample-lesson" icon={<BookOpen aria-hidden="true" className="h-4 w-4" />} variant="secondary">
              Lesson
            </Button>
            <Button href="/teacher/smartboard/sample-activity" icon={<MonitorUp aria-hidden="true" className="h-4 w-4" />}>
              Smartboard
            </Button>
          </>
        }
        description="Class detail placeholder for lesson pacing, class progress, activity launch, and future delivery-mode logic."
        eyebrow="Teacher workspace"
        title={title}
      />
      <div className="grid gap-5 md:grid-cols-3">
        <DashboardCard description={classInfo ? GRADE_BAND_LABELS[classInfo.gradeBand] : "Grade band will resolve from Supabase later."} title="Grade band" />
        <DashboardCard description={classInfo ? DELIVERY_MODE_LABELS[classInfo.deliveryMode] : "Delivery mode will resolve from class settings later."} title="Delivery mode" />
        <DashboardCard description={classInfo?.progressLabel ?? "Progress model will resolve from class settings later."} title="Progress model" />
      </div>
    </Layout>
  );
}
