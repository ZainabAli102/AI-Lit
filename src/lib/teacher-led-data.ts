import { DELIVERY_MODES, GRADE_BANDS, type DeliveryMode, type GradeBand } from "@/lib/constants";
import { createSupabaseClient } from "@/lib/supabase/client";
import type { Database, Json } from "@/types/database";

type ContentAccessType = Database["public"]["Enums"]["content_access_type"];
type LessonSectionType = Database["public"]["Enums"]["lesson_section_type"];

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
  lessonCode: string | null;
  title: string;
  summary: string;
  sequenceOrder: number;
  estimatedMinutes: number | null;
  durationMinutes: number | null;
  gradeBand: GradeBand;
  gradeLevel: number | null;
  learningObjectives: string | null;
  essentialQuestion: string | null;
  materialsNeeded: string | null;
  vocabulary: string | null;
  teacherPrepNotes: string | null;
  contentVersion: string;
};

export type LessonResource = {
  id: string;
  lessonId: string;
  resourceCode: string | null;
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
  accessType: ContentAccessType;
  visibility: string;
  isPrintable: boolean;
  isDownloadable: boolean;
  storagePath: string | null;
  mimeType: string | null;
  estimatedPages: number | null;
  displayMode: string;
  sortOrder: number;
};

export type LessonSection = {
  id: string;
  lessonId: string;
  sectionCode: string | null;
  sectionType: LessonSectionType;
  title: string;
  content: string | null;
  contentJson: Json;
  sequenceOrder: number;
  accessType: ContentAccessType;
  estimatedMinutes: number | null;
};

export type LessonActivity = {
  id: string;
  lessonId: string;
  activityCode: string | null;
  title: string;
  activityType: string;
  deliveryMode: DeliveryMode;
  accessType: ContentAccessType;
  isSmartboardReady: boolean;
  instructions: string | null;
  activityJson: Json;
  sequenceOrder: number;
};

export type AssessmentTemplate = {
  id: string;
  lessonId: string;
  templateCode: string | null;
  title: string;
  description: string | null;
  assessmentType: string;
  criteriaJson: Json;
  accessType: ContentAccessType;
  sequenceOrder: number;
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
  lesson_code: string | null;
  title: string;
  summary: string | null;
  sequence_order: number;
  estimated_minutes: number | null;
  duration_minutes: number | null;
  grade_band: GradeBand;
  grade_level: number | null;
  learning_objectives: string | null;
  essential_question: string | null;
  materials_needed: string | null;
  vocabulary: string | null;
  teacher_prep_notes: string | null;
  content_version: string;
};

type LessonResourceRow = {
  id: string;
  lesson_id: string;
  resource_code: string | null;
  resource_type: LessonResource["resourceType"];
  title: string;
  description: string | null;
  file_url: string | null;
  content: string | null;
  access_type: ContentAccessType;
  visibility: string;
  is_printable: boolean;
  is_downloadable: boolean;
  storage_path: string | null;
  mime_type: string | null;
  estimated_pages: number | null;
  display_mode: string;
  sort_order: number;
};

type LessonSectionRow = {
  id: string;
  lesson_id: string;
  section_code: string | null;
  section_type: LessonSectionType;
  title: string;
  content: string | null;
  content_json: Json;
  sequence_order: number;
  access_type: ContentAccessType;
  estimated_minutes: number | null;
};

type LessonActivityRow = {
  id: string;
  lesson_id: string;
  activity_code: string | null;
  title: string;
  activity_type: string;
  delivery_mode: DeliveryMode;
  access_type: ContentAccessType;
  is_smartboard_ready: boolean;
  instructions: string | null;
  activity_json: Json;
  sequence_order: number;
};

