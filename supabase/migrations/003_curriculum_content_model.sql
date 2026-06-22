-- CONNECTED MENA AI Literacy Platform
-- MVP 2 curriculum content read model.
--
-- This migration prepares protected curriculum delivery without adding Supabase Auth,
-- RLS policies, student accounts, or full curriculum editing workflows.

create type public.content_access_type as enum (
  'platform_only',
  'printable',
  'downloadable',
  'teacher_only',
  'student_visible_later'
);

create type public.lesson_section_type as enum (
  'overview',
  'learning_objectives',
  'teacher_script',
  'discussion_prompt',
  'lesson_flow',
  'guided_activity',
  'reflection',
  'differentiation',
  'extension',
  'assessment_guidance'
);

create type public.curriculum_activity_type as enum (
  'sorting_cards',
  'matching',
  'true_false',
  'discussion_prompt',
  'pattern_recognition',
  'scenario_cards',
  'class_poll',
  'reflection_prompt'
);

create table public.curriculum_programs (
  id uuid primary key default gen_random_uuid(),
  program_code text not null unique,
  title text not null,
  description text,
  grade_band public.grade_band not null,
  version text not null default '1.0',
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint curriculum_programs_code_not_blank check (length(trim(program_code)) > 0),
  constraint curriculum_programs_title_not_blank check (length(trim(title)) > 0)
);

create table public.curriculum_grades (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.curriculum_programs(id) on delete cascade,
  grade_code text not null unique,
  grade_level integer not null,
  grade_band public.grade_band not null,
  title text not null,
  sequence_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint curriculum_grades_code_not_blank check (length(trim(grade_code)) > 0),
  constraint curriculum_grades_title_not_blank check (length(trim(title)) > 0),
  constraint curriculum_grades_level_range check (grade_level between 0 and 12),
  constraint curriculum_grades_band_matches_level check (
    (grade_band = 'k_to_6' and grade_level between 0 and 6)
    or (grade_band = 'grades_7_to_12' and grade_level between 7 and 12)
  )
);

alter table public.curriculum_units
add column if not exists program_id uuid references public.curriculum_programs(id) on delete set null,
add column if not exists grade_level integer,
add column if not exists unit_code text,
add column if not exists learning_goals text,
add column if not exists duration_weeks integer,
add column if not exists status text not null default 'draft';

alter table public.curriculum_units
add constraint curriculum_units_grade_level_range check (grade_level is null or grade_level between 0 and 12),
add constraint curriculum_units_duration_weeks_positive check (duration_weeks is null or duration_weeks > 0);

alter table public.curriculum_units
add constraint curriculum_units_unit_code_key unique (unit_code);

alter table public.lessons
add column if not exists lesson_code text,
add column if not exists grade_level integer,
add column if not exists learning_objectives text,
add column if not exists essential_question text,
add column if not exists materials_needed text,
add column if not exists vocabulary text,
add column if not exists teacher_prep_notes text,
add column if not exists duration_minutes integer,
add column if not exists status text not null default 'draft',
add column if not exists content_version text not null default '1.0';

alter table public.lessons
add constraint lessons_grade_level_range check (grade_level is null or grade_level between 0 and 12),
add constraint lessons_duration_minutes_positive check (duration_minutes is null or duration_minutes > 0);

alter table public.lessons
add constraint lessons_lesson_code_key unique (lesson_code);

create table public.lesson_sections (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  section_code text unique,
  section_type public.lesson_section_type not null,
  title text not null,
  content text,
  content_json jsonb not null default '{}'::jsonb,
  sequence_order integer not null default 0,
  access_type public.content_access_type not null default 'platform_only',
  estimated_minutes integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lesson_sections_title_not_blank check (length(trim(title)) > 0),
  constraint lesson_sections_estimated_minutes_positive check (estimated_minutes is null or estimated_minutes > 0)
);

alter table public.lesson_resources
add column if not exists resource_code text,
add column if not exists access_type public.content_access_type not null default 'platform_only',
add column if not exists visibility text not null default 'teacher',
add column if not exists is_printable boolean not null default false,
add column if not exists is_downloadable boolean not null default false,
add column if not exists storage_path text,
add column if not exists mime_type text,
add column if not exists estimated_pages integer,
add column if not exists display_mode text not null default 'inline',
add column if not exists sort_order integer not null default 0;

alter table public.lesson_resources
add constraint lesson_resources_estimated_pages_positive check (estimated_pages is null or estimated_pages > 0),
add constraint lesson_resources_downloadable_requires_flag check (
  access_type <> 'downloadable' or is_downloadable = true
),
add constraint lesson_resources_printable_requires_flag check (
  access_type <> 'printable' or is_printable = true
);

alter table public.lesson_resources
add constraint lesson_resources_resource_code_key unique (resource_code);

alter table public.activities
add column if not exists activity_code text,
add column if not exists access_type public.content_access_type not null default 'platform_only',
add column if not exists instructions text,
add column if not exists activity_json jsonb not null default '{}'::jsonb;

alter table public.activities
add constraint activities_activity_code_key unique (activity_code);

create table public.assessment_templates (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  template_code text unique,
  title text not null,
  description text,
  assessment_type text not null default 'class_checklist',
  criteria_json jsonb not null default '{}'::jsonb,
  access_type public.content_access_type not null default 'teacher_only',
  sequence_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint assessment_templates_title_not_blank check (length(trim(title)) > 0)
);

create index if not exists curriculum_programs_grade_band_idx on public.curriculum_programs(grade_band);
create index if not exists curriculum_grades_program_id_idx on public.curriculum_grades(program_id);
create index if not exists curriculum_units_program_id_idx on public.curriculum_units(program_id);
create index if not exists curriculum_units_grade_level_idx on public.curriculum_units(grade_level);
create index if not exists lessons_grade_level_idx on public.lessons(grade_level);
create index if not exists lesson_sections_lesson_id_order_idx on public.lesson_sections(lesson_id, sequence_order);
create index if not exists lesson_sections_access_type_idx on public.lesson_sections(access_type);
create index if not exists activities_access_type_idx on public.activities(access_type);
create index if not exists assessment_templates_lesson_id_idx on public.assessment_templates(lesson_id);
create index if not exists lesson_resources_access_type_idx on public.lesson_resources(access_type);

create trigger set_curriculum_programs_updated_at before update on public.curriculum_programs for each row execute function public.set_updated_at();
create trigger set_curriculum_grades_updated_at before update on public.curriculum_grades for each row execute function public.set_updated_at();
create trigger set_lesson_sections_updated_at before update on public.lesson_sections for each row execute function public.set_updated_at();
create trigger set_assessment_templates_updated_at before update on public.assessment_templates for each row execute function public.set_updated_at();

comment on table public.curriculum_programs is 'Top-level curriculum programs, using stable program_code values for import and replacement.';
comment on table public.curriculum_grades is 'Grade-level curriculum structure within a program, using stable grade_code values.';
comment on table public.lesson_sections is 'Protected platform-rendered lesson content. Core curriculum should live here rather than as downloadable PDFs.';
comment on column public.lesson_sections.access_type is 'Classifies whether content is platform-only, printable, downloadable, teacher-only, or future student-visible.';
comment on column public.lesson_resources.access_type is 'Classifies attached resources. Printable classroom materials are allowed; full core curriculum should not be downloadable by default.';
comment on column public.activities.activity_json is 'Structured activity configuration for smartboard and classroom interactions.';
comment on table public.assessment_templates is 'Reusable assessment/checklist templates for lessons. MVP 1 K to Grade 6 assessment submissions still use class_lesson_assessments.';
