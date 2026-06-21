import { DashboardCard } from "@/components/DashboardCard";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { createSchoolAction } from "@/app/admin/actions";
import { getAdminSchoolsResult } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

type AdminSchoolsPageProps = {
  searchParams?: Promise<{
    status?: string;
    mode?: string;
    message?: string;
  }>;
};

export default async function AdminSchoolsPage({ searchParams }: AdminSchoolsPageProps) {
  const schoolsResult = await getAdminSchoolsResult();
  const params = await searchParams;
  const message = params?.message ? decodeURIComponent(params.message) : null;

  return (
    <Layout>
      <PageHeader
        description="Internal MVP setup page for creating the school records needed before K to Grade 6 teacher-led classes are assigned."
        eyebrow="Platform admin"
        title="Schools"
      />
      {message ? <DashboardCard description={message} eyebrow={params?.mode} title={params?.status === "error" ? "Setup error" : "Setup saved"} /> : null}
      {schoolsResult.error ? <DashboardCard description={schoolsResult.error} eyebrow={schoolsResult.mode} title="Unable to load schools" /> : null}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <DashboardCard description="Minimum school profile for internal MVP setup." title="Create school">
          <form action={createSchoolAction} className="grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-[#17211c]">
              School name
              <input className="rounded-md border border-[#cad6cf] px-3 py-2 text-sm" name="name" required />
            </label>
            <label className="grid gap-2 text-sm font-medium text-[#17211c]">
              Region
              <input className="rounded-md border border-[#cad6cf] px-3 py-2 text-sm" name="region" placeholder="MENA" />
            </label>
            <label className="grid gap-2 text-sm font-medium text-[#17211c]">
              Country code
              <input className="rounded-md border border-[#cad6cf] px-3 py-2 text-sm uppercase" maxLength={2} name="country_code" placeholder="AE" />
            </label>
            <button className="inline-flex min-h-10 items-center justify-center rounded-md bg-[#116466] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0b4d4f]" type="submit">
              Create school
            </button>
          </form>
        </DashboardCard>
        <DashboardCard description={schoolsResult.data.length > 0 ? `${schoolsResult.data.length} school record(s)` : "No schools yet. Create a school first to unlock academic years, teachers, and classes."} eyebrow={schoolsResult.mode} title="Existing schools">
          <div className="overflow-hidden rounded-md border border-[#dde3dc]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f4f7f4] text-xs uppercase tracking-[0.12em] text-[#66746d]">
                <tr>
                  <th className="px-4 py-3">School</th>
                  <th className="px-4 py-3">Region</th>
                  <th className="px-4 py-3">Country</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dde3dc]">
                {schoolsResult.data.map((school) => (
                  <tr key={school.id}>
                    <td className="px-4 py-3 font-medium text-[#17211c]">{school.name}</td>
                    <td className="px-4 py-3 text-[#66746d]">{school.region ?? "Not set"}</td>
                    <td className="px-4 py-3 text-[#66746d]">{school.countryCode ?? "Not set"}</td>
                    <td className="px-4 py-3 text-[#66746d]">{school.status}</td>
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