type AssessmentTemplateRow = {
  id: string;
  lesson_id: string;
  template_code: string | null;
  title: string;
  description: string | null;
  assessment_type: string;
  criteria_json: Json;
  access_type: ContentAccessType;
  sequence_order: number;
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
    lessonCode: "CM-AIL-G1-U1-L1",
    title: "AI Around Us",
    summary: "Teacher-led discussion about where students encounter AI in familiar classroom and home contexts.",
    sequenceOrder: 1,
    estimatedMinutes: 35,
    durationMinutes: 35,
    gradeBand: GRADE_BANDS.kTo6,
    gradeLevel: 1,
    learningObjectives: "Students identify familiar AI-powered tools and explain that AI can use patterns or data to help people.",
    essentialQuestion: "Where do we see AI around us?",
    materialsNeeded: "Smartboard, sorting cards, teacher checklist, optional printable reflection sheet.",
    vocabulary: "AI, pattern, data, tool, choice",
    teacherPrepNotes: "Use familiar classroom and home examples. Avoid implying every computer is AI.",
    contentVersion: "demo-1.0"
  },
  {
    id: "30000000-0000-4000-8000-000000000002",
    lessonCode: "CM-AIL-G1-U1-L2",
    title: "Patterns and Prompts",
    summary: "A simple class activity for noticing patterns and explaining how instructions change an output.",
    sequenceOrder: 2,
    estimatedMinutes: 40,
    durationMinutes: 40,
    gradeBand: GRADE_BANDS.kTo6,
    gradeLevel: 1,
    learningObjectives: "Students complete simple patterns and explain how instructions can change an output.",
    essentialQuestion: "How do patterns help us make predictions?",
    materialsNeeded: "Pattern cards, counters or drawings, printable pair worksheet.",
    vocabulary: "pattern, prompt, instruction, output",
    teacherPrepNotes: "Prepare one visible class pattern and one incomplete pattern for pair talk.",
    contentVersion: "demo-1.0"
  },
  {
    id: "30000000-0000-4000-8000-000000000003",
    lessonCode: "CM-AIL-G1-U1-L3",
    title: "Kind AI Choices",
    summary: "A teacher-led reflection on helpful, fair, and careful choices when using AI tools.",
    sequenceOrder: 3,
    estimatedMinutes: 30,
    durationMinutes: 30,
    gradeBand: GRADE_BANDS.kTo6,
    gradeLevel: 1,
    learningObjectives: "Students describe kind, careful choices when using AI-supported tools.",
    essentialQuestion: "How can we make careful choices with AI?",
    materialsNeeded: "Scenario cards, class reflection prompt, teacher checklist.",
    vocabulary: "kind, careful, fair, private, ask an adult",
    teacherPrepNotes: "Keep scenarios age-appropriate and focused on classroom behavior.",
    contentVersion: "demo-1.0"
  },
  {
    id: "90000000-0000-4000-8000-000000000002",
    lessonCode: null,
    title: "AI Research Skills",
    summary: "Future student-account lesson for evaluating AI-supported research outputs.",
    sequenceOrder: 1,
    estimatedMinutes: 45,
    durationMinutes: 45,
    gradeBand: GRADE_BANDS.grades7To12,
    gradeLevel: 8,
    learningObjectives: null,
    essentialQuestion: null,
    materialsNeeded: null,
    vocabulary: null,
    teacherPrepNotes: null,
    contentVersion: "preview"
  }
];

function makePreviewResource(resource: Omit<LessonResource, "resourceCode" | "accessType" | "visibility" | "isPrintable" | "isDownloadable" | "storagePath" | "mimeType" | "estimatedPages" | "displayMode" | "sortOrder"> & Partial<LessonResource>): LessonResource {
  return {
    resourceCode: null,
    accessType: "platform_only",
    visibility: "teacher",
    isPrintable: false,
    isDownloadable: false,
    storagePath: null,
    mimeType: null,
    estimatedPages: null,
    displayMode: "inline",
    sortOrder: 0,
    ...resource
  };
}

