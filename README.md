# Student Management System

A full-stack college mini project for managing student records.

The application provides a responsive dashboard and student record screens with
create, read, update, delete, search, and paginated listing.

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
│   │   ├── models.py       # SQLAlchemy student model
│   │   ├── schemas.py      # Request/response validation
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

### Run locally in VS Code (Windows)

1. Open the project folder `student-management-app` in VS Code (the folder that
   contains `backend` and `frontend`).
2. Install the prerequisites: Node.js 18.17 or newer, Python 3.11 (recommended;
   Python 3.10–3.13 are supported by the pinned backend dependencies), and the
   VS Code Python extension.
3. In VS Code, open **Terminal → New Terminal** and start the backend:

```bash
cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
python -m uvicorn app.main:app --reload --port 8000
```

   In VS Code, use **Ctrl+Shift+P → Python: Select Interpreter** and select
   `backend\.venv\Scripts\python.exe`. If Python 3.11 is not installed, use an
   installed Python 3.10–3.13 version in place of `py -3.11`. If PowerShell
   blocks virtual-environment activation, run the install/start commands using
   `.\.venv\Scripts\python.exe` instead of `python`.

4. Open a second VS Code terminal and start the frontend:

```bash
cd frontend
npm ci
Copy-Item .env.example .env.local
npm run dev
```

5. Open http://localhost:3000. The API documentation is at
   http://localhost:8000/docs, and the backend health check is at
   http://localhost:8000/api/health.

The example environment files use the local defaults: SQLite is stored at
`backend/students.db`, and the frontend connects to `http://localhost:8000`.
Leave both terminals running while using the application.

### Production frontend build

From a VS Code terminal in `frontend`, run:

```bash
npm ci
npm run build
```

To serve the production build locally, run `npm start` after the build.
The development server uses `frontend/.next-dev`, separate from the
production build's `frontend/.next`, so builds can run while development is
active. If `NEXT_PUBLIC_API_URL` changes, restart `npm run dev`; if it still
requests an old API address, stop the server, remove the generated
`frontend/.next-dev` cache, and restart it.

## Database Setup

SQLite needs no installation. The `students.db` file and `students` table are
created automatically when the backend starts. Set `DATABASE_URL` in
`backend/.env` to use a different SQLAlchemy database URL.

## API Endpoints

Student create and update requests require:

- `first_name`: 1–100 characters, starts with a capital letter
- `last_name`: 1–100 characters, starts with a capital letter
- `phone`: exactly `+91` followed by 10 digits
- `email`: a valid email address (up to 254 characters)
- `date_of_birth`: a valid date that is not in the future
- `gender`: `Male`, `Female`, or `Other`
- `course`: 1–100 non-blank characters
- `address`: 1–500 non-blank characters

Available endpoints:

- `GET /api/health`: returns `{"status": "ok"}`
- `GET /api/students/summary`: returns student, distinct course, and gender totals
- `GET /api/students/reports`: returns course-wise and gender-wise record counts
- `GET /api/students?search=&page=1&page_size=10`: search and paginate students;
  `page_size` defaults to 10 and accepts values up to 50
- `POST /api/students`: create a student
- `GET /api/students/{id}`: view a student
- `PUT /api/students/{id}`: update a student
- `DELETE /api/students/{id}`: delete a student

The frontend displays 10 student records per page. Search matches first name,
last name, full name, email, and phone number, and pagination updates against the
filtered results. When the backend starts against a database created by an older
version, it adds the five new student columns without deleting existing records;
older rows retain their original information, and the new fields are required
when creating or updating a student.

## Screenshots

To be added after the application is completed.
