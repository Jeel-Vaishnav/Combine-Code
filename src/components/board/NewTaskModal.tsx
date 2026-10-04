"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Priority, ColumnWithTasks, UserSummary } from "@/types/models";
import { Avatar } from "@/components/ui/Avatar";
import { Plus, Calendar, Tag, UserCheck, Sparkles } from "lucide-react";

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: ColumnWithTasks[];
  allUsers: UserSummary[];
  projectId: string;
  onCreateTask: (data: {
    projectId: string;
    columnId: string;
    title: string;
    description?: string;
    priority: Priority;
    dueDate?: string | null;
    assigneeIds?: string[];
  }) => Promise<void>;
}

export function NewTaskModal({
  isOpen,
  onClose,
  columns,
  allUsers,
  projectId,
  onCreateTask,
}: NewTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [columnId, setColumnId] = useState(columns[0]?.id || "");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (columns.length > 0 && !columnId) {
      setColumnId(columns[0].id);
    }
  }, [columns, columnId]);

  if (!isOpen) return null;

  const toggleAssignee = (userId: string) => {
    setSelectedAssigneeIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSetQuickDueDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setDueDate(d.toISOString().split("T")[0]);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim() || !columnId || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onCreateTask({
        projectId,
        columnId,
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        assigneeIds: selectedAssigneeIds,
      });

      // Reset
      setTitle("");
      setDescription("");
      setDueDate("");
      setSelectedAssigneeIds([]);
      onClose();
    } catch (err) {
      console.error("Failed to create task:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
            <Plus className="w-3.5 h-3.5" />
          </div>
          <span>Create New Engineering Task</span>
        </div>
      }
      description="Define specifications, deadline, priority, and assign Indian engineers."
      maxWidth="lg"
      className="border-white/10 shadow-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1.5">
            Task Title *
          </label>
          <input
            type="text"
            required
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Implement distributed tracing pipeline for WebSocket sessions"
            className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 shadow-inner"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1">
              Target Stage / Column
            </label>
            <select
              value={columnId}
              onChange={(e) => setColumnId(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-blue-500"
            >
              {columns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1">
              Priority Level
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-blue-500"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent (P0 Critical)</option>
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-semibold uppercase text-zinc-400">
              Due Date
            </label>
            <div className="flex items-center gap-1.5 text-[10px]">
              <button
                type="button"
                onClick={() => handleSetQuickDueDate(1)}
                className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => handleSetQuickDueDate(3)}
                className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              >
                +3 Days
              </button>
              <button
                type="button"
                onClick={() => handleSetQuickDueDate(7)}
                className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
              >
                +1 Week
              </button>
            </div>
          </div>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Assignees */}
        <div>
          <label className="block text-[11px] font-semibold uppercase text-zinc-400 mb-1.5">
            Assign Team Members
          </label>
          <div className="flex flex-wrap gap-2">
            {allUsers.map((u) => {
              const isSelected = selectedAssigneeIds.includes(u.id);
              return (
                <button
                  type="button"
                  key={u.id}
                  onClick={() => toggleAssignee(u.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-blue-600/20 border-blue-500/60 text-blue-200 shadow-sm"
                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                  }`}
                >
                  <Avatar name={u.name} src={u.avatarUrl} color={u.color} size="xs" />
                  <span className="font-medium">{u.name}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">({u.role})</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-semibold uppercase text-zinc-400">
              Markdown Technical Description
            </label>
            <span className="text-[10px] font-mono text-zinc-500">Ctrl + Enter to submit</span>
          </div>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                handleSubmit();
              }
            }}
            placeholder="Detailed architectural specifications, acceptance criteria, or code references..."
            className="w-full bg-zinc-950 border border-zinc-700/80 rounded-xl p-3 text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500 resize-y leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            className="gap-1.5 shadow-md shadow-blue-600/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Task</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
