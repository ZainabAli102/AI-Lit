import { BookOpen, MonitorUp, UsersRound } from "lucide-react";
import { DELIVERY_MODE_DESCRIPTIONS, DELIVERY_MODE_LABELS, GRADE_BAND_LABELS, type DeliveryMode, type GradeBand } from "@/lib/constants";
import { Button } from "@/components/Button";

type ClassCardProps = {
  classInfo: {
    id: string;
    name: string;
    gradeBand: GradeBand;
    deliveryMode: DeliveryMode;
    teacherName: string;
    activeLessons: number;
    progressLabel?: string;
  };
};

export function ClassCard({ classInfo }: ClassCardProps) {
  return (
    <article className="rounded-lg border border-[#dde3dc] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#b9c8c0] hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#116466]">
            {GRADE_BAND_LABELS[classInfo.gradeBand]}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[#17211c]">{classInfo.name}</h2>
        </div>
        <span className="rounded-md border border-[#d7c49a] bg-[#fff8e8] px-3 py-1 text-xs font-semibold text-[#6d4c11]">
          delivery mode: <code>{classInfo.deliveryMode}</code>
        </span>
      </div>

      <p className="mt-4 text-sm leading-6 text-[#66746d]">
        <span className="font-semibold text-[#42514a]">{DELIVERY_MODE_LABELS[classInfo.deliveryMode]}.</span>{" "}
        {DELIVERY_MODE_DESCRIPTIONS[classInfo.deliveryMode]}
      </p>

      <dl className="mt-5 grid gap-3 text-sm text-[#42514a]">
        <div className="flex items-center gap-3">
          <UsersRound aria-hidden="true" className="h-4 w-4 text-[#116466]" />
          <div>
            <dt className="sr-only">Teacher</dt>
            <dd>{classInfo.teacherName}</dd>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <BookOpen aria-hidden="true" className="h-4 w-4 text-[#116466]" />
          <div>
            <dt className="sr-only">Lessons</dt>
            <dd>{classInfo.activeLessons} available lessons</dd>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <MonitorUp aria-hidden="true" className="h-4 w-4 text-[#116466]" />
          <div>
            <dt className="sr-only">Progress</dt>
            <dd>{classInfo.progressLabel ?? "Class-level progress"}</dd>
          </div>
        </div>
      </dl>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button href={`/teacher/classes/${classInfo.id}`} variant="secondary">
          Open class
        </Button>
        <Button href="/school/progress" variant="ghost">
          Progress view
        </Button>
      </div>
    </article>
  );
}
