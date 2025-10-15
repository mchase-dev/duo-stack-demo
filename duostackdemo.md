# DuoStackDemonstration Framework — Development Work Plan
**Purpose:** This project is a **technology demonstration** showcasing a complete, modern full-stack web app built with:

- **React (Vite + Tailwind + TypeScript + Lucide Icons + React Hook Form)** frontend
- Two **interchangeable API backends**:
  - Node.js (Express + Sequelize + TypeScript)
  - .NET 8 (ASP.NET Core + Entity Framework Core)
- **Shared database schema**, configurable for MSSQL, MySQL, MariaDB, PostgreSQL, or SQLite
- **Dockerized deployment** for easy launch and testing

The app is not for production — it is a **reference project** showing architecture, modularity, and stack flexibility.

# 1\. Goals & Constraints

-   Create a **technology demonstration** web app:
    -   React frontend (Vite + Tailwind + TypeScript + Lucide Icons + React Hook Form)
    -   Two interchangeable backends (Node.js + .NET) sharing the same API contract
    -   External, configurable DB (MSSQL, MySQL, MariaDB, Postgres, SQLite)
    -   Calendar & events system similar to Outook or Google Calendar (month/week/day, drag/drop)
    -   User messaging and group chat rooms (real-time)
    -   Basic CMS for Superusers
    -   Cookie consent banner
    -   Unit tests for frontend and both backends
-   Not intended as production-grade — focus on clarity, parity, code comments, and demonstration value.
* * *

# 2\. Development Work Plan

## Core Features

### Authentication & User Management
- Register via **email + password**
- Placeholder for **email confirmation** (no email sending)
- **User profile** with:
  - Avatar (image upload)
  - Username
  - First/last name
  - Phone number
  - Age
  - Short bio

**Roles (1 per user):**
- `User`
- `Admin`
- `Superuser`

---

### Messaging System
- Direct user-to-user messages.
- Each message: senderId, receiverId, content, timestamps, read status.
- Inbox/outbox views in frontend.
- Real-time updates via:
  - **Socket.IO** (Node backend)
  - **SignalR** (.NET backend)

---

### Group Chat Rooms
- Users can join **SignalR chat rooms**.
- Admins and Superusers can:
  - Create rooms
  - Delete rooms
- Rooms persist in DB, messages stored per room.
- Frontend provides a **room list** and **chat UI**.

---

### Calendar & Events
- Similar to Outlook calendar or Google calendar
- Users can create and view **calendar events**.
- Events can be:
  - **Private** (only creator)
  - **Public** (all users)
  - **Restricted** (specific users)
- Admins & Superusers can edit/delete any event.
- Support **month/week/day** views.
- **Drag-and-drop** rescheduling.
- Color-coded events:
  - Private = gray
  - Public = blue
  - Restricted = green

-   Frontend is API-agnostic: same HTTP endpoints and realtime events regardless of backend.
-   Real-time adapter unifies SignalR (ASP.NET) and Socket.IO (Node) for frontend.
* * *

# 3\. Technology Stack

**Frontend**
-   React + Vite + TypeScript
-   Tailwind CSS
-   State: Zustand
-   Lucide Icons
-   React Hook Form
-   Zod for validation
-   Data: React Query (TanStack Query) + Axios
-   Calendar UI: FullCalendar
-   Realtime client libs: `@microsoft/signalr` and `socket.io-client` (wrapped in a `RealtimeAdapter`)
-   Tests: Vitest + React Testing Library
**Node Backend**
-   Node 20+ + TypeScript
-   Express (or Fastify if chosen)
-   Sequelize ORM (supports `mssql`, `mysql`, `mariadb`, `postgres`, `sqlite`)
-   Socket.IO for realtime
-   Migrations: `sequelize-cli` or `umzug`
-   Tests: Jest + Supertest
**.NET Backend**
-   ASP.NET Core 8 (Web API)
-   EF Core (provider switchable across DBs)
-   ASP.NET Identity or custom user store (prefer Identity)
-   SignalR for realtime
-   Migrations: `dotnet ef`
-   Tests: xUnit + Microsoft.AspNetCore.Mvc.Testing
**DB**
-   Support MSSQL, MySQL, MariaDB, Postgres, SQLite (for dev/testing)
-   DB runs external to app containers by default.
* * *

