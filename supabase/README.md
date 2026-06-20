# Supabase Schema Notes

Step 2A only adds local schema files. It does not connect this app to a live Supabase project, request keys, enable authentication, or configure Vercel environment variables.

When the Supabase project exists, apply `supabase/migrations/001_initial_schema.sql` through the Supabase CLI or SQL editor, then generate fresh TypeScript database types from the live project and compare them with `src/types/database.ts`.

Later steps should add Supabase Auth wiring, row-level security policies, role claims, school membership rules, and environment variables.
