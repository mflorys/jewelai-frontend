"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import {
  formatRelativeTime,
  formatTimestamp,
  shouldPollStatus,
  statusLabels,
} from "@/lib/process-helpers";
import { StatusBadge } from "@/components/process/StatusBadge";
import type {
  DesignProcess,
  DesignProcessDetails,
  DesignProcessStatus,
} from "@/lib/types";

const DELETABLE_STATUSES: DesignProcessStatus[] = [
  "INTAKE_IN_PROGRESS",
  "READY_FOR_GENERATION",
  "GENERATION_REQUESTED",
  "VISUAL_READY",
  "CLIENT_ACCEPTED",
];

export default function ProjectsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);

  const processesQuery = useQuery({
    queryKey: ["processes"],
    queryFn: api.getProcesses,
  });

  const detailQuery = useQuery({
    queryKey: ["process", selectedId],
    queryFn: () => api.getProcessDetails(selectedId!),
    enabled:
      !!selectedId &&
      !!processesQuery.data?.some((p) => p.id === selectedId),
    refetchInterval: (data) => (shouldPollStatus(data?.status) ? 3000 : false),
    retry: (failureCount, error: any) => {
      if (error?.status === 404) return false;
      return failureCount < 3;
    },
    onError: (error: any) => {
      if (selectedId) {
        setSelectedId(null);
        const params = new URLSearchParams(searchParams.toString());
        params.delete("process");
        router.replace(`/projects?${params.toString()}`);
        queryClient.invalidateQueries({ queryKey: ["processes"] });
      }
      console.error("Failed to load process detail", error);
    },
  });

  useEffect(() => {
    const fromParam = searchParams.get("process");
    if (fromParam) {
      setSelectedId(Number(fromParam));
    } else if (processesQuery.data?.length && !selectedId) {
      setSelectedId(processesQuery.data[0].id);
    }
  }, [processesQuery.data, searchParams, selectedId]);

  useEffect(() => {
    if (!processesQuery.data) return;
    if (selectedId == null) return;
    const stillExists = processesQuery.data.some((p) => p.id === selectedId);
    if (!stillExists) {
      setSelectedId(null);
      const params = new URLSearchParams(searchParams.toString());
      params.delete("process");
      router.replace(`/projects?${params.toString()}`);
    }
  }, [processesQuery.data, selectedId, router, searchParams]);

  const createProcess = useMutation({
    mutationFn: async (title?: string) => {
      const process = await api.createProcess();
      if (title?.trim()) {
        const updated = await api.updateTitle(process.id, title.trim());
        return updated;
      }
      return process;
    },
    onSuccess: (process) => {
      queryClient.invalidateQueries({ queryKey: ["processes"] });
      setSelectedId(process.id);
      setShowCreate(false);
      setNewTitle("");
      router.push(`/projects/${process.id}/design`);
    },
    onError: (err) => {
      console.error(err);
      setCreateError(
        (err as { message?: string })?.message ||
          "We could not start a new project.",
      );
    },
  });

  const selected = detailQuery.data;
  const answers = detailQuery.data?.answers ?? [];
  const answeredCount = answers.length;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(320px,380px)_1fr]">
      <section className="card-surface relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-parchment/60" />
        <div className="relative flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-ash">
              Projects
            </p>
            <h2 className="serif-heading text-3xl text-ink">
              Design portfolio
            </h2>
          </div>
          <button
            onClick={() => {
              setCreateError(null);
              setShowCreate(true);
            }}
            className={cn(
              "rounded-full border border-ink/10 bg-ink px-4 py-2 text-sm font-semibold text-ivory shadow-md transition",
              "hover:-translate-y-[1px] hover:shadow-luxe-strong",
            )}
          >
            Start a new project
          </button>
        </div>

        <div className="relative divide-y divide-black/5 border-t border-black/5">
          {processesQuery.isLoading && (
            <div className="p-4 text-sm text-ash">Loading projects…</div>
          )}
          {!processesQuery.isLoading &&
            (processesQuery.data?.length ?? 0) === 0 && (
              <div className="p-5 text-sm text-ash">
                No projects yet. Start a new project to begin a design journey.
              </div>
            )}
          {processesQuery.data?.map((process) => (
            <ProcessListItem
              key={process.id}
              process={process}
              active={selectedId === process.id}
              onSelect={() => {
                setSelectedId(process.id);
                const params = new URLSearchParams(searchParams.toString());
                params.set("process", String(process.id));
                router.replace(`/projects?${params.toString()}`);
              }}
            />
          ))}
        </div>
      </section>

      <section className="card-surface min-h-[420px]">
        {!selected && (
          <div className="flex h-full flex-col items-center justify-center space-y-2 text-center text-ash">
            <p className="text-sm">Select a project to see details.</p>
          </div>
        )}
        {selected && (
          <ProjectDetail
            process={selected}
            onTitleUpdated={(title) =>
              queryClient.setQueryData(
                ["process", selected.id],
                (prev?: DesignProcess) => (prev ? { ...prev, title } : prev),
              )
            }
            answersCount={answeredCount}
            onStartDesign={() => router.push(`/projects/${selected.id}/design`)}
            onGenerationStarted={() => {
              queryClient.invalidateQueries({ queryKey: ["process", selected.id] });
              queryClient.invalidateQueries({ queryKey: ["processes"] });
            }}
            onProcessUpdated={(updated) => {
              queryClient.setQueryData(["process", selected.id], updated);
              queryClient.invalidateQueries({ queryKey: ["processes"] });
            }}
            onDeleted={() => {
              setSelectedId(null);
              queryClient.removeQueries({ queryKey: ["process", selected.id] });
              queryClient.invalidateQueries({ queryKey: ["processes"] });
              router.replace("/projects");
              router.refresh();
            }}
          />
        )}
      </section>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 py-6 backdrop-blur">
          <div className="w-full max-w-lg rounded-3xl border border-black/10 bg-white/90 p-6 shadow-luxe">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-ash">
                  New project
                </p>
                <h3 className="serif-heading text-2xl text-ink">
                  Name your project
                </h3>
                <p className="text-sm text-ash">
                  We will start the design questions right after you save.
                </p>
              </div>
              <button
                onClick={() => setShowCreate(false)}
                className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-ink transition hover:-translate-y-[1px] hover:shadow"
              >
                Close
              </button>
            </div>

            <form
              className="mt-5 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setCreateError(null);
                createProcess.mutate(newTitle);
              }}
            >
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-ink">
                  Project name
                </label>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  maxLength={50}
                  placeholder="e.g., Emerald halo ring for Ana"
                  className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink shadow-inner shadow-black/5 outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
                />
              </div>

              {createError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {createError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:-translate-y-[1px] hover:shadow"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createProcess.isPending}
                  className={cn(
                    "rounded-full border border-ink/10 bg-ink px-5 py-2 text-sm font-semibold text-ivory shadow-md transition",
                    "hover:-translate-y-[1px] hover:shadow-luxe",
                    createProcess.isPending && "opacity-70",
                  )}
                >
                  {createProcess.isPending ? "Starting..." : "Start setup"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function ProcessListItem({
  process,
  active,
  onSelect,
}: {
  process: DesignProcess;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition",
        active ? "bg-ivory/80 shadow-inner shadow-gold/20" : "hover:bg-white/60",
      )}
    >
      <div className="space-y-1">
        <p className="text-base font-semibold text-ink">{process.title}</p>
        {process.type && (
          <p className="text-xs uppercase tracking-[0.2em] text-ash">
            {process.type}
          </p>
        )}
        {formatRelativeTime(process.updatedAt) && (
          <p className="text-xs text-ash">
            Updated {formatRelativeTime(process.updatedAt)}
            {formatTimestamp(process.updatedAt) && (
              <>
                {" "}
                ·{" "}
                <span className="text-[11px] text-ash/80">
                  {formatTimestamp(process.updatedAt)}
                </span>
              </>
            )}
          </p>
        )}
      </div>
      <StatusBadge status={process.status} />
    </button>
  );
}

function ProjectDetail({
  process,
  onTitleUpdated,
  answersCount,
  onStartDesign,
  onGenerationStarted,
  onProcessUpdated,
  onDeleted,
}: {
  process: DesignProcessDetails;
  onTitleUpdated: (title: string) => void;
  answersCount: number;
  onStartDesign: () => void;
  onGenerationStarted: () => void;
  onProcessUpdated: (process: DesignProcess) => void;
  onDeleted: () => void;
}) {
  const queryClient = useQueryClient();
  const [draftTitle, setDraftTitle] = useState(process.title);
  const [showEditTitle, setShowEditTitle] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [comment, setComment] = useState<string>(process.additionalComment ?? "");
  const [commentSaving, setCommentSaving] = useState(false);

  useEffect(() => {
    setDraftTitle(process.title);
    setComment(process.additionalComment ?? "");
  }, [process.title, process.additionalComment]);

  const updateTitle = useMutation({
    mutationFn: (title: string) => api.updateTitle(process.id, title),
    onSuccess: (updated) => {
      onTitleUpdated(updated.title);
      queryClient.invalidateQueries({ queryKey: ["processes"] });
      setShowEditTitle(false);
    },
  });

  const startGeneration = useMutation({
    mutationFn: () => api.startGeneration(process.id),
    onSuccess: () => {
      onGenerationStarted();
      queryClient.invalidateQueries({ queryKey: ["process", process.id] });
    },
  });

  const generateImage = useMutation({
    mutationFn: () => api.generateImage(process.id),
    onSuccess: () => {
      setGenerationError(null);
      setIsGenerating(true);
      queryClient.invalidateQueries({ queryKey: ["process", process.id] });
    },
    onError: (err: any) => {
      const status = err?.status;
      if (status === 400) {
        setGenerationError("This design is not ready to be generated yet.");
      } else if (status === 401) {
        router.replace("/login");
      } else {
        setGenerationError("Image generation failed, please try again.");
      }
      setIsGenerating(false);
    },
  });

  const deleteProcess = useMutation({
    mutationFn: () => api.deleteProcess(process.id),
    onSuccess: () => {
      setShowDeleteModal(false);
      onDeleted();
    },
  });

  const canGenerate = process.status === "READY_FOR_GENERATION" && !process.imageUrl && !process.visualizationUrl;
  const canDelete = DELETABLE_STATUSES.includes(process.status);

  useEffect(() => {
    if (["GENERATION_REQUESTED", "GENERATING"].includes(process.status)) {
      setIsGenerating(true);
    } else if (process.status === "GENERATED" || process.status === "VISUAL_READY") {
      setIsGenerating(false);
    }
  }, [process.status]);

  useEffect(() => {
    if (!isGenerating && !["GENERATION_REQUESTED", "GENERATING"].includes(process.status)) {
      return;
    }
    const startedAt = Date.now();
    const MAX_WAIT = 10 * 60 * 1000; // 10 minutes
    const interval = setInterval(async () => {
      if (Date.now() - startedAt > MAX_WAIT) {
        clearInterval(interval);
        setIsGenerating(false);
        return;
      }
      try {
        const status = await api.getStatus(process.id);
        if (status.status === "GENERATED" || status.status === "VISUAL_READY") {
          setIsGenerating(false);
          const fresh = await api.getProcess(process.id);
          onProcessUpdated(fresh);
          queryClient.setQueryData(["process", process.id], fresh);
          queryClient.invalidateQueries({ queryKey: ["processes"] });
          clearInterval(interval);
        } else {
          queryClient.setQueryData(["process", process.id], (prev?: DesignProcess) =>
            prev ? { ...prev, status: status.status, updatedAt: status.updatedAt } : prev,
          );
        }
      } catch (err: any) {
        if (err?.status === 401) {
          router.replace("/login");
        }
        // For transient errors, keep polling to allow more time
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isGenerating, process.id, process.status, queryClient, router, onProcessUpdated]);

  const isCommentEditable =
    ["INTAKE_IN_PROGRESS", "READY_FOR_GENERATION", "GENERATION_REQUESTED"].includes(process.status) &&
    !isGenerating &&
    process.status !== "GENERATED" &&
    !process.imageUrl &&
    !process.visualizationUrl;
  const commentDirty = (comment ?? "") !== (process.additionalComment ?? "");

  const handleSaveComment = async () => {
    if (!isCommentEditable || !commentDirty) return;
    try {
      setCommentSaving(true);
      await api.updateComment(process.id, comment.trim() ? comment.trim() : null);
      const fresh = await api.getProcessDetails(process.id);
      setComment(fresh.additionalComment ?? "");
      onProcessUpdated(fresh);
      queryClient.setQueryData(["process", process.id], fresh);
      queryClient.invalidateQueries({ queryKey: ["processes"] });
    } catch (err: any) {
      if (err?.status === 401) {
        router.replace("/login");
      }
    } finally {
      setCommentSaving(false);
    }
  };

  return (
    <div className="grid gap-6 px-2 sm:px-3">
      <div className="flex flex-wrap items-start justify-between gap-3 pr-2 sm:pr-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h2 className="serif-heading text-2xl text-ink sm:text-3xl">
              {process.title}
            </h2>
            <button
              onClick={() => setShowEditTitle(true)}
              className="p-1 text-ash transition hover:text-ink"
              aria-label="Edit project name"
            >
              <span aria-hidden="true" className="inline-flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M16.862 4.487a1.5 1.5 0 0 1 2.121 0l0.53 0.53a1.5 1.5 0 0 1 0 2.121l-9.33 9.33-3.182 0.53 0.53-3.182z" />
                  <path d="M19.5 13.5v5.25A1.25 1.25 0 0 1 18.25 20H5.75A1.25 1.25 0 0 1 4.5 18.75V6.25A1.25 1.25 0 0 1 5.75 5h5.25" />
                </svg>
              </span>
            </button>
            {canDelete && (
              <button
                onClick={() => {
                  if (!deleteProcess.isPending) setShowDeleteModal(true);
                }}
                className="p-1 text-ash transition hover:text-ink"
                aria-label="Delete project"
                disabled={deleteProcess.isPending}
              >
                <span aria-hidden="true" className="inline-flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M5 7h14" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M6 7l1 12a1 1 0 0 0 1 .9h8a1 1 0 0 0 1-.9l1-12" />
                    <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-ash">
            {process.type && <span>{process.type}</span>}
            {process.type && formatRelativeTime(process.updatedAt) && <span aria-hidden="true">•</span>}
            {formatRelativeTime(process.updatedAt) && (
              <span>
                Updated {formatRelativeTime(process.updatedAt)}
                {formatTimestamp(process.updatedAt) && (
                  <>
                    {" "}
                    ·{" "}
                    <span className="text-xs text-ash/80">
                      {formatTimestamp(process.updatedAt)}
                    </span>
                  </>
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <InfoTile label="Current stage">
          <div className="text-base font-semibold text-ink">
            {statusLabels[process.status]}
          </div>
        </InfoTile>
        <InfoTile label="Answered">
          <div className="text-base font-semibold text-ink">
            {answersCount} responses
          </div>
          <p className="text-xs text-ash">
            {process.status === "READY_FOR_GENERATION"
              ? "All required responses captured."
              : "Continue the questionnaire to unlock generation."}
          </p>
        </InfoTile>
        <InfoTile label="Project ID">
          <div className="text-base font-semibold text-ink">#{process.id}</div>
        </InfoTile>
      </div>

      <div className="rounded-2xl border border-black/5 bg-white/80 p-5 shadow-inner shadow-black/5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-ash">
              Design setup
            </p>
            <h3 className="serif-heading text-xl text-ink">
              Move this project forward
            </h3>
          </div>
          {process.status === "INTAKE_IN_PROGRESS" && (
            <button
              onClick={onStartDesign}
              disabled={isGenerating}
              className={cn(
                "rounded-full border border-ink/10 bg-ink px-5 py-2 text-sm font-semibold text-ivory shadow-md transition hover:-translate-y-[1px] hover:shadow-luxe",
                isGenerating && "opacity-60",
              )}
            >
              Continue design questions
            </button>
          )}
          {canGenerate && (
            <button
              onClick={() => generateImage.mutate()}
              disabled={generateImage.isPending || isGenerating}
              className={cn(
                "rounded-full border border-gold/50 bg-gold px-5 py-2 text-sm font-semibold text-ink shadow-md transition",
                "hover:-translate-y-[1px] hover:shadow-luxe",
                (generateImage.isPending || isGenerating) && "opacity-60 cursor-not-allowed",
              )}
            >
              {generateImage.isPending || isGenerating
                ? "Generating..."
                : "Generate design"}
            </button>
          )}
          {isGenerating && (
            <div className="flex items-center gap-2 rounded-full bg-parchment px-4 py-2 text-sm text-ash">
              <span className="h-2 w-2 animate-pulse rounded-full bg-gold" />
              Your design is being prepared…
            </div>
          )}
          {canDelete && (
            <button
              onClick={() => {
                if (!deleteProcess.isPending) setShowDeleteModal(true);
              }}
              disabled={deleteProcess.isPending || isGenerating}
              className={cn(
                "rounded-full border border-black/20 bg-white px-5 py-2 text-sm font-semibold text-ink shadow-md transition",
                "hover:-translate-y-[1px] hover:shadow",
                (deleteProcess.isPending || isGenerating) && "opacity-70",
              )}
            >
              {deleteProcess.isPending ? "Deleting..." : "Delete project"}
            </button>
          )}
        </div>

        <div className="mt-4 text-sm text-ash">
          {process.status === "INTAKE_IN_PROGRESS" &&
            "Finish the short questionnaire to unlock generation."}
          {process.status === "READY_FOR_GENERATION" &&
            "All required answers are in. Generate a preview to send to your client."}
          {isGenerating &&
            "Generating your design… please wait. We check for status updates every few seconds."}
          {(process.status === "VISUAL_READY" || process.status === "GENERATED") &&
            "Preview is ready. Share it with your client or continue to production steps."}
        </div>
        {generationError && (
          <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {generationError}
          </div>
        )}
        <div className="mt-5 grid gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-ink" htmlFor="project-comment">
              Your note
            </label>
            <span className="text-xs text-ash">{comment.length}/500</span>
          </div>
          <textarea
            id="project-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 500))}
            disabled={!isCommentEditable || commentSaving}
            placeholder="Add context for your team or client..."
            className={cn(
              "w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink shadow-inner shadow-black/5 outline-none focus:border-gold focus:ring-2 focus:ring-gold/30",
              (!isCommentEditable || commentSaving) && "opacity-70",
            )}
          />
          {isCommentEditable && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSaveComment}
                disabled={!commentDirty || commentSaving}
                className={cn(
                  "rounded-full border border-ink/10 bg-ink px-4 py-2 text-sm font-semibold text-ivory shadow-md transition",
                  "hover:-translate-y-[1px] hover:shadow-luxe",
                  (!commentDirty || commentSaving) && "opacity-60",
                )}
              >
                {commentSaving ? "Saving..." : "Save note"}
              </button>
            </div>
          )}
        </div>
      </div>

      {(process.visualizationUrl || process.imageUrl) && (
        <div className="overflow-hidden rounded-2xl border border-black/10 bg-ink/90 shadow-luxe">
          <div className="flex items-center justify-between px-5 py-3 text-ivory">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gold-soft">
                Design preview
              </p>
              <p className="serif-heading text-lg">Visualization</p>
            </div>
            {(process.visualizationUrl || process.imageUrl) && (
              <Link
                href={process.visualizationUrl || process.imageUrl!}
                target="_blank"
                className="rounded-full border border-gold/60 bg-gold px-4 py-1 text-xs font-semibold text-ink transition hover:-translate-y-[1px]"
              >
                Open full size
              </Link>
            )}
          </div>
          <div className="relative h-96 bg-ink">
            <Image
              src={process.visualizationUrl || process.imageUrl!}
              alt="Generated jewelry visualization"
              fill
              className="object-cover transition-opacity duration-500"
              sizes="100vw"
              unoptimized
            />
          </div>
        </div>
      )}

      {!process.visualizationUrl &&
        !process.imageUrl &&
        (process.status === "VISUAL_READY" || process.status === "GENERATED") && (
          <div className="rounded-2xl border border-dashed border-gold/40 bg-parchment px-5 py-4 text-sm text-ash">
            Preview is ready, but no visualization URL was returned yet. Check back
            soon or refresh the status.
          </div>
        )}

      <StatusTimeline current={process.status} />
      {showEditTitle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 py-6 backdrop-blur">
          <div className="w-full max-w-lg rounded-3xl border border-black/10 bg-white/90 p-6 shadow-luxe">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-ash">
                  Edit project
                </p>
                <h3 className="serif-heading text-2xl text-ink">
                  Update project name
                </h3>
              </div>
              <button
                onClick={() => setShowEditTitle(false)}
                className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-ink transition hover:-translate-y-[1px] hover:shadow"
              >
                Close
              </button>
            </div>
            <form
              className="mt-5 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!draftTitle.trim()) return;
                updateTitle.mutate(draftTitle.trim());
              }}
            >
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-ink">
                  Project name
                </label>
                <input
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  maxLength={50}
                  className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-ink shadow-inner shadow-black/5 outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
                />
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditTitle(false)}
                  className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:-translate-y-[1px] hover:shadow"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateTitle.isPending}
                  className={cn(
                    "rounded-full border border-ink/10 bg-ink px-5 py-2 text-sm font-semibold text-ivory shadow-md transition",
                    "hover:-translate-y-[1px] hover:shadow-luxe",
                    updateTitle.isPending && "opacity-70",
                  )}
                >
                  {updateTitle.isPending ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4 py-6 backdrop-blur">
          <div className="w-full max-w-lg rounded-3xl border border-black/10 bg-white/90 p-6 shadow-luxe">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-ash">
                  Delete project
                </p>
                <h3 className="serif-heading text-2xl text-ink">
                  Confirm deletion
                </h3>
                <p className="text-sm text-ash">
                  Confirm you want to delete “{process.title}” project from your portfolio.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-ink transition hover:-translate-y-[1px] hover:shadow"
              >
                Close
              </button>
            </div>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:-translate-y-[1px] hover:shadow"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteProcess.mutate()}
                disabled={deleteProcess.isPending}
                className={cn(
                  "rounded-full border border-black/20 bg-white px-5 py-2 text-sm font-semibold text-ink shadow-md transition",
                  "hover:-translate-y-[1px] hover:shadow",
                  deleteProcess.isPending && "opacity-70",
                )}
              >
                {deleteProcess.isPending ? "Deleting..." : "Delete project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoTile({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white/70 p-4 shadow-inner shadow-black/5">
      <p className="text-xs uppercase tracking-[0.2em] text-ash">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

const statusFlow: DesignProcessStatus[] = [
  "INTAKE_IN_PROGRESS",
  "READY_FOR_GENERATION",
  "GENERATION_REQUESTED",
  "VISUAL_READY",
  "APPROVED_FOR_PRODUCTION",
  "IN_PRODUCTION",
  "SHIPPING",
  "COMPLETED",
];

function StatusTimeline({ current }: { current: DesignProcessStatus }) {
  const activeIndex = statusFlow.indexOf(current);
  return (
    <div className="rounded-2xl border border-black/5 bg-white/80 p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-ash">
        Production timeline
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-4">
        {statusFlow.map((status, idx) => {
          const active = idx <= activeIndex;
          return (
            <div
              key={status}
              className={cn(
                "rounded-2xl border px-3 py-3 text-sm",
                active
                  ? "border-gold/40 bg-gold/15 text-ink shadow-sm"
                  : "border-black/10 bg-white/60 text-ash",
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    active ? "bg-gold" : "bg-black/20",
                  )}
                />
                <span className="font-semibold">
                  {statusLabels[status] ?? status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
