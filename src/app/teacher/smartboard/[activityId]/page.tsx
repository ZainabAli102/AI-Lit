import { DashboardCard } from "@/components/DashboardCard";
import { Layout } from "@/components/Layout";
import { MatchingCardsSmartboard } from "@/components/MatchingCardsSmartboard";
import { PageHeader } from "@/components/PageHeader";
import { PatternSpottingSmartboard, type PatternRound } from "@/components/PatternSpottingSmartboard";
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

type PatternSpottingConfig = {
  prompt: string;
  renderMode: "color_swatches" | "shapes";
  pairWithLabel: boolean;
  shapeSet: string[];
  rounds: PatternRound[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
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

function parsePatternRound(value: unknown): PatternRound | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = typeof value.id === "string" ? value.id : null;
  const sequence = stringArray(value.sequence);
  const options = stringArray(value.options);
  const next = typeof value.next === "string" ? value.next : null;
  const repeatingUnit = stringArray(value.repeating_unit ?? value.repeatingUnit);

  if (!id || sequence.length === 0 || options.length === 0 || !next) {
    return null;
  }

  return {
    id,
    sequence,
    options,
    next,
    repeatingUnit: repeatingUnit.length > 0 ? repeatingUnit : undefined
  };
}

function parsePatternSpottingConfig(activity: SmartboardActivity): PatternSpottingConfig | null {
  if (!isRecord(activity.activityJson)) {
    return null;
  }

  const renderValue = typeof activity.activityJson.render === "string" ? activity.activityJson.render : "color_swatches";
  const renderMode = renderValue === "shapes" ? "shapes" : "color_swatches";
  const prompt = typeof activity.activityJson.prompt === "string" ? activity.activityJson.prompt : "What comes next?";
  const pairWithLabel = typeof activity.activityJson.pair_with_label === "boolean" ? activity.activityJson.pair_with_label : true;
  const shapeSet = stringArray(activity.activityJson.shape_set ?? activity.activityJson.shapeSet);
  const rounds = Array.isArray(activity.activityJson.rounds)
    ? activity.activityJson.rounds.map(parsePatternRound).filter((round): round is PatternRound => round !== null)
    : [];

  if (rounds.length === 0) {
    return null;
  }

  return {
    prompt,
    renderMode,
    pairWithLabel,
    shapeSet,
    rounds
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

  if (activity.activityType !== "sorting_cards" && activity.activityType !== "matching_cards" && activity.activityType !== "pattern_spotting") {
    return (
      <Layout>
        <PageHeader description="This smartboard activity type is not available in the first MVP renderer." eyebrow="Teacher workspace" title={activity.title} />
        <DashboardCard description="The current interactive smartboard MVP supports sorting cards, matching cards, and pattern spotting." title="Activity type coming later" />
      </Layout>
    );
  }

  if (activity.activityType === "pattern_spotting") {
    const patternConfig = parsePatternSpottingConfig(activity);

    if (!patternConfig) {
      return (
        <Layout>
          <PageHeader description="This pattern activity is missing rounds, sequence items, answer options, or the next item." eyebrow="Teacher workspace" title={activity.title} />
          <DashboardCard description="Ask the curriculum admin to review the activity content." title="Activity content unavailable" />
        </Layout>
      );
    }

    return (
      <PatternSpottingSmartboard
        pairWithLabel={patternConfig.pairWithLabel}
        prompt={patternConfig.prompt}
        renderMode={patternConfig.renderMode}
        returnHref={returnHref}
        returnLabel={returnLabel}
        rounds={patternConfig.rounds}
        shapeSet={patternConfig.shapeSet}
      />
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
