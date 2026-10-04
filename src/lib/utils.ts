import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isPast, differenceInHours } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type OverdueStatus = "none" | "overdue" | "due_soon" | "on_track";

export interface OverdueBadgeInfo {
  status: OverdueStatus;
  label: string;
  badgeClass: string;
  dotClass: string;
  formattedDate: string;
}

export function getOverdueBadgeInfo(dueDate: string | Date | null | undefined): OverdueBadgeInfo {
  if (!dueDate) {
    return {
      status: "none",
      label: "No deadline",
      badgeClass: "bg-zinc-800/60 text-zinc-400 border-zinc-700/50",
      dotClass: "bg-zinc-500",
      formattedDate: "No due date",
    };
  }

  const date = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  const formattedDate = format(date, "MMM d");
  const now = new Date();

  // If already in the past (overdue)
  if (isPast(date) && date.getTime() < now.getTime()) {
    const hoursPast = Math.abs(differenceInHours(now, date));
    return {
      status: "overdue",
      label: hoursPast > 24 ? `${Math.floor(hoursPast / 24)}d overdue` : `${hoursPast}h overdue`,
      badgeClass: "bg-red-500/10 text-red-400 border-red-500/30",
      dotClass: "bg-red-500 animate-pulse",
      formattedDate,
    };
  }

  const hoursRemaining = differenceInHours(date, now);

  // Less than 24 hours remaining (Due soon)
  if (hoursRemaining <= 24) {
    return {
      status: "due_soon",
      label: `Due in ${hoursRemaining}h`,
      badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      dotClass: "bg-amber-400",
      formattedDate,
    };
  }

  // More than 24 hours remaining (On track)
  return {
    status: "on_track",
    label: formattedDate,
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    dotClass: "bg-emerald-500",
    formattedDate,
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatTimeAgo(dateStr: string | Date): string {
  try {
    const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return "just now";
  }
}
