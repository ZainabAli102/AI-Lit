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

export type AssessmentSaveResult = {
  mode: "supabase" | "local_preview";
  ok: boolean;
  message: string;
};

export const PREVIEW_TEACHER_PROFILE_ID = "00000000-0000-4000-8000-000000000001";

type TeacherClassAssignmentRow = {
  class_id: string;
};

type ClassRow = {
  id: string;
  name: string;
  grade_level: number;
  grade_band: GradeBand;
  delivery_mode: DeliveryMode;
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

const previewClasses: TeacherClass[] = [
  {
    id: "grade-1a",
    name: "Grade 1A",
    schoolName: "CONNECTED MENA Demo School",
    gradeLevel: 1,
    gradeBand: GRADE_BANDS.kTo6,
    deliveryMode: DELIVERY_MODES.teacherLed,
    teacherName: "Maya Haddad",
    activeLessons: 3
  },
  {
    id: "grade-8b",
    name: "Grade 8B",
    schoolName: "CONNECTED MENA Demo School",
    gradeLevel: 8,
    gradeBand: GRADE_BANDS.grades7To12,
    deliveryMode: DELIVERY_MODES.studentAccount,
    teacherName: "Omar Nasser",
    activeLessons: 2
  }
];

const previewLessons: TeacherLesson[] = [
  {
    id: "ai-everyday-tools",
    title: "AI Around Us",
    summary: "Teacher-led discussion about where students encounter AI in familiar classroom and home contexts.",
    sequenceOrder: 1,
    estimatedMinutes: 35,
    gradeBand: GRADE_BANDS.kTo6
  },
  {
    id: "patterns-and-prompts",
    title: "Patterns and Prompts",
    summary: "A simple class activity for noticing patterns and explaining how instructions change an output.",
    sequenceOrder: 2,
    estimatedMinutes: 40,
    gradeBand: GRADE_BANDS.kTo6
  },
  {
    id: "kind-ai-choices",
    title: "Kind AI Choices",
    summary: "A teacher-led reflection on helpful, fair, and careful choices when using AI tools.",
    sequenceOrder: 3,
    estimatedMinutes: 30,
    gradeBand: GRADE_BANDS.kTo6
  },
  {
    id: "ai-research-skills",
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
    lessonId: "ai-everyday-tools",
    resourceType: "teacher_guide",
    title: "Teacher Guide",
    description: "Opening questions, vocabulary, and facilitation notes for a whole-class K-6 lesson.",
    fileUrl: null,
    content: "Use examples from school life: recommendations, voice assistants, translation, and classroom tools."
  },
  {
    id: "resource-smartboard-ai-around-us",
    lessonId: "ai-everyday-tools",
    resourceType: "smartboard_activity",
    title: "Smartboard Sorting Activity",
    description: "Classifies everyday tools into AI-powered, computer-powered, and human-powered examples.",
    fileUrl: null,
    content: "Prompt students to explain their thinking after each sort."
  },
  {
    id: "resource-assessment-ai-around-us",
    lessonId: "ai-everyday-tools",
    resourceType: "assessment",
    title: "Class Reflection Check",
    description: "Teacher-facing checklist for class-level understanding.",
    fileUrl: null,
    content: "Record whether students could name an AI example and explain why it may use data or patterns."
  },
  {
    id: "resource-worksheet-patterns",
    lessonId: "patterns-and-prompts",
    resourceType: "worksheet",
    title: "Pattern Cards",
    description: "Printable pattern prompts for small-group classroom discussion.",
    fileUrl: null,
    content: "Students complete a pattern and explain the rule aloud."
  },
  {
    id: "resource-support-kind-ai",
    lessonId: "kind-ai-choices",
    resourceType: "support_activity",
    title: "Choice Cards",
    description: "Support activity for discussing fair and careful AI choices.",
    fileUrl: null,
    content: "Read each scenario and ask the class what a careful choice would look like."
  }
];

export async function getTeacherClassesForMvp(teacherProfileId = PREVIEW_TEACHER_PROFILE_ID): Promise<TeacherClass[]> {
  const supabase = createSupabaseClient();

  if (!supabase) {
    return previewClasses;
  }

  const { data: assignments, error: assignmentsError } = await supabase
    .from("teacher_class_assignments")
    .select("class_id")
    .eq("teacher_profile_id", teacherProfileId);

  if (assignmentsError || !assignments?.length) {
    return previewClasses;
  }

  const assignmentRows = assignments as TeacherClassAssignmentRow[];
  const classIds = assignmentRows.map((assignment) => assignment.class_id);
  const { data: classes, error: classesError } = await supabase
    .from("classes")
    .select("id,name,grade_level,grade_band,delivery_mode")
    .in("id", classIds)
    .order("grade_level", { ascending: true });

  if (classesError || !classes?.length) {
    return previewClasses;
  }

  const classRows = classes as ClassRow[];

  return classRows.map((classRow) => ({
    id: classRow.id,
    name: classRow.name,
    schoolName: "School",
    gradeLevel: classRow.grade_level,
    gradeBand: classRow.grade_band,
    deliveryMode: classRow.delivery_mode,
    teacherName: "Teacher",
    activeLessons: previewLessons.filter((lesson) => lesson.gradeBand === classRow.grade_band).length
  }));
}

export async function getTeacherClass(classId: string): Promise<TeacherClass | null> {
  const classes = await getTeacherClassesForMvp();
  return classes.find((classInfo) => classInfo.id === classId) ?? null;
}

export async function getLessonsForClass(classInfo: TeacherClass): Promise<TeacherLesson[]> {
  const supabase = createSupabaseClient();

  if (!supabase) {
    return previewLessons
      .filter((lesson) => lesson.gradeBand === classInfo.gradeBand)
      .sort((a, b) => a.sequenceOrder - b.sequenceOrder);
  }

  const { data, error } = await supabase
    .from("lessons")
    .select("id,title,summary,sequence_order,estimated_minutes,grade_band")
    .eq("grade_band", classInfo.gradeBand)
    .eq("is_active", true)
    .order("sequence_order", { ascending: true });

  if (error || !data?.length) {
    return previewLessons.filter((lesson) => lesson.gradeBand === classInfo.gradeBand);
  }

  const lessonRows = data as LessonRow[];

  return lessonRows.map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    summary: lesson.summary ?? "Lesson summary will be added in the curriculum library.",
    sequenceOrder: lesson.sequence_order,
    estimatedMinutes: lesson.estimated_minutes,
    gradeBand: lesson.grade_band
  }));
}

