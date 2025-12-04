"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { formatRelativeTime } from "@/lib/process-helpers";
import type { QuizQuestion, UserAnswer } from "@/lib/types";

export default function DesignFlowPage() {
  const params = useParams<{ id: string }>();
  const processId = Number(params.id);
  const router = useRouter();
  const queryClient = useQueryClient();

  const processQuery = useQuery({
    queryKey: ["process", processId],
    queryFn: () => api.getProcess(processId),
  });

  const questionsQuery = useQuery({
    queryKey: ["questions"],
    queryFn: api.getQuestions,
  });

  const answersQuery = useQuery({
    queryKey: ["answers", processId],
    queryFn: () => api.getAnswers(processId),
  });

  const questions = useMemo(
    () => questionsQuery.data ?? [],
    [questionsQuery.data],
  );
  const answers = useMemo(() => answersQuery.data ?? [], [answersQuery.data]);

  const currentQuestion = useMemo(() => {
    if (!questions.length) return undefined;
    const answeredIds = new Set(answers.map((a) => a.questionId));
    return questions.find((q) => !answeredIds.has(q.id)) ?? questions.at(-1);
  }, [answers, questions]);

  const currentIndex = useMemo(() => {
    if (!currentQuestion) return 0;
    return Math.max(
      0,
      questions.findIndex((q) => q.id === currentQuestion.id),
    );
  }, [currentQuestion, questions]);

  const submitAnswer = useMutation({
    mutationFn: (payload: { questionId: number; answerJson: unknown }) =>
      api.submitAnswer(processId, payload.questionId, payload.answerJson),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["answers", processId] });
      queryClient.invalidateQueries({ queryKey: ["process", processId] });
    },
  });

  useEffect(() => {
    if (
      questions.length > 0 &&
      answers.length === questions.length &&
      processQuery.data
    ) {
      router.replace(`/projects?process=${processId}`);
    }
  }, [answers.length, questions.length, router, processId, processQuery.data]);

  const isLoading =
    questionsQuery.isLoading || answersQuery.isLoading || processQuery.isLoading;

  return (
    <div className="mx-auto max-w-4xl space-y-6 rounded-3xl border border-black/10 bg-white/80 p-6 shadow-luxe">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-ash">
            Project setup
          </p>
          <h1 className="serif-heading text-3xl text-ink">
            {processQuery.data?.title ?? "Design flow"}
          </h1>
          {processQuery.data && (
            <p className="text-sm text-ash">
              Updated {formatRelativeTime(processQuery.data.updatedAt)}
            </p>
          )}
        </div>
        <Link
          href={`/projects?process=${processId}`}
          className="rounded-full border border-ink/10 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:-translate-y-[1px] hover:shadow-md"
        >
          Back to projects
        </Link>
      </div>

      <div className="rounded-2xl border border-black/5 bg-parchment/70 p-4">
        <p className="text-sm font-semibold text-ink">
          Answer our questions and we will visualize the jewelry that best suits your needs.
        </p>
        <p className="text-sm text-ash">
          Question {Math.min(answers.length + 1, Math.max(questions.length, 1))} of{" "}
          {questions.length || "—"}
        </p>
      </div>

      {isLoading && <StepSkeleton />}

      {!isLoading && currentQuestion && (
        <QuestionStep
          question={currentQuestion}
          step={currentIndex + 1}
          total={questions.length}
          existingAnswer={answers.find(
            (a) => a.questionId === currentQuestion.id,
          )}
          onSubmit={(answerJson) =>
            submitAnswer.mutate({
              questionId: currentQuestion.id,
              answerJson,
            })
          }
          isSubmitting={submitAnswer.isPending}
          isLast={currentIndex === questions.length - 1}
        />
      )}

      {!isLoading && !currentQuestion && (
        <div className="rounded-2xl border border-black/5 bg-white/70 px-5 py-6 text-sm text-ash">
          No design questions are available. Return to the dashboard.
        </div>
      )}
    </div>
  );
}

type QuestionMeta = {
  title: string;
  description?: string;
  options?: { label: string; value: string }[];
  badge?: string;
  type?: string;
};

function normalizeQuestionJson(question: QuizQuestion): Record<string, unknown> {
  const raw = question.questionJson;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return {};
    }
  }
  return (raw as Record<string, unknown>) ?? {};
}

function asString(v: unknown): string | undefined {
  return typeof v === "string" && v.trim().length ? v : undefined;
}

function pickString(obj: unknown, keys: string[]): string | undefined {
  if (!obj || typeof obj !== "object") return undefined;
  for (const key of keys) {
    const value = (obj as Record<string, unknown>)[key];
    const str = asString(value);
    if (str) return str;
  }
  return undefined;
}

function mapOption(opt: unknown): { label: string; value: string } | null {
  if (opt == null) return null;
  if (typeof opt === "string" || typeof opt === "number") {
    const str = String(opt);
    return { label: str, value: str };
  }
  if (typeof opt === "object") {
    const o = opt as Record<string, unknown>;
    const value =
      asString(o.value) ||
      asString(o.key) ||
      asString(o.code) ||
      asString(o.id) ||
      asString(o.slug) ||
      asString(o.label);
    if (!value) return null;
    const label =
      asString(o.label) ||
      asString(o.text) ||
      asString(o.title) ||
      asString(o.name) ||
      asString(o.display) ||
      asString(o.prompt) ||
      value;
    return { label, value };
  }
  return null;
}