# 4\. Roles & Permissions

-   **User** — default role:
    -   Create/edit/delete **own** events, messages, profile.
    -   Join rooms and chat.
-   **Admin**:
    -   Add/Edit/Soft-delete users.
    -   Create/Delete chat rooms.
    -   Edit/Delete any event.
-   **Superuser**:
    -   All Admin permissions plus:
    -   Assign roles to users.
    -   Manage CMS pages and navigation.
    -   Full system-level control.
**Important rules**

-   Only **Superuser** can grant roles.
-   Soft-delete pattern used across entities.
-   Single role per user (User | Admin | Superuser).
* * *

# 5\. Core Data Model (tables / entities)

Below are the primary entities and key fields. Use `UUID` or `bigint` consistent across app.

### `Users`

-   `id`
-   `email` (unique)
-   `emailConfirmed` (bool)
-   `username` (unique)
-   `passwordHash`
-   `firstName`,
-   `lastName`
-   `phoneNumber` (nullable)
-   `avatarUrl` (nullable)
-   `role` (enum: `User`, `Admin`, `Superuser`)
-   `createdAt`, `updatedAt`, `deletedAt` (soft delete)

### `RefreshTokens`

-   `id`, `userId`, `tokenHash`, `expiresAt`, `revoked`, `createdAt`

### `Messages`

-   `id`, `fromUserId`, `toUserId`, `content`, `createdAt`, `isRead`, `deletedAt`

### `Events` (Calendar)

-   `id` (UUID)
-   `title`
-   `description` (text)
-   `startTime` (datetime)
-   `endTime` (datetime)
-   `visibility` (enum: `private`, `public`, `restricted`)
-   `allowedUserIds` (JSON array)
-   `createdBy`
-   `color` (optional)
-   `createdAt`, `updatedAt`, `deletedAt`

### `Rooms`

-   `id`, `name`, `slug`, `isPublic`, `createdBy`, `createdAt`, `deletedAt`

### `Pages` (CMS)

-   `id`, `title`, `slug`, `content` (markdown/html), `isPublished`, `createdBy`, `createdAt`, `updatedAt`, `deletedAt`
**Indexes**: Users.email, Users.username, Events.startTime, Rooms.slug, Pages.slug (unique).

* * *

# 6\. API Contract — `/api/v1`

Design the REST endpoints so both backends share identical routes, input/output shapes, and error responses.
These are only examples. If you need additional APIs for the full functionality, please create them as needed.

**Response format convention**

`{ "success": true, "data": {...} }`

or

`{ "success": false, "error": "Message" }`

* * *

## Auth

-   `POST /api/v1/auth/register`
    body: `{ email, password, username, firstName?, lastName? }`
    returns: `{ user, accessToken }` + sets refresh token cookie.

-   `POST /api/v1/auth/login`
    body: `{ email, password }`
    returns: `{ accessToken }` + sets refresh token cookie.

-   `POST /api/v1/auth/refresh`
    uses HttpOnly refresh cookie → returns `{ accessToken }`

-   `POST /api/v1/auth/logout`
    revokes refresh token cookie

-   `GET /api/v1/auth/confirm-email?token=...`
    validates token and marks `emailConfirmed = true`.

* * *

## Users

-   `GET /api/v1/users` — Admin+ only (paged)
-   `GET /api/v1/users/:id` — self or Admin+
-   `PUT /api/v1/users/:id` — self or Admin+
-   `DELETE /api/v1/users/:id` — Admin+ (soft delete)
-   `PUT /api/v1/users/:id/role` — Superuser only (body `{ role }`)
* * *

