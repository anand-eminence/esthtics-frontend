"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input, Select } from "@/components/form";
import type { Theme } from "@/lib/types";

type Current = {
  search: string;
  date: string;
  themeId: string;
  day: string;
  slot: string;
};

const KEYS = ["search", "date", "themeId", "day", "slot"] as const;

export function QuestionFilters({
  themes,
  current,
}: {
  themes: Theme[];
  current: Current;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(current.search);

  function apply(patch: Partial<Current>) {
    const next = { ...current, ...patch };
    const params = new URLSearchParams();
    // Only the filter keys. The page hands in its whole filter object, which
    // also carries `page`, and any filter change should start again at page 1.
    for (const key of KEYS) {
      if (next[key]) params.set(key, next[key]);
    }
    router.push(`/questions${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <form
        className="min-w-[220px] flex-1"
        onSubmit={(e) => {
          e.preventDefault();
          apply({ search });
        }}
      >
        <Input
          type="search"
          placeholder="Search questions"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onBlur={() => search !== current.search && apply({ search })}
        />
      </form>

      <Input
        type="month"
        aria-label="Month"
        className="w-[160px]"
        value={current.date.slice(0, 7)}
        onChange={(e) => apply({ date: e.target.value })}
      />

      <Select
        aria-label="Theme"
        className="w-[180px]"
        value={current.themeId}
        onChange={(e) => apply({ themeId: e.target.value })}
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
        onChange={(e) => apply({ day: e.target.value })}
      >
        <option value="">Day · All</option>
        <option value="live">Live</option>
        <option value="not_live">Not live</option>
      </Select>

      <Select
        aria-label="Slot"
        className="w-[130px]"
        value={current.slot}
        onChange={(e) => apply({ slot: e.target.value })}
      >
        <option value="">Slot · All</option>
        <option value="1">Slot 1</option>
        <option value="2">Slot 2</option>
        <option value="3">Slot 3</option>
        <option value="4">Bonus</option>
      </Select>
    </div>
  );
}
