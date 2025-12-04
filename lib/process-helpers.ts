import type { DesignProcessStatus } from "./types";

export const statusLabels: Record<DesignProcessStatus, string> = {
  INTAKE_IN_PROGRESS: "Design in progress",
  READY_FOR_GENERATION: "Ready to generate",
  GENERATION_REQUESTED: "Generating...",
  GENERATING: "Generating...",
  GENERATED: "Generated",
  VISUAL_READY: "Preview ready",
  CLIENT_ACCEPTED: "Accepted by client",
  SENT_TO_REVIEW: "Sent to review",
  APPROVED_FOR_PRODUCTION: "Approved for production",
  IN_PRODUCTION: "In production",
  CRAFTED: "Crafted",
  SHIPPING: "Shipping",
  IN_DELIVERY: "In delivery",
  COMPLETED: "Completed",
  RETURN_IN_PROGRESS: "Return in progress",
};

export function statusTone(status: DesignProcessStatus) {
  switch (status) {
    case "READY_FOR_GENERATION":
    case "VISUAL_READY":
    case "APPROVED_FOR_PRODUCTION":
      return "gold";
    case "GENERATION_REQUESTED":
    case "INTAKE_IN_PROGRESS":
      return "neutral";
    default:
      return "muted";
  }
}

export function shouldPollStatus(status?: DesignProcessStatus) {
  if (!status) return false;
  return [
    "GENERATION_REQUESTED",
    "GENERATING",
    "IN_PRODUCTION",
    "SHIPPING",
    "IN_DELIVERY",
  ].includes(status);
}

export function formatRelativeTime(dateString?: string | null) {
  if (!dateString) return null;
  const parsed = Date.parse(dateString);
  const value = Number.isNaN(parsed) ? new Date(dateString).getTime() : parsed;
  if (!Number.isFinite(value)) return null;
  const now = Date.now();
  const diff = Math.max(0, now - value);

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "moments ago";
  if (diff < hour) {
    const minutes = Math.round(diff / minute);
    return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  }
  if (diff < day) {
    const hours = Math.round(diff / hour);
    return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  }
  const days = Math.round(diff / day);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function formatTimestamp(dateString?: string | null) {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
