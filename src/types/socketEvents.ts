import { TaskItem, UserSummary, ActivityLogItem, CommentItem } from "./models";

export interface ClientToServerEvents {
  "project:join": (data: { projectId: string; user: UserSummary }) => void;
  "project:leave": (data: { projectId: string; userId: string }) => void;
  "presence:heartbeat": (data: { projectId: string; userId: string }) => void;
  "task:editing:start": (data: { projectId: string; taskId: string; user: UserSummary }) => void;
  "task:editing:stop": (data: { projectId: string; taskId: string; userId: string }) => void;
}

export interface ServerToClientEvents {
  "presence:sync": (data: {
    onlineUsers: UserSummary[];
    editingMap: Record<string, UserSummary[]>; // taskId -> users currently editing
  }) => void;
  "task:created": (data: { task: TaskItem }) => void;
  "task:updated": (data: {
    taskId: string;
    task: TaskItem;
    changes: Record<string, unknown>;
    updatedBy?: UserSummary;
  }) => void;
  "task:moved": (data: {
    taskId: string;
    sourceColumnId: string;
    targetColumnId: string;
    position: number;
    version: number;
    userId?: string;
  }) => void;
  "task:deleted": (data: { taskId: string }) => void;
  "task:editing:changed": (data: { taskId: string; editingUsers: UserSummary[] }) => void;
  "comment:added": (data: { taskId: string; comment: CommentItem }) => void;
  "activity:logged": (data: { activity: ActivityLogItem }) => void;
}
