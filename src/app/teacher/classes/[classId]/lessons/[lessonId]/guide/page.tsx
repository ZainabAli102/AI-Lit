import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/Button";
import { DashboardCard } from "@/components/DashboardCard";
import { Layout } from "@/components/Layout";
import {
  getLessonForClass,
  getLessonResourcesResult,
  getTeacherClassResult,
  PREVIEW_TEACHER_PROFILE_ID,
  type LessonResource
} from "@/lib/teacher-led-data";

type TeacherGuidePageProps = {
  params: Promise<{
    classId: string;
    lessonId: string;
  }>;
  searchParams: Promise<{
    teacherProfileId?: string;
  }>;
};

function resourceSearchText(resource: LessonResource) {
  return [resource.resourceType, resource.title, resource.description, resource.mimeType, resource.fileUrl, resource.storagePath]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function isTeacherGuideCandidate(resource: LessonResource) {
  const text = resourceSearchText(resource);
  return resource.resourceType === "teacher_guide" || text.includes("teacher guide") || text.includes("guide pdf") || text.includes("lesson guide");
}

function browserSafePdfUrl(resource: LessonResource | undefined) {
  if (!resource) {
    return null;
  }

  if (resource.fileUrl) {
    return resource.fileUrl;
  }

  if (resource.storagePath && /^https?:\/\//i.test(resource.storagePath)) {
    return resource.storagePath;
  }

  return null;
}

function findTeacherGuideResource(resources: LessonResource[]) {
  const candidates = resources.filter(isTeacherGuideCandidate);

  return (
    candidates.find((resource) => resource.mimeType === "application/pdf" && browserSafePdfUrl(resource)) ??
    candidates.find((resource) => resource.fileUrl?.toLowerCase().includes(".pdf") || resource.storagePath?.toLowerCase().includes(".pdf")) ??
    candidates.find((resource) => browserSafePdfUrl(resource)) ??
    candidates[0] ??
    null
  );
}

export default async function TeacherGuidePage({ params, searchParams }: TeacherGuidePageProps) {
  const { classId, lessonId } = await params;
  const { teacherProfileId } = await searchParams;
  const selectedTeacherProfileId = teacherProfileId?.trim() || PREVIEW_TEACHER_PROFILE_ID;
  const teacherQuery = `teacherProfileId=${encodeURIComponent(selectedTeacherProfileId)}`;
  const classResult = await getTeacherClassResult(classId);
  const classInfo = classResult.data;
  const lesson = classInfo ? await getLessonForClass(classInfo, lessonId) : null;
  const resourcesResult = await getLessonResourcesResult(lessonId);
  const guideResource = findTeacherGuideResource(resourcesResult.data);
  const guideUrl = browserSafePdfUrl(guideResource ?? undefined);

  if (!classInfo || !lesson) {
    return (
      <Layout>
        <DashboardCard description="Return to the class lesson page and open a valid lesson." title="Teacher guide unavailable" />
      </Layout>
    );
  }

  return (
    <Layout>
      <header className="rounded-md border border-[#dde3dc] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#116466]">{lesson.displayCode ?? lesson.lessonCode ?? "Lesson"}</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#17211c]">{lesson.title}</h1>
            <p className="mt-2 text-sm leading-6 text-[#42514a]">Teacher Guide</p>
          </div>
          <Button href={`/teacher/classes/${classId}/lessons/${lessonId}?${teacherQuery}`} icon={<ArrowLeft aria-hidden="true" className="h-4 w-4" />} variant="secondary">
            Back to Lesson
          </Button>
        </div>
      </header>

      <section className="rounded-md border border-[#dde3dc] bg-white p-4 shadow-sm">
        <h2 className="text-xl font-semibold text-[#17211c]">Teacher Guide</h2>
        {resourcesResult.error ? (
          <p className="mt-3 rounded-md border border-[#f0d2a5] bg-[#fff8e8] p-4 text-sm leading-6 text-[#6d4c11]">
            Teacher guide resources could not be loaded. Please try again later.
          </p>
        ) : guideUrl ? (
          <div className="mt-4 overflow-hidden rounded-md border border-[#dde3dc] bg-[#fbfcfa]">
            <iframe className="h-[78vh] w-full" src={guideUrl} title={`${lesson.title} teacher guide`} />
          </div>
        ) : (
          <p className="mt-3 rounded-md border border-dashed border-[#cad6cf] bg-[#fbfcfa] p-4 text-sm leading-6 text-[#66746d]">
            Teacher guide PDF not uploaded yet.
          </p>
        )}
      </section>
    </Layout>
  );
}
