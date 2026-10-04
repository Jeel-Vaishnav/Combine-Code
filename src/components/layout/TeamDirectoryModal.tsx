"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { UserSummary } from "@/types/models";
import { Avatar } from "@/components/ui/Avatar";
import { Users, Mail, Shield, CheckCircle2, Sparkles, UserCheck, Search, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  allUsers: UserSummary[];
  currentUser: UserSummary | null;
  onSwitchUser: (user: UserSummary) => void;
}

export function TeamDirectoryModal({
  isOpen,
  onClose,
  allUsers,
  currentUser,
  onSwitchUser,
}: TeamDirectoryModalProps) {
  const [search, setSearch] = useState("");

  if (!isOpen) return null;

  const personaMeta: Record<string, { title: string; initials: string }> = {
    usr_jeel: { title: "Engineering Lead & Architect", initials: "J.V." },
    usr_aarav: { title: "Senior Frontend Specialist", initials: "A.P." },
    usr_lakshya: { title: "Staff Backend Engineer", initials: "L.K." },
    usr_priya: { title: "Product Lead & Admin", initials: "P.P." },
    usr_rohan: { title: "DevOps & Platform Engineer", initials: "R.M." },
  };

  const filteredUsers = allUsers.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.role.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      className="border-white/30 shadow-[0_32px_100px_rgba(0,0,0,0.4)] bg-zinc-950/85 backdrop-blur-3xl rounded-[32px] overflow-hidden"
      title={
        <div className="flex items-center gap-3 text-white">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-500 via-purple-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
            <Users className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight">Engineering Team Directory</div>
            <div className="text-xs text-zinc-400 font-normal">Active Indian personas & OCC contributors</div>
          </div>
        </div>
      }
      description=""
    >
      {/* Search Input */}
      <div className="mb-4">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, role, or email..."
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-white/10 focus:bg-white/15 border border-white/15 text-xs text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
          />
        </div>
      </div>

      {/* Member Cards List with Traction Physics */}
      <div className="space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
        {filteredUsers.map((user) => {
          const isCurrent = user.id === currentUser?.id;
          const meta = personaMeta[user.id] || { title: user.role, initials: user.name.slice(0, 2).toUpperCase() };

          return (
            <div
              key={user.id}
              className={cn(
                "traction-card p-4 rounded-2xl border transition-all flex items-center justify-between group",
                isCurrent
                  ? "bg-gradient-to-r from-blue-600/20 via-blue-500/10 to-transparent border-blue-500/50 text-white shadow-lg shadow-blue-500/10"
                  : "bg-white/[0.04] hover:bg-white/[0.08] border-white/10 hover:border-white/20 text-zinc-300"
              )}
            >
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <Avatar
                    name={user.name}
                    src={user.avatarUrl}
                    color={user.color}
                    size="md"
                    isOnline={true}
                    className="ring-2 ring-white/20 group-hover:scale-105 transition-transform"
                  />
                  <span
                    style={{ backgroundColor: user.color }}
                    className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full text-[8px] font-bold text-white shadow-sm ring-1 ring-white/40"
                  >
                    {meta.initials}
                  </span>
                </div>

                <div>
                  <div className="font-semibold text-sm text-white flex items-center gap-2">
                    <span>{user.name}</span>
                    {isCurrent && (
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-blue-500/30 text-blue-300 border border-blue-500/40 font-mono font-bold shadow-xs">
                        Active Persona
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-zinc-400 font-medium">{meta.title}</div>
                  <div className="text-[11px] text-zinc-500 flex items-center gap-1.5 mt-0.5 font-mono">
                    <Mail className="w-3 h-3 text-zinc-500" />
                    <span>{user.email}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span
                  style={{ borderColor: user.color + "40" }}
                  className="text-[10px] font-mono px-2.5 py-1 rounded-xl bg-white/5 text-zinc-300 border uppercase font-bold"
                >
                  {user.role}
                </span>

                {isCurrent ? (
                  <div className="px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-300 text-xs font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>You</span>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      onSwitchUser(user);
                      onClose();
                    }}
                    className="traction-btn px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/25 text-xs font-semibold text-white transition-all cursor-pointer flex items-center gap-1"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                    <span>Act As</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
