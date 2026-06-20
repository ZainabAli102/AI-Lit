-- CONNECTED MENA AI Literacy Platform
-- Step 2A initial schema foundation only.
-- This migration does not enable live authentication, create auth triggers, or require Supabase project keys.

create extension if not exists pgcrypto;

create type public.app_role as enum (
  'connected_mena_admin',
  'school_admin',
  'academic_coordinator',
  'teacher',
  'student'
);

create type public.delivery_mode as enum (
  'teacher_led',
  'student_account',
  'hybrid'
);

create type public.grade_band as enum (
  'k_to_6',
  'grades_7_to_12'
);

create type public.progress_status as enum (
  'not_started',
  'in_progress',
  'completed'
);

create type public.assignment_status as enum (
  'draft',
  'published',
  'archived'
);

create type public.submission_status as enum (
  'draft',
  'submitted',
  'returned'
);

create table public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  region text,
  country_code text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint schools_name_not_blank check (length(trim(name)) > 0)
);

create table public.academic_years (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null,
  starts_on date,
  ends_on date,
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint academic_years_name_not_blank check (length(trim(name)) > 0),
  constraint academic_years_valid_dates check (starts_on is null or ends_on is null or starts_on <= ends_on)
);

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  school_id uuid references public.schools(id) on delete set null,
  email text,
  full_name text not null,
  role public.app_role not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_full_name_not_blank check (length(trim(full_name)) > 0)
);

create table public.teacher_profiles (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  supports_k_to_6 boolean not null default true,
  supports_grades_7_to_12 boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint teacher_profiles_supports_at_least_one_band check (supports_k_to_6 or supports_grades_7_to_12)
);

create table public.student_profiles (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  grade_band public.grade_band not null default 'grades_7_to_12',
  external_student_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint student_profiles_future_band_only check (grade_band = 'grades_7_to_12')
);

create table public.curriculum_units (
  id uuid primary key default gen_random_uuid(),
  grade_band public.grade_band not null,
  title text not null,
  description text,
  sequence_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint curriculum_units_title_not_blank check (length(trim(title)) > 0)
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  curriculum_unit_id uuid not null references public.curriculum_units(id) on delete cascade,
  grade_band public.grade_band not null,
  title text not null,
  summary text,
  sequence_order integer not null default 0,
  estimated_minutes integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lessons_title_not_blank check (length(trim(title)) > 0),
  constraint lessons_estimated_minutes_positive check (estimated_minutes is null or estimated_minutes > 0)
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  title text not null,
  activity_type text not null default 'classroom',
  delivery_mode public.delivery_mode not null default 'teacher_led',
  is_smartboard_ready boolean not null default false,
  sequence_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint activities_title_not_blank check (length(trim(title)) > 0)
);

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  academic_year_id uuid references public.academic_years(id) on delete set null,
  name text not null,
  grade_level integer not null,
  grade_band public.grade_band not null,
  delivery_mode public.delivery_mode not null,
  primary_teacher_id uuid references public.teacher_profiles(profile_id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint classes_name_not_blank check (length(trim(name)) > 0),
  constraint classes_grade_level_range check (grade_level between 0 and 12),
  constraint classes_grade_band_matches_level check (
    (grade_band = 'k_to_6' and grade_level between 0 and 6)
    or (grade_band = 'grades_7_to_12' and grade_level between 7 and 12)
  ),
  constraint classes_delivery_mode_matches_grade_band check (
    (grade_band = 'k_to_6' and delivery_mode in ('teacher_led', 'hybrid'))
    or (grade_band = 'grades_7_to_12' and delivery_mode in ('student_account', 'hybrid'))
  )
);

create table public.teacher_class_assignments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  teacher_profile_id uuid not null references public.teacher_profiles(profile_id) on delete cascade,
  assignment_role text not null default 'teacher',
  created_at timestamptz not null default now(),
  unique (class_id, teacher_profile_id)
);

create table public.student_class_enrollments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  student_profile_id uuid not null references public.student_profiles(profile_id) on delete cascade,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique (class_id, student_profile_id)
);

create table public.class_lesson_progress (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  status public.progress_status not null default 'not_started',
  completed_at timestamptz,
  last_activity_at timestamptz,
  class_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (class_id, lesson_id)
);

create table public.student_lesson_progress (
  id uuid primary key default gen_random_uuid(),
  student_profile_id uuid not null references public.student_profiles(profile_id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  status public.progress_status not null default 'not_started',
  completed_at timestamptz,
  last_activity_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_profile_id, class_id, lesson_id)
);

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete set null,
  title text not null,
  instructions text,
  status public.assignment_status not null default 'draft',
  created_by_teacher_id uuid references public.teacher_profiles(profile_id) on delete set null,
  assigned_at timestamptz,
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint assignments_title_not_blank check (length(trim(title)) > 0)
);

create table public.rubrics (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  grade_band public.grade_band not null default 'grades_7_to_12',
  created_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rubrics_title_not_blank check (length(trim(title)) > 0)
);

