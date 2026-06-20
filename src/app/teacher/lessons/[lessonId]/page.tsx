import { MonitorUp } from "lucide-react";
import { Button } from "@/components/Button";
import { DashboardCard } from "@/components/DashboardCard";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { getLessonResources } from "@/lib/teacher-led-data";

type LessonPageProps = {
  params: Promise<{
    lessonId: string;
  }>;
};

export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonId } = await params;
  const resources = await getLessonResources(lessonId);

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
        <DashboardCard description="Resources are read from lesson_resources when Supabase is configured, with local preview resources available now." title="Lesson materials">
          <div className="space-y-3">
            {resources.length > 0 ? (
              resources.map((resource) => (
                <div className="rounded-md border border-[#dde3dc] bg-[#fbfcfa] p-3" key={resource.id}>
                  <p className="text-sm font-semibold text-[#17211c]">{resource.title}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-[#116466]">{resource.resourceType}</p>
                </div>
              ))
            ) : (
              <p className="text-sm leading-6 text-[#66746d]">No lesson resources found.</p>
            )}
          </div>
        </DashboardCard>
      </div>
    </Layout>
  );
}
