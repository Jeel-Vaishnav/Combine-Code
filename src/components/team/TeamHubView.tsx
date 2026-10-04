"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Mail,
  Shield,
  CheckCircle2,
  Sparkles,
  Search,
  Check,
  ExternalLink,
  Code2,
  Cpu,
  Layers,
  Activity,
  Flame,
  UserCheck,
  Clock,
  ArrowRight,
  Filter,
} from "lucide-react";
import { UserSummary, TaskItem } from "@/types/models";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

interface TeamHubViewProps {
  allUsers: UserSummary[];
  currentUser: UserSummary | null;
  onSwitchUser?: (user: UserSummary) => void;
  allTasks: TaskItem[];
  onTaskClick: (task: TaskItem) => void;
  onOpenNewTaskModal: () => void;
  onFilterByMemberInBoard?: (memberId: string) => void;
}

// Interactive 3D Card with Mouse-tracking Traction and Glass Specular Glare
function TractionMemberCard({
  user,
  isCurrent,
  assignedTasks,
  onTaskClick,
  onFilterTasks,
}: {
  user: UserSummary;
  isCurrent: boolean;
  assignedTasks: TaskItem[];
  onTaskClick: (task: TaskItem) => void;
  onFilterTasks: () => void;
}) {
  const { toast } = useToast();
  const [coords, setCoords] = useState({ x: 50, y: 50, rx: 0, ry: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Mouse traction physics
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    // Calculate subtle 3D tilt angles (-5deg to +5deg)
    const rx = -((y - 50) / 50) * 5;
    const ry = ((x - 50) / 50) * 5;
    setCoords({ x, y, rx, ry });
  };

  // Indian persona engineering specs
  const personaMeta: Record<
    string,
    { title: string; specialty: string; initials: string; gradient: string }
  > = {
    usr_jeel: {
      title: "Engineering Lead & Architect",
      specialty: "System Architecture, Realtime WebSockets, OCC Concurrency",
      initials: "J.V.",
      gradient: "from-[#9f1239]/25 via-[#2b1822]/40 to-transparent",
    },
    usr_aarav: {
      title: "Senior Frontend Specialist",
      specialty: "Next.js 15, Glassmorphism, Micro-Animations & Ergonomics",
      initials: "A.P.",
      gradient: "from-[#2563eb]/25 via-[#182338]/40 to-transparent",
    },
    usr_lakshya: {
      title: "Staff Backend Engineer",
      specialty: "Prisma ORM, SQLite Engine, Data Consistency & OCC",
      initials: "L.K.",
      gradient: "from-[#d97706]/25 via-[#302216]/40 to-transparent",
    },
    usr_priya: {
      title: "Product Lead & Admin",
      specialty: "Sprint Strategy, Design Systems & OCC Conflict Audits",
      initials: "P.P.",
      gradient: "from-[#ec4899]/25 via-[#311728]/40 to-transparent",
    },
    usr_rohan: {
      title: "Platform & DevOps Engineer",
      specialty: "Low-Latency Socket Server, Zero-Downtime Deployment",
      initials: "R.M.",
      gradient: "from-[#10b981]/25 via-[#162e24]/40 to-transparent",
    },
  };

  const meta = personaMeta[user.id] || {
    title: user.role === "LEAD" ? "Engineering Lead" : "Core Engineer",
    specialty: "Fullstack Engineering & Agile Execution",
    initials: user.name.slice(0, 2).toUpperCase(),
    gradient: "from-zinc-700/25 via-zinc-800/40 to-transparent",
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCoords({ x: 50, y: 50, rx: 0, ry: 0 });
      }}
      onMouseMove={handleMouseMove}
      style={{
        transform: isHovered
          ? `perspective(1000px) rotateX(${coords.rx}deg) rotateY(${coords.ry}deg) translateZ(6px)`
          : "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)",
        transition: isHovered ? "transform 0.1s ease-out" : "transform 0.4s ease-out",
      }}
      className={cn(
        "relative rounded-3xl p-5 border backdrop-blur-2xl transition-all duration-300 overflow-hidden select-none group",
        isCurrent
          ? "bg-gradient-to-br from-white/95 via-white/85 to-blue-50/90 border-blue-400/80 shadow-[0_16px_40px_-10px_rgba(59,130,246,0.3)] ring-2 ring-blue-500/30"
          : "bg-white/80 hover:bg-white/95 border-white/80 hover:border-white shadow-md shadow-black/5"
      )}
    >
      {/* Specular Glass Glare Traction Highlight */}
      {isHovered && (
        <div
          className="absolute inset-0 pointer-events-none rounded-[inherit] transition-opacity duration-300 z-10"
          style={{
            background: `radial-gradient(circle 240px at ${coords.x}% ${coords.y}%, rgba(255, 255, 255, 0.4), transparent 70%)`,
          }}
        />
      )}

      {/* Top Banner Row */}
      <div className="flex items-start justify-between gap-3 relative z-20">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <Avatar
              name={user.name}
              src={user.avatarUrl}
              color={user.color}
              size="lg"
              isOnline={true}
              className="ring-2 ring-white shadow-md"
            />
            {/* Initials capsule pill on avatar corner */}
            <span
              style={{ backgroundColor: user.color }}
              className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white shadow-sm ring-1 ring-white"
            >
              {meta.initials}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-zinc-900 tracking-tight">{user.name}</h3>
              {isCurrent && (
                <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold shadow-xs">
                  Active Persona
                </span>
              )}
            </div>
            <div className="text-xs font-semibold text-zinc-700 mt-0.5">{meta.title}</div>
            <div className="text-[11px] text-zinc-400 font-mono flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3 h-3 text-zinc-400" />
              <span>{user.email}</span>
            </div>
          </div>
        </div>

        {/* Member Status Indicator */}
        <div>
          {isCurrent ? (
            <div className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span>You (Active)</span>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-zinc-100 text-zinc-700 border border-zinc-200 text-xs font-semibold flex items-center gap-1.5 shadow-xs">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Member</span>
            </div>
          )}
        </div>
      </div>

      {/* Specialty Description */}
      <div className="mt-4 p-3 rounded-2xl bg-zinc-50/80 border border-zinc-100 text-xs text-zinc-600 relative z-20 flex items-start gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
        <span className="leading-relaxed">{meta.specialty}</span>
      </div>

      {/* Workload Metrics & Assigned Tasks */}
      <div className="mt-4 pt-3 border-t border-black/[0.06] flex flex-col gap-2.5 relative z-20">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-zinc-500 font-medium">
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            <span>Assigned Tasks ({assignedTasks.length})</span>
          </div>

          {assignedTasks.length > 0 && (
            <button
              onClick={onFilterTasks}
              className="text-[11px] text-blue-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View in Board</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Clickable Assigned Task Pills */}
        {assignedTasks.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {assignedTasks.slice(0, 3).map((t) => (
              <button
                key={t.id}
                onClick={() => onTaskClick(t)}
                className="traction-pill text-left px-2.5 py-1 rounded-xl bg-white hover:bg-blue-50/80 border border-zinc-200 text-[11px] font-medium text-zinc-800 hover:text-blue-700 flex items-center gap-1.5 shadow-xs cursor-pointer"
                title={`Open task: ${t.title}`}
              >
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    t.priority === "URGENT"
                      ? "bg-rose-500"
                      : t.priority === "HIGH"
                      ? "bg-amber-500"
                      : "bg-blue-500"
                  )}
                />
                <span className="max-w-[130px] truncate">{t.title}</span>
              </button>
            ))}
            {assignedTasks.length > 3 && (
              <span className="px-2 py-1 rounded-xl bg-zinc-100 text-[10px] font-mono text-zinc-500 font-bold">
                +{assignedTasks.length - 3} more
              </span>
            )}
          </div>
        ) : (
          <div className="text-[11px] text-zinc-400 italic">No tasks currently assigned. Ready for sprint pickup.</div>
        )}
      </div>
    </div>
  );
}