## Profile

-   `GET /api/v1/profile/me`
-   `PUT /api/v1/profile/me`
-   `POST /api/v1/profile/me/avatar` — avatar upload
* * *

## Messages

-   `GET /api/v1/messages/conversations`
-   `GET /api/v1/messages/conversations/:userId`
-   `POST /api/v1/messages` — `{ toUserId, content }`
* * *

## Events (Calendar)

-   `GET /api/v1/events?from=...&to=...` — events visible to user in the range
-   `GET /api/v1/events/:id`
-   `POST /api/v1/events` — create
-   `PUT /api/v1/events/:id` — edit (owner/Admin/Superuser)
-   `DELETE /api/v1/events/:id` — soft delete (owner/Admin/Superuser)

Query params: `from`, `to`, optional `visibility`.

* * *

## Rooms

-   `GET /api/v1/rooms`
-   `POST /api/v1/rooms` — Admin+
-   `PUT /api/v1/rooms/:id` — Admin+
-   `DELETE /api/v1/rooms/:id` — Admin+ (soft delete)
* * *

## Pages (CMS)

-   `GET /api/v1/pages`
-   `GET /api/v1/pages/:slug`
-   `POST /api/v1/pages` — Superuser only
-   `PUT /api/v1/pages/:id` — Superuser only
-   `DELETE /api/v1/pages/:id` — Superuser only
* * *

# 7\. Calendar & Events (Detailed)

## Requirements

-   Google Calendar or Outlook calendar type UI (month/week/day).
-   Create, edit, delete events with start & end datetimes.
-   Drag/drop and resize to reschedule.
-   Visibility: `private` (only owner), `public` (everyone), `restricted` (selected users).
-   Admin & Superuser: can edit/delete any event.
-   Realtime notifications for event create/update/delete (via adapter).

## Events DB filter (visibility enforcement)

Backend should only return events that satisfy:

-   `visibility = public`, **OR**
-   `createdBy = currentUser`, **OR**
-   `currentUser` is in `allowedUserIds`, **OR**
-   `currentUser.role` in (`Admin`, `Superuser`)

## Frontend UI

-   **CalendarPage** using FullCalendar with plugins:
    -   dayGrid (month), timeGrid (week/day), interaction (drag/drop).
-   `EventModal` for creating/editing.
-   `EventForm` with fields: title, description, start, end, visibility, allowed users (multi-select), color.
-   Sidebar: agenda/today list & filters.
-   Color coding:
    -   Private = gray
    -   Public = blue
    -   Restricted = green

## Realtime

-   Realtime events:
    -   `eventCreated`
    -   `eventUpdated`
    -   `eventDeleted`
-   Emitted by backend to:
    -   All users for `public` events.
    -   Owner + allowed users + Admins/Superusers for `restricted`.
    -   Owner only for `private`.

## External calendar integration (placeholder)

-   Provide clear hook points and placeholder endpoints for future sync with Google Calendar / Microsoft Graph (no implementation necessary now).
-   Document mapping of local Event fields to external APIs.
* * *

# 8\. Messaging & Real-time Rooms

## Messaging

-   Persist messages in `Messages` table.
-   Realtime notifications to recipients when new messages arrive.

## Rooms / Group Chat

-   Rooms persist in DB. Admin & Superuser can manage rooms.
-   Real-time behavior:
    -   .NET: SignalR Hub `RoomsHub` with `JoinRoom`, `LeaveRoom`, `SendToRoom`.
    -   Node: Socket.IO rooms with matching semantics.
-   Frontend uses `RealtimeAdapter` with methods:
    -   `connect(token?)`, `disconnect()`
    -   `joinRoom(roomId)`, `leaveRoom(roomId)`
    -   `sendToRoom(roomId, payload)`
    -   `on(event, cb)`, `off(event, cb)`
**Events to subscribe:** `roomMessage`, `userMessage`, `eventCreated`, `eventUpdated`, `eventDeleted`.

