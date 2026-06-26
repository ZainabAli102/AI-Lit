import { createSupabaseClient } from "@/lib/supabase/client";
import type { Database, Json } from "@/types/database";

type GradeBand = Database["public"]["Enums"]["grade_band"];
type ContentAccessType = Database["public"]["Enums"]["content_access_type"];
type LessonSectionType = Database["public"]["Enums"]["lesson_section_type"];

export type CurriculumDataResult<T> = {
  data: T;
  mode: "supabase" | "local_preview";
  error: string | null;
};

export type CurriculumProgramSummary = {
  id: string;
  programCode: string;
  title: string;
  gradeBand: GradeBand;
  version: string;
  status: string;
};

export type CurriculumLessonListItem = {
  id: string;
  lessonCode: string | null;
  displayCode: string | null;
  title: string;
  summary: string | null;
  gradeBand: GradeBand;
  gradeLevel: number | null;
  sequenceOrder: number;
  status: string;
  contentVersion: string;
  unitTitle: string | null;
};

export type CurriculumLessonDetail = CurriculumLessonListItem & {
  anchorTheme: string | null;
  toolUseStatus: string | null;
  iCanStatement: string | null;
  studentChallenge: string | null;
  studentOutput: string | null;
  essentialQuestion: string | null;
  learningObjectives: string | null;
  materialsNeeded: string | null;
  vocabulary: string | null;
  teacherPrepNotes: string | null;
  sections: CurriculumSection[];
  activities: CurriculumActivity[];
  resources: CurriculumResource[];
  assessmentTemplates: CurriculumAssessmentTemplate[];
};

export type CurriculumSection = {
  id: string;
  sectionCode: string | null;
  sectionType: LessonSectionType;
  title: string;
  content: string | null;
  accessType: ContentAccessType;
  sequenceOrder: number;
  estimatedMinutes: number | null;
};

export type CurriculumActivity = {
  id: string;
  activityCode: string | null;
  title: string;
  activityType: string;
  accessType: ContentAccessType;
  isSmartboardReady: boolean;
  sequenceOrder: number;
  activityJson: Json;
};

export type CurriculumResource = {
  id: string;
  resourceCode: string | null;
  title: string;
  resourceType: string;
  accessType: ContentAccessType;
  isPrintable: boolean;
  isDownloadable: boolean;
  sortOrder: number;
};

export type CurriculumAssessmentTemplate = {
  id: string;
  templateCode: string | null;
  title: string;
  assessmentType: string;
  accessType: ContentAccessType;
  sequenceOrder: number;
};

type ProgramRow = {
  id: string;
  program_code: string;
  title: string;
  grade_band: GradeBand;
  version: string;
  status: string;
};

type UnitRow = {
  id: string;
  title: string;
};

type LessonRow = {
  id: string;
  lesson_code: string | null;
  display_code: string | null;
  title: string;
  summary: string | null;
  grade_band: GradeBand;
  grade_level: number | null;
  sequence_order: number;
  status: string;
  content_version: string;
  curriculum_unit_id: string;
  anchor_theme: string | null;
  tool_use_status: string | null;
  i_can_statement: string | null;
  student_challenge: string | null;
  student_output: string | null;
  essential_question: string | null;
  learning_objectives: string | null;
  materials_needed: string | null;
  vocabulary: string | null;
  teacher_prep_notes: string | null;
};

type SectionRow = {
  id: string;
  section_code: string | null;
  section_type: LessonSectionType;
  title: string;
  content: string | null;
  access_type: ContentAccessType;
  sequence_order: number;
  estimated_minutes: number | null;
};

type ActivityRow = {
  id: string;
  activity_code: string | null;
  title: string;
  activity_type: string;
  access_type: ContentAccessType;
  is_smartboard_ready: boolean;
  sequence_order: number;
  activity_json: Json;
};

