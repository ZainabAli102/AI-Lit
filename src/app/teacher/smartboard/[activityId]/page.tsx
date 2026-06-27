import { DashboardCard } from "@/components/DashboardCard";
import { Layout } from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { SortingCardsSmartboard } from "@/components/SortingCardsSmartboard";
import { getSmartboardActivityResult, type SmartboardActivity } from "@/lib/smartboard-data";

export const dynamic = "force-dynamic";

type SmartboardPageProps = {
  params: Promise<{
    activityId: string;
  }>;
  searchParams: Promise<{
    classId?: string;
    lessonId?: string;
  }>;
};

type SortingCard = {
  id: string;
  label: string;
  correctCategory: string;
};

type SortingCardsConfig = {
  prompt: string;
  categories: string[];
  cards: SortingCard[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseSortingCardsConfig(activity: SmartboardActivity): SortingCardsConfig | null {
  if (!isRecord(activity.activityJson)) {
    return null;
  }

  const prompt = typeof activity.activityJson.prompt === "string" ? activity.activityJson.prompt : "Sort these examples into the best category.";
  const categories = Array.isArray(activity.activityJson.categories)
    ? activity.activityJson.categories.filter((category): category is string => typeof category === "string" && category.trim().length > 0)
    : [];
  const cards: SortingCard[] = [];

  if (Array.isArray(activity.activityJson.cards)) {
    activity.activityJson.cards.forEach((card, index) => {
      if (!isRecord(card)) {
        return;
      }

      const label = typeof card.label === "string" ? card.label : null;
      const correctCategory = typeof card.correctCategory === "string" ? card.correctCategory : null;

      if (!label || !correctCategory) {
        return;
      }

      cards.push({
        id: `${label}-${index}`,
        label,
        correctCategory
      });
    });
  }

  if (categories.length === 0 || cards.length === 0) {
    return null;
  }

  return {
    prompt,
    categories,
    cards
  };
}

export default async function SmartboardPage({ params, searchParams }: SmartboardPageProps) {
  const { activityId } = await params;
  const { classId, lessonId } = await searchParams;
  const returnHref =
    classId?.trim() && lessonId?.trim()
      ? `/teacher/classes/${encodeURIComponent(classId.trim())}/lessons/${encodeURIComponent(lessonId.trim())}`
      : "/teacher/classes";
  const returnLabel = classId?.trim() && lessonId?.trim() ? "Finish and Return to Lesson" : "Back to Teacher Classes";
  const activityResult = await getSmartboardActivityResult(activityId);
  const activity = activityResult.data;

  if (!activity) {
    return (
      <Layout>
        <PageHeader description="The selected smartboard activity is not available." eyebrow="Teacher workspace" title="Activity not found" />
        <DashboardCard description="Return to the lesson page and open a smartboard-ready activity." title="Activity unavailable" />
      </Layout>
    );
  }

  if (!activity.isSmartboardReady) {
    return (
      <Layout>
        <PageHeader description="This activity is stored in the curriculum library, but it is not marked for smartboard display." eyebrow="Teacher workspace" title={activity.title} />
        <DashboardCard description="Open a smartboard-ready activity from the teacher lesson page." title="Not smartboard-ready" />
      </Layout>
    );
  }

  if (activity.activityType !== "sorting_cards") {
    return (
      <Layout>
        <PageHeader description="This smartboard activity type is not available in the first MVP renderer." eyebrow="Teacher workspace" title={activity.title} />
        <DashboardCard description="The first interactive smartboard MVP supports sorting cards only." title="Activity type coming later" />
      </Layout>
    );
  }

  const sortingConfig = parseSortingCardsConfig(activity);

  if (!sortingConfig) {
    return (
      <Layout>
        <PageHeader description="This sorting activity is missing categories or cards." eyebrow="Teacher workspace" title={activity.title} />
        <DashboardCard description="Ask the curriculum admin to review the activity content." title="Activity content unavailable" />
      </Layout>
    );
  }

  return <SortingCardsSmartboard cards={sortingConfig.cards} categories={sortingConfig.categories} prompt={sortingConfig.prompt} returnHref={returnHref} returnLabel={returnLabel} />;
}
