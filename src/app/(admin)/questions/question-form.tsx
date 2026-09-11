"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm, type UseFormSetError } from "react-hook-form";
import { Button, Field, Input, Select, Textarea } from "@/components/form";
import { Notice, cn } from "@/components/ui";
import { apiSend, toApiError, type ApiError } from "@/lib/client";
import type { QuestionDetail, Theme } from "@/lib/types";

const LETTERS = ["A", "B", "C", "D", "E", "F"];
const MAX_OPTIONS = 6;

/** react-hook-form's field arrays hold objects, so each option is wrapped. */
type FormValues = {
  quizDate: string;
  slot: number;
  isBonus: boolean;
  themeId: string;
  status: string;
  prompt: string;
  options: { text: string }[];
  correctIndex: number;
  displayTag: string;
  whyThisMatters: string;
  chairLabel: string;
  chairText: string;
  deepDiveText: string;
  sourceLabel: string;
  sourceUrl: string;
  goDeeperUrl: string;
  internalNotes: string;
};

function toFormValues(
  question: QuestionDetail | null,
  themes: Theme[],
  defaultDate?: string,
): FormValues {
  if (question) {
    return {
      quizDate: question.quizDate,
      slot: question.slot,
      isBonus: question.isBonus,
      themeId: question.themeId,
      status: question.status,
      prompt: question.prompt,
      options: question.options.map((text) => ({ text })),
      correctIndex: question.correctIndex,
      displayTag: question.displayTag,
      whyThisMatters: question.whyThisMatters,
      chairLabel: question.chairLabel,
      chairText: question.chairText,
      deepDiveText: question.deepDiveText,
      sourceLabel: question.sourceLabel,
      sourceUrl: question.sourceUrl,
      goDeeperUrl: question.goDeeperUrl,
      internalNotes: question.internalNotes,
    };
  }
  return {
    quizDate: defaultDate ?? "",
    slot: 1,
    isBonus: false,
    themeId: themes[0]?.id ?? "",
    status: "DRAFT",
    prompt: "",
    options: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
    correctIndex: 0,
    displayTag: "",
    whyThisMatters: "",
    chairLabel: "",
    chairText: "",
    deepDiveText: "",
    sourceLabel: "",
    sourceUrl: "",
    goDeeperUrl: "",
    internalNotes: "",
  };
}

/** Field-level messages from the API land on the matching input. */
function applyServerErrors(error: ApiError, setError: UseFormSetError<FormValues>) {
  for (const [name, message] of Object.entries(error.fieldErrors ?? {})) {
    setError(name as keyof FormValues, { type: "server", message });
  }
}