const previewResources: LessonResource[] = [
  makePreviewResource({
    id: "resource-teacher-guide-ai-around-us",
    lessonId: PREVIEW_FIRST_K6_LESSON_ID,
    resourceCode: "CM-AIL-G1-U1-L1-R1",
    resourceType: "teacher_guide",
    title: "Teacher Guide",
    description: "Opening questions, vocabulary, and facilitation notes for a whole-class K-6 lesson.",
    fileUrl: null,
    content: "Use examples from school life: recommendations, voice assistants, translation, and classroom tools.",
    accessType: "teacher_only",
    sortOrder: 1
  }),
  makePreviewResource({
    id: "resource-smartboard-ai-around-us",
    lessonId: PREVIEW_FIRST_K6_LESSON_ID,
    resourceCode: "CM-AIL-G1-U1-L1-R2",
    resourceType: "smartboard_activity",
    title: "Smartboard Sorting Activity",
    description: "Classifies everyday tools into AI-powered, computer-powered, and human-powered examples.",
    fileUrl: null,
    content: "Prompt students to explain their thinking after each sort.",
    accessType: "platform_only",
    displayMode: "smartboard",
    sortOrder: 2
  }),
  makePreviewResource({
    id: "resource-assessment-ai-around-us",
    lessonId: PREVIEW_FIRST_K6_LESSON_ID,
    resourceCode: "CM-AIL-G1-U1-L1-R3",
    resourceType: "assessment",
    title: "Class Reflection Check",
    description: "Teacher-facing checklist for class-level understanding.",
    fileUrl: null,
    content: "Record whether students could name an AI example and explain why it may use data or patterns.",
    accessType: "teacher_only",
    sortOrder: 3
  }),
  makePreviewResource({
    id: "resource-reflection-ai-around-us",
    lessonId: PREVIEW_FIRST_K6_LESSON_ID,
    resourceCode: "CM-AIL-G1-U1-L1-R4",
    resourceType: "worksheet",
    title: "AI Around Us Reflection Sheet",
    description: "Printable one-page classroom reflection sheet.",
    fileUrl: null,
    content: "Draw one tool that might use AI. Complete: I think it uses AI because...",
    accessType: "printable",
    isPrintable: true,
    mimeType: "text/plain",
    estimatedPages: 1,
    displayMode: "print",
    sortOrder: 4
  }),
  makePreviewResource({
    id: "resource-worksheet-patterns",
    lessonId: "30000000-0000-4000-8000-000000000002",
    resourceCode: "CM-AIL-G1-U1-L2-R1",
    resourceType: "worksheet",
    title: "Pattern Cards",
    description: "Printable pattern prompts for small-group classroom discussion.",
    fileUrl: null,
    content: "Students complete a pattern and explain the rule aloud.",
    accessType: "printable",
    isPrintable: true,
    mimeType: "text/plain",
    estimatedPages: 1,
    displayMode: "print",
    sortOrder: 1
  }),
  makePreviewResource({
    id: "resource-support-kind-ai",
    lessonId: "30000000-0000-4000-8000-000000000003",
    resourceCode: "CM-AIL-G1-U1-L3-R1",
    resourceType: "support_activity",
    title: "Choice Cards",
    description: "Support activity for discussing fair and careful AI choices.",
    fileUrl: null,
    content: "Read each scenario and ask the class what a careful choice would look like.",
    accessType: "printable",
    isPrintable: true,
    mimeType: "text/plain",
    estimatedPages: 1,
    displayMode: "print",
    sortOrder: 1
  })
];

const previewSections: LessonSection[] = [
  {
    id: "preview-section-l1-overview",
    lessonId: PREVIEW_FIRST_K6_LESSON_ID,
    sectionCode: "CM-AIL-G1-U1-L1-S1",
    sectionType: "overview",
    title: "Lesson Overview",
    content: "Students explore familiar places where AI may appear, then explain their thinking as a class. This core overview is rendered inside the platform.",
    contentJson: { teacher_note: "Keep examples concrete and local to school life." },
    sequenceOrder: 1,
    accessType: "platform_only",
    estimatedMinutes: 5
  },
  {
    id: "preview-section-l1-flow",
    lessonId: PREVIEW_FIRST_K6_LESSON_ID,
    sectionCode: "CM-AIL-G1-U1-L1-S2",
    sectionType: "lesson_flow",
    title: "Teacher-Led Flow",
    content: "1. Invite students to name technology they see at school or home. 2. Show examples and ask which might use AI. 3. Sort examples together. 4. Ask students to explain why they chose each group.",
    contentJson: { steps: ["Name familiar technology", "Sort examples as a class", "Invite reasoning after each choice", "Close with one careful-use reminder"] },
    sequenceOrder: 2,
    accessType: "teacher_only",
    estimatedMinutes: 15
  },
  {
    id: "preview-section-l1-discussion",
    lessonId: PREVIEW_FIRST_K6_LESSON_ID,
    sectionCode: "CM-AIL-G1-U1-L1-S3",
    sectionType: "discussion_prompt",
    title: "Discussion Prompt",
    content: "Which of these tools might learn from examples or patterns? Ask students to use the sentence frame: I think it uses AI because...",
    contentJson: { sentence_frame: "I think it uses AI because..." },
    sequenceOrder: 3,
    accessType: "platform_only",
    estimatedMinutes: 10
  },
  {
    id: "preview-section-l1-assessment",
    lessonId: PREVIEW_FIRST_K6_LESSON_ID,
    sectionCode: "CM-AIL-G1-U1-L1-S4",
    sectionType: "assessment_guidance",
    title: "Assessment Guidance",
    content: "Look for whether students can name one possible AI example and explain their thinking in simple language.",
    contentJson: { look_for: ["Names one AI example", "Explains using patterns or examples", "Listens to peer reasoning"] },
    sequenceOrder: 4,
    accessType: "teacher_only",
    estimatedMinutes: 5
  }
];

