"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Input, Select } from "@/components/form";

export type MemberFilterValues = {
  search: string;
  sort: string;
  activity: string;
};

const SEARCH_DEBOUNCE_MS = 350;

const DEFAULTS: MemberFilterValues = {
  search: "",
  sort: "currentStreak",
  activity: "all",
};

const SORTS = [
  { value: "currentStreak", label: "Current streak" },
  { value: "longestStreak", label: "Longest streak" },
  { value: "daysPlayed", label: "Days played" },
  { value: "accuracy", label: "Accuracy" },
  { value: "lastPlayed", label: "Last played" },
];

const ACTIVITY = [
  { value: "all", label: "All time" },
  { value: "today", label: "Played today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
];

export function MemberFilters({ current }: { current: MemberFilterValues }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [search, setSearch] = useState(current.search);

  const latest = useRef(current);
  latest.current = current;

  const pushed = useRef(current.search);

  function apply(next: MemberFilterValues) {
    pushed.current = next.search;

    const params = new URLSearchParams();
    for (const key of ["search", "sort", "activity"] as const) {
      if (next[key] && next[key] !== DEFAULTS[key]) params.set(key, next[key]);
    }
    const query = params.toString();

    startTransition(() => {
      router.replace(`/members${query ? `?${query}` : ""}`, { scroll: false });
    });
  }

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

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[220px] flex-1">
        <Input
          type="search"
          aria-label="Search members"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-20"
        />
        {pending ? (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[12px] text-muted">
            Searching…
          </span>
        ) : null}
      </div>

      <Select
        aria-label="Sort by"
        className="w-[190px]"
        value={current.sort}
        onChange={(e) =>
          apply({ ...latest.current, search, sort: e.target.value })
        }
      >
        {SORTS.map((s) => (
          <option key={s.value} value={s.value}>
            Sort · {s.label}
          </option>
        ))}
      </Select>

      <Select
        aria-label="Activity"
        className="w-[170px]"
        value={current.activity}
        onChange={(e) =>
          apply({ ...latest.current, search, activity: e.target.value })
        }
      >
        {ACTIVITY.map((a) => (
          <option key={a.value} value={a.value}>
            Activity · {a.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
