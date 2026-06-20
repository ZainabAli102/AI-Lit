import { ArrowRight } from "lucide-react";
import { Button } from "@/components/Button";
import { ClassCard } from "@/components/ClassCard";
import { DashboardCard } from "@/components/DashboardCard";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { sampleClasses } from "@/lib/sample-data";

export default function TeacherPage() {
  return (
    <Layout>
      <PageHeader
        actions={
          <Button href="/teacher/classes" icon={<ArrowRight aria-hidden="true" className="h-4 w-4" />}>
            View classes
          </Button>
        }
        description="Teacher workspace for lesson delivery, class progress, smartboard activities, and future student-account workflows."
        eyebrow="Teacher workspace"
        title="Teacher Dashboard"
      />
      <div className="grid gap-5 lg:grid-cols-2">
        {sampleClasses.map((classInfo) => (
          <ClassCard classInfo={classInfo} key={classInfo.id} />
        ))}
      </div>
      <DashboardCard
        description="Teacher-led classes focus on whole-class delivery and class-level progress. Student-account classes will later unlock assignments, submissions, rubrics, and individual feedback."
        eyebrow="Implementation note"
        title="Two delivery modes, one school platform"
      />
    </Layout>
  );
}
