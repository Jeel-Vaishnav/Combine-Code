"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronDown,
  Plus,
  Bell,
  CheckCircle2,
  Circle,
  Clock,
  MoreHorizontal,
  Flame,
  Check,
  TrendingDown,
  Calendar,
  Sparkles,
  ExternalLink,
  Edit2,
  Maximize2,
  Minimize2,
  Filter,
  CheckSquare,
  Download,
  RefreshCw,
  Video,
  Layers,
  ArrowRight,
  X,
  Trash2,
  ListTodo,
  LogOut,
  Hash,
  Share2,
  ShieldCheck,
  MessageCircle,
  Send,
} from "lucide-react";
import { TaskItem, UserSummary, ColumnWithTasks } from "@/types/models";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

interface GlassmorphicDashboardProps {
  currentProject: { id: string; name: string; slug: string; code?: string; description?: string; ownerId?: string } | null;
  projects: { id: string; name: string; slug: string; code?: string; description?: string; ownerId?: string }[];
  onSelectProject: (projectId: string) => void;
  currentUser: UserSummary | null;
  allUsers: UserSummary[];
  onSwitchUser?: (user: UserSummary) => void;
  onLogout?: () => void;
  onOpenCreateProjectModal?: () => void;
  onOpenProjectAccessModal?: () => void;
  tasks: TaskItem[];
  onTaskClick: (task: TaskItem) => void;
  onOpenNewTaskModal: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onFilterByTag?: (tag: string) => void;
  onToggleTaskDone?: (taskId: string) => void;
}

export interface PersonalTodoItem {
  id: string;
  title: string;
  isCompleted: boolean;
  tag?: string;
  dueDate?: string;
  createdAt: string;
}

export const DEFAULT_USER_TODOS: Record<string, PersonalTodoItem[]> = {
  usr_jeel: [
    {
      id: "todo_j1",
      title: "Review pull requests from Aarav and Lakshya",
      isCompleted: true,
      tag: "Code Review",
      dueDate: "Today",
      createdAt: new Date().toISOString(),
    },
    {
      id: "todo_j2",
      title: "Architect WebSocket sync layer for real-time rooms",
      isCompleted: false,
      tag: "Architecture",
      dueDate: "Today",
      createdAt: new Date().toISOString(),
    },
    {
      id: "todo_j3",
      title: "Prepare sprint demo for client presentation",
      isCompleted: false,
      tag: "Planning",
      dueDate: "Tomorrow",
      createdAt: new Date().toISOString(),
    },
  ],
  usr_aarav: [
    {
      id: "todo_a1",
      title: "Refactor Kanban drag-and-drop smooth animations",
      isCompleted: true,
      tag: "Frontend",
      dueDate: "Today",
      createdAt: new Date().toISOString(),
    },
    {
      id: "todo_a2",
      title: "Connect API Docs and endpoint specifications",
      isCompleted: false,
      tag: "API Docs",
      dueDate: "Today",
      createdAt: new Date().toISOString(),
    },
    {
      id: "todo_a3",
      title: "Fix mobile responsiveness on dashboard widgets",
      isCompleted: false,
      tag: "UI/UX",
      dueDate: "Tomorrow",
      createdAt: new Date().toISOString(),
    },
  ],
  usr_lakshya: [
    {
      id: "todo_l1",
      title: "Implement Optimistic Concurrency Control (OCC) logic",
      isCompleted: true,
      tag: "Backend",
      dueDate: "Today",
      createdAt: new Date().toISOString(),
    },
    {
      id: "todo_l2",
      title: "Optimize Prisma batch queries for column position indexing",
      isCompleted: false,
      tag: "Database",
      dueDate: "Today",
      createdAt: new Date().toISOString(),
    },
    {
      id: "todo_l3",
      title: "Benchmark Redis cache latency under load",
      isCompleted: false,
      tag: "Performance",
      dueDate: "In 2 days",
      createdAt: new Date().toISOString(),
    },
  ],
  usr_priya: [
    {
      id: "todo_p1",
      title: "Finalize glassmorphism color palette and contrast ratio",
      isCompleted: true,
      tag: "Design",
      dueDate: "Today",
      createdAt: new Date().toISOString(),
    },
    {
      id: "todo_p2",
      title: "Create wireframes for sprint burndown analytics",
      isCompleted: false,
      tag: "Figma",
      dueDate: "Today",
      createdAt: new Date().toISOString(),
    },
    {
      id: "todo_p3",
      title: "Review user feedback on task detail drawer",
      isCompleted: false,
      tag: "Research",
      dueDate: "Tomorrow",
      createdAt: new Date().toISOString(),
    },
  ],
  usr_rohan: [
    {
      id: "todo_r1",
      title: "Automate end-to-end OCC concurrency test suite",
      isCompleted: true,
      tag: "QA",
      dueDate: "Today",
      createdAt: new Date().toISOString(),
    },
    {
      id: "todo_r2",
      title: "Configure Docker deployment container & secrets",
      isCompleted: false,
      tag: "DevOps",
      dueDate: "Today",
      createdAt: new Date().toISOString(),
    },
    {
      id: "todo_r3",
      title: "Set up CI/CD pipeline health checks",
      isCompleted: false,
      tag: "Infra",
      dueDate: "In 3 days",
      createdAt: new Date().toISOString(),
    },
  ],
};

