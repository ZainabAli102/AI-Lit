import { createK6ClassAction } from "@/app/admin/actions";
import { DashboardCard } from "@/components/DashboardCard";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { DELIVERY_MODE_LABELS, GRADE_BAND_LABELS } from "@/lib/constants";
import { getAdminAcademicYearsResult, getAdminK6ClassesResult, getAdminSchoolsResult, getAdminTeachersResult } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

type AdminClassesPageProps = {
  searchParams?: Promise<{
    status?: string;
    mode?: string;
    message?: string;
  }>;
};

export default async function AdminClassesPage({ searchParams }: AdminClassesPageProps) {
  const [classesResult, schoolsResult, academicYearsResult, teachersResult] = await Promise.all([
    getAdminK6ClassesResult(),
    getAdminSchoolsResult(),
    getAdminAcademicYearsResult(),
    getAdminTeachersResult()
  ]);
  const params = await searchParams;
  const message = params?.message ? decodeURIComponent(params.message) : null;

  return (
    <Layout>
      <PageHeader
        description="Internal MVP setup page for K to Grade 6 classes. Grade band and delivery mode are fixed to the teacher-led model."
        eyebrow="Platform admin"
        title="K to Grade 6 Classes"
      />
      {message ? <DashboardCard description={message} eyebrow={params?.mode} title={params?.status === "error" ? "Setup error" : "Setup saved"} /> : null}
      {classesResult.error || schoolsResult.error || academicYearsResult.error || teachersResult.error ? (
        <DashboardCard
          description={[classesResult.error, schoolsResult.error, academicYearsResult.error, teachersResult.error].filter(Boolean).join(" ")}
          eyebrow={classesResult.mode}
          title="Unable to load class setup data"
        />
      ) : null}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <DashboardCard description="K to Grade 6 setup always saves grade_band k_to_6 and delivery_mode teacher_led." title="Create K-6 class">
          <form action={createK6ClassAction} className="grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-[#17211c]">
              School
              <select className="rounded-md border border-[#cad6cf] px-3 py-2 text-sm" name="school_id" required>
                <option value="">Select a school</option>
                {schoolsResult.data.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-[#17211c]">
              Academic year
              <select className="rounded-md border border-[#cad6cf] px-3 py-2 text-sm" name="academic_year_id">
                <option value="">No academic year selected</option>
                {academicYearsResult.data.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.name} - {year.schoolName}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-[#17211c]">
              Primary teacher
              <select className="rounded-md border border-[#cad6cf] px-3 py-2 text-sm" name="primary_teacher_id">
                <option value="">No primary teacher selected</option>
                {teachersResult.data
                  .filter((teacher) => teacher.supportsKTo6)
                  .map((teacher) => (
                    <option key={teacher.teacherProfileId} value={teacher.teacherProfileId}>
                      {teacher.fullName}
                    </option>
                  ))}
              </select>
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-[#17211c]">
                Class name
                <input className="rounded-md border border-[#cad6cf] px-3 py-2 text-sm" name="name" placeholder="Grade 1A" required />
              </label>
              <label className="grid gap-2 text-sm font-medium text-[#17211c]">
                Grade level
                <select className="rounded-md border border-[#cad6cf] px-3 py-2 text-sm" name="grade_level" required>
                  <option value="0">Kindergarten</option>
                  {[1, 2, 3, 4, 5, 6].map((grade) => (
                    <option key={grade} value={grade}>
                      Grade {grade}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid gap-3 rounded-md border border-[#dde3dc] bg-[#f8faf8] px-3 py-3 text-sm text-[#66746d] md:grid-cols-2">
              <p>{GRADE_BAND_LABELS.k_to_6} only</p>
              <p>{DELIVERY_MODE_LABELS.teacher_led} only</p>
            </div>
            <button className="inline-flex min-h-10 items-center justify-center rounded-md bg-[#116466] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0b4d4f]" type="submit">
              Create K-6 class
            </button>
          </form>
        </DashboardCard>
        <DashboardCard
          description={classesResult.data.length > 0 ? `${classesResult.data.length} K to Grade 6 class record(s)` : "No K-6 teacher-led classes yet. Create a class, then assign a teacher."}
          eyebrow={classesResult.mode}
          title="Existing K-6 classes"
        >
          <div className="overflow-hidden rounded-md border border-[#dde3dc]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f4f7f4] text-xs uppercase tracking-[0.12em] text-[#66746d]">
                <tr>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">School</th>
                  <th className="px-4 py-3">Model</th>
                  <th className="px-4 py-3">Teacher</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dde3dc]">
                {classesResult.data.map((classInfo) => (
                  <tr key={classInfo.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#17211c]">{classInfo.name}</p>
                      <p className="text-xs text-[#66746d]">Grade {classInfo.gradeLevel}</p>
                    </td>
                    <td className="px-4 py-3 text-[#66746d]">{classInfo.schoolName}</td>
                    <td className="px-4 py-3 text-[#66746d]">
                      {classInfo.gradeBand} / {classInfo.deliveryMode}
                    </td>
                    <td className="px-4 py-3 text-[#66746d]">{classInfo.primaryTeacherName ?? "Not set"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardCard>
      </div>
    </Layout>
  );
}
