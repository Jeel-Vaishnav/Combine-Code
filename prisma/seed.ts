import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Cleaning existing database records...");
  await prisma.activityLog.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.subtask.deleteMany();
  await prisma.taskTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.taskAssignee.deleteMany();
  await prisma.task.deleteMany();
  await prisma.taskColumn.deleteMany();
  await prisma.project.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  console.log("👤 Creating 5 team members matching UI design...");
  const users = await Promise.all([
    prisma.user.create({
      data: {
        id: "usr_jeel",
        name: "Jeel Vaishnav",
        email: "jeel.vaishnav@algothon.in",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        role: "LEAD",
        color: "#9f1239", // Wine/Rose red (J.V.)
      },
    }),
    prisma.user.create({
      data: {
        id: "usr_aarav",
        name: "Aarav Patel",
        email: "aarav.patel@algothon.in",
        avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
        role: "MEMBER",
        color: "#2563eb", // Blue (A.P.)
      },
    }),
    prisma.user.create({
      data: {
        id: "usr_lakshya",
        name: "Lakshya Kumar",
        email: "lakshya.kumar@algothon.in",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
        role: "MEMBER",
        color: "#d97706", // Gold/Amber (L.K.)
      },
    }),
    prisma.user.create({
      data: {
        id: "usr_priya",
        name: "Priya Patel",
        email: "priya.patel@algothon.in",
        avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
        role: "ADMIN",
        color: "#ec4899",
      },
    }),
    prisma.user.create({
      data: {
        id: "usr_rohan",
        name: "Rohan Mehta",
        email: "rohan.mehta@algothon.in",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        role: "MEMBER",
        color: "#10b981",
      },
    }),
  ]);

  console.log("🏢 Creating Workspace...");
  const workspace = await prisma.workspace.create({
    data: {
      id: "ws_algothon",
      name: "Algothon Distributed Systems",
      slug: "algothon-distributed",
      description: "Collaborative workspace dashboard & real-time infrastructure.",
    },
  });

  console.log("🏷️ Creating Tags...");
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: "Development", color: "#3b82f6" } }),
    prisma.tag.create({ data: { name: "API Docs", color: "#f59e0b" } }),
    prisma.tag.create({ data: { name: "Real-Time", color: "#ec4899" } }),
    prisma.tag.create({ data: { name: "Performance", color: "#10b981" } }),
    prisma.tag.create({ data: { name: "OCC / Concurrency", color: "#8b5cf6" } }),
    prisma.tag.create({ data: { name: "DevOps", color: "#64748b" } }),
  ]);

  console.log("📁 Creating 2 Projects...");
  // Project 1: Project ALG-WEB-01
  const project1 = await prisma.project.create({
    data: {
      id: "prj_alg_web_01",
      workspaceId: workspace.id,
      name: "Project ALG-WEB-01",
      slug: "alg-web-01",
      description: "Collaborative workspace dashboard",
      status: "ACTIVE",
      targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  // Project 2: Algo-Suite v3
  const project2 = await prisma.project.create({
    data: {
      id: "prj_algo_suite",
      workspaceId: workspace.id,
      name: "Algo-Suite v3",
      slug: "algo-suite-v3",
      description: "High-performance distributed suite & cluster health",
      status: "ACTIVE",
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("📋 Creating Columns for Project 1...");
  const p1ColBacklog = await prisma.taskColumn.create({
    data: { id: "col_p1_backlog", projectId: project1.id, name: "Backlog", key: "backlog", order: 1000, color: "#64748b" },
  });
  const p1ColTodo = await prisma.taskColumn.create({
    data: { id: "col_p1_todo", projectId: project1.id, name: "To Do", key: "todo", order: 2000, color: "#3b82f6" },
  });
  const p1ColProgress = await prisma.taskColumn.create({
    data: { id: "col_p1_progress", projectId: project1.id, name: "In Progress", key: "in_progress", order: 3000, color: "#f59e0b" },
  });
  const p1ColReview = await prisma.taskColumn.create({
    data: { id: "col_p1_review", projectId: project1.id, name: "Review & QA", key: "in_review", order: 4000, color: "#8b5cf6" },
  });
  const p1ColDone = await prisma.taskColumn.create({
    data: { id: "col_p1_done", projectId: project1.id, name: "Done", key: "done", order: 5000, color: "#10b981", isDone: true },
  });

  console.log("📋 Creating Columns for Project 2...");
  const p2ColBacklog = await prisma.taskColumn.create({
    data: { id: "col_p2_backlog", projectId: project2.id, name: "Backlog", key: "backlog", order: 1000, color: "#64748b" },
  });
  const p2ColProgress = await prisma.taskColumn.create({
    data: { id: "col_p2_progress", projectId: project2.id, name: "In Progress", key: "in_progress", order: 2000, color: "#3b82f6" },
  });
  const p2ColDone = await prisma.taskColumn.create({
    data: { id: "col_p2_done", projectId: project2.id, name: "Done", key: "done", order: 3000, color: "#10b981", isDone: true },
  });

  const now = Date.now();
  const DAY_MS = 24 * 60 * 60 * 1000;

  console.log("📝 Creating 15 realistic engineering tasks...");

  // Task 1: API Docs (matches screenshot)
  const t1 = await prisma.task.create({
    data: {
      id: "tsk_01",
      projectId: project1.id,
      columnId: p1ColProgress.id,
      title: "API Docs",
      description: `### Objectives
- Ensure OpenAPI 3.1 specifications cover all REST endpoints and typed WebSocket events.
- Implement **Tier 1**: Atomic field patch parsing (\`PATCH /api/tasks/:id\`).
- Implement **Tier 2**: Version monotonic counter in SQLite/Postgres.
- Implement **Tier 3**: Interactive 3-way side-by-side diff UI modal.`,
      priority: "HIGH",
      dueDate: new Date(now + 4 * 60 * 60 * 1000), // Due Today
      position: 1000.0,
      version: 3,
      assignees: {
        create: [{ userId: users[0].id }, { userId: users[1].id }],
      },
      tags: {
        create: [{ tagId: tags[0].id }], // Development
      },
      subtasks: {
        create: [
          { title: "Define OpenAPI 3.1 endpoints", isCompleted: true, position: 1 },
          { title: "Generate client TypeScript SDK", isCompleted: true, position: 2 },
          { title: "Validate WebSocket payload schemas", isCompleted: false, position: 3 },
          { title: "Broadcast task:conflict event to affected room", isCompleted: false, position: 4 },
        ],
      },
      attachments: {
        create: [
          {
            name: "api_schema_spec.png",
            url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800",
            size: 245000,
            mimeType: "image/png",
          },
          {
            name: "rfc_spec_concurrency.md",
            url: "#",
            size: 14200,
            mimeType: "text/markdown",
          },
        ],
      },
    },
  });

  // Task 2: Schema Sync (matches screenshot)
  const t2 = await prisma.task.create({
    data: {
      id: "tsk_02",
      projectId: project1.id,
      columnId: p1ColProgress.id,
      title: "Schema Sync",
      description: `Compute midpoint order index $(prev + next) / 2$ without needing to renumber surrounding database rows on every drag-and-drop action. Include automated rebalancing trigger when gap shrinks below $1e-6$.`,
      priority: "MEDIUM",
      dueDate: new Date(now + 8 * 60 * 60 * 1000), // Due Today
      position: 2000.0,
      version: 2,
      assignees: {
        create: [{ userId: users[0].id }, { userId: users[2].id }],
      },
      tags: {
        create: [{ tagId: tags[1].id }], // API Docs
      },
      subtasks: {
        create: [
          { title: "Write pure fractional midpoint calculator", isCompleted: true, position: 1 },
          { title: "Hook into @dnd-kit dragEnd listener", isCompleted: true, position: 2 },
          { title: "Handle edge insertion (top of column & bottom of column)", isCompleted: true, position: 3 },
        ],
      },
    },
  });

  // Task 3: TeamTrater (matches screenshot)
  const t3 = await prisma.task.create({
    data: {
      id: "tsk_03",
      projectId: project1.id,
      columnId: p1ColReview.id,
      title: "TeamTrater",
      description: `Integrate typed Socket.io gateway handling workspace-level and project-level rooms:
- \`project:join\` / \`project:leave\`
- \`presence:heartbeat\` every 15 seconds
- \`task:editing\` status chips on Kanban cards
- Automatic reconnection state reconciliation`,
      priority: "HIGH",
      dueDate: new Date(now + 10 * 60 * 60 * 1000), // Due Today
      position: 1000.0,
      version: 4,
      assignees: {
        create: [{ userId: users[0].id }, { userId: users[1].id }],
      },
      tags: {
        create: [{ tagId: tags[1].id }], // API Docs
      },
      subtasks: {
        create: [
          { title: "Setup Socket.io on custom HTTP server", isCompleted: true, position: 1 },
          { title: "Define typed socket event contracts", isCompleted: true, position: 2 },
          { title: "Add client reconnection sync buffer", isCompleted: true, position: 3 },
        ],
      },
    },
  });

  // Task 4: Design System (matches screenshot)
  const t4 = await prisma.task.create({
    data: {
      id: "tsk_04",
      projectId: project1.id,
      columnId: p1ColDone.id,
      title: "Design System",
      description: `Linear/VisionOS frosted glassmorphic UI system, floating canvas, and tactile animations.`,
      priority: "URGENT",
      dueDate: new Date(now - 1 * DAY_MS),
      position: 1000.0,
      version: 1,
      assignees: {
        create: [{ userId: users[0].id }],
      },
      tags: {
        create: [{ tagId: tags[0].id }],
      },
      subtasks: {
        create: [
          { title: "Define tailwind border and surface tokens", isCompleted: true, position: 1 },
          { title: "Build drawer slide-out animation with Tailwind", isCompleted: true, position: 2 },
          { title: "Implement dark/light mode toggle with persistence", isCompleted: true, position: 3 },
        ],
      },
    },
  });

  // Task 5: Fast Filter & Instant Search
  const t5 = await prisma.task.create({
    data: {
      id: "tsk_05",
      projectId: project1.id,
      columnId: p1ColTodo.id,
      title: "Multi-parameter Instant Search & Tag Filter Bar",
      description: `Client-side instant filtering across assignees, priorities, tags, and fuzzy text query without board layout shifts.`,
      priority: "MEDIUM",
      dueDate: new Date(now + 2 * DAY_MS),
      position: 1000.0,
      version: 1,
      assignees: {
        create: [{ userId: users[1].id }],
      },
      tags: {
        create: [{ tagId: tags[4].id }],
      },
      subtasks: {
        create: [
          { title: "Fuzzy text search hook", isCompleted: false, position: 1 },
          { title: "Filter pill toggles with count badges", isCompleted: false, position: 2 },
        ],
      },
    },
  });

  // Task 6: Real-time Markdown Task Drawer
  const t6 = await prisma.task.create({
    data: {
      id: "tsk_06",
      projectId: project1.id,
      columnId: p1ColTodo.id,
      title: "Real-time Markdown Editor Drawer with Subtask Progress",
      description: `Full slide-over task drawer supporting live markdown preview, checklist toggle, percentage calculation bar, and live collaborator editing indicators.`,
      priority: "HIGH",
      dueDate: new Date(now + 5 * DAY_MS),
      position: 2000.0,
      version: 1,
      assignees: {
        create: [{ userId: users[2].id }],
      },
      tags: {
        create: [{ tagId: tags[4].id }, { tagId: tags[1].id }],
      },
      subtasks: {
        create: [
          { title: "Live markdown rendering", isCompleted: true, position: 1 },
          { title: "Real-time debounced PATCH on edit", isCompleted: false, position: 2 },
          { title: "Subtask percentage progress bar", isCompleted: true, position: 3 },
        ],
      },
    },
  });

  // Task 7: Threaded Task Comments Engine
  const t7 = await prisma.task.create({
    data: {
      id: "tsk_07",
      projectId: project1.id,
      columnId: p1ColProgress.id,
      title: "Threaded Comment Stream with Real-time Broadcast",
      description: `Hierarchical nested comment replies per task. Emits \`comment:created\` socket event so all teammates viewing the drawer see new messages immediately.`,
      priority: "MEDIUM",
      dueDate: new Date(now + 3 * DAY_MS),
      position: 3000.0,
      version: 1,
      assignees: {
        create: [{ userId: users[0].id }],
      },
      tags: {
        create: [{ tagId: tags[1].id }],
      },
      subtasks: {
        create: [
          { title: "Comment tree recursion component", isCompleted: true, position: 1 },
          { title: "ParentId reply handler", isCompleted: true, position: 2 },
          { title: "Socket.io live broadcast integration", isCompleted: false, position: 3 },
        ],
      },
    },
  });

  // Task 8: Executive Dashboard & Workload Allocation
  const t8 = await prisma.task.create({
    data: {
      id: "tsk_08",
      projectId: project1.id,
      columnId: p1ColBacklog.id,
      title: "Executive Project KPI Dashboard & Team Workload Bar",
      description: `Calculates real-time completion velocity, overdue task distribution, column health breakdowns, and team assignee workload allocation bars.`,
      priority: "LOW",
      dueDate: new Date(now + 10 * DAY_MS),
      position: 1000.0,
      version: 1,
      assignees: {
        create: [{ userId: users[1].id }, { userId: users[4].id }],
      },
      tags: {
        create: [{ tagId: tags[0].id }, { tagId: tags[2].id }],
      },
      subtasks: {
        create: [
          { title: "Formula-based progress calculator", isCompleted: true, position: 1 },
          { title: "Status breakdown visual distribution", isCompleted: false, position: 2 },
          { title: "Member workload capacity tracker", isCompleted: false, position: 3 },
        ],
      },
    },
  });

  // Task 9: Immutable Activity Audit Trail
  const t9 = await prisma.task.create({
    data: {
      id: "tsk_09",
      projectId: project1.id,
      columnId: p1ColDone.id,
      title: "Immutable Event Log & Activity Audit Trail",
      description: `Records all structural actions (column transitions, priority updates, conflict resolutions) as append-only records.`,
      priority: "MEDIUM",
      dueDate: new Date(now - 4 * DAY_MS),
      position: 2000.0,
      version: 2,
      assignees: {
        create: [{ userId: users[3].id }],
      },
      tags: {
        create: [{ tagId: tags[0].id }],
      },
      subtasks: {
        create: [
          { title: "Prisma ActivityLog transaction hook", isCompleted: true, position: 1 },
          { title: "Activity feed slide-out tab", isCompleted: true, position: 2 },
        ],
      },
    },
  });

  // Task 10: File Dropzone & Attachment Previewer
  const t10 = await prisma.task.create({
    data: {
      id: "tsk_10",
      projectId: project1.id,
      columnId: p1ColBacklog.id,
      title: "Attachment Dropzone with Size Formatters & Image Modal",
      description: `Drag-and-drop file upload zone supporting image previews, markdown attachment references, and formatted byte sizes.`,
      priority: "LOW",
      dueDate: new Date(now + 8 * DAY_MS),
      position: 2000.0,
      version: 1,
      assignees: {
        create: [{ userId: users[2].id }],
      },
      tags: {
        create: [{ tagId: tags[4].id }],
      },
      subtasks: {
        create: [
          { title: "File drop zone component", isCompleted: true, position: 1 },
          { title: "Preview modal for images and documents", isCompleted: false, position: 2 },
        ],
      },
    },
  });

  // Project 2 Tasks (5 more tasks to reach 15 total)
  const t11 = await prisma.task.create({
    data: {
      id: "tsk_11",
      projectId: project2.id,
      columnId: p2ColProgress.id,
      title: "Deploy OpenTelemetry Collector DaemonSet",
      description: `Instrument Kubernetes cluster pods with OTel agent sidecars to export traces to centralized Grafana Tempo sink.`,
      priority: "URGENT",
      dueDate: new Date(now + 1 * DAY_MS),
      position: 1000.0,
      version: 1,
      assignees: {
        create: [{ userId: users[4].id }],
      },
      tags: {
        create: [{ tagId: tags[5].id }],
      },
      subtasks: {
        create: [
          { title: "Deploy Helm chart for OTel collector", isCompleted: true, position: 1 },
          { title: "Validate trace ingestion rate", isCompleted: false, position: 2 },
        ],
      },
    },
  });

  const t12 = await prisma.task.create({
    data: {
      id: "tsk_12",
      projectId: project2.id,
      columnId: p2ColDone.id,
      title: "Configure Prometheus Alertmanager Escalation Routes",
      description: `Set up PagerDuty webhooks for P99 latency spikes exceeding 250ms and error rates above 1.5%.`,
      priority: "HIGH",
      dueDate: new Date(now - 3 * DAY_MS),
      position: 1000.0,
      version: 1,
      assignees: {
        create: [{ userId: users[4].id }, { userId: users[3].id }],
      },
      tags: {
        create: [{ tagId: tags[5].id }, { tagId: tags[2].id }],
      },
      subtasks: {
        create: [
          { title: "Define alert rules in YAML", isCompleted: true, position: 1 },
          { title: "Test escalation paging synthetic trigger", isCompleted: true, position: 2 },
        ],
      },
    },
  });

  const t13 = await prisma.task.create({
    data: {
      id: "tsk_13",
      projectId: project2.id,
      columnId: p2ColProgress.id,
      title: "Distributed Trace Correlation for WebSocket Sessions",
      description: `Attach W3C traceparent headers to client socket handshakes to correlate real-time socket events with backend database queries.`,
      priority: "HIGH",
      dueDate: new Date(now + 6 * DAY_MS),
      position: 2000.0,
      version: 1,
      assignees: {
        create: [{ userId: users[0].id }],
      },
      tags: {
        create: [{ tagId: tags[1].id }, { tagId: tags[2].id }],
      },
    },
  });

  const t14 = await prisma.task.create({
    data: {
      id: "tsk_14",
      projectId: project2.id,
      columnId: p2ColBacklog.id,
      title: "Grafana Enterprise SSO with Okta SAML2",
      description: `Migrate user identity federation from local htpasswd to corporate Okta SAML2 provider with role mapping.`,
      priority: "MEDIUM",
      dueDate: new Date(now + 15 * DAY_MS),
      position: 1000.0,
      version: 1,
      assignees: {
        create: [{ userId: users[4].id }],
      },
      tags: {
        create: [{ tagId: tags[5].id }],
      },
    },
  });

  const t15 = await prisma.task.create({
    data: {
      id: "tsk_15",
      projectId: project2.id,
      columnId: p2ColBacklog.id,
      title: "Synthetic Load Testing Pipeline with k6",
      description: `Simulate 10,000 concurrent socket connections pushing task moves to verify fractional index rebalance threshold.`,
      priority: "LOW",
      dueDate: new Date(now + 20 * DAY_MS),
      position: 2000.0,
      version: 1,
      assignees: {
        create: [{ userId: users[3].id }, { userId: users[2].id }],
      },
      tags: {
        create: [{ tagId: tags[2].id }, { tagId: tags[1].id }],
      },
    },
  });

  console.log("💬 Creating Threaded Sample Comments...");
  const c1 = await prisma.comment.create({
    data: {
      taskId: t1.id,
      authorId: users[0].id, // Aarav
      content: "I've drafted the 409 conflict payload structure. The client will receive both the latest DB state and the rejected attempt so the diff UI can render effortlessly.",
      createdAt: new Date(now - 5 * 60 * 60 * 1000),
    },
  });

  await prisma.comment.create({
    data: {
      taskId: t1.id,
      authorId: users[3].id, // Ananya
      parentId: c1.id, // Threaded reply
      content: "Great! I just verified SQLite atomic UPDATE WHERE version = :v with Prisma updateMany. It reliably returns { count: 0 } when contested.",
      createdAt: new Date(now - 3 * 60 * 60 * 1000),
    },
  });

  await prisma.comment.create({
    data: {
      taskId: t2.id,
      authorId: users[2].id, // Rohan
      content: "Fractional indexing is working like a charm. Tested with 50 rapid drag-and-drops without a single row lock collision.",
      createdAt: new Date(now - 8 * 60 * 60 * 1000),
    },
  });

  console.log("📜 Creating Initial Activity Logs...");
  await prisma.activityLog.createMany({
    data: [
      {
        projectId: project1.id,
        taskId: t4.id,
        userId: users[0].id, // Jeel Vaishnav
        action: "TASK_UPDATED",
        details: JSON.stringify({ taskTitle: "Design System", action: "edited task" }),
        createdAt: new Date(now - 2 * 60 * 1000), // 2 mins ago
      },
      {
        projectId: project1.id,
        taskId: t4.id,
        userId: users[0].id, // Jeel Vaishnav
        action: "TASK_UPDATED",
        details: JSON.stringify({ taskTitle: "Design System", action: "edited task" }),
        createdAt: new Date(now - 5 * 60 * 1000), // 5 mins ago
      },
      {
        projectId: project1.id,
        taskId: t4.id,
        userId: users[0].id, // Jeel Vaishnav
        action: "TASK_UPDATED",
        details: JSON.stringify({ taskTitle: "Design System", action: "edited task" }),
        createdAt: new Date(now - 12 * 60 * 1000), // 12 mins ago
      },
      {
        projectId: project1.id,
        taskId: t1.id,
        userId: users[1].id, // Aarav Patel
        action: "TASK_CREATED",
        details: JSON.stringify({ title: t1.title, column: "In Progress" }),
        createdAt: new Date(now - 60 * 60 * 1000),
      },
      {
        projectId: project1.id,
        taskId: t4.id,
        userId: users[0].id, // Jeel Vaishnav
        action: "MOVED_TASK",
        details: JSON.stringify({ from: "Review & QA", to: "Done", title: t4.title }),
        createdAt: new Date(now - 2 * 60 * 60 * 1000),
      },
    ],
  });

  console.log("✅ Seed completed successfully! 2 projects, 8 columns, 15 tasks, 5 members created.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