// A4 · Add or edit question. Every field from the Question Bank sheet on one
// form. The correct answer is stored server side and never sent to a member.
export function QuestionForm({
  question,
  themes,
  defaultDate,
}: {
  question: QuestionDetail | null;
  themes: Theme[];
  defaultDate?: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ defaultValues: toFormValues(question, themes, defaultDate) });

  const { fields, append, remove } = useFieldArray({ control, name: "options" });

  const isBonus = watch("isBonus");
  const correctIndex = watch("correctIndex");

  function removeOption(index: number) {
    if (fields.length <= 2) return;
    remove(index);
    // Keep the marked answer pointing at the same option after the shift.
    if (correctIndex === index) setValue("correctIndex", 0);
    else if (correctIndex > index) setValue("correctIndex", correctIndex - 1);
  }

  /** Bonus lives in slot 4; the daily three are slots 1–3. */
  function setBonus(checked: boolean) {
    setValue("isBonus", checked);
    setValue("slot", checked ? 4 : 1);
  }

  async function onSubmit(values: FormValues) {
    setMessage(null);
    setFailed(false);

    const payload = { ...values, options: values.options.map((o) => o.text.trim()) };

    try {
      if (question) {
        await apiSend(`/api/admin/questions/${question.id}`, "PATCH", payload);
        setMessage("Saved.");
        router.refresh();
      } else {
        const created = await apiSend<{ question: QuestionDetail }>(
          "/api/admin/questions",
          "POST",
          payload,
        );
        router.replace(`/questions/${created.question.id}`);
        router.refresh();
      }
    } catch (err) {
      const apiError = toApiError(err);
      applyServerErrors(apiError, setError);
      setFailed(true);
      setMessage(apiError.message);
    }
  }

  async function onDelete() {
    if (!question) return;
    if (
      !confirm("Delete this question? If members have already answered it, it is archived instead.")
    ) {
      return;
    }
    try {
      await apiSend(`/api/admin/questions/${question.id}`, "DELETE");
      router.push("/questions");
      router.refresh();
    } catch (err) {
      setFailed(true);
      setMessage(toApiError(err).message);
    }
  }

  const optionError =
    errors.correctIndex?.message ||
    errors.options?.message ||
    errors.options?.root?.message ||
    (Array.isArray(errors.options)
      ? errors.options.find((o) => o?.text?.message)?.text?.message
      : undefined);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface px-8 py-4">
        <h1 className="text-[17px] font-semibold text-ink">
          {question ? "Edit question" : "Add question"}
        </h1>
        <div className="flex items-center gap-2">
          {question ? (
            <Button type="button" variant="ghost" onClick={onDelete} disabled={isSubmitting}>
              Delete
            </Button>
          ) : null}
          <Button type="button" variant="secondary" onClick={() => router.push("/questions")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Save"}
          </Button>
        </div>
      </header>

      <div className="space-y-5 p-8">
        {message ? <Notice tone={failed ? "error" : "info"}>{message}</Notice> : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          {/* -------- main column -------- */}
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Date" htmlFor="quizDate" error={errors.quizDate?.message}>
                <Input
                  id="quizDate"
                  type="date"
                  invalid={Boolean(errors.quizDate)}
                  {...register("quizDate", { required: "Pick a date" })}
                />
              </Field>

              <Field
                label="Slot"
                htmlFor="slot"
                error={errors.slot?.message}
                hint={isBonus ? "Bonus questions always use slot 4" : undefined}
              >
                <Select
                  id="slot"
                  disabled={isBonus}
                  invalid={Boolean(errors.slot)}
                  {...register("slot", { valueAsNumber: true })}
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  {isBonus ? <option value={4}>4 · Bonus</option> : null}
                </Select>
              </Field>

              <Field label="Theme" htmlFor="themeId" error={errors.themeId?.message}>
                <Select
                  id="themeId"
                  invalid={Boolean(errors.themeId)}
                  {...register("themeId", { required: "Pick a theme" })}
                >
                  {themes.length === 0 ? <option value="">No themes seeded</option> : null}
                  {themes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field label="Question" htmlFor="prompt" error={errors.prompt?.message}>
              <Textarea
                id="prompt"
                rows={3}
                invalid={Boolean(errors.prompt)}
                {...register("prompt", { required: "Write the question" })}
              />
            </Field>

            <fieldset>
              <legend className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.07em] text-muted">
                Options · select the correct one
              </legend>
              <div className="space-y-2">
                {fields.map((field, index) => {
                  const selected = correctIndex === index;
                  return (
                    <div key={field.id} className="flex items-center gap-3">
                      <button
                        type="button"
                        aria-label={`Mark option ${LETTERS[index]} as correct`}
                        aria-pressed={selected}
                        onClick={() => setValue("correctIndex", index)}
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[12px] font-semibold transition-colors",
                          selected
                            ? "border-brand-600 bg-brand-600 text-white"
                            : "border-line text-muted hover:border-brand-500",
                        )}
                      >
                        {LETTERS[index]}
                      </button>
                      <Input
                        placeholder={`Option ${LETTERS[index]}`}
                        className={selected ? "border-brand-500" : undefined}
                        invalid={Boolean(errors.options?.[index]?.text)}
                        {...register(`options.${index}.text` as const, {
                          required: "Options cannot be blank",
                        })}
                      />
                      {fields.length > 2 ? (
                        <button
                          type="button"
                          onClick={() => removeOption(index)}
                          aria-label={`Remove option ${LETTERS[index]}`}
                          className="px-1 text-[18px] leading-none text-muted hover:text-bad-ink"
                        >
                          ×
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              {optionError ? <p className="mt-1.5 text-[12px] text-bad-ink">{optionError}</p> : null}

              {fields.length < MAX_OPTIONS ? (
                <button
                  type="button"
                  onClick={() => append({ text: "" })}
                  className="mt-2 text-[13px] font-semibold text-brand-600 hover:underline"
                >
                  Add an option
                </button>
              ) : null}
            </fieldset>

            <Field
              label="Why this matters"
              htmlFor="whyThisMatters"
              error={errors.whyThisMatters?.message}
              hint="Shown to the member straight after she answers."
            >
              <Textarea id="whyThisMatters" rows={3} {...register("whyThisMatters")} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
              <Field label="Chair label" htmlFor="chairLabel" error={errors.chairLabel?.message}>
                <Input
                  id="chairLabel"
                  placeholder="Say this to a client"
                  {...register("chairLabel")}
                />
              </Field>
              <Field label="Chair text" htmlFor="chairText" error={errors.chairText?.message}>
                <Input id="chairText" {...register("chairText")} />
              </Field>
            </div>
          </div>

          {/* -------- side column -------- */}
          <div className="space-y-5">
            <Field label="Status" htmlFor="status" error={errors.status?.message}>
              <Select id="status" {...register("status")}>
                <option value="DRAFT">Draft</option>
                <option value="READY">Ready</option>
                <option value="PUBLISHED">Published</option>
                <option value="ARCHIVED">Archived</option>
              </Select>
            </Field>

            <label className="flex items-center gap-2.5 text-[13.5px] text-ink-soft">
              <input
                type="checkbox"
                checked={isBonus}
                onChange={(e) => setBonus(e.target.checked)}
                className="h-4 w-4 accent-brand-600"
              />
              This is the bonus question
            </label>

            <Field
              label="Display tag"
              htmlFor="displayTag"
              error={errors.displayTag?.message}
              hint="Optional. The small label above the question."
            >
              <Input id="displayTag" placeholder="Optional" {...register("displayTag")} />
            </Field>

            <Field
              label="Deep dive text"
              htmlFor="deepDiveText"
              error={errors.deepDiveText?.message}
            >
              <Textarea
                id="deepDiveText"
                rows={4}
                placeholder="Optional. Leave blank if not needed."
                {...register("deepDiveText")}
              />
            </Field>

            <Field label="Source label" htmlFor="sourceLabel" error={errors.sourceLabel?.message}>
              <Input id="sourceLabel" placeholder="Optional" {...register("sourceLabel")} />
            </Field>

            <Field label="Source URL" htmlFor="sourceUrl" error={errors.sourceUrl?.message}>
              <Input
                id="sourceUrl"
                placeholder="Optional"
                invalid={Boolean(errors.sourceUrl)}
                {...register("sourceUrl")}
              />
            </Field>

            <Field label="Go deeper URL" htmlFor="goDeeperUrl" error={errors.goDeeperUrl?.message}>
              <Input
                id="goDeeperUrl"
                placeholder="Falls back to the default link"
                invalid={Boolean(errors.goDeeperUrl)}
                {...register("goDeeperUrl")}
              />
            </Field>

            <Field
              label="Internal notes"
              htmlFor="internalNotes"
              error={errors.internalNotes?.message}
            >
              <Textarea
                id="internalNotes"
                rows={3}
                placeholder="Not shown to members"
                {...register("internalNotes")}
              />
            </Field>
          </div>
        </div>

        <Notice>
          Blank deep dive and go deeper fields are a valid state, not an error. The quiz simply
          hides those elements for that question.
        </Notice>
      </div>
    </form>
  );
}
