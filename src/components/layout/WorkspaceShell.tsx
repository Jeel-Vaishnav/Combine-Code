"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Plus,
  Bell,
  Search,
  Keyboard,
  Radio,
  Sparkles,
  Hash,
  PieChart,
} from "lucide-react";
import { GlassmorphicDashboard } from "../dashboard/GlassmorphicDashboard";
import { BoardFilterBar } from "../board/BoardFilterBar";
import { KanbanBoard } from "../board/KanbanBoard";
import { ListView } from "../board/ListView";
import { TaskDetailDrawer } from "../drawer/TaskDetailDrawer";
import { NewTaskModal } from "../board/NewTaskModal";
import { ConflictResolutionModal } from "../conflict/ConflictResolutionModal";
import { CommandPalette } from "./CommandPalette";
import { KeyboardShortcutsModal } from "./KeyboardShortcutsModal";
import { ConnectionHealthModal } from "./ConnectionHealthModal";
import { TeamDirectoryModal } from "./TeamDirectoryModal";
import { TeamHubView } from "../team/TeamHubView";
import { LandingPage } from "../landing/LandingPage";
import { ProjectOnboardingHub } from "../project/ProjectOnboardingHub";
import { CreateProjectModal } from "../project/CreateProjectModal";
import { ProjectAccessModal } from "../project/ProjectAccessModal";
import { useBoardQuery } from "@/hooks/useBoardQuery";
import { useSocket } from "@/hooks/useSocket";
import { useToast } from "@/components/ui/Toast";
import { UserSummary, Priority, TaskItem } from "@/types/models";
import { PatchTaskInput } from "@/types/zodSchemas";
import { ConflictErrorPayload, ConflictResolutionChoice } from "@/types/occ";
import { KanbanColumnSkeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

export function WorkspaceShell() {
  const { toast } = useToast();

  // Navigation state: "dashboard" | "tasks" | "team"
  const [activeNav, setActiveNav] = useState<"dashboard" | "tasks" | "team">("dashboard");

  // Inside Tasks: "board" | "list"
  const [taskViewMode, setTaskViewMode] = useState<"board" | "list">("board");

  // Auth & Workspace Metadata State
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [projects, setProjects] = useState<{ id: string; name: string; slug: string; code?: string; description?: string; ownerId?: string }[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<UserSummary[]>([]);
  const [currentUser, setCurrentUser] = useState<UserSummary | null>(null);

  // Project Modals State
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [createProjectModalTab, setCreateProjectModalTab] = useState<"CREATE" | "JOIN">("CREATE");
  const [isProjectAccessModalOpen, setIsProjectAccessModalOpen] = useState(false);

  // Restore authenticated user session on mount
  useEffect(() => {
    try {
      const savedUser = typeof window !== "undefined" ? localStorage.getItem("algothon_auth_user") : null;
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.id) {
          setCurrentUser(parsed);
        }
      }
    } catch (e) {
      console.error("Auth session parse error:", e);
    } finally {
      setIsAuthChecked(true);
    }
  }, []);


  const handleLoginSuccess = useCallback((user: UserSummary) => {
    // Basic validation: ensure we have a valid user object
    // In a real app, validation would happen on the backend during login
    if (!user || !user.id || !user.name) {
      toast({
        type: "error",
        title: "Login Failed",
        message: "Invalid user data received from login attempt.",
      });
      return;
    }

    setCurrentUser(user);
    localStorage.setItem("algothon_auth_user", JSON.stringify(user));
    toast({
      type: "success",
      title: "Logged In",
      message: `Welcome back, ${user.name}!`,
    });
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("algothon_auth_user");
    setCurrentUser(null);
    toast({
      type: "info",
      title: "Signed Out",
      message: "You have signed out of the workspace studio.",
    });
  }, [toast]);

  const handleProjectCreated = useCallback(
    (newProject: { id: string; name: string; slug: string; code?: string; description?: string }) => {
      setProjects((prev) => [newProject, ...prev]);
      setSelectedProjectId(newProject.id);
      setSelectedTaskId(null); // Clear selected task when switching to new project
      setSearchQuery(""); // Reset search filter
      setSelectedPriority("ALL"); // Reset priority filter
      setSelectedAssigneeId("ALL"); // Reset assignee filter
      toast({
        type: "success",
        title: "Active Project Updated",
        message: `Now viewing ${newProject.name}`,
      });
    },
    [toast]
  );

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<Priority | "ALL">("ALL");
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | "ALL">("ALL");

  // Modals & Drawer State
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isConnectionHealthOpen, setIsConnectionHealthOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  // OCC Tier 3 Conflict Modal State
  const [conflictModalState, setConflictModalState] = useState<{
    isOpen: boolean;
    taskId: string;
    currentServerTask: TaskItem | null;
    attemptedPatch: PatchTaskInput | null;
  }>({
    isOpen: false,
    taskId: "",
    currentServerTask: null,
    attemptedPatch: null,
  });

  // Fullscreen edge-to-edge mode state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync with browser native fullscreen changes (e.g. Esc pressed)
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNative = typeof document !== "undefined" && Boolean(document.fullscreenElement);
      setIsFullscreen(isNative);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        if (next && document.documentElement.requestFullscreen && !document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else if (!next && document.exitFullscreen && document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      }
      return next;
    });
  }, []);

  // Real-time Presence State
  const [onlineUsers, setOnlineUsers] = useState<UserSummary[]>([]);
  const [editingMap, setEditingMap] = useState<Record<string, UserSummary[]>>({});

  // Fetch initial workspace projects for authenticated user
  useEffect(() => {
    async function loadWorkspace() {
      try {
        const userQuery = currentUser?.id ? `?userId=${currentUser.id}` : "";
        const wsRes = await fetch(`/api/workspaces${userQuery}`);

        if (wsRes.ok) {
          const ws = await wsRes.json();
          const userProjects = ws.projects || [];
          setProjects(userProjects);

          if (userProjects.length > 0) {
            setSelectedProjectId(userProjects[0].id);
          } else {
            setSelectedProjectId(null);
          }
        }
      } catch (err) {
        console.error("Failed to load workspace info:", err);
      }
    }
    loadWorkspace();
  }, [currentUser?.id]);

  // Fetch members for the currently selected project
  useEffect(() => {
    async function loadProjectMembers() {
      if (!selectedProjectId) {
        // When no project is selected, show empty team or all users?
        // For now, let's keep the previous behavior but we could set to empty
        // setAllUsers([]);
        return;
      }

      try {
        const res = await fetch(`/api/projects/${selectedProjectId}`);
        if (res.ok) {
          const project = await res.json();

          // Extract members from the project (includes owner if they're in members)
          const members = project.members?.map((member: { user: UserSummary; role: string }) => ({
            id: member.user.id,
            name: member.user.name,
            email: member.user.email,
            avatarUrl: member.user.avatarUrl,
            role: member.user.role,
            color: member.user.color
          })) || [];

          setAllUsers(members);
        }
      } catch (err) {
        console.error("Failed to load project members:", err);
      }
    }
    loadProjectMembers();
  }, [selectedProjectId]);

  // TanStack Board Query with optimistic updates
  const {
    data: projectBoard,
    isLoading: isBoardLoading,
    refetch: refetchBoard,
    updateTaskPositionLocally,
    updateTaskFieldsLocally,
    addTaskLocally,
    removeTaskLocally,
  } = useBoardQuery(selectedProjectId);

  // Socket.io Real-time Event Subscriptions
  const { isConnected, startEditingTask, stopEditingTask } = useSocket({
    projectId: selectedProjectId,
    currentUser,
    onPresenceSync: ({ onlineUsers, editingMap }) => {
      setOnlineUsers(onlineUsers);
      setEditingMap(editingMap);
    },
    onTaskCreated: ({ task }) => {
      addTaskLocally(task);
      toast({
        type: "info",
        title: "New Task Created",
        message: `Task "${task.title}" was added.`,
      });
    },
    onTaskUpdated: ({ taskId, task, changes }) => {
      updateTaskFieldsLocally(taskId, { ...changes, ...task });
    },
    onTaskMoved: ({ taskId, sourceColumnId, targetColumnId, position, version, userId }) => {
      updateTaskPositionLocally(taskId, sourceColumnId, targetColumnId, position, version);
      if (userId && userId !== currentUser?.id) {
        const actor = allUsers.find((u) => u.id === userId);
        toast({
          type: "info",
          title: "Task Moved",
          message: `${actor?.name || "A collaborator"} moved a card.`,
        });
      }
    },
    onTaskDeleted: ({ taskId }) => {
      removeTaskLocally(taskId);
      if (selectedTaskId === taskId) {
        setSelectedTaskId(null);
      }
    },
    onTaskEditingChanged: ({ taskId, editingUsers }) => {
      setEditingMap((prev) => ({
        ...prev,
        [taskId]: editingUsers,
      }));
    },
    onActivityLogged: () => {
      // Activity logged
    },
  });

  // Handle Drag-and-Drop Task Reordering & Column Moving
  const handleMoveTask = useCallback(
    async (
      taskId: string,
      sourceColumnId: string,
      targetColumnId: string,
      newPosition: number,
      prevPos: number | null,
      nextPos: number | null
    ) => {
      updateTaskPositionLocally(taskId, sourceColumnId, targetColumnId, newPosition);

      try {
        const res = await fetch(`/api/tasks/${taskId}/move`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetColumnId,
            prevPosition: prevPos,
            nextPosition: nextPos,
            targetPosition: newPosition,
            userId: currentUser?.id,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to persist card position");
        }
      } catch (err) {
        console.error("Card move error, rolling back:", err);
        toast({
          type: "error",
          title: "Move Failed",
          message: "Unable to sync card position. Rolling back to previous state.",
        });
        refetchBoard();
      }
    },
    [currentUser?.id, refetchBoard, toast, updateTaskPositionLocally]
  );

  // Handle Quick Add Task from Column Bottom
  const handleQuickAddTask = useCallback(
    async (title: string, columnId: string) => {
      if (!selectedProjectId) return;
      try {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId: selectedProjectId,
            columnId,
            title,
            priority: "MEDIUM",
            assigneeIds: currentUser ? [currentUser.id] : [],
          }),
        });

        if (res.ok) {
          const newTask = await res.json();
          addTaskLocally(newTask);
          toast({
            type: "success",
            title: "Task Created",
            message: `"${title}" added to column.`,
          });
        }
      } catch (err) {
        console.error("Failed to add task:", err);
        toast({
          type: "error",
          title: "Creation Error",
          message: "Could not create task.",
        });
      }
    },
    [selectedProjectId, currentUser, addTaskLocally, toast]
  );

  // Handle Task Deletion
  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      removeTaskLocally(taskId);
      if (selectedTaskId === taskId) {
        setSelectedTaskId(null);
      }
      try {
        await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      } catch (err) {
        console.error("Failed to delete task:", err);
      }
    },
    [removeTaskLocally, selectedTaskId]
  );

  // Handle Atomic PATCH with Tier 2 OCC & Tier 3 Modal Trigger
  const handlePatchTask = useCallback(
    async (
      taskId: string,
      patchData: {
        title?: string;
        description?: string;
        priority?: Priority;
        dueDate?: string | null;
        columnId?: string;
        clientVersion?: number;
        assigneeIds?: string[];
        modifiedByUserId?: string;
        forceOverwrite?: boolean;
      }
    ): Promise<{ success: boolean; task?: TaskItem }> => {
      try {
        const res = await fetch(`/api/tasks/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patchData),
        });

        // TIER 2: Handle 409 Conflict Response
        if (res.status === 409) {
          const conflictData: ConflictErrorPayload = await res.json();
          toast({
            type: "warning",
            title: "Concurrency Conflict (HTTP 409)",
            message: "Another collaborator saved changes while you were editing.",
            duration: 6000,
          });

          setConflictModalState({
            isOpen: true,
            taskId,
            currentServerTask: conflictData.currentVersion,
            attemptedPatch: conflictData.yourAttempt,
          });

          return { success: false };
        }

        if (!res.ok) {
          throw new Error("Failed to update task");
        }

        const updated: TaskItem = await res.json();
        updateTaskFieldsLocally(taskId, updated);
        toast({
          type: "success",
          title: "Saved",
          message: "Changes saved to database.",
        });
        return { success: true, task: updated };
      } catch (err) {
        console.error("PATCH task error:", err);
        toast({
          type: "error",
          title: "Update Failed",
          message: "Could not save task changes.",
        });
        return { success: false };
      }
    },
    [toast, updateTaskFieldsLocally]
  );

  // Handle Tier 3 Conflict Resolution
  const handleResolveConflict = useCallback(
    async (
      choice: ConflictResolutionChoice,
      mergedData?: { title?: string; description?: string }
    ) => {
      const { taskId, currentServerTask, attemptedPatch } = conflictModalState;
      if (!taskId || !currentServerTask || !attemptedPatch) return;

      if (choice === "ACCEPT_REMOTE") {
        updateTaskFieldsLocally(taskId, currentServerTask);
        toast({
          type: "info",
          title: "Conflict Resolved",
          message: "Teammate's saved version accepted.",
        });
      } else if (choice === "KEEP_MINE") {
        await handlePatchTask(taskId, {
          title: attemptedPatch.title,
          description: attemptedPatch.description,
          priority: attemptedPatch.priority,
          dueDate: attemptedPatch.dueDate,
          forceOverwrite: true,
          modifiedByUserId: currentUser?.id,
        });
        toast({
          type: "success",
          title: "Conflict Resolved",
          message: "Your changes were force-written to the database.",
        });
      } else if (choice === "MERGE_BOTH" && mergedData) {
        await handlePatchTask(taskId, {
          title: mergedData.title,
          description: mergedData.description,
          forceOverwrite: true,
          modifiedByUserId: currentUser?.id,
        });
        toast({
          type: "success",
          title: "Conflict Resolved",
          message: "Blended revision saved as the latest version.",
        });
      }
    },
    [conflictModalState, updateTaskFieldsLocally, handlePatchTask, currentUser?.id, toast]
  );

  // Demo Trigger: Simulate Race Condition / 409 Conflict
  const handleSimulateConflictTrigger = useCallback(async () => {
    if (!projectBoard || projectBoard.columns.length === 0) return;
    const firstTask = projectBoard.columns.flatMap((c) => c.tasks)[0];
    if (!firstTask) return;

    toast({
      type: "info",
      title: "Simulating Concurrent Edit...",
      message: "Submitting edit with outdated clientVersion against database...",
      duration: 3000,
    });

    const res = await fetch(`/api/tasks/${firstTask.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `${firstTask.title} [Local User Edit]`,
        description: `${firstTask.description}\n\n*Added locally by ${currentUser?.name || "User"} concurrently.*`,
        clientVersion: -1,
        modifiedByUserId: currentUser?.id,
      }),
    });

    if (res.status === 409) {
      const conflictData = await res.json();
      setConflictModalState({
        isOpen: true,
        taskId: firstTask.id,
        currentServerTask: conflictData.currentVersion,
        attemptedPatch: conflictData.yourAttempt,
      });
      toast({
        type: "warning",
        title: "Deterministic OCC Triggered (HTTP 409)!",
        message: "Race condition caught by server. Side-by-side diff opened.",
      });
    }
  }, [projectBoard, currentUser, toast]);

  // Global Windows Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === "?" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      }
      if (e.key === "F11") {
        e.preventDefault();
        toggleFullscreen();
      }
      if (e.altKey && e.key.toLowerCase() === "n") {
        e.preventDefault();
        setIsNewTaskModalOpen(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "1") {
        e.preventDefault();
        setActiveNav("dashboard");
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "2") {
        e.preventDefault();
        setActiveNav("tasks");
        setTaskViewMode("board");
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "3") {
        e.preventDefault();
        setActiveNav("tasks");
        setTaskViewMode("list");
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "4") {
        e.preventDefault();
        setActiveNav("team");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleFullscreen]);

  // Priority Task Checklist toggle handler with OCC persistence
  const handleToggleTaskDone = useCallback(
    async (taskId: string) => {
      if (!projectBoard?.columns) return;
      const doneCol = projectBoard.columns.find((c) => c.isDone || c.name.toLowerCase().includes("done")) || projectBoard.columns[projectBoard.columns.length - 1];
      const progCol = projectBoard.columns.find((c) => !c.isDone && c.order > 0) || projectBoard.columns[0];
      
      const currentCol = projectBoard.columns.find((c) => c.tasks.some((t) => t.id === taskId));
      if (!currentCol) return;

      const isCurrentlyDone = currentCol.isDone || currentCol.id === doneCol?.id;
      const targetCol = isCurrentlyDone ? progCol : doneCol;
      if (!targetCol) return;

      updateTaskPositionLocally(taskId, currentCol.id, targetCol.id, 0);

      try {
        await fetch(`/api/tasks/${taskId}/move`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetColumnId: targetCol.id,
            targetIndex: 0,
            modifiedByUserId: currentUser?.id,
          }),
        });
        refetchBoard();
      } catch (err) {
        console.error("Failed to toggle task completion:", err);
      }
    },
    [projectBoard, currentUser?.id, updateTaskPositionLocally, refetchBoard]
  );

  // Filter tasks based on Search, Priority, and Assignee filters
  const filteredColumns = useMemo(() => {
    if (!projectBoard?.columns) return [];

    return projectBoard.columns.map((column) => {
      const filteredTasks = column.tasks.filter((task) => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = task.title.toLowerCase().includes(q);
          const matchDesc = task.description.toLowerCase().includes(q);
          const matchTag = task.tags.some((t) => t.tag.name.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchTag) return false;
        }

        if (selectedPriority !== "ALL" && task.priority !== selectedPriority) {
          return false;
        }

        if (selectedAssigneeId !== "ALL") {
          const isAssigned = task.assignees.some((a) => a.userId === selectedAssigneeId);
          if (!isAssigned) return false;
        }

        return true;
      });

      return {
        ...column,
        tasks: filteredTasks,
      };
    });
  }, [projectBoard, searchQuery, selectedPriority, selectedAssigneeId]);

  const allTasks = useMemo(() => {
    return projectBoard?.columns.flatMap((c) => c.tasks) || [];
  }, [projectBoard]);

  const taskCountsByPriority = useMemo(() => {
    const counts: Record<string, number> = { URGENT: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    allTasks.forEach((t) => {
      if (counts[t.priority] !== undefined) {
        counts[t.priority]++;
      }
    });
    return counts;
  }, [allTasks]);

  const currentProject = projects.find((p) => p.id === selectedProjectId) || null;

  // Show Landing Page if user is not authenticated
  if (isAuthChecked && !currentUser) {
    return <LandingPage onLoginSuccess={handleLoginSuccess} availableUsers={allUsers} />;
  }

  // Loading transition while restoring session
  if (!isAuthChecked) {
    return (
      <div className="atmospheric-canvas min-h-screen h-screen w-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold text-xl animate-pulse">
            A
          </div>
          <div className="text-zinc-400 text-xs font-mono tracking-wider">INITIALIZING ALGOTHON STUDIO...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "atmospheric-canvas min-h-screen h-screen max-h-screen w-screen overflow-hidden flex items-center justify-center relative select-none antialiased transition-all duration-500",
        isFullscreen ? "p-0" : "p-3 sm:p-5 lg:p-6"
      )}
    >
      {/* 3D Stacked perspective cards behind left side matching screenshot depth */}
      <div
        className={cn(
          "relative z-20 w-full flex items-center justify-center transition-all duration-500",
          isFullscreen ? "max-w-none h-full" : "max-w-[1380px] h-[860px] max-h-[94vh]"
        )}
      >
        {!isFullscreen && (
          <>
            <div className="hidden lg:block absolute -left-10 top-8 w-72 h-[88%] -rotate-6 rounded-[36px] bg-gradient-to-b from-[#2e202d] via-[#241a25] to-[#19131c] border border-white/10 opacity-75 shadow-2xl pointer-events-none -z-10" />
            <div className="hidden lg:block absolute -left-5 top-4 w-72 h-[94%] -rotate-3 rounded-[36px] bg-gradient-to-b from-[#342434] via-[#291d2b] to-[#1d1621] border border-white/10 opacity-90 shadow-2xl pointer-events-none -z-10" />
          </>
        )}

        {/* Main Floating Frosted Glass Window */}
        <div
          className={cn(
            "frosted-glass-window w-full h-full flex overflow-hidden shadow-[0_32px_100px_rgba(15,23,42,0.24)] border relative z-20 transition-all duration-500",
            isFullscreen ? "rounded-none border-0" : "rounded-[32px] border-white/70"
          )}
        >
          {/* Left Embedded Smoked Sidebar matching screenshot */}
          <aside className="w-56 shrink-0 bg-gradient-to-b from-[#241c26]/98 via-[#2d222e]/98 to-[#1c1722]/98 border-r border-white/10 p-5 flex flex-col justify-between text-white select-none">
            {/* Top Brand Logo + Nav Items */}
            <div>
              {/* Logo Badge with "A" inside squircle */}
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-zinc-700 via-zinc-800 to-zinc-900 border border-white/20 flex items-center justify-center text-white font-bold text-lg shadow-lg mb-8">
                A
              </div>

            {/* Nav Menu Items matching screenshot */}
            <nav className="space-y-1.5 text-xs font-medium">
              {/* 1. Dashboard */}
              <button
                onClick={() => setActiveNav("dashboard")}
                className={cn(
                  "w-full text-left px-3.5 py-2.5 rounded-2xl flex items-center gap-3 transition-all cursor-pointer",
                  activeNav === "dashboard"
                    ? "bg-white/15 backdrop-blur-md text-white font-semibold shadow-inner border border-white/10"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                )}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              {/* 2. Tasks */}
              <button
                onClick={() => setActiveNav("tasks")}
                className={cn(
                  "w-full text-left px-3.5 py-2.5 rounded-2xl flex items-center gap-3 transition-all cursor-pointer",
                  activeNav === "tasks"
                    ? "bg-white/15 backdrop-blur-md text-white font-semibold shadow-inner border border-white/10"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                )}
              >
                <CheckSquare className="w-4 h-4" />
                <span>Tasks</span>
              </button>

              {/* 3. Team */}
              <button
                onClick={() => setActiveNav("team")}
                className={cn(
                  "w-full text-left px-3.5 py-2.5 rounded-2xl flex items-center gap-3 transition-all cursor-pointer",
                  activeNav === "team"
                    ? "bg-white/15 backdrop-blur-md text-white font-semibold shadow-inner border border-white/10"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Users className="w-4 h-4" />
                <span>Team</span>
              </button>
            </nav>
          </div>

        </aside>

        {/* Right Content Area inside the Window Frame */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {activeNav === "dashboard" ? (
            !currentProject ? (
              /* Show Create Project Prompt when no project selected */
              <div className="flex-1 flex flex-col items-center justify-center py-12">
                <div className="w-full max-w-xl text-center p-8 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm">
                  <div className="flex items-center justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl">
                      +
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    No Active Project
                  </h2>
                  <p className="text-zinc-300 mb-6">
                    Create or join a project to start collaborating with your team.
                  </p>
                  <button
                    onClick={() => setIsCreateProjectModalOpen(true)}
                    className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create New Project</span>
                  </button>
                  <button
                    onClick={() => setIsProjectAccessModalOpen(true)}
                    className="mt-4 w-full py-3 px-6 rounded-xl border border-white/20 text-white font-medium flex items-center justify-center gap-3 transition-all duration-300 hover:bg-white/10"
                  >
                    <Hash className="w-4 h-4" />
                    <span>Join Project with Code</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Screenshot-matching Glassmorphic Dashboard */
              <GlassmorphicDashboard
                currentProject={currentProject}
                projects={projects}
                onSelectProject={(id) => setSelectedProjectId(id)}
                currentUser={currentUser}
                allUsers={allUsers}
                onLogout={handleLogout}
                onOpenCreateProjectModal={() => setIsCreateProjectModalOpen(true)}
                onOpenProjectAccessModal={() => setIsProjectAccessModalOpen(true)}
                tasks={allTasks}
                onTaskClick={(task) => setSelectedTaskId(task.id)}
                onOpenNewTaskModal={() => setIsNewTaskModalOpen(true)}
                isFullscreen={isFullscreen}
                onToggleFullscreen={toggleFullscreen}
                onFilterByTag={(tag) => {
                  setActiveNav("tasks");
                  setSearchQuery(tag);
                }}
                onToggleTaskDone={handleToggleTaskDone}
                projectBoard={projectBoard}
              />
            )
          ) : activeNav === "team" ? (
            /* Enchanted Engineering Team Directory View with Traction Physics */
            <TeamHubView
              allUsers={allUsers}
              currentUser={currentUser}
              onSwitchUser={(user) => {
                setCurrentUser(user);
                toast({
                  type: "info",
                  title: "Persona Switched",
                  message: `Now acting as ${user.name}.`,
                });
              }}
              allTasks={allTasks}
              onTaskClick={(task) => setSelectedTaskId(task.id)}
              onOpenNewTaskModal={() => setIsNewTaskModalOpen(true)}
              onFilterByMemberInBoard={(memberId) => {
                setSelectedAssigneeId(memberId);
                setActiveNav("tasks");
                toast({
                  type: "info",
                  title: "Filter Applied",
                  message: "Kanban pipeline filtered by teammate.",
                });
              }}
            />
          ) : (
            /* Kanban Board & Table List View */
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-zinc-950/85 backdrop-blur-xl">
              {/* Board Header Bar */}
              <div className="px-5 py-3 border-b border-white/[0.08] flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Task Pipeline</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {allTasks.length} Cards
                    </span>
                  </h2>
                </div>

                {/* View Mode Toggle: Board vs List */}
                <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-xl border border-zinc-800">
                  <button
                    onClick={() => setTaskViewMode("board")}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                      taskViewMode === "board"
                        ? "bg-zinc-800 text-white shadow-xs"
                        : "text-zinc-400 hover:text-zinc-200"
                    )}
                  >
                    Kanban
                  </button>
                  <button
                    onClick={() => setTaskViewMode("list")}
                    className={cn(
                      "px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                      taskViewMode === "list"
                        ? "bg-zinc-800 text-white shadow-xs"
                        : "text-zinc-400 hover:text-zinc-200"
                    )}
                  >
                    Table
                  </button>
                </div>
              </div>

              {/* Filter Bar */}
              <BoardFilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedPriority={selectedPriority}
                onPriorityChange={setSelectedPriority}
                selectedAssigneeId={selectedAssigneeId}
                onAssigneeChange={setSelectedAssigneeId}
                allUsers={allUsers}
                onQuickNewTask={() => setIsNewTaskModalOpen(true)}
                onSimulateConflictTrigger={handleSimulateConflictTrigger}
                taskCountsByPriority={taskCountsByPriority}
              />

              {/* Board / List */}
              {isBoardLoading ? (
                <div className="flex-1 flex gap-4 p-4 overflow-x-auto min-h-0 items-start">
                  <KanbanColumnSkeleton />
                  <KanbanColumnSkeleton />
                  <KanbanColumnSkeleton />
                </div>
              ) : taskViewMode === "board" ? (
                <KanbanBoard
                  columns={filteredColumns}
                  projectId={selectedProjectId || ""}
                  onTaskClick={(task) => setSelectedTaskId(task.id)}
                  onAddTask={handleQuickAddTask}
                  onMoveTask={handleMoveTask}
                  onDeleteTask={handleDeleteTask}
                  editingMap={editingMap}
                />
              ) : (
                <ListView
                  columns={filteredColumns}
                  onTaskClick={(task) => setSelectedTaskId(task.id)}
                  onQuickNewTask={() => setIsNewTaskModalOpen(true)}
                  editingMap={editingMap}
                />
              )}
            </div>
          )}
        </main>
      </div>
      </div>

      {/* Slide-over Task Detail Drawer */}
      <TaskDetailDrawer
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        currentUser={currentUser}
        allUsers={allUsers}
        onPatchTask={handlePatchTask}
        onStartEditing={startEditingTask}
        onStopEditing={stopEditingTask}
        activeEditors={selectedTaskId ? editingMap[selectedTaskId] || [] : []}
        onDeleteTask={handleDeleteTask}
        columns={projectBoard?.columns?.map((c) => ({ id: c.id, name: c.name, color: c.color })) || []}
      />

      {/* New Task Creation Modal */}
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        columns={projectBoard?.columns || []}
        allUsers={allUsers}
        projectId={selectedProjectId || ""}
        onCreateTask={async (data) => {
          const res = await fetch("/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });
          if (res.ok) {
            const task = await res.json();
            addTaskLocally(task);
            toast({
              type: "success",
              title: "Task Created",
              message: `"${task.title}" created successfully.`,
            });
          }
        }}
      />

      {/* Tier 3: 3-Way Conflict Resolution Side-by-Side Modal */}
      <ConflictResolutionModal
        isOpen={conflictModalState.isOpen}
        onClose={() =>
          setConflictModalState({
            isOpen: false,
            taskId: "",
            currentServerTask: null,
            attemptedPatch: null,
          })
        }
        taskId={conflictModalState.taskId}
        currentServerTask={conflictModalState.currentServerTask}
        attemptedPatch={conflictModalState.attemptedPatch}
        onResolve={handleResolveConflict}
      />

      {/* Command Palette Modal (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        tasks={allTasks}
        projects={projects}
        currentProjectId={selectedProjectId}
        onSelectProject={(id) => setSelectedProjectId(id)}
        onSelectTask={(task) => setSelectedTaskId(task.id)}
        onSelectView={(view) => {
          if (view === "dashboard") setActiveNav("dashboard");
          else {
            setActiveNav("tasks");
            setTaskViewMode(view === "board" ? "board" : "list");
          }
        }}
        onOpenNewTaskModal={() => setIsNewTaskModalOpen(true)}
        onSimulateConflict={handleSimulateConflictTrigger}
        allUsers={allUsers}
        onSwitchUser={(user) => {
          setCurrentUser(user);
          toast({
            type: "info",
            title: "User Switched",
            message: `Now viewing as ${user.name}.`,
          });
        }}
      />

      {/* Windows Keyboard Shortcuts Cheat-sheet Modal (?) */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* WebSocket Live Connection Health Modal */}
      <ConnectionHealthModal
        isOpen={isConnectionHealthOpen}
        onClose={() => setIsConnectionHealthOpen(false)}
        isWsConnected={isConnected}
        currentUser={currentUser}
        projectName={currentProject?.name || "Algothon"}
      />

      {/* Team Directory Modal */}
      <TeamDirectoryModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        allUsers={allUsers}
        currentUser={currentUser}
        onSwitchUser={(user) => {
          setCurrentUser(user);
          toast({
            type: "info",
            title: "User Switched",
            message: `Now viewing as ${user.name}.`,
          });
        }}
      />

      {/* Create New Project / Join with Code Modal */}
      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        currentUser={currentUser}
        onProjectCreated={handleProjectCreated}
      />

      {/* Project Access & Join Request Permissions Modal */}
      <ProjectAccessModal
        isOpen={isProjectAccessModalOpen}
        onClose={() => setIsProjectAccessModalOpen(false)}
        projectId={selectedProjectId || ""}
        projectName={currentProject?.name || "Project"}
        projectCode={currentProject?.code}
        isOwner={true}
      />
    </div>
  );
}
