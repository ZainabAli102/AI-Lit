"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PREVIEW_TEACHER_PROFILE_ID, saveK6ClassLessonAssessment, type K6AssessmentInput } from "@/lib/teacher-led-data";

const responseValues = ["yes", "partly", "no"] as const;
const statusValues = ["completed", "needs_review"] as const;

function readAssessmentResponse(formData: FormData, key: string): K6AssessmentInput["objectiveMet"] {
  const value = formData.get(key);
  return responseValues.includes(value as K6AssessmentInput["objectiveMet"]) ? (value as K6AssessmentInput["objectiveMet"]) : "partly";
}

function readOverallStatus(formData: FormData): K6AssessmentInput["overallStatus"] {
  const value = formData.get("overallStatus");
  return statusValues.includes(value as K6AssessmentInput["overallStatus"]) ? (value as K6AssessmentInput["overallStatus"]) : "needs_review";
}

function readText(formData: FormData, key: string): string | null {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function submitK6AssessmentAction(formData: FormData) {
  const classId = readText(formData, "classId");
  const lessonId = readText(formData, "lessonId");
  const teacherId = readText(formData, "teacherId") ?? PREVIEW_TEACHER_PROFILE_ID;

  if (!classId || !lessonId) {
    redirect("/teacher/classes?assessment=missing-context");
  }

  const result = await saveK6ClassLessonAssessment({
    classId,
    lessonId,
    teacherId,
    objectiveMet: readAssessmentResponse(formData, "objectiveMet"),
    activityCompleted: readAssessmentResponse(formData, "activityCompleted"),
    studentsExplainedThinking: readAssessmentResponse(formData, "studentsExplainedThinking"),
    studentsNeedingSupport: readText(formData, "studentsNeedingSupport"),
    teacherNotes: readText(formData, "teacherNotes"),
    overallStatus: readOverallStatus(formData)
  });

  revalidatePath(`/teacher/classes/${classId}`);
  revalidatePath(`/teacher/classes/${classId}/lessons/${lessonId}`);

  const assessmentStatus = result.ok ? result.mode : "error";
  redirect(`/teacher/classes/${classId}/lessons/${lessonId}?assessment=${assessmentStatus}`);
}
