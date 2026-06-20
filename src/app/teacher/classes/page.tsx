import { ClassCard } from "@/components/ClassCard";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { sampleClasses } from "@/lib/sample-data";

export default function TeacherClassesPage() {
  return (
    <Layout>
      <PageHeader
        description="Teacher class list with sample data for the first implementation foundation."
        eyebrow="Teacher workspace"
        title="My Classes"
      />
      <div className="grid gap-5 lg:grid-cols-2">
        {sampleClasses.map((classInfo) => (
          <ClassCard classInfo={classInfo} key={classInfo.id} />
        ))}
      </div>
    </Layout>
  );
}
