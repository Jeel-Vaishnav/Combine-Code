"use client";

import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Calendar,
  CheckSquare,
  MessageSquare,
  Paperclip,
  GripVertical,
  Flame,
  MoreHorizontal,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { TaskItem, UserSummary } from "@/types/models";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { getOverdueBadgeInfo, cn } from "@/lib/utils";

interface TaskCardProps {
  task: TaskItem;
  onClick: () => void;
  isBeingEditedBy?: UserSummary[];
  onDeleteTask?: (taskId: string) => void;
}

export function TaskCard({
  task,
  onClick,
  isBeingEditedBy = [],
  onDeleteTask,
}: TaskCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { task },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 150ms cubic-bezier(0.2, 0, 0, 1)",
  };

  const overdueInfo = getOverdueBadgeInfo(task.dueDate);
  const completedSubtasks = task.subtasks?.filter((s) => s.isCompleted).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const hasEditors = isBeingEditedBy.length > 0;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    if (onDeleteTask) {
      onDeleteTask(task.id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={cn(
        "group relative rounded-xl p-3.5 cursor-pointer select-none transition-all duration-200 text-xs",
        "bg-gradient-to-b from-[#16161f] to-[#121218] border border-white/[0.08] shadow-md shadow-black/40",
        "hover:border-blue-500/40 hover:shadow-xl hover:shadow-black/70 hover:-translate-y-0.5",
        isDragging
          ? "opacity-50 border-blue-500 ring-2 ring-blue-500/30 scale-[1.02] shadow-2xl z-50 cursor-grabbing"
          : hasEditors
          ? "border-amber-500/60 ring-1 ring-amber-500/30 bg-amber-950/10"
          : ""
      )}
    >
      {/* Live Editing Presence Indicator */}
      {hasEditors && (
        <div className="mb-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-[10.5px] text-amber-300 font-semibold w-fit animate-pulse">
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>{isBeingEditedBy.map((u) => u.name).join(", ")} is editing live</span>
        </div>
      )}

      {/* Top Header: Drag handle & Priority & Version & Quick Actions */}
      <div className="flex items-center justify-between gap-1 mb-2">
        <div className="flex items-center gap-1.5">
          <button
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="text-zinc-500 hover:text-zinc-300 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-white/5 transition-colors"
            title="Drag to reorder"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>
          <Badge priority={task.priority} dot>
            {task.priority.charAt(0) + task.priority.slice(1).toLowerCase()}
          </Badge>
        </div>

        <div className="flex items-center gap-1">
          {/* OCC Version Tag */}
          <span
            className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 shadow-2xs"
            title="Optimistic Concurrency Version"
          >
            v{task.version}
          </span>

          {/* Card Action Menu Button */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-zinc-400 hover:text-zinc-200 transition-opacity"
              title="Card options"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>

            {isMenuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 mt-1 w-36 bg-zinc-900 border border-zinc-700/80 rounded-lg shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100"
              >
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onClick();
                  }}
                  className="w-full text-left px-2 py-1.5 rounded text-[11px] text-zinc-200 hover:bg-zinc-800 flex items-center gap-2 transition-colors"
                >
                  <ExternalLink className="w-3 h-3 text-blue-400" />
                  <span>Open Details</span>
                </button>

                {onDeleteTask && (
                  <button
                    onClick={handleDelete}
                    className="w-full text-left px-2 py-1.5 rounded text-[11px] text-red-300 hover:bg-red-500/20 flex items-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                    <span>Delete Card</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Title */}
      <h3 className="text-xs font-medium text-zinc-100 line-clamp-2 leading-relaxed group-hover:text-blue-300 transition-colors">
        {task.title}
      </h3>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {task.tags.map((t) => (
            <span
              key={t.tagId}
              className="text-[10px] px-1.5 py-0.2 rounded-md bg-zinc-800/80 text-zinc-300 border border-white/[0.05]"
            >
              #{t.tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Subtask completion bar (if any subtasks exist) */}
      {totalSubtasks > 0 && (
        <div className="mt-2.5">
          <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-1 font-mono">
            <span className="flex items-center gap-1">
              <CheckSquare className="w-3 h-3 text-blue-400" />
              <span>
                {completedSubtasks}/{totalSubtasks}
              </span>
            </span>
            <span>{Math.round((completedSubtasks / totalSubtasks) * 100)}%</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-white/[0.05]">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                completedSubtasks === totalSubtasks
                  ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                  : "bg-gradient-to-r from-blue-500 to-indigo-500"
              )}
              style={{
                width: `${(completedSubtasks / totalSubtasks) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Footer: Due date + Comments/Attachments + Assignees */}
      <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between gap-2">
        {/* Left: Overdue Badge & Counters */}
        <div className="flex items-center gap-2 text-zinc-400">
          {task.dueDate && (
            <span
              className={cn(
                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border",
                overdueInfo.badgeClass
              )}
            >
              <Calendar className="w-2.5 h-2.5" />
              <span>{overdueInfo.label}</span>
            </span>
          )}

          {(task.commentsCount ?? 0) > 0 && (
            <span className="flex items-center gap-1 text-[10.5px] text-zinc-400 hover:text-zinc-200 transition-colors">
              <MessageSquare className="w-3 h-3 text-zinc-500" />
              <span>{task.commentsCount}</span>
            </span>
          )}

          {(task.attachmentsCount ?? 0) > 0 && (
            <span className="flex items-center gap-1 text-[10.5px] text-zinc-400 hover:text-zinc-200 transition-colors">
              <Paperclip className="w-3 h-3 text-zinc-500" />
              <span>{task.attachmentsCount}</span>
            </span>
          )}
        </div>

        {/* Right: Assignees Avatars */}
        <div className="flex items-center -space-x-1.5 overflow-hidden">
          {task.assignees?.map((a) => (
            <Avatar
              key={a.userId}
              name={a.user.name}
              src={a.user.avatarUrl}
              color={a.user.color}
              size="xs"
              className="ring-1.5 ring-[#16161f]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
