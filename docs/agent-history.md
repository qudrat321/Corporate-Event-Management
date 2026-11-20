# Agent Work and Prompt History

This file is a project log of guided AI help. It is not an automatic chat
recorder. Future agents should follow `AGENTS.md` and add one entry per task.

## How this history is meant to be used

- The agent supports **code readability**, **careful review**, **suggested
  improvements**, and **help with clear, approved changes**.
- The agent must **not** rewrite the project blindly, expand scope without
  asking, or change code unless the prompt clearly allows that specific work.
- Each entry stores the **prompt as entered for the project record** (clear,
  professional wording), a short summary of help given, and the files touched.
- Do not record passwords, tokens, personal information, or other secrets.

## Entry format

1. Date and short title.
2. **Prompt** — the professional prompt recorded for this task.
3. **Work and review notes** — what was reviewed, suggested, or changed with
   permission, plus checks run.
4. **Files changed** — if any.

---

## 2026-11-12 — Project instructions and settings review

### Prompt

> Create a professional, detailed project instruction document in clear,
> simple language. Add plain-language docstrings to my current file. Review the
> code and report any likely mistakes with suggested fixes, but do not change
> executable code without my permission. Also keep a prompt and work history
> that records each task prompt and a short summary. Explain that the Markdown
> history needs an agent or person to update it; it cannot record chats
> automatically on its own.

### Work and review notes

- Added plain-language docstrings to `backend/app/config.py` only.
- Did not change executable code.
- Review suggestions, not applied: `settingsConfigDic` may be a misspelling of
  Pydantic Settings' `SettingsConfigDict`; also, `settings = settings()` may
  call an undefined lowercase name instead of the `Settings` class. Confirm
  against the installed package before changing them.
- Clarified that prompts should be stored in a clear professional form for the
  project record.
- No tests were run.

### Files changed

- `AGENTS.md`
- `docs/agent-history.md`

---

## 2026-11-12 — Improve dashboard UI and usability

### Prompt

> Improve the frontend into a professional, easy-to-use event management
> dashboard. Follow common usability and accessibility practices, preserve the
> previously requested operations, and validate the frontend while the backend
> is still under development.

### Work and review notes

- Improved shared layout, events dashboard, details resilience, date formatting,
  password visibility, reduced-motion support, and a QA checklist.
- Production build passed; dependency audit reported zero vulnerabilities.
- Mocked browser checks covered registration, signed-out actions, validation,
  event creation, and bearer-token attachment.
- Remaining pagination/conflict and live backend QA stayed pending.

### Files changed

- `frontend/src/components/AppLayout.jsx`
- `frontend/src/components/EventCard.jsx`
- `frontend/src/components/LoadingState.jsx`
- `frontend/src/components/Toast.jsx`
- `frontend/src/index.css`
- `frontend/src/pages/EventsPage.jsx`
- `frontend/src/pages/EventDetailsPage.jsx`
- `frontend/src/pages/EventFormPage.jsx`
- `frontend/src/pages/LoginPage.jsx`
- `frontend/src/utils/dates.js`
- `frontend/README.md`
- `docs/agent-history.md`

---

## 2026-11-12 — Build Acme event management frontend

### Prompt

> Build a beginner-friendly, responsive React and Vite frontend in JavaScript
> with Tailwind CSS for the Acme event API. Centralize all API requests and
> token/error handling in `src/api/client.js`. Add login, event search and
> pagination, event details and registrations, protected event management,
> client-side form checks, toast errors, loading and empty states, setup
> instructions, an `.env.example`, and simple comments explaining the project
> files. Keep the structure modular for future pages.

### Work and review notes

- Created the Vite, React, and Tailwind frontend with shared API, auth, toast,
  navigation, and event pages.
- Kept `fetch` calls in `src/api/client.js` only.
- `npm run build` passed; live event loading waited on backend CORS and routes.

### Files changed

- `frontend/` (new React app, configuration, `.env.example`, `.gitignore`, and README)
- `docs/agent-history.md`

