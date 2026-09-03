export const CHART_COLORS = {
  government: "hsl(var(--chart-1))",
  public: "hsl(var(--chart-2))",
  social: "hsl(var(--chart-3))",
  political: "hsl(var(--chart-4))",
  other: "hsl(var(--chart-5))",
  cultural: "hsl(var(--chart-6))",
} as const;

export type ChartCategory = keyof typeof CHART_COLORS;

export const BAR_CATEGORIES: Array<{
  key: string;
  label: string;
  color: string;
}> = [
  { key: "government", label: "Government", color: CHART_COLORS.government },
  { key: "public", label: "Public", color: CHART_COLORS.public },
  { key: "social", label: "Social", color: CHART_COLORS.social },
  { key: "political", label: "Political", color: CHART_COLORS.political },
  { key: "other", label: "Other", color: CHART_COLORS.other },
];

export function eventTypeToCategory(type: string): ChartCategory {
  const t = type.toLowerCase();
  if (t === "government event") return "government";
  if (t === "public event") return "public";
  if (t === "social event") return "social";
  if (t === "cultural & religious event") return "cultural";
  if (t === "political event") return "political";
  return "other";
}

export function eventTypeToBarCategory(
  type: string
): "government" | "public" | "social" | "political" | "other" {
  const t = type.toLowerCase();
  if (t === "government event") return "government";
  if (t === "public event") return "public";
  if (t === "social event" || t === "cultural & religious event")
    return "social";
  if (t === "political event") return "political";
  return "other";
}
