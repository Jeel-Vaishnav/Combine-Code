import { Server as SocketIOServer, Socket } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "../types/socketEvents";
import { UserSummary } from "../types/models";
import { setSocketIO } from "../lib/socketServer";

interface ConnectedClient {
  socketId: string;
  projectId: string;
  user: UserSummary;
  lastHeartbeat: number;
}

// In-memory real-time state for connected clients & active task editors
const clientSessions = new Map<string, ConnectedClient>(); // socketId -> client
const editingMap = new Map<string, Map<string, UserSummary>>(); // taskId -> (userId -> UserSummary)

export function initializeSocketServer(httpServer: any) {
  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    path: "/socket.io",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  setSocketIO(io);

  function broadcastPresence(projectId: string) {
    const onlineMap = new Map<string, UserSummary>();
    for (const client of clientSessions.values()) {
      if (client.projectId === projectId) {
        onlineMap.set(client.user.id, client.user);
      }
    }

    const taskEditingObject: Record<string, UserSummary[]> = {};
    for (const [taskId, usersMap] of editingMap.entries()) {
      if (usersMap.size > 0) {
        taskEditingObject[taskId] = Array.from(usersMap.values());
      }
    }

    io.to(`project:${projectId}`).emit("presence:sync", {
      onlineUsers: Array.from(onlineMap.values()),
      editingMap: taskEditingObject,
    });
  }

  io.on("connection", (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
    console.log(`🔌 [Socket.io] Client connected: ${socket.id}`);

    // Join Project Room
    socket.on("project:join", ({ projectId, user }) => {
      const room = `project:${projectId}`;
      socket.join(room);

      clientSessions.set(socket.id, {
        socketId: socket.id,
        projectId,
        user,
        lastHeartbeat: Date.now(),
      });

      console.log(`👤 User ${user.name} (${user.id}) joined room ${room}`);
      broadcastPresence(projectId);
    });

    // Leave Project Room
    socket.on("project:leave", ({ projectId, userId }) => {
      const room = `project:${projectId}`;
      socket.leave(room);

      // Clean up editing markers for this user
      for (const [taskId, usersMap] of editingMap.entries()) {
        if (usersMap.has(userId)) {
          usersMap.delete(userId);
          io.to(room).emit("task:editing:changed", {
            taskId,
            editingUsers: Array.from(usersMap.values()),
          });
        }
      }

      clientSessions.delete(socket.id);
      broadcastPresence(projectId);
    });

    // Heartbeat
    socket.on("presence:heartbeat", ({ projectId, userId }) => {
      const client = clientSessions.get(socket.id);
      if (client) {
        client.lastHeartbeat = Date.now();
      }
    });

    // Start editing a task
    socket.on("task:editing:start", ({ projectId, taskId, user }) => {
      if (!editingMap.has(taskId)) {
        editingMap.set(taskId, new Map());
      }
      const usersMap = editingMap.get(taskId)!;
      usersMap.set(user.id, user);

      io.to(`project:${projectId}`).emit("task:editing:changed", {
        taskId,
        editingUsers: Array.from(usersMap.values()),
      });
    });

    // Stop editing a task
    socket.on("task:editing:stop", ({ projectId, taskId, userId }) => {
      const usersMap = editingMap.get(taskId);
      if (usersMap) {
        usersMap.delete(userId);
        if (usersMap.size === 0) {
          editingMap.delete(taskId);
        }
        io.to(`project:${projectId}`).emit("task:editing:changed", {
          taskId,
          editingUsers: Array.from(usersMap?.values() || []),
        });
      }
    });

    // Disconnect cleanup
    socket.on("disconnect", () => {
      const client = clientSessions.get(socket.id);
      if (client) {
        const { projectId, user } = client;
        // Clean up editing markers
        for (const [taskId, usersMap] of editingMap.entries()) {
          if (usersMap.has(user.id)) {
            usersMap.delete(user.id);
            if (usersMap.size === 0) {
              editingMap.delete(taskId);
            }
            io.to(`project:${projectId}`).emit("task:editing:changed", {
              taskId,
              editingUsers: Array.from(usersMap.values()),
            });
          }
        }
        clientSessions.delete(socket.id);
        broadcastPresence(projectId);
      }
      console.log(`🔌 [Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  // Stale presence sweeper every 30 seconds
  setInterval(() => {
    const now = Date.now();
    const affectedProjects = new Set<string>();

    for (const [socketId, client] of clientSessions.entries()) {
      if (now - client.lastHeartbeat > 45000) {
        // Expired client
        affectedProjects.add(client.projectId);
        clientSessions.delete(socketId);
      }
    }

    for (const projectId of affectedProjects) {
      broadcastPresence(projectId);
    }
  }, 30000);

  return io;
}
