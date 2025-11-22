# Development Mode Guide

This project supports **two development approaches**. Use the reset scripts to switch between them.

---

## 🔄 Quick Reset Commands

### Switch to Local Development
```bash
pnpm reset:local
pnpm start:all
```

### Switch to Docker Development
```bash
pnpm reset:docker
```

---

## 📋 Approach Comparison

| Feature | Local Development | Docker Development |
|---------|------------------|-------------------|
| **Command** | `pnpm start:all` | `pnpm docker:dev` |
| **Services Location** | Node.js processes on your machine | Docker containers |
| **Hot Reload** | ✅ Fast (native) | ⚠️ Slower (volume mounts) |
| **Database** | Docker containers | Docker containers |
| **Setup Time** | Fast | Slow (needs to build images) |
| **Isolation** | Partial | Full |
| **Best For** | Active development, debugging | Testing production setup |

---

## 🚀 Option A: Local Development (Recommended for Development)

**When to use:** When you're actively coding and want fast hot-reload.

### Setup:
```bash
# 1. Reset to local mode
pnpm reset:local

# 2. Start all services
pnpm start:all
```

### What happens:
- ✅ Databases run in Docker (shrine-db, user-db, wishing-db, rabbitmq)
- ✅ Microservices run locally as Node.js processes
- ✅ Frontend runs locally with Vite
- ✅ Fast hot-reload when you save files

### Access Points:
- **Frontend:** http://localhost:5173
- **API Gateway:** http://localhost:3000
- **Databases:** localhost:5432, 5433, 5434

### Stop Services:
Press `Ctrl+C` in the terminal running `pnpm start:all`

---

## 🐳 Option B: Docker Development (Production-like)

**When to use:** Testing Docker setup, CI/CD, or production simulation.

### Setup:
```bash
# 1. Reset to Docker mode
pnpm reset:docker

# This automatically builds and starts all containers
```

### What happens:
- ✅ Everything runs in Docker containers
- ✅ Production-like environment
- ✅ Network isolation
- ⚠️ Slower hot-reload (uses volume mounts)

### Access Points:
- **API Gateway:** http://localhost:3000
- **pgAdmin:** http://localhost:8080
- **All services:** Ports 5001-5005

### Useful Commands:
```bash
# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f api-gateway

# Restart a service
docker-compose restart api-gateway

# Stop all
docker-compose down
```

---

## 🔧 Manual Commands (Advanced)

### Local Development (Manual)
```bash
# Start only databases
docker-compose up -d shrine-db user-db wishing-db rabbitmq

# Start services locally
pnpm start:all
```

### Docker Development (Manual)
```bash
# Stop everything
docker-compose down

# Start in dev mode with hot-reload
docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build

# OR start in production mode
docker-compose -f docker-compose.yml up -d
```

---

## 🗄️ Database Management

### Seed Databases:
```bash
# Seed shrines
pnpm db:seed:shrines

# Seed wishes
pnpm db:seed:wishes

# Seed techniques
pnpm db:seed:techniques
```

### Access Databases:
- **pgAdmin:** http://localhost:8080
  - Email: admin@example.com
  - Password: admin

### Connection Strings:
```
shrine-db:   postgresql://postgres:postgres@localhost:5432/shrine_service
user-db:     postgresql://postgres:postgres@localhost:5434/user_service
wishing-db:  postgresql://postgres:postgres@localhost:5433/wishing_service
```

---

## ⚠️ Troubleshooting

### Port Conflicts
**Error:** "Port already in use"

**Solution:**
```bash
# Check what's using the port
netstat -ano | findstr :3000

# Stop local services
# Press Ctrl+C in terminal running pnpm start:all

# OR reset to Docker mode
pnpm reset:docker
```

### Proto File Errors
**Error:** "user.proto not found"

**Solution:** The reset scripts handle this, but manually:
- Local mode uses `process.cwd() + '/proto/user.proto'`
- Docker mode mounts `./proto:/app/proto`

### Database Connection Errors
**Error:** "Connection refused" to database

**Solution:**
```bash
# Ensure databases are running
docker ps | findstr "db"

# If not, start them
docker-compose up -d shrine-db user-db wishing-db

# Check database logs
docker-compose logs shrine-db
```

### Services Won't Start
**Error:** Mix of local and Docker services

**Solution:**
```bash
# Nuclear option - stop everything
docker-compose down
# Kill local processes (Ctrl+C)

# Then pick one approach:
pnpm reset:local  # for local
pnpm reset:docker # for Docker
```

---

## 🎯 Recommended Workflow

### Daily Development:
1. **Morning:**
   ```bash
   pnpm reset:local
   pnpm start:all
   ```

2. **Code and test** with fast hot-reload

3. **Before committing:**
   ```bash
   # Stop local services (Ctrl+C)
   pnpm reset:docker
   # Test in production-like environment
   ```

4. **End of day:**
   ```bash
   docker-compose down
   ```

---

## 📝 Summary

- **Use `pnpm reset:local`** for daily coding (fast hot-reload)
- **Use `pnpm reset:docker`** for testing production setup
- **Never run both at the same time!**
- Scripts handle cleanup automatically

---

Need help? Check the main README.md or ask the team!
