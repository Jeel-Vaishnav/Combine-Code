"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Keyboard, Sparkles } from "lucide-react";

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const shortcuts = [
    { keys: ["Ctrl", "K"], description: "Open Command Palette & Global Search" },
    { keys: ["Alt", "N"], description: "Quick Create New Engineering Task" },
    { keys: ["Ctrl", "1"], description: "Switch to Kanban Board View" },
    { keys: ["Ctrl", "2"], description: "Switch to Table / List View" },
    { keys: ["Ctrl", "3"], description: "Switch to Executive Health Dashboard" },
    { keys: ["Esc"], description: "Close Drawer, Modal, or Clear Search" },
    { keys: ["Ctrl", "Enter"], description: "Save Changes / Submit Comment" },
    { keys: ["?"], description: "Open this Keyboard Shortcuts cheat-sheet" },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      className="border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.12)]"
    >
      <div className="p-4 border-b border-zinc-800/80 bg-zinc-950/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Keyboard className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
              <span>Windows Keyboard Shortcuts</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                Win Ergonomics
              </span>
            </h2>
            <p className="text-[11px] text-zinc-400">
              Navigate and manage your tasks without touching your mouse.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {shortcuts.map((sc, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/60 hover:bg-zinc-800/60 border border-white/[0.04] transition-colors text-xs"
          >
            <span className="text-zinc-300 font-medium">{sc.description}</span>
            <div className="flex items-center gap-1">
              {sc.keys.map((k, kIdx) => (
                <span key={kIdx} className="kbd-shortcut">
                  {k}
                </span>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-400" />
            Optimized for Windows 10 & 11
          </span>
          <span>Press Esc to exit</span>
        </div>
      </div>
    </Modal>
  );
}
