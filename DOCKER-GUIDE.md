# Docker Deployment Guide

Complete guide for building, testing, and deploying the DuoStackDemo with Docker.

## 🐳 Docker Setup Overview

The project includes three main services:

- **Frontend**: React + Vite (served by Nginx)
- **Backend (Node.js)**: Express + Sequelize + Socket.IO
- **Backend (.NET)**: ASP.NET Core + EF Core + SignalR
- **Database**: PostgreSQL (or other supported databases)

## 📦 Docker Files

```
DuoStackDemo/
├── docker-compose.yml              # Main compose file (Node backend + PostgreSQL)
├── docker-compose.sqlite.yml       # SQLite variant (no external DB)
├── frontend/Dockerfile             # React frontend build
├── frontend/nginx.conf             # Nginx configuration
├── backend-node/Dockerfile         # Node.js backend build
├── backend-dotnet/Dockerfile       # .NET backend build
└── .dockerignore                   # Files to exclude from builds
```

## 🚀 Quick Start

### Option 1: Full Stack with Node.js Backend

```bash
# Start all services
docker-compose up

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Access:**

- Frontend: http://localhost:3001
- Node API: http://localhost:3000
- PostgreSQL: localhost:5432

### Option 2: Full Stack with .NET Backend

```bash
# Start with .NET backend
docker-compose --profile dotnet up backend-dotnet db

# With frontend
docker-compose --profile dotnet up
```

**Access:**

- Frontend: http://localhost:3001
- .NET API: http://localhost:5000
- PostgreSQL: localhost:5432

### Option 3: Quick Demo with SQLite

```bash
# No external database required
docker-compose -f docker-compose.sqlite.yml up
```

## 🔨 Building Images

### Build All Images

```bash
docker-compose build
```

### Build Specific Service

```bash
# Frontend only
docker-compose build frontend

# Node backend only
docker-compose build backend-node

# .NET backend only
docker-compose build backend-dotnet
```

### Build with No Cache

```bash
docker-compose build --no-cache
```

## 🧪 Testing Docker Builds

### Test Frontend Build

```bash
cd frontend

# Build image
docker build -t duostackdemo-frontend:test .

# Run container
docker run -d -p 8080:80 --name frontend-test duostackdemo-frontend:test

# Test
curl http://localhost:8080

# Cleanup
docker stop frontend-test
docker rm frontend-test
```

### Test Node Backend Build

```bash
cd backend-node

# Build image
docker build -t duostackdemo-backend-node:test .

# Run with environment variables
docker run -d -p 3000:3000 \
  -e DB_DIALECT=sqlite \
  -e DB_STORAGE=/app/data/database.sqlite \
  -e JWT_SECRET=test-secret \
  --name backend-node-test \
  duostackdemo-backend-node:test

# Test
curl http://localhost:3000/health

# Cleanup
docker stop backend-node-test
docker rm backend-node-test
```

### Test .NET Backend Build

```bash
cd backend-dotnet

# Build image
docker build -t duostackdemo-backend-dotnet:test .

# Run with environment variables
docker run -d -p 5000:5000 \
  -e ConnectionStrings__DefaultConnection="Data Source=/app/data/app.db" \
  -e Database__Provider=Sqlite \
  -e Jwt__Secret=test-secret \
  --name backend-dotnet-test \
  duostackdemo-backend-dotnet:test

# Test
curl http://localhost:5000/health

# Cleanup
docker stop backend-dotnet-test
docker rm backend-dotnet-test
```

## 🔄 Database Provider Switching

### PostgreSQL (Default)

```yaml
# docker-compose.yml
services:
  backend-node:
    environment:
      - DB_DIALECT=postgres
      - DB_HOST=db
      - DB_PORT=5432
      - DB_NAME=duostackdemo
      - DB_USER=postgres
      - DB_PASSWORD=your_password
```

### MySQL

```yaml
# Add MySQL service
services:
  db:
    image: mysql:8
    environment:
      - MYSQL_DATABASE=duostackdemo
      - MYSQL_USER=mysqluser
      - MYSQL_PASSWORD=your_password
      - MYSQL_ROOT_PASSWORD=root_password
    ports:
      - "3306:3306"

  backend-node:
    environment:
      - DB_DIALECT=mysql
      - DB_HOST=db
      - DB_PORT=3306
      - DB_NAME=duostackdemo
      - DB_USER=dbuser
      - DB_PASSWORD=your_password
