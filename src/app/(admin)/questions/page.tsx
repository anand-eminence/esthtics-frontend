import Link from "next/link";
import { ApiErrorState } from "@/components/api-error";
import { PageHeader } from "@/components/page-header";
import { QuestionFilters } from "./filters";
import {
  Badge,
  Card,
  EmptyState,
  Notice,
  StatusBadge,
  Table,
  Td,
  Th,
  ThemeChip,
} from "@/components/ui";
import { apiGet, queryString } from "@/lib/api";
import { shortDate, slotLabel, truncate } from "@/lib/format";
import type { QuestionRow, Theme } from "@/lib/types";

type Search = { [key: string]: string | string[] | undefined };

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/** Set by the question form after a successful save. */
const SAVED: Record<string, string> = {
  added: "Question added.",
  updated: "Changes saved.",
  published: "Saved, and the day is now live.",
};

// A3 · Question bank. Replaces the Question Bank sheet — same content,
// filterable. Whether members see a question is decided by its day rather than
// the question itself, so the Day column shows whether that day is live.
export default async function QuestionsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const filters = {
    search: one(params.search) ?? "",
    date: one(params.date) ?? "",
    themeId: one(params.themeId) ?? "",
    day: one(params.day) ?? "",
    slot: one(params.slot) ?? "",
    page: Number(one(params.page)) || 1,
  };

  const [list, themeList] = await Promise.all([
    apiGet<{
      questions: QuestionRow[];
      page: number;
      totalPages: number;
      total: number;
    }>(`/api/admin/questions${queryString(filters)}`),
    apiGet<{ themes: Theme[] }>("/api/admin/themes"),
  ]);

  const addButton = (
    <Link
      href="/questions/new"
      className="rounded-md bg-brand-600 px-4 py-2 text-[13px] font-semibold text-white hover:bg-brand-700"
    >
      Add question
    </Link>
  );

  if (!list.ok) {
    return (
      <>
        <PageHeader title="Question bank" action={addButton} />
        <div className="p-8">
          <ApiErrorState error={list.error} status={list.status} />
        </div>
      </>
    );
  }

  const { questions, page, totalPages, total } = list.data;

  // Filtering and paging build their own query without `saved`, so the
  // confirmation goes away on the next change.
  const saved = SAVED[one(params.saved) ?? ""] ?? null;

  return (
    <>
      <PageHeader
        title="Question bank"
        meta={total > 0 ? `${total} question${total === 1 ? "" : "s"}` : undefined}
        action={addButton}
      />

      <div className="space-y-5 p-8">
        {saved ? <Notice>{saved}</Notice> : null}

        <QuestionFilters themes={themeList.ok ? themeList.data.themes : []} current={filters} />

        <Card padded={false} className="px-5 pt-4 pb-1">
          {questions.length === 0 ? (
            <div className="pb-5">
              <EmptyState
                title="No questions match this view"
                hint="Clear the filters, or add the first question for a date."
              />
            </div>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Date</Th>
                  <Th>Slot</Th>
                  <Th>Theme</Th>
                  <Th>Question</Th>
                  <Th>Day</Th>
                  <Th>Deep dive</Th>
                  <Th align="right"> </Th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => (
                  <tr key={q.id}>
                    <Td className="font-semibold text-ink">{shortDate(q.quizDate)}</Td>
                    <Td>
                      {q.isBonus ? (
                        <StatusBadge status="BONUS" />
                      ) : (
                        <span className="text-ink-soft">{slotLabel(q.slot, false)}</span>
                      )}
                    </Td>
                    <Td>
                      <ThemeChip label={q.theme.label} />
                    </Td>
                    <Td className="text-ink">{truncate(q.prompt, 64)}</Td>
                    <Td>
                      {q.dayLive ? (
                        <Badge tone="ok">Live</Badge>
                      ) : (
                        <Badge tone="neutral">Not live</Badge>
                      )}
                    </Td>
                    <Td>{q.hasDeepDive ? "Yes" : "No"}</Td>
                    <Td align="right">
                      <Link href={`/questions/${q.id}`} className="text-muted hover:text-brand-600">
                        Edit
                      </Link>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>

        {totalPages > 1 ? (
          <div className="flex items-center justify-between text-[13px] text-muted">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              {page > 1 ? (
                <Link
                  href={`/questions${queryString({ ...filters, page: page - 1 })}`}
                  className="rounded-md border border-line bg-surface px-3 py-1.5 font-semibold text-ink hover:bg-page"
                >
                  Previous
                </Link>
              ) : null}
              {page < totalPages ? (
                <Link
                  href={`/questions${queryString({ ...filters, page: page + 1 })}`}
                  className="rounded-md border border-line bg-surface px-3 py-1.5 font-semibold text-ink hover:bg-page"
                >
                  Next
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}

        <Notice>
          Members see a day only once its three questions are saved and the day is published.
          Publish with the last question you add, or from the Schedule.
        </Notice>
      </div>
    </>
  );
}
