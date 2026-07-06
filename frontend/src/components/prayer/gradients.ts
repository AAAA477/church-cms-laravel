/**
 * Prayer category gradients — the one deliberate splash of color outside
 * the earth palette, per PRAYER_BOARD_UI_UX_REQUIREMENTS.md.
 */
const GRADIENTS: Record<string, [string, string]> = {
  health: ["#EF4444", "#EC4899"],
  family: ["#EC4899", "#A855F7"],
  employment: ["#3B82F6", "#06B6D4"],
  financial: ["#FBBF24", "#F97316"],
  personal: ["#A855F7", "#6366F1"],
  other: ["#10B981", "#059669"],
};

export const SUCCESS_GRADIENT: [string, string] = ["#10B981", "#059669"];
export const ERROR_GRADIENT: [string, string] = ["#EF4444", "#DC2626"];

/**
 * Category display names arrive as "🏥 Health" (emoji + name); match on
 * the trailing word. Unknown categories fall back to "other".
 */
export function categoryGradient(category: string | null): [string, string] {
  if (!category) return GRADIENTS.other;
  const key = category.toLowerCase().replace(/[^a-z]/g, "");
  return GRADIENTS[key] ?? GRADIENTS.other;
}

export function gradientStyle([from, to]: [string, string]) {
  return { background: `linear-gradient(135deg, ${from}, ${to})` };
}