export function GlassmorphicDashboard({
  currentProject,
  projects,
  onSelectProject,
  currentUser,
  allUsers,
  onSwitchUser,
  onLogout,
  onOpenCreateProjectModal,
  onOpenProjectAccessModal,
  tasks,
  onTaskClick,
  onOpenNewTaskModal,
  isFullscreen = false,
  onToggleFullscreen,
  onFilterByTag,
  onToggleTaskDone,
  projectBoard,
}: GlassmorphicDashboardProps & { projectBoard: any }) {
  const { toast } = useToast();


  // Dropdown states
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(2);

  // Chat system states
  const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    sender: UserSummary;
    text: string;
    time: string;
    isRead: boolean;
  }>>([]);
  const [chatInput, setChatInput] = useState("");

  // Widget Option Menus
  const [isBurndownMenuOpen, setIsBurndownMenuOpen] = useState(false);
  const [isCalendarMenuOpen, setIsCalendarMenuOpen] = useState(false);
  const [isActivityMenuOpen, setIsActivityMenuOpen] = useState(false);
  // Hover state for indicator transformation (line to circle)
  const [isIndicatorHovered, setIsIndicatorHovered] = useState(false);

  // Calendar interactive state
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<string>("Tu");

  // Burndown interactive hover state
  const [hoveredBurndownPoint, setHoveredBurndownPoint] = useState<{
    day: string;
    points: number;
    ideal: number;
  } | null>(null);

  // Interactive Rainbow Arc Metric Carousel - Team Members only
  const METRICS = [
    { title: "Team Members", percent: 0, label: "0", target: `${allUsers.length}`, desc: `${allUsers.length} members` },
  ];
  const [activeMetricIdx, setActiveMetricIdx] = useState(0);
  const currentMetric = METRICS[activeMetricIdx];

  // Mathematical calculation for dot position along semi-circular arch (Radius: 80, Center: 100, 90)
  // Handle Team Members metric (count-based)
  let percentValue = 0;
  if (currentMetric.title === "Team Members") {
    // For team members, calculate percentage based on expected core team size (4 members: Jeel, Aarav, Priya, Lakshya)
    const expectedCoreTeam = 4;
    const coreTeamMembers = [
      allUsers.find((u) => u.name.toLowerCase().includes("jeel")),
      allUsers.find((u) => u.name.toLowerCase().includes("aarav")),
      allUsers.find((u) => u.name.toLowerCase().includes("priya")),
      allUsers.find((u) => u.name.toLowerCase().includes("lakshya"))
    ].filter(Boolean); // Remove null/undefined values

    const teamMemberPercent = Math.min((coreTeamMembers.length / expectedCoreTeam) * 100, 100);
    percentValue = teamMemberPercent;
  }

  const angle = Math.PI * (1 - percentValue / 100);
  const dotX = 100 + 80 * Math.cos(angle);
  const dotY = 90 - 80 * Math.sin(angle);

  const activeUserId = currentUser?.id || "usr_jeel";

  // Per-person customizable To-Do List state (persisted in localStorage per user)
  const [todos, setTodos] = useState<PersonalTodoItem[]>([]);
  const [todoFilter, setTodoFilter] = useState<"ALL" | "ACTIVE" | "DONE">("ALL");
  const [newTodoText, setNewTodoText] = useState("");
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [editingTodoText, setEditingTodoText] = useState("");

  // Sync / load to-do list from localStorage for current user persona
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storageKey = `algothon_user_todos_${activeUserId}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTodos(parsed);
            return;
          }
        } catch {
          // fallback
        }
      }
      const initial = DEFAULT_USER_TODOS[activeUserId] || DEFAULT_USER_TODOS["usr_jeel"] || [];
      setTodos(initial);
      localStorage.setItem(storageKey, JSON.stringify(initial));
    }
  }, [activeUserId]);

  // Reset calendar events when project changes to ensure clean state for new projects
  useEffect(() => {
    setCalendarEvents({});
  }, [currentProject?.id]);

  const saveTodos = (updatedList: PersonalTodoItem[]) => {
    setTodos(updatedList);
    if (typeof window !== "undefined") {
      localStorage.setItem(`algothon_user_todos_${activeUserId}`, JSON.stringify(updatedList));
    }
  };

  const handleToggleTodo = (id: string) => {
    const updated = todos.map((t) => {
      if (t.id === id) {
        const nextState = !t.isCompleted;
        toast({
          type: nextState ? "success" : "info",
          title: nextState ? "To-Do Completed! 🎉" : "To-Do Reopened",
          message: `"${t.title}" updated for ${currentUser?.name || "you"}.`,
        });
        return { ...t, isCompleted: nextState };
      }
      return t;
    });
    saveTodos(updated);
  };

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;

    const newTodo: PersonalTodoItem = {
      id: `todo_${Date.now()}`,
      title: newTodoText.trim(),
      isCompleted: false,
      tag: "Personal",
      dueDate: "Today",
      createdAt: new Date().toISOString(),
    };

    const updated = [newTodo, ...todos];
    saveTodos(updated);
    setNewTodoText("");

    toast({
      type: "success",
      title: "To-Do Added",
      message: `"${newTodo.title}" added to your personal list.`,
    });
  };

  const handleSaveEditTodo = (id: string) => {
    if (!editingTodoText.trim()) {
      setEditingTodoId(null);
      return;
    }
    const updated = todos.map((t) => (t.id === id ? { ...t, title: editingTodoText.trim() } : t));
    saveTodos(updated);
    setEditingTodoId(null);
    toast({
      type: "info",
      title: "To-Do Updated",
      message: "Changes saved to your personal list.",
    });
  };

  const handleDeleteTodo = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = todos.filter((t) => t.id !== id);
    saveTodos(updated);
    toast({
      type: "info",
      title: "To-Do Removed",
      message: `"${title}" removed from your list.`,
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMessage = {
      id: `msg_${Date.now()}`,
      sender: currentUser || { id: "usr_jeel", name: "Jeel Vaishnav", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jeel", role: "LEAD", color: "#9f1239" },
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: true,
    };

    setChatMessages([...chatMessages, newMessage]);
    setChatInput("");

    toast({
      type: "success",
      title: "Message Sent",
      message: "Your message has been delivered to the team.",
    });
  };

  const filteredTodos = useMemo(() => {
    if (todoFilter === "ACTIVE") return todos.filter((t) => !t.isCompleted);
    if (todoFilter === "DONE") return todos.filter((t) => t.isCompleted);
    return todos;
  }, [todos, todoFilter]);

  const overdueCount = tasks.filter((t) => t.dueDate && new Date(t.dueDate).getTime() < Date.now()).length;

  // Resolve team members for authentic photo avatars matching screenshot
  const jeelUser = allUsers.find((u) => u.name.toLowerCase().includes("jeel")) || currentUser;
  const aaravUser = allUsers.find((u) => u.name.toLowerCase().includes("aarav"));
  const priyaUser = allUsers.find((u) => u.name.toLowerCase().includes("priya"));
  const lakshyaUser = allUsers.find((u) => u.name.toLowerCase().includes("lakshya"));

  // Burndown chart data points
  const burndownPoints = [
    { day: "Day 1", x: 5, y: 12, points: 100, ideal: 100 },
    { day: "Day 2", x: 28, y: 26, points: 74, ideal: 80 },
    { day: "Day 3", x: 52, y: 24, points: 68, ideal: 60 },
    { day: "Day 4", x: 76, y: 34, points: 42, ideal: 40 },
    { day: "Day 5", x: 96, y: 37, points: 18, ideal: 20 },
  ];

  // Calendar meeting details state
  const [calendarEvents, setCalendarEvents] = useState<
    Record<string, { title: string; time: string; attendees: string; platform?: string }>
  >({
    Tu: {
      title: "Algo-Suite Architecture Sync",
      time: "10:30 AM IST",
      attendees: "Jeel Vaishnav, Aarav Patel",
      platform: "Google Meet",
    },
    Th: {
      title: "API Docs Sprint Demo & OCC Review",
      time: "03:00 PM IST",
      attendees: "Jeel Vaishnav, Priya Patel, Lakshya",
      platform: "Google Meet",
    },
  });

  // Add Meeting Modal state
  const [isAddMeetingOpen, setIsAddMeetingOpen] = useState(false);
  const [newMeetingTitle, setNewMeetingTitle] = useState("");
  const [newMeetingDay, setNewMeetingDay] = useState("We");
  const [newMeetingTime, setNewMeetingTime] = useState("11:30 AM IST");
  const [newMeetingPlatform, setNewMeetingPlatform] = useState("Google Meet");
  const [newMeetingAttendees, setNewMeetingAttendees] = useState<string[]>(["Jeel Vaishnav", "Aarav Patel"]);

  const handleAddMeetingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeetingTitle.trim()) return;

    setCalendarEvents((prev) => ({
      ...prev,
      [newMeetingDay]: {
        title: newMeetingTitle.trim(),
        time: newMeetingTime.trim() || "11:00 AM IST",
        attendees: newMeetingAttendees.join(", ") || "Jeel Vaishnav",
        platform: newMeetingPlatform,
      },
    }));

    setSelectedCalendarDay(newMeetingDay);
    setIsAddMeetingOpen(false);
    setNewMeetingTitle("");

    toast({
      type: "success",
      title: "Meeting Scheduled! 📅",
      message: `"${newMeetingTitle.trim()}" added to ${newMeetingDay} calendar.`,
    });
  };

  return (
    <div
      className="flex-1 flex flex-col min-h-0 p-5 sm:p-6 overflow-y-auto relative transition-all duration-500"
      style={{
        background:
          "linear-gradient(112deg, rgba(46, 32, 43, 0.96) 0%, rgba(41, 30, 40, 0.93) 38%, rgba(55, 38, 48, 0.88) 46%, rgba(228, 236, 248, 0.78) 64%, rgba(244, 248, 253, 0.92) 100%)",
      }}
    >
      {/* Top Header inside the glass window */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 select-none">
        {/* Project Title + Dropdown + Project Code Pill */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
              className="flex items-center gap-2 group text-left cursor-pointer transition-transform active:scale-98"
            >
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-sm flex items-center gap-2">
                <span>{currentProject?.name || "Project ALG-WEB-01"}</span>
                <ChevronDown
                  className={cn(
                    "w-5 h-5 text-white/70 group-hover:text-white transition-transform duration-200",
                    isProjectDropdownOpen && "rotate-180"
                  )}
                />
              </h1>
            </button>
            <p className="text-xs text-zinc-300 font-medium tracking-wide mt-0.5 drop-shadow-xs">
              {currentProject?.description || "Collaborative workspace dashboard"}
            </p>

            {/* Project Switcher Dropdown */}
            {isProjectDropdownOpen && (
              <div className="absolute left-0 mt-2 w-80 bg-[#1c1a24]/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-[10px] uppercase font-semibold text-zinc-400 px-3 py-1.5 flex items-center justify-between">
                  <span>Switch Active Project</span>
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        onSelectProject(p.id);
                        setIsProjectDropdownOpen(false);
                        toast({
                          type: "info",
                          title: "Project Switched",
                          message: `Active workspace: ${p.name}`,
                        });
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer",
                        p.id === currentProject?.id
                          ? "bg-blue-600/25 text-blue-300 font-semibold border border-blue-500/30 shadow-inner"
                          : "text-zinc-200 hover:bg-white/10"
                      )}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="truncate font-medium">{p.name}</div>
                        {p.code && (
                          <div className="text-[10px] font-mono text-zinc-400">{p.code}</div>
                        )}
                      </div>
                      {p.id === currentProject?.id && (
                        <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_#3b82f6] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Create or Join Project Button */}
                {onOpenCreateProjectModal && (
                  <div className="mt-2 pt-2 border-t border-white/10">
                    <button
                      onClick={() => {
                        setIsProjectDropdownOpen(false);
                        onOpenCreateProjectModal();
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New Project / Join with Code</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Unique Project Code Badge */}
          {currentProject?.code && (
            <div
              onClick={onOpenProjectAccessModal}
              className="px-3 py-1.5 rounded-2xl bg-zinc-950/60 hover:bg-zinc-950/90 border border-white/20 text-xs text-zinc-200 flex items-center gap-2 cursor-pointer transition-all shadow-md group"
              title="Click to manage project access and view invite code"
            >
              <Hash className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-mono font-bold text-blue-300">{currentProject.code}</span>
              <Share2 className="w-3 h-3 text-zinc-400 group-hover:text-white transition-colors" />
            </div>
          )}

          {/* Access & Permissions Button */}
          {onOpenProjectAccessModal && (
            <button
              onClick={onOpenProjectAccessModal}
              className="px-3 py-1.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all backdrop-blur-md shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Project Access</span>
            </button>
          )}
        </div>

        {/* Right Action Icons: Fullscreen, Add, Notifications, User Profile */}
        <div className="flex items-center gap-2.5">
          {/* Fullscreen Toggle Button */}
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className="w-9 h-9 rounded-2xl bg-white/80 hover:bg-white border border-white/90 shadow-sm flex items-center justify-center text-zinc-700 hover:text-zinc-950 transition-all active:scale-95 cursor-pointer backdrop-blur-md"
              title={isFullscreen ? "Exit Fullscreen (F11)" : "Enter Fullscreen (F11)"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 text-blue-600" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Quick Add Button */}
          <button
            onClick={onOpenNewTaskModal}
            className="w-9 h-9 rounded-2xl bg-white/80 hover:bg-white border border-white/90 shadow-sm flex items-center justify-center text-zinc-700 hover:text-zinc-950 transition-all active:scale-95 cursor-pointer backdrop-blur-md hover:rotate-90 duration-200"
            title="Create Task (Alt+N)"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="w-9 h-9 rounded-2xl bg-white/80 hover:bg-white border border-white/90 shadow-sm flex items-center justify-center text-zinc-700 hover:text-zinc-950 transition-all active:scale-95 cursor-pointer backdrop-blur-md relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-84 bg-white/95 backdrop-blur-2xl border border-zinc-200/90 rounded-2xl shadow-2xl p-3 z-50 text-xs text-zinc-700 animate-in fade-in zoom-in-95 duration-150">
                <div className="font-semibold text-zinc-900 pb-2 border-b border-zinc-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>Workspace Activity</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-600 font-mono font-bold">
                      Live
                    </span>
                  </div>
                  {unreadNotifications > 0 && (
                    <button
                      onClick={() => {
                        setUnreadNotifications(0);
                        toast({ type: "info", title: "All Read", message: "Notifications marked as read." });
                      }}
                      className="text-[10px] text-blue-600 hover:underline cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div className="py-2.5 space-y-2">
                  <div
                    onClick={() => {
                      if (tasks[0]) onTaskClick(tasks[0]);
                      setIsNotificationsOpen(false);
                    }}
                    className="p-2.5 rounded-xl bg-zinc-50 hover:bg-blue-50/50 border border-zinc-100 flex items-start gap-2.5 cursor-pointer transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0 animate-ping" />
                    <div>
                      <div className="font-medium text-zinc-800">Jeel Vaishnav edited Design System</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">2 mins ago · Tap to view task</div>
                    </div>
                  </div>
                  <div
                    onClick={() => {
                      if (tasks[1]) onTaskClick(tasks[1]);
                      setIsNotificationsOpen(false);
                    }}
                    className="p-2.5 rounded-xl bg-zinc-50 hover:bg-blue-50/50 border border-zinc-100 flex items-start gap-2.5 cursor-pointer transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                    <div>
                      <div className="font-medium text-zinc-800">Aarav Patel synced API Docs</div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">14 mins ago · Tap to view task</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar with Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="relative cursor-pointer transition-transform hover:scale-105"
              title={currentUser ? `Logged in as ${currentUser.name}` : "Profile"}
            >
              <Avatar
                name={currentUser?.name || "Jeel Vaishnav"}
                src={currentUser?.avatarUrl}
                color={currentUser?.color || "#9f1239"}
                size="md"
                isOnline={true}
                className="ring-2 ring-white/90 shadow-md shadow-black/10"
              />
            </button>

            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-zinc-900/95 backdrop-blur-2xl border border-zinc-700/80 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                {/* Authenticated User Header Card */}
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700/50 mb-2.5">
                  <Avatar
                    name={currentUser?.name || "User"}
                    src={currentUser?.avatarUrl}
                    color={currentUser?.color || "#9f1239"}
                    size="md"
                    isOnline={true}
                    className="ring-1 ring-white/20"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate">{currentUser?.name || "Authenticated User"}</div>
                    <div className="text-[11px] text-zinc-400 truncate">{currentUser?.email || "user@algothon.in"}</div>
                    <div className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[10px] font-medium border border-blue-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{currentUser?.role || "LEAD"}</span>
                      <span className="text-zinc-500">·</span>
                      <span className="text-emerald-400">Online</span>
                    </div>
                  </div>
                </div>

                {/* Sign Out Action */}
                {onLogout && (
                  <button
                    onClick={() => {
                      setIsUserDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between text-rose-400 hover:bg-rose-500/15 hover:text-rose-300 transition-colors font-semibold cursor-pointer border border-rose-500/20 shadow-xs"
                  >
                    <span className="flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </span>
                    <span className="text-[10px] text-rose-400/70 font-mono">End Session</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: 2-Column Layout matching screenshot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 select-none">
        {/* Left Column (5 of 12 cols): Project Pulse & Burndown / Calendar */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Project Pulse Card */}
          <div className="frosted-dark-card card-interactive rounded-3xl p-5 flex flex-col justify-between text-white relative overflow-hidden group">
            {/* Ambient inner soft background glow */}
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-600/30 transition-all duration-700" />
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-pink-600/20 rounded-full blur-3xl pointer-events-none group-hover:bg-pink-600/30 transition-all duration-700" />

            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-1.5">
                  <span>Project Pulse</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <span className="text-[11px] text-zinc-400">{currentMetric.desc}</span>
              </div>

              {/* Overdue Tasks Badge with working interactive click */}
              <div
                onClick={() => {
                  toast({
                    type: "warning",
                    title: "Overdue Tasks Audit",
                    message: `${overdueCount || 4} tasks flagged overdue. Review priorities in Kanban board.`,
                  });
                }}
                className="px-3.5 py-1.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] backdrop-blur-md border border-white/12 flex flex-col items-start min-w-[95px] cursor-pointer transition-all hover:scale-105 active:scale-95"
                title="Click to audit overdue tasks"
              >
                <div className="flex items-center gap-1 text-[10px] text-zinc-300 font-medium">
                  <span>Overdue Tasks</span>
                  <span className="w-3 h-3 rounded-full border border-white/40 flex items-center justify-center text-[8px] font-serif">
                    i
                  </span>
                </div>
                <span className="text-base font-bold text-white font-mono leading-tight mt-0.5">
                  {overdueCount || 4}
                </span>
              </div>
            </div>

            {/* Central Rainbow Glow Arc Gauge with dynamic animation */}
            <div
              onClick={() => {
                setActiveMetricIdx((prev) => (prev + 1) % METRICS.length);
                toast({
                  type: "info",
                  title: "Metric Cycled",
                  message: `Now showing ${METRICS[(activeMetricIdx + 1) % METRICS.length].title}`,
                });
              }}
              className="my-2 flex flex-col items-center justify-center relative cursor-pointer group/gauge"
              title="Click arc to cycle project metrics"
            >
              <div className="relative w-56 h-28 flex items-end justify-center">
                <svg className="w-56 h-28 overflow-visible" viewBox="0 0 200 100">
                  <defs>
                    <linearGradient id="rainbowGauge" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="25%" stopColor="#818cf8" />
                      <stop offset="50%" stopColor="#c084fc" />
                      <stop offset="75%" stopColor="#f472b6" />
                      <stop offset="100%" stopColor="#fbbf24" />
                    </linearGradient>
                    <filter id="arcGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3.5" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Background Arc Track */}
                  <path
                    d="M 20 90 A 80 80 0 0 1 180 90"
                    fill="none"
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />

                  {/* Gradient Arc Fill with smooth transition */}
                  <path
                    d="M 20 90 A 80 80 0 0 1 180 90"
                    fill="none"
                    stroke="url(#rainbowGauge)"
                    strokeWidth="8"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 * (1 - percentValue / 100)}
                    strokeLinecap="round"
                    filter="url(#arcGlow)"
                    className="rainbow-arc-glow transition-all duration-700 ease-out"
                  />

                  {/* Dynamic Indicator - Line that becomes Circle on Hover */}
                  <g onMouseEnter={() => setIsIndicatorHovered(true)} onMouseLeave={() => setIsIndicatorHovered(false)}>
                    {/* Normal state: short line segment */}
                    {!isIndicatorHovered && (
                      <line
                        x1={dotX - 4}
                        y1={dotY}
                        x2={dotX + 4}
                        y2={dotY}
                        stroke="#fbbf24"
                        strokeWidth="3"
                        className="transition-all duration-700 ease-out"
                      />
                    )}
                    {/* Hover state: full circle */}
                    {isIndicatorHovered && (
                      <circle
                        cx={dotX}
                        cy={dotY}
                        r="4.5"
                        fill="#fbbf24"
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="shadow-[0_0_14px_#fbbf24] transition-all duration-700 ease-out"
                      />
                    )}
                  </g>
                </svg>

                {/* Central Text inside Arc */}
                <div className="absolute bottom-1 text-center transition-all duration-300 group-hover/gauge:scale-105">
                  <div className="text-[11px] text-zinc-300 font-medium">{currentMetric.title}</div>
                  <div className="text-3xl font-extrabold text-white tracking-tight font-mono">
                    {currentMetric.title === "Task Completion" ? `${currentMetric.percent}%` : `${allUsers.length}`}
                  </div>
                </div>
              </div>

              {/* Gauge range labels */}
              <div className="w-56 flex items-center justify-between text-[11px] text-zinc-400 font-mono px-3 mt-1">
                <span>0</span>
                <span>{currentMetric.target}</span>
              </div>

              {/* Interactive Pagination Dots */}
              <div className="flex items-center gap-1.5 mt-2">
                {METRICS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMetricIdx(idx);
                    }}
                    className={cn(
                      "transition-all duration-300 rounded-full cursor-pointer",
                      idx === activeMetricIdx
                        ? "w-4 h-1.5 bg-white shadow-xs"
                        : "w-1.5 h-1.5 bg-white/30 hover:bg-white/60"
                    )}
                    title={`View ${METRICS[idx].title}`}
                  />
                ))}
              </div>
            </div>

            {/* Bottom Embedded Pill Sub-card matching screenshot */}
            <div
              onClick={() => {
                setActiveMetricIdx((prev) => (prev + 1) % METRICS.length);
                toast({
                  type: "info",
                  title: "Metric Advanced",
                  message: `${currentMetric.title} progress updated.`,
                });
              }}
              className="mt-3 p-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 flex flex-col gap-2 text-xs transition-all cursor-pointer active:scale-98"
              title="Click to cycle progress"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-white">{currentMetric.title}</span>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#d97706]/30 text-amber-300 text-[10px] font-semibold border border-amber-500/30">
                    Progress
                  </span>
                  <span className="text-zinc-400 text-xs">›</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-[#d97706]/30 text-amber-300 text-[10px] font-semibold border border-amber-500/30">
                  Progress
                </span>
                <span className="text-zinc-300 font-mono text-[11px] font-bold">0</span>
              </div>
            </div>
          </div>

          {/* Bottom Dual Mini-Cards (Burndown Chart + Team Calendar) */}
          <div className="grid grid-cols-2 gap-4">
            {/* Burndown Chart Card */}
            <div className="frosted-dark-card card-interactive rounded-2xl p-4 text-white flex flex-col justify-between relative group">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-zinc-200">Burndown Chart</span>
                <div className="relative">
                  <button
                    onClick={() => setIsBurndownMenuOpen(!isBurndownMenuOpen)}
                    className="text-zinc-400 hover:text-white p-0.5 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                    title="Chart options"
                  >
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>

                  {isBurndownMenuOpen && (
                    <div className="absolute right-0 mt-1 w-44 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 text-[11px] animate-in fade-in zoom-in-95 duration-100">
                      <button
                        onClick={() => {
                          setIsBurndownMenuOpen(false);
                          toast({ type: "info", title: "Burndown Simulated", message: "Burn rate: 8.4 story pts/day." });
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 flex items-center gap-2"
                      >
                        <RefreshCw className="w-3 h-3 text-blue-400" />
                        <span>Simulate Daily Burn</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsBurndownMenuOpen(false);
                          toast({ type: "success", title: "Exported", message: "Burndown chart saved as SVG." });
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 flex items-center gap-2"
                      >
                        <Download className="w-3 h-3 text-emerald-400" />
                        <span>Export Chart SVG</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-1">
                <span>100</span>
                {hoveredBurndownPoint && (
                  <span className="text-blue-300 font-bold animate-in fade-in duration-150">
                    {hoveredBurndownPoint.day}: {hoveredBurndownPoint.points} pts
                  </span>
                )}
              </div>

              {/* Interactive burndown trend line with SVG hover dots */}
              <div className="h-12 w-full flex items-end relative">
                <svg className="w-full h-12 overflow-visible" viewBox="0 0 100 40">
                  <path
                    d="M 0 10 L 25 28 L 50 25 L 75 35 L 100 38"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="animate-draw-line"
                  />
                  <path
                    d="M 0 10 L 25 28 L 50 25 L 75 35 L 100 38 L 100 40 L 0 40 Z"
                    fill="rgba(56, 189, 248, 0.15)"
                  />
                  {/* Interactive points */}
                  {burndownPoints.map((pt, i) => (
                    <circle
                      key={i}
                      cx={pt.x}
                      cy={pt.y}
                      r="3"
                      fill="#38bdf8"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      onMouseEnter={() => setHoveredBurndownPoint(pt)}
                      onMouseLeave={() => setHoveredBurndownPoint(null)}
                      className="cursor-pointer hover:r-4 transition-all"
                    />
                  ))}
                </svg>
              </div>
            </div>

            {/* Team Calendar Card with interactive day view */}
            <div className="frosted-dark-card card-interactive rounded-2xl p-4 text-white flex flex-col justify-between relative group">
              <div className="flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-zinc-200">Team Calendar</span>
                  <button
                    onClick={() => {
                      setNewMeetingDay(selectedCalendarDay || "We");
                      setIsAddMeetingOpen(true);
                    }}
                    className="px-2 py-0.5 rounded-lg bg-indigo-500/25 hover:bg-indigo-500/40 text-indigo-200 border border-indigo-500/40 text-[10px] font-medium flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
                    title="Schedule a team meeting"
                  >
                    <Plus className="w-3 h-3 text-indigo-300" />
                    <span>Meeting</span>
                  </button>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setIsCalendarMenuOpen(!isCalendarMenuOpen)}
                    className="text-zinc-400 hover:text-white p-0.5 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                    title="Calendar options"
                  >
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>

                  {isCalendarMenuOpen && (
                    <div className="absolute right-0 mt-1 w-48 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-1.5 z-50 text-[11px] animate-in fade-in zoom-in-95 duration-100">
                      <button
                        onClick={() => {
                          setIsCalendarMenuOpen(false);
                          setIsAddMeetingOpen(true);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 flex items-center gap-2"
                      >
                        <Video className="w-3 h-3 text-indigo-400" />
                        <span>Schedule Team Sync</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsCalendarMenuOpen(false);
                          toast({ type: "success", title: "Synced", message: "Google Calendar connected." });
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white/10 flex items-center gap-2"
                      >
                        <Calendar className="w-3 h-3 text-emerald-400" />
                        <span>Sync with Calendar</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Days header with interactive selection */}
              <div className="grid grid-cols-6 text-center text-[10px] text-zinc-400 pt-1">
                {["Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedCalendarDay(day);
                      const ev = calendarEvents[day];
                      if (ev) {
                        toast({
                          type: "info",
                          title: `${day}: ${ev.title}`,
                          message: `${ev.time} (${ev.attendees})`,
                        });
                      } else {
                        toast({
                          type: "info",
                          title: `${day}: Focus Day`,
                          message: "No scheduled meetings. Open focus sprint time.",
                        });
                      }
                    }}
                    className={cn(
                      "py-1 rounded-md transition-all cursor-pointer font-medium",
                      selectedCalendarDay === day
                        ? "bg-white/15 text-white font-bold"
                        : "hover:text-zinc-200"
                    )}
                  >
                    {day}
                  </button>
                ))}
              </div>

              {/* Active dots under days dynamically reflecting scheduled meetings */}
              <div className="grid grid-cols-6 text-center py-2">
                {["Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day, idx) => (
                  <div key={idx} className="flex justify-center">
                    {calendarEvents[day] ? (
                      <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_#38bdf8] animate-pulse" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-transparent" />
                    )}
                  </div>
                ))}
              </div>

              {/* Selected Day Meeting Details Card */}
              {calendarEvents[selectedCalendarDay] ? (
                <div className="mt-1 p-2 rounded-xl bg-white/[0.06] border border-white/10 flex items-center gap-2.5 text-xs">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/30 text-indigo-300 flex items-center justify-center shrink-0">
                    <Video className="w-3.5 h-3.5" />
                  </div>
                  <div className="truncate flex-1">
                    <div className="font-semibold text-white truncate text-[11px]">
                      {calendarEvents[selectedCalendarDay].title}
                    </div>
                    <div className="text-[10px] text-zinc-400 truncate">
                      {calendarEvents[selectedCalendarDay].time} · {calendarEvents[selectedCalendarDay].attendees}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-1 p-1.5 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] text-zinc-400 text-center flex items-center justify-center gap-1.5">
                  <span>No meeting on {selectedCalendarDay}.</span>
                  <button
                    onClick={() => {
                      setNewMeetingDay(selectedCalendarDay);
                      setIsAddMeetingOpen(true);
                    }}
                    className="text-indigo-400 hover:text-indigo-300 underline font-medium cursor-pointer"
                  >
                    + Add one
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (7 of 12 cols): My Priorities & Team Activity */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Personalized & Persistent To-Do List Card */}
          <div className="frosted-light-card card-interactive rounded-3xl p-5 flex flex-col justify-between shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.05]">
              <div className="flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-zinc-800 tracking-wide flex items-center gap-2">
                  <span>To-Do List</span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-mono font-medium">
                    {currentUser?.name ? `${currentUser.name.split(" ")[0]}'s List` : "My List"}
                  </span>
                </h3>
              </div>

              {/* Filter Tabs & Completed Count */}
              <div className="flex items-center gap-1.5">
                <div className="flex items-center bg-black/5 p-0.5 rounded-xl text-[10px] font-medium text-zinc-600">
                  <button
                    onClick={() => setTodoFilter("ALL")}
                    className={cn(
                      "px-2 py-0.5 rounded-lg transition-colors cursor-pointer",
                      todoFilter === "ALL" ? "bg-white text-zinc-900 shadow-xs font-semibold" : "hover:text-zinc-900"
                    )}
                  >
                    All ({todos.length})
                  </button>
                  <button
                    onClick={() => setTodoFilter("ACTIVE")}
                    className={cn(
                      "px-2 py-0.5 rounded-lg transition-colors cursor-pointer",
                      todoFilter === "ACTIVE" ? "bg-white text-zinc-900 shadow-xs font-semibold" : "hover:text-zinc-900"
                    )}
                  >
                    Active ({todos.filter((t) => !t.isCompleted).length})
                  </button>
                  <button
                    onClick={() => setTodoFilter("DONE")}
                    className={cn(
                      "px-2 py-0.5 rounded-lg transition-colors cursor-pointer",
                      todoFilter === "DONE" ? "bg-white text-zinc-900 shadow-xs font-semibold" : "hover:text-zinc-900"
                    )}
                  >
                    Done ({todos.filter((t) => t.isCompleted).length})
                  </button>
                </div>
                {todos.length > 0 && (
                  <button
                    onClick={() => {
                      if (window.confirm('Clear all to-do items?')) {
                        saveTodos([]);
                      }
                    }}
                    className="text-[10px] text-zinc-400 hover:text-zinc-300 transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Todo Items List */}
            <div className="divide-y divide-black/[0.05] py-1 max-h-[190px] overflow-y-auto space-y-1 custom-scrollbar">
              {filteredTodos.length === 0 ? (
                <div className="py-6 text-center text-xs text-zinc-400">
                  {todoFilter === "DONE"
                    ? "No completed tasks yet. Check off items as you finish them!"
                    : todoFilter === "ACTIVE"
                    ? "All tasks completed! Great job! 🎉"
                    : "Your to-do list is empty. Add a task below!"}
                </div>
              ) : (
                filteredTodos.map((item) => (
                  <div
                    key={item.id}
                    className="py-2.5 px-2 rounded-xl flex items-center justify-between gap-3 group hover:bg-black/[0.03] transition-all"
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <button
                        onClick={() => handleToggleTodo(item.id)}
                        className="text-blue-600 hover:scale-125 transition-transform cursor-pointer shrink-0"
                        title={item.isCompleted ? "Mark as active" : "Mark as completed"}
                      >
                        {item.isCompleted ? (
                          <CheckCircle2 className="w-4.5 h-4.5 fill-blue-600 text-white check-pop" />
                        ) : (
                          <Circle className="w-4.5 h-4.5 text-zinc-400 hover:text-blue-500 transition-colors" />
                        )}
                      </button>

                      {editingTodoId === item.id ? (
                        <div className="flex items-center gap-1.5 flex-1">
                          <input
                            type="text"
                            value={editingTodoText}
                            onChange={(e) => setEditingTodoText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveEditTodo(item.id);
                              if (e.key === "Escape") setEditingTodoId(null);
                            }}
                            autoFocus
                            className="w-full text-xs font-semibold bg-white border border-blue-400 rounded-lg px-2 py-1 text-zinc-900 focus:outline-none"
                          />
                          <button
                            onClick={() => handleSaveEditTodo(item.id)}
                            className="px-2 py-1 rounded-lg bg-blue-600 text-white text-[10px] font-semibold shrink-0 cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <span
                          onDoubleClick={() => {
                            setEditingTodoId(item.id);
                            setEditingTodoText(item.title);
                          }}
                          className={cn(
                            "text-xs font-semibold text-zinc-800 truncate transition-colors cursor-pointer flex-1",
                            item.isCompleted && "text-zinc-400 line-through"
                          )}
                          title="Double-click to edit title"
                        >
                          {item.title}
                        </span>
                      )}

                      {item.tag && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[9px] font-semibold border border-blue-200 shrink-0">
                          {item.tag}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] font-medium text-zinc-400">
                        {item.dueDate || "Today"}
                      </span>

                      {/* Action buttons on hover */}
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                        <button
                          onClick={() => {
                            setEditingTodoId(item.id);
                            setEditingTodoText(item.title);
                          }}
                          className="p-1 rounded-md hover:bg-black/5 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
                          title="Edit to-do"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteTodo(item.id, item.title, e)}
                          className="p-1 rounded-md hover:bg-rose-50 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete to-do"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add New To-Do Input */}
            <form onSubmit={handleAddTodo} className="pt-2 border-t border-black/[0.05] flex items-center gap-2">
              <input
                type="text"
                placeholder={`+ Add a task for ${currentUser?.name?.split(" ")[0] || "yourself"}...`}
                value={newTodoText}
                onChange={(e) => setNewTodoText(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-xl bg-black/[0.03] border border-black/[0.08] text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>
          </div>

          {/* Team Activity Light Glass Card with working options & task jumping */}
          <div className="frosted-light-card card-interactive rounded-3xl p-5 flex flex-col justify-between shadow-sm flex-1 relative">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.05]">
              <h3 className="text-sm font-bold text-zinc-800 tracking-wide flex items-center gap-2">
                <span>Team Activity</span>
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              </h3>
              <div className="relative">
                <button
                  onClick={() => setIsActivityMenuOpen(!isActivityMenuOpen)}
                  className="text-zinc-400 hover:text-zinc-700 p-0.5 rounded-md hover:bg-black/5 transition-colors cursor-pointer"
                  title="Activity options"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {isActivityMenuOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white/95 backdrop-blur-xl border border-zinc-200 rounded-xl shadow-2xl p-1.5 z-50 text-[11px] animate-in fade-in zoom-in-95 duration-100">
                    <button
                      onClick={() => {
                        setIsActivityMenuOpen(false);
                        toast({ type: "info", title: "Filter Applied", message: "Showing Jeel Vaishnav activities." });
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 flex items-center gap-2"
                    >
                      <Filter className="w-3 h-3 text-blue-500" />
                      <span>Filter by Jeel Vaishnav</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsActivityMenuOpen(false);
                        toast({ type: "success", title: "Audit Exported", message: "Audit log saved as CSV." });
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 flex items-center gap-2"
                    >
                      <Download className="w-3 h-3 text-emerald-500" />
                      <span>Download Audit CSV</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline Stream with dynamic team activities */}
            <div className="py-2 space-y-3 relative before:absolute before:left-3.5 before:top-4 before:bottom-4 before:w-0.5 before:bg-zinc-200">
              {/* Get activities for current user and team members */}
              {/* Activity 1: Current user activity */}
              <div
                onClick={() => {
                  const task = tasks.find((t) => t.assignees.some(a => a.userId === currentUser?.id)) || tasks[0];
                  if (task) onTaskClick(task);
                }}
                className="flex items-center gap-3 relative pl-1 group/item cursor-pointer p-1.5 rounded-xl hover:bg-black/[0.02] transition-colors"
                title="Click to view task"
              >
                <Avatar
                  name={currentUser?.name || "User"}
                  src={currentUser?.avatarUrl}
                  size="xs"
                  color={currentUser?.color || "#9f1239"}
                  className="ring-2 ring-white shadow-xs z-10 group-hover/item:scale-110 transition-transform"
                />
                <div className="flex-1 text-xs">
                  <span className="font-semibold text-zinc-800">{currentUser?.name || "User"}</span>{" "}
                  <span className="text-zinc-600">updated task:</span>{" "}
                  <span className="font-semibold text-zinc-900 group-hover/item:text-blue-600 transition-colors">
                    {tasks.find((t) => t.assignees.some(a => a.userId === currentUser?.id))?.title || "Project Setup"}
                  </span>
                  <div className="text-[10px] text-zinc-400 mt-0.5 font-mono">Just now · Click to view</div>
                </div>
              </div>

              {/* Activity 2: Team member activity (if available) */}
              {allUsers.length > 1 && (
                <>
                  {/* Get the first team member who is not the current user */}
                  {(() => {
                    const otherUser = allUsers.find(u => u.id !== currentUser?.id);
                    if (!otherUser) return null;

                    return (
                      <div
                        onClick={() => {
                          const task = tasks.find((t) => t.assignees.some(a => a.userId === otherUser?.id)) || tasks[0];
                          if (task) onTaskClick(task);
                        }}
                        className="flex items-center gap-3 relative pl-1 group/item cursor-pointer p-1.5 rounded-xl hover:bg-black/[0.02] transition-colors"
                        title="Click to view task"
                      >
                        <Avatar
                          name={otherUser.name || "Team Member"}
                          src={otherUser.avatarUrl}
                          size="xs"
                          color={otherUser.color}
                          className="ring-2 ring-white shadow-xs z-10 group-hover/item:scale-110 transition-transform"
                        />
                        <div className="flex-1 text-xs">
                          <span className="font-semibold text-zinc-800">{otherUser.name || "Team Member"}</span>{" "}
                          <span className="text-zinc-600">updated task:</span>{" "}
                          <span className="font-semibold text-zinc-900 group-hover/item:text-blue-600 transition-colors">
                            {tasks.find((t) => t.assignees.some(a => a.userId === otherUser?.id))?.title || "Design Review"}
                          </span>
                          <div className="text-[10px] text-zinc-400 mt-0.5 font-mono">5 mins ago · Click to view</div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Activity 3: Another team member activity (if available) */}
                  {allUsers.length > 2 && (() => {
                    const userIndex = 2; // Third user
                    const otherUser = allUsers[userIndex] || allUsers.find(u => u.id !== currentUser?.id) || currentUser;
                    if (!otherUser) return null;

                    return (
                      <div
                        onClick={() => {
                          const task = tasks.find((t) => t.assignees.some(a => a.userId === otherUser?.id)) || tasks[0];
                          if (task) onTaskClick(task);
                        }}
                        className="flex items-center gap-3 relative pl-1 group/item cursor-pointer p-1.5 rounded-xl hover:bg-black/[0.02] transition-colors"
                        title="Click to view task"
                      >
                        <Avatar
                          name={otherUser.name || "Team Member"}
                          src={otherUser.avatarUrl}
                          size="xs"
                          color={otherUser.color}
                          className="ring-2 ring-white shadow-xs z-10 group-hover/item:scale-110 transition-transform"
                        />
                        <div className="flex-1 text-xs">
                          <span className="font-semibold text-zinc-800">{otherUser.name || "Team Member"}</span>{" "}
                          <span className="text-zinc-600">updated task:</span>{" "}
                          <span className="font-semibold text-zinc-900 group-hover/item:text-blue-600 transition-colors">
                            {tasks.find((t) => t.assignees.some(a => a.userId === otherUser?.id))?.title || "API Development"}
                          </span>
                          <div className="text-[10px] text-zinc-400 mt-0.5 font-mono">10 mins ago · Click to view</div>
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}

              {/* Fallback activities if no team members */}
              {allUsers.length <= 1 && (
                <>
                  <div
                    onClick={() => {
                      const task = tasks[0];
                      if (task) onTaskClick(task);
                    }}
                    className="flex items-center gap-3 relative pl-1 group/item cursor-pointer p-1.5 rounded-xl hover:bg-black/[0.02] transition-colors"
                    title="Click to view task"
                  >
                    <Avatar
                      name={currentUser?.name || "User"}
                      src={currentUser?.avatarUrl}
                      size="xs"
                      color={currentUser?.color || "#9f1239"}
                      className="ring-2 ring-white shadow-xs z-10 group-hover/item:scale-110 transition-transform"
                    />
                    <div className="flex-1 text-xs">
                      <span className="font-semibold text-zinc-800">{currentUser?.name || "User"}</span>{" "}
                      <span className="text-zinc-600">created task:</span>{" "}
                      <span className="font-semibold text-zinc-900 group-hover/item:text-blue-600 transition-colors">
                        {tasks[0]?.title || "Initial Project Setup"}
                      </span>
                      <div className="text-[10px] text-zinc-400 mt-0.5 font-mono">Just now · Click to view</div>
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      const task = tasks[1] || tasks[0];
                      if (task) onTaskClick(task);
                    }}
                    className="flex items-center gap-3 relative pl-1 group/item cursor-pointer p-1.5 rounded-xl hover:bg-black/[0.02] transition-colors"
                    title="Click to view task"
                  >
                    <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center ring-2 ring-white shadow-xs z-10 group-hover/item:scale-110 transition-transform">
                      <Edit2 className="w-2.5 h-2.5" />
                    </div>
                    <div className="flex-1 text-xs">
                      <span className="font-semibold text-zinc-800">{currentUser?.name || "User"}</span>{" "}
                      <span className="text-zinc-600">edited task:</span>{" "}
                      <span className="font-semibold text-zinc-900 group-hover/item:text-blue-600 transition-colors">
                        {tasks[1]?.title || tasks[0]?.title || "Task Management"}
                      </span>
                      <div className="text-[10px] text-zinc-400 mt-0.5 font-mono">3 mins ago · Click to view</div>
                    </div>
                  </div>

                  <div
                    onClick={() => {
                      const task = tasks[2] || tasks[0];
                      if (task) onTaskClick(task);
                    }}
                    className="flex items-center gap-3 relative pl-1 group/item cursor-pointer p-1.5 rounded-xl hover:bg-black/[0.02] transition-colors"
                    title="Click to view task"
                  >
                    <Avatar
                      name={currentUser?.name || "User"}
                      src={currentUser?.avatarUrl}
                      size="xs"
                      color={currentUser?.color || "#9f1239"}
                      className="ring-2 ring-white shadow-xs z-10 group-hover/item:scale-110 transition-transform"
                    />
                    <div className="flex-1 text-xs">
                      <span className="font-semibold text-zinc-800">{currentUser?.name || "User"}</span>{" "}
                      <span className="text-zinc-600">commented on task:</span>{" "}
                      <span className="font-semibold text-zinc-900 group-hover/item:text-blue-600 transition-colors">
                        {tasks[2]?.title || tasks[0]?.title || "Progress Update"}
                      </span>
                      <div className="text-[10px] text-zinc-400 mt-0.5 font-mono">7 mins ago · Click to view</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Team Chat Glass Card */}
          <div className="frosted-light-card card-interactive rounded-3xl p-5 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.05]">
              <h3 className="text-sm font-bold text-zinc-800 tracking-wide flex items-center gap-2">
                <span>Team Chat</span>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </h3>
              <div className="relative">
                <button
                  onClick={() => setIsChatMenuOpen(!isChatMenuOpen)}
                  className="text-zinc-400 hover:text-zinc-700 p-0.5 rounded-md hover:bg-black/5 transition-colors cursor-pointer"
                  title="Chat options"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {isChatMenuOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white/95 backdrop-blur-xl border border-zinc-200 rounded-xl shadow-2xl p-1.5 z-50 text-[11px] animate-in fade-in zoom-in-95 duration-100">
                    <button
                      onClick={() => {
                        setIsChatMenuOpen(false);
                        toast({ type: "info", title: "Chat Cleared", message: "Chat history cleared." });
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 flex items-center gap-2"
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                      <span>Clear Chat</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsChatMenuOpen(false);
                        toast({ type: "success", title: "Exported", message: "Chat history exported." });
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 flex items-center gap-2"
                    >
                      <Download className="w-3 h-3 text-emerald-400" />
                      <span>Export Chat</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 space-y-3 py-2 divide-y divide-black/[0.05] overflow-y-auto">
              {chatMessages.map((msg, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Avatar
                    name={msg.sender.name}
                    src={msg.sender.avatarUrl}
                    size="xs"
                    color={msg.sender.color}
                    className="ring-2 ring-white shadow-xs"
                  />
                  <div className="flex-1">
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-zinc-800">{msg.sender.name}</span>
                      <span className="text-[10px] text-zinc-500">({msg.sender.role})</span>
                    </div>
                    <p className="text-xs text-zinc-700 break-words">{msg.text}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[9px] text-zinc-400">{msg.time}</span>
                      {msg.isRead ? (
                        <Check className="w-3 h-3 text-green-400" />
                      ) : (
                        <Circle className="w-3 h-3 text-zinc-400" />
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading placeholder when no messages */}
              {chatMessages.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center py-6">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-blue-400" />
                  </div>
                  <p className="mt-3 text-center text-xs text-zinc-400">
                    No messages yet. Start the conversation!
                  </p>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="pt-3 border-t border-black/[0.05] flex items-center gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                className="flex-1 px-3 py-2 rounded-xl bg-black/[0.03] border border-black/[0.08] text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Schedule Meeting Modal */}
      {isAddMeetingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-zinc-900/95 border border-white/15 rounded-3xl p-6 shadow-2xl text-white relative animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Schedule Team Meeting</h3>
                  <p className="text-[11px] text-zinc-400">Sync sprint progress with Indian engineering team</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddMeetingOpen(false)}
                className="p-1 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddMeetingSubmit} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Meeting Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Algo-Suite Architecture Sync & Demo"
                  value={newMeetingTitle}
                  onChange={(e) => setNewMeetingTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700/80 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Day of Week
                  </label>
                  <select
                    value={newMeetingDay}
                    onChange={(e) => setNewMeetingDay(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700/80 text-white focus:outline-none focus:border-indigo-500 text-xs"
                  >
                    <option value="Mo">Monday (Mo)</option>
                    <option value="Tu">Tuesday (Tu)</option>
                    <option value="We">Wednesday (We)</option>
                    <option value="Th">Thursday (Th)</option>
                    <option value="Fr">Friday (Fr)</option>
                    <option value="Sa">Saturday (Sa)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                    Time (IST)
                  </label>
                  <input
                    type="text"
                    placeholder="11:30 AM IST"
                    value={newMeetingTime}
                    onChange={(e) => setNewMeetingTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700/80 text-white focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                  Meeting Platform
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["Google Meet", "Zoom", "Slack Huddle"].map((plat) => (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => setNewMeetingPlatform(plat)}
                      className={cn(
                        "py-2 rounded-xl border text-center transition-all cursor-pointer font-medium text-[11px]",
                        newMeetingPlatform === plat
                          ? "bg-indigo-600/30 border-indigo-500 text-indigo-200 font-semibold"
                          : "bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-white"
                      )}
                    >
                      {plat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 mb-1.5">
                  Select Attendees
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {allUsers.map((u) => {
                    const isSelected = newMeetingAttendees.includes(u.name);
                    return (
                      <div
                        key={u.id}
                        onClick={() => {
                          if (isSelected) {
                            setNewMeetingAttendees((prev) => prev.filter((n) => n !== u.name));
                          } else {
                            setNewMeetingAttendees((prev) => [...prev, u.name]);
                          }
                        }}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-xl border cursor-pointer transition-colors",
                          isSelected
                            ? "bg-indigo-500/15 border-indigo-500/40 text-white"
                            : "bg-zinc-950/40 border-zinc-800/80 text-zinc-400 hover:bg-zinc-800/40"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar name={u.name} src={u.avatarUrl} color={u.color} size="xs" />
                          <span className="text-xs font-medium">{u.name}</span>
                          <span className="text-[10px] text-zinc-500">({u.role})</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddMeetingOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors cursor-pointer text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Schedule Meeting</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
