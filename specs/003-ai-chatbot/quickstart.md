# Quickstart Guide: Phase III - AI Chatbot

**Feature**: 003-ai-chatbot
**Version**: 1.0.0
**Date**: 2025-12-31

## Overview

This guide walks through setting up and running the AI-powered chatbot for the todo application. It covers local development environment setup, MCP server initialization, and testing with natural language queries.

---

## Prerequisites

### System Requirements

- **Python**: 3.13+ with pip or uv
- **Node.js**: 18+ with npm or pnpm
- **Database**: Neon PostgreSQL account (from Phase II)
- **OpenAI API**: Valid API key with sufficient quota
- **Better Auth**: Phase II authentication configured

### Phase II Completion

Ensure Phase II full-stack web application is running:

```bash
# Backend should be running
cd Phase-II-fullstack-web-app/backend
uv run uvicorn src.api.main:app --reload

# Frontend should be running
cd Phase-II-fullstack-web-app/frontend
npm run dev
```

Verify Phase II endpoints:
```bash
curl http://localhost:8000/api/health
# Should return: {"status": "healthy"}

curl http://localhost:3000
# Should load the Phase II todo app
```

---

## Step 1: Install Dependencies

### Backend Dependencies

```bash
cd Phase-II-fullstack-web-app/backend

# Using uv (recommended)
uv add openai-agents-python @modelcontextprotocol/python-sdk slowapi

# Or using pip
pip install openai-agents-python @modelcontextprotocol/python-sdk slowapi
```

**Updated `requirements.txt`**:
```
# Phase II dependencies (existing)
fastapi
sqlmodel
pydantic
better-auth[python]

# Phase III dependencies (new)
openai-agents-python>=0.2.9
@modelcontextprotocol/python-sdk>=0.3.0
slowapi>=0.1.9
```

### Frontend Dependencies

```bash
cd Phase-II-fullstack-web-app/frontend

npm install @openai/chatkit
# Or using pnpm
pnpm add @openai/chatkit
# Or using yarn
yarn add @openai/chatkit
```

**Updated `package.json`**:
```json
{
  "dependencies": {
    // Existing from Phase II
    "next": "16+",
    "@tanstack/react-query": "^5.0.0",
    "better-auth": "^1.0.0",

    // New for Phase III
    "@openai/chatkit": "^1.0.0"
  }
}
```

---

## Step 2: Configure Environment Variables

### Backend Configuration (`.env`)

Add these variables to your backend `.env` file:

```bash
# Phase II existing variables
DATABASE_URL=postgresql://user:password@ep-neon-host/db?sslmode=require
JWT_SECRET=your-super-secret-jwt-key
BETTER_AUTH_SECRET=your-better-auth-secret

# Phase III new variables
OPENAI_API_KEY=sk-your-openai-api-key-here

# Optional: Rate limiting storage (default: in-memory)
# REDIS_URL=redis://localhost:6379/0  # Only for distributed deployments

# Optional: Conversation limits (defaults enforced in code)
MAX_CONVERSATIONS_PER_USER=100
MAX_MESSAGES_PER_CONVERSATION=1000
```