type ResourceRow = {
  id: string;
  resource_code: string | null;
  title: string;
  resource_type: string;
  access_type: ContentAccessType;
  is_printable: boolean;
  is_downloadable: boolean;
  sort_order: number;
};

type AssessmentTemplateRow = {
  id: string;
  template_code: string | null;
  title: string;
  assessment_type: string;
  access_type: ContentAccessType;
  sequence_order: number;
};

let didWarnAboutPreviewMode = false;

const previewPrograms: CurriculumProgramSummary[] = [
  {
    id: "90000000-0000-4000-8000-000000000001",
    programCode: "CM-AIL-K6",
    title: "CONNECTED MENA AI Literacy K-6",
    gradeBand: "k_to_6",
    version: "demo-1.0",
    status: "draft"
  }
];

const previewLessons: CurriculumLessonListItem[] = [
  {
    id: "30000000-0000-4000-8000-000000000001",
    lessonCode: "CM-AIL-G1-U1-L1",
    displayCode: "G1-01",
    title: "AI Around Us",
    summary: "Teacher-led discussion about where students encounter AI in familiar classroom and home contexts.",
    gradeBand: "k_to_6",
    gradeLevel: 1,
    sequenceOrder: 1,
    status: "draft",
    contentVersion: "demo-1.0",
    unitTitle: "AI Literacy Foundations"
  }
];

const previewLessonDetail: CurriculumLessonDetail = {
  ...previewLessons[0],
  anchorTheme: "AI in familiar places",
  toolUseStatus: "teacher_led_demo",
  iCanStatement: "I can name a tool that might use AI and explain my thinking.",
  studentChallenge: "Sort familiar examples and decide which ones might use AI.",
  studentOutput: "Class sorting discussion and optional reflection drawing.",
  essentialQuestion: "Where do we see AI around us?",
  learningObjectives: "Students identify familiar AI-powered tools and explain that AI can use patterns or data to help people.",
  materialsNeeded: "Smartboard, sorting cards, teacher checklist, optional printable reflection sheet.",
  vocabulary: "AI, pattern, data, tool, choice",
  teacherPrepNotes: "Use familiar classroom and home examples. Avoid implying every computer is AI.",
  sections: [
    {
      id: "preview-section-l1-overview",
      sectionCode: "CM-AIL-G1-U1-L1-S1",
      sectionType: "overview",
      title: "Lesson Overview",
      content: "Students explore familiar places where AI may appear, then explain their thinking as a class.",
      accessType: "platform_only",
      sequenceOrder: 1,
      estimatedMinutes: 5
    }
  ],
  activities: [
    {
      id: "preview-activity-ai-around-us",
      activityCode: "CM-AIL-G1-U1-L1-A1",
      title: "AI Around Us Sorting Cards",
      activityType: "sorting_cards",
      accessType: "platform_only",
      isSmartboardReady: true,
      sequenceOrder: 1,
      activityJson: { categories: ["AI-powered", "Computer-powered", "Human-powered"] }
    }
  ],
  resources: [
    {
      id: "resource-reflection-ai-around-us",
      resourceCode: "CM-AIL-G1-U1-L1-R4",
      title: "AI Around Us Reflection Sheet",
      resourceType: "worksheet",
      accessType: "printable",
      isPrintable: true,
      isDownloadable: false,
      sortOrder: 4
    }
  ],
  assessmentTemplates: [
    {
      id: "preview-assessment-template-l1",
      templateCode: "CM-AIL-G1-U1-L1-AT1",
      title: "AI Around Us Class Checklist",
      assessmentType: "class_checklist",
      accessType: "teacher_only",
      sequenceOrder: 1
    }
  ]
};

function getSupabaseForCurriculum(context: string) {
  const supabase = createSupabaseClient();

  if (supabase) {
    console.info(`[CONNECTED MENA] Supabase mode active for curriculum ${context}.`);
    return supabase;
  }

  if (!didWarnAboutPreviewMode) {
    console.warn(
      `[CONNECTED MENA] Supabase env vars are missing. Curriculum ${context} is using local preview data. ` +
        "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to test against Supabase."
    );
    didWarnAboutPreviewMode = true;
  }

  return null;
}

