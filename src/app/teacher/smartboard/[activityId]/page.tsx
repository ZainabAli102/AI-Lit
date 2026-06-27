import { DashboardCard } from "@/components/DashboardCard";
import { Layout } from "@/components/Layout";
import { MatchingCardsSmartboard } from "@/components/MatchingCardsSmartboard";
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

type MatchItem = {
  id: string;
  label: string;
};

type MatchPair = {
  leftId: string;
  rightId: string;
};

type MatchingCardsConfig = {
  prompt: string;
  leftItems: MatchItem[];
  rightItems: MatchItem[];
  matches: MatchPair[];
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

function parseMatchItems(value: unknown): MatchItem[] {
  const items: MatchItem[] = [];

  if (!Array.isArray(value)) {
    return items;
  }

  value.forEach((item) => {
    if (!isRecord(item)) {
      return;
    }

    const id = typeof item.id === "string" ? item.id : null;
    const label = typeof item.label === "string" ? item.label : null;

    if (!id || !label) {
      return;
    }

    items.push({ id, label });
  });

  return items;
}

function parseMatchingCardsConfig(activity: SmartboardActivity): MatchingCardsConfig | null {
  if (!isRecord(activity.activityJson)) {
    return null;
  }

  const prompt = typeof activity.activityJson.prompt === "string" ? activity.activityJson.prompt : "Match each card to the best partner.";
  const leftItems = parseMatchItems(activity.activityJson.leftItems);
  const rightItems = parseMatchItems(activity.activityJson.rightItems);
  const rightIds = new Set(rightItems.map((item) => item.id));
  const leftIds = new Set(leftItems.map((item) => item.id));
  const matches: MatchPair[] = [];

  if (Array.isArray(activity.activityJson.matches)) {
    activity.activityJson.matches.forEach((match) => {
      if (!isRecord(match)) {
        return;
      }

      const leftId = typeof match.leftId === "string" ? match.leftId : null;
      const rightId = typeof match.rightId === "string" ? match.rightId : null;

      if (!leftId || !rightId || !leftIds.has(leftId) || !rightIds.has(rightId)) {
        return;
      }

      matches.push({ leftId, rightId });
    });
  }

  if (leftItems.length === 0 || rightItems.length === 0 || matches.length === 0) {
    return null;
  }

  return {
    prompt,
    leftItems,
    rightItems,
    matches
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

  if (activity.activityType !== "sorting_cards" && activity.activityType !== "matching_cards") {
    return (
      <Layout>
        <PageHeader description="This smartboard activity type is not available in the first MVP renderer." eyebrow="Teacher workspace" title={activity.title} />
        <DashboardCard description="The current interactive smartboard MVP supports sorting cards and matching cards." title="Activity type coming later" />
      </Layout>
    );
  }

  if (activity.activityType === "matching_cards") {
    const matchingConfig = parseMatchingCardsConfig(activity);

    if (!matchingConfig) {
      return (
        <Layout>
          <PageHeader description="This matching activity is missing cards or match pairs." eyebrow="Teacher workspace" title={activity.title} />
          <DashboardCard description="Ask the curriculum admin to review the activity content." title="Activity content unavailable" />
        </Layout>
      );
    }

    return (
      <MatchingCardsSmartboard
        leftItems={matchingConfig.leftItems}
        matches={matchingConfig.matches}
        prompt={matchingConfig.prompt}
        returnHref={returnHref}
        returnLabel={returnLabel}
        rightItems={matchingConfig.rightItems}
      />
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
