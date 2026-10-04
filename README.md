# CombineCode

A real-time collaborative project management platform built with Next.js, featuring workspaces, Kanban boards, task management with real-time updates, and Optimistic Concurrency Control handling.

![CombineCode Screenshot](https://via.placeholder.com/800x400/007AFF/FFFFFF?text=CombineCode+Dashboard)

## ✨ Features

- **Real-time Collaboration**: Live updates via Socket.io when team members modify tasks, boards, or projects
- **Multi-tenant Workspace System**: Create/join workspaces and collaborate within them
- **Kanban Board Interface**: Drag-and-drop task management with DnD Kit
- **Advanced Task Management**: Tasks with subtasks, comments, attachments, due dates, and assignments
- **Optimistic Concurrency Control**: Intelligent conflict resolution for simultaneous edits
- **Team & Access Control**: Invite members, manage roles, and set project permissions
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **TypeScript End-to-End**: Full type safety throughout the application

## 🛠️ Technologies Used

### Frontend
- **Next.js 16.3.8** (App Router)
- **React 19.2.8**
- **Tailwind CSS 4** (with tailwind-merge for efficient class merging)
- **Lucide React** (beautiful SVG icons)
- **DnD Kit** (accessible drag-and-drop functionality)
- **Date-fns** (modern date handling)
- **TanStack React Query** (data fetching and state management)

### Backend & Infrastructure
- **Node.js/TypeScript**
- **Prisma ORM** (PostgreSQL/MySQL/SQLite support with type-safe queries)
- **Socket.io** (real-time bidirectional communication with room-based scoping)
- **JWT + bcrypt** (secure authentication)
- **Zod** (runtime validation and schema definitions)

### DevOps & Tooling
- **TypeScript** (strict type checking)
- **ESLint** (code quality)
- **TSX** (TypeScript execution)
- **Vercel** (deployment platform)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Database (PostgreSQL recommended)

### Installation

1. Clone the repository
```bash
git clone https://github.com/Jeel-Vaishnav/Combine-Code.git
cd Combine-Code
```

2. Install dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your database URL and other secrets
```

4. Initialize the database
```bash
npx prisma db push
npm run db:seed
```

5. Start the development server
```bash
npm run dev
# or
npm run dev:next  # for Next.js dev server only
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🏗️ Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes (RESTful)
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # Reusable UI components
│   ├── board/          # Kanban board components
│   ├── layout/         # Layout components (nav, modals, etc.)
│   ├── dashboard/      # Dashboard views
│   ├── project/        # Project-related components
│   ├── team/           # Team components
│   └── ui/             # Primitives (buttons, badges, modals, etc.)
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries and services
│   ├── auth.ts         # Authentication helpers
│   ├── db.ts           # Prisma client instance
│   ├── socketServer.ts # Socket.io server setup
│   └── utils.ts        # General utilities
├── types/              # TypeScript type definitions
│   ├── models.ts       # Prisma model types
│   ├── zodSchemas.ts   # Zod validation schemas
│   ├── occ.ts          # Optimistic Concurrency Control types
│   └── socketEvents.ts # Socket.io event definitions
└── server/             # Server-specific code
    └── socket.ts       # Socket.io initialization
```

## 🔑 Key Features Explained

### Real-time Collaboration
Utilizes Socket.io with room-based scoping to ensure users only receive updates relevant to their current workspace/project. Features include:
- Live task creation/updates/deletion
- Real-time comment synchronization
- Instant reflection of drag-and-drop movements
- Presence indicators (coming soon)

### Optimistic Concurrency Control (OCC)
Implements a sophisticated OCC system that:
- Tracks entity versions using timestamps
- Detects conflicts before they occur
- Provides intelligent merge strategies
- Offers user-friendly conflict resolution UI
- Prevents data loss in collaborative environments

### Workspace & Project Organization
- **Workspaces**: Top-level containers for teams/projects
- **Projects**: Containers for related work within a workspace
- **Boards**: Kanban boards for visualizing project workflow
- **Tasks**: Individual units of work with rich metadata
- **Hierarchical Structure**: Workspace → Project → Board → Tasks

## 📱 Responsive Design
Built with mobile-first principles using Tailwind CSS:
- Collapsible sidebar on mobile
- Adaptive board layouts
- Touch-friendly drag-and-drop
- Modal optimization for small screens

## 🔐 Security
- JWT-based authentication with HTTP-only cookies
- bcrypt password hashing
- Route protection middleware
- Input validation with Zod
- Prisma prevents SQL injection
- CORS configured for frontend origins

## 🧪 Testing
While not included in this initial release, the architecture supports:
- Unit testing with Jest/Vitest
- Integration testing with Supertest
- End-to-end testing with Playwright or Cypress

## 🚦 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/logout` - End session

### Workspaces
- `GET /api/workspaces` - List user's workspaces
- `POST /api/workspaces` - Create new workspace

### Projects
- `GET /api/projects` - List projects in workspace
- `POST /api/projects` - Create new project
- `GET /api/projects/[id]` - Get project details
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Tasks
- `GET /api/tasks` - List tasks (with filtering)
- `POST /api/tasks` - Create new task
- `GET /api/tasks/[id]` - Get task details
- `PUT /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task
- `POST /api/tasks/[id]/move` - Move task between columns
- `POST /api/tasks/[id]/subtasks` - Add subtask
- `POST /api/tasks/[id]/comments` - Add comment
- `POST /api/tasks/[id]/attachments` - Upload attachment

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please make sure to update tests as appropriate and follow the existing code style.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - The React framework for production
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework
- [Prisma](https://prisma.io) - Modern database ORM
- [Socket.io](https://socket.io) - Real-time communication library
- [TanStack Query](https://tanstack.com/query) - Data synchronization library
- [DnD Kit](https://dndkit.com) - Accessible drag-and-drop toolkit
- [Lucide](https://lucide.dev) - Beautiful open-source icons

---

**CombineCode** - Where teams build together, in real-time.