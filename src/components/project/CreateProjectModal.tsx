"use client";

import React, { useState } from "react";
import {
  X,
  Plus,
  Hash,
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  FolderGit2,
  Share2,
  Users,
  Send,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { UserSummary } from "@/types/models";
import { cn } from "@/lib/utils";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSummary | null;
  initialTab?: "CREATE" | "JOIN";
  onProjectCreated: (newProject: { id: string; name: string; slug: string; code?: string; description?: string }) => void;
}

export function CreateProjectModal({
  isOpen,
  onClose,
  currentUser,
  initialTab = "CREATE",
  onProjectCreated,
}: CreateProjectModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"CREATE" | "JOIN">(initialTab);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Create Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdProject, setCreatedProject] = useState<{ id: string; name: string; code: string } | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  // Join Form State
  const [joinCode, setJoinCode] = useState("");
  const [joinNote, setJoinNote] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  if (!isOpen) return null;

  // Handle Create Project
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/projects/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          userId: currentUser?.id,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create project");
      }

      const data = await res.json();
      setCreatedProject({
        id: data.project.id,
        name: data.project.name,
        code: data.code,
      });

      onProjectCreated(data.project);

      toast({
        type: "success",
        title: "Project Created! 🚀",
        message: `Project Code: ${data.code}. Share it with your team!`,
      });
    } catch (err: any) {
      console.error("Create project failed:", err);
      toast({
        type: "error",
        title: "Creation Failed",
        message: err.message || "Could not create project",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Join Project
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim() || !currentUser?.id) return;

    setIsJoining(true);
    try {
      const res = await fetch("/api/projects/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: joinCode.trim(),
          userId: currentUser.id,
          note: joinNote.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit join request");
      }

      toast({
        type: "success",
        title: "Request Sent! 📨",
        message: data.message || "Your join request has been sent to the project creator.",
      });

      onClose();
    } catch (err: any) {
      console.error("Join project failed:", err);
      toast({
        type: "error",
        title: "Join Error",
        message: err.message || "Failed to send join request",
      });
    } finally {
      setIsJoining(false);
    }
  };

  // Copy Code to Clipboard
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setHasCopied(true);
    toast({
      type: "info",
      title: "Code Copied",
      message: `Project code ${code} copied to clipboard!`,
    });
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-lg rounded-3xl bg-zinc-900/95 border border-white/20 shadow-2xl overflow-hidden p-6 sm:p-8">
        {/* Ambient background glows */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-zinc-300 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Success View after creation */}
        {createdProject ? (
          <div className="flex flex-col items-center text-center py-4 relative z-10 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-xl mb-4">
              <Sparkles className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-white tracking-tight">Project Ready & Live!</h3>
            <p className="text-xs text-zinc-300 mt-1 max-w-xs">
              Your unique project code has been generated. Teammates can use this code to request access.
            </p>

            {/* Unique Code Badge Card */}
            <div className="mt-6 w-full p-4 rounded-2xl bg-zinc-950/80 border border-white/15 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">Unique Project Code</div>
                <div className="text-xl font-mono font-bold text-blue-400 tracking-wider mt-0.5">
                  {createdProject.code}
                </div>
              </div>

              <button
                onClick={() => handleCopyCode(createdProject.code)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-500/20"
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

            <button
              onClick={() => {
                setCreatedProject(null);
                onClose();
              }}
              className="mt-6 w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg cursor-pointer"
            >
              Enter Workspace Studio
            </button>
          </div>
        ) : (
          <div className="relative z-10">
            {/* Header Tabs */}
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => setActiveTab("CREATE")}
                className={cn(
                  "flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer",
                  activeTab === "CREATE"
                    ? "bg-white text-zinc-900 shadow-md"
                    : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                )}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Project</span>
              </button>

              <button
                onClick={() => setActiveTab("JOIN")}
                className={cn(
                  "flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer",
                  activeTab === "JOIN"
                    ? "bg-white text-zinc-900 shadow-md"
                    : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                )}
              >
                <Hash className="w-3.5 h-3.5" />
                <span>Join with Code</span>
              </button>
            </div>

            {activeTab === "CREATE" ? (
              /* Create Project Form */
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Project Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Algothon Distributed Cloud"
                    className="w-full px-4 py-2.5 rounded-2xl bg-zinc-950/80 border border-white/15 focus:border-blue-500 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Description & Objectives
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the pipeline, architecture, and goals..."
                    className="w-full px-4 py-2.5 rounded-2xl bg-zinc-950/80 border border-white/15 focus:border-blue-500 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all resize-none"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-blue-400" />
                  <span>
                    A <strong>Unique Project Code</strong> will be automatically generated upon creation.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Generating Pipeline...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Create Project & Generate Code</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Join Project with Code Form */
              <form onSubmit={handleJoin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Unique Project Code <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="e.g., PRJ-9421-XKL"
                    className="w-full px-4 py-2.5 rounded-2xl bg-zinc-950/80 border border-white/15 focus:border-blue-500 text-xs font-mono text-blue-300 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Introduction Note (Optional)
                  </label>
                  <input
                    type="text"
                    value={joinNote}
                    onChange={(e) => setJoinNote(e.target.value)}
                    placeholder="e.g., Hi! Joining for frontend optimization & OCC pipeline."
                    className="w-full px-4 py-2.5 rounded-2xl bg-zinc-950/80 border border-white/15 focus:border-blue-500 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                  />
                </div>

                <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs flex items-center gap-2.5">
                  <Users className="w-4 h-4 shrink-0 text-purple-400" />
                  <span>
                    Your request will be sent to the project creator, who will review and assign your role.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isJoining || !joinCode.trim()}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isJoining ? (
                    <span>Submitting Request...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Join Request</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
