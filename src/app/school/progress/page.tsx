import { DashboardCard } from "@/components/DashboardCard";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";

export default function SchoolProgressPage() {
  return (
    <Layout>
      <PageHeader
        description="Progress placeholders for class-level tracking now and individual student progress later."
        eyebrow="School workspace"
        title="Progress"
      />
      <div className="grid gap-5 md:grid-cols-2">
        <DashboardCard description="K to Grade 6 progress will be captured by class and teacher-led activity completion." title="Class-level progress" />
        <DashboardCard description="Grades 7 to 12 progress will expand to assignments, submissions, feedback, and rubrics." title="Individual progress" />
      </div>
    </Layout>
  );
}
