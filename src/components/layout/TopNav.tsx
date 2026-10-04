"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Layers,
  FolderGit2,
  BarChart3,
  Kanban,
  TableProperties,
  Wifi,
  WifiOff,
  UserCheck,
  ChevronDown,
  Search,
  Keyboard,
  Radio,
  Sparkles,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { UserSummary } from "@/types/models";
import { cn } from "@/lib/utils";

interface TopNavProps {
  currentProject: { id: string; name: string; slug: string } | null;
  projects: { id: string; name: string; slug: string }[];
  onSelectProject: (projectId: string) => void;
  activeView: "board" | "list" | "dashboard";
  onSelectView: (view: "board" | "list" | "dashboard") => void;
  onlineUsers: UserSummary[];
  allUsers: UserSummary[];
  currentUser: UserSummary | null;
  onSwitchUser: (user: UserSummary) => void;
  isWsConnected: boolean;
  onOpenCommandPalette: () => void;
  onOpenShortcuts: () => void;
  onOpenConnectionHealth: () => void;
}

export function TopNav({
  currentProject,
  projects,
  onSelectProject,
  activeView,
  onSelectView,
  onlineUsers,
  allUsers,
  currentUser,
  onSwitchUser,
  isWsConnected,
  onOpenCommandPalette,
  onOpenShortcuts,
  onOpenConnectionHealth,
}: TopNavProps) {
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const projectDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        projectDropdownRef.current &&
        !projectDropdownRef.current.contains(e.target as Node)
      ) {
        setIsProjectDropdownOpen(false);
      }
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(e.target as Node)
      ) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <header className="h-14 bg-zinc-950/85 backdrop-blur-xl border-b border-white/[0.08] px-4 flex items-center justify-between z-30 sticky top-0 select-none shadow-md">
      {/* Left: Brand + Project Switcher + View Toggles */}
      <div className="flex items-center gap-3.5">
        {/* Workspace Brand */}
        <div className="flex items-center gap-2.5 pr-3 border-r border-zinc-800">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Layers className="w-4 h-4" />
          </div>
          <div className="hidden sm:block">
            <div className="font-bold text-xs tracking-tight text-zinc-100 flex items-center gap-1.5">
              <span>ALGOTHON</span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                PRO
              </span>
            </div>
            <div className="text-[9px] text-zinc-400 font-mono">Real-Time Core</div>
          </div>
        </div>

        {/* Project Selector */}
        <div className="relative" ref={projectDropdownRef}>
          <button
            onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-zinc-900 border border-zinc-800/90 text-xs font-medium text-zinc-200 transition-colors shadow-xs"
          >
            <FolderGit2 className="w-3.5 h-3.5 text-blue-400" />
            <span className="truncate max-w-[150px] sm:max-w-[220px]">
              {currentProject?.name || "Select Project"}
            </span>
            <ChevronDown className="w-3 h-3 text-zinc-400" />
          </button>

          {isProjectDropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-72 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/80 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="text-[10px] uppercase font-semibold text-zinc-400 px-2 py-1 flex items-center justify-between">
                <span>Active Projects</span>
                <span className="font-mono text-[9px]">{projects.length} Total</span>
              </div>
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onSelectProject(p.id);
                    setIsProjectDropdownOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors",
                    p.id === currentProject?.id
                      ? "bg-blue-600/15 text-blue-300 font-medium border border-blue-500/30"
                      : "text-zinc-300 hover:bg-zinc-800/80"
                  )}
                >
                  <div className="truncate pr-2">
                    <div className="truncate font-medium">{p.name}</div>
                    <div className="text-[10px] text-zinc-400 font-mono">/{p.slug}</div>
                  </div>
                  {p.id === currentProject?.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Switcher: Board vs List vs Dashboard */}
        <div className="flex items-center bg-zinc-900/90 p-0.5 rounded-lg border border-zinc-800 shadow-inner">
          <button
            onClick={() => onSelectView("board")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer",
              activeView === "board"
                ? "bg-zinc-800 text-zinc-100 shadow-xs border border-white/10"
                : "text-zinc-400 hover:text-zinc-200"
            )}
            title="Kanban Board View (Ctrl+1)"
          >
            <Kanban className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Board</span>
          </button>

          <button
            onClick={() => onSelectView("list")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer",
              activeView === "list"
                ? "bg-zinc-800 text-zinc-100 shadow-xs border border-white/10"
                : "text-zinc-400 hover:text-zinc-200"
            )}
            title="Table / List View (Ctrl+2)"
          >
            <TableProperties className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Table</span>
          </button>

          <button
            onClick={() => onSelectView("dashboard")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer",
              activeView === "dashboard"
                ? "bg-zinc-800 text-zinc-100 shadow-xs border border-white/10"
                : "text-zinc-400 hover:text-zinc-200"
            )}
            title="Health & Velocity Dashboard (Ctrl+3)"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Dashboard</span>
          </button>
        </div>
      </div>

      {/* Right: Search / Command Palette + Live Presence + Collaborator Switcher + WebSocket Status */}
      <div className="flex items-center gap-2.5">
        {/* Command Palette Trigger Button */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-400 hover:text-zinc-200 transition-colors shadow-xs"
          title="Open Command Palette"
        >
          <Search className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[11px]">Search commands...</span>
          <span className="kbd-shortcut ml-1">Ctrl K</span>
        </button>

        {/* Keyboard Shortcuts Trigger Button */}
        <button
          onClick={onOpenShortcuts}
          className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-transparent hover:border-zinc-700 transition-colors"
          title="Keyboard shortcuts (?)"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        {/* Live WebSocket Status indicator (Clickable for health diagnostics) */}
        <button
          onClick={onOpenConnectionHealth}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] border font-medium transition-transform active:scale-95 cursor-pointer",
            isWsConnected
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 shadow-xs"
              : "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
          )}
          title="Click to view WebSocket connection telemetry"
        >
          {isWsConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden lg:inline font-mono">Live Sync</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden lg:inline font-mono">Offline</span>
            </>
          )}
        </button>

        {/* Online Collaborator Avatar Stack */}
        <div
          className="flex items-center -space-x-1.5 overflow-hidden pl-1"
          title={`${onlineUsers.length} teammates online in this project`}
        >
          {onlineUsers.map((u) => (
            <Avatar
              key={u.id}
              name={u.name}
              src={u.avatarUrl}
              color={u.color}
              size="sm"
              isOnline={true}
              className="ring-2 ring-zinc-950 hover:z-10 transition-transform hover:scale-115"
            />
          ))}
        </div>

        {/* Persona / Current Indian User Switcher */}
        {currentUser && (
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors text-xs shadow-xs"
            >
              <Avatar
                name={currentUser.name}
                src={currentUser.avatarUrl}
                color={currentUser.color}
                size="xs"
              />
              <span className="font-semibold text-zinc-200 hidden md:inline max-w-[110px] truncate">
                {currentUser.name}
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 uppercase font-mono border border-zinc-700/50">
                {currentUser.role}
              </span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-68 bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/80 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[10px] uppercase font-semibold text-zinc-400 px-2 py-1 flex items-center justify-between">
                  <span>Switch Teammate Persona</span>
                  <span className="text-zinc-500 font-normal">Indian Team</span>
                </div>
                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      onSwitchUser(u);
                      setIsUserDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center gap-2.5 transition-colors",
                      u.id === currentUser.id
                        ? "bg-blue-600/15 text-blue-300 font-medium border border-blue-500/30"
                        : "text-zinc-300 hover:bg-zinc-800/80"
                    )}
                  >
                    <Avatar name={u.name} src={u.avatarUrl} color={u.color} size="xs" />
                    <div className="flex-1 truncate">
                      <div className="truncate text-zinc-200 font-medium">{u.name}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">{u.role} • {u.email}</div>
                    </div>
                    {u.id === currentUser.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
