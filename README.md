# DuoStackDemo

This is a **technology demonstration** of a modern full-stack web application with interchangeable backends (.NET and Node.js) with sample feature.

This project demonstrates modern web application architecture with:

- **React Frontend** (Vite + TypeScript + Tailwind CSS + Lucide Icons)
- **Two Interchangeable Backends**:
  - Node.js (Express + Sequelize + Socket.IO)
  - .NET 8 (ASP.NET Core + EF Core + SignalR)
- **Shared API Contract** defined in OpenAPI specification
- **Multi-Database Support**: PostgreSQL, MySQL, MariaDB, MSSQL, SQLite
- **Dockerized Deployment** for easy setup and testing

**⚠️ Important**: This is a **demonstration project**, not production-ready software. It showcases architecture, modularity, and stack flexibility.

## 🎯 Use Cases

This project demonstrates:

1. **API Contract-First Design**: Using OpenAPI as single source of truth
2. **Backend Interchangeability**: Swapping backends without frontend changes
3. **Real-Time Architecture**: WebSocket integration patterns
4. **Multi-Database Support**: Database-agnostic application design
5. **Docker Deployment**: Containerized microservices
6. **Role-Based Security**: Implementing comprehensive RBAC
7. **Full-Stack TypeScript**: Type safety across Node.js backend
8. **Modern .NET Development**: ASP.NET Core 8 best practices

## ✨ Features

### 🔐 Authentication & User Management

- Email/password registration with JWT authentication
- Refresh token rotation with httpOnly cookies
- Role-based access control (User, Admin, Superuser)
- Email confirmation (placeholder for development)
- User profiles with avatar upload

### 📅 Calendar & Events

- Calendar in a Outlook-style interface
- Drag-and-drop event scheduling
- Event visibility controls:
  - **Private**: Owner only
  - **Public**: All users
  - **Restricted**: Specific users
- Color-coded events
- Real-time event updates

### 💬 Messaging System

- Simple user-to-user messaging
- Real-time message delivery

### 🏠 Group Chat Rooms

- Create and manage chat rooms (Admin)
- Real-time group messaging
- Public and private rooms

### 📄 Basic CMS

- Superuser-managed pages
- Markdown content support
- Public page viewing

## 🚀 Quick Start

### Prerequisites

- **Docker & Docker Compose** (recommended for easiest setup)
- **OR** for local development:
  - Node.js 22+
  - .NET 8 SDK
  - PostgreSQL/MySQL/SQLite

### Option 1: Docker (Recommended)

1. **Clone the repository**
   
   ```bash
   git clone <repository-url>
   cd DuoStackDemo
   ```

2. **Choose your backend and start services**
   
   **With Node.js backend:**
   
   ```bash
   docker-compose up
   ```
   
   **With .NET backend:**
   
   ```bash
   docker-compose --profile dotnet up backend-dotnet db
   ```
   
   **Quick demo with SQLite:**
   
   ```bash
   docker-compose -f docker-compose.sqlite.yml up
   ```

3. **Access the application**
   
   - Frontend: http://localhost:3001
   - Node.js API: http://localhost:3000/api/v1
   - Node.js API Docs: http://localhost:3000/api-docs
   - .NET API: http://localhost:5000/api/v1
   - .NET API Docs: http://localhost:5000/swagger

### Option 2: Local Development

#### Backend Setup (Node.js)

1. **Install dependencies**
   
   ```bash
   cd backend-node
   npm install
   ```

2. **Configure environment**
   
   ```bash
   cp .env.example .env
   # Edit .env to set credentials
   ```

3. **Run migrations and seed**
   
   ```bash
   npm run migrate
   npm run seed
   ```

4. **Start development server**
   
   ```bash
   npm run dev
   ```

#### Backend Setup (.NET)

1. **Configure database**

   ```bash
   cd backend-dotnet/DuoStackDemo.Api
   # Edit appsettings.Development.json with your connection string
   ```

2. **Run migrations and seed**

   ```bash
   dotnet ef database update
   # Seeding happens automatically on first run
   ```

3. **Start development server**

   ```bash
   dotnet run
   ```

#### Frontend Setup

1. **Install dependencies**
   
   ```bash
   cd frontend
   npm install
   ```

2. **Configure backend selection**
   
   ```bash
   cp .env.example .env
   # Set VITE_BACKEND=node or VITE_BACKEND=dotnet
   # Set VITE_REALTIME_BACKEND=socketio or VITE_REALTIME_BACKEND=signalr
   ```

3. **Start development server**
   
   ```bash
   npm run dev
   ```

## 🔑 Default Credentials

After seeding the database, use these credentials to log in:

- **Email**: `superuser@example.com`
- **Username**: `superuser`
- **Password**: `please_change_123`
- **Role**: Superuser

**⚠️ IMPORTANT**: Change this password after first login!

## 🗄️ Database Configuration

### Supported Databases

Both backends support multiple database providers:

- PostgreSQL (recommended)
- MySQL / MariaDB
- Microsoft SQL Server
- SQLite (for development/testing)

### Switching Database Providers

**Node.js Backend** (`.env`):

