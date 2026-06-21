# Supabase Schema Notes

Step 2A only adds local schema files. It does not connect this app to a live Supabase project, request keys, enable authentication, or configure Vercel environment variables.

When the Supabase project exists, apply `supabase/migrations/001_initial_schema.sql` through the Supabase CLI or SQL editor, then generate fresh TypeScript database types from the live project and compare them with `src/types/database.ts`.

Later steps should add Supabase Auth wiring, row-level security policies, role claims, school membership rules, and environment variables.

The initial schema includes MVP 1 K to Grade 6 class-level progress and `class_lesson_assessments`, while student profiles, enrollments, assignments, submissions, rubrics, feedback, and individual progress are reserved for later Grades 7 to 12 student-account workflows.

## MVP 1 Supabase Smoke Test

Supabase mode is enabled locally when these variables are present in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

If either variable is missing, the teacher-led workflow stays in local preview mode and logs a console warning. No Vercel environment variables are required for this local smoke test.

Apply the schema first:

```bash
supabase/migrations/001_initial_schema.sql
```

Then apply the MVP 1 seed:

```bash
supabase/seed_mvp1_teacher_led.sql
```

You can run both files from the Supabase SQL editor, or through your preferred Supabase CLI workflow after linking a project. The seed is idempotent and uses fixed demo UUIDs.

The seed creates:

- One school
- One academic year
- One teacher profile with `auth_user_id = null`
- One K to Grade 6 class with `delivery_mode = 'teacher_led'`
- One `teacher_class_assignments` row
- Three K to Grade 6 lessons
- Five `lesson_resources` rows
- One optional sample `class_lesson_assessments` row

The seed intentionally does not create `student_profiles`, student enrollments, assignment submissions, RLS policies, auth triggers, or Supabase Auth users.

Manual test routes:

- `/teacher`
- `/teacher/classes`
- `/teacher/classes/40000000-0000-4000-8000-000000000001`
- `/teacher/classes/40000000-0000-4000-8000-000000000001/lessons/30000000-0000-4000-8000-000000000001`
- `/teacher/lessons/30000000-0000-4000-8000-000000000001` for read-only resource inspection only

Expected Supabase-mode checks:

- Teacher class list loads through `teacher_class_assignments` and `classes`.
- Class detail shows K to Grade 6 lessons from `lessons`.
- Lesson detail shows resources from `lesson_resources`.
- The assessment form inserts into `class_lesson_assessments`.
- No K to Grade 6 student account data is required.
