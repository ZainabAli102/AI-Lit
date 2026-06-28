# CONNECTED MENA Curriculum Import Template

This package defines the working import format for preparing CONNECTED MENA curriculum content before a full import UI exists. It is designed for curriculum developers, reviewers, and implementation staff who need a consistent way to prepare real lesson content across grades, units, and lessons.

The current platform does not import these CSVs automatically yet. For now, the files in `docs/import_templates/` are production templates and sample source files that can later drive a scripted bulk import or admin import workflow.

## Purpose

The import template keeps curriculum production structured around one master lesson record. A lesson begins with a stable lesson code and core planning metadata, then related teacher guide sections, smartboard activities, printable materials, platform-only resources, and assessment templates attach to that same lesson code.

This protects CONNECTED MENA curriculum content by keeping the core lesson experience inside the platform. The platform should not become a library of downloadable PDFs. Printable files are allowed only for classroom materials that teachers genuinely need to hand out, such as worksheets, reflection sheets, cards, mats, and simple handouts.

## Master Lesson Record

Each row in `lessons.csv` represents one master lesson.

The master lesson provides:

- Stable import identity: `lesson_code`
- Teacher-facing display identity: `display_code`
- Grade and unit placement through `unit_code`
- Lesson title, summary, duration, vocabulary, materials, and teacher prep
- Production-template metadata such as anchor theme, I-can statement, challenge, output, success criteria, alignment, localization, and logistics

Related files use `lesson_code` to attach content:

- `lesson_sections.csv` creates teacher guide and platform-rendered lesson flow content.
- `activities.csv` creates structured smartboard activities.
- `resources.csv` creates printable or platform-only resource records.
- `assessment_templates.csv` creates reusable lesson assessment/checklist guidance.

## Stable Codes

Use stable codes for all curriculum import relationships.

- `program_code`: top-level program, for example `CM-AIL-K6`
- `grade_code`: grade within a program, for example `CM-AIL-G1`
- `unit_code`: unit within a grade, for example `CM-AIL-G1-U1`
- `lesson_code`: long platform/import key, for example `CM-AIL-G1-U1-L1`
- `display_code`: short human-facing curriculum code, for example `G1-01`
- `section_code`, `activity_code`, `resource_code`, `template_code`: stable child-record keys

`lesson_code` should not change once content is imported. `display_code` can be used in teacher-facing pages and printed planning documents. Future bulk import should upsert by stable codes, not random UUIDs.

## Content Protection

Use `access_type` consistently.

- `platform_only`: default for core curriculum rendered inside the platform. This should not appear as a teacher-facing badge.
- `teacher_only`: teacher guidance, facilitation notes, answer keys, assessment notes, misconceptions, safety notes, and planning support.
- `printable`: classroom worksheets, handouts, cards, mats, reflection sheets, and other materials teachers need to print.
- `downloadable`: rare exception for files that are intentionally allowed to be downloaded.
- `student_visible_later`: reserved for future student-account delivery. Do not use for MVP 1 K to Grade 6 teacher-led delivery.

Core teacher guides, lesson flow, answer keys, facilitation notes, smartboard data, and assessment guidance should be `platform_only` or `teacher_only`. Printable should be limited to classroom handouts. Downloadable should be used only when CONNECTED MENA intentionally permits file download.

## Template Files

Import files live in `docs/import_templates/`:

- `programs.csv`
- `grades.csv`
- `units.csv`
- `lessons.csv`
- `lesson_sections.csv`
- `activities.csv`
- `resources.csv`
- `assessment_templates.csv`

Each file includes headers and sample Grade 1 demo rows. The sample rows are demo content only and are easy to replace when CONNECTED MENA finalizes the real curriculum.

## Recommended Import Order

Import parent records before child records:

1. `programs.csv`
2. `grades.csv`
3. `units.csv`
4. `lessons.csv`
5. `lesson_sections.csv`
6. `activities.csv`
7. `resources.csv`
8. `assessment_templates.csv`