```bash
DB_DIALECT=postgres  # Options: postgres, mysql, mariadb, mssql, sqlite
DB_HOST=localhost
DB_PORT=5432
DB_NAME=duostackdemo
DB_USER=postgres
DB_PASSWORD=your_password

# For SQLite:
# DB_DIALECT=sqlite
# DB_STORAGE=./database.sqlite
```

**.NET Backend** (`appsettings.Development.json`):

```json
{
  "Database": {
    "Provider": "PostgreSQL"  // Options: PostgreSQL, MySQL, SqlServer, Sqlite
  },
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=duostackdemo;Username=postgres;Password=your_password"
  }
}
```

### Database Migrations

**Node.js (Sequelize):**
In the folder /backend-node

```bash
npm run migrate          # Run migrations
npm run migrate:undo     # Rollback
npm run seed             # Run seeders
```

**.NET (EF Core):**
In the folder /backend-dotnet/DuoStackDemo.Api

```bash
dotnet ef migrations add MigrationName    # Create new migration
dotnet ef database update                 # Apply migrations
```

## 🔄 Switching Between Backends

### Frontend Configuration

Edit `frontend/.env`:

```bash
# Choose backend
VITE_BACKEND=node          # or dotnet
VITE_API_URL=http://localhost:3000         # Node.js
VITE_API_URL_DOTNET=http://localhost:5000  # .NET

# Choose real-time backend
VITE_REALTIME_BACKEND=socketio  # or signalr
```

The frontend automatically adapts to use the selected backend through the `RealtimeAdapter` abstraction.

## 📡 API Documentation

### OpenAPI Specification

The complete API contract is defined in `openapi.yaml`. Both backends implement this specification identically.

### Accessing API Documentation

- **Node.js (Swagger UI)**: http://localhost:3000/api-docs
- **.NET (Swagger UI)**: http://localhost:5000/swagger

## 🧪 Testing

### Run Tests

**Frontend (Vitest):**

```bash
cd frontend
npm test
npm run test:ui  # Interactive UI
```

**Node.js Backend (Jest):**

```bash
cd backend-node
npm test
npm run test:watch
```

**.NET Backend (xUnit):**

```bash
cd backend-dotnet
dotnet test
```

## 🐳 Docker Commands

### Build and Start Services

```bash
# Start with Node.js backend
docker-compose up

# Start with .NET backend
docker-compose --profile dotnet up backend-dotnet db

# Rebuild images
docker-compose build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Remove volumes (⚠️ deletes data)
docker-compose down -v
```

### SQLite Quick Start

```bash
# No external database required
docker-compose -f docker-compose.sqlite.yml up
```

## 🔧 Development

### NPM Scripts (Node.js)

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm test             # Run tests
npm run migrate      # Run database migrations
npm run seed         # Seed database
```

### .NET CLI Commands

```bash
dotnet run                          # Start development server
dotnet build                        # Build project
dotnet test                         # Run tests
dotnet ef migrations add <Name>     # Create migration
dotnet ef database update           # Apply migrations
```

## 📁 Environment Variables

### Frontend (`frontend/.env`)

```bash
VITE_BACKEND=node                    # or dotnet
VITE_API_URL=http://localhost:3000
VITE_REALTIME_BACKEND=socketio       # or signalr
```

### Node.js Backend (`backend-node/.env`)

```bash
# Database
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=duostackdemo
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Server
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:3001

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880  # 5MB in bytes
```

### .NET Backend (`backend-dotnet/appsettings.Development.json`)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=duostackdemo;Username=postgres;Password=your_password"
  },
  "Database": {
    "Provider": "PostgreSQL"
  },
  "Jwt": {
    "Secret": "your-super-secret-jwt-key",
    "Issuer": "WebDuoStackDemo",
    "Audience": "WebDuoStackDemo",
    "ExpiresInMinutes": 15,
    "RefreshTokenExpiresInDays": 7
  },
  "Cors": {
    "AllowedOrigins": ["http://localhost:3001"]
  },
  "FileUpload": {
    "UploadDir": "./uploads",
    "MaxFileSize": 5242880
  }
}
```

## 🎨 Frontend Technologies

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **React Router** - Client-side routing
- **React Query (TanStack Query)** - Data fetching and caching
- **Zustand** - State management
- **React Hook Form + Zod** - Form handling and validation
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **FullCalendar** - Calendar component
- **Socket.IO Client / SignalR Client** - Real-time communication
- **Sonner** - Toast notifications
- **Vitest + React Testing Library** - Testing

## 🛠️ Backend Technologies

### Node.js Backend

- **Express** - Web framework
- **Sequelize** - ORM
- **Socket.IO** - Real-time communication
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT handling
- **Zod** - Schema validation
- **Multer** - File upload handling
- **Morgan** - HTTP request logging
- **Helmet** - Security headers
- **Jest + Supertest** - Testing

### .NET Backend

- **ASP.NET Core 8** - Web framework
- **Entity Framework Core** - ORM
- **MediatR** - CQRS and mediator pattern implementation
- **Mapster** - High-performance object-to-object mapping
- **SignalR** - Real-time communication
- **BCrypt.Net** - Password hashing
- **System.IdentityModel.Tokens.Jwt** - JWT handling
- **Data Annotations** - Validation
- **xUnit** - Testing
- 
