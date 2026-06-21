import { DELIVERY_MODES, GRADE_BANDS, type DeliveryMode, type GradeBand } from "@/lib/constants";
import { createSupabaseClient } from "@/lib/supabase/client";

export type TeacherClass = {
  id: string;
  name: string;
  schoolName: string;
  gradeLevel: number;
  gradeBand: GradeBand;
  deliveryMode: DeliveryMode;
  teacherName: string;
  activeLessons: number;
};

export type TeacherLesson = {
  id: string;
  title: string;
  summary: string;
  sequenceOrder: number;
  estimatedMinutes: number | null;
  gradeBand: GradeBand;
};

export type LessonResource = {
  id: string;
  lessonId: string;
  resourceType:
    | "teacher_guide"
    | "worksheet"
    | "printable_material"
    | "smartboard_activity"
    | "support_activity"
    | "extension_activity"
    | "assessment"
    | "rubric"
    | "student_activity";
  title: string;
  description: string | null;
  fileUrl: string | null;
  content: string | null;
};

export type K6AssessmentInput = {
  classId: string;
  lessonId: string;
  teacherId: string;
  objectiveMet: "yes" | "partly" | "no";
  activityCompleted: "yes" | "partly" | "no";
  studentsExplainedThinking: "yes" | "partly" | "no";
  studentsNeedingSupport: string | null;
  teacherNotes: string | null;
  overallStatus: "completed" | "needs_review";
};

export type K6Assessment = K6AssessmentInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
};

export type AssessmentSaveResult = {
  mode: "supabase" | "local_preview";
  ok: boolean;
  message: string;
};

export type TeacherDataResult<T> = {
  data: T;
  mode: "supabase" | "local_preview";
  error: string | null;
};

export type TeacherPreviewOption = {
  teacherProfileId: string;
  fullName: string;
  email: string | null;
  supportsKTo6: boolean;
  supportsGrades7To12: boolean;
};

export const PREVIEW_TEACHER_PROFILE_ID = "00000000-0000-4000-8000-000000000001";
export const PREVIEW_K6_CLASS_ID = "40000000-0000-4000-8000-000000000001";
export const PREVIEW_FIRST_K6_LESSON_ID = "30000000-0000-4000-8000-000000000001";

let didWarnAboutPreviewMode = false;

function getSupabaseForTeacherLedFlow(context: string) {
  const supabase = createSupabaseClient();

  if (supabase) {
    console.info(`[CONNECTED MENA] Supabase mode active for ${context}.`);
    return supabase;
  }

  if (!didWarnAboutPreviewMode) {
    console.warn(
      `[CONNECTED MENA] Supabase env vars are missing. ${context} is using local preview data. ` +
        "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to test against Supabase."
    );
    didWarnAboutPreviewMode = true;
  }

  return null;
}

function warnSupabaseIssue(context: string, message: string) {
  console.warn(`[CONNECTED MENA] Supabase MVP smoke-test warning: ${context}. ${message}`);
}

type TeacherClassAssignmentRow = {
  class_id: string;
};

type ClassRow = {
  id: string;
  name: string;
  school_id?: string;
  grade_level: number;
  grade_band: GradeBand;
  delivery_mode: DeliveryMode;
  primary_teacher_id?: string | null;
};

type SchoolRow = {
  id: string;
  name: string;
};

type TeacherProfileRow = {
  profile_id: string;
  supports_k_to_6: boolean;
  supports_grades_7_to_12: boolean;
};

type ProfileRow = {
  id: string;
  full_name: string;
  email: string | null;
};

type LessonRow = {
  id: string;
  title: string;
  summary: string | null;
  sequence_order: number;
  estimated_minutes: number | null;
  grade_band: GradeBand;
};

type LessonResourceRow = {
  id: string;
  lesson_id: string;
  resource_type: LessonResource["resourceType"];
  title: string;
  description: string | null;
  file_url: string | null;
  content: string | null;
};

