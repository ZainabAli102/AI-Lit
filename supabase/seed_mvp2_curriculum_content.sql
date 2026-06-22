-- CONNECTED MENA AI Literacy Platform
-- MVP 2 demo curriculum content seed.
--
-- Apply after:
-- 1. supabase/migrations/001_initial_schema.sql
-- 2. supabase/migrations/002_class_lesson_assessment_unique.sql
-- 3. supabase/migrations/003_curriculum_content_model.sql
-- 4. supabase/seed_mvp1_teacher_led.sql
--
-- This is demo/sample content only. Replace it later through updated seed/import
-- files or a bulk import process using stable codes.

insert into public.curriculum_programs (id, program_code, title, description, grade_band, version, status)
values (
  '90000000-0000-4000-8000-000000000001',
  'CM-AIL-K6',
  'CONNECTED MENA AI Literacy K-6',
  'Demo protected curriculum program for K to Grade 6 teacher-led AI literacy.',
  'k_to_6',
  'demo-1.0',
  'draft'
)
on conflict (program_code) do update
set title = excluded.title,
    description = excluded.description,
    grade_band = excluded.grade_band,
    version = excluded.version,
    status = excluded.status;

insert into public.curriculum_grades (id, program_id, grade_code, grade_level, grade_band, title, sequence_order)
values (
  '90000000-0000-4000-8000-000000000011',
  '90000000-0000-4000-8000-000000000001',
  'CM-AIL-G1',
  1,
  'k_to_6',
  'Grade 1 AI Literacy',
  1
)
on conflict (grade_code) do update
set program_id = excluded.program_id,
    grade_level = excluded.grade_level,
    grade_band = excluded.grade_band,
    title = excluded.title,
    sequence_order = excluded.sequence_order;

update public.curriculum_units
set program_id = '90000000-0000-4000-8000-000000000001',
    grade_level = 1,
    unit_code = 'CM-AIL-G1-U1',
    learning_goals = 'Students notice familiar AI examples, explain simple patterns, and discuss careful choices.',
    duration_weeks = 3,
    status = 'draft'
where id = '20000000-0000-4000-8000-000000000001';

update public.lessons
set lesson_code = 'CM-AIL-G1-U1-L1',
    grade_level = 1,
    learning_objectives = 'Students identify familiar AI-powered tools and explain that AI can use patterns or data to help people.',
    essential_question = 'Where do we see AI around us?',
    materials_needed = 'Smartboard, sorting cards, teacher checklist, optional printable reflection sheet.',
    vocabulary = 'AI, pattern, data, tool, choice',
    teacher_prep_notes = 'Use familiar classroom and home examples. Avoid implying every computer is AI.',
    duration_minutes = 35,
    status = 'draft',
    content_version = 'demo-1.0'
where id = '30000000-0000-4000-8000-000000000001';

update public.lessons
set lesson_code = 'CM-AIL-G1-U1-L2',
    grade_level = 1,
    learning_objectives = 'Students complete simple patterns and explain how instructions can change an output.',
    essential_question = 'How do patterns help us make predictions?',
    materials_needed = 'Pattern cards, counters or drawings, printable pair worksheet.',
    vocabulary = 'pattern, prompt, instruction, output',
    teacher_prep_notes = 'Prepare one visible class pattern and one incomplete pattern for pair talk.',
    duration_minutes = 40,
    status = 'draft',
    content_version = 'demo-1.0'
where id = '30000000-0000-4000-8000-000000000002';

update public.lessons
set lesson_code = 'CM-AIL-G1-U1-L3',
    grade_level = 1,
    learning_objectives = 'Students describe kind, careful choices when using AI-supported tools.',
    essential_question = 'How can we make careful choices with AI?',
    materials_needed = 'Scenario cards, class reflection prompt, teacher checklist.',
    vocabulary = 'kind, careful, fair, private, ask an adult',
    teacher_prep_notes = 'Keep scenarios age-appropriate and focused on classroom behavior.',
    duration_minutes = 30,
    status = 'draft',
    content_version = 'demo-1.0'