**OpenAI API Key Setup**:
1. Go to [platform.openai.com](https://platform.openai.com)
2. Navigate to API Keys section
3. Create a new API key with appropriate permissions
4. Copy key to clipboard
5. Add to `.env` as `OPENAI_API_KEY`

### Frontend Configuration (`.env.local`)

Frontend environment should already be configured from Phase II:

```bash
# From Phase II (no changes needed)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:8000/auth
```

---

## Step 3: Run Database Migrations

Create conversations and messages tables in Neon PostgreSQL:

```bash
cd Phase-II-fullstack-web-app/backend

# Using Alembic (from Phase II)
alembic revision --autogenerate -m "Add conversations and messages tables"

# Review generated migration file
# It should create conversations and messages tables with indexes

# Apply migration
alembic upgrade head
```

**Verification**:
```bash
# Connect to Neon PostgreSQL and verify tables
psql $DATABASE_URL -c "\dt"

# Should show:
#          List of relations
#  Schema |       Name      |   Type
# ---------+------------+-------
#  public   | users      | table
#  public   | tasks      | table
#  public   | conversations | table
#  public   | messages    | table
```

---

## Step 4: Start MCP Server

The MCP server will be integrated directly into FastAPI application (no separate process needed).

### Start Backend with MCP Server

```bash
cd Phase-II-fullstack-web-app/backend

# Start FastAPI with MCP tools registered
uv run uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000
```

**MCP Server Endpoints** (for testing):
The MCP tools are exposed internally to the OpenAI Agents SDK, not as standalone HTTP endpoints. However, you can test them via the chat endpoint which invokes the agent.

---

## Step 5: Start Frontend with ChatKit

```bash
cd Phase-II-fullstack-web-app/frontend

# Start Next.js development server
npm run dev

# Access chat page
open http://localhost:3000/chat
```

**Chat Page URL**: `http://localhost:3000/chat`

---

## Step 6: Test Natural Language Queries

Once both backend and frontend are running, test the chatbot with natural language queries.

### Test Cases

#### 1. Add Task via Natural Language

**User Message**:
```
Add buy milk tomorrow
```

**Expected AI Response**:
```
I've added 'Buy milk' to your tasks. You now have 1 task total.
```

**Backend Verification**:
```bash
curl -X POST http://localhost:8000/api/{user_id}/chat \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Add buy milk tomorrow"}' \
  | jq

# Should return conversation_id and AI response
```

#### 2. View Tasks

**User Message**:
```
Show my tasks
```

**Expected AI Response**:
```
Here are your current tasks:

1. Buy milk (not completed)
```

#### 3. Update Task

**User Message**:
```
Change task 1 to buy groceries
```

**Expected AI Response**:
```
I've updated task 1 to 'buy groceries'. Task details updated successfully.
```

#### 4. Delete Task

**User Message**:
```
Delete task 1
```

**Expected AI Response**:
```
I've deleted 'buy groceries'. You now have 0 tasks total.
```

#### 5. Mark Task as Complete

**User Message**:
```
Mark task 1 as done
```

**Expected AI Response**:
```
I've marked task 1 as completed. Great progress!
```

#### 6. Conversation History Persistence

**Test Flow**:
1. Start a new conversation: "What's my task count?"
2. Close browser tab
3. Open browser to `http://localhost:3000/chat`
4. Send: "Continue the conversation"
5. Verify conversation history is restored

**Expected Behavior**:
- ChatKit displays previous messages
- Conversation continues from where you left off
- AI maintains context from previous messages

---

## Step 7: Test Rate Limiting

Verify rate limiting enforcement (60 requests/minute per user):

```bash
# Create a script to send requests
cat > test_rate_limit.sh << 'EOF'
#!/bin/bash
JWT_TOKEN="your-jwt-token"
USER_ID="your-user-id"

# Send 61 requests rapidly (exceeds limit of 60)
for i in {1..61}; do
    curl -s -X POST "http://localhost:8000/api/$USER_ID/chat" \
      -H "Authorization: Bearer $JWT_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"message": "Test message '"'$i'"}' > /dev/null
    echo "Request $i: HTTP $(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8000/api/$USER_ID/chat" \
      -H "Authorization: Bearer $JWT_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"message": "test"}')"
done
EOF

chmod +x test_rate_limit.sh
./test_rate_limit.sh
```

**Expected Output**:
```
Request 1-60: HTTP 200
Request 61: HTTP 429
```

**Verify Response Headers** (on 429):
```bash
curl -i -X POST "http://localhost:8000/api/$USER_ID/chat" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}' 2>&1 | grep -i "X-RateLimit"
```

Expected headers:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1735651234
Retry-After: 45
```

---

## Step 8: Monitor Logs

### Backend Logs

```bash
# Backend FastAPI logs should show:
# - MCP tool invocations
# - Agent requests/responses
# - Rate limit enforcement
# - Database queries

# Logs location (default: stdout)
# Tail backend logs
tail -f Phase-II-fullstack-web-app/backend.log
```

### Frontend Logs

```bash
# Next.js dev server logs
tail -f Phase-II-fullstack-web-app/frontend/.next/server.log

# Browser console should show:
# - ChatKit initialization
# - Message bubbles rendering
# - Streaming responses
# - Conversation ID in localStorage
```

---

## Troubleshooting

### Common Issues

#### 1. OpenAI API Rate Limits

**Symptom**: `429 Too Many Requests` from OpenAI API

**Solution**:
- Check your OpenAI API usage at [platform.openai.com/usage](https://platform.openai.com/usage)
- Increase rate limits if needed
- Implement exponential backoff for retries

#### 2. MCP Tool Not Found

**Symptom**: AI agent cannot find MCP tools

**Solution**:
```bash
# Verify MCP server is running
curl http://localhost:8000/health

# Check backend logs for tool registration
grep "MCP tool" backend.log

# Verify tools are registered with agent
# In src/agent/orchestrator.py, check tools list
```

#### 3. Conversation History Not Loading

**Symptom**: Chat page shows no history on page refresh

**Solution**:
1. Open browser DevTools (F12)
2. Go to Application > Local Storage
3. Check for `conversation_id` key
4. If missing, send a message to create a new conversation
5. Verify frontend reads from localStorage correctly

#### 4. Rate Limiting Not Working

**Symptom**: Requests not being limited

**Solution**:
```bash
# Check rate limiting middleware is registered
# In src/api/routes/chat.py, verify:
app.state.limiter = limiter

# Check @limiter.limit decorator is applied
@limiter.limit("60/minute")

# Check JWT token is being extracted correctly
# In src/middleware/auth.py, verify:
request.state.user_id = extract_user_id_from_jwt(token)

# Verify rate limit key function uses user_id
limiter = Limiter(key_func=get_user_id)
```

#### 5. Database Connection Errors

**Symptom**: `psycopg2.OperationalError: could not connect to server`

**Solution**:
1. Verify `DATABASE_URL` in `.env` is correct
2. Test Neon database connectivity:
   ```bash
   psql $DATABASE_URL -c "SELECT 1;"
   ```
3. Check Neon account status (server may be paused)
4. Verify no firewall blocking PostgreSQL port (5432)

---

## Testing Checklist

Use this checklist to verify your setup:

- [ ] Backend starts without errors
- [ ] MCP tools register successfully with OpenAI Agents SDK
- [ ] Frontend loads ChatKit without errors
- [ ] User can authenticate and send messages
- [ ] AI correctly interprets "Add task" natural language
- [ ] AI correctly interprets "Show my tasks" natural language
- [ ] AI correctly interprets "Update task" natural language
- [ ] AI correctly interprets "Delete task" natural language
- [ ] AI correctly interprets "Mark as done" natural language
- [ ] Conversation history persists across browser sessions
- [ ] Rate limiting enforces 60 req/minute limit
- [ ] MCP tools invoke database operations correctly
- [ ] All messages stored in `messages` table
- [ ] All conversations stored in `conversations` table
- [ ] Tool calls tracked in `messages.tool_calls` JSONB field

---

## Production Deployment (Phase IV/V)

This quickstart covers local development. For production deployment to Kubernetes (Phase IV) or cloud (Phase V), refer to the respective phase documentation.

---

## Additional Resources

- [OpenAI Agents SDK Documentation](https://github.com/openai/openai-agents-python)
- [MCP Python SDK Documentation](https://github.com/modelcontextprotocol/python-sdk)
- [SlowAPI Documentation](https://github.com/laurents/slowapi)
- [OpenAI ChatKit Documentation](https://github.com/openai/chatkit-js)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [Better Auth Documentation](https://www.better-auth.com)
- [Neon PostgreSQL Documentation](https://neon.tech/docs)

---

## Support

If you encounter issues not covered in this guide:

1. Check the [research.md](./research.md) for technology decisions and implementation patterns
2. Review [data-model.md](./data-model.md) for database schema details
3. Check [contracts/](./contracts/) for API and tool specifications
4. Open an issue in the repository with detailed reproduction steps
5. Contact the project maintainers via the repository's issue tracker

**Status**: ✅ Quickstart Guide Complete - Ready for Development
