# Student Management System

A full-stack college mini project for managing student records.

> **Status:** Phase 1 (initial project setup). CRUD features are not implemented yet.

## Technology Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | Next.js 14, React 18, TypeScript, CSS |
| Backend  | Python, FastAPI, Uvicorn            |
| Database | SQLite via SQLAlchemy               |

## Prerequisites

- Node.js 18.17 or newer
- Python 3.10 or newer
- Git

## Project Structure

```
student-management-app/
├── backend/
│   ├── app/
│   │   ├── routers/        # API route modules
│   │   ├── config.py       # Environment settings
│   │   ├── database.py     # SQLAlchemy engine and session
│   │   └── main.py         # FastAPI entry point
│   ├── .env.example
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js pages and global styles
│   │   └── lib/api.ts      # Backend API helper
│   ├── .env.example
│   └── package.json
├── .gitignore
└── README.md
```

## Installation and Running

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env             # Windows: copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs  
Health check: http://localhost:8000/api/health

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local       # Windows: copy .env.example .env.local
npm run dev
```

Open http://localhost:3000. The home page shows whether the backend is reachable.

## Database Setup

SQLite needs no installation. The `students.db` file will be created automatically
in the `backend/` folder once the student model is added in Phase 2.

## API Endpoints

Currently available:

- `GET /api/health`: returns `{"status": "ok"}`

Student endpoints will be documented here in Phase 2.

## Screenshots

To be added after the application is completed.
