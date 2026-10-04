import { z } from "zod";

export const priorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

export const createTaskSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  columnId: z.string().min(1, "Column ID is required"),
  title: z.string().min(1, "Title cannot be empty").max(255),
  description: z.string().optional().default(""),
  priority: priorityEnum.optional().default("MEDIUM"),
  dueDate: z.string().nullable().optional(),
  assigneeIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
  position: z.number().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

/**
 * Atomic PATCH schema supporting Optimistic Concurrency Control (OCC).
 * If clientVersion is provided, the server enforces version matching.
 */
export const patchTaskSchema = z.object({
  clientVersion: z.number().int().positive().optional(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  priority: priorityEnum.optional(),
  dueDate: z.string().nullable().optional(),
  columnId: z.string().optional(),
  assigneeIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional(),
  forceOverwrite: z.boolean().optional(),
  modifiedByUserId: z.string().optional(),
});

export type PatchTaskInput = z.infer<typeof patchTaskSchema>;

export const moveTaskSchema = z.object({
  targetColumnId: z.string().min(1, "Target column ID is required"),
  prevPosition: z.number().nullable().optional(),
  nextPosition: z.number().nullable().optional(),
  targetPosition: z.number().optional(),
  clientVersion: z.number().int().positive().optional(),
  userId: z.string().optional(),
});

export type MoveTaskInput = z.infer<typeof moveTaskSchema>;

export const createCommentSchema = z.object({
  content: z.string().min(1, "Comment content cannot be empty"),
  authorId: z.string().min(1, "Author ID is required"),
  parentId: z.string().nullable().optional(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export const createSubtaskSchema = z.object({
  title: z.string().min(1, "Subtask title is required"),
  position: z.number().optional(),
});

export type CreateSubtaskInput = z.infer<typeof createSubtaskSchema>;

export const patchSubtaskSchema = z.object({
  title: z.string().min(1).optional(),
  isCompleted: z.boolean().optional(),
});

export type PatchSubtaskInput = z.infer<typeof patchSubtaskSchema>;

export const createAttachmentSchema = z.object({
  name: z.string().min(1),
  url: z.string().min(1),
  size: z.number().int().nonnegative(),
  mimeType: z.string().min(1),
});

export type CreateAttachmentInput = z.infer<typeof createAttachmentSchema>;
