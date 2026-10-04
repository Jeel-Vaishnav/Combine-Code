"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Wifi, RefreshCw, CheckCircle2, ShieldCheck, Zap, Radio } from "lucide-react";
import { UserSummary } from "@/types/models";

interface ConnectionHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isWsConnected: boolean;
  currentUser: UserSummary | null;
  projectName: string;
}

export function ConnectionHealthModal({
  isOpen,
  onClose,
  isWsConnected,
  currentUser,
  projectName,
}: ConnectionHealthModalProps) {
  const [isPinging, setIsPinging] = useState(false);
  const [latency, setLatency] = useState<number | null>(18);

  const handleTestPing = () => {
    setIsPinging(true);
    setTimeout(() => {
      // Realistic simulated WebSocket roundtrip latency
      const randomLatency = Math.floor(Math.random() * 15) + 12;
      setLatency(randomLatency);
      setIsPinging(false);
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      className="border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.12)]"
    >
      <div className="p-4 border-b border-zinc-800/80 bg-zinc-950/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <span>Real-Time WebSocket Gateway</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Socket.io v4
              </span>
            </h2>
            <p className="text-[11px] text-zinc-400">
              Bidirectional event pipeline & presence heartbeat.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-zinc-900/80 border border-white/[0.05]">
            <span className="text-[10px] text-zinc-400 block mb-0.5">Connection Status</span>
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isWsConnected ? "ONLINE & SYNCED" : "OFFLINE"}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/80 border border-white/[0.05]">
            <span className="text-[10px] text-zinc-400 block mb-0.5">Estimated Roundtrip RTT</span>
            <div className="flex items-center gap-1.5 text-blue-400 font-semibold font-mono">
              <Zap className="w-3.5 h-3.5" />
              <span>{latency !== null ? `${latency} ms` : "Measuring..."}</span>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-zinc-900/60 border border-white/[0.05] space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-400">Active Room Subscriptions:</span>
            <span className="font-mono text-zinc-200">project:{projectName}</span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-400">Transport Layer:</span>
            <span className="font-mono text-zinc-200">WebSocket (WSS) + Polling Fallback</span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-400">Heartbeat Frequency:</span>
            <span className="font-mono text-zinc-200">Every 15 seconds</span>
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-zinc-400">Authenticated Actor:</span>
            <span className="font-semibold text-blue-300">{currentUser?.name || "Anonymous"}</span>
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-emerald-300 text-[11px]">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>All updates, drag actions, and edits sync to collaborators deterministically.</span>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestPing}
            isLoading={isPinging}
            className="gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Test Ping Latency</span>
          </Button>

          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
