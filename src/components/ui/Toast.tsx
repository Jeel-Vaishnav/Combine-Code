"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: (message: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, message, type, duration = 4000 }: Omit<ToastMessage, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast = { id, title, message, type, duration };

      // Safely defer toast state update to avoid React setState-in-render collisions
      setTimeout(() => {
        setToasts((prev) => [...prev, newToast]);
      }, 0);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 p-3 rounded-lg border shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-3 duration-200 text-xs",
              t.type === "success" && "bg-zinc-900/95 border-emerald-500/40 text-emerald-300",
              t.type === "error" && "bg-zinc-900/95 border-red-500/40 text-red-300",
              t.type === "warning" && "bg-zinc-900/95 border-amber-500/40 text-amber-300",
              t.type === "info" && "bg-zinc-900/95 border-blue-500/40 text-blue-300"
            )}
          >
            <div className="shrink-0 mt-0.5">
              {t.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {t.type === "error" && <AlertCircle className="w-4 h-4 text-red-400" />}
              {t.type === "warning" && <AlertTriangle className="w-4 h-4 text-amber-400" />}
              {t.type === "info" && <Info className="w-4 h-4 text-blue-400" />}
            </div>

            <div className="flex-1">
              {t.title && <div className="font-semibold text-zinc-100">{t.title}</div>}
              <div className="text-zinc-300 mt-0.5">{t.message}</div>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-zinc-400 hover:text-zinc-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
