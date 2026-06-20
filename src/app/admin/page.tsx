import { DashboardCard } from "@/components/DashboardCard";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { USER_ROLE_LABELS, USER_ROLES } from "@/lib/constants";

export default function AdminPage() {
  const roles = Object.values(USER_ROLES);

  return (
    <Layout>
      <PageHeader
        description="Top-level workspace for CONNECTED MENA operations, school setup, curriculum visibility, and implementation reporting."
        eyebrow="Platform admin"
        title="CONNECTED MENA Admin"
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <DashboardCard description="Create and manage partner school records when Supabase tables are added." title="Schools" />
        <DashboardCard description="Map curriculum units, lesson sequences, and implementation expectations." title="Curriculum" />
        <DashboardCard description="Aggregate school, class, and grade-band progress once data exists." title="Reports" />
      </div>
      <DashboardCard eyebrow="Prepared constants" title="User roles">
        <div className="grid gap-3 md:grid-cols-2">
          {roles.map((role) => (
            <div className="rounded-md border border-[#dde3dc] bg-[#fbfcfa] px-4 py-3" key={role}>
              <p className="text-sm font-semibold text-[#17211c]">{USER_ROLE_LABELS[role]}</p>
              <code className="mt-1 block text-xs text-[#66746d]">{role}</code>
            </div>
          ))}
        </div>
      </DashboardCard>
    </Layout>
  );
}
