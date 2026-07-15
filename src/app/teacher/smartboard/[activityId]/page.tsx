import { DashboardCard } from "@/components/DashboardCard";
import { Layout } from "@/components/Layout";
import { MatchingCardsSmartboard } from "@/components/MatchingCardsSmartboard";
import { PageHeader } from "@/components/PageHeader";
import { PatternSpottingSmartboard, type PatternRound } from "@/components/PatternSpottingSmartboard";
import { ScenarioRevealSmartboard, type ScenarioRevealRound } from "@/components/ScenarioRevealSmartboard";
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
  confidence?: string;
};

type SortingCategory = {
  id: string;
  label: string;
  sharedFeature?: string;
};

type SortingCardsConfig = {
  prompt: string;
  categories: SortingCategory[];
  cards: SortingCard[];
  targetCategory?: string;
  accessibilityNotes: string[];
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

type ScenarioRevealConfig = {
  prompt: string;
  rounds: ScenarioRevealRound[];
  accessibilityNotes: string[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
}

function stringFrom(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function accessibilityNotes(value: unknown): string[] {
  if (!isRecord(value)) {
    return [];
  }

  return Object.entries(value).flatMap(([key, entry]) => {
    const label = key
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

    if (typeof entry === "string" && entry.trim()) {
      return [`${label}: ${entry.trim()}`];
    }

    if (Array.isArray(entry)) {
      const values = entry.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
      return values.length > 0 ? [`${label}: ${values.join(", ")}`] : [];
    }

    if (entry === true) {
      return [label];
    }

    return [];
  });
}

function parseSortingCategories(value: unknown): SortingCategory[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((category, index): SortingCategory | null => {
      if (typeof category === "string" && category.trim()) {
        return { id: category.trim(), label: category.trim() };
      }

      if (!isRecord(category)) {
        return null;
      }

      const label = stringFrom(category.label) ?? stringFrom(category.title) ?? stringFrom(category.name);
      const id = stringFrom(category.id) ?? label ?? `category-${index + 1}`;

      if (!label) {
        return null;
      }

      return {
        id,
        label,
        sharedFeature: stringFrom(category.shared_feature ?? category.sharedFeature) ?? undefined
      };
    })
    .filter((category): category is SortingCategory => category !== null);
}

function parseSortingCardsConfig(activity: SmartboardActivity): SortingCardsConfig | null {
  if (!isRecord(activity.activityJson)) {
    return null;
  }

  const targetCategory = stringFrom(activity.activityJson.target_category ?? activity.activityJson.targetCategory) ?? undefined;
  const basePrompt = typeof activity.activityJson.prompt === "string" ? activity.activityJson.prompt : "Sort these examples into the best category.";
  const prompt = targetCategory ? `${basePrompt} Sort examples and non-examples of ${targetCategory}.` : basePrompt;
  const categories = parseSortingCategories(activity.activityJson.categories);
  const categoryIds = new Set(categories.map((category) => category.id));
  const categoryLabels = new Map(categories.map((category) => [category.label, category.id]));
  const cards: SortingCard[] = [];

  if (Array.isArray(activity.activityJson.cards)) {
    activity.activityJson.cards.forEach((card, index) => {
      if (!isRecord(card)) {
        return;
      }

      const label = stringFrom(card.label);
      const rawCorrectCategory = stringFrom(card.correctCategory ?? card.correct_category);
      const correctCategory = rawCorrectCategory ? (categoryIds.has(rawCorrectCategory) ? rawCorrectCategory : categoryLabels.get(rawCorrectCategory) ?? rawCorrectCategory) : null;

      if (!label || !correctCategory) {
        return;
      }

      cards.push({
        id: `${label}-${index}`,
        label,
        correctCategory,
        confidence: stringFrom(card.confidence) ?? undefined
      });
    });
  }

  if (categories.length === 0 || cards.length === 0) {
    return null;
  }

  return {
    prompt,
    categories,
    cards,
    targetCategory,
    accessibilityNotes: accessibilityNotes(activity.activityJson.accessibility)
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

function parseScenarioRevealRound(value: unknown, index: number): ScenarioRevealRound | null {
  if (!isRecord(value)) {
    return null;
  }

  const scenario = stringFrom(value.scenario);
  const prompt = stringFrom(value.prompt);
  const reveal = stringFrom(value.reveal);

  if (!scenario || !prompt || !reveal) {
    return null;
  }

  return {
    id: stringFrom(value.id) ?? `round-${index + 1}`,
    scenario,
    prompt,
    reveal,
    discussion: stringFrom(value.discussion) ?? undefined,
    confidence: stringFrom(value.confidence) ?? undefined
  };
}

function parseScenarioRevealConfig(activity: SmartboardActivity): ScenarioRevealConfig | null {
  if (!isRecord(activity.activityJson)) {
    return null;
  }

  const prompt = stringFrom(activity.activityJson.prompt) ?? "Predict what will happen, then reveal the result.";
  const rounds = Array.isArray(activity.activityJson.scenarios)
    ? activity.activityJson.scenarios.map(parseScenarioRevealRound).filter((round): round is ScenarioRevealRound => round !== null)
    : [];
  const fallbackRound = parseScenarioRevealRound(activity.activityJson, 0);
  const resolvedRounds = rounds.length > 0 ? rounds : fallbackRound ? [fallbackRound] : [];

  if (resolvedRounds.length === 0) {
    return null;
  }

  return {
    prompt,
    rounds: resolvedRounds,
    accessibilityNotes: accessibilityNotes(activity.activityJson.accessibility)
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

  if (activity.activityType !== "sorting_cards" && activity.activityType !== "matching_cards" && activity.activityType !== "pattern_spotting" && activity.activityType !== "scenario_reveal") {
    return (
      <Layout>
        <PageHeader description="This smartboard activity type is not available in the first MVP renderer." eyebrow="Teacher workspace" title={activity.title} />
        <DashboardCard description="The current interactive smartboard MVP supports sorting cards, matching cards, pattern spotting, and scenario reveal." title="Activity type coming later" />
      </Layout>
    );
  }

  if (activity.activityType === "scenario_reveal") {
    const scenarioConfig = parseScenarioRevealConfig(activity);

    if (!scenarioConfig) {
      return (
        <Layout>
          <PageHeader description="This scenario reveal activity is missing a scenario, prompt, or reveal." eyebrow="Teacher workspace" title={activity.title} />
          <DashboardCard description="Ask the curriculum admin to review the activity content." title="Activity content unavailable" />
        </Layout>
      );
    }

    return (
      <ScenarioRevealSmartboard
        accessibilityNotes={scenarioConfig.accessibilityNotes}
        prompt={scenarioConfig.prompt}
        returnHref={returnHref}
        returnLabel={returnLabel}
        rounds={scenarioConfig.rounds}
      />
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

  return (
    <SortingCardsSmartboard
      accessibilityNotes={sortingConfig.accessibilityNotes}
      cards={sortingConfig.cards}
      categories={sortingConfig.categories}
      prompt={sortingConfig.prompt}
      returnHref={returnHref}
      returnLabel={returnLabel}
      targetCategory={sortingConfig.targetCategory}
    />
  );
}
