import { MonitorUp } from "lucide-react";
import { Button } from "@/components/Button";
import { DashboardCard } from "@/components/DashboardCard";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";

type LessonPageProps = {
  params: Promise<{
    lessonId: string;
  }>;
};

export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonId } = await params;

  return (
    <Layout>
      <PageHeader
        actions={
          <Button href="/teacher/smartboard/sample-activity" icon={<MonitorUp aria-hidden="true" className="h-4 w-4" />}>
            Launch activity
          </Button>
        }
        description="Lesson workspace placeholder for objectives, materials, teacher notes, and activity sequencing."
        eyebrow="Teacher workspace"
        title={`Lesson: ${decodeURIComponent(lessonId)}`}
      />
      <div className="grid gap-5 md:grid-cols-2">
        <DashboardCard description="Learning goals, vocabulary, discussion prompts, and preparation notes will appear here." title="Teacher guide" />
        <DashboardCard description="Resources and activity cards will later connect to the curriculum database." title="Lesson materials" />
      </div>
    </Layout>
  );
}
