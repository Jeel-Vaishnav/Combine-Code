export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type ProjectStatus = "ACTIVE" | "ARCHIVED" | "COMPLETED";
export type UserRole = "ADMIN" | "LEAD" | "MEMBER" | "VIEWER";

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
  color: string;
}

export interface TagSummary {
  id: string;
  name: string;
  color: string;
}

export interface SubtaskItem {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface AttachmentItem {
  id: string;
  taskId: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
  createdAt: string;
}

export interface CommentItem {
  id: string;
  taskId: string;
  authorId: string;
  author: UserSummary;
  parentId?: string | null;
  replies?: CommentItem[];
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLogItem {
  id: string;
  projectId: string;
  taskId?: string | null;
  userId: string;
  user: UserSummary;
  action: string;
  details: string; // JSON parsed on client
  createdAt: string;
}

export interface TaskItem {
  id: string;
  projectId: string;
  columnId: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string | null;
  position: number;
  version: number; // Monotonic OCC counter
  createdAt: string;
  updatedAt: string;
  assignees: {
    userId: string;
    user: UserSummary;
  }[];
  subtasks: SubtaskItem[];
  tags: {
    tagId: string;
    tag: TagSummary;
  }[];
  commentsCount?: number;
  attachmentsCount?: number;
}

export interface ColumnWithTasks {
  id: string;
  projectId: string;
  name: string;
  key: string;
  order: number;
  color: string;
  isDone: boolean;
  tasks: TaskItem[];
}

export interface ProjectDetail {
  id: string;
  workspaceId: string;
  name: string;
  slug: string;
  description?: string | null;
  status: ProjectStatus;
  targetDate?: string | null;
  columns: ColumnWithTasks[];
}

export interface WorkspaceSummary {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  projects: {
    id: string;
    name: string;
    slug: string;
    status: string;
  }[];
}

export interface ProjectProgressStats {
  totalTasks: number;
  completedTasks: number;
  progressPercentage: number;
  overdueTasks: number;
  dueSoonTasks: number; // Due in next 24 hours
  onTrackTasks: number;
  priorityBreakdown: Record<Priority, number>;
  columnBreakdown: {
    columnId: string;
    name: string;
    color: string;
    count: number;
    percentage: number;
  }[];
  workloadAllocation: {
    user: UserSummary;
    taskCount: number;
    completedCount: number;
    urgentCount: number;
  }[];
}
