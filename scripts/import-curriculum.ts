import process from "node:process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { field, formatValidationError, getSourceDirFromArgs, type CsvRow, validateCurriculumImport } from "./validate-curriculum-import";
import type { Database } from "../src/types/database";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

type PreviewRecord = {
  code: string;
  title: string;
  parent?: string;
  displayCode?: string;
  action: "would upsert";
};

type ImportPlan = {
  programs: PreviewRecord[];
  grades: PreviewRecord[];
  units: PreviewRecord[];
  lessons: PreviewRecord[];
  lessonSections: PreviewRecord[];
  activities: PreviewRecord[];
  resources: PreviewRecord[];
  assessmentTemplates: PreviewRecord[];
  warnings: string[];
};

type PreparedImport = {
  programs: ReturnType<typeof mapProgram>[];
  grades: ReturnType<typeof mapGrade>[];
  units: ReturnType<typeof mapUnit>[];
  lessons: ReturnType<typeof mapLesson>[];
  lessonSections: ReturnType<typeof mapLessonSection>[];
  activities: ReturnType<typeof mapActivity>[];
  resources: ReturnType<typeof mapResource>[];
  assessmentTemplates: ReturnType<typeof mapAssessmentTemplate>[];
  warnings: string[];
};

type ImportMode = "dry-run" | "apply";

type ApplySummary = {
  programs: number;
  grades: number;
  units: number;
  lessons: number;
  lessonSections: number;
  activities: number;
  resources: number;
  assessmentTemplates: number;
};

type IdMaps = {
  programIdsByCode: Map<string, string>;
  unitIdsByCode: Map<string, string>;
  lessonIdsByCode: Map<string, string>;
};

function getMode(): ImportMode {
  const isDryRun = process.argv.includes("--dry-run");
  const isApply = process.argv.includes("--apply");

  if (isDryRun && isApply) {
    console.error("Choose only one mode: --dry-run or --apply.");
    process.exit(1);
  }

  if (isDryRun) {
    return "dry-run";
  }

  if (isApply) {
    return "apply";
  }

  console.error("Choose a mode: --dry-run or --apply.");
  process.exit(1);
}

function parseOptionalInt(value: string) {
  return value ? Number.parseInt(value, 10) : null;
}

function parseBoolean(value: string) {
  return value === "true";
}

function parseJson(value: string, fallback: JsonValue = {}) {
  return value ? (JSON.parse(value) as JsonValue) : fallback;
}

function optional(value: string) {
  return value || null;
}

function mapProgram(row: CsvRow) {
  return {
    program_code: field(row, "program_code"),
    title: field(row, "title"),
    description: optional(field(row, "description")),
    grade_band: field(row, "grade_band"),
    version: field(row, "version"),
    status: field(row, "status")
  };
}

function mapGrade(row: CsvRow) {
  return {
    program_code: field(row, "program_code"),
    grade_code: field(row, "grade_code"),
    grade_level: parseOptionalInt(field(row, "grade_level")),
    grade_band: field(row, "grade_band"),
    title: field(row, "title"),
    sequence_order: parseOptionalInt(field(row, "sequence_order"))
  };
}

function mapUnit(row: CsvRow) {
  return {
    program_code: field(row, "program_code"),
    grade_code: field(row, "grade_code"),
    unit_code: field(row, "unit_code"),
    title: field(row, "title"),
    description: optional(field(row, "description")),
    grade_band: field(row, "grade_band"),
    grade_level: parseOptionalInt(field(row, "grade_level")),
    learning_goals: optional(field(row, "learning_goals")),
    duration_weeks: parseOptionalInt(field(row, "duration_weeks")),
    sequence_order: parseOptionalInt(field(row, "sequence_order")),
    is_active: parseBoolean(field(row, "is_active")),
    status: field(row, "status")
  };
}

