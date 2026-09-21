import { notFound } from "next/navigation";
import { ApiErrorState } from "@/components/api-error";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardTitle,
  EmptyState,
  Meter,
  StatCard,
  Table,
  Td,
  Th,
} from "@/components/ui";
import { apiGet } from "@/lib/api";
import { longDate, shortDate, slotLabel } from "@/lib/format";
import type { MemberDetail } from "@/lib/types";

function backToList(from: string | string[] | undefined) {
  const given = new URLSearchParams(Array.isArray(from) ? from[0] : from);
  const kept = new URLSearchParams();
  for (const key of ["search", "sort", "activity", "page"]) {
    const value = given.get(key);
    if (value) kept.set(key, value);
  }
  const query = kept.toString();
  return { href: `/members${query ? `?${query}` : ""}`, label: "Members" };
}

// A8 · Member detail. One member's full record.
export default async function MemberDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string | string[] }>;
}) {
  const [{ id }, { from }] = await Promise.all([params, searchParams]);
  const back = backToList(from);
  const result = await apiGet<MemberDetail>(`/api/admin/members/${id}`);

  if (!result.ok) {
    if (result.status === 404) notFound();
    return (
      <>
        <PageHeader title="Member" back={back} />
        <div className="p-8">
          <ApiErrorState error={result.error} status={result.status} />
        </div>
      </>
    );
  }

  const { member, communityAccuracy, recentAnswers, byTheme } = result.data;

  return (
    <>
      <PageHeader
        title={member.name || member.circleUid}
        meta={member.email}
        back={back}
      />

      <div className="space-y-6 p-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            accent
            label="Current streak"
            value={member.currentStreak}
            hint="days in a row"
          />
          <StatCard
            label="Longest streak"
            value={member.longestStreak}
            hint={
              member.longestStreakEnd
                ? `ended ${longDate(member.longestStreakEnd)}`
                : "—"
            }
          />
          <StatCard
            label="Days played"
            value={member.daysPlayed}
            hint={
              member.firstPlayedDate
                ? `since ${longDate(member.firstPlayedDate)}`
                : "—"
            }
          />
          <StatCard
            label="Accuracy"
            value={`${member.accuracy}%`}
            hint={`community avg ${communityAccuracy}%`}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Card>
            <CardTitle>Recent answers</CardTitle>
            {recentAnswers.length === 0 ? (
              <EmptyState title="This member has not answered anything yet" />
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>Date</Th>
                    <Th>Slot</Th>
                    <Th>Theme</Th>
                    <Th>Result</Th>
                    <Th align="right">Streak at play</Th>
                  </tr>
                </thead>
                <tbody>
                  {recentAnswers.map((a) => (
                    <tr key={a.id}>
                      <Td className="font-semibold text-ink">
                        {shortDate(a.quizDate)}
                      </Td>
                      <Td>{slotLabel(a.slot, a.isBonus)}</Td>
                      <Td>{a.themeLabel}</Td>
                      <Td
                        className={a.correct ? "text-ok-ink" : "text-bad-ink"}
                      >
                        {a.correct ? "Correct" : "Wrong"}
                      </Td>
                      <Td align="right" className="tabular-nums">
                        {a.streakAtPlay}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>

          <Card>
            <CardTitle>By theme</CardTitle>
            {byTheme.length === 0 ? (
              <p className="text-[13px] text-muted">Nothing answered yet.</p>
            ) : (
              <div className="space-y-4">
                {byTheme.map((t) => (
                  <Meter
                    key={t.key}
                    label={t.label}
                    pct={t.pct}
                    value={`${t.pct}%`}
                  />
                ))}
              </div>
            )}
            <p className="mt-5 text-[12.5px] text-muted">
              Bonus questions are excluded from these figures.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}
