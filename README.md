# Evolution of Todo: Phase III - AI-Powered Chatbot

This repository contains the Evolution of Todo project, progressing through three phases:
- **Phase I**: Console-based Python todo application
- **Phase II**: Full-stack web application with authentication
- **Phase III**: AI-powered chatbot with natural language task management

## Project Structure

```
/
├── frontend/              # Next.js 16+ application
│   ├── src/
│   │   ├── app/chat/      # Chat page with ChatKit integration
│   │   └── components/
│   │       └── chat/      # ChatKit components
├── backend/               # FastAPI application
│   ├── src/
│   │   ├── agent/         # OpenAI Agents SDK orchestrator
│   │   ├── api/routes/    # Chat endpoint + ChatKit protocol
│   │   ├── mcp/           # Official MCP SDK (FastMCP)
│   │   ├── models/        # SQLModel entities
│   │   └── services/      # Business logic
│   └── alembic/           # Database migrations
├── specs/                 # Detailed specifications
│   └── 003-ai-chatbot/    # Phase III specs
└── Phase-1-Console-App/   # Phase I implementation
```

## Tech Stack

### Frontend
- **Next.js** 16+ (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Better Auth** (JWT authentication)
- **OpenAI ChatKit** (@openai/chatkit-react)
- **Zod** (validation)

### Backend
- **FastAPI**
- **SQLModel** (SQLAlchemy + Pydantic)
- **PostgreSQL** (Neon Serverless)
- **OpenAI Agents SDK** (Agent orchestration)
- **FastMCP** (Official MCP SDK)
- **python-jose** (JWT verification)
- **Pytest** (testing)

## Features

### Phase III: AI-Powered Chatbot

The chatbot enables users to manage their tasks entirely through natural language:

- **Add Task**: "Add buy milk tomorrow"
- **View Tasks**: "Show my tasks", "What's pending?"
- **Update Task**: "Change task 3 to buy groceries"
- **Delete Task**: "Delete meeting task"
- **Complete Task**: "Mark task 2 as done", "I finished paying bills"

## Local Development Setup

### Prerequisites
- Docker and Docker Compose (optional)
- Node.js 20+
- Python 3.13+
- OpenAI API key

### Environment Variables

#### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# JWT Secret (must match frontend)
BETTER_AUTH_SECRET=your-secret-key-here

# Better Auth URL
BETTER_AUTH_URL=http://localhost:3000

# OpenAI API (Required for Phase III)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Application
DEBUG=true
LOG_LEVEL=info
```

#### Frontend (.env.local)
```bash
# Better Auth
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000

# ChatKit API (Phase III)
NEXT_PUBLIC_CHATKIT_API_URL=http://localhost:8000/api/chatkit

# OpenAI (optional for client-side features)
NEXT_PUBLIC_OPENAI_API_KEY=sk-your-openai-api-key-here
```

### Quickstart with Docker

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd evolution-of-todo
   ```

2. Run the development environment:
   ```bash
   docker-compose up
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API docs: http://localhost:8000/docs
   - Chat page: http://localhost:3000/chat

### Manual Setup

#### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate virtual environment:
   ```bash
   python3.13 -m venv .venv
   source .venv/bin/activate
   ```

3. Install dependencies (including MCP SDK):
   ```bash
   pip install -e ".[test]"
   uv pip install "fastmcp>=0.1.0" "mcp>=0.9.0"
   ```

4. Copy environment template:
   ```bash
   cp .env.example .env
   ```

5. Configure `.env` with your settings (see Environment Variables section above)

6. Run database migrations:
   ```bash
   alembic upgrade head
   ```

7. Start the server:
   ```bash
   uvicorn src.main:app --reload --port 8000
   ```

#### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Copy environment template:
   ```bash
   cp .env.local.example .env.local
   ```

4. Configure `.env.local` with your settings (see Environment Variables section above)

5. Start the development server:
   ```bash
   pnpm dev
   ```

## Database Setup

### Running Migrations

The backend uses Alembic for database migrations. Phase III adds conversations and messages tables:

```bash
cd backend
alembic upgrade head
```

### Migration Rollback

If needed, rollback migrations:
```bash
alembic downgrade -1
```

## Testing the Chatbot

### Manual Testing

1. Start both frontend and backend servers
2. Navigate to http://localhost:3000
3. Sign in or create an account
4. Go to the chat page: http://localhost:3000/chat
5. Try natural language commands:
   - "Add a task to buy groceries"
   - "Show me all my tasks"
   - "Mark task 1 as complete"
   - "Delete the task about meetings"

### Backend Tests

```bash
cd backend
pytest -v
```

### Frontend Tests

```bash
cd frontend
npm test
```

## API Endpoints

### Task Management (Phase II)
- `GET /api/{user_id}/tasks` - List all tasks
- `POST /api/{user_id}/tasks` - Create a new task
- `PUT /api/{user_id}/tasks/{task_id}` - Update a task
- `DELETE /api/{user_id}/tasks/{task_id}` - Delete a task
- `PATCH /api/{user_id}/tasks/{task_id}` - Toggle completion

### Chatbot (Phase III)
- `POST /api/{user_id}/chat` - Send message to AI chatbot
- `POST /api/chatkit/session` - Create ChatKit session
- `POST /api/chatkit` - ChatKit protocol endpoint (SSE streaming)

### Health & Status
- `GET /health` - Overall health check
- `GET /health/chat` - Chatbot feature health check

## Architecture

### Phase III Chatbot Flow

```
┌─────────────┐
│  Frontend   │
│  (ChatKit)  │
└──────┬──────┘
       │ SSE + JWT
       ▼
┌───────────────────────────────────────────────────┐
│  Backend (FastAPI)                                 │
│                                                     │
│  ┌──────────────────────────────────────────────┐ │
│  │ POST /api/chatkit                            │ │
│  │   ↓                                           │ │
│  │ AgentOrchestrator (OpenAI Agents SDK)        │ │
│  │   ↓                                           │ │
│  │ MCP Tools (FastMCP Server)                   │ │
│  │   ├─ add_task                                │ │
│  │   ├─ list_tasks                               │ │
│  │   ├─ update_task                              │ │
│  │   ├─ delete_task                              │ │
│  │   └─ complete_task                            │ │
│  └──────────────────────────────────────────────┘ │
│                                                     │
│  ┌──────────────────────────────────────────────┐ │
│  │ PostgreSQL Database (Neon)                    │ │
│  │   ├─ tasks                                    │ │
│  │   ├─ conversations                             │ │
│  │   └─ messages                                 │ │
│  └──────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────┘
```

## MCP Tools Specification

The MCP server exposes 5 tools for task management:

| Tool | Parameters | Description |
|------|-----------|-------------|
| `add_task` | title, description, priority | Create a new task |
| `list_tasks` | completed (optional) | List tasks with optional filter |
| `update_task` | task_id, title, description, priority | Update existing task |
| `delete_task` | task_id | Delete a task |
| `complete_task` | task_id, completed | Mark task as complete/incomplete |

All tools are stateless and require user authentication via JWT token.

## Troubleshooting

### Chatbot Not Responding

1. Check OPENAI_API_KEY is set correctly:
   ```bash
   cd backend
   cat .env | grep OPENAI
   ```

2. Verify backend health:
   ```bash
   curl http://localhost:8000/health/chat
   ```

3. Check frontend console for errors (F12 in browser)

### Database Connection Issues

1. Verify DATABASE_URL is correct
2. Run migrations: `alembic upgrade head`
3. Check Neon database status

### MCP Server Issues

1. Verify FastMCP is installed:
   ```bash
   source backend/.venv/bin/activate
   python -c "from fastmcp import FastMCP; print('OK')"
   ```

2. Check MCP server logs in backend console

## Specifications

Detailed specifications for each phase:
- **Phase I**: `specs/001-console-todo-app/`
- **Phase II**: `specs/002-fullstack-web-app/`
- **Phase III**: `specs/003-ai-chatbot/`

## Development Workflow

1. Read the spec for the feature you're implementing
2. Make your changes
3. Run tests to verify
4. Update documentation if needed

## License

MIT
