# Student Management System

A full-stack college mini project for managing student records.

The application provides a responsive dashboard and student record screens with
create, read, update, delete, search, and paginated listing.

## Technology Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | Next.js 14, React 18, TypeScript, CSS |
| Backend  | Python, FastAPI, Uvicorn            |
| Database | PostgreSQL on Render; SQLite locally via SQLAlchemy |

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
   http://localhost:8000/health.

The example environment files use local defaults: SQLite is stored at
`backend/students.db`, and the frontend connects to `http://127.0.0.1:8000`.
In production, deploy the frontend as a Render **Web Service** running Next.js,
not as a Static Site. Set its build command to `npm ci && npm run build`, its
start command to `npm start`, and its root directory to `frontend`. Next.js
serves the App Router pages on direct requests and refreshes; the `/` route is
the Dashboard. Set the frontend's `NEXT_PUBLIC_API_URL` to the deployed backend
URL before building.
Leave both terminals running while using the application.

### Deploy the frontend to Vercel

The Next.js frontend includes `frontend/vercel.json`, which selects the Next.js
framework and uses `npm ci` and `npm run build`. In Vercel, import the Git
repository and set the project root directory to `frontend`; leave the output
directory at its Next.js default. Add `NEXT_PUBLIC_API_URL` in the Vercel
project's Environment Variables for Production and Preview:

```text
/api
```

The Vercel rewrite proxies same-origin `/api/*` requests to the Render backend.
This avoids browser CORS errors for Vercel deployment URLs. The value is public;
do not put database credentials in frontend environment variables. Deploy a
Preview first, verify the dashboard and student API calls, then promote it to
Production. Alternatively,
from the `frontend` directory with the Vercel CLI installed and authenticated,
run `npx vercel` for a Preview deployment and `npx vercel --prod` for Production.
The Vercel account must have permission to access the linked repository. Ensure
the backend's `CORS_ORIGINS` also allows the assigned Vercel production domain
and any Preview domain you test.

### Production hosting: Render backend and Vercel frontend

The FastAPI backend is hosted as a Render Web Service, and the Next.js
frontend is deployed to Vercel. The frontend's `vercel.json` proxies
same-origin `/api/*` requests to
`https://student-management-system-7zvb.onrender.com/api/*`. This is the
currently verified backend URL; `/api/health` and `/api/students/summary`
return HTTP 200 through both the Render URL and the Vercel proxy.

Keep the backend's `DATABASE_URL` configured in the Render service to point to
the persistent PostgreSQL database. The frontend does not need database
credentials. Because the Vercel rewrite is same-origin from the browser,
browser CORS settings are not required for this frontend-to-backend path.
Deploy backend changes to the existing Render service, then deploy frontend
changes to the Vercel project. Do not switch the Vercel rewrite to another
backend unless that backend has been deployed and its endpoints verified.

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

SQLite needs no installation. The local `students.db` file and `students`
table are created automatically when the backend starts. Set `DATABASE_URL` in
`backend/.env` to use a different SQLAlchemy database URL.

### Render production deployment and persistent storage

The repository includes a root-level `render.yaml` Blueprint for the FastAPI
web service. It uses `backend` as the service root, installs
`backend/requirements.txt`, starts `app.main:app`, and checks `/api/health`.
The Blueprint deliberately does not create a database. When configuring the
service in Render, provide `DATABASE_URL` as a secret using the existing
PostgreSQL database's internal connection string. Deploying this Blueprint may
create a new Render service; it does not automatically adopt or update the
existing service. Avoid creating a duplicate service unless that is intended.

1. Create a **paid Render PostgreSQL** database for the application. Do not use
   Render's expiring free PostgreSQL tier for student records that must persist.
2. If the current deployment has student data in SQLite, back up that database
   and import it to PostgreSQL **before changing the backend service's
   `DATABASE_URL`**. The import command below needs the source SQLite file and a
   PostgreSQL connection string; use Render's external connection string when
   running the import locally. If the existing SQLite file is only available on
   the deployed instance, first retrieve it safely or arrange a one-off
   migration while it is available. Do not cut over until the imported row
   count is verified.
3. Before changing the backend database schema or URL, create and verify a
   backup of the Render PostgreSQL database in the Render dashboard. For an
   existing SQLite database, also create and verify a separate SQLite backup.
   Do not treat the workspace backup as a backup of Render data.
4. In the backend Render Web Service, set `DATABASE_URL` to the PostgreSQL
   database's **internal connection string**. The backend accepts Render's
   `postgres://` or `postgresql://` URL format and uses PostgreSQL in
   production. It exits with a clear configuration error if `DATABASE_URL` is
   missing or points to SQLite in production; SQLite remains the
   local-development default only. `APP_ENV=production` may also be set to
   enforce production database checks outside Render.
