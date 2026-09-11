import { ApiErrorState } from "@/components/api-error";
import { PageHeader } from "@/components/page-header";
import { QuestionForm } from "../question-form";
import { apiGet } from "@/lib/api";
import type { Theme } from "@/lib/types";

// A4 · Add question.
export default async function NewQuestionPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const [{ date }, themes] = await Promise.all([
    searchParams,
    apiGet<{ themes: Theme[] }>("/api/admin/themes"),
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

  return <QuestionForm question={null} themes={themes.data.themes} defaultDate={date} />;
}
