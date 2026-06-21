import { ClassCard } from "@/components/ClassCard";
import { DashboardCard } from "@/components/DashboardCard";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { getTeacherClassesForMvpResult, getTeacherPreviewOptionsResult, PREVIEW_TEACHER_PROFILE_ID } from "@/lib/teacher-led-data";

export const dynamic = "force-dynamic";

type TeacherClassesPageProps = {
  searchParams?: Promise<{
    teacherProfileId?: string;
  }>;
};

export default async function TeacherClassesPage({ searchParams }: TeacherClassesPageProps) {
  const params = await searchParams;
  const selectedTeacherProfileId = params?.teacherProfileId?.trim() || PREVIEW_TEACHER_PROFILE_ID;
  const [teacherOptionsResult, classesResult] = await Promise.all([getTeacherPreviewOptionsResult(), getTeacherClassesForMvpResult(selectedTeacherProfileId)]);
  const classes = classesResult.data;
  const selectedTeacher = teacherOptionsResult.data.find((teacher) => teacher.teacherProfileId === selectedTeacherProfileId);

  return (
    <Layout>
      <PageHeader
        description="Select a teacher profile for internal MVP testing, then load K to Grade 6 teacher-led classes assigned through teacher_class_assignments."
        eyebrow="Teacher workspace"
        title="My Classes"
      />
      {teacherOptionsResult.error ? (
        <DashboardCard description={teacherOptionsResult.error} eyebrow={teacherOptionsResult.mode} title="Unable to load teacher preview selector" />
      ) : null}
      {classesResult.error ? <DashboardCard description={classesResult.error} eyebrow={classesResult.mode} title="Unable to load assigned classes" /> : null}

      <DashboardCard
        description="Internal MVP preview only. Supabase Auth will replace this selector later, so no student or teacher sign-in is active here."
        eyebrow={teacherOptionsResult.mode}
        title="Preview as teacher profile"
      >
        <form className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]" method="get">
          <label className="grid gap-2 text-sm font-medium text-[#17211c]">
            Teacher profile
            <select className="rounded-md border border-[#cad6cf] px-3 py-2 text-sm" defaultValue={selectedTeacherProfileId} name="teacherProfileId">
              {teacherOptionsResult.data.length > 0 ? (
                teacherOptionsResult.data.map((teacher) => (
                  <option key={teacher.teacherProfileId} value={teacher.teacherProfileId}>
                    {teacher.fullName}
                    {teacher.email ? ` - ${teacher.email}` : ""}
                  </option>
                ))
              ) : (
                <option value={selectedTeacherProfileId}>No teacher profiles found</option>
              )}
            </select>
          </label>
          <button className="inline-flex min-h-10 self-end items-center justify-center rounded-md bg-[#116466] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0b4d4f]" type="submit">
            Load classes
          </button>
        </form>
        <p className="mt-4 text-sm leading-6 text-[#66746d]">
          Selected teacher_profile_id: <code>{selectedTeacherProfileId}</code>
          {selectedTeacher ? ` (${selectedTeacher.fullName})` : ""}
        </p>
      </DashboardCard>

      {selectedTeacherProfileId === PREVIEW_TEACHER_PROFILE_ID && !selectedTeacher ? (
        <DashboardCard description="Using the default demo teacher profile ID until another teacher is selected." title="Default teacher preview" />
      ) : null}
      <div className="grid gap-5 lg:grid-cols-2">
        {classes.length > 0 ? (
          classes.map((classInfo) => <ClassCard classInfo={classInfo} key={classInfo.id} teacherProfileId={selectedTeacherProfileId} />)
        ) : (
          <DashboardCard
            description={`No assigned K to Grade 6 teacher-led classes were returned for teacher_profile_id ${selectedTeacherProfileId}. Create a K-6 class and teacher_class_assignments row from the admin setup pages, then reload this selector.`}
            title="No assigned classes"
          />
        )}
      </div>
    </Layout>
  );
}