---

## 2026-11-12 — Add explanations to db.py

### Prompt

> Add a simple docstring or comment to each applicable line in the currently
> tagged file, `backend/app/db.py`.

### Work and review notes

- Added plain-language comments and docstrings only.
- Did not change executable statements.
- No tests were run.

### Files changed

- `backend/app/db.py` (comments and docstrings only)
- `docs/agent-history.md`

---

## 2026-11-12 — Review main.py

### Prompt

> Review the selected code in `backend/app/main.py` for likely errors and
> explain any findings without changing the source file.

### Work and review notes

- Reported a likely import typo (`asyncalchemy` vs `sqlalchemy`) as a suggestion
  only; no application code was changed.
- No tests were run.

### Files changed

- `docs/agent-history.md`
- `backend/app/config.py` (docstrings only)

---

## 2026-11-12 — Add explanations to config.py

### Prompt

> Add a clear, simple docstring or comment for each applicable item in
> `backend/app/config.py`.

### Work and review notes

- Added simple comments only; did not change executable code.
- No tests were run.

### Files changed

- `backend/app/config.py` (comments only)
- `docs/agent-history.md`

---

## 2026-11-12 — Limit docstring changes to the current file

### Prompt

> When I ask you to add docstrings, make those changes only in the currently
> open or tagged source file unless I explicitly name additional files.

### Work and review notes

- Added this scope rule to `AGENTS.md` for future project tasks.
- No source code was changed.

### Files changed

- `AGENTS.md`
- `docs/agent-history.md`

---

## 2026-11-18 — Connect the frontend and backend

### Prompt

> Carefully trace the frontend and backend contracts, connect the missing API
> functionality, and validate the event-management flows end to end.

### Work and review notes

- Added administrator login, authorization, CORS, and connected event and
  registration flows to the existing frontend API client.
- Backend API integration tests passed; frontend production build passed.

### Files changed

- `README.md`
- `backend/.env.example`
- `backend/app/auth.py`
- `backend/app/config.py`
- `backend/app/main.py`
- `backend/app/models.py`
- `backend/app/schemas.py`
- `backend/app/services.py`
- `backend/create_tables.py`
- `backend/requirements.txt`
- `backend/requirements-test.txt`
- `backend/tests/test_api.py`
- `docs/agent-history.md`
- `frontend/README.md`
- `frontend/src/api/client.js`
- `frontend/src/hooks/useAuth.jsx`
- `frontend/src/pages/EventFormPage.jsx`

---

## 2026-11-18 — Resolve event API connection failure

### Prompt

> Fix the API connection error that appears when I try to create an event.

### Work and review notes

- Corrected local database connection settings (credentials omitted here),
  created missing tables, and verified health, event-list shape, and CORS.
- Server restart was still needed to reload settings.

### Files changed

- `backend/.env` (local and Git-ignored; credentials omitted)
- Configured database tables
- `docs/agent-history.md`

---

## 2026-11-18 — Add public landing page and dashboard flow

### Prompt

> Add a polished public landing page, keep sign-in on its own screen, and send
> administrators to the events dashboard after successful login.

### Work and review notes

- Added the public home page, protected dashboard route, and navigation updates.
- Production frontend build passed; landing page checked in the browser.

### Files changed

- `docs/agent-history.md`
- `frontend/README.md`
- `frontend/src/App.jsx`
- `frontend/src/components/AppLayout.jsx`
- `frontend/src/pages/EventDetailsPage.jsx`
- `frontend/src/pages/EventFormPage.jsx`
- `frontend/src/pages/EventsPage.jsx`
- `frontend/src/pages/HomePage.jsx`
- `frontend/src/pages/LoginPage.jsx`

---

## 2026-11-18 — Add sample events for pagination testing

### Prompt

> Add 15 sample events for testing, show no more than 10 events per page, and
> use pagination to reach the remaining results.

### Work and review notes

- Added a seed script and backend pagination coverage for pages of 10 and 5.
- Documented how to load sample data for local testing.

