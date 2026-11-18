# Acme Corp Event Management

A React/Vite event dashboard connected to an async FastAPI and PostgreSQL API.
The API provides event search and pagination, event management, administrator
sign-in, and attendee registrations.

## Set up the backend

Open PowerShell in `backend` and run:

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

If `.env` already exists, keep it and add only the missing settings from
`.env.example`. Edit `backend/.env` with your PostgreSQL `database_url`, a unique
`ADMIN_USERNAME`, a strong `ADMIN_PASSWORD` of at least 12 characters, and a
random `JWT_SECRET_KEY` of at least 32 characters. Generate a signing key with:

```powershell
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Install dependencies, create or update the database tables, and run the API:

```powershell
python -m pip install -r requirements.txt
python create_tables.py
python -m uvicorn app.main:app --reload
```

The backend reads `.env` from the `backend` folder. Keep it private. The table
setup script also renames the legacy event `name` column to `title` if needed.
To load 15 repeatable sample events for pagination testing, stop the API and
run `python seed_test_events.py` from `backend`; the script skips samples that
are already present.

## Set up the frontend

In another PowerShell window, open `frontend` and run:

```powershell
npm install
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
npm run dev
```

Open the Vite address printed in the terminal, usually
`http://localhost:5173`. The frontend API address is set by
`VITE_API_URL` in `frontend/.env`; the default is `http://127.0.0.1:8000`.
The backend allows both default Vite origins. For another frontend address,
add it to `CORS_ORIGINS` in `backend/.env` as a JSON list.

## Check the connection

- Open `http://127.0.0.1:8000/` for API links.
- Open `http://127.0.0.1:8000/docs` to explore and try the API.
- Open `http://127.0.0.1:8000/health` to check the database connection.
- Sign in to the dashboard with `ADMIN_USERNAME` and `ADMIN_PASSWORD`.

Run backend integration tests from `backend` with
`python -m pip install -r requirements-test.txt` and
`python -m unittest discover -s tests`. Build the frontend from `frontend` with
`npm run build`.

See [frontend/README.md](frontend/README.md) for the UI features and file map.