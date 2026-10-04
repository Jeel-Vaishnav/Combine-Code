import { TaskItem } from "./models";
import { PatchTaskInput } from "./zodSchemas";

export interface ConflictErrorPayload {
  error: "CONFLICT";
  message: string;
  currentVersion: TaskItem;
  yourAttempt: PatchTaskInput;
}

export type ConflictResolutionChoice = "KEEP_MINE" | "ACCEPT_REMOTE" | "MERGE_BOTH";

export interface ConflictResolutionContext {
  isOpen: boolean;
  taskId: string;
  field: "title" | "description" | "both";
  currentServerTask: TaskItem | null;
  attemptedPatch: PatchTaskInput | null;
  onResolved?: (resolvedTask: TaskItem) => void;
  onCancel?: () => void;
}