function mapLesson(row: CsvRow) {
  return {
    grade_code: field(row, "grade_code"),
    unit_code: field(row, "unit_code"),
    lesson_code: field(row, "lesson_code"),
    display_code: field(row, "display_code"),
    title: field(row, "title"),
    summary: optional(field(row, "summary")),
    grade_band: field(row, "grade_band"),
    grade_level: parseOptionalInt(field(row, "grade_level")),
    sequence_order: parseOptionalInt(field(row, "sequence_order")),
    estimated_minutes: parseOptionalInt(field(row, "estimated_minutes")),
    duration_minutes: parseOptionalInt(field(row, "duration_minutes")),
    anchor_theme: optional(field(row, "anchor_theme")),
    tool_use_status: field(row, "tool_use_status"),
    learning_objectives: optional(field(row, "learning_objectives")),
    essential_question: optional(field(row, "essential_question")),
    i_can_statement: optional(field(row, "i_can_statement")),
    student_challenge: optional(field(row, "student_challenge")),
    student_output: optional(field(row, "student_output")),
    success_criteria_json: parseJson(field(row, "success_criteria_json")),
    alignment_json: parseJson(field(row, "alignment_json")),
    localization_json: parseJson(field(row, "localization_json")),
    logistics_json: parseJson(field(row, "logistics_json")),
    materials_needed: optional(field(row, "materials_needed")),
    vocabulary: optional(field(row, "vocabulary")),
    teacher_prep_notes: optional(field(row, "teacher_prep_notes")),
    status: field(row, "status"),
    content_version: field(row, "content_version"),
    is_active: parseBoolean(field(row, "is_active"))
  };
}

function mapLessonSection(row: CsvRow) {
  return {
    lesson_code: field(row, "lesson_code"),
    section_code: field(row, "section_code"),
    section_type: field(row, "section_type"),
    title: field(row, "title"),
    content: optional(field(row, "content")),
    content_json: parseJson(field(row, "content_json")),
    sequence_order: parseOptionalInt(field(row, "sequence_order")),
    access_type: field(row, "access_type"),
    estimated_minutes: parseOptionalInt(field(row, "estimated_minutes"))
  };
}

function mapActivity(row: CsvRow) {
  return {
    lesson_code: field(row, "lesson_code"),
    activity_code: field(row, "activity_code"),
    title: field(row, "title"),
    activity_type: field(row, "activity_type"),
    delivery_mode: field(row, "delivery_mode"),
    access_type: field(row, "access_type"),
    is_smartboard_ready: parseBoolean(field(row, "is_smartboard_ready")),
    instructions: optional(field(row, "instructions")),
    activity_json: parseJson(field(row, "activity_json")),
    sequence_order: parseOptionalInt(field(row, "sequence_order"))
  };
}

function mapResource(row: CsvRow) {
  return {
    lesson_code: field(row, "lesson_code"),
    resource_code: field(row, "resource_code"),
    resource_type: field(row, "resource_type"),
    title: field(row, "title"),
    description: optional(field(row, "description")),
    file_url: optional(field(row, "file_url")),
    content: optional(field(row, "content")),
    access_type: field(row, "access_type"),
    visibility: field(row, "visibility"),
    is_printable: parseBoolean(field(row, "is_printable")),
    is_downloadable: parseBoolean(field(row, "is_downloadable")),
    storage_path: optional(field(row, "storage_path")),
    mime_type: optional(field(row, "mime_type")),
    estimated_pages: parseOptionalInt(field(row, "estimated_pages")),
    display_mode: field(row, "display_mode"),
    sort_order: parseOptionalInt(field(row, "sort_order"))
  };
}

function mapAssessmentTemplate(row: CsvRow) {
  return {
    lesson_code: field(row, "lesson_code"),
    template_code: field(row, "template_code"),
    title: field(row, "title"),
    description: optional(field(row, "description")),
    assessment_type: field(row, "assessment_type"),
    criteria_json: parseJson(field(row, "criteria_json")),
    access_type: field(row, "access_type"),
    sequence_order: parseOptionalInt(field(row, "sequence_order"))
  };
}

function optionalFieldWarnings(table: string, code: string, payload: Record<string, unknown>, fields: string[]) {
  return fields
    .filter((fieldName) => payload[fieldName] === null || payload[fieldName] === "")
    .map((fieldName) => `${table} ${code} has empty optional field "${fieldName}".`);
}