function findOptions(node: unknown, depth = 0): { label: string; value: string }[] | undefined {
  if (depth > 4 || node == null) return undefined;
  if (Array.isArray(node)) {
    const mapped = node.map(mapOption).filter(Boolean) as { label: string; value: string }[];
    if (mapped.length) return mapped;
  } else if (typeof node === "object") {
    const entries = Object.values(node as Record<string, unknown>);
    for (const val of entries) {
      const found = findOptions(val, depth + 1);
      if (found?.length) return found;
    }
  }
  return undefined;
}

function getQuestionMeta(question: QuizQuestion): QuestionMeta {
  const raw = normalizeQuestionJson(question);
  const rawOptions = Array.isArray((raw as { options?: unknown }).options)
    ? (raw as { options: unknown[] }).options
    : undefined;
  const mappedOptions =
    rawOptions
      ?.map(mapOption)
      .filter(Boolean) as { label: string; value: string }[] | undefined;
  const options = mappedOptions && mappedOptions.length ? mappedOptions : findOptions(raw);

  return {
    title:
      pickString(raw, ["title", "prompt", "question", "text", "label"]) ||
      pickString(raw["question"], ["title", "prompt", "question", "text", "label"]) ||
      "Design preference",
    description:
      pickString(raw, ["subtitle", "description", "helperText", "help", "note"]) ||
      pickString(raw["question"], ["subtitle", "description", "helperText", "help", "note"]),
    options,
    badge:
      pickString(raw, ["badge", "codeLabel", "shortLabel"]) ||
      pickString(raw["question"], ["badge", "codeLabel", "shortLabel"]),
    type: pickString(raw, ["type"]),
  };
}

function QuestionStep({
  question,
  step,
  total,
  existingAnswer,
  isSubmitting,
  isLast,
  onSubmit,
}: {
  question: QuizQuestion;
  step: number;
  total: number;
  existingAnswer?: UserAnswer;
  isSubmitting: boolean;
  isLast: boolean;
  onSubmit: (answerJson: unknown) => void;
}) {
  const meta = getQuestionMeta(question);

  const initialValue = (() => {
    const raw = existingAnswer?.answerJson;
    if (typeof raw === "string") return raw;
    if (raw && typeof raw === "object") {
      const obj = raw as { value?: string; code?: string; key?: string };
      return obj.value || obj.code || obj.key || "";
    }
    return "";
  })();

  const [selectedValue, setSelectedValue] = useState<string>(initialValue);

  useEffect(() => {
    // if the question changes or existingAnswer changes, reset the state
    const raw = existingAnswer?.answerJson;
    if (typeof raw === "string") {
      setSelectedValue(raw);
    } else if (raw && typeof raw === "object") {
      const obj = raw as { value?: string; code?: string; key?: string };
      setSelectedValue(obj.value || obj.code || obj.key || "");
    } else {
      setSelectedValue("");
    }
  }, [question.id, existingAnswer?.answerJson]);

  const isEmpty = !selectedValue.trim().length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isEmpty) return;
    onSubmit(selectedValue.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border border-black/5 bg-white/80 p-6 shadow-inner shadow-black/5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-ash">
            Step {step} of {total}
          </p>
          <h2 className="serif-heading text-2xl text-ink">{meta.title}</h2>
          {meta.description && (
            <p className="text-sm text-ash">{meta.description}</p>
          )}
        </div>
        {meta.badge && (
          <span className="rounded-full border border-gold/40 bg-gold/15 px-3 py-1 text-xs font-semibold text-ink">
            {meta.badge}
          </span>
        )}
      </div>

      <div className="space-y-4">
        {meta.options && meta.options.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {meta.options.map((opt) => {
              const optValue = String(opt.value ?? opt.label ?? "");
              const active = selectedValue === optValue;
              return (
                <label
                  key={optValue}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 text-left transition",
                    active
                      ? "border-gold bg-gold/15 text-ink shadow-md"
                      : "border-black/10 bg-white hover:border-gold/60 hover:bg-gold/10",
                  )}
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={optValue}
                    checked={active}
                    onChange={() => setSelectedValue(optValue)}
                    className="sr-only"
                  />
                  <span className="text-sm font-semibold text-ink">
                    {opt.label}
                  </span>
                  <span
                    className={cn(
                      "inline-flex h-4 w-4 items-center justify-center rounded-full border",
                      active ? "border-gold bg-gold/60" : "border-black/20",
                    )}
                    aria-hidden="true"
                  >
                    {active && (
                      <span className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </span>
                </label>
              );
            })}
          </div>
        ) : (
          <div className="grid gap-2">
            <textarea
              value={selectedValue}
              onChange={(e) => setSelectedValue(e.target.value)}
              rows={4}
              placeholder="Share the preference in a sentence or two"
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink shadow-inner shadow-black/5 outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-end">
        <button
          type="submit"
          disabled={isSubmitting || isEmpty}
          aria-disabled={isSubmitting || isEmpty}
          className={cn(
            "rounded-full border border-ink/10 bg-ink px-5 py-2 text-sm font-semibold text-ivory shadow-md transition",
            "hover:-translate-y-[1px] hover:shadow-luxe",
            (isSubmitting || isEmpty) && "opacity-60",
          )}
        >
          {isSubmitting
            ? "Saving..."
            : isLast
            ? "Finish setup"
            : "Save and continue"}
        </button>
      </div>
    </form>
  );
}

function StepSkeleton() {
  return (
    <div className="space-y-3 rounded-3xl border border-black/5 bg-white/70 p-6">
      <div className="h-4 w-32 animate-pulse rounded-full bg-black/5" />
      <div className="h-6 w-3/4 animate-pulse rounded-full bg-black/5" />
      <div className="h-32 animate-pulse rounded-2xl bg-black/5" />
      <div className="flex items-center justify-end">
        <div className="h-10 w-32 animate-pulse rounded-full bg-black/5" />
      </div>
    </div>
  );
}
