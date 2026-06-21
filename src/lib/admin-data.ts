import { randomUUID } from "crypto";
import { DELIVERY_MODES, GRADE_BANDS, USER_ROLES, type DeliveryMode, type GradeBand } from "@/lib/constants";
import { createSupabaseClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type Tables = Database["public"]["Tables"];

type SchoolRow = Tables["schools"]["Row"];
type AcademicYearRow = Tables["academic_years"]["Row"];
type ClassRow = Tables["classes"]["Row"];
type ProfileRow = Tables["profiles"]["Row"];
type TeacherProfileRow = Tables["teacher_profiles"]["Row"];
type TeacherClassAssignmentRow = Tables["teacher_class_assignments"]["Row"];

export type AdminDataMode = "supabase" | "local_preview";

export type AdminDataResult<T> = {
  data: T;
  mode: AdminDataMode;
  error: string | null;
};

export type AdminMutationResult = {
  ok: boolean;
  mode: AdminDataMode;
  message: string;
};

export type AdminSchool = {
  id: string;
  name: string;
  region: string | null;
  countryCode: string | null;
  status: string;
};

export type AdminAcademicYear = {
  id: string;
  schoolId: string;
  schoolName: string;
  name: string;
  startsOn: string | null;
  endsOn: string | null;
  isCurrent: boolean;
};

export type AdminTeacher = {
  profileId: string;
  teacherProfileId: string;
  fullName: string;
  email: string | null;
  schoolId: string | null;
  schoolName: string | null;
  supportsKTo6: boolean;
  supportsGrades7To12: boolean;
  authUserId: string | null;
};

export type AdminClass = {
  id: string;
  schoolId: string;
  schoolName: string;
  academicYearId: string | null;
  academicYearName: string | null;
  primaryTeacherId: string | null;
  primaryTeacherName: string | null;
  name: string;
  gradeLevel: number;
  gradeBand: GradeBand;
  deliveryMode: DeliveryMode;
  isActive: boolean;
};

export type AdminTeacherClassAssignment = {
  id: string;
  teacherProfileId: string;
  teacherName: string;
  classId: string;
  className: string;
  assignmentRole: string;
};

let didWarnAboutPreviewMode = false;

const previewSchools: SchoolRow[] = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    name: "CONNECTED MENA Demo School",
    region: "MENA",
    country_code: "AE",
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const previewAcademicYears: AcademicYearRow[] = [
  {
    id: "20000000-0000-4000-8000-000000000001",
    school_id: previewSchools[0].id,
    name: "2026-2027",
    starts_on: "2026-08-24",
    ends_on: "2027-06-18",
    is_current: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const previewProfiles: ProfileRow[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    auth_user_id: null,
    school_id: previewSchools[0].id,
    full_name: "Maya Haddad",
    email: "maya.haddad@example.test",
    role: USER_ROLES.teacher,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const previewTeacherProfiles: TeacherProfileRow[] = [
  {
    profile_id: previewProfiles[0].id,
    supports_k_to_6: true,
    supports_grades_7_to_12: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const previewClasses: ClassRow[] = [
  {
    id: "40000000-0000-4000-8000-000000000001",
    school_id: previewSchools[0].id,
    academic_year_id: previewAcademicYears[0].id,
    primary_teacher_id: previewTeacherProfiles[0].profile_id,
    name: "Grade 1A",
    grade_level: 1,
    grade_band: GRADE_BANDS.kTo6,
    delivery_mode: DELIVERY_MODES.teacherLed,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const previewAssignments: TeacherClassAssignmentRow[] = [
  {
    id: "50000000-0000-4000-8000-000000000001",
    teacher_profile_id: previewTeacherProfiles[0].profile_id,
    class_id: previewClasses[0].id,
    assignment_role: "lead_teacher",
    created_at: new Date().toISOString()
  }
];

function getSupabaseForAdmin(context: string) {
  const supabase = createSupabaseClient();

  if (supabase) {
    console.info(`[CONNECTED MENA] Supabase mode active for admin ${context}.`);
    return supabase;
  }

  if (!didWarnAboutPreviewMode) {
    console.warn(
      `[CONNECTED MENA] Supabase env vars are missing. Admin ${context} is using local preview data. ` +
        "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to test against Supabase."
    );
    didWarnAboutPreviewMode = true;
  }

  return null;
}

function emptyToNull(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function mapSchools(rows: SchoolRow[]): AdminSchool[] {
  return rows.map((school) => ({
    id: school.id,
    name: school.name,
    region: school.region,
    countryCode: school.country_code,
    status: school.status
  }));
}

function schoolNameById(schools: SchoolRow[], schoolId: string | null) {
  return schools.find((school) => school.id === schoolId)?.name ?? null;
}

function academicYearNameById(academicYears: AcademicYearRow[], academicYearId: string | null) {
  return academicYears.find((year) => year.id === academicYearId)?.name ?? null;
}

function teacherNameByProfileId(profiles: ProfileRow[], profileId: string | null) {
  return profiles.find((profile) => profile.id === profileId)?.full_name ?? null;
}

function classNameById(classes: ClassRow[], classId: string) {
  return classes.find((classInfo) => classInfo.id === classId)?.name ?? "Unknown class";
}

function mapAcademicYears(rows: AcademicYearRow[], schools: SchoolRow[]): AdminAcademicYear[] {
  return rows.map((year) => ({
    id: year.id,
    schoolId: year.school_id,
    schoolName: schoolNameById(schools, year.school_id) ?? "Unknown school",
    name: year.name,
    startsOn: year.starts_on,
    endsOn: year.ends_on,
    isCurrent: year.is_current
  }));
}

function mapTeachers(teacherRows: TeacherProfileRow[], profileRows: ProfileRow[], schoolRows: SchoolRow[]): AdminTeacher[] {
  return teacherRows.map((teacher) => {
    const profile = profileRows.find((profileRow) => profileRow.id === teacher.profile_id);

    return {
      profileId: teacher.profile_id,
      teacherProfileId: teacher.profile_id,
      fullName: profile?.full_name ?? "Unknown teacher",
      email: profile?.email ?? null,
      schoolId: profile?.school_id ?? null,
      schoolName: schoolNameById(schoolRows, profile?.school_id ?? null),
      supportsKTo6: teacher.supports_k_to_6,
      supportsGrades7To12: teacher.supports_grades_7_to_12,
      authUserId: profile?.auth_user_id ?? null
    };
  });
}

function mapClasses(classRows: ClassRow[], schoolRows: SchoolRow[], academicYearRows: AcademicYearRow[], profileRows: ProfileRow[]): AdminClass[] {
  return classRows.map((classInfo) => ({
    id: classInfo.id,
    schoolId: classInfo.school_id,
    schoolName: schoolNameById(schoolRows, classInfo.school_id) ?? "Unknown school",
    academicYearId: classInfo.academic_year_id,
    academicYearName: academicYearNameById(academicYearRows, classInfo.academic_year_id),
    primaryTeacherId: classInfo.primary_teacher_id,
    primaryTeacherName: teacherNameByProfileId(profileRows, classInfo.primary_teacher_id),
    name: classInfo.name,
    gradeLevel: classInfo.grade_level,
    gradeBand: classInfo.grade_band,
    deliveryMode: classInfo.delivery_mode,
    isActive: classInfo.is_active
  }));
}

function mapAssignments(assignmentRows: TeacherClassAssignmentRow[], classRows: ClassRow[], profileRows: ProfileRow[]): AdminTeacherClassAssignment[] {
  return assignmentRows.map((assignment) => ({
    id: assignment.id,
    teacherProfileId: assignment.teacher_profile_id,
    teacherName: teacherNameByProfileId(profileRows, assignment.teacher_profile_id) ?? "Unknown teacher",
    classId: assignment.class_id,
    className: classNameById(classRows, assignment.class_id),
    assignmentRole: assignment.assignment_role
  }));
}

async function getAllSchools(modeContext: string): Promise<AdminDataResult<SchoolRow[]>> {
  const supabase = getSupabaseForAdmin(modeContext);

  if (!supabase) {
    return { data: previewSchools, mode: "local_preview", error: null };
  }

  const { data, error } = await supabase.from("schools").select("*").order("name", { ascending: true });

  if (error) {
    return { data: [], mode: "supabase", error: `schools query failed: ${error.message}` };
  }

  return { data: (data ?? []) as SchoolRow[], mode: "supabase", error: null };
}

async function getAllAcademicYears(modeContext: string): Promise<AdminDataResult<AcademicYearRow[]>> {
  const supabase = getSupabaseForAdmin(modeContext);

  if (!supabase) {
    return { data: previewAcademicYears, mode: "local_preview", error: null };
  }

  const { data, error } = await supabase.from("academic_years").select("*").order("starts_on", { ascending: false });

  if (error) {
    return { data: [], mode: "supabase", error: `academic_years query failed: ${error.message}` };
  }

  return { data: (data ?? []) as AcademicYearRow[], mode: "supabase", error: null };
}

async function getAllProfiles(modeContext: string): Promise<AdminDataResult<ProfileRow[]>> {
  const supabase = getSupabaseForAdmin(modeContext);

  if (!supabase) {
    return { data: previewProfiles, mode: "local_preview", error: null };
  }

  const { data, error } = await supabase.from("profiles").select("*").order("full_name", { ascending: true });

  if (error) {
    return { data: [], mode: "supabase", error: `profiles query failed: ${error.message}` };
  }

  return { data: (data ?? []) as ProfileRow[], mode: "supabase", error: null };
}

async function getAllTeacherProfiles(modeContext: string): Promise<AdminDataResult<TeacherProfileRow[]>> {
  const supabase = getSupabaseForAdmin(modeContext);

  if (!supabase) {
    return { data: previewTeacherProfiles, mode: "local_preview", error: null };
  }

  const { data, error } = await supabase.from("teacher_profiles").select("*").order("created_at", { ascending: false });

  if (error) {
    return { data: [], mode: "supabase", error: `teacher_profiles query failed: ${error.message}` };
  }

  return { data: (data ?? []) as TeacherProfileRow[], mode: "supabase", error: null };
}

async function getAllK6Classes(modeContext: string): Promise<AdminDataResult<ClassRow[]>> {
  const supabase = getSupabaseForAdmin(modeContext);

  if (!supabase) {
    return { data: previewClasses, mode: "local_preview", error: null };
  }

  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .eq("grade_band", GRADE_BANDS.kTo6)
    .eq("delivery_mode", DELIVERY_MODES.teacherLed)
    .order("grade_level", { ascending: true });

  if (error) {
    return { data: [], mode: "supabase", error: `classes query failed: ${error.message}` };
  }

  return { data: (data ?? []) as ClassRow[], mode: "supabase", error: null };
}

async function getAllTeacherClassAssignments(modeContext: string): Promise<AdminDataResult<TeacherClassAssignmentRow[]>> {
  const supabase = getSupabaseForAdmin(modeContext);

  if (!supabase) {
    return { data: previewAssignments, mode: "local_preview", error: null };
  }

  const { data, error } = await supabase.from("teacher_class_assignments").select("*").order("created_at", { ascending: false });

  if (error) {
    return { data: [], mode: "supabase", error: `teacher_class_assignments query failed: ${error.message}` };
  }

  return { data: (data ?? []) as TeacherClassAssignmentRow[], mode: "supabase", error: null };
}

export async function getAdminSchoolsResult(): Promise<AdminDataResult<AdminSchool[]>> {
  const schools = await getAllSchools("school list");
  return { data: mapSchools(schools.data), mode: schools.mode, error: schools.error };
}

export async function getAdminAcademicYearsResult(): Promise<AdminDataResult<AdminAcademicYear[]>> {
  const [years, schools] = await Promise.all([getAllAcademicYears("academic year list"), getAllSchools("academic year school lookup")]);

  return {
    data: mapAcademicYears(years.data, schools.data),
    mode: years.mode,
    error: [years.error, schools.error].filter(Boolean).join(" ") || null
  };
}

export async function getAdminTeachersResult(): Promise<AdminDataResult<AdminTeacher[]>> {
  const [teachers, profiles, schools] = await Promise.all([
    getAllTeacherProfiles("teacher list"),
    getAllProfiles("teacher profile lookup"),
    getAllSchools("teacher school lookup")
  ]);

  return {
    data: mapTeachers(teachers.data, profiles.data, schools.data),
    mode: teachers.mode,
    error: [teachers.error, profiles.error, schools.error].filter(Boolean).join(" ") || null
  };
}

export async function getAdminK6ClassesResult(): Promise<AdminDataResult<AdminClass[]>> {
  const [classes, schools, years, profiles] = await Promise.all([
    getAllK6Classes("K to Grade 6 class list"),
    getAllSchools("class school lookup"),
    getAllAcademicYears("class academic year lookup"),
    getAllProfiles("class teacher lookup")
  ]);

  return {
    data: mapClasses(classes.data, schools.data, years.data, profiles.data),
    mode: classes.mode,
    error: [classes.error, schools.error, years.error, profiles.error].filter(Boolean).join(" ") || null
  };
}

export async function getAdminTeacherClassAssignmentsResult(): Promise<AdminDataResult<AdminTeacherClassAssignment[]>> {
  const [assignments, classes, profiles] = await Promise.all([
    getAllTeacherClassAssignments("teacher class assignment list"),
    getAllK6Classes("teacher class assignment class lookup"),
    getAllProfiles("teacher class assignment profile lookup")
  ]);

  return {
    data: mapAssignments(assignments.data, classes.data, profiles.data),
    mode: assignments.mode,
    error: [assignments.error, classes.error, profiles.error].filter(Boolean).join(" ") || null
  };
}

export async function getAdminSetupOptions() {
  const [schools, academicYears, teachers, classes] = await Promise.all([
    getAdminSchoolsResult(),
    getAdminAcademicYearsResult(),
    getAdminTeachersResult(),
    getAdminK6ClassesResult()
  ]);

  return {
    schools,
    academicYears,
    teachers,
    classes
  };
}

export async function createSchool(input: { name: string; region?: string | null; countryCode?: string | null }): Promise<AdminMutationResult> {
  const name = input.name.trim();

  if (!name) {
    return { ok: false, mode: "local_preview", message: "School name is required." };
  }

  const supabase = getSupabaseForAdmin("school creation");
  const payload = {
    name,
    region: emptyToNull(input.region),
    country_code: emptyToNull(input.countryCode)?.toUpperCase() ?? null,
    status: "active"
  };

  if (!supabase) {
    previewSchools.push({ id: randomUUID(), ...payload, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    return { ok: true, mode: "local_preview", message: "Preview school created." };
  }

  const { error } = await supabase.from("schools").insert(payload);

  if (error) {
    return { ok: false, mode: "supabase", message: `schools insert failed: ${error.message}` };
  }

  return { ok: true, mode: "supabase", message: "School created in Supabase." };
}

export async function createAcademicYear(input: {
  schoolId: string;
  name: string;
  startsOn?: string | null;
  endsOn?: string | null;
  isCurrent: boolean;
}): Promise<AdminMutationResult> {
  const schoolId = input.schoolId.trim();
  const name = input.name.trim();

  if (!schoolId || !name) {
    return { ok: false, mode: "local_preview", message: "School and academic year name are required." };
  }

  if (input.startsOn && input.endsOn && input.endsOn < input.startsOn) {
    return { ok: false, mode: "local_preview", message: "End date must be after start date." };
  }

  const supabase = getSupabaseForAdmin("academic year creation");
  const payload = {
    school_id: schoolId,
    name,
    starts_on: emptyToNull(input.startsOn),
    ends_on: emptyToNull(input.endsOn),
    is_current: input.isCurrent
  };

  if (!supabase) {
    previewAcademicYears.push({ id: randomUUID(), ...payload, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    return { ok: true, mode: "local_preview", message: "Preview academic year created." };
  }

  const { error } = await supabase.from("academic_years").insert(payload);

  if (error) {
    return { ok: false, mode: "supabase", message: `academic_years insert failed: ${error.message}` };
  }

  return { ok: true, mode: "supabase", message: "Academic year created in Supabase." };
}

export async function createTeacher(input: { schoolId?: string | null; fullName: string; email?: string | null }): Promise<AdminMutationResult> {
  const fullName = input.fullName.trim();

  if (!fullName) {
    return { ok: false, mode: "local_preview", message: "Teacher name is required." };
  }

  const supabase = getSupabaseForAdmin("teacher creation");
  const profilePayload = {
    auth_user_id: null,
    school_id: emptyToNull(input.schoolId),
    full_name: fullName,
    email: emptyToNull(input.email),
    role: USER_ROLES.teacher,
    is_active: true
  };

  if (!supabase) {
    const profileId = randomUUID();
    const now = new Date().toISOString();
    previewProfiles.push({ id: profileId, ...profilePayload, created_at: now, updated_at: now });
    previewTeacherProfiles.push({ profile_id: profileId, supports_k_to_6: true, supports_grades_7_to_12: false, created_at: now, updated_at: now });
    return { ok: true, mode: "local_preview", message: "Preview teacher created without Supabase Auth." };
  }

  const { data: profile, error: profileError } = await supabase.from("profiles").insert(profilePayload).select("id").single();

  if (profileError || !profile) {
    return { ok: false, mode: "supabase", message: `profiles insert failed: ${profileError?.message ?? "No profile row returned."}` };
  }

  const { error: teacherError } = await supabase.from("teacher_profiles").insert({
    profile_id: profile.id,
    supports_k_to_6: true,
    supports_grades_7_to_12: false
  });

  if (teacherError) {
    return { ok: false, mode: "supabase", message: `teacher_profiles insert failed: ${teacherError.message}` };
  }

  return { ok: true, mode: "supabase", message: "Teacher profile created in Supabase. auth_user_id remains null." };
}

export async function createK6Class(input: {
  schoolId: string;
  academicYearId?: string | null;
  primaryTeacherId?: string | null;
  name: string;
  gradeLevel: number;
}): Promise<AdminMutationResult> {
  const schoolId = input.schoolId.trim();
  const name = input.name.trim();

  if (!schoolId || !name) {
    return { ok: false, mode: "local_preview", message: "School and class name are required." };
  }

  if (!Number.isInteger(input.gradeLevel) || input.gradeLevel < 0 || input.gradeLevel > 6) {
    return { ok: false, mode: "local_preview", message: "K to Grade 6 classes must use grade level 0 through 6." };
  }

  const supabase = getSupabaseForAdmin("K to Grade 6 class creation");
  const payload = {
    school_id: schoolId,
    academic_year_id: emptyToNull(input.academicYearId),
    primary_teacher_id: emptyToNull(input.primaryTeacherId),
    name,
    grade_level: input.gradeLevel,
    grade_band: GRADE_BANDS.kTo6,
    delivery_mode: DELIVERY_MODES.teacherLed,
    is_active: true
  };

  if (!supabase) {
    previewClasses.push({ id: randomUUID(), ...payload, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
    return { ok: true, mode: "local_preview", message: "Preview K to Grade 6 teacher-led class created." };
  }

  const { error } = await supabase.from("classes").insert(payload);

  if (error) {
    return { ok: false, mode: "supabase", message: `classes insert failed: ${error.message}` };
  }

  return { ok: true, mode: "supabase", message: "K to Grade 6 teacher-led class created in Supabase." };
}

export async function createTeacherClassAssignment(input: {
  teacherProfileId: string;
  classId: string;
  assignmentRole?: string | null;
}): Promise<AdminMutationResult> {
  const teacherProfileId = input.teacherProfileId.trim();
  const classId = input.classId.trim();

  if (!teacherProfileId || !classId) {
    return { ok: false, mode: "local_preview", message: "Teacher and class are required." };
  }

  const assignmentRole = emptyToNull(input.assignmentRole) ?? "lead_teacher";
  const supabase = getSupabaseForAdmin("teacher class assignment creation");
  const payload = {
    teacher_profile_id: teacherProfileId,
    class_id: classId,
    assignment_role: assignmentRole
  };

  if (!supabase) {
    const existing = previewAssignments.find((assignment) => assignment.teacher_profile_id === teacherProfileId && assignment.class_id === classId);
    if (!existing) {
      previewAssignments.push({ id: randomUUID(), ...payload, created_at: new Date().toISOString() });
    }
    return { ok: true, mode: "local_preview", message: "Preview teacher class assignment saved." };
  }

  const { error } = await supabase.from("teacher_class_assignments").upsert(payload, {
    onConflict: "class_id,teacher_profile_id"
  });

  if (error) {
    return { ok: false, mode: "supabase", message: `teacher_class_assignments upsert failed: ${error.message}` };
  }

  return { ok: true, mode: "supabase", message: "Teacher class assignment saved in Supabase." };
}