export function TeamHubView({
  allUsers,
  currentUser,
  onSwitchUser,
  allTasks,
  onTaskClick,
  onOpenNewTaskModal,
  onFilterByMemberInBoard,
}: TeamHubViewProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("ALL");

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return allUsers.filter((u) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = u.name.toLowerCase().includes(q);
        const matchEmail = u.email.toLowerCase().includes(q);
        const matchRole = u.role.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchRole) return false;
      }

      if (selectedRoleFilter !== "ALL") {
        if (selectedRoleFilter === "LEAD" && u.role !== "LEAD") return false;
        if (selectedRoleFilter === "MEMBER" && u.role !== "MEMBER") return false;
        if (selectedRoleFilter === "ADMIN" && u.role !== "ADMIN") return false;
      }

      return true;
    });
  }, [allUsers, searchQuery, selectedRoleFilter]);

  // Tasks assigned per user
  const tasksByUser = useMemo(() => {
    const map: Record<string, TaskItem[]> = {};
    allUsers.forEach((u) => {
      map[u.id] = allTasks.filter((t) => t.assignees.some((a) => a.userId === u.id));
    });
    return map;
  }, [allUsers, allTasks]);

  return (
    <div
      className="flex-1 flex flex-col min-h-0 p-5 sm:p-7 overflow-y-auto relative transition-all duration-500"
      style={{
        background:
          "linear-gradient(112deg, rgba(46, 32, 43, 0.96) 0%, rgba(41, 30, 40, 0.93) 38%, rgba(55, 38, 48, 0.88) 46%, rgba(228, 236, 248, 0.78) 64%, rgba(244, 248, 253, 0.92) 100%)",
      }}
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 select-none border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Users className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white drop-shadow-sm">
              Engineering Team Directory
            </h1>
          </div>
          <p className="text-xs text-zinc-300 font-medium tracking-wide mt-1">
            Engineering Team Directory · Real-time OCC Presence & Interactive Traction Physics
          </p>
        </div>

        {/* Global Team Stats Pills */}
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-zinc-200 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white">{allUsers.length} Online</span>
          </div>

          <button
            onClick={onOpenNewTaskModal}
            className="traction-btn px-3.5 py-1.5 rounded-2xl bg-white/90 hover:bg-white text-zinc-900 border border-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Assign Task</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="my-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Input with Traction Glow */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, role, or skill..."
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-white/80 focus:bg-white border border-white/90 shadow-sm text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
          />
        </div>

        {/* Role Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-zinc-900/60 p-1 rounded-2xl border border-white/10 backdrop-blur-md self-stretch sm:self-auto">
          {[
            { id: "ALL", label: `All (${allUsers.length})` },
            { id: "LEAD", label: "Leads" },
            { id: "MEMBER", label: "Members" },
            { id: "ADMIN", label: "Admins" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedRoleFilter(tab.id)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                selectedRoleFilter === tab.id
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-300 hover:text-white hover:bg-white/10"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Interactive Member Cards with Mouse Traction */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 flex-1">
        {filteredMembers.map((member) => (
          <TractionMemberCard
            key={member.id}
            user={member}
            isCurrent={member.id === currentUser?.id}
            assignedTasks={tasksByUser[member.id] || []}
            onTaskClick={onTaskClick}
            onFilterTasks={() => {
              if (onFilterByMemberInBoard) {
                onFilterByMemberInBoard(member.id);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}