5. If a frontend calls the backend directly from the browser, set
   `CORS_ORIGINS` to its deployed origin(s). The current Vercel frontend uses
   a same-origin `/api` rewrite, so it does not require CORS access to the
   backend from the browser.
   Configure the service root directory as `backend`, build command as
   `pip install -r requirements.txt`, and start command as
   `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
6. If the existing PostgreSQL database predates age and blood group, apply the
   additive migration only after the verified backup. From the backend directory,
   set `DATABASE_URL` temporarily to the database's external URL in a private,
   uncommitted environment, then run
   `python .\migrate_student_schema.py --backup-confirmed`. This adds missing
   nullable student columns and never changes or deletes rows. For an SQLite
   database being imported, run the data importer below instead; it also adds
   missing nullable destination columns.
7. In the frontend Render Web Service, set the root directory to `frontend`,
   build command to `npm ci && npm run build`, and start command to `npm start`.
   Set `NEXT_PUBLIC_API_URL` to the backend service URL (for example
   `https://your-backend.onrender.com`) **before the build**. This variable is
   embedded in the public frontend bundle and is not a secret.
8. Deploy the backend first, then the frontend. The backend creates tables only
   for a new/empty database; it does not modify an existing table schema at
   startup. If required columns are missing, it exits with instructions rather
   than altering the database. It never drops tables or deletes student rows.

If the existing Render deployment has student data in its SQLite file, copy it
to PostgreSQL before switching the service to the new `DATABASE_URL`. Make the
SQLite file available to the migration command, and set `DATABASE_URL` in the
current shell or a private, uncommitted `backend/.env` to the PostgreSQL
destination. Never put the connection string in source control. Run this from
the backend directory:

```powershell
$env:LEGACY_SQLITE_URL = "sqlite:///./students.db"
python .\migrate_sqlite_to_postgres.py --backup-confirmed
```

The importer only inserts missing student IDs, leaves identical rows unchanged,
and stops without inserts if an ID already has different data. It never deletes
or overwrites records. The `--backup-confirmed` flag is an explicit operator
acknowledgment: verify both backups before running the command. Verify the
imported record count before retiring the old SQLite file. Local SQLite records
are not automatically transferred by deployment.

For local development against an existing database, back up
`backend\students.db` first, then run from `backend`:

```powershell
python .\migrate_student_schema.py --backup-confirmed
```

Render's current documentation says Free PostgreSQL databases expire 30 days
after creation and become inaccessible unless upgraded to a paid compute plan.
Do not treat a free database as permanent storage. Check the database's plan and
expiration date in the Render dashboard; use a non-expiring paid plan and
independent backups for records that must be retained. This project cannot
inspect the Render account or verify the plan assigned to a particular database.

## API Endpoints

Student create and update requests require:

- `first_name`: 1–100 characters, starts with a capital letter
- `last_name`: 1–100 characters, starts with a capital letter
- `phone`: exactly `+91` followed by 10 digits
- `email`: a valid email address (up to 254 characters)
- `date_of_birth`: a valid date that is not in the future
- `age`: optional whole number from 0 to 150
- `gender`: `Male`, `Female`, or `Other`
- `blood_group`: optional text (up to 20 characters)
- `course`: 1–100 non-blank characters
- `address`: 1–500 non-blank characters

Available endpoints:

- `GET /health`: returns `{"status": "ok"}`
- `GET /students/summary`: returns student, distinct course, and gender totals
- `GET /students/reports`: returns course-wise and gender-wise record counts
- `GET /students?search=&page=1&page_size=10`: search and paginate students;
  `page_size` defaults to 10 and accepts values up to 50
- `POST /students`: create a student
- `GET /students/{id}`: view a student
- `PUT /students/{id}`: update a student
- `DELETE /students/{id}`: delete a student

The same handlers are also available under `/api/health` and `/api/students`
for compatibility with clients using the API-prefixed paths. Student age and
blood group are nullable for older records. The edit endpoint applies only
fields sent in the request, so omitted optional fields are preserved.

The Render frontend must be configured with
`NEXT_PUBLIC_API_URL=https://student-management-system-7zvb.onrender.com`.
The frontend API helper adds the `/api` prefix (unless the configured URL
already ends in `/api`), matching the deployed backend routes.
Read-only GET requests retry transient network failures up to two times and
show a backend/CORS diagnostic if all attempts fail. Write requests are not
retried to avoid duplicate creates or other uncertain mutations.
Deploy the backend before the frontend so the deployed API includes the summary,
reports, and paginated response schemas consumed by the current UI. For local
development, leave `NEXT_PUBLIC_API_URL` unset or set it to
`http://127.0.0.1:8000`. The backend allows the deployed frontend origin in
addition to any origins configured with `CORS_ORIGINS`.

The frontend displays 10 student records per page. Search matches first name,
last name, full name, email, and phone number, and pagination updates against the
filtered results. Older rows retain their original information; absent optional
values, including age and blood group, display as `—`. The backend does not
alter an existing table at startup; use the backup-confirmed schema migration
when required.

## Screenshots

To be added after the application is completed.
