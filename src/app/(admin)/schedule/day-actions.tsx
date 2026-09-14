"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/components/ui";
import { apiSend, toApiError } from "@/lib/client";
import type { DayState } from "@/lib/types";

export function DayActions({
  date,
  state,
  hasAnswers,
  isPast,
}: {
  date: string;
  state: DayState;
  hasAnswers: boolean;
  isPast: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canPublish = !isPast && state === "ready";
  const canUnpublish = !isPast && state === "live" && !hasAnswers;
  if (!canPublish && !canUnpublish) return null;

  async function setLive(live: boolean) {
    if (
      !live &&
      !confirm(
        `Unpublish ${date}? Members will see "No quiz today" until it is published again.`,
      )
    ) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await apiSend(`/api/admin/days/${date}`, "PATCH", { live });
      router.refresh();
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        disabled={busy}
        onClick={() => setLive(canPublish)}
        className={cn(
          "w-full rounded-md px-2 py-1.5 text-[12px] font-semibold transition-colors disabled:opacity-60",
          canPublish
            ? "bg-brand-600 text-white hover:bg-brand-700"
            : "border border-line text-ink-soft hover:bg-page",
        )}
      >
        {busy ? "Saving…" : canPublish ? "Publish" : "Unpublish"}
      </button>
      {error ? (
        <p className="mt-1.5 text-[11.5px] text-bad-ink">{error}</p>
      ) : null}
    </div>
  );
}
