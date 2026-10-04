"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { UserSummary } from "@/types/models";
import { ClientToServerEvents, ServerToClientEvents } from "@/types/socketEvents";

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface UseSocketOptions {
  projectId: string | null;
  currentUser: UserSummary | null;
  onPresenceSync?: (data: {
    onlineUsers: UserSummary[];
    editingMap: Record<string, UserSummary[]>;
  }) => void;
  onTaskCreated?: (data: { task: any }) => void;
  onTaskUpdated?: (data: {
    taskId: string;
    task: any;
    changes: Record<string, unknown>;
  }) => void;
  onTaskMoved?: (data: {
    taskId: string;
    sourceColumnId: string;
    targetColumnId: string;
    position: number;
    version: number;
    userId?: string;
  }) => void;
  onTaskDeleted?: (data: { taskId: string }) => void;
  onTaskEditingChanged?: (data: { taskId: string; editingUsers: UserSummary[] }) => void;
  onCommentAdded?: (data: { taskId: string; comment: any }) => void;
  onActivityLogged?: (data: { activity: any }) => void;
}

export function useSocket({
  projectId,
  currentUser,
  onPresenceSync,
  onTaskCreated,
  onTaskUpdated,
  onTaskMoved,
  onTaskDeleted,
  onTaskEditingChanged,
  onCommentAdded,
  onActivityLogged,
}: UseSocketOptions) {
  const socketRef = useRef<TypedSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Store callbacks in refs to avoid re-subscribing on every render
  const callbacksRef = useRef({
    onPresenceSync,
    onTaskCreated,
    onTaskUpdated,
    onTaskMoved,
    onTaskDeleted,
    onTaskEditingChanged,
    onCommentAdded,
    onActivityLogged,
  });

  useEffect(() => {
    callbacksRef.current = {
      onPresenceSync,
      onTaskCreated,
      onTaskUpdated,
      onTaskMoved,
      onTaskDeleted,
      onTaskEditingChanged,
      onCommentAdded,
      onActivityLogged,
    };
  });

  useEffect(() => {
    if (!projectId || !currentUser) return;

    // Connect to Socket.io server
    const socket: TypedSocket = io({
      path: "/socket.io",
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("⚡ Connected to real-time WebSocket server");
      // Join project room
      socket.emit("project:join", { projectId, user: currentUser });
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("🔌 Disconnected from real-time WebSocket server");
    });

    // Event listeners
    socket.on("presence:sync", (data) => {
      callbacksRef.current.onPresenceSync?.(data);
    });

    socket.on("task:created", (data) => {
      callbacksRef.current.onTaskCreated?.(data);
    });

    socket.on("task:updated", (data) => {
      callbacksRef.current.onTaskUpdated?.(data);
    });

    socket.on("task:moved", (data) => {
      callbacksRef.current.onTaskMoved?.(data);
    });

    socket.on("task:deleted", (data) => {
      callbacksRef.current.onTaskDeleted?.(data);
    });

    socket.on("task:editing:changed", (data) => {
      callbacksRef.current.onTaskEditingChanged?.(data);
    });

    socket.on("comment:added", (data) => {
      callbacksRef.current.onCommentAdded?.(data);
    });

    socket.on("activity:logged", (data) => {
      callbacksRef.current.onActivityLogged?.(data);
    });

    // Heartbeat every 15 seconds
    const heartbeatInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit("presence:heartbeat", { projectId, userId: currentUser.id });
      }
    }, 15000);

    return () => {
      clearInterval(heartbeatInterval);
      if (socket.connected) {
        socket.emit("project:leave", { projectId, userId: currentUser.id });
      }
      socket.disconnect();
      socketRef.current = null;
    };
  }, [projectId, currentUser?.id]);

  const startEditingTask = useCallback(
    (taskId: string) => {
      if (socketRef.current?.connected && projectId && currentUser) {
        socketRef.current.emit("task:editing:start", {
          projectId,
          taskId,
          user: currentUser,
        });
      }
    },
    [projectId, currentUser]
  );

  const stopEditingTask = useCallback(
    (taskId: string) => {
      if (socketRef.current?.connected && projectId && currentUser) {
        socketRef.current.emit("task:editing:stop", {
          projectId,
          taskId,
          userId: currentUser.id,
        });
      }
    },
    [projectId, currentUser]
  );

  return {
    socket: socketRef.current,
    isConnected,
    startEditingTask,
    stopEditingTask,
  };
}