function prepareImport(sourceDir?: string): PreparedImport | null {
  const validation = validateCurriculumImport({ sourceDir });

  if (!validation.ok) {
    console.error("Curriculum import validation failed.");
    validation.errors.forEach((error) => console.error(formatValidationError(error)));
    return null;
  }

  const { csvFiles } = validation;
  const programs = csvFiles.programs.rows.map(mapProgram);
  const grades = csvFiles.grades.rows.map(mapGrade);
  const units = csvFiles.units.rows.map(mapUnit);
  const lessons = csvFiles.lessons.rows.map(mapLesson);
  const lessonSections = csvFiles.lessonSections.rows.map(mapLessonSection);
  const activities = csvFiles.activities.rows.map(mapActivity);
  const resources = csvFiles.resources.rows.map(mapResource);
  const assessmentTemplates = csvFiles.assessmentTemplates.rows.map(mapAssessmentTemplate);
  const warnings = [
    "Dry-run only: no Supabase database writes were made.",
    "platform_only content is internal/default and should not appear as a teacher-facing badge."
  ];

  resources.forEach((resource) => {
    if (resource.is_downloadable || resource.access_type === "downloadable") {
      warnings.push(`Downloadable resource found: ${resource.resource_code}. Confirm this is intentional.`);
    }
  });

  programs.forEach((program) => warnings.push(...optionalFieldWarnings("curriculum_programs", program.program_code, program, ["description"])));
  units.forEach((unit) => warnings.push(...optionalFieldWarnings("curriculum_units", unit.unit_code, unit, ["description", "learning_goals"])));
  lessons.forEach((lesson) => warnings.push(...optionalFieldWarnings("lessons", lesson.lesson_code, lesson, ["summary", "teacher_prep_notes"])));
  resources.forEach((resource) => warnings.push(...optionalFieldWarnings("lesson_resources", resource.resource_code, resource, ["file_url", "storage_path"])));

  return {
    programs,
    grades,
    units,
    lessons,
    lessonSections,
    activities,
    resources,
    assessmentTemplates,
    warnings
  };
}

function preparePlan(prepared: PreparedImport): ImportPlan {
  return {
    programs: prepared.programs.map((program) => ({
      code: program.program_code,
      title: program.title,
      action: "would upsert"
    })),
    grades: prepared.grades.map((grade) => ({
      code: grade.grade_code,
      title: grade.title,
      parent: `program_code ${grade.program_code}`,
      action: "would upsert"
    })),
    units: prepared.units.map((unit) => ({
      code: unit.unit_code,
      title: unit.title,
      parent: `grade_code ${unit.grade_code}`,
      action: "would upsert"
    })),
    lessons: prepared.lessons.map((lesson) => ({
      code: lesson.lesson_code,
      displayCode: lesson.display_code,
      title: lesson.title,
      parent: `unit_code ${lesson.unit_code}`,
      action: "would upsert"
    })),
    lessonSections: prepared.lessonSections.map((section) => ({
      code: section.section_code,
      title: section.title,
      parent: `lesson_code ${section.lesson_code}`,
      action: "would upsert"
    })),
    activities: prepared.activities.map((activity) => ({
      code: activity.activity_code,
      title: activity.title,
      parent: `lesson_code ${activity.lesson_code}`,
      action: "would upsert"
    })),
    resources: prepared.resources.map((resource) => ({
      code: resource.resource_code,
      title: resource.title,
      parent: `lesson_code ${resource.lesson_code}`,
      action: "would upsert"
    })),
    assessmentTemplates: prepared.assessmentTemplates.map((template) => ({
      code: template.template_code,
      title: template.title,
      parent: `lesson_code ${template.lesson_code}`,
      action: "would upsert"
    })),
    warnings: prepared.warnings
  };
}

function printPreview(title: string, records: PreviewRecord[]) {
  console.log("");
  console.log(title);

  records.forEach((record) => {
    const displayCode = record.displayCode ? ` | ${record.displayCode}` : "";
    const parent = record.parent ? ` | ${record.parent}` : "";
    console.log(`- ${record.code}${displayCode} | ${record.title}${parent} | ${record.action}`);
  });
}

