# CONNECTED MENA AI Literacy Platform

Initial Next.js foundation for a school implementation platform supporting the CONNECTED MENA AI Literacy Curriculum.

## Purpose

The platform is prepared for two delivery modes:

- `teacher_led`: K to Grade 6 classrooms, teacher accounts only, class-level progress.
- `student_account`: Grades 7 to 12 classrooms, student accounts, assignments, submissions, rubrics, feedback, and individual progress to be added later.
- `hybrid`: Reserved for schools that combine class-led and individual workflows.

## Getting Started

```bash
npm install
npm run dev
```

Create `.env.local` from `.env.local.example` when Supabase credentials are available.

## Structure

- `src/app`: App Router routes and placeholder pages.
- `src/components`: Shared layout and dashboard components.
- `src/lib/constants.ts`: User roles, delivery modes, and grade bands.
- `src/lib/supabase`: Future Supabase client and type placeholders.