type K6AssessmentRow = {
  id: string;
  class_id: string;
  lesson_id: string;
  teacher_id: string;
  objective_met: K6AssessmentInput["objectiveMet"];
  activity_completed: K6AssessmentInput["activityCompleted"];
  students_explained_thinking: K6AssessmentInput["studentsExplainedThinking"];
  students_needing_support: string | null;
  teacher_notes: string | null;
  overall_status: K6AssessmentInput["overallStatus"];
  created_at: string;
  updated_at: string;
};

const previewClasses: TeacherClass[] = [
  {
    id: PREVIEW_K6_CLASS_ID,
    name: "Grade 1A",
    schoolName: "CONNECTED MENA Demo School",
    gradeLevel: 1,
    gradeBand: GRADE_BANDS.kTo6,
    deliveryMode: DELIVERY_MODES.teacherLed,
    teacherName: "Maya Haddad",
    activeLessons: 3
  },
  {
    id: "90000000-0000-4000-8000-000000000001",
    name: "Grade 8B",
    schoolName: "CONNECTED MENA Demo School",
    gradeLevel: 8,
    gradeBand: GRADE_BANDS.grades7To12,
    deliveryMode: DELIVERY_MODES.studentAccount,
    teacherName: "Omar Nasser",
    activeLessons: 2
  }
];

const previewTeacherOptions: TeacherPreviewOption[] = [
  {
    teacherProfileId: PREVIEW_TEACHER_PROFILE_ID,
    fullName: "Maya Haddad",
    email: "maya.haddad@example.test",
    supportsKTo6: true,
    supportsGrades7To12: false
  }
];

const previewLessons: TeacherLesson[] = [
  {
    id: PREVIEW_FIRST_K6_LESSON_ID,
    title: "AI Around Us",
    summary: "Teacher-led discussion about where students encounter AI in familiar classroom and home contexts.",
    sequenceOrder: 1,
    estimatedMinutes: 35,
    gradeBand: GRADE_BANDS.kTo6
  },
  {
    id: "30000000-0000-4000-8000-000000000002",
    title: "Patterns and Prompts",
    summary: "A simple class activity for noticing patterns and explaining how instructions change an output.",
    sequenceOrder: 2,
    estimatedMinutes: 40,
    gradeBand: GRADE_BANDS.kTo6
  },
  {
    id: "30000000-0000-4000-8000-000000000003",
    title: "Kind AI Choices",
    summary: "A teacher-led reflection on helpful, fair, and careful choices when using AI tools.",
    sequenceOrder: 3,
    estimatedMinutes: 30,
    gradeBand: GRADE_BANDS.kTo6
  },
  {
    id: "90000000-0000-4000-8000-000000000002",
    title: "AI Research Skills",
    summary: "Future student-account lesson for evaluating AI-supported research outputs.",
    sequenceOrder: 1,
    estimatedMinutes: 45,
    gradeBand: GRADE_BANDS.grades7To12
  }
];

const previewResources: LessonResource[] = [
  {
    id: "resource-teacher-guide-ai-around-us",
    lessonId: PREVIEW_FIRST_K6_LESSON_ID,
    resourceType: "teacher_guide",
    title: "Teacher Guide",
    description: "Opening questions, vocabulary, and facilitation notes for a whole-class K-6 lesson.",
    fileUrl: null,
    content: "Use examples from school life: recommendations, voice assistants, translation, and classroom tools."
  },
  {
    id: "resource-smartboard-ai-around-us",
    lessonId: PREVIEW_FIRST_K6_LESSON_ID,
    resourceType: "smartboard_activity",
    title: "Smartboard Sorting Activity",
    description: "Classifies everyday tools into AI-powered, computer-powered, and human-powered examples.",
    fileUrl: null,
    content: "Prompt students to explain their thinking after each sort."
  },
  {
    id: "resource-assessment-ai-around-us",
    lessonId: PREVIEW_FIRST_K6_LESSON_ID,
    resourceType: "assessment",
    title: "Class Reflection Check",
    description: "Teacher-facing checklist for class-level understanding.",
    fileUrl: null,
    content: "Record whether students could name an AI example and explain why it may use data or patterns."
  },
  {
    id: "resource-worksheet-patterns",
    lessonId: "30000000-0000-4000-8000-000000000002",
    resourceType: "worksheet",
    title: "Pattern Cards",
    description: "Printable pattern prompts for small-group classroom discussion.",
    fileUrl: null,
    content: "Students complete a pattern and explain the rule aloud."
  },
  {
    id: "resource-support-kind-ai",
    lessonId: "30000000-0000-4000-8000-000000000003",
    resourceType: "support_activity",
    title: "Choice Cards",
    description: "Support activity for discussing fair and careful AI choices.",
    fileUrl: null,
    content: "Read each scenario and ask the class what a careful choice would look like."
  }
];

