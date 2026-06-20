import { DashboardCard } from "@/components/DashboardCard";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";

export default function SchoolPage() {
  return (
    <Layout>
      <PageHeader
        description="School administrator and academic coordinator overview for classes, teachers, and implementation progress."
        eyebrow="School workspace"
        title="School Overview"
      />
      <div className="grid gap-5 md:grid-cols-3">
        <DashboardCard description="View class sections and planned delivery modes." title="Classes" />
        <DashboardCard description="Invite and manage teacher accounts once authentication is connected." title="Teachers" />
        <DashboardCard description="Track class-level and future individual progress." title="Progress" />
      </div>
    </Layout>
  );
}
