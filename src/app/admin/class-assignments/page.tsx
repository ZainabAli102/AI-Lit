import { createTeacherClassAssignmentAction } from "@/app/admin/actions";
import { DashboardCard } from "@/components/DashboardCard";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { getAdminK6ClassesResult, getAdminTeacherClassAssignmentsResult, getAdminTeachersResult } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

type AdminClassAssignmentsPageProps = {
  searchParams?: Promise<{
    status?: string;
    mode?: string;
    message?: string;
  }>;
};

export default async function AdminClassAssignmentsPage({ searchParams }: AdminClassAssignmentsPageProps) {
  const [assignmentsResult, teachersResult, classesResult] = await Promise.all([
    getAdminTeacherClassAssignmentsResult(),
    getAdminTeachersResult(),
    getAdminK6ClassesResult()
  ]);
  const params = await searchParams;
  const message = params?.message ? decodeURIComponent(params.message) : null;

  return (
    <Layout>
      <PageHeader
        description="Internal MVP setup page for connecting teachers to K to Grade 6 teacher-led classes through teacher_class_assignments."
        eyebrow="Platform admin"
        title="Class Assignments"
      />
      {message ? <DashboardCard description={message} eyebrow={params?.mode} title={params?.status === "error" ? "Setup error" : "Setup saved"} /> : null}
      {assignmentsResult.error || teachersResult.error || classesResult.error ? (
        <DashboardCard
          description={[assignmentsResult.error, teachersResult.error, classesResult.error].filter(Boolean).join(" ")}
          eyebrow={assignmentsResult.mode}
          title="Unable to load assignment setup data"
        />
      ) : null}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <DashboardCard description="Assignments connect teacher_profiles to classes. This page only lists K to Grade 6 teacher-led classes." title="Assign teacher">
          <form action={createTeacherClassAssignmentAction} className="grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-[#17211c]">
              Teacher
              <select className="rounded-md border border-[#cad6cf] px-3 py-2 text-sm" name="teacher_profile_id" required>
                <option value="">Select a teacher</option>
                {teachersResult.data
                  .filter((teacher) => teacher.supportsKTo6)
                  .map((teacher) => (
                    <option key={teacher.teacherProfileId} value={teacher.teacherProfileId}>
                      {teacher.fullName}
                    </option>
                  ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-[#17211c]">
              K-6 class
              <select className="rounded-md border border-[#cad6cf] px-3 py-2 text-sm" name="class_id" required>
                <option value="">Select a class</option>
                {classesResult.data.map((classInfo) => (
                  <option key={classInfo.id} value={classInfo.id}>
                    {classInfo.name} - {classInfo.schoolName}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-[#17211c]">
              Assignment role
              <input className="rounded-md border border-[#cad6cf] px-3 py-2 text-sm" defaultValue="lead_teacher" name="assignment_role" />
            </label>
            <button className="inline-flex min-h-10 items-center justify-center rounded-md bg-[#116466] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0b4d4f]" type="submit">
              Save assignment
            </button>
          </form>
        </DashboardCard>
        <DashboardCard
          description={assignmentsResult.data.length > 0 ? `${assignmentsResult.data.length} teacher-class assignment record(s)` : "No assignments yet. Select one teacher and one K-6 class to make the class appear in the teacher workflow."}
          eyebrow={assignmentsResult.mode}
          title="Existing assignments"
        >
          <div className="overflow-hidden rounded-md border border-[#dde3dc]">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f4f7f4] text-xs uppercase tracking-[0.12em] text-[#66746d]">
                <tr>
                  <th className="px-4 py-3">Teacher</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dde3dc]">
                {assignmentsResult.data.map((assignment) => (
                  <tr key={assignment.id}>
                    <td className="px-4 py-3 font-medium text-[#17211c]">{assignment.teacherName}</td>
                    <td className="px-4 py-3 text-[#66746d]">{assignment.className}</td>
                    <td className="px-4 py-3 text-[#66746d]">{assignment.assignmentRole}</td>
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