* * *

# 9\. Authentication (Details)

## Local auth

-   Password hashing: bcrypt (Node) / ASP.NET Identity (default secure hashing).
-   Access tokens: JWT short-lived.
-   Refresh tokens: long-lived stored hashed in DB and set in HttpOnly cookie.

## Email confirmation placeholder

-   `IEmailSender` / `EmailService` with `NoopEmailSender` that logs confirmation link or writes it locally. Do **not** send real email in the starter.
* * *

# 10\. CMS (Basic Page Editing)

-   `Pages` table stores content (prefer markdown).
-   Superuser-only UI to create/edit/delete pages.
-   Navigation menu managed by Superusers (simple JSON or DB table for menu items).
-   Frontend renders pages at `/pages/:slug`.
* * *

# 11\. DB Migrations & Seeding

## Requirements

-   Migrations and seed scripts for both backends.
-   Seed must create:
    -   Roles (`User`, `Admin`, `Superuser`)
    -   Default **Superuser** from env variables:
        -   email: superuser@example.com
        -   username: superuser
        -   password: please_change_123

## Node (Sequelize)

-   Use `sequelize-cli` for migrations.
-   Seeders in `seeders/` for roles & default Superuser.

## .NET (EF Core)

-   `dotnet ef migrations add Initial`
-   Seeding in `Program.cs` or a dedicated `SeedData` class run on startup.
**Document clearly**: change default Superuser password after first run (for production use; but this is a demo).

* * *

# 12\. Frontend Structure & Conventions

### File & naming conventions

-   Components: `PascalCase.tsx` (e.g., `EventModal.tsx`)
-   Hooks: `useCamelCase.ts` (e.g., `useEvents.ts`)
-   API modules: `resourceName.ts` (e.g., `events.ts`)
-   Tests: `*.test.tsx` or `*.spec.ts`
-   DTO / types: `types/` or `models/` folder with `Event.ts`, `User.ts`

### Key frontend behavior

-   Axios API client with `withCredentials: true` for refresh cookies.
-   React Query for caching and background refetch.
-   RealtimeAdapter injected via React Context to components that need realtime.
-   Catch all errors and check for errors from API (`{ "success": false, "error": "Message" }`).
-   Use Toast package to display errors.
* * *

# 13\. Node Backend Structure & Conventions

### Conventions

-   Controllers handle request/response; services hold business logic.
-   Use `async/await` consistently.
-   Validate inputs with `zod`.
-   Centralized error handling middleware.
-   Use `dotenv` for env vars and `env.ts` to parse + validate.
* * *

# 14\. .NET Backend Structure & Conventions

### Conventions

-   Controllers return typed `ActionResult<T>`.
-   Use DI for services (Register in `Program.cs`).
-   Use EF Core migrations and `AppDbContext`.
-   Use `IEmailSender` interface with a `NoopEmailSender` in dev.
-   Use SignalR hubs for realtime.
* * *

# 15\. Testing Strategy

**Frontend**

-   Vitest + React Testing Library
-   Tests: auth hooks, calendar interactions (mock API), RealtimeAdapter mocks, RoleGuard behaviour.
**Node backend**

-   Jest + Supertest
-   Tests: auth flows, event CRUD, RBAC middleware, socket.io integration tests (using `socket.io-client`).
**.NET backend**

-   xUnit
-   Integration tests via `WebApplicationFactory<TEntryPoint>` on in-memory or SQLite test DB.
-   SignalR testing with `TestServer`.
**Targets**

-   Cover core logic: auth/refresh, RBAC, event visibility, messaging, and calendar interactions.
* * *

# 16\. Docker & Local Development

**Principles**

-   Provide Dockerfiles for frontend, Node backend, and .NET backend.
-   Default `docker-compose.yml` can include an example DB (Postgres) for convenience, but document that DB is usually external.
-   Provide `.env.example`.

**Notes**

