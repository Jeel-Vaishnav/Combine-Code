"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Calendar,
  CheckSquare,
  MessageSquare,
  Paperclip,
  Activity,
  Send,
  CornerDownRight,
  Flame,
  FileText,
  Trash2,
  ExternalLink,
  Plus,
  AlertTriangle,
  FolderKanban,
  Upload,
} from "lucide-react";
import {
  TaskItem,
  UserSummary,
  Priority,
  CommentItem,
  SubtaskItem,
  AttachmentItem,
} from "@/types/models";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";
import { getOverdueBadgeInfo, formatFileSize, formatTimeAgo, cn } from "@/lib/utils";

interface TaskDetailDrawerProps {
  taskId: string | null;
  onClose: () => void;
  currentUser: UserSummary | null;
  allUsers: UserSummary[];
  onPatchTask: (
    taskId: string,
    patch: {
      title?: string;
      description?: string;
      priority?: Priority;
      dueDate?: string | null;
      columnId?: string;
      clientVersion?: number;
      assigneeIds?: string[];
      modifiedByUserId?: string;
    }
  ) => Promise<{ success: boolean; task?: any } | boolean>;
  onStartEditing: (taskId: string) => void;
  onStopEditing: (taskId: string) => void;
  activeEditors: UserSummary[];
  onDeleteTask?: (taskId: string) => void;
  columns?: { id: string; name: string; color: string }[];
}