where id = '30000000-0000-4000-8000-000000000003';

insert into public.lesson_sections (
  lesson_id,
  section_code,
  section_type,
  title,
  content,
  content_json,
  sequence_order,
  access_type,
  estimated_minutes
)
values
  (
    '30000000-0000-4000-8000-000000000001',
    'CM-AIL-G1-U1-L1-S1',
    'overview',
    'Lesson Overview',
    'Students explore familiar places where AI may appear, then explain their thinking as a class. This core overview is rendered inside the platform.',
    '{"teacher_note":"Keep examples concrete and local to school life."}'::jsonb,
    1,
    'platform_only',
    5
  ),
  (
    '30000000-0000-4000-8000-000000000001',
    'CM-AIL-G1-U1-L1-S2',
    'lesson_flow',
    'Teacher-Led Flow',
    '1. Invite students to name technology they see at school or home. 2. Show examples and ask which might use AI. 3. Sort examples together. 4. Ask students to explain why they chose each group.',
    '{"steps":["Name familiar technology","Sort examples as a class","Invite reasoning after each choice","Close with one careful-use reminder"]}'::jsonb,
    2,
    'teacher_only',
    15
  ),
  (
    '30000000-0000-4000-8000-000000000001',
    'CM-AIL-G1-U1-L1-S3',
    'discussion_prompt',
    'Discussion Prompt',
    'Which of these tools might learn from examples or patterns? Ask students to use the sentence frame: I think it uses AI because...',
    '{"sentence_frame":"I think it uses AI because..."}'::jsonb,
    3,
    'platform_only',
    10
  ),
  (
    '30000000-0000-4000-8000-000000000001',
    'CM-AIL-G1-U1-L1-S4',
    'assessment_guidance',
    'Assessment Guidance',
    'Look for whether students can name one possible AI example and explain their thinking in simple language.',
    '{"look_for":["Names one AI example","Explains using patterns or examples","Listens to peer reasoning"]}'::jsonb,
    4,
    'teacher_only',
    5
  ),
  (
    '30000000-0000-4000-8000-000000000002',
    'CM-AIL-G1-U1-L2-S1',
    'overview',
    'Lesson Overview',
    'Students complete simple visual patterns and connect the idea of patterns to clear instructions.',
    '{"teacher_note":"Use movement or colors before moving to worksheet examples."}'::jsonb,
    1,
    'platform_only',
    5
  ),
  (
    '30000000-0000-4000-8000-000000000002',
    'CM-AIL-G1-U1-L2-S2',
    'guided_activity',
    'Guided Pattern Talk',
    'Display a pattern with one missing item. Ask students to predict the missing item, then explain the rule.',
    '{"prompt":"What comes next, and how do you know?"}'::jsonb,
    2,
    'teacher_only',
    15
  ),
  (
    '30000000-0000-4000-8000-000000000003',
    'CM-AIL-G1-U1-L3-S1',
    'overview',
    'Lesson Overview',
    'Students use short classroom scenarios to discuss kind, careful, and fair choices with AI-supported tools.',
    '{"teacher_note":"Focus on asking adults, checking before sharing, and being kind."}'::jsonb,
    1,
    'platform_only',
    5
  ),
  (
    '30000000-0000-4000-8000-000000000003',
    'CM-AIL-G1-U1-L3-S2',
    'reflection',
    'Closing Reflection',
    'Students complete the sentence: One careful AI choice I can make is...',
    '{"sentence_frame":"One careful AI choice I can make is..."}'::jsonb,
    2,
    'platform_only',
    10
  )
on conflict (section_code) do update
set lesson_id = excluded.lesson_id,
    section_type = excluded.section_type,
    title = excluded.title,
    content = excluded.content,
    content_json = excluded.content_json,
    sequence_order = excluded.sequence_order,
    access_type = excluded.access_type,
    estimated_minutes = excluded.estimated_minutes;

