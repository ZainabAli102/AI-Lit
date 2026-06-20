import { DashboardCard } from "@/components/DashboardCard";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";

export default function StudentDashboardPage() {
  return (
    <Layout>
      <PageHeader
        description="Assignments, submissions, feedback, rubrics, and individual progress will be added after authentication and database work."
        eyebrow="Future feature"
        title="Student Dashboard"
      />
      <DashboardCard
        description="Future Grades 7 to 12 feature. No student authentication, assignments, submissions, or individual progress are active in this foundation."
        title="Future Grades 7 to 12 feature"
      />
    </Layout>
  );
}
