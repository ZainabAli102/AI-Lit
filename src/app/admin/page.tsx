import Link from "next/link";
import { DashboardCard } from "@/components/DashboardCard";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { USER_ROLE_LABELS, USER_ROLES } from "@/lib/constants";
import { getAdminAcademicYearsResult, getAdminK6ClassesResult, getAdminSchoolsResult, getAdminTeacherClassAssignmentsResult, getAdminTeachersResult } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const roles = Object.values(USER_ROLES);
  const [schools, years, teachers, classes, assignments] = await Promise.all([
    getAdminSchoolsResult(),
    getAdminAcademicYearsResult(),
    getAdminTeachersResult(),
    getAdminK6ClassesResult(),
    getAdminTeacherClassAssignmentsResult()
  ]);
  const setupError = [schools.error, years.error, teachers.error, classes.error, assignments.error].filter(Boolean).join(" ") || null;

  return (
    <Layout>
      <PageHeader
        description="Internal MVP setup workspace for creating the school, academic year, teacher, class, and assignment records needed for K to Grade 6 teacher-led implementation."
        eyebrow="Platform admin"
        title="CONNECTED MENA Admin"
      />
      {setupError ? <DashboardCard description={setupError} eyebrow={schools.mode} title="Setup data notice" /> : null}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <DashboardCard description={`${schools.data.length} school record(s)`} title="Schools">
          <Link className="text-sm font-semibold text-[#116466]" href="/admin/schools">
            Manage schools
          </Link>
        </DashboardCard>
        <DashboardCard description={`${years.data.length} academic year record(s)`} title="Academic years">
          <Link className="text-sm font-semibold text-[#116466]" href="/admin/academic-years">
            Manage academic years
          </Link>
        </DashboardCard>
        <DashboardCard description={`${teachers.data.length} teacher profile record(s)`} title="Teachers">
          <Link className="text-sm font-semibold text-[#116466]" href="/admin/teachers">
            Manage teachers
          </Link>
        </DashboardCard>
        <DashboardCard description={`${classes.data.length} K to Grade 6 teacher-led class record(s)`} title="Classes">
          <Link className="text-sm font-semibold text-[#116466]" href="/admin/classes">
            Manage classes
          </Link>
        </DashboardCard>
        <DashboardCard description={`${assignments.data.length} teacher-class assignment record(s)`} title="Class assignments">
          <Link className="text-sm font-semibold text-[#116466]" href="/admin/class-assignments">
            Manage assignments
          </Link>
        </DashboardCard>
        <DashboardCard description="Map curriculum units, lesson sequences, and implementation expectations." title="Curriculum">
          <Link className="text-sm font-semibold text-[#116466]" href="/admin/curriculum">
            View curriculum
          </Link>
        </DashboardCard>
      </div>
      <DashboardCard eyebrow="Prepared constants" title="User roles">
        <div className="grid gap-3 md:grid-cols-2">
          {roles.map((role) => (
            <div className="rounded-md border border-[#dde3dc] bg-[#fbfcfa] px-4 py-3" key={role}>
              <p className="text-sm font-semibold text-[#17211c]">{USER_ROLE_LABELS[role]}</p>
              <code className="mt-1 block text-xs text-[#66746d]">{role}</code>
            </div>
          ))}
        </div>
      </DashboardCard>
    </Layout>
  );
}
