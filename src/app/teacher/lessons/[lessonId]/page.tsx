import { ArrowRight } from "lucide-react";
import { Button } from "@/components/Button";
import { DashboardCard } from "@/components/DashboardCard";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { getLessonResourcesResult } from "@/lib/teacher-led-data";

type LessonPageProps = {
  params: Promise<{
    lessonId: string;
  }>;
};

export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonId } = await params;
  const resourcesResult = await getLessonResourcesResult(lessonId);
  const resources = resourcesResult.data;

  return (
    <Layout>
      <PageHeader
        actions={
          <Button href="/teacher/classes" icon={<ArrowRight aria-hidden="true" className="h-4 w-4" />} variant="secondary">
            Choose class
          </Button>
        }
        description="Read-only lesson resources view. To record a K to Grade 6 class assessment, open the lesson from a class page."
        eyebrow="Teacher workspace"
        title={`Lesson: ${decodeURIComponent(lessonId)}`}
      />
      {resourcesResult.error ? (
        <DashboardCard description={resourcesResult.error} eyebrow={resourcesResult.mode} title="Unable to load lesson resources" />
      ) : null}
      <div className="grid gap-5 md:grid-cols-2">
        <DashboardCard description="This route does not know class_id, so it does not write to class_lesson_assessments." title="Read-only lesson view" />
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
