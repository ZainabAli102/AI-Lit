import { ClassCard } from "@/components/ClassCard";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { getTeacherClassesForMvp } from "@/lib/teacher-led-data";

export default async function TeacherClassesPage() {
  const classes = await getTeacherClassesForMvp();

  return (
    <Layout>
      <PageHeader
        description="Teacher class list based on teacher-class assignments. K to Grade 6 classes remain teacher-led with class-level progress only."
        eyebrow="Teacher workspace"
        title="My Classes"
      />
      <div className="grid gap-5 lg:grid-cols-2">
        {classes.map((classInfo) => (
          <ClassCard classInfo={classInfo} key={classInfo.id} />
        ))}
      </div>
    </Layout>
  );
}