insert into public.activities (
  lesson_id,
  activity_code,
  title,
  activity_type,
  delivery_mode,
  access_type,
  is_smartboard_ready,
  instructions,
  activity_json,
  sequence_order
)
values
  (
    '30000000-0000-4000-8000-000000000001',
    'CM-AIL-G1-U1-L1-A1',
    'AI Around Us Sorting Cards',
    'sorting_cards',
    'teacher_led',
    'platform_only',
    true,
    'Display cards and sort them as a whole class. Ask students to explain every choice.',
    '{
      "prompt":"Sort each example into the group that fits best.",
      "categories":["AI-powered","Computer-powered","Human-powered"],
      "cards":[
        {"label":"Voice assistant","correctCategory":"AI-powered"},
        {"label":"Calculator","correctCategory":"Computer-powered"},
        {"label":"Teacher reading a story","correctCategory":"Human-powered"},
        {"label":"Translation app","correctCategory":"AI-powered"}
      ]
    }'::jsonb,
    1
  ),
  (
    '30000000-0000-4000-8000-000000000002',
    'CM-AIL-G1-U1-L2-A1',
    'What Comes Next?',
    'pattern_recognition',
    'teacher_led',
    'platform_only',
    true,
    'Ask students to predict the next item and explain the pattern rule.',
    '{
      "patterns":[
        {"items":["red","blue","red","blue"],"answer":"red"},
        {"items":["circle","circle","square","circle","circle"],"answer":"square"}
      ]
    }'::jsonb,
    1
  ),
  (
    '30000000-0000-4000-8000-000000000003',
    'CM-AIL-G1-U1-L3-A1',
    'Careful Choice Scenarios',
    'scenario_cards',
    'teacher_led',
    'platform_only',
    true,
    'Read each scenario and ask the class what a kind and careful choice would be.',
    '{
      "scenarios":[
        "An AI tool gives an answer that sounds silly. What should we do?",
        "A website asks for your name. What should you do first?"
      ]
    }'::jsonb,
    1
  )
on conflict (activity_code) do update
set lesson_id = excluded.lesson_id,
    title = excluded.title,
    activity_type = excluded.activity_type,
    delivery_mode = excluded.delivery_mode,
    access_type = excluded.access_type,
    is_smartboard_ready = excluded.is_smartboard_ready,
    instructions = excluded.instructions,
    activity_json = excluded.activity_json,
    sequence_order = excluded.sequence_order;

update public.lesson_resources
set resource_code = 'CM-AIL-G1-U1-L1-R1',
    access_type = 'teacher_only',
    visibility = 'teacher',
    is_printable = false,
    is_downloadable = false,
    storage_path = null,
    mime_type = null,
    estimated_pages = null,
    display_mode = 'inline',
    sort_order = 1
where id = '60000000-0000-4000-8000-000000000001';

update public.lesson_resources
set resource_code = 'CM-AIL-G1-U1-L1-R2',
    access_type = 'platform_only',
    visibility = 'teacher',
    is_printable = false,
    is_downloadable = false,
    storage_path = null,
    mime_type = null,
    estimated_pages = null,
    display_mode = 'smartboard',
    sort_order = 2
where id = '60000000-0000-4000-8000-000000000002';

update public.lesson_resources
set resource_code = 'CM-AIL-G1-U1-L1-R3',
    access_type = 'teacher_only',
    visibility = 'teacher',
    is_printable = false,
    is_downloadable = false,
    storage_path = null,
    mime_type = null,
    estimated_pages = null,
    display_mode = 'inline',
    sort_order = 3
where id = '60000000-0000-4000-8000-000000000003';

