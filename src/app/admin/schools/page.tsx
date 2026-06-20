import { Button } from "@/components/Button";
import { DashboardCard } from "@/components/DashboardCard";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";

export default function AdminSchoolsPage() {
  return (
    <Layout>
      <PageHeader
        actions={<Button variant="secondary">New school placeholder</Button>}
        description="A future registry for schools, campuses, academic years, and implementation settings."
        eyebrow="Platform admin"
        title="Schools"
      />
      <div className="grid gap-5 md:grid-cols-2">
        <DashboardCard description="Placeholder school profile for setup flows and Supabase-backed records." eyebrow="Sample" title="Dubai Future School" />
        <DashboardCard description="Reserved for subscription, rollout, and curriculum adoption metadata." eyebrow="Sample" title="Riyadh Innovation Academy" />
      </div>
    </Layout>
  );
}
