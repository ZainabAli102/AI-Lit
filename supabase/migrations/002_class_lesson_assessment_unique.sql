-- Ensure MVP 1 K to Grade 6 assessments keep one current record per class and lesson.
-- Run this after 001_initial_schema.sql on existing Supabase projects.

delete from public.class_lesson_assessments older
using public.class_lesson_assessments newer
where older.class_id = newer.class_id
  and older.lesson_id = newer.lesson_id
  and older.created_at < newer.created_at;

alter table public.class_lesson_assessments
add constraint class_lesson_assessments_class_id_lesson_id_key unique (class_id, lesson_id);
