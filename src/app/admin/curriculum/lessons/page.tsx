import Link from "next/link";
import { DashboardCard } from "@/components/DashboardCard";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { GRADE_BAND_LABELS } from "@/lib/constants";
import { getCurriculumLessonsResult } from "@/lib/curriculum-data";

export const dynamic = "force-dynamic";

export default async function AdminCurriculumLessonsPage() {
  const lessonsResult = await getCurriculumLessonsResult();

  return (
    <Layout>
      <PageHeader
        description="Read-only review of lesson metadata and stable import codes. Full curriculum editing is intentionally not active yet."
        eyebrow="Platform admin"
        title="Curriculum Lessons"
      />
      {lessonsResult.error ? <DashboardCard description={lessonsResult.error} eyebrow={lessonsResult.mode} title="Unable to load lessons" /> : null}
      <DashboardCard description={`${lessonsResult.data.length} lesson record(s)`} eyebrow={lessonsResult.mode} title="Lesson library">
        <div className="overflow-hidden rounded-md border border-[#dde3dc]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f4f7f4] text-xs uppercase tracking-[0.12em] text-[#66746d]">
              <tr>
                <th className="px-4 py-3">Lesson</th>
                <th className="px-4 py-3">Grade</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#dde3dc]">
              {lessonsResult.data.map((lesson) => (
                <tr key={lesson.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#17211c]">{lesson.title}</p>
                    <p className="text-xs text-[#66746d]">{lesson.displayCode ?? lesson.lessonCode ?? "No lesson_code"}</p>
                  </td>
                  <td className="px-4 py-3 text-[#66746d]">
                    {GRADE_BAND_LABELS[lesson.gradeBand]}
                    {lesson.gradeLevel !== null ? ` - Grade ${lesson.gradeLevel}` : ""}
                  </td>
                  <td className="px-4 py-3 text-[#66746d]">{lesson.unitTitle ?? "Not linked"}</td>
                  <td className="px-4 py-3 text-[#66746d]">{lesson.status}</td>
                  <td className="px-4 py-3">
                    <Link className="text-sm font-semibold text-[#116466]" href={`/admin/curriculum/lessons/${lesson.id}`}>
                      Open
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {lessonsResult.data.length === 0 ? (
          <p className="mt-4 text-sm leading-6 text-[#66746d]">No lessons found. Apply the MVP 2 demo seed or import curriculum content using stable lesson codes.</p>
        ) : null}
      </DashboardCard>
    </Layout>
  );
}
