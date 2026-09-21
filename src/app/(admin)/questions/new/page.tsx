import { ApiErrorState } from "@/components/api-error";
import { PageHeader } from "@/components/page-header";
import { QuestionForm } from "../question-form";
import { apiGet, quizToday } from "@/lib/api";
import type { DayInfo, Theme } from "@/lib/types";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export default async function NewQuestionPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const quizDate = date && DATE.test(date) ? date : undefined;

  const [themes, day, today] = await Promise.all([
    apiGet<{ themes: Theme[] }>("/api/admin/themes"),
    quizDate
      ? apiGet<{ day: DayInfo }>(`/api/admin/days/${quizDate}`)
      : Promise.resolve(null),
    quizToday(),
  ]);

  if (!themes.ok) {
    return (
      <>
        <PageHeader title="Add question" />
        <div className="p-8">
          <ApiErrorState error={themes.error} status={themes.status} />
        </div>
      </>
    );
  }

  return (
    <QuestionForm
      question={null}
      themes={themes.data.themes}
      defaultDate={quizDate}
      initialDay={day?.ok ? day.data.day : null}
      today={today}
    />
  );
}
