"use client";

import React, { useState } from "react";
import { AlertTriangle, GitMerge, Check, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { TaskItem } from "@/types/models";
import { PatchTaskInput } from "@/types/zodSchemas";
import { ConflictResolutionChoice } from "@/types/occ";
import { cn } from "@/lib/utils";

interface ConflictResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  currentServerTask: TaskItem | null;
  attemptedPatch: PatchTaskInput | null;
  onResolve: (
    choice: ConflictResolutionChoice,
    mergedData?: { title?: string; description?: string }
  ) => Promise<void>;
}

export function ConflictResolutionModal({
  isOpen,
  onClose,
  taskId,
  currentServerTask,
  attemptedPatch,
  onResolve,
}: ConflictResolutionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMergeMode, setIsMergeMode] = useState(false);

  // Initialize merged text with both versions
  const [mergedTitle, setMergedTitle] = useState("");
  const [mergedDescription, setMergedDescription] = useState("");

  // When opening or toggling merge mode, prepare unified template
  React.useEffect(() => {
    if (currentServerTask && attemptedPatch) {
      setMergedTitle(attemptedPatch.title || currentServerTask.title);

      const serverDesc = currentServerTask.description || "";
      const attemptDesc = attemptedPatch.description || "";

      // Smart merge draft: include incoming section + local additions
      const combined = `${serverDesc}\n\n--- Merged Notes ---\n${attemptDesc}`.trim();
      setMergedDescription(combined);
    }
  }, [currentServerTask, attemptedPatch]);

  if (!isOpen || !currentServerTask || !attemptedPatch) return null;

  const handleChoice = async (choice: ConflictResolutionChoice) => {
    try {
      setIsSubmitting(true);
      if (choice === "MERGE_BOTH") {
        await onResolve(choice, {
          title: mergedTitle.trim(),
          description: mergedDescription,
        });
      } else {
        await onResolve(choice);
      }
      onClose();
    } catch (err) {
      console.error("Failed to resolve conflict:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="4xl"
      className="border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.15)]"
    >
      {/* Conflict Header */}
      <div className="flex items-center gap-3 p-4 border-b border-zinc-800 bg-amber-500/10">
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <span>Deterministic Concurrency Conflict Detected</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300">
              HTTP 409 Conflict
            </span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Another team member saved modifications to this task while you had it open.
            Choose how to reconcile the differences.
          </p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* If user clicked 'Merge Both', show interactive diff merger */}
        {isMergeMode ? (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-700/80">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 mb-2">
                <GitMerge className="w-4 h-4" />
                <span>Unified 3-Way Editable Merge Canvas</span>
              </div>
              <p className="text-[11px] text-zinc-400 mb-3">
                Review and blend your teammate&apos;s updates with your local notes below.
                Clicking &quot;Apply Merged Result&quot; will write this new revision to the database.
              </p>

              {/* Merged Title */}
              <div className="mb-3">
                <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">
                  Resolved Title
                </label>
                <input
                  type="text"
                  value={mergedTitle}
                  onChange={(e) => setMergedTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Merged Description */}
              <div>
                <label className="block text-[10px] uppercase font-semibold text-zinc-400 mb-1">
                  Resolved Description (Markdown)
                </label>
                <textarea
                  rows={9}
                  value={mergedDescription}
                  onChange={(e) => setMergedDescription(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded p-3 text-xs font-mono text-zinc-200 focus:outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMergeMode(false)}
                disabled={isSubmitting}
              >
                Back to Side-by-Side View
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                onClick={() => handleChoice("MERGE_BOTH")}
                className="gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply Merged Result</span>
              </Button>
            </div>
          </div>
        ) : (
          /* Side-by-Side Diff View */
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Your Unsaved Attempt */}
              <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/30 flex flex-col">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-500/20">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Your Local Unsaved Version</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">
                    Client v{attemptedPatch.clientVersion}
                  </span>
                </div>

                <div className="space-y-3 flex-1 text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-zinc-400 font-semibold block mb-0.5">
                      Attempted Title:
                    </span>
                    <div className="p-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-200 font-medium">
                      {attemptedPatch.title || "(Unchanged)"}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase text-zinc-400 font-semibold block mb-0.5">
                      Attempted Description:
                    </span>
                    <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[11px] whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                      {attemptedPatch.description || "(Unchanged)"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Teammate's Incoming Version */}
              <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/30 flex flex-col">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-blue-500/20">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span>Teammate&apos;s Saved Version</span>
                  </div>
                  <span className="text-[10px] font-mono text-blue-300">
                    Database v{currentServerTask.version}
                  </span>
                </div>

                <div className="space-y-3 flex-1 text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-zinc-400 font-semibold block mb-0.5">
                      Current DB Title:
                    </span>
                    <div className="p-2 rounded bg-zinc-900 border border-zinc-800 text-zinc-200 font-medium">
                      {currentServerTask.title}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase text-zinc-400 font-semibold block mb-0.5">
                      Current DB Description:
                    </span>
                    <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[11px] whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed">
                      {currentServerTask.description || "(Empty)"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Action Buttons */}
            <div className="pt-3 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel & Review
              </Button>

              <div className="flex items-center gap-2">
                {/* 1. Accept Remote */}
                <Button
                  variant="secondary"
                  size="sm"
                  isLoading={isSubmitting}
                  onClick={() => handleChoice("ACCEPT_REMOTE")}
                  className="hover:border-blue-500/50"
                  title="Discard local edits and reload teammate's version"
                >
                  Accept Remote
                </Button>

                {/* 2. Merge Both */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMergeMode(true)}
                  disabled={isSubmitting}
                  className="border-blue-500/60 text-blue-400 hover:bg-blue-950/20 gap-1.5"
                >
                  <GitMerge className="w-3.5 h-3.5" />
                  <span>Merge Both (Editable Diff)</span>
                </Button>

                {/* 3. Keep Mine */}
                <Button
                  variant="danger"
                  size="sm"
                  isLoading={isSubmitting}
                  onClick={() => handleChoice("KEEP_MINE")}
                  title="Force overwrite database version with your draft"
                >
                  Keep Mine (Force Overwrite)
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