const previewAssessments = new Map<string, K6Assessment>();

function assessmentKey(classId: string, lessonId: string) {
  return `${classId}:${lessonId}`;
}

function mapAssessmentRow(row: K6AssessmentRow): K6Assessment {
  return {
    id: row.id,
    classId: row.class_id,
    lessonId: row.lesson_id,
    teacherId: row.teacher_id,
    objectiveMet: row.objective_met,
    activityCompleted: row.activity_completed,
    studentsExplainedThinking: row.students_explained_thinking,
    studentsNeedingSupport: row.students_needing_support,
    teacherNotes: row.teacher_notes,
    overallStatus: row.overall_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function getTeacherClassesForMvp(teacherProfileId = PREVIEW_TEACHER_PROFILE_ID): Promise<TeacherClass[]> {
  const result = await getTeacherClassesForMvpResult(teacherProfileId);
  return result.data;
}

export async function getTeacherPreviewOptionsResult(): Promise<TeacherDataResult<TeacherPreviewOption[]>> {
  const supabase = getSupabaseForTeacherLedFlow("Teacher preview selector");

  if (!supabase) {
    return { data: previewTeacherOptions, mode: "local_preview", error: null };
  }

  const { data: teacherProfiles, error: teacherProfilesError } = await supabase
    .from("teacher_profiles")
    .select("profile_id,supports_k_to_6,supports_grades_7_to_12")
    .order("created_at", { ascending: true });

  if (teacherProfilesError) {
    warnSupabaseIssue("teacher_profiles query failed", teacherProfilesError.message);
    return { data: [], mode: "supabase", error: `teacher_profiles query failed: ${teacherProfilesError.message}` };
  }

  console.info(`[CONNECTED MENA] teacher_profiles returned ${teacherProfiles?.length ?? 0} row(s) for preview selector.`);

  if (!teacherProfiles?.length) {
    return { data: [], mode: "supabase", error: "No teacher_profiles rows found. Create a teacher in the admin setup flow first." };
  }

  const teacherRows = teacherProfiles as TeacherProfileRow[];
  const profileIds = teacherRows.map((teacher) => teacher.profile_id);
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id,full_name,email")
    .in("id", profileIds)
    .order("full_name", { ascending: true });

  if (profilesError) {
    warnSupabaseIssue("profiles query for teacher selector failed", profilesError.message);
    return { data: [], mode: "supabase", error: `profiles query failed: ${profilesError.message}` };
  }

  const profileRows = (profiles ?? []) as ProfileRow[];

  return {
    data: teacherRows.map((teacher) => {
      const profile = profileRows.find((profileRow) => profileRow.id === teacher.profile_id);

      return {
        teacherProfileId: teacher.profile_id,
        fullName: profile?.full_name ?? "Unknown teacher",
        email: profile?.email ?? null,
        supportsKTo6: teacher.supports_k_to_6,
        supportsGrades7To12: teacher.supports_grades_7_to_12
      };
    }),
    mode: "supabase",
    error: null
  };
}

export async function getTeacherClassesForMvpResult(teacherProfileId = PREVIEW_TEACHER_PROFILE_ID): Promise<TeacherDataResult<TeacherClass[]>> {
  const supabase = getSupabaseForTeacherLedFlow("Teacher class list");

  if (!supabase) {
    if (teacherProfileId !== PREVIEW_TEACHER_PROFILE_ID) {
      return {
        data: [],
        mode: "local_preview",
        error: `No local preview assignments found for teacher_profile_id ${teacherProfileId}.`
      };
    }

    return { data: previewClasses, mode: "local_preview", error: null };
  }

  const { data: assignments, error: assignmentsError } = await supabase
    .from("teacher_class_assignments")
    .select("class_id")
    .eq("teacher_profile_id", teacherProfileId);

  if (assignmentsError) {
    warnSupabaseIssue("teacher_class_assignments query failed", assignmentsError.message);
    return { data: [], mode: "supabase", error: `teacher_class_assignments query failed: ${assignmentsError.message}` };
  }

  console.info(`[CONNECTED MENA] teacher_class_assignments returned ${assignments?.length ?? 0} row(s).`);

  if (!assignments?.length) {
    warnSupabaseIssue("teacher_class_assignments returned no rows", `Seed or assign teacher_profile_id ${teacherProfileId}.`);
    return { data: [], mode: "supabase", error: `No teacher_class_assignments rows found for teacher_profile_id ${teacherProfileId}.` };
  }

  const assignmentRows = assignments as TeacherClassAssignmentRow[];
  const classIds = assignmentRows.map((assignment) => assignment.class_id);
  const { data: classes, error: classesError } = await supabase
    .from("classes")
    .select("id,name,school_id,grade_level,grade_band,delivery_mode,primary_teacher_id")
    .in("id", classIds)
    .order("grade_level", { ascending: true });

  if (classesError) {
    warnSupabaseIssue("classes query failed", classesError.message);
    return { data: [], mode: "supabase", error: `classes query failed: ${classesError.message}` };
  }

  console.info(`[CONNECTED MENA] classes query returned ${classes?.length ?? 0} row(s) for assigned class IDs.`);

  if (!classes?.length) {
    warnSupabaseIssue("classes returned no rows", "Check class IDs from teacher_class_assignments.");
    return { data: [], mode: "supabase", error: "No classes found for the class IDs returned by teacher_class_assignments." };
  }

  const classRows = classes as ClassRow[];
  const schoolIds = Array.from(new Set(classRows.map((classRow) => classRow.school_id).filter(Boolean))) as string[];
  const { data: schools, error: schoolsError } = schoolIds.length
    ? await supabase.from("schools").select("id,name").in("id", schoolIds)
    : { data: [], error: null };
  const { data: teacherProfile, error: teacherProfileError } = await supabase
    .from("profiles")
    .select("id,full_name,email")
    .eq("id", teacherProfileId)
    .maybeSingle();

  if (schoolsError) {
    warnSupabaseIssue("schools query for teacher classes failed", schoolsError.message);
  }

  if (teacherProfileError) {
    warnSupabaseIssue("selected teacher profile lookup failed", teacherProfileError.message);
  }

  const schoolRows = (schools ?? []) as SchoolRow[];
  const selectedTeacher = teacherProfile as ProfileRow | null;
  const gradeBands = Array.from(new Set(classRows.map((classRow) => classRow.grade_band)));
  const { data: lessonCountRows, error: lessonCountError } = await supabase
    .from("lessons")
    .select("grade_band")
    .in("grade_band", gradeBands)
    .eq("is_active", true);

  if (lessonCountError) {
    warnSupabaseIssue("lesson count query failed", lessonCountError.message);
  }

  const lessonCounts = new Map<GradeBand, number>();
  ((lessonCountRows ?? []) as Pick<LessonRow, "grade_band">[]).forEach((lesson) => {
    lessonCounts.set(lesson.grade_band, (lessonCounts.get(lesson.grade_band) ?? 0) + 1);
  });

  return {
    data: classRows.map((classRow) => ({
    id: classRow.id,
    name: classRow.name,
    schoolName: schoolRows.find((school) => school.id === classRow.school_id)?.name ?? "School",
    gradeLevel: classRow.grade_level,
    gradeBand: classRow.grade_band,
    deliveryMode: classRow.delivery_mode,
    teacherName: selectedTeacher?.full_name ?? "Selected teacher",
    activeLessons: lessonCounts.get(classRow.grade_band) ?? 0
    })),
    mode: "supabase",
    error: [lessonCountError ? `lesson count query failed: ${lessonCountError.message}` : null, schoolsError ? `schools query failed: ${schoolsError.message}` : null]
      .filter(Boolean)
      .join(" ") || null
  };
}

export async function getTeacherClass(classId: string): Promise<TeacherClass | null> {
  const result = await getTeacherClassResult(classId);
  return result.data;
}

export async function getTeacherClassResult(classId: string): Promise<TeacherDataResult<TeacherClass | null>> {
  const supabase = getSupabaseForTeacherLedFlow(`Class detail ${classId}`);

  if (!supabase) {
    const previewClass = previewClasses.find((classInfo) => classInfo.id === classId) ?? null;
    return {
      data: previewClass,
      mode: "local_preview",
      error: previewClass ? null : "Class not found."
    };
  }

  const { data, error } = await supabase
    .from("classes")
    .select("id,name,grade_level,grade_band,delivery_mode")
    .eq("id", classId)
    .maybeSingle();

  if (error) {
    warnSupabaseIssue("class detail query failed", error.message);
    return { data: null, mode: "supabase", error: `class detail query failed: ${error.message}` };
  }

  console.info(`[CONNECTED MENA] class query for ${classId} returned ${data ? "1 row" : "0 rows"}.`);

  if (!data) {
    return { data: null, mode: "supabase", error: "Class not found." };
  }

  const classRow = data as ClassRow;
  const lessonsResult = await getLessonsForGradeBand(classRow.grade_band);

  return {
    data: {
      id: classRow.id,
      name: classRow.name,
      schoolName: "School",
      gradeLevel: classRow.grade_level,
      gradeBand: classRow.grade_band,
      deliveryMode: classRow.delivery_mode,
      teacherName: "Teacher",
      activeLessons: lessonsResult.data.length
    },
    mode: "supabase",
    error: lessonsResult.error
  };
}

export async function getLessonsForClass(classInfo: TeacherClass): Promise<TeacherLesson[]> {
  const result = await getLessonsForClassResult(classInfo);
  return result.data;
}

export async function getLessonsForClassResult(classInfo: TeacherClass): Promise<TeacherDataResult<TeacherLesson[]>> {
  return getLessonsForGradeBand(classInfo.gradeBand);
}

async function getLessonsForGradeBand(gradeBand: GradeBand): Promise<TeacherDataResult<TeacherLesson[]>> {
  const supabase = getSupabaseForTeacherLedFlow("Class lessons");

  if (!supabase) {
    return {
      data: previewLessons
        .filter((lesson) => lesson.gradeBand === gradeBand)
        .sort((a, b) => a.sequenceOrder - b.sequenceOrder),
      mode: "local_preview",
      error: null
    };
  }

  const { data, error } = await supabase
    .from("lessons")
    .select("id,title,summary,sequence_order,estimated_minutes,grade_band")
    .eq("grade_band", gradeBand)
    .eq("is_active", true)
    .order("sequence_order", { ascending: true });

  if (error) {
    warnSupabaseIssue("lessons query failed", error.message);
    return { data: [], mode: "supabase", error: `lessons query failed: ${error.message}` };
  }

  console.info(`[CONNECTED MENA] lessons query returned ${data?.length ?? 0} row(s) for grade_band ${gradeBand}.`);

  if (!data?.length) {
    warnSupabaseIssue("lessons returned no rows", `Seed lessons with grade_band = ${gradeBand}.`);
    return { data: [], mode: "supabase", error: `No lessons found for grade_band ${gradeBand}.` };
  }

  const lessonRows = data as LessonRow[];

  return {
    data: lessonRows.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      summary: lesson.summary ?? "Lesson summary will be added in the curriculum library.",
      sequenceOrder: lesson.sequence_order,
      estimatedMinutes: lesson.estimated_minutes,
      gradeBand: lesson.grade_band
    })),
    mode: "supabase",
    error: null
  };
}

