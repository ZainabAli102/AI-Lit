-- CONNECTED MENA AI Literacy Platform
-- MVP 1 K to Grade 6 teacher-led smoke-test seed.
--
-- Apply after supabase/migrations/001_initial_schema.sql.
-- This seed intentionally does not create student_profiles, auth users, RLS policies,
-- auth triggers, or Grades 7 to 12 student-account demo data.

insert into public.schools (id, name, region, country_code, status)
values (
  '10000000-0000-4000-8000-000000000001',
  'CONNECTED MENA Demo School',
  'MENA',
  'AE',
  'active'
)
on conflict (id) do update
set name = excluded.name,
    region = excluded.region,
    country_code = excluded.country_code,
    status = excluded.status;

insert into public.academic_years (id, school_id, name, starts_on, ends_on, is_current)
values (
  '10000000-0000-4000-8000-000000000002',
  '10000000-0000-4000-8000-000000000001',
  '2026-2027',
  '2026-09-01',
  '2027-06-30',
  true
)
on conflict (id) do update
set school_id = excluded.school_id,
    name = excluded.name,
    starts_on = excluded.starts_on,
    ends_on = excluded.ends_on,
    is_current = excluded.is_current;

insert into public.profiles (id, auth_user_id, school_id, email, full_name, role, is_active)
values (
  '00000000-0000-4000-8000-000000000001',
  null,
  '10000000-0000-4000-8000-000000000001',
  'maya.haddad@example.edu',
  'Maya Haddad',
  'teacher',
  true
)
on conflict (id) do update
set auth_user_id = null,
    school_id = excluded.school_id,
    email = excluded.email,
    full_name = excluded.full_name,
    role = excluded.role,
    is_active = excluded.is_active;

insert into public.teacher_profiles (profile_id, supports_k_to_6, supports_grades_7_to_12)
values (
  '00000000-0000-4000-8000-000000000001',
  true,
  false
)
on conflict (profile_id) do update
set supports_k_to_6 = excluded.supports_k_to_6,
    supports_grades_7_to_12 = excluded.supports_grades_7_to_12;

insert into public.curriculum_units (id, grade_band, title, description, sequence_order, is_active)
values (
  '20000000-0000-4000-8000-000000000001',
  'k_to_6',
  'AI Literacy Foundations',
  'Teacher-led K to Grade 6 introduction to AI concepts, careful use, and classroom discussion.',
  1,
  true
)
on conflict (id) do update
set grade_band = excluded.grade_band,
    title = excluded.title,
    description = excluded.description,
    sequence_order = excluded.sequence_order,
    is_active = excluded.is_active;

insert into public.lessons (id, curriculum_unit_id, grade_band, title, summary, sequence_order, estimated_minutes, is_active)
values
  (
    '30000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'k_to_6',
    'AI Around Us',
    'Teacher-led discussion about where students encounter AI in familiar classroom and home contexts.',
    1,
    35,
    true
  ),
  (
    '30000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000001',
    'k_to_6',
    'Patterns and Prompts',
    'A simple class activity for noticing patterns and explaining how instructions change an output.',
    2,
    40,
    true
  ),
  (
    '30000000-0000-4000-8000-000000000003',
    '20000000-0000-4000-8000-000000000001',
    'k_to_6',
    'Kind AI Choices',
    'A teacher-led reflection on helpful, fair, and careful choices when using AI tools.',
    3,
    30,
    true
  )
on conflict (id) do update
set curriculum_unit_id = excluded.curriculum_unit_id,
    grade_band = excluded.grade_band,
    title = excluded.title,
    summary = excluded.summary,
    sequence_order = excluded.sequence_order,
    estimated_minutes = excluded.estimated_minutes,
    is_active = excluded.is_active;

