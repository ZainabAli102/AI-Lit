import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

export type CsvRow = {
  rowNumber: number;
  values: Record<string, string>;
};

export type CsvFile = {
  path: string;
  headers: string[];
  rows: CsvRow[];
};

export type ValidationError = {
  file: string;
  rowNumber?: number;
  field?: string;
  message: string;
};

type FileConfig = {
  path: string;
  headers: string[];
  required: string[];
  unique?: string;
};

export type ValidateCurriculumImportOptions = {
  sourceDir?: string;
};

const defaultTemplateDir = path.join(process.cwd(), "docs", "import_templates");

function resolveSourceDir(sourceDir?: string) {
  return path.resolve(process.cwd(), sourceDir ?? defaultTemplateDir);
}

export function getSourceDirFromArgs(args = process.argv.slice(2)) {
  const sourceDirIndex = args.indexOf("--source-dir");

  if (sourceDirIndex === -1) {
    return undefined;
  }

  const sourceDir = args[sourceDirIndex + 1];

  if (!sourceDir || sourceDir.startsWith("--")) {
    console.error("Missing value for --source-dir.");
    process.exit(1);
  }

  return sourceDir;
}

function createFiles(sourceDir: string) {
  return {
    programs: path.join(sourceDir, "programs.csv"),
    grades: path.join(sourceDir, "grades.csv"),
    units: path.join(sourceDir, "units.csv"),
    lessons: path.join(sourceDir, "lessons.csv"),
    lessonSections: path.join(sourceDir, "lesson_sections.csv"),
    activities: path.join(sourceDir, "activities.csv"),
    resources: path.join(sourceDir, "resources.csv"),
    assessmentTemplates: path.join(sourceDir, "assessment_templates.csv")
  };
}

function createFileConfigs(sourceDir: string): Record<string, FileConfig> {
  const files = createFiles(sourceDir);

  return {
  programs: {
    path: files.programs,
    headers: ["program_code", "title", "description", "grade_band", "version", "status"],
    required: ["program_code", "title", "grade_band", "version", "status"],
    unique: "program_code"
  },
  grades: {
    path: files.grades,
    headers: ["program_code", "grade_code", "grade_level", "grade_band", "title", "sequence_order"],
    required: ["program_code", "grade_code", "grade_level", "grade_band", "title", "sequence_order"],
    unique: "grade_code"
  },
  units: {
    path: files.units,
    headers: ["program_code", "grade_code", "unit_code", "title", "description", "grade_band", "grade_level", "learning_goals", "duration_weeks", "sequence_order", "is_active", "status"],
    required: ["program_code", "grade_code", "unit_code", "title", "grade_band", "grade_level", "sequence_order", "is_active", "status"],
    unique: "unit_code"
  },
  lessons: {
    path: files.lessons,
    headers: [
      "grade_code",
      "unit_code",
      "lesson_code",
      "display_code",
      "title",
      "summary",
      "grade_band",
      "grade_level",
      "sequence_order",
      "estimated_minutes",
      "duration_minutes",
      "anchor_theme",
      "tool_use_status",
      "learning_objectives",
      "essential_question",
      "i_can_statement",
      "student_challenge",
      "student_output",
      "success_criteria_json",
      "alignment_json",
      "localization_json",
      "logistics_json",
      "materials_needed",
      "vocabulary",
      "teacher_prep_notes",
      "status",
      "content_version",
      "is_active"
    ],
    required: ["grade_code", "unit_code", "lesson_code", "display_code", "title", "grade_band", "grade_level", "sequence_order", "tool_use_status", "status", "content_version", "is_active"],
    unique: "lesson_code"
  },
  lessonSections: {
    path: files.lessonSections,
    headers: ["lesson_code", "section_code", "section_type", "title", "content", "content_json", "sequence_order", "access_type", "estimated_minutes"],
    required: ["lesson_code", "section_code", "section_type", "title", "sequence_order", "access_type"],
    unique: "section_code"
  },
  activities: {
    path: files.activities,
    headers: ["lesson_code", "activity_code", "title", "activity_type", "delivery_mode", "access_type", "is_smartboard_ready", "instructions", "activity_json", "sequence_order"],
    required: ["lesson_code", "activity_code", "title", "activity_type", "delivery_mode", "access_type", "is_smartboard_ready", "activity_json", "sequence_order"],
    unique: "activity_code"
  },
  resources: {
    path: files.resources,
    headers: ["lesson_code", "resource_code", "resource_type", "title", "description", "file_url", "content", "access_type", "visibility", "is_printable", "is_downloadable", "storage_path", "mime_type", "estimated_pages", "display_mode", "sort_order"],
    required: ["lesson_code", "resource_code", "resource_type", "title", "access_type", "visibility", "is_printable", "is_downloadable", "display_mode", "sort_order"],
    unique: "resource_code"
  },
  assessmentTemplates: {
    path: files.assessmentTemplates,
    headers: ["lesson_code", "template_code", "title", "description", "assessment_type", "criteria_json", "access_type", "sequence_order"],
    required: ["lesson_code", "template_code", "title", "assessment_type", "criteria_json", "access_type", "sequence_order"],
    unique: "template_code"
  }
  };
}