export async function getLessonForClass(classInfo: TeacherClass, lessonId: string): Promise<TeacherLesson | null> {
  const lessons = await getLessonsForClass(classInfo);
  return lessons.find((lesson) => lesson.id === lessonId) ?? null;
}

export async function getLessonResources(lessonId: string): Promise<LessonResource[]> {
  const supabase = createSupabaseClient();

  if (!supabase) {
    return previewResources.filter((resource) => resource.lessonId === lessonId);
  }

  const { data, error } = await supabase
    .from("lesson_resources")
    .select("id,lesson_id,resource_type,title,description,file_url,content")
    .eq("lesson_id", lessonId)
    .order("resource_type", { ascending: true });

  if (error || !data?.length) {
    return previewResources.filter((resource) => resource.lessonId === lessonId);
  }

  const resourceRows = data as LessonResourceRow[];

  return resourceRows.map((resource) => ({
    id: resource.id,
    lessonId: resource.lesson_id,
    resourceType: resource.resource_type,
    title: resource.title,
    description: resource.description,
    fileUrl: resource.file_url,
    content: resource.content
  }));
}

export async function saveK6ClassLessonAssessment(input: K6AssessmentInput): Promise<AssessmentSaveResult> {
  const supabase = createSupabaseClient();

  if (!supabase) {
    return {
      mode: "local_preview",
      ok: true,
      message: "Assessment captured in local preview mode. It will insert into class_lesson_assessments when Supabase is configured."
    };
  }

  const { error } = await supabase.from("class_lesson_assessments").insert({
    class_id: input.classId,
    lesson_id: input.lessonId,
    teacher_id: input.teacherId,
    objective_met: input.objectiveMet,
    activity_completed: input.activityCompleted,
    students_explained_thinking: input.studentsExplainedThinking,
    students_needing_support: input.studentsNeedingSupport,
    teacher_notes: input.teacherNotes,
    overall_status: input.overallStatus
  });

  if (error) {
    return {
      mode: "supabase",
      ok: false,
      message: error.message
    };
  }

  return {
    mode: "supabase",
    ok: true,
    message: "Assessment saved to class_lesson_assessments."
  };
}
