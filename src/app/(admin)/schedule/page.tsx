import Link from "next/link";
import { ApiErrorState } from "@/components/api-error";
import { PageHeader } from "@/components/page-header";
import { Badge, Card, CardTitle, EmptyState, StatusBadge, Table, Td, Th, cn } from "@/components/ui";
import { apiGet } from "@/lib/api";
import { dayOfMonth, longDate, shortDate, weekdayShort } from "@/lib/format";
import type { ScheduleWeek } from "@/lib/types";

// A5 · Schedule. The gap finder — which upcoming days are complete and which
// are short, so nothing goes live half empty.
export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  const result = await apiGet<ScheduleWeek>(
    `/api/admin/schedule${week ? `?week=${week}` : ""}`,
  );

  if (!result.ok) {
    return (
      <>
        <PageHeader title="Schedule" />
        <div className="p-8">
          <ApiErrorState error={result.error} status={result.status} />
        </div>
      </>
    );
  }

  const data = result.data;

  return (
    <>
      <PageHeader
        title="Schedule"
        meta={`Week of ${longDate(data.weekStart)} · ${data.timezone}`}
      />

      <div className="space-y-6 p-8">
        <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-7">
          {data.week.map((day) => (
            <Card key={day.date} className="p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted">
                {weekdayShort(day.date)}
              </div>
              <div className="mb-3 text-2xl font-semibold text-ink">{dayOfMonth(day.date)}</div>

              <ul className="space-y-1.5">
                {day.slots.map((slot) => (
                  <li key={slot.slot}>
                    {slot.state === "filled" ? (
                      <Link
                        href={`/questions/${slot.questionId}`}
                        className="block rounded bg-page px-2 py-1.5 text-[12px] text-ink-soft hover:bg-brand-50"
                      >
                        {slot.slot} · {slot.themeLabel}
                      </Link>
                    ) : (
                      <Link
                        href={`/questions/new?date=${day.date}`}
                        className="block rounded bg-bad-bg/60 px-2 py-1.5 text-[12px] text-bad-ink hover:bg-bad-bg"
                      >
                        {slot.slot} · empty
                      </Link>
                    )}
                  </li>
                ))}
                {day.bonus ? (
                  <li>
                    <Link
                      href={`/questions/${day.bonus.questionId}`}
                      className="block rounded bg-warn-bg/70 px-2 py-1.5 text-[12px] text-warn-ink hover:bg-warn-bg"
                    >
                      Bonus
                    </Link>
                  </li>
                ) : null}
              </ul>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Card>
            <CardTitle
              action={
                <Link href="/featured" className="text-[13px] text-brand-600 hover:underline">
                  Manage
                </Link>
              }
            >
              Featured content this week
            </CardTitle>
            {data.featured.length === 0 ? (
              <EmptyState title="No featured screens this week" />
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>Date</Th>
                    <Th>Title</Th>
                    <Th>Links to</Th>
                    <Th align="right">Status</Th>
                  </tr>
                </thead>
                <tbody>
                  {data.featured.map((item) => (
                    <tr key={item.id}>
                      <Td className="font-semibold text-ink">{shortDate(item.quizDate)}</Td>
                      <Td className="text-ink">{item.title}</Td>
                      <Td>{item.linkUrl || "—"}</Td>
                      <Td align="right">
                        <StatusBadge status={item.status} />
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>

          <Card>
            <CardTitle>Legend</CardTitle>
            <ul className="space-y-3 text-[13px] text-muted">
              <li className="flex items-center gap-3">
                <Badge tone="neutral">Filled</Badge> question ready or published
              </li>
              <li className="flex items-center gap-3">
                <Badge tone="bad">Empty</Badge> nothing scheduled
              </li>
              <li className="flex items-center gap-3">
                <Badge tone="warn">Bonus</Badge> optional fourth question
              </li>
            </ul>
            <p className={cn("mt-4 text-[12.5px] text-muted")}>
              Click an empty slot to add a question for that date.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}
