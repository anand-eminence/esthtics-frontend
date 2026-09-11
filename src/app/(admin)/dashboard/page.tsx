import Link from "next/link";
import { ApiErrorState } from "@/components/api-error";
import { PageHeader } from "@/components/page-header";
import { Card, CardTitle, EmptyState, StatCard, StatusBadge, Table, Td, Th, ThemeChip } from "@/components/ui";
import { apiGet } from "@/lib/api";
import { fullDate, shortDate, slotLabel, truncate } from "@/lib/format";
import type { Dashboard } from "@/lib/types";

// A2 · Dashboard. Answers two questions immediately: is today set up, and is
// anything missing in the days ahead.
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

  const { date, timezone, stats, todaysQuestions, needsAttention, scheduledAhead } = result.data;

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
          <StatCard label="Aced today" value={stats.acedToday} hint="all three correct" />
          <StatCard label="Answers today" value={stats.answersToday} hint="including bonus" />
          <StatCard
            label="Longest streak"
            value={stats.longestStreak}
            hint={stats.longestStreakMember ?? "no members yet"}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Card>
            <CardTitle>Today&rsquo;s questions</CardTitle>
            {todaysQuestions.length === 0 ? (
              <EmptyState
                title="Nothing is scheduled for today"
                hint={
                  <>
                    Members will see an empty quiz.{" "}
                    <Link href="/questions/new" className="text-brand-600 underline">
                      Add a question
                    </Link>
                    .
                  </>
                }
              />
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>Slot</Th>
                    <Th>Theme</Th>
                    <Th>Question</Th>
                    <Th align="right">Correct so far</Th>
                    <Th align="right">Status</Th>
                  </tr>
                </thead>
                <tbody>
                  {todaysQuestions.map((q) => (
                    <tr key={q.id}>
                      <Td className="font-semibold text-ink">{slotLabel(q.slot, q.isBonus)}</Td>
                      <Td>
                        <ThemeChip label={q.theme.label} />
                      </Td>
                      <Td>
                        <Link href={`/questions/${q.id}`} className="hover:text-ink">
                          {truncate(q.prompt, 52)}
                        </Link>
                      </Td>
                      <Td align="right" className="tabular-nums">
                        {q.answered > 0 ? `${q.correctPct}%` : "—"}
                      </Td>
                      <Td align="right">
                        <StatusBadge status={q.isBonus ? "BONUS" : q.status} />
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
                  Every day in the next two weeks is filled. Nothing to do.
                </p>
              ) : (
                <ul className="space-y-4">
                  {needsAttention.slice(0, 5).map((day) => (
                    <li key={day.date}>
                      <p
                        className={
                          day.severity === "empty"
                            ? "text-[13.5px] font-semibold text-bad-ink"
                            : "text-[13.5px] font-semibold text-warn-ink"
                        }
                      >
                        {shortDate(day.date)}{" "}
                        {day.severity === "empty" ? "has no questions" : "is incomplete"}
                      </p>
                      <p className="mt-0.5 text-[12.5px] text-muted">
                        {day.severity === "empty"
                          ? `All ${day.required} slots empty. Members will see nothing that day.`
                          : `${day.filled} of ${day.required} filled${day.hasDraft ? ", and a slot is still draft" : ""}.`}
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
                    <span className="w-14 shrink-0 text-muted">{shortDate(day.date)}</span>
                    <span className={day.isComplete ? "text-ink-soft" : "text-warn-ink"}>
                      {day.questionCount === 0
                        ? "nothing scheduled"
                        : `${day.questionCount} question${day.questionCount === 1 ? "" : "s"}${day.hasBonus ? " + bonus" : ""}`}
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
