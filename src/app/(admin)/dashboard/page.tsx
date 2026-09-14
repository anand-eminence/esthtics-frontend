import Link from "next/link";
import { ApiErrorState } from "@/components/api-error";
import { DayBadge } from "@/components/day-badge";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardTitle,
  EmptyState,
  Notice,
  StatCard,
  Table,
  Td,
  Th,
  ThemeChip,
} from "@/components/ui";
import { apiGet } from "@/lib/api";
import { fullDate, shortDate, slotLabel, truncate } from "@/lib/format";
import type { Dashboard } from "@/lib/types";

const slotList = (slots: number[]) =>
  slots.map((slot) => `slot ${slot}`).join(", ");

const ATTENTION = {
  empty: { className: "text-bad-ink", label: "has no questions" },
  in_progress: { className: "text-warn-ink", label: "is incomplete" },
  ready: { className: "text-brand-600", label: "is ready to publish" },
} as const;

export default async function DashboardPage() {
  const result = await apiGet<Dashboard>("/api/admin/dashboard");

  if (!result.ok) {
    return (
      <>
        <PageHeader title="Dashboard" />
        <div className="p-8">
          <ApiErrorState error={result.error} status={result.status} />
        </div>
      </>
    );
  }

  const {
    date,
    timezone,
    today,
    stats,
    todaysQuestions,
    needsAttention,
    scheduledAhead,
  } = result.data;

  const addForToday = (
    <Link
      href={`/questions/new?date=${date}`}
      className="font-semibold underline"
    >
      Add a question
    </Link>
  );

  return (
    <>
      <PageHeader title="Dashboard" meta={`${fullDate(date)} · ${timezone}`} />

      <div className="space-y-6 p-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            accent
            label="Played today"
            value={stats.playedToday}
            hint={`of ${stats.totalMembers} members`}
          />
          <StatCard
            label="Aced today"
            value={stats.acedToday}
            hint="all three correct"
          />
          <StatCard
            label="Answers today"
            value={stats.answersToday}
            hint="including bonus"
          />
          <StatCard
            label="Longest streak"
            value={stats.longestStreak}
            hint={stats.longestStreakMember ?? "no members yet"}
          />
        </div>

        {today.state !== "live" ? (
          <Notice tone="warn">
            <strong className="font-semibold">Today isn&rsquo;t live</strong>,
            so members see &ldquo;No quiz today&rdquo;.{" "}
            {today.state === "ready" ? (
              <>
                All three questions are saved.{" "}
                <Link href="/schedule" className="font-semibold underline">
                  Publish it from the schedule
                </Link>
                .
              </>
            ) : today.state === "in_progress" ? (
              <>
                Still to add: {slotList(today.missingSlots)}. {addForToday}.
              </>
            ) : (
              <>Nothing is saved for today yet. {addForToday}.</>
            )}
          </Notice>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Card>
            <CardTitle action={<DayBadge state={today.state} />}>
              Today&rsquo;s questions
            </CardTitle>
            {todaysQuestions.length === 0 ? (
              <EmptyState
                title="Nothing is saved for today"
                hint={addForToday}
              />
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>Slot</Th>
                    <Th>Theme</Th>
                    <Th>Question</Th>
                    <Th align="right">Correct so far</Th>
                  </tr>
                </thead>
                <tbody>
                  {todaysQuestions.map((q) => (
                    <tr key={q.id}>
                      <Td className="font-semibold text-ink">
                        {slotLabel(q.slot, q.isBonus)}
                      </Td>
                      <Td>
                        <ThemeChip label={q.theme.label} />
                      </Td>
                      <Td>
                        <Link
                          href={`/questions/${q.id}`}
                          className="hover:text-ink"
                        >
                          {truncate(q.prompt, 52)}
                        </Link>
                      </Td>
                      <Td align="right" className="tabular-nums">
                        {q.answered > 0 ? `${q.correctPct}%` : "—"}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>

          <div className="space-y-6">
            <Card>
              <CardTitle>Needs attention</CardTitle>
              {needsAttention.length === 0 ? (
                <p className="text-[13px] text-muted">
                  Every day in the next two weeks is live. Nothing to do.
                </p>
              ) : (
                <ul className="space-y-4">
                  {needsAttention.slice(0, 5).map((day) => (
                    <li key={day.date}>
                      <p
                        className={`text-[13.5px] font-semibold ${ATTENTION[day.state].className}`}
                      >
                        {shortDate(day.date)} {ATTENTION[day.state].label}
                      </p>
                      <p className="mt-0.5 text-[12.5px] text-muted">
                        {day.state === "empty"
                          ? "All three slots empty. Members will see nothing that day."
                          : day.state === "in_progress"
                            ? `${day.filled} of 3 saved. Still to add: ${slotList(day.missingSlots)}.`
                            : "All three saved. Publish it so members see it on the day."}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
              <Link
                href="/schedule"
                className="mt-5 inline-flex rounded-md border border-line px-4 py-2 text-[13px] font-semibold text-ink hover:bg-page"
              >
                Go to schedule
              </Link>
            </Card>

            <Card>
              <CardTitle>Scheduled ahead</CardTitle>
              <ul className="space-y-2.5 text-[13px]">
                {scheduledAhead.map((day) => (
                  <li key={day.date} className="flex gap-4">
                    <span className="w-14 shrink-0 text-muted">
                      {shortDate(day.date)}
                    </span>
                    <span
                      className={
                        day.state === "live" ? "text-ink-soft" : "text-warn-ink"
                      }
                    >
                      {day.questionCount === 0
                        ? "nothing scheduled"
                        : `${day.questionCount} question${day.questionCount === 1 ? "" : "s"}${day.hasBonus ? " + bonus" : ""} · ${day.state === "live" ? "live" : "not live"}`}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