```

### SQLite (No External DB)

```bash
# Use the SQLite compose file
docker-compose -f docker-compose.sqlite.yml up
```

## 🔐 Environment Variables in Docker

### Frontend Environment Variables

```yaml
services:
  frontend:
    environment:
      - VITE_BACKEND=node  # or dotnet
      - VITE_API_URL=http://localhost:3000
      - VITE_REALTIME_BACKEND=socketio  # or signalr
```

### Backend Environment Variables

See `.env.example` files in each backend directory for complete lists.

**Critical variables:**

- `DB_DIALECT`, `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET` (MUST be changed in production!)
- `CORS_ORIGIN`
- `NODE_ENV` / `ASPNETCORE_ENVIRONMENT`

## 📊 Health Checks

All services include health checks for Docker monitoring:

```yaml
services:
  backend-node:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

## 🔍 Debugging Docker Issues

### View Container Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend-node

# Last 100 lines
docker-compose logs --tail=100 backend-node
```

### Execute Commands in Running Container

```bash
# Access Node backend shell
docker-compose exec backend-node sh

# Access .NET backend shell
docker-compose exec backend-dotnet sh

# Check environment variables
docker-compose exec backend-node env
```

### Inspect Container

```bash
# Get container ID
docker ps

# Inspect container
docker inspect <container-id>

# View container stats
docker stats
```

### Common Issues

#### 1. Port Already in Use

```bash
# Find process using port
lsof -i :3000

# Kill process or change port in docker-compose.yml
```

#### 2. Database Connection Failed

```bash
# Check database logs
docker-compose logs db

# Verify database is ready
docker-compose exec db pg_isready -U postgres
```

#### 3. Build Fails

```bash
# Clean build cache
docker-compose build --no-cache

# Remove old images
docker system prune -a
```

#### 4. Container Exits Immediately

```bash
# Check exit code
docker-compose ps

# View full logs
docker-compose logs backend-node
```

## 🗄️ Data Persistence

### Volume Management

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect appdemo_postgres-data

# Backup database volume
docker run --rm -v appdemo_postgres-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/db-backup.tar.gz /data

# Restore database volume
docker run --rm -v appdemo_postgres-data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/db-backup.tar.gz -C /
```

### Remove Volumes (⚠️ Deletes Data!)

```bash
# Stop and remove containers with volumes
docker-compose down -v

# Remove specific volume
docker volume rm appdemo_postgres-data
```

## 🚀 Production Deployment

### Build for Production

```bash
# Set production environment
export NODE_ENV=production
export ASPNETCORE_ENVIRONMENT=Production

# Build images
docker-compose -f docker-compose.yml build

# Tag images for registry
docker tag duostackdemo-frontend:latest your-registry/duostackdemo-frontend:v1.0.0
docker tag duostackdemo-backend-node:latest your-registry/duostackdemo-backend-node:v1.0.0
```

### Production Checklist

- [ ] Change all default passwords
- [ ] Set strong JWT_SECRET
- [ ] Use external database (not Docker)
- [ ] Configure SSL/TLS
- [ ] Set up reverse proxy (Nginx/Traefik)
- [ ] Configure proper CORS origins
- [ ] Set up monitoring and logging
- [ ] Configure automatic backups
- [ ] Use Docker secrets for sensitive data
- [ ] Set resource limits

### Production docker-compose Example

```yaml
services:
  frontend:
    image: your-registry/duostackdemo-frontend:v1.0.0
    restart: always
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

  backend-node:
    image: your-registry/duostackdemo-backend-node:v1.0.0
    restart: always
    environment:
      - NODE_ENV=production
      - DB_HOST=external-db.example.com
      - JWT_SECRET=${JWT_SECRET}  # From Docker secrets
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
    secrets:
      - jwt_secret

secrets:
  jwt_secret:
    external: true
```

## 🔄 Development Workflow

### Local Development with Docker

```bash
# Start only database
docker-compose up db

# Run backends locally (faster for development)
cd backend-node && npm run dev

# Connect to Docker database
# Use connection string from docker-compose.yml
```

### Hot Reload with Volumes

```yaml
# Development override
services:
  backend-node:
    volumes:
      - ./backend-node/src:/app/src
    command: npm run dev
```

## 🧹 Cleanup

### Remove Everything

```bash
# Stop and remove containers, networks, volumes
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Remove all unused Docker resources
docker system prune -a --volumes
```

### Selective Cleanup

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove unused networks
docker network prune
```

## 📚 Additional Resources

- **Docker Compose Reference**: https://docs.docker.com/compose/
- **Docker Best Practices**: https://docs.docker.com/develop/dev-best-practices/
- **Multi-Stage Builds**: https://docs.docker.com/build/building/multi-stage/