const allowed = {
  accessType: new Set(["platform_only", "printable", "downloadable", "teacher_only", "student_visible_later"]),
  activityType: new Set([
    "sorting_cards",
    "matching_cards",
    "matching",
    "true_false",
    "discussion_prompt",
    "pattern_recognition",
    "pattern_spotting",
    "scenario_cards",
    "scenario_reveal",
    "class_poll",
    "reflection_prompt",
    "sequencing",
    "many-to-one matching",
    "many_to_one_matching",
    "table",
    "chart",
    "reason",
    "tricky",
    "clearer",
    "icon",
    "fairness",
    "lenses",
    "kind_steps",
    "fair_rule",
    "rounds",
    "shared_deck",
    "printable_asset",
    "no_single_answer",
    "grid_hint",
    "tray_reference"
  ]),
  deliveryMode: new Set(["teacher_led", "student_account", "hybrid"]),
  displayMode: new Set(["inline", "print", "smartboard", "download", "link"]),
  gradeBand: new Set(["k_to_6", "grades_7_to_12"]),
  resourceType: new Set(["teacher_guide", "worksheet", "printable_material", "smartboard_activity", "support_activity", "extension_activity", "assessment", "rubric", "student_activity"]),
  sectionType: new Set([
    "overview",
    "learning_objectives",
    "teacher_script",
    "discussion_prompt",
    "lesson_flow",
    "guided_activity",
    "reflection",
    "differentiation",
    "extension",
    "assessment_guidance",
    "hook_opening",
    "movement_play_notes",
    "worked_example",
    "tool_platform_setup",
    "data_privacy_setup",
    "design_intent",
    "misconceptions_pitfalls",
    "safety_policy_notes",
    "academic_integrity_note",
    "ai_use_disclosure",
    "mena_contextualization",
    "language_integration",
    "family_home_connection"
  ]),
  templateType: new Set(["class_checklist"]),
  toolUseStatus: new Set(["teacher_led_demo", "no_tool", "teacher_demo", "teacher_facilitated", "student_tool_later"]),
  visibility: new Set(["teacher", "student", "admin"])
};

const jsonFields = new Set(["activity_json", "criteria_json", "success_criteria_json", "alignment_json", "localization_json", "logistics_json", "metadata_json", "content_json"]);

function parseCsv(content: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentValue = "";
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const nextChar = content[index + 1];

    if (char === "\"") {
      if (inQuotes && nextChar === "\"") {
        currentValue += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      currentRow.push(currentValue);
      currentValue = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }

      currentRow.push(currentValue);
      rows.push(currentRow);
      currentRow = [];
      currentValue = "";
      continue;
    }

    currentValue += char;
  }

  if (currentValue.length > 0 || currentRow.length > 0) {
    currentRow.push(currentValue);
    rows.push(currentRow);
  }

  return rows.filter((row) => row.some((value) => value.trim().length > 0));
}

function readCsv(filePath: string, errors: ValidationError[]): CsvFile {
  const relativePath = path.relative(process.cwd(), filePath);

  if (!existsSync(filePath)) {
    errors.push({ file: relativePath, message: "File is missing." });
    return { path: relativePath, headers: [], rows: [] };
  }

  const parsedRows = parseCsv(readFileSync(filePath, "utf8"));
  const headers = parsedRows[0] ?? [];

  return {
    path: relativePath,
    headers,
    rows: parsedRows.slice(1).map((row, rowIndex) => {
      const values: Record<string, string> = {};
      headers.forEach((header, headerIndex) => {
        values[header] = row[headerIndex]?.trim() ?? "";
      });
      return { rowNumber: rowIndex + 2, values };
    })
  };
}