function printPlan(plan: ImportPlan) {
  console.log("Curriculum import dry-run passed.");
  console.log("");
  console.log("Relationship mapping:");
  console.log("- program_code maps to curriculum_programs.");
  console.log("- grade_code maps to curriculum_grades.");
  console.log("- unit_code maps to curriculum_units.");
  console.log("- lesson_code maps to lessons.");
  console.log("- section_code maps to lesson_sections.");
  console.log("- activity_code maps to activities.");
  console.log("- resource_code maps to lesson_resources.");
  console.log("- template_code maps to assessment_templates.");
  console.log("");
  console.log("Summary:");
  console.log(`- Programs: ${plan.programs.length} row${plan.programs.length === 1 ? "" : "s"} prepared`);
  console.log(`- Grades: ${plan.grades.length} row${plan.grades.length === 1 ? "" : "s"} prepared`);
  console.log(`- Units: ${plan.units.length} row${plan.units.length === 1 ? "" : "s"} prepared`);
  console.log(`- Lessons: ${plan.lessons.length} row${plan.lessons.length === 1 ? "" : "s"} prepared`);
  console.log(`- Lesson sections: ${plan.lessonSections.length} row${plan.lessonSections.length === 1 ? "" : "s"} prepared`);
  console.log(`- Activities: ${plan.activities.length} row${plan.activities.length === 1 ? "" : "s"} prepared`);
  console.log(`- Resources: ${plan.resources.length} row${plan.resources.length === 1 ? "" : "s"} prepared`);
  console.log(`- Assessment templates: ${plan.assessmentTemplates.length} row${plan.assessmentTemplates.length === 1 ? "" : "s"} prepared`);

  printPreview("curriculum_programs", plan.programs);
  printPreview("curriculum_grades", plan.grades);
  printPreview("curriculum_units", plan.units);
  printPreview("lessons", plan.lessons);
  printPreview("lesson_sections", plan.lessonSections);
  printPreview("activities", plan.activities);
  printPreview("lesson_resources", plan.resources);
  printPreview("assessment_templates", plan.assessmentTemplates);

  console.log("");
  console.log("Warnings:");
  plan.warnings.forEach((warning) => console.log(`- ${warning}`));
}

function createImportClient() {
  loadLocalEnvFile();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing required Supabase environment variables for apply mode.");
    console.error("- NEXT_PUBLIC_SUPABASE_URL");
    console.error("- NEXT_PUBLIC_SUPABASE_ANON_KEY");
    process.exit(1);
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          cache: "no-store"
        })
    }
  });
}

function loadLocalEnvFile() {
  const envPath = path.join(process.cwd(), ".env.local");

  if (!existsSync(envPath)) {
    return;
  }

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      return;
    }

    const separatorIndex = trimmedLine.indexOf("=");

    if (separatorIndex === -1) {
      return;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const rawValue = trimmedLine.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^["']|["']$/g, "");

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  });
}

function handleSupabaseFailure(table: string, stableCode: string, message: string): never {
  console.error(`Supabase import failed for ${table} (${stableCode}).`);
  console.error(message);
  process.exit(1);
}

async function upsertAndFetchId(
  supabase: SupabaseClient<Database>,
  table: string,
  conflictTarget: string,
  stableCodeField: string,
  stableCode: string,
  payload: Record<string, unknown>
) {
  const { error: upsertError } = await supabase.from(table as never).upsert(payload as never, { onConflict: conflictTarget });

  if (upsertError) {
    handleSupabaseFailure(table, stableCode, upsertError.message);
  }

  const { data, error: fetchError } = await supabase.from(table as never).select("id").eq(stableCodeField as never, stableCode as never).maybeSingle();

  if (fetchError) {
    handleSupabaseFailure(table, stableCode, fetchError.message);
  }

  const id = (data as { id?: string } | null)?.id;

  if (!id) {
    handleSupabaseFailure(table, stableCode, `Upsert completed, but no row could be resolved by ${stableCodeField}.`);
  }

  return id;
}

function confirmStableCodeUpsertTargets() {
  return [
    "curriculum_programs.program_code",
    "curriculum_grades.grade_code",
    "curriculum_units.unit_code",
    "lessons.lesson_code",
    "lesson_sections.section_code",
    "activities.activity_code",
    "lesson_resources.resource_code",
    "assessment_templates.template_code"
  ];
}

