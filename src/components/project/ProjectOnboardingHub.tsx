"use client";

import React from "react";
import {
  Sparkles,
  Plus,
  Hash,
  ShieldCheck,
  ArrowRight,
  LogOut,
  Layers,
  Users,
  Send,
  Zap,
} from "lucide-react";
import { UserSummary } from "@/types/models";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

interface ProjectOnboardingHubProps {
  currentUser: UserSummary;
  onOpenCreateProject: () => void;
  onOpenJoinProject: () => void;
  onLogout: () => void;
}

export function ProjectOnboardingHub({
  currentUser,
  onOpenCreateProject,
  onOpenJoinProject,
  onLogout,
}: ProjectOnboardingHubProps) {
  return (
    <div className="atmospheric-canvas min-h-screen w-screen flex flex-col items-center justify-center p-4 sm:p-8 relative select-none overflow-hidden">
      {/* Background Neon Aura Spheres */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Top Session Bar */}
      <header className="absolute top-6 max-w-5xl w-[92%] flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-blue-500/30">
            A
          </div>
          <div>
            <div className="font-extrabold tracking-tight text-white text-base">ALGOTHON</div>
            <div className="text-[10px] text-zinc-400 font-mono">Workspace Studio</div>
          </div>
        </div>

        {/* User Card & Sign Out */}
        <div className="flex items-center gap-3 bg-zinc-900/80 backdrop-blur-xl border border-white/10 px-3.5 py-1.5 rounded-2xl shadow-lg">
          <Avatar
            name={currentUser.name}
            src={currentUser.avatarUrl}
            color={currentUser.color || "#3b82f6"}
            size="sm"
            isOnline={true}
          />
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
            <div className="text-[10px] text-zinc-400 truncate">{currentUser.email}</div>
          </div>
          <button
            onClick={onLogout}
            className="p-1.5 rounded-xl hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300 transition-colors cursor-pointer ml-1"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Glassmorphic Welcome Card */}
      <div className="w-full max-w-3xl rounded-[36px] bg-zinc-950/80 backdrop-blur-2xl border border-white/20 p-8 sm:p-12 shadow-[0_32px_100px_rgba(0,0,0,0.7)] text-center relative z-10 animate-in fade-in zoom-in-95 duration-300">
        {/* Glowing Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Project Onboarding Station</span>
        </div>

        {/* Welcome Greeting */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Welcome, {currentUser.name}! 👋
        </h1>
        <p className="mt-3 text-sm text-zinc-300 max-w-lg mx-auto leading-relaxed">
          You don't have any active projects yet. To get started, create a new project with an auto-generated unique code, or join an existing project with an invite code from your team.
        </p>

        {/* 2 Main Action Cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
          {/* Card 1: Create Project */}
          <div
            onClick={onOpenCreateProject}
            className="p-6 rounded-3xl bg-gradient-to-b from-blue-950/40 via-zinc-900/60 to-zinc-950/80 border border-blue-500/30 hover:border-blue-400 shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                Create a New Project
              </h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Generate an automatic unique invite code (e.g. <code>ALG-9842-NEX</code>), set up Kanban columns, and become the project Owner.
              </p>

              <div className="mt-4 space-y-1.5 text-[11px] text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span>Unique Project Code generation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span>Full role permissioning control</span>
                </div>
              </div>
            </div>

            <button className="mt-6 w-full py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:from-blue-500 group-hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2">
              <span>Create Project</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Join with Code */}
          <div
            onClick={onOpenJoinProject}
            className="p-6 rounded-3xl bg-gradient-to-b from-purple-950/40 via-zinc-900/60 to-zinc-950/80 border border-purple-500/30 hover:border-purple-400 shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                <Hash className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                Join with Code
              </h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Have a project code from your lead? Enter it to request access. The creator will review and assign your engineering role.
              </p>

              <div className="mt-4 space-y-1.5 text-[11px] text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span>1-Click join request submission</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span>Role assigned upon acceptance</span>
                </div>
              </div>
            </div>

            <button className="mt-6 w-full py-2.5 rounded-2xl bg-white/10 group-hover:bg-white/20 border border-white/20 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2">
              <span>Enter Project Code</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