export async function getLessonForClass(classInfo: TeacherClass, lessonId: string): Promise<TeacherLesson | null> {
  const lessons = await getLessonsForClass(classInfo);
  return lessons.find((lesson) => lesson.id === lessonId) ?? null;
}

export async function getLessonResources(lessonId: string): Promise<LessonResource[]> {
  const result = await getLessonResourcesResult(lessonId);
  return result.data;
}

export async function getLessonResourcesResult(lessonId: string): Promise<TeacherDataResult<LessonResource[]>> {
  const supabase = getSupabaseForTeacherLedFlow("Lesson resources");

  if (!supabase) {
    return {
      data: previewResources.filter((resource) => resource.lessonId === lessonId),
      mode: "local_preview",
      error: null
    };
  }

  const { data, error } = await supabase
    .from("lesson_resources")
    .select("id,lesson_id,resource_type,title,description,file_url,content")
    .eq("lesson_id", lessonId)
    .order("resource_type", { ascending: true });

  if (error) {
    warnSupabaseIssue("lesson_resources query failed", error.message);
    return { data: [], mode: "supabase", error: `lesson_resources query failed: ${error.message}` };
  }

  console.info(`[CONNECTED MENA] lesson_resources query returned ${data?.length ?? 0} row(s) for lesson_id ${lessonId}.`);

  if (!data?.length) {
    warnSupabaseIssue("lesson_resources returned no rows", `Seed resources for lesson_id ${lessonId}.`);
    return { data: [], mode: "supabase", error: `No lesson_resources found for lesson_id ${lessonId}.` };
  }

  const resourceRows = data as LessonResourceRow[];

  return {
    data: resourceRows.map((resource) => ({
      id: resource.id,
      lessonId: resource.lesson_id,
      resourceType: resource.resource_type,
      title: resource.title,
      description: resource.description,
      fileUrl: resource.file_url,
      content: resource.content
    })),
    mode: "supabase",
    error: null
  };
}