function addError(errors: ValidationError[], file: CsvFile, rowNumber: number | undefined, field: string | undefined, message: string) {
  errors.push({ file: file.path, rowNumber, field, message });
}

export function field(row: CsvRow, name: string) {
  return row.values[name]?.trim() ?? "";
}

function validateHeaders(file: CsvFile, config: FileConfig, errors: ValidationError[]) {
  const headerSet = new Set(file.headers);

  config.headers.forEach((header) => {
    if (!headerSet.has(header)) {
      addError(errors, file, undefined, header, "Required column is missing.");
    }
  });
}

function validateRequiredValues(file: CsvFile, config: FileConfig, errors: ValidationError[]) {
  file.rows.forEach((row) => {
    config.required.forEach((column) => {
      if (!field(row, column)) {
        addError(errors, file, row.rowNumber, column, "Required value is empty.");
      }
    });
  });
}

function validateUniqueCodes(file: CsvFile, config: FileConfig, errors: ValidationError[]) {
  if (!config.unique) {
    return;
  }

  const seen = new Map<string, number>();

  file.rows.forEach((row) => {
    const value = field(row, config.unique!);

    if (!value) {
      return;
    }

    const firstRow = seen.get(value);

    if (firstRow) {
      addError(errors, file, row.rowNumber, config.unique, `Duplicate stable code "${value}". First seen on row ${firstRow}.`);
    } else {
      seen.set(value, row.rowNumber);
    }
  });
}

function validateAllowedValue(file: CsvFile, row: CsvRow, column: string, allowedValues: Set<string>, errors: ValidationError[]) {
  const value = field(row, column);

  if (value && !allowedValues.has(value)) {
    addError(errors, file, row.rowNumber, column, `Invalid value "${value}". Allowed values: ${Array.from(allowedValues).join(", ")}.`);
  }
}

function validateOptionalPositiveInteger(file: CsvFile, row: CsvRow, column: string, errors: ValidationError[]) {
  const value = field(row, column);

  if (!value) {
    return;
  }

  if (!/^\d+$/.test(value)) {
    addError(errors, file, row.rowNumber, column, `Invalid value "${value}". Leave blank or use a positive whole number.`);
    return;
  }

  if (Number(value) <= 0) {
    addError(errors, file, row.rowNumber, column, "Use a positive whole number, or leave this blank when minutes are not applicable.");
  }
}

function parseJsonField(file: CsvFile, row: CsvRow, column: string, errors: ValidationError[]) {
  const value = field(row, column);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch (error) {
    addError(errors, file, row.rowNumber, column, `Invalid JSON. ${error instanceof Error ? error.message : "Could not parse value."}`);
    return null;
  }
}

function validateJsonFields(file: CsvFile, errors: ValidationError[]) {
  const fieldsToCheck = file.headers.filter((header) => jsonFields.has(header));

  file.rows.forEach((row) => {
    fieldsToCheck.forEach((column) => {
      parseJsonField(file, row, column, errors);
    });
  });
}

function hasArray(value: unknown, key: string) {
  return typeof value === "object" && value !== null && Array.isArray((value as Record<string, unknown>)[key]);
}

function hasString(value: unknown, key: string) {
  return typeof value === "object" && value !== null && typeof (value as Record<string, unknown>)[key] === "string";
}

function hasOptionalString(value: unknown, key: string) {
  return typeof value === "object" && value !== null && ((value as Record<string, unknown>)[key] === undefined || typeof (value as Record<string, unknown>)[key] === "string");
}

function validateOptionalV14Fields(file: CsvFile, row: CsvRow, activityJson: Record<string, unknown>, errors: ValidationError[]) {
  if (!hasOptionalString(activityJson, "target_category")) {
    addError(errors, file, row.rowNumber, "activity_json", "target_category must be a string when provided.");
  }

  if (activityJson.accessibility !== undefined) {
    const accessibility = activityJson.accessibility;

    if (!accessibility || typeof accessibility !== "object" || Array.isArray(accessibility)) {
      addError(errors, file, row.rowNumber, "activity_json", "accessibility must be an object when provided.");
    } else {
      Object.entries(accessibility as Record<string, unknown>).forEach(([key, value]) => {
        if (typeof value !== "string" && typeof value !== "boolean" && !Array.isArray(value)) {
          addError(errors, file, row.rowNumber, "activity_json", `accessibility.${key} must be a string, boolean, or string array when provided.`);
        }
      });
    }
  }
}

