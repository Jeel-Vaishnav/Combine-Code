"use client";

import React from "react";
import { Search, X, SlidersHorizontal, AlertTriangle, Plus, Sparkles, Filter } from "lucide-react";
import { Priority, UserSummary } from "@/types/models";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

interface BoardFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedPriority: Priority | "ALL";
  onPriorityChange: (p: Priority | "ALL") => void;
  selectedAssigneeId: string | "ALL";
  onAssigneeChange: (id: string | "ALL") => void;
  allUsers: UserSummary[];
  onQuickNewTask: () => void;
  onSimulateConflictTrigger?: () => void;
  taskCountsByPriority?: Record<string, number>;
}

export function BoardFilterBar({
  searchQuery,
  onSearchChange,
  selectedPriority,
  onPriorityChange,
  selectedAssigneeId,
  onAssigneeChange,
  allUsers,
  onQuickNewTask,
  onSimulateConflictTrigger,
  taskCountsByPriority = {},
}: BoardFilterBarProps) {
  const priorities: (Priority | "ALL")[] = ["ALL", "URGENT", "HIGH", "MEDIUM", "LOW"];

  const activeFilterCount =
    (searchQuery.trim().length > 0 ? 1 : 0) +
    (selectedPriority !== "ALL" ? 1 : 0) +
    (selectedAssigneeId !== "ALL" ? 1 : 0);

  const clearFilters = () => {
    onSearchChange("");
    onPriorityChange("ALL");
    onAssigneeChange("ALL");
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-zinc-950/70 backdrop-blur-md border-b border-white/[0.06] select-none">
      {/* Left: Search & Filter Pills */}
      <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
        {/* Search input with Windows Ctrl+K indicator */}
        <div className="relative w-56 sm:w-68">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks, tags, specs..."
            className="w-full h-8 pl-8 pr-8 bg-zinc-900/90 border border-zinc-700/80 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
          />
          {searchQuery ? (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="kbd-shortcut absolute right-2 top-1/2 -translate-y-1/2 text-[9px] pointer-events-none opacity-60">
              /
            </span>
          )}
        </div>

        {/* Priority Filter Pills */}
        <div className="flex items-center gap-1 bg-zinc-900/90 p-0.5 rounded-lg border border-zinc-800 shadow-inner">
          {priorities.map((p) => {
            const count = p === "ALL" ? undefined : taskCountsByPriority[p];
            return (
              <button
                key={p}
                onClick={() => onPriorityChange(p)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-[11px] font-medium transition-all duration-150 cursor-pointer flex items-center gap-1.5",
                  selectedPriority === p
                    ? "bg-zinc-800 text-zinc-100 shadow-xs border border-white/10"
                    : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                <span>{p === "ALL" ? "All" : p.charAt(0) + p.slice(1).toLowerCase()}</span>
                {count !== undefined && count > 0 && (
                  <span className="text-[9px] font-mono opacity-60">({count})</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Assignee Filter Pills */}
        <div className="flex items-center gap-1 pl-1">
          <button
            onClick={() => onAssigneeChange("ALL")}
            className={cn(
              "px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer",
              selectedAssigneeId === "ALL"
                ? "bg-zinc-800 text-zinc-100 border border-white/10 shadow-xs"
                : "text-zinc-400 hover:text-zinc-200"
            )}
          >
            Everyone
          </button>
          {allUsers.map((u) => (
            <button
              key={u.id}
              onClick={() =>
                onAssigneeChange(selectedAssigneeId === u.id ? "ALL" : u.id)
              }
              className={cn(
                "p-0.5 rounded-full border transition-all duration-150 cursor-pointer",
                selectedAssigneeId === u.id
                  ? "border-blue-400 ring-2 ring-blue-500/40 scale-110 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                  : "border-transparent opacity-65 hover:opacity-100 hover:scale-105"
              )}
              title={`Filter by ${u.name}`}
            >
              <Avatar name={u.name} src={u.avatarUrl} color={u.color} size="xs" />
            </button>
          ))}
        </div>

        {/* Active Filters Clear Button */}
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-medium border border-white/10 transition-colors animate-in fade-in"
          >
            <X className="w-3 h-3" />
            <span>Clear ({activeFilterCount})</span>
          </button>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {onSimulateConflictTrigger && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSimulateConflictTrigger}
            className="border-amber-500/40 text-amber-300 hover:bg-amber-950/30 gap-1.5 shadow-xs"
            title="Demonstrate deterministic 3-Way OCC Concurrency Conflict (HTTP 409)"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="hidden sm:inline">Simulate Race Condition</span>
            <span className="sm:hidden">Simulate OCC</span>
          </Button>
        )}

        <Button
          variant="primary"
          size="sm"
          onClick={onQuickNewTask}
          className="gap-1.5 shadow-md shadow-blue-600/30"
          title="Create New Task (Alt+N)"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </Button>
      </div>
    </div>
  );
}
