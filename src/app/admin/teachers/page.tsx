import { createTeacherAction } from "@/app/admin/actions";
import { DashboardCard } from "@/components/DashboardCard";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { getAdminSchoolsResult, getAdminTeachersResult } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

type AdminTeachersPageProps = {
  searchParams?: Promise<{
    status?: string;
    mode?: string;
    message?: string;
  }>;
};

export default async function AdminTeachersPage({ searchParams }: AdminTeachersPageProps) {
  const [teachersResult, schoolsResult] = await Promise.all([getAdminTeachersResult(), getAdminSchoolsResult()]);
  const params = await searchParams;
  const message = params?.message ? decodeURIComponent(params.message) : null;

  return (
    <Layout>
      <PageHeader
        description="Internal MVP setup page for creating teacher profiles without Supabase Auth. auth_user_id remains empty until authentication is enabled later."
        eyebrow="Platform admin"
        title="Teachers"
      />
      {message ? <DashboardCard description={message} eyebrow={params?.mode} title={params?.status === "error" ? "Setup error" : "Setup saved"} /> : null}
      {teachersResult.error || schoolsResult.error ? (
        <DashboardCard description={[teachersResult.error, schoolsResult.error].filter(Boolean).join(" ")} eyebrow={teachersResult.mode} title="Unable to load teacher setup data" />
      ) : null}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <DashboardCard description="Creates a profiles row with role teacher, then a linked teacher_profiles row." title="Create teacher">
          <form action={createTeacherAction} className="grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-[#17211c]">
              School
              <select className="rounded-md border border-[#cad6cf] px-3 py-2 text-sm" name="school_id">
                <option value="">No school selected</option>
                {schoolsResult.data.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-[#17211c]">
              Full name
              <input className="rounded-md border border-[#cad6cf] px-3 py-2 text-sm" name="full_name" required />
            </label>
            <label className="grid gap-2 text-sm font-medium text-[#17211c]">
              Email
              <input className="rounded-md border border-[#cad6cf] px-3 py-2 text-sm" name="email" type="email" />
            </label>
            <div className="rounded-md border border-[#dde3dc] bg-[#f8faf8] px-3 py-3 text-sm text-[#66746d]">
              MVP 1 creates K to Grade 6-capable teachers only. Supabase Auth is not connected yet.
            </div>
            <button className="inline-flex min-h-10 items-center justify-center rounded-md bg-[#116466] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0b4d4f]" type="submit">
              Create teacher
            </button>
          </form>
        </DashboardCard>
        <DashboardCard
          description={teachersResult.data.length > 0 ? `${teachersResult.data.length} teacher profile record(s)` : "No teachers yet. Create a teacher before assigning classes."}
          eyebrow={teachersResult.mode}
          title="Existing teachers"
        >
          <div className="overflow-hidden rounded-md border border-[#dde3dc]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f4f7f4] text-xs uppercase tracking-[0.12em] text-[#66746d]">
                <tr>
                  <th className="px-4 py-3">Teacher</th>
                  <th className="px-4 py-3">School</th>
                  <th className="px-4 py-3">K-6</th>
                  <th className="px-4 py-3">Auth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dde3dc]">
                {teachersResult.data.map((teacher) => (
                  <tr key={teacher.teacherProfileId}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#17211c]">{teacher.fullName}</p>
                      <p className="text-xs text-[#66746d]">{teacher.email ?? "No email"}</p>
                    </td>
                    <td className="px-4 py-3 text-[#66746d]">{teacher.schoolName ?? "Not set"}</td>
                    <td className="px-4 py-3 text-[#66746d]">{teacher.supportsKTo6 ? "Yes" : "No"}</td>
                    <td className="px-4 py-3 text-[#66746d]">{teacher.authUserId ? "Linked" : "Not active"}</td>
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