function validateOptionalConfidence(file: CsvFile, row: CsvRow, item: unknown, pathLabel: string, errors: ValidationError[]) {
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    return;
  }

  if (!hasOptionalString(item, "confidence")) {
    addError(errors, file, row.rowNumber, "activity_json", `${pathLabel}.confidence must be a string when provided.`);
  }
}

function validateActivityJson(file: CsvFile, errors: ValidationError[]) {
  file.rows.forEach((row) => {
    const activityType = field(row, "activity_type");
    const activityJson = parseJsonField(file, row, "activity_json", errors);

    if (!activityJson || typeof activityJson !== "object" || Array.isArray(activityJson)) {
      return;
    }

    const activityJsonRecord = activityJson as Record<string, unknown>;
    validateOptionalV14Fields(file, row, activityJsonRecord, errors);

    if (activityType === "sorting_cards") {
      if (!hasArray(activityJsonRecord, "categories")) {
        addError(errors, file, row.rowNumber, "activity_json", "sorting_cards activity_json must include a categories array.");
      } else {
        (activityJsonRecord.categories as unknown[]).forEach((category, categoryIndex) => {
          if (category && typeof category === "object" && !Array.isArray(category) && !hasOptionalString(category, "shared_feature")) {
            addError(errors, file, row.rowNumber, "activity_json", `sorting_cards category ${categoryIndex + 1}.shared_feature must be a string when provided.`);
          }
        });
      }

      if (!hasArray(activityJsonRecord, "cards")) {
        addError(errors, file, row.rowNumber, "activity_json", "sorting_cards activity_json must include a cards array.");
      } else {
        (activityJsonRecord.cards as unknown[]).forEach((card, cardIndex) => {
          validateOptionalConfidence(file, row, card, `sorting_cards card ${cardIndex + 1}`, errors);
        });
      }
    }

    if (activityType === "matching_cards") {
      const hasLeftItems = hasArray(activityJsonRecord, "leftItems") || hasArray(activityJsonRecord, "left_items");
      const hasRightItems = hasArray(activityJsonRecord, "rightItems") || hasArray(activityJsonRecord, "right_items");
      const hasAnswerKey = hasArray(activityJsonRecord, "matches") || hasArray(activityJsonRecord, "answer_key");

      if (!hasLeftItems) {
        addError(errors, file, row.rowNumber, "activity_json", "matching_cards activity_json must include leftItems or left_items.");
      }

      if (!hasRightItems) {
        addError(errors, file, row.rowNumber, "activity_json", "matching_cards activity_json must include rightItems or right_items.");
      }

      if (!hasAnswerKey) {
        addError(errors, file, row.rowNumber, "activity_json", "matching_cards activity_json must include matches or answer_key.");
      }

      [...((activityJsonRecord.leftItems as unknown[]) ?? []), ...((activityJsonRecord.left_items as unknown[]) ?? [])].forEach((item, itemIndex) => {
        validateOptionalConfidence(file, row, item, `matching_cards left item ${itemIndex + 1}`, errors);
      });
      [...((activityJsonRecord.rightItems as unknown[]) ?? []), ...((activityJsonRecord.right_items as unknown[]) ?? [])].forEach((item, itemIndex) => {
        validateOptionalConfidence(file, row, item, `matching_cards right item ${itemIndex + 1}`, errors);
      });
    }

    if (activityType === "pattern_spotting") {
      const render = typeof activityJsonRecord.render === "string" ? activityJsonRecord.render : "";
      const rounds = Array.isArray(activityJsonRecord.rounds) ? (activityJsonRecord.rounds as unknown[]) : [];

      if (render && render !== "color_swatches" && render !== "shapes") {
        addError(errors, file, row.rowNumber, "activity_json", "pattern_spotting render must be color_swatches or shapes.");
      }

      if (rounds.length === 0) {
        addError(errors, file, row.rowNumber, "activity_json", "pattern_spotting activity_json must include a rounds array.");
        return;
      }

      rounds.forEach((round, roundIndex) => {
        if (!round || typeof round !== "object" || Array.isArray(round)) {
          addError(errors, file, row.rowNumber, "activity_json", `pattern_spotting round ${roundIndex + 1} must be an object.`);
          return;
        }

        if (!hasString(round, "id")) {
          addError(errors, file, row.rowNumber, "activity_json", `pattern_spotting round ${roundIndex + 1} must include id.`);
        }

        if (!hasArray(round, "sequence")) {
          addError(errors, file, row.rowNumber, "activity_json", `pattern_spotting round ${roundIndex + 1} must include a sequence array.`);
        }

        if (!hasArray(round, "options")) {
          addError(errors, file, row.rowNumber, "activity_json", `pattern_spotting round ${roundIndex + 1} must include an options array.`);
        }

        if (!hasString(round, "next")) {
          addError(errors, file, row.rowNumber, "activity_json", `pattern_spotting round ${roundIndex + 1} must include next.`);
        }

        validateOptionalConfidence(file, row, round, `pattern_spotting round ${roundIndex + 1}`, errors);

        // repeating_unit is recommended for reveal highlighting, but early production rows can still validate without it.
      });
    }

    if (activityType === "scenario_reveal") {
      const scenarios = Array.isArray(activityJsonRecord.scenarios) ? (activityJsonRecord.scenarios as unknown[]) : [];

      if (scenarios.length > 0) {
        scenarios.forEach((scenario, scenarioIndex) => {
          if (!scenario || typeof scenario !== "object" || Array.isArray(scenario)) {
            addError(errors, file, row.rowNumber, "activity_json", `scenario_reveal scenario ${scenarioIndex + 1} must be an object.`);
            return;
          }

          if (!hasString(scenario, "id")) {
            addError(errors, file, row.rowNumber, "activity_json", `scenario_reveal scenario ${scenarioIndex + 1} must include id.`);
          }

          if (!hasString(scenario, "scenario")) {
            addError(errors, file, row.rowNumber, "activity_json", `scenario_reveal scenario ${scenarioIndex + 1} must include scenario.`);
          }

          if (!hasString(scenario, "prompt")) {
            addError(errors, file, row.rowNumber, "activity_json", `scenario_reveal scenario ${scenarioIndex + 1} must include prompt.`);
          }

          if (!hasString(scenario, "reveal")) {
            addError(errors, file, row.rowNumber, "activity_json", `scenario_reveal scenario ${scenarioIndex + 1} must include reveal.`);
          }

          if (!hasOptionalString(scenario, "discussion")) {
            addError(errors, file, row.rowNumber, "activity_json", `scenario_reveal scenario ${scenarioIndex + 1}.discussion must be a string when provided.`);
          }

          validateOptionalConfidence(file, row, scenario, `scenario_reveal scenario ${scenarioIndex + 1}`, errors);
        });
      } else if (!hasString(activityJsonRecord, "scenario") && !hasString(activityJsonRecord, "prompt") && !hasString(activityJsonRecord, "reveal")) {
        addError(errors, file, row.rowNumber, "activity_json", "scenario_reveal activity_json must include scenarios[] or the original scenario, prompt, and reveal fields.");
      }
    }
  });
}

