import { createSupabaseClient } from "@/lib/supabase/client";
import type { Database, Json } from "@/types/database";

type DeliveryMode = Database["public"]["Enums"]["delivery_mode"];
type ContentAccessType = Database["public"]["Enums"]["content_access_type"];

export type SmartboardDataResult<T> = {
  data: T;
  mode: "supabase" | "local_preview";
  error: string | null;
};

export type SmartboardActivity = {
  id: string;
  title: string;
  activityType: string;
  deliveryMode: DeliveryMode;
  accessType: ContentAccessType;
  isSmartboardReady: boolean;
  instructions: string | null;
  activityJson: Json;
};

type ActivityRow = {
  id: string;
  title: string;
  activity_type: string;
  delivery_mode: DeliveryMode;
  access_type: ContentAccessType;
  is_smartboard_ready: boolean;
  instructions: string | null;
  activity_json: Json;
};

const previewSmartboardActivities: SmartboardActivity[] = [
  {
    id: "preview-activity-ai-around-us",
    title: "AI Around Us Sorting Cards",
    activityType: "sorting_cards",
    deliveryMode: "teacher_led",
    accessType: "platform_only",
    isSmartboardReady: true,
    instructions: "Display cards and sort them as a whole class. Ask students to explain every choice.",
    activityJson: {
      prompt: "Sort each example into the group that fits best.",
      categories: ["AI-powered", "Computer-powered", "Human-powered"],
      cards: [
        { label: "Voice assistant", correctCategory: "AI-powered" },
        { label: "Calculator", correctCategory: "Computer-powered" },
        { label: "Teacher reading a story", correctCategory: "Human-powered" },
        { label: "Translation app", correctCategory: "AI-powered" }
      ]
    }
  },
  {
    id: "preview-activity-matching-ai-around-us",
    title: "Match Tools to What They Do",
    activityType: "matching_cards",
    deliveryMode: "teacher_led",
    accessType: "platform_only",
    isSmartboardReady: true,
    instructions: "Match each tool to what it does, then ask students to explain why the match fits.",
    activityJson: {
      prompt: "Match each example to what it does.",
      leftItems: [
        { id: "voice-assistant", label: "Voice assistant" },
        { id: "calculator", label: "Calculator" },
        { id: "translation-app", label: "Translation app" }
      ],
      rightItems: [
        { id: "answers-questions", label: "Answers spoken questions" },
        { id: "does-arithmetic", label: "Does arithmetic" },
        { id: "changes-language", label: "Changes words into another language" }
      ],
      matches: [
        { leftId: "voice-assistant", rightId: "answers-questions" },
        { leftId: "calculator", rightId: "does-arithmetic" },
        { leftId: "translation-app", rightId: "changes-language" }
      ]
    }
  }
];

let didWarnAboutPreviewMode = false;

function getSupabaseForSmartboard(context: string) {
  const supabase = createSupabaseClient();

  if (supabase) {
    console.info(`[CONNECTED MENA] Supabase mode active for smartboard ${context}.`);
    return supabase;
  }

  if (!didWarnAboutPreviewMode) {
    console.warn(
      `[CONNECTED MENA] Supabase env vars are missing. Smartboard ${context} is using local preview data. ` +
        "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to test against Supabase."
    );
    didWarnAboutPreviewMode = true;
  }

  return null;
}

function mapActivity(row: ActivityRow): SmartboardActivity {
  return {
    id: row.id,
    title: row.title,
    activityType: row.activity_type,
    deliveryMode: row.delivery_mode,
    accessType: row.access_type,
    isSmartboardReady: row.is_smartboard_ready,
    instructions: row.instructions,
    activityJson: row.activity_json
  };
}

export async function getSmartboardActivityResult(activityId: string): Promise<SmartboardDataResult<SmartboardActivity | null>> {
  const supabase = getSupabaseForSmartboard(`activity ${activityId}`);

  if (!supabase) {
    const previewSmartboardActivity = previewSmartboardActivities.find((activity) => activity.id === activityId) ?? null;

    return {
      data: previewSmartboardActivity,
      mode: "local_preview",
      error: previewSmartboardActivity ? null : "Activity not found."
    };
  }

  const { data, error } = await supabase
    .from("activities")
    .select("id,title,activity_type,delivery_mode,access_type,is_smartboard_ready,instructions,activity_json")
    .eq("id", activityId)
    .maybeSingle();

  if (error) {
    return { data: null, mode: "supabase", error: `Activity lookup failed: ${error.message}` };
  }

  if (!data) {
    return { data: null, mode: "supabase", error: "Activity not found." };
  }

  return {
    data: mapActivity(data as ActivityRow),
    mode: "supabase",
    error: null
  };
}
