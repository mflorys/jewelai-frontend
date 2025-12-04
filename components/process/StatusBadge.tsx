"use client";

import { statusLabels, statusTone } from "@/lib/process-helpers";
import type { DesignProcessStatus } from "@/lib/types";
import { cn } from "@/lib/cn";

type Props = {
  status: DesignProcessStatus;
  className?: string;
  showPulse?: boolean;
};

export function StatusBadge({ status, className, showPulse }: Props) {
  const tone = statusTone(status);

  const base = {
    gold: "bg-gold/15 text-coal border-gold/50",
    neutral: "bg-ink/80 text-ivory border-black/20",
    muted: "bg-coal/70 text-ivory border-black/40",
  }[tone];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
        base,
        className,
      )}
    >
      {showPulse && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold/60 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
        </span>
      )}
      {statusLabels[status]}
    </span>
  );
}
