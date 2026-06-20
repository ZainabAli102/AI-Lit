import { ClassCard } from "@/components/ClassCard";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { sampleClasses } from "@/lib/sample-data";

export default function SchoolClassesPage() {
  return (
    <Layout>
      <PageHeader
        description="Sample class sections showing how K to Grade 6 and Grades 7 to 12 delivery modes will coexist."
        eyebrow="School workspace"
        title="Classes"
      />
      <div className="grid gap-5 lg:grid-cols-2">
        {sampleClasses.map((classInfo) => (
          <ClassCard classInfo={classInfo} key={classInfo.id} />
        ))}
      </div>
    </Layout>
  );
}