function mapLesson(row: LessonRow, units: UnitRow[]): CurriculumLessonListItem {
  return {
    id: row.id,
    lessonCode: row.lesson_code,
    displayCode: row.display_code,
    title: row.title,
    summary: row.summary,
    gradeBand: row.grade_band,
    gradeLevel: row.grade_level,
    sequenceOrder: row.sequence_order,
    status: row.status,
    contentVersion: row.content_version,
    unitTitle: units.find((unit) => unit.id === row.curriculum_unit_id)?.title ?? null
  };
}

export async function getCurriculumProgramsResult(): Promise<CurriculumDataResult<CurriculumProgramSummary[]>> {
  const supabase = getSupabaseForCurriculum("program list");

  if (!supabase) {
    return { data: previewPrograms, mode: "local_preview", error: null };
  }

  const { data, error } = await supabase
    .from("curriculum_programs")
    .select("id,program_code,title,grade_band,version,status")
    .order("program_code", { ascending: true });

  if (error) {
    return { data: [], mode: "supabase", error: `curriculum_programs query failed: ${error.message}` };
  }

  return {
    data: ((data ?? []) as ProgramRow[]).map((program) => ({
      id: program.id,
      programCode: program.program_code,
      title: program.title,
      gradeBand: program.grade_band,
      version: program.version,
      status: program.status
    })),
    mode: "supabase",
    error: null
  };
}

export async function getCurriculumLessonsResult(): Promise<CurriculumDataResult<CurriculumLessonListItem[]>> {
  const supabase = getSupabaseForCurriculum("lesson list");

  if (!supabase) {
    return { data: previewLessons, mode: "local_preview", error: null };
  }

  const { data: lessons, error: lessonsError } = await supabase
    .from("lessons")
    .select(
      "id,lesson_code,display_code,title,summary,grade_band,grade_level,sequence_order,status,content_version,curriculum_unit_id,anchor_theme,tool_use_status,i_can_statement,student_challenge,student_output,essential_question,learning_objectives,materials_needed,vocabulary,teacher_prep_notes"
    )
    .eq("grade_band", "k_to_6")
    .order("grade_level", { ascending: true })
    .order("sequence_order", { ascending: true });

  if (lessonsError) {
    return { data: [], mode: "supabase", error: `lessons query failed: ${lessonsError.message}` };
  }

  const lessonRows = (lessons ?? []) as LessonRow[];
  const unitIds = Array.from(new Set(lessonRows.map((lesson) => lesson.curriculum_unit_id)));
  const { data: units, error: unitsError } = unitIds.length
    ? await supabase.from("curriculum_units").select("id,title").in("id", unitIds)
    : { data: [], error: null };

  if (unitsError) {
    return { data: [], mode: "supabase", error: `curriculum_units query failed: ${unitsError.message}` };
  }

  return {
    data: lessonRows.map((lesson) => mapLesson(lesson, (units ?? []) as UnitRow[])),
    mode: "supabase",
    error: null
  };
}