-   Provide an optional `docker-compose.local-db.yml` for running a local DB for quick demos.
-   Provide an optional `docker-compose.sqlite.yml` for running a sqlite DB for quick demos.
-   Document how to switch DB provider via environment variables.
* * *

# 17\. Security Considerations

-   Hash passwords securely (bcrypt or ASP.NET Identity).
-   Use HTTPS in production demos.
-   Store refresh tokens hashed in DB; send via HttpOnly `SameSite` cookies.
-   Rate-limit auth endpoints.
-   Validate & sanitize CMS content; prefer markdown rendering to limit HTML injection.
-   Validate and limit file uploads for avatars (size/type).
-   Enforce CORS to frontend origin.
-   RBAC checks server-side on every protected route.
* * *

# 18\. CI / Developer Workflow & Automation

**Suggested GitHub Actions pipeline**

-   `lint` (frontend & backends)
-   `test:frontend` (Vitest)
-   `test:node` (Jest)
-   `test:dotnet` (`dotnet test`)
-   `build` Docker images (optional)
-   Optionally run migrations and seed in a job for integration tests.
**Useful npm/make scripts**

-   `dev:frontend`, `dev:node`, `dev:dotnet`
-   `migrate:node`, `migrate:dotnet`
-   `seed:node`, `seed:dotnet`
-   `test:frontend`, `test:node`, `test:dotnet`
* * *

# 19\. Deliverables & Development Order for Claude Code

**Deliverables**

1.  OpenAPI/Swagger spec for `/api/v1` endpoints (JSON/YAML).
2.  Frontend:
    -   Calendar page (FullCalendar) + Event modal & forms
    -   Auth flows (register/login)
    -   RealtimeAdapter with SignalRAdapter & SocketIOAdapter
    -   Cookie consent
    -   Messaging & Rooms UI
3.  Node backend:
    -   Sequelize models, migrations, seeders
    -   Socket.IO realtime server
    -   Event, message, room, page controllers
4.  .NET backend:
    -   EF Core models & migrations
    -   Identity + JWT + refresh tokens
    -   SignalR hubs
    -   Event, message, room, page controllers
5.  Dockerfiles + `docker-compose` example
6.  Test skeletons for frontend and both backends
7.  README.md with quick-start, env variables, and how to seed default Superuser
* * *

# 20\. UI / UX Wireframes & Calendar UX Notes

-   **Top nav**: Home | Pages | Calendar | Rooms | Messages | Admin (role-based) | Profile
-   **Calendar page**:
    -   Left: filters & mini-agenda
    -   Center: FullCalendar (month/week/day)
    -   Modal: Event details and edit form
    -   Interactions: click to create, drag to move, resize to change duration, double-click to edit
-   **Event colors**: private (gray), public (blue), restricted (green)
-   **Chat Rooms**: room list + chat pane; small composer with emoji support (optional)
-   **Cookie consent**: bottom banner with Accept / Manage Preferences
**Accessibility**: keyboard navigation for calendar and aria attributes for important controls.

* * *

# Final Notes for Claude Code

-   Build the **OpenAPI spec** first and use it as the single source of truth — this ensures both backends and the frontend stay aligned.
-   Keep controllers thin; place business logic in services to ensure parity between Node and .NET implementations.
-   Emphasize **parity**: for every endpoint implemented in Node, implement the same contract in .NET (same JSON shapes and HTTP codes).
-   Implement `RealtimeAdapter` early so frontend can be developed and tested against either backend.
-   Provide good README instructions for switching backends (ENV flag: `VITE_BACKEND=dotnet|node` or `VITE_REALTIME_BACKEND=signalr|socketio`).
-   For demonstration clarity, include an included seed Superuser and a short `DEMO.md` showing example login steps and demo flows (create event, create room, message user, change role).
-   For demonstration clarity, concisely comment all code.
-   **Create a multi-step plan to implement this project before starting any code**
-   Output the multi-step plan as a well-formatted markdown file to implement with all necessary details along with a todo checklist.

