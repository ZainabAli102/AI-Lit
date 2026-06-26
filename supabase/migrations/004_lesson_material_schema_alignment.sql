-- CONNECTED MENA AI Literacy Platform
-- Lesson Material Schema & Production Templates alignment.
--
-- This migration adds master lesson production fields and section types without
-- enabling Supabase Auth, RLS policies, student accounts, or new workflows.

alter table public.lessons
add column if not exists display_code text,
add column if not exists anchor_theme text,
add column if not exists tool_use_status text,
add column if not exists i_can_statement text,
add column if not exists student_challenge text,
add column if not exists student_output text,
add column if not exists success_criteria_json jsonb not null default '{}'::jsonb,
add column if not exists alignment_json jsonb not null default '{}'::jsonb,
add column if not exists localization_json jsonb not null default '{}'::jsonb,
add column if not exists logistics_json jsonb not null default '{}'::jsonb;

alter type public.lesson_section_type add value if not exists 'hook_opening';
alter type public.lesson_section_type add value if not exists 'movement_play_notes';
alter type public.lesson_section_type add value if not exists 'worked_example';
alter type public.lesson_section_type add value if not exists 'tool_platform_setup';
alter type public.lesson_section_type add value if not exists 'data_privacy_setup';
alter type public.lesson_section_type add value if not exists 'design_intent';
alter type public.lesson_section_type add value if not exists 'misconceptions_pitfalls';
alter type public.lesson_section_type add value if not exists 'safety_policy_notes';
alter type public.lesson_section_type add value if not exists 'academic_integrity_note';
alter type public.lesson_section_type add value if not exists 'ai_use_disclosure';
alter type public.lesson_section_type add value if not exists 'mena_contextualization';
alter type public.lesson_section_type add value if not exists 'language_integration';
alter type public.lesson_section_type add value if not exists 'family_home_connection';

create index if not exists lessons_display_code_idx on public.lessons(display_code);

comment on column public.lessons.lesson_code is 'Stable platform/import key, for example CM-AIL-G1-U1-L1.';
comment on column public.lessons.display_code is 'Human-facing curriculum code, for example KG-06, G1-01, or G7-04.';
comment on column public.lessons.alignment_json is 'Structured alignment metadata: core AI concepts, competencies, skeleton threads, external framework tags, builds-on/leads-to.';
comment on column public.lessons.localization_json is 'MENA contextualization, language integration, Arabic/Kurdish vocabulary, and read-aloud notes.';
comment on column public.lessons.logistics_json is 'Room setup, grouping, tool/platform setup, data privacy/setup notes, and materials manifest details.';
