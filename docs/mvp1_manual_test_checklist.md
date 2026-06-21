# MVP 1 Manual Test Checklist

Use this checklist for the K to Grade 6 teacher-led MVP flow. Supabase Auth, RLS, policies, student accounts, and `student_profiles` are not part of this test.

## Admin Setup Flow

- Open `/admin` and confirm the page says it is an internal MVP setup workspace.
- Open `/admin/schools` and create a school.
- Open `/admin/academic-years` and create an academic year linked to the school.
- Open `/admin/teachers` and create a teacher.
- Confirm the teacher has a `profiles` row with `role = teacher` and `auth_user_id = null`.
- Confirm the teacher has a linked `teacher_profiles` row.
- Open `/admin/classes` and create a K to Grade 6 class.
- Confirm the class saves with `grade_band = k_to_6` and `delivery_mode = teacher_led`.
- Open `/admin/class-assignments` and assign the teacher to the class.

## Teacher Preview Selector Test

- Open `/teacher/classes`.
- Confirm the page shows the internal teacher preview selector.
- Confirm the selector explains that Supabase Auth will replace it later.
- Select the teacher created in admin setup.
- Submit the selector and confirm the URL includes `?teacherProfileId=...`.
- Confirm only classes assigned to that teacher are shown.

## Teacher Class Flow

- From `/teacher/classes?teacherProfileId=...`, open the assigned class.
- Confirm the class detail page shows the real class name, grade level, `k_to_6`, and `teacher_led`.
- Confirm the page says K to Grade 6 uses class-level assessment and no student accounts.
- Confirm the selected `teacherProfileId` is preserved in class and lesson links.

## Lesson Resource Test

- Open a lesson from the class detail page.
- Confirm lesson resources load from `lesson_resources`.
- Confirm the empty state is clear if no resources exist.
- Confirm no student-account workflow appears in the lesson page.

## Assessment Save/Update Test

- Fill in the class assessment form on the lesson page.
- Save the form and confirm a success message appears.
- Refresh the lesson page and confirm the saved assessment values are pre-filled.
- Change one or more values and save again.
- Confirm the page still shows one current assessment for that class and lesson.

## Supabase Table Verification Test

- Check `schools` for the created school.
- Check `academic_years` for the school-linked academic year.
- Check `profiles` for the teacher profile with `auth_user_id = null`.
- Check `teacher_profiles` for the linked teacher profile.
- Check `classes` for the K to Grade 6 class with `delivery_mode = teacher_led`.
- Check `teacher_class_assignments` for the teacher/class assignment.
- Check `lesson_resources` for lesson-attached resources.
- Check `class_lesson_assessments` for one row per `class_id + lesson_id`.
- Confirm no K to Grade 6 rows were added to `student_profiles`.