export async function getK6ClassLessonAssessment(classId: string, lessonId: string): Promise<TeacherDataResult<K6Assessment | null>> {
  const supabase = getSupabaseForTeacherLedFlow("K to Grade 6 assessment lookup");

  if (!supabase) {
    return {
      data: previewAssessments.get(assessmentKey(classId, lessonId)) ?? null,
      mode: "local_preview",
      error: null
    };
  }

  const { data, error } = await supabase
    .from("class_lesson_assessments")
    .select(
      "id,class_id,lesson_id,teacher_id,objective_met,activity_completed,students_explained_thinking,students_needing_support,teacher_notes,overall_status,created_at,updated_at"
    )
    .eq("class_id", classId)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (error) {
    warnSupabaseIssue("class_lesson_assessments lookup failed", error.message);
    return { data: null, mode: "supabase", error: `class_lesson_assessments lookup failed: ${error.message}` };
  }

  console.info(`[CONNECTED MENA] class_lesson_assessments lookup returned ${data ? "1 row" : "0 rows"} for class ${classId}, lesson ${lessonId}.`);

  return {
    data: data ? mapAssessmentRow(data as K6AssessmentRow) : null,
    mode: "supabase",
    error: null
  };
}

export async function saveK6ClassLessonAssessment(input: K6AssessmentInput): Promise<AssessmentSaveResult> {
  const supabase = getSupabaseForTeacherLedFlow("K to Grade 6 assessment save");

  if (!supabase) {
    const now = new Date().toISOString();
    const key = assessmentKey(input.classId, input.lessonId);
    const existing = previewAssessments.get(key);

    previewAssessments.set(key, {
      id: existing?.id ?? `preview-${key}`,
      ...input,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now
    });

    return {
      mode: "local_preview",
      ok: true,
      message: "Assessment saved in local preview mode as the current class lesson assessment."
    };
  }

  const { error } = await supabase.from("class_lesson_assessments").upsert({
    class_id: input.classId,
    lesson_id: input.lessonId,
    teacher_id: input.teacherId,
    objective_met: input.objectiveMet,
    activity_completed: input.activityCompleted,
    students_explained_thinking: input.studentsExplainedThinking,
    students_needing_support: input.studentsNeedingSupport,
    teacher_notes: input.teacherNotes,
    overall_status: input.overallStatus
  }, {
    onConflict: "class_id,lesson_id"
  });

  if (error) {
    warnSupabaseIssue("class_lesson_assessments upsert failed", error.message);
    return {
      mode: "supabase",
      ok: false,
      message: error.message
    };
  }

  return {
    mode: "supabase",
    ok: true,
    message: "Current class lesson assessment saved to class_lesson_assessments."
  };
}
