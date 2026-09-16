"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Button, Input, Select } from "@/components/form";
import type { Theme } from "@/lib/types";

type Current = {
  search: string;
  date: string;
  themeId: string;
  day: string;
  slot: string;
};

const KEYS = ["search", "date", "themeId", "day", "slot"] as const;

const SEARCH_DEBOUNCE_MS = 350;

export function QuestionFilters({
  themes,
  current,
}: {
  themes: Theme[];
  current: Current;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState(current.search);

  const latest = useRef(current);
  latest.current = current;

  const pushed = useRef(current.search);

  function apply(next: Current) {
    pushed.current = next.search;

    const params = new URLSearchParams();
    // Only the filter keys. The page hands in its whole filter object, which
    // also carries `page`, and any filter change starts again at page 1.
    for (const key of KEYS) {
      if (next[key]) params.set(key, next[key]);
    }
    const query = params.toString();

    startTransition(() => {
      router.replace(`/questions${query ? `?${query}` : ""}`, {
        scroll: false,
      });
    });
  }

  const set = (patch: Partial<Current>) =>
    apply({ ...latest.current, search, ...patch });

  useEffect(() => {
    if (search === pushed.current) return;
    const id = setTimeout(
      () => apply({ ...latest.current, search }),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    if (current.search !== pushed.current) {
      pushed.current = current.search;
      setSearch(current.search);
    }
  }, [current.search]);

  const hasFilters = KEYS.some((key) => current[key]) || Boolean(search);

  // Clears only the search, straight away, and keeps the other filters.
  function clearSearch() {
    setSearch("");
    apply({ ...latest.current, search: "" });
  }

  function clearAll() {
    pushed.current = "";
    setSearch("");
    startTransition(() => router.replace("/questions", { scroll: false }));
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[220px] flex-1">
        <Input
          type="search"
          aria-label="Search questions"
          placeholder="Search questions"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          // Our own clear button replaces the browser's, so it can turn into
          // the spinner in the same spot.
          className="pr-9 [&::-webkit-search-cancel-button]:appearance-none"
        />
        {pending ? (
          <span
            role="status"
            aria-label="Loading results"
            className="pointer-events-none absolute inset-y-0 right-0 flex w-9 items-center justify-center text-muted"
          >
            <SpinnerIcon />
          </span>
        ) : search ? (
          <button
            type="button"
            aria-label="Clear search"
            // Keep focus in the box, ready for the next search.
            onMouseDown={(e) => e.preventDefault()}
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 flex w-9 items-center justify-center rounded-r-md text-muted hover:text-ink"
          >
            <CrossIcon />
          </button>
        ) : null}
      </div>

      <Input
        type="month"
        aria-label="Month"
        className="w-[160px]"
        value={current.date.slice(0, 7)}
        onChange={(e) => set({ date: e.target.value })}
      />

      <Select
        aria-label="Theme"
        className="w-[180px]"
        value={current.themeId}
        onChange={(e) => set({ themeId: e.target.value })}
      >
        <option value="">Theme · All</option>
        {themes.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </Select>

      <Select
        aria-label="Day"
        className="w-[150px]"
        value={current.day}
        onChange={(e) => set({ day: e.target.value })}
      >
        <option value="">Day · All</option>
        <option value="live">Live</option>
        <option value="not_live">Not live</option>
      </Select>

      <Select
        aria-label="Slot"
        className="w-[130px]"
        value={current.slot}
        onChange={(e) => set({ slot: e.target.value })}
      >
        <option value="">Slot · All</option>
        <option value="1">Slot 1</option>
        <option value="2">Slot 2</option>
        <option value="3">Slot 3</option>
        <option value="4">Bonus</option>
      </Select>

      {hasFilters ? (
        <Button type="button" variant="secondary" onClick={clearAll}>
          Clear filters
        </Button>
      ) : null}
    </div>
  );
}

function CrossIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-4 w-4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-4 w-4 animate-spin"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