const previewActivities: LessonActivity[] = [
  {
    id: "preview-activity-ai-around-us",
    lessonId: PREVIEW_FIRST_K6_LESSON_ID,
    activityCode: "CM-AIL-G1-U1-L1-A1",
    title: "AI Around Us Sorting Cards",
    activityType: "sorting_cards",
    deliveryMode: DELIVERY_MODES.teacherLed,
    accessType: "platform_only",
    isSmartboardReady: true,
    instructions: "Display cards and sort them as a whole class. Ask students to explain every choice.",
    activityJson: {
      prompt: "Sort each example into the group that fits best.",
      categories: ["AI-powered", "Computer-powered", "Human-powered"],
      cards: [
        { label: "Voice assistant", correctCategory: "AI-powered" },
        { label: "Calculator", correctCategory: "Computer-powered" },
        { label: "Teacher reading a story", correctCategory: "Human-powered" },
        { label: "Translation app", correctCategory: "AI-powered" }
      ]
    },
    sequenceOrder: 1
  }
];

const previewAssessmentTemplates: AssessmentTemplate[] = [
  {
    id: "preview-assessment-template-l1",
    lessonId: PREVIEW_FIRST_K6_LESSON_ID,
    templateCode: "CM-AIL-G1-U1-L1-AT1",
    title: "AI Around Us Class Checklist",
    description: "Teacher-only class-level checklist aligned to the MVP assessment form.",
    assessmentType: "class_checklist",
    criteriaJson: {
      criteria: [
        { key: "objective_met", label: "Students named a familiar AI example." },
        { key: "activity_completed", label: "Class completed the sorting activity." },
        { key: "students_explained_thinking", label: "Students explained their thinking using simple reasoning." }
      ]
    },
    accessType: "teacher_only",
    sequenceOrder: 1
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
    .select(
      "id,lesson_code,title,summary,sequence_order,estimated_minutes,duration_minutes,grade_band,grade_level,learning_objectives,essential_question,materials_needed,vocabulary,teacher_prep_notes,content_version"
    )
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
      lessonCode: lesson.lesson_code,
      title: lesson.title,
      summary: lesson.summary ?? "Lesson summary will be added in the curriculum library.",
      sequenceOrder: lesson.sequence_order,
      estimatedMinutes: lesson.estimated_minutes,
      durationMinutes: lesson.duration_minutes,
      gradeBand: lesson.grade_band,
      gradeLevel: lesson.grade_level,
      learningObjectives: lesson.learning_objectives,
      essentialQuestion: lesson.essential_question,
      materialsNeeded: lesson.materials_needed,
      vocabulary: lesson.vocabulary,
      teacherPrepNotes: lesson.teacher_prep_notes,
      contentVersion: lesson.content_version
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
    .select(
      "id,lesson_id,resource_code,resource_type,title,description,file_url,content,access_type,visibility,is_printable,is_downloadable,storage_path,mime_type,estimated_pages,display_mode,sort_order"
    )
    .eq("lesson_id", lessonId)
    .order("sort_order", { ascending: true });

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
      resourceCode: resource.resource_code,
      resourceType: resource.resource_type,
      title: resource.title,
      description: resource.description,
      fileUrl: resource.file_url,
      content: resource.content,
      accessType: resource.access_type,
      visibility: resource.visibility,
      isPrintable: resource.is_printable,
      isDownloadable: resource.is_downloadable,
      storagePath: resource.storage_path,
      mimeType: resource.mime_type,
      estimatedPages: resource.estimated_pages,
      displayMode: resource.display_mode,
      sortOrder: resource.sort_order
    })),
    mode: "supabase",
    error: null
  };
}

