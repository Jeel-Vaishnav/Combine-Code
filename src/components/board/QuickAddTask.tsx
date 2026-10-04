"use client";

import React, { useState, useRef, useEffect } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface QuickAddTaskProps {
  columnId: string;
  projectId: string;
  onAddTask: (title: string, columnId: string) => Promise<void>;
}

export function QuickAddTask({ columnId, projectId, onAddTask }: QuickAddTaskProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isLoading) return;

    try {
      setIsLoading(true);
      await onAddTask(title.trim(), columnId);
      setTitle("");
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to quick add task:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setTitle("");
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-1.5 px-2 rounded-md border border-dashed border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs flex items-center justify-center gap-1.5 transition-colors group mt-1"
      >
        <Plus className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-200" />
        <span>Add card</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-1 flex flex-col gap-2">
      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter task title... (Enter to save)"
        disabled={isLoading}
        className="w-full px-2.5 py-1.5 bg-zinc-900 border border-blue-500/80 rounded-md text-xs text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
      />
      <div className="flex items-center gap-1.5">
        <Button type="submit" variant="primary" size="sm" isLoading={isLoading}>
          Add
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsOpen(false);
            setTitle("");
          }}
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>
    </form>
  );
}