insert into public.classes (
  id,
  school_id,
  academic_year_id,
  name,
  grade_level,
  grade_band,
  delivery_mode,
  primary_teacher_id,
  is_active
)
values (
  '40000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002',
  'Grade 1A',
  1,
  'k_to_6',
  'teacher_led',
  '00000000-0000-4000-8000-000000000001',
  true
)
on conflict (id) do update
set school_id = excluded.school_id,
    academic_year_id = excluded.academic_year_id,
    name = excluded.name,
    grade_level = excluded.grade_level,
    grade_band = excluded.grade_band,
    delivery_mode = excluded.delivery_mode,
    primary_teacher_id = excluded.primary_teacher_id,
    is_active = excluded.is_active;

insert into public.teacher_class_assignments (id, class_id, teacher_profile_id, assignment_role)
values (
  '50000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000001',
  'lead_teacher'
)
on conflict (class_id, teacher_profile_id) do update
set assignment_role = excluded.assignment_role;

insert into public.lesson_resources (id, lesson_id, resource_type, title, description, file_url, content)
values
  (
    '60000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000001',
    'teacher_guide',
    'Teacher Guide',
    'Opening questions, vocabulary, and facilitation notes for a whole-class K to Grade 6 lesson.',
    null,
    'Use examples from school life: recommendations, voice assistants, translation, and classroom tools.'
  ),
  (
    '60000000-0000-4000-8000-000000000002',
    '30000000-0000-4000-8000-000000000001',
    'smartboard_activity',
    'Smartboard Sorting Activity',
    'Classifies everyday tools into AI-powered, computer-powered, and human-powered examples.',
    null,
    'Prompt students to explain their thinking after each sort.'
  ),
  (
    '60000000-0000-4000-8000-000000000003',
    '30000000-0000-4000-8000-000000000001',
    'assessment',
    'Class Reflection Check',
    'Teacher-facing checklist for class-level understanding.',
    null,
    'Record whether students could name an AI example and explain why it may use data or patterns.'
  ),
  (
    '60000000-0000-4000-8000-000000000004',
    '30000000-0000-4000-8000-000000000002',
    'worksheet',
    'Pattern Cards',
    'Printable pattern prompts for small-group classroom discussion.',
    null,
    'Students complete a pattern and explain the rule aloud.'
  ),
  (
    '60000000-0000-4000-8000-000000000005',
    '30000000-0000-4000-8000-000000000003',
    'support_activity',
    'Choice Cards',
    'Support activity for discussing fair and careful AI choices.',
    null,
    'Read each scenario and ask the class what a careful choice would look like.'
  )
on conflict (id) do update
set lesson_id = excluded.lesson_id,
    resource_type = excluded.resource_type,
    title = excluded.title,
    description = excluded.description,
    file_url = excluded.file_url,
    content = excluded.content;

insert into public.class_lesson_progress (id, class_id, lesson_id, status, completed_at, last_activity_at, class_notes)
values (
  '70000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000001',
  '30000000-0000-4000-8000-000000000001',
  'in_progress',
  null,
  now(),
  'Initial smoke-test progress row for Grade 1A.'
)
on conflict (class_id, lesson_id) do update
set status = excluded.status,
    completed_at = excluded.completed_at,
    last_activity_at = excluded.last_activity_at,
    class_notes = excluded.class_notes;

insert into public.class_lesson_assessments (
  id,
  class_id,
  lesson_id,
  teacher_id,
  objective_met,
  activity_completed,
  students_explained_thinking,
  students_needing_support,
  teacher_notes,
  overall_status
)
values (
  '80000000-0000-4000-8000-000000000001',
  '40000000-0000-4000-8000-000000000001',
  '30000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000001',
  'partly',
  'yes',
  'partly',
  'Small group support for explaining why an example uses patterns.',
  'Seeded sample assessment for MVP 1 smoke testing.',
  'needs_review'
)
on conflict (id) do update
set class_id = excluded.class_id,
    lesson_id = excluded.lesson_id,
    teacher_id = excluded.teacher_id,
    objective_met = excluded.objective_met,
    activity_completed = excluded.activity_completed,
    students_explained_thinking = excluded.students_explained_thinking,
    students_needing_support = excluded.students_needing_support,
    teacher_notes = excluded.teacher_notes,
    overall_status = excluded.overall_status;
