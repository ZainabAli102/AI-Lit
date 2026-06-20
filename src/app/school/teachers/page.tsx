import { DashboardCard } from "@/components/DashboardCard";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";

export default function SchoolTeachersPage() {
  return (
    <Layout>
      <PageHeader
        description="Teacher directory placeholder for school admins and academic coordinators."
        eyebrow="School workspace"
        title="Teachers"
      />
      <div className="grid gap-5 md:grid-cols-2">
        <DashboardCard description="Assigned to Grade 1A with teacher-led delivery." eyebrow="Sample teacher" title="Maya Haddad" />
        <DashboardCard description="Assigned to Grade 8B with student-account delivery planned." eyebrow="Sample teacher" title="Omar Nasser" />
      </div>
    </Layout>
  );
}