export async function getCurriculumLessonDetailResult(lessonId: string): Promise<CurriculumDataResult<CurriculumLessonDetail | null>> {
  const supabase = getSupabaseForCurriculum(`lesson detail ${lessonId}`);

  if (!supabase) {
    return {
      data: previewLessonDetail.id === lessonId ? previewLessonDetail : null,
      mode: "local_preview",
      error: previewLessonDetail.id === lessonId ? null : "Lesson not found."
    };
  }

  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .select(
      "id,lesson_code,display_code,title,summary,grade_band,grade_level,sequence_order,status,content_version,curriculum_unit_id,anchor_theme,tool_use_status,i_can_statement,student_challenge,student_output,essential_question,learning_objectives,materials_needed,vocabulary,teacher_prep_notes"
    )
    .eq("id", lessonId)
    .maybeSingle();

  if (lessonError) {
    return { data: null, mode: "supabase", error: `lesson query failed: ${lessonError.message}` };
  }

  if (!lesson) {
    return { data: null, mode: "supabase", error: "Lesson not found." };
  }

  const lessonRow = lesson as LessonRow;
  const [unitResult, sectionsResult, activitiesResult, resourcesResult, assessmentsResult] = await Promise.all([
    supabase.from("curriculum_units").select("id,title").eq("id", lessonRow.curriculum_unit_id).maybeSingle(),
    supabase
      .from("lesson_sections")
      .select("id,section_code,section_type,title,content,access_type,sequence_order,estimated_minutes")
      .eq("lesson_id", lessonId)
      .order("sequence_order", { ascending: true }),
    supabase
      .from("activities")
      .select("id,activity_code,title,activity_type,access_type,is_smartboard_ready,sequence_order,activity_json")
      .eq("lesson_id", lessonId)
      .order("sequence_order", { ascending: true }),
    supabase
      .from("lesson_resources")
      .select("id,resource_code,title,resource_type,access_type,is_printable,is_downloadable,sort_order")
      .eq("lesson_id", lessonId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("assessment_templates")
      .select("id,template_code,title,assessment_type,access_type,sequence_order")
      .eq("lesson_id", lessonId)
      .order("sequence_order", { ascending: true })
  ]);

  const errors = [unitResult.error, sectionsResult.error, activitiesResult.error, resourcesResult.error, assessmentsResult.error]
    .map((error) => error?.message)
    .filter(Boolean);

  if (errors.length > 0) {
    return { data: null, mode: "supabase", error: errors.join(" ") };
  }

  const listItem = mapLesson(lessonRow, unitResult.data ? [unitResult.data as UnitRow] : []);

  return {
    data: {
      ...listItem,
      anchorTheme: lessonRow.anchor_theme,
      toolUseStatus: lessonRow.tool_use_status,
      iCanStatement: lessonRow.i_can_statement,
      studentChallenge: lessonRow.student_challenge,
      studentOutput: lessonRow.student_output,
      essentialQuestion: lessonRow.essential_question,
      learningObjectives: lessonRow.learning_objectives,
      materialsNeeded: lessonRow.materials_needed,
      vocabulary: lessonRow.vocabulary,
      teacherPrepNotes: lessonRow.teacher_prep_notes,
      sections: ((sectionsResult.data ?? []) as SectionRow[]).map((section) => ({
        id: section.id,
        sectionCode: section.section_code,
        sectionType: section.section_type,
        title: section.title,
        content: section.content,
        accessType: section.access_type,
        sequenceOrder: section.sequence_order,
        estimatedMinutes: section.estimated_minutes
      })),
      activities: ((activitiesResult.data ?? []) as ActivityRow[]).map((activity) => ({
        id: activity.id,
        activityCode: activity.activity_code,
        title: activity.title,
        activityType: activity.activity_type,
        accessType: activity.access_type,
        isSmartboardReady: activity.is_smartboard_ready,
        sequenceOrder: activity.sequence_order,
        activityJson: activity.activity_json
      })),
      resources: ((resourcesResult.data ?? []) as ResourceRow[]).map((resource) => ({
        id: resource.id,
        resourceCode: resource.resource_code,
        title: resource.title,
        resourceType: resource.resource_type,
        accessType: resource.access_type,
        isPrintable: resource.is_printable,
        isDownloadable: resource.is_downloadable,
        sortOrder: resource.sort_order
      })),
      assessmentTemplates: ((assessmentsResult.data ?? []) as AssessmentTemplateRow[]).map((template) => ({
        id: template.id,
        templateCode: template.template_code,
        title: template.title,
        assessmentType: template.assessment_type,
        accessType: template.access_type,
        sequenceOrder: template.sequence_order
      }))
    },
    mode: "supabase",
    error: null
  };
}