Future import scripts should resolve IDs internally:

- Find `program_id` by `program_code`
- Find lesson unit by `unit_code`
- Find `lesson_id` by `lesson_code`
- Upsert child rows by their stable codes

## Validating CSV Files Before Import

Run the local validator before handing CSV files to a developer or future import process:

```powershell
npm.cmd run validate:curriculum
```

The validator checks required columns, required values, stable code uniqueness, cross-file references, enum-like values, JSON fields, and the supported smartboard activity JSON shapes. It does not insert data into Supabase.

## Dry-Run Import Preview

Preview how the current CSV files would map to Supabase curriculum tables before any real importer is enabled:

```powershell
npm.cmd run import:curriculum:dry-run
```

The dry-run importer runs the CSV validator first. If validation passes, it maps rows to planned payloads for `curriculum_programs`, `curriculum_grades`, `curriculum_units`, `lessons`, `lesson_sections`, `activities`, `lesson_resources`, and `assessment_templates`. It prints the stable code, parent code, title, and future action for each row.

This command does not write to Supabase. It does not insert, update, delete, or modify any database data.

## Validation Rules

Before importing real content, check:

- Every required stable code is present and unique within its table.
- Every `grade_band` for K to Grade 6 content is `k_to_6`.
- Every K to Grade 6 activity uses `delivery_mode = teacher_led`.
- `lesson_code` values follow a predictable pattern such as `CM-AIL-G1-U1-L1`.
- `display_code` values are short and teacher-friendly, such as `G1-01`.
- JSON columns contain valid JSON.
- `access_type = printable` has `is_printable = true` for resources.
- `access_type = downloadable` has `is_downloadable = true` for resources.
- Smartboard activities use supported `activity_type` values and expected JSON shapes.
- Core curriculum content is not marked downloadable.

## Supported Smartboard JSON Shapes

`sorting_cards`:

```json
{
  "prompt": "Sort each example into the group that fits best.",
  "categories": ["AI-powered", "Computer-powered", "Human-powered"],
  "cards": [
    { "label": "Voice assistant", "correctCategory": "AI-powered" },
    { "label": "Calculator", "correctCategory": "Computer-powered" }
  ]
}
```

`matching_cards`:

```json
{
  "prompt": "Match each example to what it does.",
  "leftItems": [
    { "id": "voice-assistant", "label": "Voice assistant" }
  ],
  "rightItems": [
    { "id": "answers-questions", "label": "Answers spoken questions" }
  ],
  "matches": [
    { "leftId": "voice-assistant", "rightId": "answers-questions" }
  ]
}
```

## Common Mistakes To Avoid

- Do not use UUIDs in curriculum authoring sheets.
- Do not change `lesson_code` after a lesson has been imported.
- Do not put full teacher guides into downloadable resources.
- Do not mark core lesson sections as printable just because they could be printed.
- Do not use `student_visible_later` for K to Grade 6 MVP 1 teacher-led lessons.
- Do not paste invalid JSON into `content_json`, `activity_json`, `criteria_json`, or lesson metadata JSON fields.
- Do not create printable resources without setting `is_printable = true`.
- Do not create downloadable resources without explicit approval and `is_downloadable = true`.

## Replacing Demo Content Later

The current Grade 1 rows are sample/demo content. Real curriculum content can replace them by keeping or intentionally updating the stable codes and rerunning a future bulk upsert.

Recommended workflow:

1. Curriculum team drafts content in the CSV templates.
2. Curriculum QA reviews stable codes, access types, JSON validity, and teacher-facing language.
3. Technical reviewer validates relationships and supported activity JSON.
4. Import script upserts by stable codes.
5. Internal admin curriculum review pages confirm metadata, sections, resources, activities, and assessment templates.
6. Teacher lesson pages are checked for classroom delivery readability.

This keeps CONNECTED MENA content production consistent while preserving future flexibility for scripted imports, admin review, and protected in-platform curriculum delivery.
