"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAcademicYear, createK6Class, createSchool, createTeacher, createTeacherClassAssignment } from "@/lib/admin-data";

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function redirectWithResult(path: string, result: { ok: boolean; message: string; mode: string }) {
  const status = result.ok ? "success" : "error";
  const message = encodeURIComponent(result.message);
  redirect(`${path}?status=${status}&mode=${result.mode}&message=${message}`);
}

export async function createSchoolAction(formData: FormData) {
  const result = await createSchool({
    name: textValue(formData, "name"),
    region: textValue(formData, "region"),
    countryCode: textValue(formData, "country_code")
  });

  revalidatePath("/admin/schools");
  redirectWithResult("/admin/schools", result);
}

export async function createAcademicYearAction(formData: FormData) {
  const result = await createAcademicYear({
    schoolId: textValue(formData, "school_id"),
    name: textValue(formData, "name"),
    startsOn: textValue(formData, "starts_on"),
    endsOn: textValue(formData, "ends_on"),
    isCurrent: textValue(formData, "is_current") === "on"
  });

  revalidatePath("/admin/academic-years");
  redirectWithResult("/admin/academic-years", result);
}

export async function createTeacherAction(formData: FormData) {
  const result = await createTeacher({
    schoolId: textValue(formData, "school_id"),
    fullName: textValue(formData, "full_name"),
    email: textValue(formData, "email")
  });

  revalidatePath("/admin/teachers");
  redirectWithResult("/admin/teachers", result);
}

export async function createK6ClassAction(formData: FormData) {
  const result = await createK6Class({
    schoolId: textValue(formData, "school_id"),
    academicYearId: textValue(formData, "academic_year_id"),
    primaryTeacherId: textValue(formData, "primary_teacher_id"),
    name: textValue(formData, "name"),
    gradeLevel: Number(textValue(formData, "grade_level"))
  });

  revalidatePath("/admin/classes");
  redirectWithResult("/admin/classes", result);
}

export async function createTeacherClassAssignmentAction(formData: FormData) {
  const result = await createTeacherClassAssignment({
    teacherProfileId: textValue(formData, "teacher_profile_id"),
    classId: textValue(formData, "class_id"),
    assignmentRole: textValue(formData, "assignment_role")
  });

  revalidatePath("/admin/class-assignments");
  redirectWithResult("/admin/class-assignments", result);
}
