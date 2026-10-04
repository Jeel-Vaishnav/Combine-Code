import React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "xs" | "sm" | "md" | "lg";
  color?: string;
  isOnline?: boolean;
  className?: string;
}

export function Avatar({
  src,
  name,
  size = "sm",
  color = "#3b82f6",
  isOnline = false,
  className,
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  const sizeClasses = {
    xs: "w-5 h-5 text-[9px]",
    sm: "w-6 h-6 text-[10px]",
    md: "w-8 h-8 text-xs",
    lg: "w-10 h-10 text-sm",
  };

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className={cn("relative inline-block shrink-0 select-none", className)} title={name}>
      {src && !imageError ? (
        <img
          src={src}
          alt={name}
          onError={() => setImageError(true)}
          className={cn(
            "rounded-full object-cover border border-white/15 shadow-sm transition-transform duration-150",
            sizeClasses[size]
          )}
        />
      ) : (
        <div
          style={{ backgroundColor: color }}
          className={cn(
            "rounded-full flex items-center justify-center font-bold text-white shadow-sm border border-white/20",
            sizeClasses[size]
          )}
        >
          {initials}
        </div>
      )}

      {isOnline && (
        <span
          className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-zinc-950 animate-pulse"
          title="Online"
        />
      )}
    </div>
  );
}
