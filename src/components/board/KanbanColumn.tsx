"use client";

import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ColumnWithTasks, TaskItem, UserSummary } from "@/types/models";
import { TaskCard } from "./TaskCard";
import { QuickAddTask } from "./QuickAddTask";
import { Plus, MoreHorizontal, CheckCheck, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface KanbanColumnProps {
  column: ColumnWithTasks;
  projectId: string;
  onTaskClick: (task: TaskItem) => void;
  onAddTask: (title: string, columnId: string) => Promise<void>;
  onDeleteTask?: (taskId: string) => void;
  editingMap: Record<string, UserSummary[]>;
}

export function KanbanColumn({
  column,
  projectId,
  onTaskClick,
  onAddTask,
  onDeleteTask,
  editingMap,
}: KanbanColumnProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { toast } = useToast();

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { column },
  });

  const taskIds = column.tasks.map((t) => t.id);

  const handleCopyKey = () => {
    navigator.clipboard?.writeText(column.key);
    toast({
      type: "info",
      title: "Column Key Copied",
      message: `Copied "${column.key}" to clipboard.`,
    });
    setIsMenuOpen(false);
  };

  return (
    <div
      ref={setNodeRef}
      className={`w-76 sm:w-80 shrink-0 bg-[#0e0e14]/90 backdrop-blur-md border rounded-2xl flex flex-col h-full max-h-[calc(100vh-140px)] transition-all duration-200 select-none shadow-xl ${
        isOver
          ? "border-blue-500/80 bg-blue-950/20 ring-2 ring-blue-500/20 shadow-blue-500/10"
          : "border-white/[0.07] hover:border-white/[0.12]"
      }`}
    >
      {/* Column Header */}
      <div className="p-3.5 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full ring-2 ring-white/10"
            style={{ backgroundColor: column.color }}
          />
          <h2 className="text-xs font-semibold text-zinc-100 uppercase tracking-wider">
            {column.name}
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800/90 text-zinc-300 border border-white/[0.08] shadow-xs">
            {column.tasks.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {column.isDone && (
            <span className="text-[10px] text-emerald-300 font-medium bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
              <CheckCheck className="w-3 h-3 text-emerald-400" />
              <span>Done</span>
            </span>
          )}

          {/* Column Menu */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors"
              title="Column settings"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={handleCopyKey}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-zinc-200 hover:bg-zinc-800 transition-colors"
                >
                  Copy Column Key
                </button>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-zinc-400 hover:bg-zinc-800 transition-colors"
                >
                  Close Menu
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Cards List with SortableContext */}
      <div className="p-2.5 flex-1 overflow-y-auto space-y-2.5 min-h-[140px]">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {column.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
              onDeleteTask={onDeleteTask}
              isBeingEditedBy={editingMap[task.id] || []}
            />
          ))}
        </SortableContext>

        {column.tasks.length === 0 && (
          <div className="h-28 border border-dashed border-zinc-800/80 rounded-xl flex flex-col items-center justify-center gap-1.5 text-xs text-zinc-500">
            <Sparkles className="w-4 h-4 text-zinc-600" />
            <span>Drop tasks into this column</span>
          </div>
        )}
      </div>

      {/* Quick Add Card Input */}
      <div className="p-2 border-t border-white/[0.06] bg-zinc-950/40 rounded-b-2xl">
        <QuickAddTask
          columnId={column.id}
          projectId={projectId}
          onAddTask={onAddTask}
        />
      </div>
    </div>
  );
}
