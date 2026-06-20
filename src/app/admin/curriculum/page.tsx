import { DashboardCard } from "@/components/DashboardCard";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { DELIVERY_MODE_DESCRIPTIONS, DELIVERY_MODE_LABELS, DELIVERY_MODES, GRADE_BAND_LABELS, GRADE_BANDS } from "@/lib/constants";

export default function AdminCurriculumPage() {
  return (
    <Layout>
      <PageHeader
        description="Placeholder curriculum management for grade bands, lesson sequences, delivery-mode logic, and rubric structures."
        eyebrow="Platform admin"
        title="Curriculum"
      />
      <div className="grid gap-5 lg:grid-cols-2">
        {Object.values(GRADE_BANDS).map((gradeBand) => (
          <DashboardCard
            description={gradeBand === GRADE_BANDS.kTo6 ? "Teacher-led implementation with class-level progress." : "Student-account implementation planned for assignments and feedback."}
            key={gradeBand}
            title={GRADE_BAND_LABELS[gradeBand]}
          />
        ))}
      </div>
      <DashboardCard eyebrow="Prepared constants" title="Delivery modes">
        <div className="grid gap-3 lg:grid-cols-3">
          {Object.values(DELIVERY_MODES).map((mode) => (
            <div className="rounded-md border border-[#dde3dc] bg-[#fbfcfa] p-4" key={mode}>
              <p className="font-semibold text-[#17211c]">{DELIVERY_MODE_LABELS[mode]}</p>
              <code className="mt-1 block text-xs text-[#66746d]">{mode}</code>
              <p className="mt-3 text-sm leading-6 text-[#66746d]">{DELIVERY_MODE_DESCRIPTIONS[mode]}</p>
            </div>
          ))}
        </div>
      </DashboardCard>
    </Layout>
  );
}