update public.lesson_resources
set resource_code = 'CM-AIL-G1-U1-L2-R1',
    access_type = 'printable',
    visibility = 'teacher',
    is_printable = true,
    is_downloadable = false,
    storage_path = null,
    mime_type = 'text/plain',
    estimated_pages = 1,
    display_mode = 'print',
    sort_order = 1
where id = '60000000-0000-4000-8000-000000000004';

update public.lesson_resources
set resource_code = 'CM-AIL-G1-U1-L3-R1',
    access_type = 'printable',
    visibility = 'teacher',
    is_printable = true,
    is_downloadable = false,
    storage_path = null,
    mime_type = 'text/plain',
    estimated_pages = 1,
    display_mode = 'print',
    sort_order = 1
where id = '60000000-0000-4000-8000-000000000005';

insert into public.lesson_resources (
  lesson_id,
  resource_code,
  resource_type,
  title,
  description,
  file_url,
  content,
  access_type,
  visibility,
  is_printable,
  is_downloadable,
  storage_path,
  mime_type,
  estimated_pages,
  display_mode,
  sort_order
)
values (
  '30000000-0000-4000-8000-000000000001',
  'CM-AIL-G1-U1-L1-R4',
  'worksheet',
  'AI Around Us Reflection Sheet',
  'Printable one-page classroom reflection sheet. This is demo-only and can be replaced by import later.',
  null,
  'Draw one tool that might use AI. Complete: I think it uses AI because...',
  'printable',
  'teacher',
  true,
  false,
  null,
  'text/plain',
  1,
  'print',
  4
)
on conflict (resource_code) do update
set lesson_id = excluded.lesson_id,
    resource_type = excluded.resource_type,
    title = excluded.title,
    description = excluded.description,
    file_url = excluded.file_url,
    content = excluded.content,
    access_type = excluded.access_type,
    visibility = excluded.visibility,
    is_printable = excluded.is_printable,
    is_downloadable = excluded.is_downloadable,
    storage_path = excluded.storage_path,
    mime_type = excluded.mime_type,
    estimated_pages = excluded.estimated_pages,
    display_mode = excluded.display_mode,
    sort_order = excluded.sort_order;

insert into public.assessment_templates (
  lesson_id,
  template_code,
  title,
  description,
  assessment_type,
  criteria_json,
  access_type,
  sequence_order
)
values
  (
    '30000000-0000-4000-8000-000000000001',
    'CM-AIL-G1-U1-L1-AT1',
    'AI Around Us Class Checklist',
    'Teacher-only class-level checklist aligned to the MVP assessment form.',
    'class_checklist',
    '{
      "criteria":[
        {"key":"objective_met","label":"Students named a familiar AI example."},
        {"key":"activity_completed","label":"Class completed the sorting activity."},
        {"key":"students_explained_thinking","label":"Students explained their thinking using simple reasoning."}
      ]
    }'::jsonb,
    'teacher_only',
    1
  ),
  (
    '30000000-0000-4000-8000-000000000002',
    'CM-AIL-G1-U1-L2-AT1',
    'Patterns and Prompts Class Checklist',
    'Teacher-only checklist for pattern recognition and explanation.',
    'class_checklist',
    '{"criteria":[{"key":"pattern_reasoning","label":"Students explained a pattern rule."}]}'::jsonb,
    'teacher_only',
    1
  ),
  (
    '30000000-0000-4000-8000-000000000003',
    'CM-AIL-G1-U1-L3-AT1',
    'Kind AI Choices Class Checklist',
    'Teacher-only checklist for careful and kind AI use discussion.',
    'class_checklist',
    '{"criteria":[{"key":"careful_choice","label":"Students described one careful AI choice."}]}'::jsonb,
    'teacher_only',
    1
  )
on conflict (template_code) do update
set lesson_id = excluded.lesson_id,
    title = excluded.title,
    description = excluded.description,
    assessment_type = excluded.assessment_type,
    criteria_json = excluded.criteria_json,
    access_type = excluded.access_type,
    sequence_order = excluded.sequence_order;
