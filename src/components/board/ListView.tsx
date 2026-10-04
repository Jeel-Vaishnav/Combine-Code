"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar,
  CheckSquare,
  MessageSquare,
  Paperclip,
  ExternalLink,
  ArrowUpDown,
  Filter,
  Plus,
} from "lucide-react";
import { ColumnWithTasks, TaskItem, Priority, UserSummary } from "@/types/models";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { getOverdueBadgeInfo, formatTimeAgo, cn } from "@/lib/utils";

interface ListViewProps {
  columns: ColumnWithTasks[];
  onTaskClick: (task: TaskItem) => void;
  onQuickNewTask: () => void;
  editingMap: Record<string, UserSummary[]>;
}

export function ListView({
  columns,
  onTaskClick,
  onQuickNewTask,
  editingMap,
}: ListViewProps) {
  const [sortField, setSortField] = useState<"title" | "priority" | "dueDate" | "status">("priority");
  const [sortAsc, setSortAsc] = useState(false);

  // Flatten tasks with column name
  const allTasks = useMemo(() => {
    return columns.flatMap((col) =>
      col.tasks.map((task) => ({
        ...task,
        columnName: col.name,
        columnColor: col.color,
      }))
    );
  }, [columns]);

  // Sort tasks
  const sortedTasks = useMemo(() => {
    const list = [...allTasks];
    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === "title") {
        cmp = a.title.localeCompare(b.title);
      } else if (sortField === "priority") {
        const order: Record<Priority, number> = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        cmp = (order[a.priority] || 0) - (order[b.priority] || 0);
      } else if (sortField === "dueDate") {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        cmp = dateA - dateB;
      } else if (sortField === "status") {
        cmp = a.columnName.localeCompare(b.columnName);
      }
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [allTasks, sortField, sortAsc]);

  const toggleSort = (field: "title" | "priority" | "dueDate" | "status") => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0a0a0f] p-4 overflow-hidden">
      {/* Table container with custom slim Windows scrollbar */}
      <div className="flex-1 overflow-auto rounded-xl border border-white/[0.08] bg-zinc-950/80 shadow-2xl">
        <table className="w-full text-left border-collapse text-xs">
          {/* Table Header */}
          <thead className="sticky top-0 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 select-none z-10">
            <tr>
              <th
                onClick={() => toggleSort("title")}
                className="py-3 px-4 cursor-pointer hover:text-zinc-200 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Task Summary</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => toggleSort("status")}
                className="py-3 px-3 cursor-pointer hover:text-zinc-200 transition-colors w-36"
              >
                <div className="flex items-center gap-1.5">
                  <span>Stage</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => toggleSort("priority")}
                className="py-3 px-3 cursor-pointer hover:text-zinc-200 transition-colors w-28"
              >
                <div className="flex items-center gap-1.5">
                  <span>Priority</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 w-36">Assignees</th>
              <th
                onClick={() => toggleSort("dueDate")}
                className="py-3 px-3 cursor-pointer hover:text-zinc-200 transition-colors w-32"
              >
                <div className="flex items-center gap-1.5">
                  <span>Due Date</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-3 w-28">Subtasks</th>
              <th className="py-3 px-3 w-16 text-right">Actions</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-white/[0.04]">
            {sortedTasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-zinc-500">
                  No tasks found matching your current filter.
                </td>
              </tr>
            ) : (
              sortedTasks.map((task) => {
                const overdueInfo = getOverdueBadgeInfo(task.dueDate);
                const completedSubs = task.subtasks?.filter((s) => s.isCompleted).length || 0;
                const totalSubs = task.subtasks?.length || 0;
                const isBeingEdited = (editingMap[task.id] || []).length > 0;

                return (
                  <tr
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className="group hover:bg-zinc-900/60 cursor-pointer transition-colors duration-150"
                  >
                    {/* Task Title + tags */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-zinc-400">
                          v{task.version}
                        </span>
                        <span className="font-medium text-zinc-200 group-hover:text-blue-400 transition-colors truncate max-w-md">
                          {task.title}
                        </span>
                        {isBeingEdited && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 animate-pulse">
                            Editing
                          </span>
                        )}
                      </div>
                      {task.tags?.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {task.tags.map((t) => (
                            <span
                              key={t.tagId}
                              className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400"
                            >
                              #{t.tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Stage / Column */}
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-zinc-900 border border-zinc-800">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: task.columnColor }}
                        />
                        <span className="truncate">{task.columnName}</span>
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-3">
                      <Badge priority={task.priority} dot>
                        {task.priority.charAt(0) + task.priority.slice(1).toLowerCase()}
                      </Badge>
                    </td>

                    {/* Assignees */}
                    <td className="py-3 px-3">
                      <div className="flex items-center -space-x-1.5 overflow-hidden">
                        {task.assignees.map((a) => (
                          <Avatar
                            key={a.userId}
                            name={a.user.name}
                            src={a.user.avatarUrl}
                            color={a.user.color}
                            size="xs"
                            className="ring-1 ring-zinc-900"
                          />
                        ))}
                      </div>
                    </td>

                    {/* Due Date */}
                    <td className="py-3 px-3">
                      {task.dueDate ? (
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border",
                            overdueInfo.badgeClass
                          )}
                        >
                          <Calendar className="w-2.5 h-2.5" />
                          <span>{overdueInfo.label}</span>
                        </span>
                      ) : (
                        <span className="text-zinc-600 text-[11px]">—</span>
                      )}
                    </td>

                    {/* Subtask Progress */}
                    <td className="py-3 px-3">
                      {totalSubs > 0 ? (
                        <div className="space-y-1">
                          <div className="text-[10px] text-zinc-400 flex items-center justify-between">
                            <span>
                              {completedSubs}/{totalSubs}
                            </span>
                            <span>{Math.round((completedSubs / totalSubs) * 100)}%</span>
                          </div>
                          <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${(completedSubs / totalSubs) * 100}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-zinc-600 text-[11px]">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onTaskClick(task);
                        }}
                        className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                        title="View details"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* List Footer with quick count */}
      <div className="mt-2.5 px-2 flex items-center justify-between text-xs text-zinc-400">
        <span>
          Showing <strong className="text-zinc-200">{sortedTasks.length}</strong> tasks in high-density table view
        </span>
        <Button variant="primary" size="sm" onClick={onQuickNewTask} className="gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </Button>
      </div>
    </div>
  );
}
