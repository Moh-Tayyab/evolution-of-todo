# Quickstart: Phase II Todo Full-Stack Web Application

**Feature**: 002-fullstack-web-app
**Date**: 2025-12-29

## Prerequisites

- **Node.js**: 20+ (for frontend)
- **Python**: 3.13+ (for backend)
- **UV**: Python package manager (recommended) or pip
- **Docker**: For local PostgreSQL (optional, can use Neon directly)
- **Git**: For version control

## Quick Start (5 minutes)

### 1. Clone and Setup

```bash
# Navigate to project root
cd /home/evolution-of-todo

# Create environment files from examples
cp frontend/.env.local.example frontend/.env.local
cp backend/.env.example backend/.env
```

### 2. Configure Environment Variables

**frontend/.env.local**:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
BETTER_AUTH_SECRET=your-super-secret-key-at-least-32-characters-long
BETTER_AUTH_URL=http://localhost:3000
```

**backend/.env**:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/todo_db
BETTER_AUTH_SECRET=your-super-secret-key-at-least-32-characters-long
CORS_ORIGINS=http://localhost:3000
```

> **IMPORTANT**: `BETTER_AUTH_SECRET` must be identical in both files!

### 3. Start Database (Option A: Docker)

```bash
# Start PostgreSQL container
docker run -d \
  --name todo-postgres \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=todo_db \
  -p 5432:5432 \
  postgres:16

# Verify connection
docker exec -it todo-postgres psql -U user -d todo_db -c "SELECT 1;"
```

### 3. Start Database (Option B: Neon)

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project and database
3. Copy the connection string to `backend/.env`:
   ```env
   DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

### 4. Setup Backend

```bash
cd backend

# Install dependencies with UV
uv sync

# Or with pip
pip install -e ".[dev]"

# Run database migrations
uv run alembic upgrade head

# Start the server
uv run uvicorn src.main:app --reload --port 8000
```

Backend should be running at `http://localhost:8000`

Test it:
```bash
curl http://localhost:8000/health
# Expected: {"status": "healthy"}
```

### 5. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend should be running at `http://localhost:3000`

### 6. Verify Setup

1. Open `http://localhost:3000` in your browser
2. You should see the landing page
3. Click "Sign Up" to create an account
4. After signup, you should be redirected to the dashboard

## Development Workflow

### Running Both Services

**Terminal 1 (Backend)**:
```bash
cd backend
uv run uvicorn src.main:app --reload --port 8000
```

**Terminal 2 (Frontend)**:
```bash
cd frontend
npm run dev
```

### Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## Testing

### Backend Tests

```bash
cd backend

# Run all tests
uv run pytest

# Run with coverage
uv run pytest --cov=src --cov-report=html

# Run specific test file
uv run pytest tests/unit/test_tasks.py
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## API Documentation

Once the backend is running, access:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## Common Issues

### CORS Errors

If you see CORS errors in the browser console:
1. Verify `CORS_ORIGINS` in `backend/.env` includes `http://localhost:3000`
2. Restart the backend server

### JWT Verification Fails

If API calls return 401 Unauthorized:
1. Check that `BETTER_AUTH_SECRET` is identical in both `.env` files
2. Clear browser cookies/localStorage and sign in again
3. Check JWT expiration (24 hours)

### Database Connection Failed

If the backend can't connect to the database:
1. Verify PostgreSQL is running: `docker ps` or check Neon dashboard
2. Test connection: `psql $DATABASE_URL -c "SELECT 1;"`
3. Check `DATABASE_URL` format in `backend/.env`

### Port Already in Use

```bash
# Find process using port 8000
lsof -i :8000
# Kill it
kill -9 <PID>

# Or use different ports
uv run uvicorn src.main:app --reload --port 8001
npm run dev -- -p 3001
```

## Project Structure Reference

```
/
├── frontend/               # Next.js application
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # React components
│   │   ├── lib/           # Utilities (auth, api)
│   │   └── types/         # TypeScript types
│   └── tests/
│
├── backend/               # FastAPI application
│   ├── src/
│   │   ├── api/          # Route handlers
│   │   ├── models/       # SQLModel entities
│   │   ├── schemas/      # Pydantic schemas
│   │   └── middleware/   # Auth middleware
│   └── tests/
│
├── specs/                 # Specifications
│   └── 002-fullstack-web-app/
│       ├── spec.md
│       ├── plan.md
│       ├── research.md
│       ├── data-model.md
│       ├── quickstart.md  # This file
│       └── contracts/
│
└── docker-compose.yml
```

## Next Steps

1. Run `/sp.tasks` to generate implementation tasks
2. Follow the task breakdown to implement features
3. Run tests after each implementation
4. Create PHRs for each significant change

## Support

- Check `specs/002-fullstack-web-app/spec.md` for requirements
- Check `specs/002-fullstack-web-app/contracts/openapi.yaml` for API details
- Check `.specify/memory/constitution.md` for project standards
