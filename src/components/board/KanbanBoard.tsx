"use client";

import React, { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  closestCorners,
} from "@dnd-kit/core";
import { ColumnWithTasks, TaskItem, UserSummary } from "@/types/models";
import { KanbanColumn } from "./KanbanColumn";
import { TaskCard } from "./TaskCard";
import { calculateFractionalPosition } from "@/lib/fractionalIndex";

interface KanbanBoardProps {
  columns: ColumnWithTasks[];
  projectId: string;
  onTaskClick: (task: TaskItem) => void;
  onAddTask: (title: string, columnId: string) => Promise<void>;
  onMoveTask: (
    taskId: string,
    sourceColumnId: string,
    targetColumnId: string,
    newPosition: number,
    prevPos: number | null,
    nextPos: number | null
  ) => Promise<void>;
  onDeleteTask?: (taskId: string) => void;
  editingMap: Record<string, UserSummary[]>;
}

export function KanbanBoard({
  columns,
  projectId,
  onTaskClick,
  onAddTask,
  onMoveTask,
  onDeleteTask,
  editingMap,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<TaskItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required before drag begins
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = active.data.current?.task as TaskItem | undefined;
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeTaskId = String(active.id);
    const overId = String(over.id);

    // Find source column and task
    let sourceCol: ColumnWithTasks | undefined;
    let draggedTask: TaskItem | undefined;

    for (const col of columns) {
      const found = col.tasks.find((t) => t.id === activeTaskId);
      if (found) {
        sourceCol = col;
        draggedTask = found;
        break;
      }
    }

    if (!sourceCol || !draggedTask) return;

    // Check if target is a column itself or another task inside a column
    let targetCol = columns.find((c) => c.id === overId);
    let targetIndex = -1;

    if (!targetCol) {
      // Over was a task, find which column contains it
      for (const col of columns) {
        const idx = col.tasks.findIndex((t) => t.id === overId);
        if (idx !== -1) {
          targetCol = col;
          targetIndex = idx;
          break;
        }
      }
    }

    if (!targetCol) return;

    const isSameColumn = sourceCol.id === targetCol.id;

    // Filter out dragged task from target column if it's already in there
    const destinationTasks = targetCol.tasks.filter((t) => t.id !== activeTaskId);

    // If dragged onto a column directly (empty area or bottom), place at end
    if (targetIndex === -1) {
      targetIndex = destinationTasks.length;
    }

    // Determine predecessor and successor positions
    const prevTask = targetIndex > 0 ? destinationTasks[targetIndex - 1] : null;
    const nextTask =
      targetIndex < destinationTasks.length ? destinationTasks[targetIndex] : null;

    const prevPos = prevTask ? prevTask.position : null;
    const nextPos = nextTask ? nextTask.position : null;

    // Calculate fractional position
    const newPosition = calculateFractionalPosition(prevPos, nextPos);

    // Avoid unnecessary moves if position didn't meaningfully change in the same column
    if (isSameColumn && Math.abs(draggedTask.position - newPosition) < 0.0001) {
      return;
    }

    // Trigger optimistic move
    await onMoveTask(
      draggedTask.id,
      sourceCol.id,
      targetCol.id,
      newPosition,
      prevPos,
      nextPos
    );
  };

  // Convert mouse wheel up/down into sideways horizontal scroll across columns
  const handleBoardWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY !== 0) {
      const target = e.target as HTMLElement | null;
      const verticalContainer = target?.closest(".overflow-y-auto") as HTMLElement | null;

      if (verticalContainer && verticalContainer.scrollHeight > verticalContainer.clientHeight) {
        const isDown = e.deltaY > 0;
        const canScrollDown =
          verticalContainer.scrollTop + verticalContainer.clientHeight <
          verticalContainer.scrollHeight - 2;
        const canScrollUp = verticalContainer.scrollTop > 2;

        if ((isDown && canScrollDown) || (!isDown && canScrollUp)) {
          return;
        }
      }

      e.currentTarget.scrollLeft += e.deltaY;
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        onWheel={handleBoardWheel}
        className="flex-1 flex gap-4 p-4 overflow-x-auto min-h-0 items-start select-none"
      >
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            projectId={projectId}
            onTaskClick={onTaskClick}
            onAddTask={onAddTask}
            onDeleteTask={onDeleteTask}
            editingMap={editingMap}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 150, easing: "ease" }}>
        {activeTask ? (
          <div className="rotate-2 scale-105 shadow-2xl pointer-events-none opacity-95">
            <TaskCard
              task={activeTask}
              onClick={() => {}}
              isBeingEditedBy={editingMap[activeTask.id] || []}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
