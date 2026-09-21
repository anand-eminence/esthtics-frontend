"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFieldArray, useForm, type UseFormSetError } from "react-hook-form";
import { useConfirm } from "@/components/confirm";
import { DayBadge } from "@/components/day-badge";
import { Button, Field, Input, Select, Textarea } from "@/components/form";
import { Notice, cn } from "@/components/ui";
import { apiFetch, apiSend, toApiError, type ApiError } from "@/lib/client";
import { shortDate } from "@/lib/format";
import { validateOptionalLink } from "@/lib/links";
import type { DayInfo, QuestionDetail, Theme } from "@/lib/types";

const LETTERS = ["A", "B", "C", "D", "E", "F"];
const MAX_OPTIONS = 6;
const CORE_SLOTS = [1, 2, 3];

/** react-hook-form's field arrays hold objects, so each option is wrapped. */
type FormValues = {
  quizDate: string;
  slot: number;
  isBonus: boolean;
  themeId: string;
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
function applyServerErrors(
  error: ApiError,
  setError: UseFormSetError<FormValues>,
) {
  for (const [name, message] of Object.entries(error.fieldErrors ?? {})) {
    setError(name as keyof FormValues, { type: "server", message });
  }
}

/** "slot 2", "slots 2 and 3", "slots 1, 2 and 3" */
function slotsText(slots: number[]) {
  if (slots.length === 1) return `slot ${slots[0]}`;
  return `slots ${slots.slice(0, -1).join(", ")} and ${slots[slots.length - 1]}`;
}

export function QuestionForm({
  question,
  themes,
  defaultDate,
  initialDay,
}: {
  question: QuestionDetail | null;
  themes: Theme[];
  defaultDate?: string;
  initialDay?: DayInfo | null;
}) {
  const router = useRouter();
  const confirm = useConfirm();
  const [message, setMessage] = useState<string | null>(null);
  const [day, setDay] = useState<DayInfo | null>(initialDay ?? null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: toFormValues(question, themes, defaultDate),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  });

  const quizDate = watch("quizDate");
  const slot = watch("slot");
  const isBonus = watch("isBonus");
  const correctIndex = watch("correctIndex");

  useEffect(() => {
    if (!quizDate) {
      setDay(null);
      return;
    }
    if (day?.quizDate === quizDate) return;
    let cancelled = false;
    apiFetch<{ day: DayInfo }>(`/api/admin/days/${quizDate}`)
      .then((res) => !cancelled && setDay(res.day))
      .catch(() => !cancelled && setDay(null));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizDate]);

  const placementLocked = Boolean(question?.dayLive);
  const answersLocked = (question?.answerCount ?? 0) > 0;

  const dayKnown = day !== null && day.quizDate === quizDate;

  const otherCoreSlots = (dayKnown ? day.coreSlots : [])
    .filter((s) => s.questionId !== question?.id)
    .map((s) => s.slot);
  const slotsAfterSave = new Set(
    isBonus ? otherCoreSlots : [...otherCoreSlots, Number(slot)],
  );
  const stillMissing = CORE_SLOTS.filter((s) => !slotsAfterSave.has(s));
  const canPublish =
    dayKnown && !day.live && !day.isPast && stillMissing.length === 0;

  function removeOption(index: number) {
    if (fields.length <= 2) return;
    remove(index);
    if (correctIndex === index) setValue("correctIndex", 0);
    else if (correctIndex > index) setValue("correctIndex", correctIndex - 1);
  }

  function setBonus(checked: boolean) {
    setValue("isBonus", checked);
    setValue("slot", checked ? 4 : 1);
  }

  async function onSubmit(values: FormValues, publish: boolean) {
    setMessage(null);

    const bonusGoesLive =
      values.isBonus &&
      dayKnown &&
      day.live &&
      (!question || !question.isBonus || question.quizDate !== values.quizDate);
    if (
      bonusGoesLive &&
      !(await confirm({
        title: `${shortDate(values.quizDate)} is live`,
        message: "Saving shows this bonus question to members straight away.",
        confirmLabel: "Save",
        tone: "primary",
      }))
    ) {
      return;
    }

    const payload = {
      ...values,
      quizDate: values.quizDate || question?.quizDate || "",
      slot: values.isBonus ? 4 : Number(values.slot),
      options: values.options.map((o) => o.text.trim()),
      publishDay: publish,
    };

    try {
      if (question) {
        await apiSend(`/api/admin/questions/${question.id}`, "PATCH", payload);
      } else {
        await apiSend("/api/admin/questions", "POST", payload);
      }
      const saved = publish ? "published" : question ? "updated" : "added";
      router.replace(`/questions?saved=${saved}`);
      router.refresh();
    } catch (err) {
      const apiError = toApiError(err);
      applyServerErrors(apiError, setError);
      setMessage(apiError.message);
    }
  }

  async function onDelete() {
    if (!question) return;
    const ok = await confirm({
      title: "Delete this question?",
      message: "This can't be undone.",
      confirmLabel: "Delete",
    });
    if (!ok) return;
    try {
      await apiSend(`/api/admin/questions/${question.id}`, "DELETE");
      router.push("/questions");
      router.refresh();
    } catch (err) {
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

  const dayLabel = quizDate ? shortDate(quizDate) : "";
  let dayNotice: { tone: "info" | "warn"; text: string } | null = null;
  if (dayKnown) {
    if (day.live) {
      dayNotice = {
        tone: "info",
        text: `${dayLabel} is live. Changes you save are shown to members straight away.`,
      };
    } else if (day.isPast) {
      dayNotice = {
        tone: "warn",
        text: `${dayLabel} has passed without being published, so members never saw it.`,
      };
    } else if (canPublish) {
      dayNotice = {
        tone: "info",
        text: `Saving this completes ${dayLabel}. Use Save & publish day to make it live now, or publish it later from the Schedule.`,
      };
    } else {
      dayNotice = {
        tone: "warn",
        text: `${dayLabel} isn't live. After this save it still needs ${slotsText(stillMissing)} before it can be published.`,
      };
    }
  }

  return (
    <form
      onSubmit={handleSubmit((values) => onSubmit(values, false))}
      noValidate
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface px-8 py-4">
        <div className="flex items-center gap-3">
          <h1 className="text-[17px] font-semibold text-ink">
            {question ? "Edit question" : "Add question"}
          </h1>
          {dayKnown ? <DayBadge state={day.state} /> : null}
        </div>
        <div className="flex items-center gap-2">
          {question && !placementLocked && !answersLocked ? (
            <Button
              type="button"
              variant="ghost"
              onClick={onDelete}
              disabled={isSubmitting}
            >
              Delete
            </Button>
          ) : null}
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/questions")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant={canPublish ? "secondary" : "primary"}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving…" : "Save"}
          </Button>
          {canPublish ? (
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit((values) => onSubmit(values, true))}
            >
              {isSubmitting ? "Saving…" : "Save & publish day"}
            </Button>
          ) : null}
        </div>
      </header>

      <div className="space-y-5 p-8">
        {message ? <Notice tone="error">{message}</Notice> : null}
        {dayNotice ? (
          <Notice tone={dayNotice.tone}>{dayNotice.text}</Notice>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          {/* -------- main column -------- */}
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field
                label="Date"
                htmlFor="quizDate"
                error={errors.quizDate?.message}
                hint={
                  placementLocked ? "Locked while this day is live" : undefined
                }
              >
                <Input
                  id="quizDate"
                  type="date"
                  disabled={placementLocked}
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
                  disabled={isBonus || placementLocked}
                  invalid={Boolean(errors.slot)}
                  {...register("slot", { valueAsNumber: true })}
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  {isBonus ? <option value={4}>4 · Bonus</option> : null}
                </Select>
              </Field>

              <Field
                label="Theme"
                htmlFor="themeId"
                error={errors.themeId?.message}
              >
                <Select
                  id="themeId"
                  invalid={Boolean(errors.themeId)}
                  {...register("themeId", { required: "Pick a theme" })}
                >
                  {themes.length === 0 ? (
                    <option value="">No themes seeded</option>
                  ) : null}
                  {themes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field
              label="Question"
              htmlFor="prompt"
              error={errors.prompt?.message}
            >
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
              {answersLocked ? (
                <p className="mb-2 text-[12.5px] text-muted">
                  Members have already answered this question, so its options
                  and correct answer are locked.
                </p>
              ) : null}
              <div className="space-y-2">
                {fields.map((field, index) => {
                  const selected = correctIndex === index;
                  return (
                    <div key={field.id} className="flex items-center gap-3">
                      <button
                        type="button"
                        aria-label={`Mark option ${LETTERS[index]} as correct`}
                        aria-pressed={selected}
                        disabled={answersLocked}
                        onClick={() => setValue("correctIndex", index)}
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[12px] font-semibold transition-colors disabled:cursor-not-allowed",
                          selected
                            ? "border-brand-600 bg-brand-600 text-white"
                            : "border-line text-muted hover:border-brand-500",
                        )}
                      >
                        {LETTERS[index]}
                      </button>
                      <Input
                        placeholder={`Option ${LETTERS[index]}`}
                        readOnly={answersLocked}
                        className={selected ? "border-brand-500" : undefined}
                        invalid={Boolean(errors.options?.[index]?.text)}
                        {...register(`options.${index}.text` as const, {
                          required: "Options cannot be blank",
                        })}
                      />
                      {fields.length > 2 && !answersLocked ? (
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

              {optionError ? (
                <p className="mt-1.5 text-[12px] text-bad-ink">{optionError}</p>
              ) : null}

              {fields.length < MAX_OPTIONS && !answersLocked ? (
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
              <Textarea
                id="whyThisMatters"
                rows={3}
                {...register("whyThisMatters")}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
              <Field
                label="Chair label"
                htmlFor="chairLabel"
                error={errors.chairLabel?.message}
              >
                <Input
                  id="chairLabel"
                  placeholder="Say this to a client"
                  {...register("chairLabel")}
                />
              </Field>
              <Field
                label="Chair text"
                htmlFor="chairText"
                error={errors.chairText?.message}
              >
                <Input id="chairText" {...register("chairText")} />
              </Field>
            </div>
          </div>

          {/* -------- side column -------- */}
          <div className="space-y-5">
            <label
              className={cn(
                "flex items-center gap-2.5 text-[13.5px] text-ink-soft",
                placementLocked && "text-muted",
              )}
            >
              <input
                type="checkbox"
                checked={isBonus}
                disabled={placementLocked}
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
              <Input
                id="displayTag"
                placeholder="Optional"
                {...register("displayTag")}
              />
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

            <Field
              label="Source label"
              htmlFor="sourceLabel"
              error={errors.sourceLabel?.message}
            >
              <Input
                id="sourceLabel"
                placeholder="Optional"
                {...register("sourceLabel")}
              />
            </Field>

            <Field
              label="Source URL"
              htmlFor="sourceUrl"
              error={errors.sourceUrl?.message}
            >
              <Input
                id="sourceUrl"
                inputMode="url"
                placeholder="https://… (optional)"
                invalid={Boolean(errors.sourceUrl)}
                {...register("sourceUrl", { validate: validateOptionalLink })}
              />
            </Field>

            <Field
              label="Go deeper URL"
              htmlFor="goDeeperUrl"
              error={errors.goDeeperUrl?.message}
            >
              <Input
                id="goDeeperUrl"
                inputMode="url"
                placeholder="https://… (blank uses the default link)"
                invalid={Boolean(errors.goDeeperUrl)}
                {...register("goDeeperUrl", { validate: validateOptionalLink })}
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
          Blank deep dive and go deeper fields are a valid state, not an error.
          The quiz simply hides those elements for that question.
        </Notice>
      </div>
    </form>
  );
}
