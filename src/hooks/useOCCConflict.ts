"use client";

import { useState, useCallback } from "react";
import { TaskItem } from "@/types/models";
import { PatchTaskInput } from "@/types/zodSchemas";
import { ConflictErrorPayload, ConflictResolutionChoice } from "@/types/occ";

export function useOCCConflict() {
  const [conflictState, setConflictState] = useState<{
    isOpen: boolean;
    taskId: string;
    currentServerTask: TaskItem | null;
    attemptedPatch: PatchTaskInput | null;
  }>({
    isOpen: false,
    taskId: "",
    currentServerTask: null,
    attemptedPatch: null,
  });

  const triggerConflict = useCallback(
    (taskId: string, payload: ConflictErrorPayload) => {
      setConflictState({
        isOpen: true,
        taskId,
        currentServerTask: payload.currentVersion,
        attemptedPatch: payload.yourAttempt,
      });
    },
    []
  );

  const closeConflict = useCallback(() => {
    setConflictState({
      isOpen: false,
      taskId: "",
      currentServerTask: null,
      attemptedPatch: null,
    });
  }, []);

  return {
    conflictState,
    triggerConflict,
    closeConflict,
  };
}
