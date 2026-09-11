"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { PageHeader } from "@/components/page-header";
import { Button, Field, Input, Select, Textarea } from "@/components/form";
import {
  Card,
  CardTitle,
  EmptyState,
  Notice,
  StatusBadge,
  Table,
  Td,
  Th,
} from "@/components/ui";
import { apiSend, toApiError } from "@/lib/client";
import { shortDate } from "@/lib/format";
import type { Featured } from "@/lib/types";

const BLANK = {
  quizDate: "",
  title: "",
  bodyText: "",
  buttonLabel: "",
  linkUrl: "",
  imageUrl: "",
  status: "DRAFT",
};

type FormValues = typeof BLANK;

export function FeaturedManager({ items }: { items: Featured[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ defaultValues: BLANK });

  function startNew() {
    setEditingId(null);
    reset(BLANK);
    setMessage(null);
  }

  function startEdit(item: Featured) {
    setEditingId(item.id);
    reset({
      quizDate: item.quizDate,
      title: item.title,
      bodyText: item.bodyText,
      buttonLabel: item.buttonLabel,
      linkUrl: item.linkUrl,
      imageUrl: item.imageUrl,
      status: item.status,
    });
    setMessage(null);
  }

  async function onSubmit(values: FormValues) {
    setMessage(null);

    try {
      if (editingId)
        await apiSend(`/api/admin/featured/${editingId}`, "PATCH", values);
      else await apiSend("/api/admin/featured", "POST", values);
      startNew();
      router.refresh();
    } catch (err) {
      const apiError = toApiError(err);
      for (const [name, msg] of Object.entries(apiError.fieldErrors ?? {})) {
        setError(name as keyof FormValues, { type: "server", message: msg });
      }
      setMessage(apiError.message);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this featured screen?")) return;
    try {
      await apiSend(`/api/admin/featured/${id}`, "DELETE");
      if (editingId === id) startNew();
      router.refresh();
    } catch (err) {
      setMessage(toApiError(err).message);
    }
  }

  return (
    <>
      <PageHeader
        title="Featured content"
        action={
          <Button type="button" onClick={startNew}>
            Add featured screen
          </Button>
        }
      />

      <div className="grid gap-6 p-8 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          <Card padded={false} className="px-5 pt-4 pb-1">
            {items.length === 0 ? (
              <div className="pb-5">
                <EmptyState
                  title="No featured screens yet"
                  hint="Add one for a date and it appears after the final question that day."
                />
              </div>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>Date</Th>
                    <Th>Title</Th>
                    <Th>Link</Th>
                    <Th>Shown after</Th> <Th>Status</Th>
                    <Th align="right"> </Th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <Td className="font-semibold text-ink">
                        {shortDate(item.quizDate)}
                      </Td>
                      <Td className="text-ink">{item.title}</Td>
                      <Td>{item.linkUrl || "—"}</Td>
                      <Td>Final question</Td>
                      <Td>
                        <StatusBadge status={item.status} />
                      </Td>
                      <Td align="right">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => startEdit(item)}
                            className="text-muted hover:text-brand-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDelete(item.id)}
                            disabled={isSubmitting}
                            className="text-muted hover:text-bad-ink"
                          >
                            Delete
                          </button>
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>

          <Notice>
            A featured screen is not a question. There is nothing to answer,
            nothing is recorded against the member, and skipping it changes
            nothing.
          </Notice>
        </div>

        <Card>
          <CardTitle>
            {editingId ? "Edit featured screen" : "Add featured screen"}
          </CardTitle>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <Field
              label="Date"
              htmlFor="f-date"
              error={errors.quizDate?.message}
            >
              <Input
                id="f-date"
                type="date"
                required
                invalid={Boolean(errors.quizDate)}
                {...register("quizDate", { required: "Pick a date" })}
              />
            </Field>

            <Field
              label="Title"
              htmlFor="f-title"
              error={errors.title?.message}
            >
              <Input
                id="f-title"
                required
                invalid={Boolean(errors.title)}
                {...register("title", { required: "Give it a title" })}
              />
            </Field>

            <Field
              label="Body text"
              htmlFor="f-body"
              error={errors.bodyText?.message}
            >
              <Textarea id="f-body" rows={3} {...register("bodyText")} />
            </Field>

            <Field
              label="Button label"
              htmlFor="f-button"
              error={errors.buttonLabel?.message}
            >
              <Input
                id="f-button"
                placeholder="View the course"
                {...register("buttonLabel")}
              />
            </Field>

            <Field
              label="Link"
              htmlFor="f-link"
              error={errors.linkUrl?.message}
            >
              <Input
                id="f-link"
                placeholder="/courses/advanced-peel"
                invalid={Boolean(errors.linkUrl)}
                {...register("linkUrl")}
              />
            </Field>

            <Field
              label="Image"
              htmlFor="f-image"
              error={errors.imageUrl?.message}
            >
              <Input
                id="f-image"
                placeholder="Optional"
                {...register("imageUrl")}
              />
            </Field>

            <Field
              label="Status"
              htmlFor="f-status"
              error={errors.status?.message}
            >
              <Select id="f-status" {...register("status")}>
                <option value="DRAFT">Draft</option>
                <option value="READY">Ready</option>
                <option value="LIV  E">Live</option>
              </Select>
            </Field>

            {message ? <Notice tone="error">{message}</Notice> : null}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5"
            >
              {isSubmitting ? "Saving…" : "Save"}
            </Button>
            {editingId ? (
              <Button
                type="button"
                variant="ghost"
                onClick={startNew}
                className="w-full"
              >
                Cancel edit
              </Button>
            ) : null}
          </form>
        </Card>
      </div>
    </>
  );
}
