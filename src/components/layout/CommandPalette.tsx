"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Kanban,
  TableProperties,
  BarChart3,
  Plus,
  AlertTriangle,
  FolderGit2,
  User,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { TaskItem, UserSummary } from "@/types/models";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: TaskItem[];
  projects: { id: string; name: string; slug: string }[];
  currentProjectId: string | null;
  onSelectProject: (id: string) => void;
  onSelectTask: (task: TaskItem) => void;
  onSelectView: (view: "board" | "list" | "dashboard") => void;
  onOpenNewTaskModal: () => void;
  onSimulateConflict: () => void;
  allUsers: UserSummary[];
  onSwitchUser: (user: UserSummary) => void;
}

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  icon: React.ReactNode;
  run: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  tasks,
  projects,
  currentProjectId,
  onSelectProject,
  onSelectTask,
  onSelectView,
  onOpenNewTaskModal,
  onSimulateConflict,
  allUsers,
  onSwitchUser,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else setSelectedIndex(0);
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Build commands
  const defaultActions: CommandItem[] = [
    {
      id: "action-new-task",
      title: "Create New Task",
      category: "Actions",
      icon: <Plus className="w-4 h-4 text-blue-400" />,
      run: () => {
        onClose();
        onOpenNewTaskModal();
      },
    },
    {
      id: "action-view-board",
      title: "Switch to Kanban Board View",
      category: "Navigation",
      icon: <Kanban className="w-4 h-4 text-indigo-400" />,
      run: () => {
        onClose();
        onSelectView("board");
      },
    },
    {
      id: "action-view-list",
      title: "Switch to High-Density List / Table View",
      category: "Navigation",
      icon: <TableProperties className="w-4 h-4 text-emerald-400" />,
      run: () => {
        onClose();
        onSelectView("list");
      },
    },
    {
      id: "action-view-dashboard",
      title: "Switch to Executive Health Dashboard",
      category: "Navigation",
      icon: <BarChart3 className="w-4 h-4 text-amber-400" />,
      run: () => {
        onClose();
        onSelectView("dashboard");
      },
    },
    {
      id: "action-simulate-conflict",
      title: "Simulate OCC 3-Way Race Condition (HTTP 409)",
      category: "Actions",
      icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
      run: () => {
        onClose();
        onSimulateConflict();
      },
    },
  ];

  // Project switch items
  const projectActions: CommandItem[] = projects.map((p) => ({
    id: `project-${p.id}`,
    title: `Go to Project: ${p.name}`,
    category: "Projects",
    icon: <FolderGit2 className="w-4 h-4 text-blue-400" />,
    run: () => {
      onClose();
      onSelectProject(p.id);
    },
  }));

  // Teammate switch items
  const userActions: CommandItem[] = allUsers.map((u) => ({
    id: `user-${u.id}`,
    title: `Switch User: ${u.name} (${u.role})`,
    category: "Teammates",
    icon: <Avatar name={u.name} src={u.avatarUrl} color={u.color} size="xs" />,
    run: () => {
      onClose();
      onSwitchUser(u);
    },
  }));

  // Task search items
  const taskActions: CommandItem[] = tasks.map((t) => ({
    id: `task-${t.id}`,
    title: t.title,
    subtitle: `v${t.version} • ${t.priority} • ${t.subtasks?.length || 0} subtasks`,
    category: "Tasks",
    icon: <Badge priority={t.priority} dot>{t.priority}</Badge>,
    run: () => {
      onClose();
      onSelectTask(t);
    },
  }));

  const allItems: CommandItem[] = [...defaultActions, ...projectActions, ...userActions, ...taskActions];

  const filteredItems = query.trim()
    ? allItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          (item.subtitle && item.subtitle.toLowerCase().includes(query.toLowerCase())) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      )
    : allItems;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = filteredItems[selectedIndex];
      if (selected) {
        selected.run();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-start justify-center pt-20 p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in duration-150"
      />

      {/* Palette Box */}
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150 flex flex-col max-h-[75vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-800 bg-zinc-900/60">
          <Search className="w-4 h-4 text-blue-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, project, teammate, or search tasks..."
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
          />
          <span className="kbd-shortcut">Esc to close</span>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-2 space-y-1 flex-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-zinc-500">
              No matching commands or tasks found for &quot;{query}&quot;
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => item.run()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    "flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all duration-150 text-xs",
                    isSelected
                      ? "bg-blue-600/20 border border-blue-500/40 text-blue-200 shadow-sm"
                      : "text-zinc-300 hover:bg-zinc-900/60 border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="shrink-0">{item.icon}</div>
                    <div className="truncate">
                      <div className="font-medium truncate text-zinc-100">{item.title}</div>
                      {item.subtitle && (
                        <div className="text-[10px] text-zinc-400 truncate">{item.subtitle}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                      {item.category}
                    </span>
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-blue-400" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 bg-zinc-900/60 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="kbd-shortcut mr-1">↑</kbd>
              <kbd className="kbd-shortcut mr-1">↓</kbd>
              Navigate
            </span>
            <span>
              <kbd className="kbd-shortcut mr-1">Enter</kbd> Select
            </span>
          </div>
          <span className="flex items-center gap-1 text-zinc-400">
            <Sparkles className="w-3 h-3 text-blue-400" />
            Quick Command Gateway
          </span>
        </div>
      </div>
    </div>
  );
}
