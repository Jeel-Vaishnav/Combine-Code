"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  TrendingUp,
  BarChart2,
  Calendar,
  Layers,
  RefreshCw,
  Copy,
  Sparkles,
  Zap,
} from "lucide-react";
import { ProjectProgressStats, UserSummary } from "@/types/models";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

interface ProjectDashboardProps {
  projectId: string;
}

export function ProjectDashboard({ projectId }: ProjectDashboardProps) {
  const { toast } = useToast();
  const [stats, setStats] = useState<ProjectProgressStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchProgress = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await fetch(`/api/projects/${projectId}/progress`);
      if (!res.ok) throw new Error("Failed to load progress stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Dashboard error:", err);
      toast({
        type: "error",
        title: "Metrics Error",
        message: "Failed to reload executive analytics.",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [projectId, toast]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const handleCopyReport = () => {
    if (!stats) return;
    const summary = `📊 **Algothon Executive Health Report**
- Overall Progress: ${stats.progressPercentage}% (${stats.completedTasks}/${stats.totalTasks} tasks resolved)
- Active Pipeline: ${stats.totalTasks - stats.completedTasks} tasks
- Critical Overdue: ${stats.overdueTasks} tasks
- Due in <24 Hours: ${stats.dueSoonTasks} tasks
- Active Contributors: ${stats.workloadAllocation.map((w) => `${w.user.name} (${w.taskCount} tasks)`).join(", ")}`;

    navigator.clipboard?.writeText(summary);
    toast({
      type: "success",
      title: "Report Copied to Clipboard",
      message: "Executive summary ready to paste into Slack or docs.",
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-6xl mx-auto flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-16 text-center text-xs text-zinc-500">
        Failed to load project dashboard metrics.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto overflow-y-auto flex-1 h-full select-none">
      {/* Top Header with Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <h1 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400">
              <BarChart2 className="w-5 h-5" />
            </div>
            <span>Executive Health & Progress Engine</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Deterministic velocity metrics, column stage distribution, and team workload capacity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyReport}
            className="gap-1.5"
            title="Copy formatted markdown report"
          >
            <Copy className="w-3.5 h-3.5 text-zinc-400" />
            <span>Copy Executive Summary</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchProgress(true)}
            isLoading={isRefreshing}
            className="gap-1.5"
            title="Refresh metrics calculation"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
            <span>Refresh Stats</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Formula-based Project Completion */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-[#181822] to-[#121218] border border-white/[0.08] shadow-lg shadow-black/40 flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold text-zinc-300">Project Completion</span>
            <div className="p-1 rounded-md bg-emerald-500/15 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-extrabold text-zinc-100 font-mono tracking-tight">
              {stats.progressPercentage}%
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              Formula: ({stats.completedTasks} / {stats.totalTasks}) × 100
            </div>
          </div>
          <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-white/[0.05]">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${stats.progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Card 2: Total Tasks & Active Load */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-[#181822] to-[#121218] border border-white/[0.08] shadow-lg shadow-black/40 flex flex-col justify-between hover:border-blue-500/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold text-zinc-300">Total Workload</span>
            <div className="p-1 rounded-md bg-blue-500/15 text-blue-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-extrabold text-zinc-100 font-mono tracking-tight">
              {stats.totalTasks}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              {stats.totalTasks - stats.completedTasks} in flight • {stats.completedTasks} resolved
            </div>
          </div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>High completion velocity</span>
          </div>
        </div>

        {/* Card 3: Overdue Tasks Alert Badge */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-[#181822] to-[#121218] border border-white/[0.08] shadow-lg shadow-black/40 flex flex-col justify-between hover:border-red-500/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold text-zinc-300">Overdue Tasks</span>
            <div className="p-1 rounded-md bg-red-500/15 text-red-400">
              <AlertTriangle
                className={cn(
                  "w-4 h-4",
                  stats.overdueTasks > 0 ? "animate-pulse" : "text-zinc-500"
                )}
              />
            </div>
          </div>
          <div className="my-3">
            <div
              className={cn(
                "text-3xl font-extrabold font-mono tracking-tight",
                stats.overdueTasks > 0 ? "text-red-400" : "text-zinc-100"
              )}
            >
              {stats.overdueTasks}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              {stats.overdueTasks > 0
                ? "Immediate escalation required"
                : "Zero overdue tasks"}
            </div>
          </div>
          <div className="text-[10px] text-zinc-500 font-mono">
            Red badge deadline alert
          </div>
        </div>

        {/* Card 4: Due Soon Alert (<24h) */}
        <div className="p-4 rounded-2xl bg-gradient-to-b from-[#181822] to-[#121218] border border-white/[0.08] shadow-lg shadow-black/40 flex flex-col justify-between hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold text-zinc-300">Due in &lt;24h</span>
            <div className="p-1 rounded-md bg-amber-500/15 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="my-3">
            <div className="text-3xl font-extrabold text-amber-400 font-mono tracking-tight">
              {stats.dueSoonTasks}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              {stats.onTrackTasks} items comfortably on track
            </div>
          </div>
          <div className="text-[10px] text-zinc-500 font-mono">
            Yellow badge deadline alert
          </div>
        </div>
      </div>

      {/* Status Breakdown Segmented Bar */}
      <div className="p-5 rounded-2xl bg-[#0f0f14]/80 border border-white/[0.08] shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-200 flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-400" />
            <span>Kanban Stage Distribution & Pipeline Health</span>
          </h2>
          <span className="text-[11px] font-mono text-zinc-400">
            {stats.totalTasks} total tasks
          </span>
        </div>

        {/* Segmented multi-color progress bar */}
        <div className="w-full h-3.5 bg-zinc-900 rounded-full overflow-hidden flex shadow-inner border border-white/[0.05]">
          {stats.columnBreakdown.map((col) => (
            <div
              key={col.columnId}
              style={{
                width: `${col.percentage}%`,
                backgroundColor: col.color,
              }}
              className="h-full transition-all duration-300 hover:opacity-85 cursor-pointer"
              title={`${col.name}: ${col.count} tasks (${col.percentage}%)`}
            />
          ))}
        </div>

        {/* Column Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          {stats.columnBreakdown.map((col) => (
            <div
              key={col.columnId}
              className="p-3 rounded-xl bg-zinc-900/80 border border-white/[0.05] flex items-center justify-between text-xs shadow-xs"
            >
              <div className="flex items-center gap-2 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: col.color }}
                />
                <span className="text-zinc-200 truncate font-medium">{col.name}</span>
              </div>
              <div className="font-mono text-zinc-400 shrink-0 font-semibold">
                {col.count} ({col.percentage}%)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Workload Allocation Section with Indian Personas */}
      <div className="p-5 rounded-2xl bg-[#0f0f14]/80 border border-white/[0.08] shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
              Team Workload & Capacity Allocation
            </h2>
          </div>
          <span className="text-[11px] text-zinc-400">
            {stats.workloadAllocation.length} active Indian engineers
          </span>
        </div>

        <div className="space-y-3">
          {stats.workloadAllocation.map((w) => {
            const maxCapacity = 6;
            const loadPercentage = Math.min(Math.round((w.taskCount / maxCapacity) * 100), 100);

            return (
              <div
                key={w.user.id}
                className="p-3.5 rounded-xl bg-zinc-900/60 border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-white/15 transition-colors"
              >
                {/* User info */}
                <div className="flex items-center gap-2.5 min-w-[220px]">
                  <Avatar
                    name={w.user.name}
                    src={w.user.avatarUrl}
                    color={w.user.color}
                    size="sm"
                  />
                  <div>
                    <div className="font-semibold text-zinc-100">{w.user.name}</div>
                    <div className="text-[10px] text-zinc-400 font-mono">{w.user.role}</div>
                  </div>
                </div>

                {/* Progress bar representing load */}
                <div className="flex-1 max-w-md">
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1.5">
                    <span>
                      {w.taskCount} tasks assigned ({w.completedCount} completed)
                    </span>
                    {w.urgentCount > 0 && (
                      <span className="text-red-400 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {w.urgentCount} urgent!
                      </span>
                    )}
                  </div>
                  <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-white/[0.05]">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        w.urgentCount > 0
                          ? "bg-gradient-to-r from-amber-500 to-red-500"
                          : "bg-gradient-to-r from-blue-500 to-indigo-500"
                      )}
                      style={{ width: `${loadPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Status chip */}
                <div className="shrink-0 text-right">
                  <span
                    className={cn(
                      "text-[10px] px-2.5 py-1 rounded-full border font-semibold",
                      w.taskCount >= 4
                        ? "bg-amber-500/15 text-amber-300 border-amber-500/35"
                        : "bg-emerald-500/15 text-emerald-300 border-emerald-500/35"
                    )}
                  >
                    {w.taskCount >= 4 ? "High Capacity" : "Optimal Load"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
