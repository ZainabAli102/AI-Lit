import { DashboardCard } from "@/components/DashboardCard";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";

type SmartboardPageProps = {
  params: Promise<{
    activityId: string;
  }>;
};

export default async function SmartboardPage({ params }: SmartboardPageProps) {
  const { activityId } = await params;

  return (
    <Layout>
      <PageHeader
        description="MVP shell for teacher-led classroom display, prompts, and whole-class participation."
        eyebrow="Teacher workspace"
        title={`Smartboard: ${decodeURIComponent(activityId)}`}
      />
      <DashboardCard description="This screen is ready to host K to Grade 6 teacher-led smartboard activities when activity content is attached." title="Activity canvas">
        <div className="flex aspect-[16/9] min-h-72 items-center justify-center rounded-md border border-dashed border-[#b9c8c0] bg-[#f7faf7] p-6 text-center text-sm font-semibold text-[#66746d]">
          Smartboard activity area
        </div>
      </DashboardCard>
    </Layout>
  );
}
