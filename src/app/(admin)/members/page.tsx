import Link from "next/link";
import { ApiErrorState } from "@/components/api-error";
import { PageHeader } from "@/components/page-header";
import { Pagination } from "@/components/pagination";
import { Card, EmptyState, Table, Td, Th } from "@/components/ui";
import { apiGet, queryString } from "@/lib/api";
import { relativeDay } from "@/lib/format";
import type { MemberRow } from "@/lib/types";
import { MemberFilters } from "./filters";

const PER_PAGE = 20;

type Response = {
  members: MemberRow[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  summary: { totalMembers: number; playedToday: number };
};

// A7 · Members. Everyone who has ever played, sortable by streak, activity or
// accuracy. Search, sorting and paging all happen in the API — this screen only
// ever holds one page of rows.
export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    sort?: string;
    activity?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const filters = {
    search: params.search ?? "",
    sort: params.sort ?? "currentStreak",
    activity: params.activity ?? "all",
  };
  const page = Number(params.page) || 1;

  // Handed to each member's screen, so its Back link returns to this exact view.
  const listQuery = queryString({
    search: params.search,
    sort: params.sort,
    activity: params.activity,
    page: params.page,
  }).slice(1);
  const from = listQuery ? `?from=${encodeURIComponent(listQuery)}` : "";

  const result = await apiGet<Response>(
    `/api/admin/members${queryString({ ...filters, page, perPage: PER_PAGE })}`,
  );

  if (!result.ok) {
    return (
      <>
        <PageHeader title="Members" />
        <div className="p-8">
          <ApiErrorState error={result.error} status={result.status} />
        </div>
      </>
    );
  }

  const {
    members,
    summary,
    total,
    totalPages,
    perPage,
    page: currentPage,
  } = result.data;
  const today = new Date().toISOString().slice(0, 10);
  const searching = Boolean(filters.search) || filters.activity !== "all";

  const pagerParams = {
    search: filters.search,
    sort: filters.sort === "currentStreak" ? "" : filters.sort,
    activity: filters.activity === "all" ? "" : filters.activity,
  };

  return (
    <>
      <PageHeader
        title="Members"
        meta={`${summary.totalMembers} members · ${summary.playedToday} played today`}
      />

      <div className="space-y-5 p-8">
        <MemberFilters current={filters} />

        <Card padded={false} className="px-5 pt-4 pb-1">
          {members.length === 0 ? (
            <div className="pb-5">
              {searching ? (
                <EmptyState
                  title="No members match those filters"
                  hint="Try a different name or email, or widen the activity window."
                />
              ) : (
                <EmptyState
                  title="No members yet"
                  hint="Members appear here the first time they play the quiz inside Circle."
                />
              )}
            </div>
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Member</Th>
                  <Th>Email</Th>
                  <Th align="right">Current streak</Th>
                  <Th align="right">Longest</Th>
                  <Th align="right">Days played</Th>
                  <Th align="right">Accuracy</Th>
                  <Th>Last played</Th>
                  <Th align="right"> </Th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id}>
                    <Td className="font-semibold text-ink">{m.name || "—"}</Td>
                    <Td>{m.email || "—"}</Td>
                    <Td
                      align="right"
                      className="font-semibold tabular-nums text-ink"
                    >
                      {m.currentStreak}
                    </Td>
                    <Td align="right" className="tabular-nums">
                      {m.longestStreak}
                    </Td>
                    <Td align="right" className="tabular-nums">
                      {m.daysPlayed}
                    </Td>
                    <Td align="right" className="tabular-nums">
                      {m.accuracy}%
                    </Td>
                    <Td className="whitespace-nowrap">
                      {relativeDay(m.lastPlayedDate, today)}
                    </Td>
                    <Td align="right">
                      <Link
                        href={`/members/${m.id}${from}`}
                        className="text-muted hover:text-brand-600"
                      >
                        View
                      </Link>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>

        <Pagination
          basePath="/members"
          params={pagerParams}
          page={currentPage}
          totalPages={totalPages}
          total={total}
          perPage={perPage}
          unit="member"
        />
      </div>
    </>
  );
}
