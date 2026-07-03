"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PREVIEW_TEACHER_PROFILE_ID, saveK6ClassLessonAssessment, type K6AssessmentInput } from "@/lib/teacher-led-data";

const responseValues = ["yes", "partly", "no"] as const;
const statusValues = ["completed", "needs_review"] as const;
const lessonFitValues = ["Very strong", "Good", "Needs adjustment", "Difficult to teach"] as const;

function readAssessmentResponse(formData: FormData, key: string): K6AssessmentInput["objectiveMet"] {
  const value = formData.get(key);
  return responseValues.includes(value as K6AssessmentInput["objectiveMet"]) ? (value as K6AssessmentInput["objectiveMet"]) : "partly";
}

function readOverallStatus(formData: FormData): K6AssessmentInput["overallStatus"] {
  const value = formData.get("overallStatus");
  if (statusValues.includes(value as K6AssessmentInput["overallStatus"])) {
    return value as K6AssessmentInput["overallStatus"];
  }

  const lessonFit = readLessonFit(formData);
  return lessonFit === "Needs adjustment" || lessonFit === "Difficult to teach" ? "needs_review" : "completed";
}

function readText(formData: FormData, key: string): string | null {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function readLessonFit(formData: FormData) {
  const value = formData.get("overallLessonFit");
  return lessonFitValues.includes(value as (typeof lessonFitValues)[number]) ? (value as (typeof lessonFitValues)[number]) : "Good";
}

function composeTeacherReflection(formData: FormData) {
  const revisitNote = readText(formData, "whatToRevisit") ?? readText(formData, "studentsNeedingSupport");
  const fields = [
    ["Overall lesson fit", readLessonFit(formData)],
    ["What worked well", readText(formData, "whatWorkedWell")],
    ["What confused students", readText(formData, "whatConfusedStudents")],
    ["What should be revisited next lesson", revisitNote],
    ["Activity, printable, or board task issue", readText(formData, "assetOrActivityIssue")],
    ["Notes or suggestions to improve this lesson", readText(formData, "lessonImprovementNotes")]
  ];

  const lines = fields
    .filter(([, value]) => typeof value === "string" && value.trim().length > 0)
    .map(([label, value]) => `${label}: ${value}`);

  return lines.length > 0 ? lines.join("\n") : null;
}

export async function submitK6AssessmentAction(formData: FormData) {
  const classId = readText(formData, "classId");
  const lessonId = readText(formData, "lessonId");
  const teacherId = readText(formData, "teacherId") ?? PREVIEW_TEACHER_PROFILE_ID;
  const teacherProfileId = readText(formData, "teacherProfileId") ?? teacherId;
  const teacherQuery = `teacherProfileId=${encodeURIComponent(teacherProfileId)}`;

  if (!classId || !lessonId) {
    redirect(`/teacher/classes?assessment=missing-context&${teacherQuery}`);
  }

  const result = await saveK6ClassLessonAssessment({
    classId,
    lessonId,
    teacherId,
    objectiveMet: readAssessmentResponse(formData, "objectiveMet"),
    activityCompleted: readAssessmentResponse(formData, "activityCompleted"),
    studentsExplainedThinking: readAssessmentResponse(formData, "studentsExplainedThinking"),
    studentsNeedingSupport: readText(formData, "studentsNeedingSupport"),
    teacherNotes: composeTeacherReflection(formData),
    overallStatus: readOverallStatus(formData)
  });

  revalidatePath(`/teacher/classes/${classId}`);
  revalidatePath(`/teacher/classes/${classId}/lessons/${lessonId}`);

  const assessmentStatus = result.ok ? result.mode : "error";
  redirect(`/teacher/classes/${classId}/lessons/${lessonId}?assessment=${assessmentStatus}&${teacherQuery}`);
}
