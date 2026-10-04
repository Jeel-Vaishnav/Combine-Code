import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "emerald";
  size?: "xs" | "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "secondary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:opacity-40 disabled:pointer-events-none select-none text-xs cursor-pointer active:scale-[0.97]";

    const variantClasses = {
      primary:
        "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-600/25 border border-blue-400/30 hover:shadow-blue-600/40",
      secondary:
        "bg-zinc-800/90 hover:bg-zinc-700 text-zinc-100 border border-white/10 shadow-xs hover:border-white/20",
      outline:
        "border border-white/10 hover:border-white/25 hover:bg-white/5 text-zinc-200",
      ghost:
        "hover:bg-white/8 text-zinc-300 hover:text-white border border-transparent",
      danger:
        "bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 shadow-xs hover:border-red-500/50",
      emerald:
        "bg-emerald-600/90 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/25 border border-emerald-400/30",
    };

    const sizeClasses = {
      xs: "h-6 px-2 text-[11px] gap-1",
      sm: "h-7 px-2.5 gap-1.5",
      md: "h-8 px-3 gap-2",
      lg: "h-9 px-4 gap-2 text-sm",
      icon: "h-7 w-7 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        {...props}
      >
        {isLoading && (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
