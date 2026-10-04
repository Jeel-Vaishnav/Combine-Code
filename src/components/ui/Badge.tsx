import React from "react";
import { cn } from "@/lib/utils";
import { Priority } from "@/types/models";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "priority" | "status";
  priority?: Priority;
  dot?: boolean;
}

export function Badge({
  className,
  variant = "default",
  priority,
  dot = false,
  children,
  ...props
}: BadgeProps) {
  let badgeStyle = "bg-zinc-800/80 text-zinc-300 border-zinc-700/60";
  let dotColor = "bg-zinc-400";

  if (priority === "URGENT") {
    badgeStyle = "bg-red-500/15 text-red-300 border-red-500/35 shadow-xs shadow-red-500/10 font-semibold";
    dotColor = "bg-red-400 animate-pulse";
  } else if (priority === "HIGH") {
    badgeStyle = "bg-amber-500/15 text-amber-300 border-amber-500/35 shadow-xs shadow-amber-500/10 font-medium";
    dotColor = "bg-amber-400";
  } else if (priority === "MEDIUM") {
    badgeStyle = "bg-blue-500/15 text-blue-300 border-blue-500/35 shadow-xs shadow-blue-500/10 font-medium";
    dotColor = "bg-blue-400";
  } else if (priority === "LOW") {
    badgeStyle = "bg-zinc-800/90 text-zinc-400 border-zinc-700/50";
    dotColor = "bg-zinc-500";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10.5px] border select-none transition-all duration-150 backdrop-blur-xs",
        badgeStyle,
        className
      )}
      {...props}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColor)} />}
      {children}
    </span>
  );
}