export function TaskDetailDrawer({
  taskId,
  onClose,
  currentUser,
  allUsers,
  onPatchTask,
  onStartEditing,
  onStopEditing,
  activeEditors,
  onDeleteTask,
  columns = [],
}: TaskDetailDrawerProps) {
  const { toast } = useToast();
  const [task, setTask] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "comments" | "activity">("details");

  // Local editable form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [dueDate, setDueDate] = useState<string>("");
  const [columnId, setColumnId] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [markdownTab, setMarkdownTab] = useState<"edit" | "preview">("edit");

  // Comments & Subtasks local state
  const [commentInput, setCommentInput] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  // Attachment preview & add state
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isAddingAttachment, setIsAddingAttachment] = useState(false);
  const [newAttachmentName, setNewAttachmentName] = useState("");
  const [newAttachmentUrl, setNewAttachmentUrl] = useState("");

  // Confirmation for task deletion
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch full task data whenever taskId changes
  useEffect(() => {
    if (!taskId) {
      setTask(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    fetch(`/api/tasks/${taskId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Task not found");
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        setTask(data);
        setTitle(data.title);
        setDescription(data.description || "");
        setPriority(data.priority);
        setDueDate(data.dueDate ? data.dueDate.split("T")[0] : "");
        setColumnId(data.columnId || "");
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error loading task:", err);
        setIsLoading(false);
      });

    // Notify server that current user started viewing/editing this task
    onStartEditing(taskId);

    return () => {
      isMounted = false;
      onStopEditing(taskId);
    };
  }, [taskId]);

  if (!taskId) return null;

  // Handle saving contested fields (title & description) with clientVersion
  const handleSaveContestedFields = async () => {
    if (!task) return;
    setIsSaving(true);
    try {
      const res = await onPatchTask(task.id, {
        title: title.trim() || task.title,
        description,
        clientVersion: task.version, // Enforces Tier 2 Optimistic Locking
        modifiedByUserId: currentUser?.id,
      });

      const success = typeof res === "boolean" ? res : res.success;
      const updatedTask = typeof res === "object" ? res.task : null;

      if (success) {
        if (updatedTask) {
          setTask(updatedTask);
        } else {
          setTask((prev: any) => ({
            ...prev,
            title: title.trim() || task.title,
            description,
            version: (prev?.version || 1) + 1,
          }));
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Immediate field changes
  const handlePriorityChange = async (newPriority: Priority) => {
    setPriority(newPriority);
    if (!task) return;
    const res = await onPatchTask(task.id, {
      priority: newPriority,
      modifiedByUserId: currentUser?.id,
    });
    const updated = typeof res === "object" ? res.task : null;
    if (updated) {
      setTask(updated);
    } else {
      setTask((prev: any) => ({
        ...prev,
        priority: newPriority,
        version: (prev?.version || 1) + 1,
      }));
    }
  };

  const handleDueDateChange = async (newDate: string) => {
    setDueDate(newDate);
    if (!task) return;
    const formatted = newDate ? new Date(newDate).toISOString() : null;
    const res = await onPatchTask(task.id, {
      dueDate: formatted,
      modifiedByUserId: currentUser?.id,
    });
    const updated = typeof res === "object" ? res.task : null;
    if (updated) {
      setTask(updated);
    } else {
      setTask((prev: any) => ({
        ...prev,
        dueDate: formatted,
        version: (prev?.version || 1) + 1,
      }));
    }
  };

  const handleSetQuickDueDate = (daysFromNow: number | null) => {
    if (daysFromNow === null) {
      handleDueDateChange("");
      return;
    }
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    const dateStr = d.toISOString().split("T")[0];
    handleDueDateChange(dateStr);
  };

  const handleColumnChange = async (newColId: string) => {
    setColumnId(newColId);
    if (!task) return;
    const res = await onPatchTask(task.id, {
      columnId: newColId,
      modifiedByUserId: currentUser?.id,
    });
    const updated = typeof res === "object" ? res.task : null;
    if (updated) {
      setTask(updated);
    } else {
      setTask((prev: any) => ({
        ...prev,
        columnId: newColId,
        version: (prev?.version || 1) + 1,
      }));
    }
    toast({
      type: "success",
      title: "Stage Updated",
      message: "Task moved to new column.",
    });
  };

  // Subtask checkbox toggle
  const handleToggleSubtask = async (subtaskId: string, isCompleted: boolean) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/subtasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subtaskId, isCompleted }),
      });
      if (res.ok) {
        setTask((prev: any) => ({
          ...prev,
          subtasks: prev.subtasks.map((s: SubtaskItem) =>
            s.id === subtaskId ? { ...s, isCompleted } : s
          ),
        }));
      }
    } catch (err) {
      console.error("Failed to toggle subtask:", err);
    }
  };

  // Add new subtask
  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || !taskId) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}/subtasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newSubtaskTitle.trim() }),
      });
      if (res.ok) {
        const created = await res.json();
        setTask((prev: any) => ({
          ...prev,
          subtasks: [...(prev.subtasks || []), created],
        }));
        setNewSubtaskTitle("");
      }
    } catch (err) {
      console.error("Failed to add subtask:", err);
    }
  };

  // Delete subtask
  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/subtasks?subtaskId=${subtaskId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTask((prev: any) => ({
          ...prev,
          subtasks: prev.subtasks.filter((s: SubtaskItem) => s.id !== subtaskId),
        }));
        toast({
          type: "info",
          title: "Subtask Removed",
          message: "Checklist item deleted.",
        });
      }
    } catch (err) {
      console.error("Failed to delete subtask:", err);
    }
  };

  // Add attachment
  const handleAddAttachmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAttachmentName.trim() || !newAttachmentUrl.trim() || !taskId) return;

    try {
      const res = await fetch(`/api/tasks/${taskId}/attachments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newAttachmentName.trim(),
          url: newAttachmentUrl.trim(),
          size: Math.floor(Math.random() * 250000) + 15000,
          mimeType: newAttachmentUrl.endsWith(".png") || newAttachmentUrl.endsWith(".jpg")
            ? "image/png"
            : "text/markdown",
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setTask((prev: any) => ({
          ...prev,
          attachments: [created, ...(prev.attachments || [])],
        }));
        setNewAttachmentName("");
        setNewAttachmentUrl("");
        setIsAddingAttachment(false);
        toast({
          type: "success",
          title: "Attachment Added",
          message: `"${created.name}" attached to task.`,
        });
      }
    } catch (err) {
      console.error("Failed to add attachment:", err);
    }
  };

  // Delete attachment
  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/attachments?attachmentId=${attachmentId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTask((prev: any) => ({
          ...prev,
          attachments: prev.attachments.filter((a: AttachmentItem) => a.id !== attachmentId),
        }));
        toast({
          type: "info",
          title: "Attachment Deleted",
          message: "File attachment removed.",
        });
      }
    } catch (err) {
      console.error("Failed to delete attachment:", err);
    }
  };

  // Delete task
  const handleDeleteTask = async () => {
    if (!taskId) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (res.ok) {
        toast({
          type: "success",
          title: "Task Deleted",
          message: `Task ${task?.title || ""} has been deleted.`,
        });
        if (onDeleteTask) onDeleteTask(taskId);
        onClose();
      }
    } catch (err) {
      console.error("Failed to delete task:", err);
      toast({
        type: "error",
        title: "Delete Failed",
        message: "Could not delete this task.",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Add Comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim() || !taskId || !currentUser) return;

    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: commentInput.trim(),
          authorId: currentUser.id,
          parentId: replyToId,
        }),
      });

      if (res.ok) {
        const newComment = await res.json();
        setCommentInput("");
        setReplyToId(null);

        // Update local comment tree
        setTask((prev: any) => {
          if (!prev) return prev;
          if (newComment.parentId) {
            const addReply = (comments: any[]): any[] =>
              comments.map((c) => {
                if (c.id === newComment.parentId) {
                  return { ...c, replies: [...(c.replies || []), newComment] };
                }
                if (c.replies && c.replies.length > 0) {
                  return { ...c, replies: addReply(c.replies) };
                }
                return c;
              });
            return { ...prev, comments: addReply(prev.comments || []) };
          }
          return { ...prev, comments: [...(prev.comments || []), newComment] };
        });
      }
    } catch (err) {
      console.error("Failed to post comment:", err);
    }
  };

  const overdueInfo = getOverdueBadgeInfo(task?.dueDate);
  const completedSubtasks = task?.subtasks?.filter((s: any) => s.isCompleted).length || 0;
  const totalSubtasks = task?.subtasks?.length || 0;
  const subtaskProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
  const otherEditors = activeEditors.filter((u) => u.id !== currentUser?.id);

  return (
    <>
      {/* Slide-over backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 transition-opacity animate-in fade-in duration-150"
      />

      {/* Slide-over Drawer Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-2xl bg-[#0c0c11] border-l border-zinc-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-white/[0.08] bg-zinc-950/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-zinc-400">
              TASK-{taskId.slice(-4).toUpperCase()}
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
              v{task?.version || 1}
            </span>

            {otherEditors.length > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-[11px] text-amber-300 font-semibold animate-pulse">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>{otherEditors.map((u) => u.name).join(", ")} is also editing!</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              title="Delete this task"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>

            <Button
              variant="primary"
              size="sm"
              isLoading={isSaving}
              onClick={handleSaveContestedFields}
            >
              Save Changes
            </Button>

            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-4 px-5 border-b border-white/[0.06] bg-zinc-950/40 text-xs">
          <button
            onClick={() => setActiveTab("details")}
            className={cn(
              "py-3 font-semibold border-b-2 transition-colors cursor-pointer",
              activeTab === "details"
                ? "border-blue-500 text-zinc-100"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            )}
          >
            Details & Specs
          </button>
          <button
            onClick={() => setActiveTab("comments")}
            className={cn(
              "py-3 font-semibold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer",
              activeTab === "comments"
                ? "border-blue-500 text-zinc-100"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            )}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Comments ({task?.comments?.length || 0})</span>
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={cn(
              "py-3 font-semibold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer",
              activeTab === "activity"
                ? "border-blue-500 text-zinc-100"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            )}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Activity Trail</span>
          </button>
        </div>

        {/* Drawer Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {isLoading ? (
            <div className="py-20 text-center text-xs text-zinc-400">Loading task details...</div>
          ) : !task ? (
            <div className="py-20 text-center text-xs text-zinc-400">Task not found</div>
          ) : activeTab === "details" ? (
            <>
              {/* Contested Field: Title */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-zinc-400 mb-1.5">
                  Title (Contested Field)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                      handleSaveContestedFields();
                    }
                  }}
                  className="w-full text-base font-semibold bg-zinc-900 border border-zinc-700/80 rounded-xl px-3.5 py-2 text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
                />
              </div>

              {/* Metadata Attributes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-zinc-900/60 border border-white/[0.08] rounded-xl text-xs">
                {/* Column / Stage Selector */}
                {columns.length > 0 && (
                  <div>
                    <span className="text-[10px] text-zinc-400 font-semibold block mb-1">Stage</span>
                    <select
                      value={columnId}
                      onChange={(e) => handleColumnChange(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg px-2 py-1 text-zinc-200 text-xs focus:outline-none"
                    >
                      {columns.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Priority */}
                <div>
                  <span className="text-[10px] text-zinc-400 font-semibold block mb-1">Priority</span>
                  <select
                    value={priority}
                    onChange={(e) => handlePriorityChange(e.target.value as Priority)}
                    className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg px-2 py-1 text-zinc-200 text-xs focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                {/* Due Date */}
                <div>
                  <span className="text-[10px] text-zinc-400 font-semibold block mb-1">Due Date</span>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => handleDueDateChange(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700/80 rounded-lg px-2 py-1 text-zinc-200 text-xs focus:outline-none"
                  />
                </div>

                {/* Deadline Badge */}
                <div>
                  <span className="text-[10px] text-zinc-400 font-semibold block mb-1">Status</span>
                  <div
                    className={cn(
                      "px-2 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1.5 h-6.5",
                      overdueInfo.badgeClass
                    )}
                  >
                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", overdueInfo.dotClass)} />
                    <span className="truncate">{overdueInfo.label}</span>
                  </div>
                </div>
              </div>

              {/* Quick Due Date Presets */}
              <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                <span className="font-semibold text-zinc-400">Quick Presets:</span>
                <button
                  type="button"
                  onClick={() => handleSetQuickDueDate(0)}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => handleSetQuickDueDate(1)}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => handleSetQuickDueDate(7)}
                  className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                >
                  In 1 Week
                </button>
                {dueDate && (
                  <button
                    type="button"
                    onClick={() => handleSetQuickDueDate(null)}
                    className="px-2 py-0.5 rounded bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 transition-colors"
                  >
                    Clear Date
                  </button>
                )}
              </div>

              {/* Subtasks Checklist */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-blue-400" />
                    <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                      Subtasks Checklist ({completedSubtasks}/{totalSubtasks})
                    </h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-zinc-400">{subtaskProgress}%</span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden mb-3 border border-white/[0.05]">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${subtaskProgress}%` }}
                  />
                </div>

                {/* Subtask list */}
                <div className="space-y-1.5 mb-2">
                  {task.subtasks?.map((subtask: SubtaskItem) => (
                    <div
                      key={subtask.id}
                      className="group flex items-center justify-between gap-2.5 p-2 rounded-lg hover:bg-zinc-900/80 border border-transparent hover:border-zinc-800 transition-colors text-xs"
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={subtask.isCompleted}
                          onChange={(e) => handleToggleSubtask(subtask.id, e.target.checked)}
                          className="rounded border-zinc-700 text-blue-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer shrink-0"
                        />
                        <span
                          className={cn(
                            "flex-1 text-zinc-200 transition-all truncate",
                            subtask.isCompleted && "line-through text-zinc-500"
                          )}
                        >
                          {subtask.title}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteSubtask(subtask.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 transition-opacity"
                        title="Delete subtask"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Subtask Form */}
                <form onSubmit={handleAddSubtask} className="flex gap-2">
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="Add a new checklist item... (Press Enter to add)"
                    className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
                  />
                  <Button type="submit" variant="secondary" size="sm">
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </form>
              </div>

              {/* Contested Field: Markdown Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
                    Markdown Description (Contested Field)
                  </label>
                  <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setMarkdownTab("edit")}
                      className={cn(
                        "px-2.5 py-0.5 rounded-md font-medium cursor-pointer transition-colors",
                        markdownTab === "edit"
                          ? "bg-zinc-800 text-zinc-100 shadow-xs"
                          : "text-zinc-400 hover:text-zinc-200"
                      )}
                    >
                      Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setMarkdownTab("preview")}
                      className={cn(
                        "px-2.5 py-0.5 rounded-md font-medium cursor-pointer transition-colors",
                        markdownTab === "preview"
                          ? "bg-zinc-800 text-zinc-100 shadow-xs"
                          : "text-zinc-400 hover:text-zinc-200"
                      )}
                    >
                      Preview
                    </button>
                  </div>
                </div>

                {markdownTab === "edit" ? (
                  <div className="relative">
                    <textarea
                      rows={8}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                          handleSaveContestedFields();
                        }
                      }}
                      placeholder="Write engineering specifications, code blocks, or acceptance criteria... (Ctrl+Enter to save)"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs font-mono text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors leading-relaxed resize-y"
                    />
                    <span className="absolute bottom-2.5 right-3 text-[10px] text-zinc-500 font-mono">
                      Ctrl + Enter to save
                    </span>
                  </div>
                ) : (
                  <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl text-xs text-zinc-300 prose prose-invert max-w-none min-h-[160px] whitespace-pre-wrap leading-relaxed font-sans">
                    {description || <span className="text-zinc-500 italic">No description provided.</span>}
                  </div>
                )}
              </div>

              {/* Attachments Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-blue-400" />
                    <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                      Attachments ({task.attachments?.length || 0})
                    </h4>
                  </div>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => setIsAddingAttachment(!isAddingAttachment)}
                    className="gap-1 text-[11px]"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Attachment</span>
                  </Button>
                </div>

                {/* Inline Add Attachment Form */}
                {isAddingAttachment && (
                  <form
                    onSubmit={handleAddAttachmentSubmit}
                    className="p-3 mb-3 bg-zinc-900/90 border border-zinc-700/80 rounded-xl space-y-2 text-xs animate-in fade-in duration-150"
                  >
                    <div className="font-semibold text-zinc-200 text-xs">Add File / URL Attachment</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="File name (e.g. system_architecture.png)"
                        value={newAttachmentName}
                        onChange={(e) => setNewAttachmentName(e.target.value)}
                        className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-blue-500"
                      />
                      <input
                        type="text"
                        required
                        placeholder="File URL or path"
                        value={newAttachmentUrl}
                        onChange={(e) => setNewAttachmentUrl(e.target.value)}
                        className="px-2.5 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-200 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => setIsAddingAttachment(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" variant="primary" size="xs">
                        Attach File
                      </Button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {task.attachments?.map((att: AttachmentItem) => (
                    <div
                      key={att.id}
                      className="group flex items-center justify-between gap-2 p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-colors text-xs"
                    >
                      <div
                        onClick={() => {
                          if (att.mimeType.startsWith("image/")) {
                            setPreviewImageUrl(att.url);
                          }
                        }}
                        className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                      >
                        <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                        <div className="flex-1 truncate">
                          <div className="text-zinc-200 font-medium truncate group-hover:text-blue-300">
                            {att.name}
                          </div>
                          <div className="text-[10px] text-zinc-500">
                            {formatFileSize(att.size)} • {att.mimeType}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {att.mimeType.startsWith("image/") && (
                          <button
                            type="button"
                            onClick={() => setPreviewImageUrl(att.url)}
                            className="p-1 text-zinc-400 hover:text-blue-400"
                            title="Preview image"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteAttachment(att.id)}
                          className="p-1 text-zinc-500 hover:text-red-400"
                          title="Delete attachment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : activeTab === "comments" ? (
            /* Threaded Comments Tab */
            <div className="space-y-4">
              {/* Comment Input */}
              <form onSubmit={handleAddComment} className="flex flex-col gap-2">
                {replyToId && (
                  <div className="flex items-center justify-between text-[11px] bg-zinc-900 px-3 py-1.5 rounded-lg text-zinc-400 border border-zinc-800">
                    <span>Replying to comment thread...</span>
                    <button
                      type="button"
                      onClick={() => setReplyToId(null)}
                      className="text-zinc-400 hover:text-zinc-200 font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                        handleAddComment(e);
                      }
                    }}
                    placeholder={
                      currentUser
                        ? `Comment as ${currentUser.name}... (Ctrl+Enter to post)`
                        : "Write a comment..."
                    }
                    className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                  />
                  <Button type="submit" variant="primary" size="md" className="self-end gap-1.5">
                    <Send className="w-3.5 h-3.5" />
                    <span>Post</span>
                  </Button>
                </div>
              </form>

              {/* Comment Stream */}
              <div className="space-y-3 pt-2">
                {task.comments?.length === 0 ? (
                  <div className="text-center py-12 text-xs text-zinc-500">
                    No comments yet. Start the conversation with your team!
                  </div>
                ) : (
                  task.comments?.map((comment: CommentItem) => (
                    <div
                      key={comment.id}
                      className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2 text-xs shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar
                            name={comment.author.name}
                            src={comment.author.avatarUrl}
                            color={comment.author.color}
                            size="xs"
                          />
                          <span className="font-semibold text-zinc-200">
                            {comment.author.name}
                          </span>
                          <span className="text-[10px] text-zinc-500">
                            {formatTimeAgo(comment.createdAt)}
                          </span>
                        </div>
                        <button
                          onClick={() => setReplyToId(comment.id)}
                          className="text-[11px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
                        >
                          <CornerDownRight className="w-3 h-3" />
                          <span>Reply</span>
                        </button>
                      </div>

                      <div className="text-zinc-300 whitespace-pre-wrap pl-7 leading-relaxed">
                        {comment.content}
                      </div>

                      {/* Threaded nested replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="pl-7 pt-2 space-y-2 border-l-2 border-zinc-800 ml-3">
                          {comment.replies.map((reply: CommentItem) => (
                            <div
                              key={reply.id}
                              className="p-2.5 rounded-lg bg-zinc-900/90 border border-zinc-800/60 text-xs"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <Avatar
                                  name={reply.author.name}
                                  src={reply.author.avatarUrl}
                                  color={reply.author.color}
                                  size="xs"
                                />
                                <span className="font-semibold text-zinc-200">
                                  {reply.author.name}
                                </span>
                                <span className="text-[10px] text-zinc-500">
                                  {formatTimeAgo(reply.createdAt)}
                                </span>
                              </div>
                              <div className="text-zinc-300 whitespace-pre-wrap pl-6 leading-relaxed">
                                {reply.content}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* Immutable Activity Audit Trail */
            <div className="space-y-2">
              {task.activities?.length === 0 ? (
                <div className="text-center py-12 text-xs text-zinc-500">No activity logged yet.</div>
              ) : (
                task.activities?.map((act: any) => {
                  let detailsObj: any = {};
                  try {
                    detailsObj = JSON.parse(act.details);
                  } catch {
                    detailsObj = {};
                  }
                  return (
                    <div
                      key={act.id}
                      className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/80 flex items-start gap-2.5 text-xs"
                    >
                      <Avatar
                        name={act.user.name}
                        src={act.user.avatarUrl}
                        color={act.user.color}
                        size="xs"
                      />
                      <div className="flex-1">
                        <div className="text-zinc-200">
                          <span className="font-semibold text-blue-300">{act.user.name}</span>{" "}
                          <span className="text-zinc-400">
                            {act.action === "TASK_CREATED" && "created this task"}
                            {act.action === "TASK_MOVED" &&
                              `moved task to ${detailsObj.toColumn || "another stage"}`}
                            {act.action === "TASK_UPDATED" && "updated task specifications"}
                            {act.action === "COMMENT_ADDED" && "added a comment"}
                            {act.action === "CONFLICT_RESOLVED" &&
                              "resolved a 3-way concurrency conflict"}
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">
                          {formatTimeAgo(act.createdAt)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="relative max-w-sm w-full rounded-2xl border border-red-500/40 bg-zinc-950 p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">Delete Task?</h3>
                <p className="text-xs text-zinc-400">
                  This action is permanent and cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-300">
              Are you sure you want to delete <strong className="text-white">&quot;{task?.title}&quot;</strong>?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={isDeleting}
                onClick={handleDeleteTask}
              >
                Delete Permanently
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Attachment Image Preview Modal */}
      {previewImageUrl && (
        <div
          onClick={() => setPreviewImageUrl(null)}
          className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm"
        >
          <div className="relative max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl">
            <button
              onClick={() => setPreviewImageUrl(null)}
              className="absolute top-4 right-4 bg-zinc-900/90 p-1.5 rounded-full text-zinc-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImageUrl}
              alt="Attachment Preview"
              className="max-h-[80vh] w-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </>
  );
}