### Files changed

- `README.md`
- `backend/seed_test_events.py`
- `backend/tests/test_api.py`
- `docs/agent-history.md`
- `frontend/README.md`

---

## 2026-11-20 — Backend event CRUD performance review

### Prompt

> Carefully review why backend event create, update, delete, and view operations
> feel very slow. Analyze the code step by step and suggest performance
> improvements without changing application code unless asked.

### Work and review notes

- Read-only review of the event CRUD path and related database setup.
- Reported likely causes: remote Neon latency, extra DB round trips, a brittle
  DNS workaround, and a full-table in-memory cache.
- Suggestions only; no application code was changed in this step.

### Files changed

- `docs/agent-history.md`

---

## 2026-11-20 — Fix slow event CRUD performance

### Prompt

> Implement the performance fixes from the event CRUD review so create, update,
> delete, and view operations run reliably and faster.

### Work and review notes

- Applied approved performance improvements: safer Neon connection pooling,
  SQL paging instead of a full-table cache, fewer write round trips, cascade
  deletes, an `event_date` index, and email validation without MX DNS checks.
- Backend API tests: 3 passed.
- Ran `create_tables.py` to ensure the date index exists.

### Files changed

- `backend/app/db.py`
- `backend/app/services.py`
- `backend/app/models.py`
- `backend/app/schemas.py`
- `backend/create_tables.py`
- `backend/.env.example`
- `docs/agent-history.md`

---

## 2026-11-20 — Clarify agent history purpose and prompt recording

### Prompt

> Update agent history so each entry stores only the clear professional prompt
> as the project prompt. Rewrite the history so it reflects that the agent is
> used for code readability, careful improvement, and help — not for coding the
> whole project blindly.

### Work and review notes

- Rewrote this history file to use a single **Prompt** section per entry.
- Aligned `AGENTS.md` so future agents record professional prompts and treat
  the agent as a guided helper for review, readability, and approved changes.

### Files changed

- `docs/agent-history.md`
- `AGENTS.md`

---

## 2026-11-20 — Public explore events and registration flow

### Prompt

> Review the frontend and improve the UI and workflow so main-site features such
> as Explore Events open without login. When guests click Explore Events, show
> all events, and let people admit or register themselves without signing in.
> Keep admin create, edit, and delete behind login.

### Work and review notes

- Clarified public vs admin navigation in the workspace layout and landing page.
- Public `/events` now loads up to 100 events and explains that registration
  needs no account; dashboard keeps 10-per-page admin browsing.
- Event details registration copy states guests can admit themselves without
  login; login page links back to public browse.
- Raised backend list `limit` max from 10 to 100.
- Backend API tests passed (3); frontend production build passed.

### Files changed

- `backend/app/main.py`
- `backend/tests/test_api.py`
- `frontend/src/App.jsx`
- `frontend/src/components/AppLayout.jsx`
- `frontend/src/components/EventCard.jsx`
- `frontend/src/pages/EventsPage.jsx`
- `frontend/src/pages/EventDetailsPage.jsx`
- `frontend/src/pages/HomePage.jsx`
- `frontend/src/pages/LoginPage.jsx`
- `docs/agent-history.md`

---

## 2026-11-20 — Require login modal for event exploration and CRUD operations

### Prompt

> Make clicking on "Explore events", "Admin sign in", "Register freely", and "How it works"
> open the login modal when unauthenticated, requiring successful authentication before users
> can explore events and perform CRUD operations on events.

### Work and review notes

- Created accessible `LoginModal.jsx` component mounted globally in `App.jsx`.
- Connected "Explore events", "Admin sign in", "Register freely", and "How it works" cards on `HomePage.jsx` to open the login modal when unauthenticated, and preserve their target destination.
- Updated `AppLayout.jsx` sidebar, header, and mobile navigation to trigger the login modal when guests click explore or sign in links.
- Updated `RequireAuth.jsx` to redirect unauthenticated URL visits back to the home page while immediately opening the login modal with their target route preserved.
- Protected event exploration and event management routes under `RequireAuth`.
- Added a direct "Create event" button on `/events` header for authenticated users so CRUD operations are directly accessible.
- Frontend production build passed cleanly.

