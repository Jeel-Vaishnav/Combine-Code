"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Copy,
  Check,
  Shield,
  UserCheck,
  UserX,
  Users,
  Sparkles,
  Clock,
  Mail,
  ChevronDown,
  RefreshCw,
  Hash,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

interface JoinRequestItem {
  id: string;
  projectId: string;
  userId: string;
  status: string;
  note?: string;
  assignedRole: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    role: string;
    color?: string;
  };
}

interface ProjectAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
  projectCode?: string;
  isOwner?: boolean;
}

export function ProjectAccessModal({
  isOpen,
  onClose,
  projectId,
  projectName,
  projectCode,
  isOwner = true,
}: ProjectAccessModalProps) {
  const { toast } = useToast();
  const [requests, setRequests] = useState<JoinRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  // Role selections mapped by requestId
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>({});

  // Fetch pending requests for this project
  const fetchRequests = async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/requests`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error("Fetch requests failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && projectId) {
      fetchRequests();
    }
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  // Handle Accept Request with assigned role
  const handleAccept = async (requestId: string) => {
    const assignedRole = selectedRoles[requestId] || "MEMBER";
    try {
      const res = await fetch(`/api/projects/${projectId}/requests`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          action: "ACCEPT",
          assignedRole,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to accept request");
      }

      const data = await res.json();
      toast({
        type: "success",
        title: "Access Granted! 🎉",
        message: data.message || `Member admitted with role ${assignedRole}.`,
      });

      // Remove from pending list
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err: any) {
      console.error("Accept error:", err);
      toast({
        type: "error",
        title: "Action Failed",
        message: err.message || "Could not accept request",
      });
    }
  };

  // Handle Decline Request
  const handleDecline = async (requestId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/requests`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          action: "DECLINE",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to decline request");
      }

      toast({
        type: "info",
        title: "Request Declined",
        message: "The join request was declined.",
      });

      // Remove from pending list
      setRequests((prev) => prev.filter((r) => r.id !== requestId));
    } catch (err: any) {
      console.error("Decline error:", err);
      toast({
        type: "error",
        title: "Action Failed",
        message: err.message || "Could not decline request",
      });
    }
  };

  // Copy Code
  const handleCopyCode = () => {
    if (!projectCode) return;
    navigator.clipboard.writeText(projectCode);
    setHasCopied(true);
    toast({
      type: "info",
      title: "Project Code Copied",
      message: `${projectCode} copied to clipboard!`,
    });
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-xl rounded-3xl bg-zinc-900/95 border border-white/20 shadow-2xl overflow-hidden p-6 sm:p-8">
        {/* Ambient background glows */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-zinc-300 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Project Access & Permissions
            </h3>
            <p className="text-xs text-zinc-400">
              Manage join requests and invite codes for <strong>{projectName}</strong>
            </p>
          </div>
        </div>

        {/* Project Code Banner */}
        {projectCode && (
          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/15 flex items-center justify-between gap-4 mb-6 relative z-10">
            <div>
              <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
                Unique Project Invite Code
              </div>
              <div className="text-lg font-mono font-bold text-blue-400 tracking-wider mt-0.5">
                {projectCode}
              </div>
              <div className="text-[11px] text-zinc-400 mt-0.5">
                Share this code with team members to let them request access.
              </div>
            </div>

            <button
              onClick={handleCopyCode}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-blue-500/20 shrink-0"
            >
              {hasCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Pending Requests Section */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Pending Join Requests
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-mono border border-blue-500/30">
                {requests.length}
              </span>
            </div>

            <button
              onClick={fetchRequests}
              disabled={isLoading}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Refresh requests"
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
            </button>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-xs text-zinc-400 font-mono animate-pulse">
              Loading join requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="py-8 px-4 rounded-2xl bg-zinc-950/40 border border-white/5 text-center">
              <Sparkles className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <div className="text-xs font-semibold text-zinc-300">No pending join requests</div>
              <div className="text-[11px] text-zinc-400 mt-1 max-w-xs mx-auto">
                Share your project code <span className="font-mono text-blue-400">{projectCode || "above"}</span> with teammates so they can request to join.
              </div>
            </div>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="p-3.5 rounded-2xl bg-zinc-950/70 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <Avatar
                      name={req.user.name}
                      src={req.user.avatarUrl}
                      color={req.user.color || "#3b82f6"}
                      size="md"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">{req.user.name}</div>
                      <div className="text-[11px] text-zinc-400 truncate flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-zinc-400" />
                        <span>{req.user.email}</span>
                      </div>
                      {req.note && (
                        <div className="text-[11px] text-zinc-300 italic mt-1 bg-white/5 px-2 py-1 rounded-lg">
                          "{req.note}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Role Selector & Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <select
                      value={selectedRoles[req.id] || "MEMBER"}
                      onChange={(e) =>
                        setSelectedRoles((prev) => ({ ...prev, [req.id]: e.target.value }))
                      }
                      className="px-2.5 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-medium"
                    >
                      <option value="MEMBER">Member</option>
                      <option value="LEAD">Lead</option>
                      <option value="ADMIN">Admin</option>
                      <option value="VIEWER">Viewer</option>
                    </select>

                    <button
                      onClick={() => handleAccept(req.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm shadow-emerald-600/30"
                      title="Accept & Assign Role"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Accept</span>
                    </button>

                    <button
                      onClick={() => handleDecline(req.id)}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                      title="Decline Request"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>Decline</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