function valuesFor(file: CsvFile, column: string) {
  return new Set(file.rows.map((row) => field(row, column)).filter(Boolean));
}

function validateReference(file: CsvFile, row: CsvRow, column: string, validValues: Set<string>, errors: ValidationError[]) {
  const value = field(row, column);

  if (value && !validValues.has(value)) {
    addError(errors, file, row.rowNumber, column, `Referenced ${column} "${value}" was not found in the related template.`);
  }
}

export function formatValidationError(error: ValidationError) {
  const row = error.rowNumber ? ` row ${error.rowNumber}` : "";
  const fieldName = error.field ? ` field ${error.field}` : "";
  return `- ${error.file}${row}${fieldName}: ${error.message}`;
}

export function validateCurriculumImport(options: ValidateCurriculumImportOptions = {}) {
  const errors: ValidationError[] = [];
  const fileConfigs = createFileConfigs(resolveSourceDir(options.sourceDir));
  const csvFiles = Object.fromEntries(
    Object.entries(fileConfigs).map(([key, config]) => [key, readCsv(config.path, errors)])
  ) as Record<keyof typeof fileConfigs, CsvFile>;

  Object.entries(fileConfigs).forEach(([key, config]) => {
    const file = csvFiles[key as keyof typeof fileConfigs];
    validateHeaders(file, config, errors);
    validateRequiredValues(file, config, errors);
    validateUniqueCodes(file, config, errors);
    validateJsonFields(file, errors);
  });

  const programCodes = valuesFor(csvFiles.programs, "program_code");
  const gradeCodes = valuesFor(csvFiles.grades, "grade_code");
  const unitCodes = valuesFor(csvFiles.units, "unit_code");
  const lessonCodes = valuesFor(csvFiles.lessons, "lesson_code");

  csvFiles.programs.rows.forEach((row) => {
    validateAllowedValue(csvFiles.programs, row, "grade_band", allowed.gradeBand, errors);
  });

  csvFiles.grades.rows.forEach((row) => {
    validateReference(csvFiles.grades, row, "program_code", programCodes, errors);
    validateAllowedValue(csvFiles.grades, row, "grade_band", allowed.gradeBand, errors);
  });

  csvFiles.units.rows.forEach((row) => {
    validateReference(csvFiles.units, row, "program_code", programCodes, errors);
    validateReference(csvFiles.units, row, "grade_code", gradeCodes, errors);
    validateAllowedValue(csvFiles.units, row, "grade_band", allowed.gradeBand, errors);
  });

  csvFiles.lessons.rows.forEach((row) => {
    validateReference(csvFiles.lessons, row, "grade_code", gradeCodes, errors);
    validateReference(csvFiles.lessons, row, "unit_code", unitCodes, errors);
    validateAllowedValue(csvFiles.lessons, row, "grade_band", allowed.gradeBand, errors);
    validateAllowedValue(csvFiles.lessons, row, "tool_use_status", allowed.toolUseStatus, errors);
  });

  csvFiles.lessonSections.rows.forEach((row) => {
    validateReference(csvFiles.lessonSections, row, "lesson_code", lessonCodes, errors);
    validateAllowedValue(csvFiles.lessonSections, row, "section_type", allowed.sectionType, errors);
    validateAllowedValue(csvFiles.lessonSections, row, "access_type", allowed.accessType, errors);
    validateOptionalPositiveInteger(csvFiles.lessonSections, row, "estimated_minutes", errors);
  });

  csvFiles.activities.rows.forEach((row) => {
    validateReference(csvFiles.activities, row, "lesson_code", lessonCodes, errors);
    validateAllowedValue(csvFiles.activities, row, "activity_type", allowed.activityType, errors);
    validateAllowedValue(csvFiles.activities, row, "delivery_mode", allowed.deliveryMode, errors);
    validateAllowedValue(csvFiles.activities, row, "access_type", allowed.accessType, errors);
  });
  validateActivityJson(csvFiles.activities, errors);

  csvFiles.resources.rows.forEach((row) => {
    validateReference(csvFiles.resources, row, "lesson_code", lessonCodes, errors);
    validateAllowedValue(csvFiles.resources, row, "resource_type", allowed.resourceType, errors);
    validateAllowedValue(csvFiles.resources, row, "access_type", allowed.accessType, errors);
    validateAllowedValue(csvFiles.resources, row, "visibility", allowed.visibility, errors);
    validateAllowedValue(csvFiles.resources, row, "display_mode", allowed.displayMode, errors);

    if (field(row, "access_type") === "printable" && field(row, "is_printable") !== "true") {
      addError(errors, csvFiles.resources, row.rowNumber, "is_printable", "Printable resources must set is_printable to true.");
    }

    if (field(row, "access_type") === "downloadable" && field(row, "is_downloadable") !== "true") {
      addError(errors, csvFiles.resources, row.rowNumber, "is_downloadable", "Downloadable resources must set is_downloadable to true.");
    }
  });

  csvFiles.assessmentTemplates.rows.forEach((row) => {
    validateReference(csvFiles.assessmentTemplates, row, "lesson_code", lessonCodes, errors);
    validateAllowedValue(csvFiles.assessmentTemplates, row, "assessment_type", allowed.templateType, errors);
    validateAllowedValue(csvFiles.assessmentTemplates, row, "access_type", allowed.accessType, errors);
  });

  return {
    csvFiles,
    errors,
    ok: errors.length === 0
  };
}

function runCli() {
  const result = validateCurriculumImport({ sourceDir: getSourceDirFromArgs() });

  if (result.ok) {
    console.log("Curriculum import validation passed.");
    return;
  }

  console.error("Curriculum import validation failed.");
  result.errors.forEach((error) => {
    console.error(formatValidationError(error));
  });
  process.exitCode = 1;
}

if (process.argv[1]?.endsWith("validate-curriculum-import.ts")) {
  runCli();
}
