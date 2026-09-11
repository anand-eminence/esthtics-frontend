import { notFound } from "next/navigation";
import { ApiErrorState } from "@/components/api-error";
import { PageHeader } from "@/components/page-header";
import { QuestionForm } from "../question-form";
import { apiGet } from "@/lib/api";
import type { QuestionDetail, Theme } from "@/lib/types";

// A4 · Edit question.
export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [question, themes] = await Promise.all([
    apiGet<{ question: QuestionDetail }>(`/api/admin/questions/${id}`),
    apiGet<{ themes: Theme[] }>("/api/admin/themes"),
  ]);

  if (!question.ok) {
    if (question.status === 404) notFound();
    return (
      <>
        <PageHeader title="Edit question" />
        <div className="p-8">
          <ApiErrorState error={question.error} status={question.status} />
        </div>
      </>
    );
  }

  return (
    <QuestionForm
      question={question.data.question}
      themes={themes.ok ? themes.data.themes : []}
    />
  );
}
