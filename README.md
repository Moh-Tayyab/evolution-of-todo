# Evolution of Todo: Phase II - Full-Stack Web Application

This repository contains the Evolution of Todo project, moving from a Phase I Console App to a Phase II Full-Stack Web Application.

## Project Structure

- `frontend/`: Next.js 16+ application with TypeScript, Tailwind CSS, and Better Auth.
- `backend/`: FastAPI application with SQLModel, Neon PostgreSQL, and JWT authentication.
- `specs/`: Detailed specifications and implementation plans.
- `Phase-1-Console-App/`: The completed Phase I implementation.

## Tech Stack

### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Better Auth (JWT)
- Zod

### Backend
- FastAPI
- SQLModel (SQLAlchemy + Pydantic)
- PostgreSQL (Neon Serverless)
- Python-jose (JWT verification)
- Pytest

## Local Development Setup

### Prerequisites
- Docker and Docker Compose
- Node.js 20+
- Python 3.13+

### Quickstart with Docker

1. Clone the repository.
2. Run the development environment:
   ```bash
   docker-compose up
   ```
3. Access the frontend at `http://localhost:3000`.
4. Access the backend API docs at `http://localhost:8000/docs`.

### Manual Setup (Optional)

#### Backend
1. Navigate to `backend/`.
2. Create a virtual environment and install dependencies:
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install -e ".[test]"
   ```
3. Copy `.env.example` to `.env` and configure.
4. Run the server:
   ```bash
   uvicorn src.main:app --reload
   ```

#### Frontend
1. Navigate to `frontend/`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.local.example` to `.env.local` and configure.
4. Run the development server:
   ```bash
   npm run dev
   ```

## Specifications

Detailed specifications for Phase II can be found in `specs/002-fullstack-web-app/spec.md`.
The implementation plan is in `specs/002-fullstack-web-app/plan.md`.

## License

MIT