### Files changed

- `frontend/src/components/LoginModal.jsx`
- `frontend/src/App.jsx`
- `frontend/src/components/RequireAuth.jsx`
- `frontend/src/pages/HomePage.jsx`
- `frontend/src/components/AppLayout.jsx`
- `frontend/src/pages/EventsPage.jsx`
- `docs/agent-history.md`

---

## 2026-11-20 — Remove redundant explore feature in favor of dashboard

### Prompt

> Remove the redundant explore feature because it duplicates the dashboard.

### Work and review notes

- Removed duplicate explore events routes and navigation, redirecting `/events` to `/dashboard`.
- Consolidated `HomePage.jsx` header, hero, and feature cards to point directly to the dashboard.
- Cleaned up `AppLayout.jsx` sidebar, header, and mobile navigation to remove "Explore events" and "All events".
- Simplified `EventsPage.jsx` into the dedicated Events Dashboard with metric cards, search, filters, pagination, and event CRUD.
- Updated back links in `EventDetailsPage.jsx` and copy in `LoginPage.jsx` and `LoginModal.jsx`.
- Frontend production build passed cleanly with 0 errors.

### Files changed

- `frontend/src/App.jsx`
- `frontend/src/components/AppLayout.jsx`
- `frontend/src/components/LoginModal.jsx`
- `frontend/src/pages/EventsPage.jsx`
- `frontend/src/pages/EventDetailsPage.jsx`
- `frontend/src/pages/HomePage.jsx`
- `frontend/src/pages/LoginPage.jsx`
- `docs/agent-history.md`

---

## 2026-11-20 — Fix dashboard visibility and authentication race condition on login

### Prompt

> Fix issue where the dashboard is not visible after completing a successful login.

### Work and review notes

- Identified race condition in `RequireAuth.jsx` and `useAuth.jsx`: asynchronous React state updates on `token` caused `RequireAuth` to read stale `null` auth state immediately upon navigation to `/dashboard`, prematurely redirecting the user back to the home page.
- Updated `useAuth.jsx` and `RequireAuth.jsx` to verify token existence directly in `localStorage` synchronously.
- Verified `LoginModal.jsx` navigation to `/dashboard` lands smoothly without premature redirection.
- Frontend production build passed cleanly.

### Files changed

- `frontend/src/hooks/useAuth.jsx`
- `frontend/src/components/RequireAuth.jsx`
- `docs/agent-history.md`

---

## 2026-11-20 — Resolve runtime crash and enforce dashboard routing upon successful login

### Prompt

> Fix issue where the dashboard remains not visible after login.

### Work and review notes

- Diagnosed runtime JavaScript `ReferenceError: isDashboard is not defined` in `EventsPage.jsx` (line 188) that caused the dashboard component to crash on mount, preventing the dashboard from rendering.
- Fixed pagination controls in `EventsPage.jsx` to use `PAGE_SIZE` instead of undefined `pageSize`.
- Added automatic redirect in `HomePage.jsx` to `/dashboard` when authenticated (`<Navigate to="/dashboard" replace />`), preventing authenticated users from remaining stranded on the public landing page.
- Sanitized login redirect paths in `LoginModal.jsx`, `LoginPage.jsx`, and `useAuth.jsx` to ensure post-login routing always targets `/dashboard` rather than `"/"`.
- Executed `npm run build` with 0 errors and verified Vite hot module replacement.

### Files changed

- `frontend/src/pages/EventsPage.jsx`
- `frontend/src/pages/HomePage.jsx`
- `frontend/src/components/LoginModal.jsx`
- `frontend/src/pages/LoginPage.jsx`
- `frontend/src/hooks/useAuth.jsx`
- `docs/agent-history.md`

