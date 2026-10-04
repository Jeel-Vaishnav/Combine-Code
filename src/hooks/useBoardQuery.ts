"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ProjectDetail, ColumnWithTasks, TaskItem } from "@/types/models";

export function useBoardQuery(projectId: string | null) {
  const queryClient = useQueryClient();
  const queryKey = ["project-board", projectId];

  const query = useQuery<ProjectDetail>({
    queryKey,
    queryFn: async () => {
      if (!projectId) throw new Error("Project ID is required");
      const res = await fetch(`/api/projects/${projectId}/board`);
      if (!res.ok) throw new Error("Failed to load board data");
      return res.json();
    },
    enabled: !!projectId,
    staleTime: 1000 * 60, // 1 minute
  });

  // Optimistic Move Task
  const updateTaskPositionLocally = (
    taskId: string,
    sourceColumnId: string,
    targetColumnId: string,
    newPosition: number,
    newVersion?: number
  ) => {
    queryClient.setQueryData<ProjectDetail>(queryKey, (old) => {
      if (!old) return old;

      let movedTask: TaskItem | null = null;
      for (const col of old.columns) {
        const found = col.tasks.find((t) => t.id === taskId);
        if (found) {
          movedTask = { ...found };
          break;
        }
      }

      if (!movedTask) return old;

      // Remove from source column
      const newColumns = old.columns.map((col) => {
        if (col.id === sourceColumnId) {
          return {
            ...col,
            tasks: col.tasks.filter((t) => t.id !== taskId),
          };
        }
        return col;
      });

      // Update task metadata
      const updatedTask: TaskItem = {
        ...movedTask,
        columnId: targetColumnId,
        position: newPosition,
        version: newVersion !== undefined ? newVersion : (movedTask.version || 1) + 1,
      };

      // Insert into target column sorted by position
      return {
        ...old,
        columns: newColumns.map((col) => {
          if (col.id === targetColumnId) {
            const nextTasks = [...col.tasks, updatedTask].sort(
              (a, b) => a.position - b.position
            );
            return {
              ...col,
              tasks: nextTasks,
            };
          }
          return col;
        }),
      };
    });
  };

  // Optimistic or Real-time Field Update
  const updateTaskFieldsLocally = (taskId: string, changes: Partial<TaskItem>) => {
    queryClient.setQueryData<ProjectDetail>(queryKey, (old) => {
      if (!old) return old;

      // Find current column and existing task
      let currentColumnId: string | null = null;
      let existingTask: TaskItem | null = null;

      for (const col of old.columns) {
        const found = col.tasks.find((t) => t.id === taskId);
        if (found) {
          currentColumnId = col.id;
          existingTask = found;
          break;
        }
      }

      if (!existingTask) {
        return old;
      }

      const updatedTask: TaskItem = {
        ...existingTask,
        ...changes,
        version:
          changes.version !== undefined
            ? changes.version
            : (existingTask.version || 1) + 1,
      };

      const targetColId = changes.columnId || currentColumnId;

      // Case 1: Same column update (priority, due date, title, tags, etc.)
      if (!changes.columnId || changes.columnId === currentColumnId) {
        return {
          ...old,
          columns: old.columns.map((col) => {
            if (col.id !== currentColumnId) return col;
            return {
              ...col,
              tasks: col.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
            };
          }),
        };
      }

      // Case 2: Column change / Stage progress update! Move across columns immediately
      return {
        ...old,
        columns: old.columns.map((col) => {
          if (col.id === currentColumnId) {
            return {
              ...col,
              tasks: col.tasks.filter((t) => t.id !== taskId),
            };
          }
          if (col.id === targetColId) {
            const withoutCurrent = col.tasks.filter((t) => t.id !== taskId);
            return {
              ...col,
              tasks: [...withoutCurrent, updatedTask].sort(
                (a, b) => a.position - b.position
              ),
            };
          }
          return col;
        }),
      };
    });
  };

  // Add Task to Board Cache
  const addTaskLocally = (task: TaskItem) => {
    queryClient.setQueryData<ProjectDetail>(queryKey, (old) => {
      if (!old) return old;

      return {
        ...old,
        columns: old.columns.map((col) => {
          if (col.id === task.columnId) {
            // Avoid duplicates
            if (col.tasks.some((t) => t.id === task.id)) return col;
            return {
              ...col,
              tasks: [...col.tasks, task].sort((a, b) => a.position - b.position),
            };
          }
          return col;
        }),
      };
    });
  };

  // Remove Task from Board Cache
  const removeTaskLocally = (taskId: string) => {
    queryClient.setQueryData<ProjectDetail>(queryKey, (old) => {
      if (!old) return old;

      return {
        ...old,
        columns: old.columns.map((col) => ({
          ...col,
          tasks: col.tasks.filter((t) => t.id !== taskId),
        })),
      };
    });
  };

  return {
    ...query,
    updateTaskPositionLocally,
    updateTaskFieldsLocally,
    addTaskLocally,
    removeTaskLocally,
  };
}
