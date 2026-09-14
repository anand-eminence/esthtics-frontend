import { Badge } from "./ui";
import type { DayState } from "@/lib/types";

const BADGES = {
  live: { label: "Live", tone: "ok" },
  ready: { label: "Ready to publish", tone: "chip" },
  in_progress: { label: "In progress", tone: "warn" },
  empty: { label: "Empty", tone: "neutral" },
} as const satisfies Record<
  DayState,
  { label: string; tone: "ok" | "chip" | "warn" | "neutral" }
>;

export function DayBadge({ state }: { state: DayState }) {
  return <Badge tone={BADGES[state].tone}>{BADGES[state].label}</Badge>;
}
