import Link from "next/link";
import { DashboardCard } from "@/components/DashboardCard";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { GRADE_BAND_LABELS } from "@/lib/constants";
import { getCurriculumLessonsResult, getCurriculumProgramsResult } from "@/lib/curriculum-data";

export const dynamic = "force-dynamic";

export default async function AdminCurriculumPage() {
  const [programsResult, lessonsResult] = await Promise.all([getCurriculumProgramsResult(), getCurriculumLessonsResult()]);
  const platformReadyLessons = lessonsResult.data.filter((lesson) => lesson.lessonCode).length;

  return (
    <Layout>
      <PageHeader
        description="Read-only MVP 2 curriculum content review. Core curriculum should live inside the platform; only selected classroom materials should be printable."
        eyebrow="Platform admin"
        title="Curriculum Content"
      />
      {programsResult.error || lessonsResult.error ? (
        <DashboardCard description={[programsResult.error, lessonsResult.error].filter(Boolean).join(" ")} eyebrow={programsResult.mode} title="Unable to load curriculum content" />
      ) : null}
      <div className="grid gap-5 md:grid-cols-3">
        <DashboardCard description={`${programsResult.data.length} program record(s)`} eyebrow={programsResult.mode} title="Programs" />
        <DashboardCard description={`${lessonsResult.data.length} lesson record(s)`} eyebrow={lessonsResult.mode} title="Lessons" />
        <DashboardCard description={`${platformReadyLessons} lesson(s) with stable lesson codes`} title="Import readiness" />
      </div>
      <DashboardCard description="Review K to Grade 6 lesson metadata, protected sections, activities, resources, and assessment templates." title="Lesson content review">
        <Link className="text-sm font-semibold text-[#116466]" href="/admin/curriculum/lessons">
          Open lessons
        </Link>
      </DashboardCard>
      <DashboardCard eyebrow="curriculum_programs" title="Programs">
        <div className="grid gap-3">
          {programsResult.data.length > 0 ? (
            programsResult.data.map((program) => (
              <article className="rounded-md border border-[#dde3dc] bg-[#fbfcfa] p-4" key={program.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#116466]">{program.programCode}</p>
                    <h2 className="mt-1 text-base font-semibold text-[#17211c]">{program.title}</h2>
                  </div>
                  <span className="rounded-md border border-[#cad6cf] bg-white px-2 py-1 text-xs font-semibold text-[#42514a]">
                    {GRADE_BAND_LABELS[program.gradeBand]}
                  </span>
                </div>
                <p className="mt-3 text-sm text-[#66746d]">
                  Version {program.version} - {program.status}
                </p>
              </article>
            ))
          ) : (
            <p className="text-sm leading-6 text-[#66746d]">No curriculum_programs rows found. Apply the MVP 2 seed or import content by stable codes.</p>
          )}
        </div>
      </DashboardCard>
    </Layout>
  );
}
