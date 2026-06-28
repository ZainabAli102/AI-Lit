import process from "node:process";
import { field, formatValidationError, type CsvRow, validateCurriculumImport } from "./validate-curriculum-import";

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

function requiredDryRun() {
  if (!process.argv.includes("--dry-run")) {
    console.error("This importer currently supports dry-run mode only. Run with --dry-run.");
    process.exit(1);
  }
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

function preparePlan(): ImportPlan | null {
  const validation = validateCurriculumImport();

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
    programs: programs.map((program) => ({
      code: program.program_code,
      title: program.title,
      action: "would upsert"
    })),
    grades: grades.map((grade) => ({
      code: grade.grade_code,
      title: grade.title,
      parent: `program_code ${grade.program_code}`,
      action: "would upsert"
    })),
    units: units.map((unit) => ({
      code: unit.unit_code,
      title: unit.title,
      parent: `grade_code ${unit.grade_code}`,
      action: "would upsert"
    })),
    lessons: lessons.map((lesson) => ({
      code: lesson.lesson_code,
      displayCode: lesson.display_code,
      title: lesson.title,
      parent: `unit_code ${lesson.unit_code}`,
      action: "would upsert"
    })),
    lessonSections: lessonSections.map((section) => ({
      code: section.section_code,
      title: section.title,
      parent: `lesson_code ${section.lesson_code}`,
      action: "would upsert"
    })),
    activities: activities.map((activity) => ({
      code: activity.activity_code,
      title: activity.title,
      parent: `lesson_code ${activity.lesson_code}`,
      action: "would upsert"
    })),
    resources: resources.map((resource) => ({
      code: resource.resource_code,
      title: resource.title,
      parent: `lesson_code ${resource.lesson_code}`,
      action: "would upsert"
    })),
    assessmentTemplates: assessmentTemplates.map((template) => ({
      code: template.template_code,
      title: template.title,
      parent: `lesson_code ${template.lesson_code}`,
      action: "would upsert"
    })),
    warnings
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

requiredDryRun();
const plan = preparePlan();

if (!plan) {
  process.exit(1);
}

printPlan(plan);