create table public.rubric_criteria (
  id uuid primary key default gen_random_uuid(),
  rubric_id uuid not null references public.rubrics(id) on delete cascade,
  label text not null,
  description text,
  max_score numeric(6, 2) not null default 4,
  sequence_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rubric_criteria_label_not_blank check (length(trim(label)) > 0),
  constraint rubric_criteria_max_score_positive check (max_score > 0)
);

create table public.assignment_rubrics (
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  rubric_id uuid not null references public.rubrics(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (assignment_id, rubric_id)
);

create table public.assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_profile_id uuid not null references public.student_profiles(profile_id) on delete cascade,
  content text,
  attachment_urls text[] not null default '{}',
  status public.submission_status not null default 'draft',
  submitted_at timestamptz,
  returned_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assignment_id, student_profile_id)
);

create table public.submission_feedback (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.assignment_submissions(id) on delete cascade,
  teacher_profile_id uuid references public.teacher_profiles(profile_id) on delete set null,
  summary text,
  next_steps text,
  overall_score numeric(8, 2),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.submission_rubric_scores (
  id uuid primary key default gen_random_uuid(),
  feedback_id uuid not null references public.submission_feedback(id) on delete cascade,
  rubric_criterion_id uuid not null references public.rubric_criteria(id) on delete cascade,
  score numeric(6, 2) not null,
  comments text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (feedback_id, rubric_criterion_id),
  constraint submission_rubric_scores_non_negative check (score >= 0)
);

create index academic_years_school_id_idx on public.academic_years(school_id);
create index profiles_auth_user_id_idx on public.profiles(auth_user_id);
create index profiles_school_id_role_idx on public.profiles(school_id, role);
create index classes_school_id_grade_band_idx on public.classes(school_id, grade_band);
create index classes_delivery_mode_idx on public.classes(delivery_mode);
create index lessons_curriculum_unit_id_idx on public.lessons(curriculum_unit_id);
create index activities_lesson_id_idx on public.activities(lesson_id);
create index class_lesson_progress_class_id_idx on public.class_lesson_progress(class_id);
create index student_lesson_progress_student_profile_id_idx on public.student_lesson_progress(student_profile_id);
create index assignments_class_id_status_idx on public.assignments(class_id, status);
create index assignment_submissions_assignment_id_status_idx on public.assignment_submissions(assignment_id, status);
create index submission_feedback_submission_id_idx on public.submission_feedback(submission_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_schools_updated_at before update on public.schools for each row execute function public.set_updated_at();
create trigger set_academic_years_updated_at before update on public.academic_years for each row execute function public.set_updated_at();
create trigger set_profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger set_teacher_profiles_updated_at before update on public.teacher_profiles for each row execute function public.set_updated_at();
create trigger set_student_profiles_updated_at before update on public.student_profiles for each row execute function public.set_updated_at();
create trigger set_curriculum_units_updated_at before update on public.curriculum_units for each row execute function public.set_updated_at();
create trigger set_lessons_updated_at before update on public.lessons for each row execute function public.set_updated_at();
create trigger set_activities_updated_at before update on public.activities for each row execute function public.set_updated_at();
create trigger set_classes_updated_at before update on public.classes for each row execute function public.set_updated_at();
create trigger set_class_lesson_progress_updated_at before update on public.class_lesson_progress for each row execute function public.set_updated_at();
create trigger set_student_lesson_progress_updated_at before update on public.student_lesson_progress for each row execute function public.set_updated_at();
create trigger set_assignments_updated_at before update on public.assignments for each row execute function public.set_updated_at();
create trigger set_rubrics_updated_at before update on public.rubrics for each row execute function public.set_updated_at();
create trigger set_rubric_criteria_updated_at before update on public.rubric_criteria for each row execute function public.set_updated_at();
create trigger set_assignment_submissions_updated_at before update on public.assignment_submissions for each row execute function public.set_updated_at();
create trigger set_submission_feedback_updated_at before update on public.submission_feedback for each row execute function public.set_updated_at();
create trigger set_submission_rubric_scores_updated_at before update on public.submission_rubric_scores for each row execute function public.set_updated_at();

comment on table public.student_profiles is 'Future Grades 7 to 12 student-account records only. K to Grade 6 teacher-led classrooms should not create student accounts.';
comment on table public.class_lesson_progress is 'Class-level progress for teacher-led K to Grade 6 delivery and high-level class tracking.';
comment on table public.student_lesson_progress is 'Future Grades 7 to 12 individual progress tracking for student-account delivery.';
comment on table public.assignments is 'Future Grades 7 to 12 assignment records.';
comment on table public.assignment_submissions is 'Future Grades 7 to 12 student submission records.';
comment on table public.submission_feedback is 'Future Grades 7 to 12 teacher feedback records.';

-- Row-level security policies and auth triggers should be added in a later step
-- after Supabase Auth, role claims, and school membership rules are finalized.
