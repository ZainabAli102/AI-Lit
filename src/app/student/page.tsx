import { Button } from "@/components/Button";
import { DashboardCard } from "@/components/DashboardCard";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";

export default function StudentPage() {
  return (
    <Layout>
      <PageHeader
        actions={<Button href="/student/dashboard" variant="secondary">Open future dashboard</Button>}
        description="Student accounts are reserved for future Grades 7 to 12 workflows."
        eyebrow="Future feature"
        title="Student Area"
      />
      <DashboardCard
        description="This area will later support assignments, submissions, feedback, rubrics, and individual progress for Grades 7 to 12."
        title="Future Grades 7 to 12 feature"
      />
    </Layout>
  );
}
