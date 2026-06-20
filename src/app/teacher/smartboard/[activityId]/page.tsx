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
        description="Smartboard placeholder for teacher-led classroom display, activities, prompts, and whole-class participation."
        eyebrow="Teacher workspace"
        title={`Smartboard: ${decodeURIComponent(activityId)}`}
      />
      <DashboardCard description="Interactive activity content will be added later. This screen is ready for teacher-led K to Grade 6 delivery." title="Activity canvas placeholder">
        <div className="flex aspect-[16/9] min-h-72 items-center justify-center rounded-md border border-dashed border-[#b9c8c0] bg-[#f7faf7] p-6 text-center text-sm font-semibold text-[#66746d]">
          Smartboard activity area
        </div>
      </DashboardCard>
    </Layout>
  );
}