async function applyImport(prepared: PreparedImport) {
  console.log("Apply mode will upsert curriculum content into Supabase. No deletes will be performed.");
  console.log("Stable-code conflict targets confirmed from existing migrations:");
  confirmStableCodeUpsertTargets().forEach((target) => console.log(`- ${target}`));
  console.log("");

  const supabase = createImportClient();
  const maps: IdMaps = {
    programIdsByCode: new Map(),
    unitIdsByCode: new Map(),
    lessonIdsByCode: new Map()
  };
  const summary: ApplySummary = {
    programs: 0,
    grades: 0,
    units: 0,
    lessons: 0,
    lessonSections: 0,
    activities: 0,
    resources: 0,
    assessmentTemplates: 0
  };

  for (const program of prepared.programs) {
    const id = await upsertAndFetchId(supabase, "curriculum_programs", "program_code", "program_code", program.program_code, program);
    maps.programIdsByCode.set(program.program_code, id);
    summary.programs += 1;
  }

  for (const grade of prepared.grades) {
    const programId = maps.programIdsByCode.get(grade.program_code);

    if (!programId) {
      handleSupabaseFailure("curriculum_grades", grade.grade_code, `Could not resolve program_code ${grade.program_code}.`);
    }

    await upsertAndFetchId(supabase, "curriculum_grades", "grade_code", "grade_code", grade.grade_code, {
      program_id: programId,
      grade_code: grade.grade_code,
      grade_level: grade.grade_level,
      grade_band: grade.grade_band,
      title: grade.title,
      sequence_order: grade.sequence_order
    });
    summary.grades += 1;
  }

  for (const unit of prepared.units) {
    const programId = maps.programIdsByCode.get(unit.program_code);

    if (!programId) {
      handleSupabaseFailure("curriculum_units", unit.unit_code, `Could not resolve program_code ${unit.program_code}.`);
    }

    const id = await upsertAndFetchId(supabase, "curriculum_units", "unit_code", "unit_code", unit.unit_code, {
      program_id: programId,
      unit_code: unit.unit_code,
      title: unit.title,
      description: unit.description,
      grade_band: unit.grade_band,
      grade_level: unit.grade_level,
      learning_goals: unit.learning_goals,
      duration_weeks: unit.duration_weeks,
      sequence_order: unit.sequence_order,
      is_active: unit.is_active,
      status: unit.status
    });
    maps.unitIdsByCode.set(unit.unit_code, id);
    summary.units += 1;
  }

  for (const lesson of prepared.lessons) {
    const unitId = maps.unitIdsByCode.get(lesson.unit_code);

    if (!unitId) {
      handleSupabaseFailure("lessons", lesson.lesson_code, `Could not resolve unit_code ${lesson.unit_code}.`);
    }

    const id = await upsertAndFetchId(supabase, "lessons", "lesson_code", "lesson_code", lesson.lesson_code, {
      curriculum_unit_id: unitId,
      lesson_code: lesson.lesson_code,
      display_code: lesson.display_code,
      title: lesson.title,
      summary: lesson.summary,
      grade_band: lesson.grade_band,
      grade_level: lesson.grade_level,
      sequence_order: lesson.sequence_order,
      estimated_minutes: lesson.estimated_minutes,
      duration_minutes: lesson.duration_minutes,
      anchor_theme: lesson.anchor_theme,
      tool_use_status: lesson.tool_use_status,
      learning_objectives: lesson.learning_objectives,
      essential_question: lesson.essential_question,
      i_can_statement: lesson.i_can_statement,
      student_challenge: lesson.student_challenge,
      student_output: lesson.student_output,
      success_criteria_json: lesson.success_criteria_json,
      alignment_json: lesson.alignment_json,
      localization_json: lesson.localization_json,
      logistics_json: lesson.logistics_json,
      materials_needed: lesson.materials_needed,
      vocabulary: lesson.vocabulary,
      teacher_prep_notes: lesson.teacher_prep_notes,
      status: lesson.status,
      content_version: lesson.content_version,
      is_active: lesson.is_active
    });
    maps.lessonIdsByCode.set(lesson.lesson_code, id);
    summary.lessons += 1;
  }

  for (const section of prepared.lessonSections) {
    const lessonId = maps.lessonIdsByCode.get(section.lesson_code);

    if (!lessonId) {
      handleSupabaseFailure("lesson_sections", section.section_code, `Could not resolve lesson_code ${section.lesson_code}.`);
    }

    await upsertAndFetchId(supabase, "lesson_sections", "section_code", "section_code", section.section_code, {
      lesson_id: lessonId,
      section_code: section.section_code,
      section_type: section.section_type,
      title: section.title,
      content: section.content,
      content_json: section.content_json,
      sequence_order: section.sequence_order,
      access_type: section.access_type,
      estimated_minutes: section.estimated_minutes
    });
    summary.lessonSections += 1;
  }

  for (const activity of prepared.activities) {
    const lessonId = maps.lessonIdsByCode.get(activity.lesson_code);

    if (!lessonId) {
      handleSupabaseFailure("activities", activity.activity_code, `Could not resolve lesson_code ${activity.lesson_code}.`);
    }

    await upsertAndFetchId(supabase, "activities", "activity_code", "activity_code", activity.activity_code, {
      lesson_id: lessonId,
      activity_code: activity.activity_code,
      title: activity.title,
      activity_type: activity.activity_type,
      delivery_mode: activity.delivery_mode,
      access_type: activity.access_type,
      is_smartboard_ready: activity.is_smartboard_ready,
      instructions: activity.instructions,
      activity_json: activity.activity_json,
      sequence_order: activity.sequence_order
    });
    summary.activities += 1;
  }

  for (const resource of prepared.resources) {
    const lessonId = maps.lessonIdsByCode.get(resource.lesson_code);

    if (!lessonId) {
      handleSupabaseFailure("lesson_resources", resource.resource_code, `Could not resolve lesson_code ${resource.lesson_code}.`);
    }

    await upsertAndFetchId(supabase, "lesson_resources", "resource_code", "resource_code", resource.resource_code, {
      lesson_id: lessonId,
      resource_code: resource.resource_code,
      resource_type: resource.resource_type,
      title: resource.title,
      description: resource.description,
      file_url: resource.file_url,
      content: resource.content,
      access_type: resource.access_type,
      visibility: resource.visibility,
      is_printable: resource.is_printable,
      is_downloadable: resource.is_downloadable,
      storage_path: resource.storage_path,
      mime_type: resource.mime_type,
      estimated_pages: resource.estimated_pages,
      display_mode: resource.display_mode,
      sort_order: resource.sort_order
    });
    summary.resources += 1;
  }

  for (const template of prepared.assessmentTemplates) {
    const lessonId = maps.lessonIdsByCode.get(template.lesson_code);

    if (!lessonId) {
      handleSupabaseFailure("assessment_templates", template.template_code, `Could not resolve lesson_code ${template.lesson_code}.`);
    }

    await upsertAndFetchId(supabase, "assessment_templates", "template_code", "template_code", template.template_code, {
      lesson_id: lessonId,
      template_code: template.template_code,
      title: template.title,
      description: template.description,
      assessment_type: template.assessment_type,
      criteria_json: template.criteria_json,
      access_type: template.access_type,
      sequence_order: template.sequence_order
    });
    summary.assessmentTemplates += 1;
  }

  console.log("Curriculum import apply completed.");
  console.log(`- Programs inserted/updated: ${summary.programs}`);
  console.log(`- Grades inserted/updated: ${summary.grades}`);
  console.log(`- Units inserted/updated: ${summary.units}`);
  console.log(`- Lessons inserted/updated: ${summary.lessons}`);
  console.log(`- Lesson sections inserted/updated: ${summary.lessonSections}`);
  console.log(`- Activities inserted/updated: ${summary.activities}`);
  console.log(`- Resources inserted/updated: ${summary.resources}`);
  console.log(`- Assessment templates inserted/updated: ${summary.assessmentTemplates}`);
  console.log("No deletes were performed.");
}

async function main() {
  const mode = getMode();
  const sourceDir = getSourceDirFromArgs();
  const prepared = prepareImport(sourceDir);

  if (!prepared) {
    process.exit(1);
  }

  if (mode === "dry-run") {
    printPlan(preparePlan(prepared));
  } else {
    await applyImport(prepared);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Curriculum import failed.");
  process.exit(1);
});
