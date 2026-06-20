import { DashboardCard } from "@/components/DashboardCard";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";

export default function AdminReportsPage() {
  return (
    <Layout>
      <PageHeader
        description="Future reporting hub for school rollout health, curriculum progress, and delivery-mode adoption."
        eyebrow="Platform admin"
        title="Reports"
      />
      <div className="grid gap-5 md:grid-cols-3">
        <DashboardCard description="School-level progress summaries will appear here." title="Implementation" />
        <DashboardCard description="Coverage by grade band and curriculum unit." title="Curriculum coverage" />
        <DashboardCard description="Exportable views for leadership and academic teams." title="Leadership reports" />
      </div>
    </Layout>
  );
}
