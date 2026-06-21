import { ArrowRight } from "lucide-react";
import { Button } from "@/components/Button";
import { ClassCard } from "@/components/ClassCard";
import { DashboardCard } from "@/components/DashboardCard";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { getTeacherClassesForMvp } from "@/lib/teacher-led-data";

export const dynamic = "force-dynamic";

export default async function TeacherPage() {
  const classes = await getTeacherClassesForMvp();

  return (
    <Layout>
      <PageHeader
        actions={
          <Button href="/teacher/classes" icon={<ArrowRight aria-hidden="true" className="h-4 w-4" />}>
            Open teacher preview
          </Button>
        }
        description="MVP 1 teacher workspace for K to Grade 6 teacher-led delivery, lesson resources, and class-level assessment."
        eyebrow="Teacher workspace"
        title="Teacher Dashboard"
      />
      <div className="grid gap-5 lg:grid-cols-2">
        {classes.map((classInfo) => (
          <ClassCard classInfo={classInfo} key={classInfo.id} />
        ))}
      </div>
      <DashboardCard
        description="K to Grade 6 uses teacher accounts only. Students do not sign in, and assessment is recorded once per class and lesson."
        eyebrow="Implementation note"
        title="K-6 teacher-led model"
      />
    </Layout>
  );
}