export async function getLessonSectionsResult(lessonId: string): Promise<TeacherDataResult<LessonSection[]>> {
  const supabase = getSupabaseForTeacherLedFlow("Lesson sections");

  if (!supabase) {
    return {
      data: previewSections.filter((section) => section.lessonId === lessonId).sort((a, b) => a.sequenceOrder - b.sequenceOrder),
      mode: "local_preview",
      error: null
    };
  }

  const { data, error } = await supabase
    .from("lesson_sections")
    .select("id,lesson_id,section_code,section_type,title,content,content_json,sequence_order,access_type,estimated_minutes")
    .eq("lesson_id", lessonId)
    .order("sequence_order", { ascending: true });

  if (error) {
    warnSupabaseIssue("lesson_sections query failed", error.message);
    return { data: [], mode: "supabase", error: `lesson_sections query failed: ${error.message}` };
  }

  const sectionRows = (data ?? []) as LessonSectionRow[];

  return {
    data: sectionRows.map((section) => ({
      id: section.id,
      lessonId: section.lesson_id,
      sectionCode: section.section_code,
      sectionType: section.section_type,
      title: section.title,
      content: section.content,
      contentJson: section.content_json,
      sequenceOrder: section.sequence_order,
      accessType: section.access_type,
      estimatedMinutes: section.estimated_minutes
    })),
    mode: "supabase",
    error: null
  };
}

export async function getLessonActivitiesResult(lessonId: string): Promise<TeacherDataResult<LessonActivity[]>> {
  const supabase = getSupabaseForTeacherLedFlow("Lesson activities");

  if (!supabase) {
    return {
      data: previewActivities.filter((activity) => activity.lessonId === lessonId).sort((a, b) => a.sequenceOrder - b.sequenceOrder),
      mode: "local_preview",
      error: null
    };
  }

  const { data, error } = await supabase
    .from("activities")
    .select("id,lesson_id,activity_code,title,activity_type,delivery_mode,access_type,is_smartboard_ready,instructions,activity_json,sequence_order")
    .eq("lesson_id", lessonId)
    .order("sequence_order", { ascending: true });

  if (error) {
    warnSupabaseIssue("activities query failed", error.message);
    return { data: [], mode: "supabase", error: `activities query failed: ${error.message}` };
  }

  const activityRows = (data ?? []) as LessonActivityRow[];

  return {
    data: activityRows.map((activity) => ({
      id: activity.id,
      lessonId: activity.lesson_id,
      activityCode: activity.activity_code,
      title: activity.title,
      activityType: activity.activity_type,
      deliveryMode: activity.delivery_mode,
      accessType: activity.access_type,
      isSmartboardReady: activity.is_smartboard_ready,
      instructions: activity.instructions,
      activityJson: activity.activity_json,
      sequenceOrder: activity.sequence_order
    })),
    mode: "supabase",
    error: null
  };
}

export async function getAssessmentTemplatesResult(lessonId: string): Promise<TeacherDataResult<AssessmentTemplate[]>> {
  const supabase = getSupabaseForTeacherLedFlow("Assessment templates");

  if (!supabase) {
    return {
      data: previewAssessmentTemplates.filter((template) => template.lessonId === lessonId).sort((a, b) => a.sequenceOrder - b.sequenceOrder),
      mode: "local_preview",
      error: null
    };
  }

  const { data, error } = await supabase
    .from("assessment_templates")
    .select("id,lesson_id,template_code,title,description,assessment_type,criteria_json,access_type,sequence_order")
    .eq("lesson_id", lessonId)
    .order("sequence_order", { ascending: true });

  if (error) {
    warnSupabaseIssue("assessment_templates query failed", error.message);
    return { data: [], mode: "supabase", error: `assessment_templates query failed: ${error.message}` };
  }

  const templateRows = (data ?? []) as AssessmentTemplateRow[];

  return {
    data: templateRows.map((template) => ({
      id: template.id,
      lessonId: template.lesson_id,
      templateCode: template.template_code,
      title: template.title,
      description: template.description,
      assessmentType: template.assessment_type,
      criteriaJson: template.criteria_json,
      accessType: template.access_type,
      sequenceOrder: template.sequence_order
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
    .order("updated_at", { ascending: false })
    .limit(2);

  if (error) {
    warnSupabaseIssue("class_lesson_assessments lookup failed", error.message);
    return { data: null, mode: "supabase", error: `class_lesson_assessments lookup failed: ${error.message}` };
  }

  const rows = (data ?? []) as K6AssessmentRow[];

  console.info(`[CONNECTED MENA] class_lesson_assessments lookup returned ${rows.length} row(s) for class ${classId}, lesson ${lessonId}.`);

  if (rows.length > 1) {
    warnSupabaseIssue("class_lesson_assessments duplicate rows found", `Expected one current row for class ${classId} and lesson ${lessonId}.`);
    return {
      data: mapAssessmentRow(rows[0]),
      mode: "supabase",
      error: "Multiple class_lesson_assessments rows were found for this class and lesson. Showing the most recently updated row."
    };
  }

  return {
    data: rows[0] ? mapAssessmentRow(rows[0]) : null,
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
