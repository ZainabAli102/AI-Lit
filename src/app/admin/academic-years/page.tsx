import { createAcademicYearAction } from "@/app/admin/actions";
import { DashboardCard } from "@/components/DashboardCard";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { getAdminAcademicYearsResult, getAdminSchoolsResult } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

type AdminAcademicYearsPageProps = {
  searchParams?: Promise<{
    status?: string;
    mode?: string;
    message?: string;
  }>;
};

export default async function AdminAcademicYearsPage({ searchParams }: AdminAcademicYearsPageProps) {
  const [academicYearsResult, schoolsResult] = await Promise.all([getAdminAcademicYearsResult(), getAdminSchoolsResult()]);
  const params = await searchParams;
  const message = params?.message ? decodeURIComponent(params.message) : null;

  return (
    <Layout>
      <PageHeader
        description="Internal MVP setup page for creating school-linked academic years used by K to Grade 6 teacher-led classes."
        eyebrow="Platform admin"
        title="Academic Years"
      />
      {message ? <DashboardCard description={message} eyebrow={params?.mode} title={params?.status === "error" ? "Setup error" : "Setup saved"} /> : null}
      {academicYearsResult.error || schoolsResult.error ? (
        <DashboardCard description={[academicYearsResult.error, schoolsResult.error].filter(Boolean).join(" ")} eyebrow={academicYearsResult.mode} title="Unable to load setup data" />
      ) : null}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <DashboardCard description="Academic years are linked to a school and can be marked current for setup clarity." title="Create academic year">
          <form action={createAcademicYearAction} className="grid gap-4">
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
              Academic year name
              <input className="rounded-md border border-[#cad6cf] px-3 py-2 text-sm" name="name" placeholder="2026-2027" required />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-[#17211c]">
                Starts on
                <input className="rounded-md border border-[#cad6cf] px-3 py-2 text-sm" name="starts_on" type="date" />
              </label>
              <label className="grid gap-2 text-sm font-medium text-[#17211c]">
                Ends on
                <input className="rounded-md border border-[#cad6cf] px-3 py-2 text-sm" name="ends_on" type="date" />
              </label>
            </div>
            <label className="flex items-center gap-3 text-sm font-medium text-[#17211c]">
              <input className="h-4 w-4 accent-[#116466]" name="is_current" type="checkbox" />
              Mark as current academic year
            </label>
            <button className="inline-flex min-h-10 items-center justify-center rounded-md bg-[#116466] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0b4d4f]" type="submit">
              Create academic year
            </button>
          </form>
        </DashboardCard>
        <DashboardCard
          description={academicYearsResult.data.length > 0 ? `${academicYearsResult.data.length} academic year record(s)` : "No academic years yet. Create one after the school exists."}
          eyebrow={academicYearsResult.mode}
          title="Existing academic years"
        >
          <div className="overflow-hidden rounded-md border border-[#dde3dc]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f4f7f4] text-xs uppercase tracking-[0.12em] text-[#66746d]">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">School</th>
                  <th className="px-4 py-3">Dates</th>
                  <th className="px-4 py-3">Current</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dde3dc]">
                {academicYearsResult.data.map((year) => (
                  <tr key={year.id}>
                    <td className="px-4 py-3 font-medium text-[#17211c]">{year.name}</td>
                    <td className="px-4 py-3 text-[#66746d]">{year.schoolName}</td>
                    <td className="px-4 py-3 text-[#66746d]">
                      {year.startsOn ?? "Not set"} to {year.endsOn ?? "Not set"}
                    </td>
                    <td className="px-4 py-3 text-[#66746d]">{year.isCurrent ? "Yes" : "No"}</td>
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
