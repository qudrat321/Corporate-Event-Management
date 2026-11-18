# Acme Corp Event Management — Frontend

A small React app for the Acme Corp Event Management API. It uses Vite for
local development and Tailwind CSS for styling. The code is JavaScript, not
TypeScript.

Use Node.js 20.19 or newer.

## Run it locally

Open PowerShell in the `frontend` folder and run:

```powershell
npm install
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
npm run dev
```

Open the local address printed by Vite, usually `http://localhost:5173`.

The `.env` file points the app to the API:

```env
VITE_API_URL=http://127.0.0.1:8000
```

Start the FastAPI backend separately and configure its database and
administrator credentials as described in the project [README](../README.md).
The backend allows the default Vite addresses through CORS. Keep local `.env`
files private; `.env.example` is the safe template to share.

## Main screens

- `/` is the public welcome page, with links to event browsing and sign-in.
- `/login` is the administrator sign-in page.
- `/events` is the public event list.
- `/dashboard` is the signed-in events dashboard. Event creation and editing
  also require sign-in.
- Event lists show 10 items per page; use the pagination controls to view
  additional results.

## QA checklist

- Check the events page with a successful API response, an empty response, and
  an unavailable API.
- Try title and date filters, clear them, and move between result pages.
- Sign in with valid and invalid credentials; confirm protected routes redirect
  signed-out visitors to sign in.
- Submit an event with a missing title, invalid date, or non-positive capacity,
  then submit valid data.
- Try event registration, duplicate registration, full capacity, and
  cancellation.
- Use the main flows with keyboard-only navigation and at narrow mobile width.
- Check that loading, error, and empty states are understandable and usable.

## Useful commands

```powershell
npm run dev
npm run build
npm run preview
```

## Project map

| File or folder | What it does |
| --- | --- |
| `index.html` | Browser page that loads the React app. |
| `vite.config.js` | Turns on React support in Vite. |
| `tailwind.config.js` | Sets the Tailwind colors and source files. |
| `postcss.config.js` | Runs Tailwind while styles are built. |
| `.env.example` | Example API address; copy it to `.env`. |
| `src/main.jsx` | Starts React and loads the shared CSS. |
| `src/App.jsx` | Connects pages to their URLs and shared providers. |
| `src/index.css` | Loads Tailwind and adds basic page styles. |
| `src/api/client.js` | The only file that sends API requests; adds the saved token and explains API errors. |
| `src/hooks/useAuth.jsx` | Saves login state and the access token. |
| `src/hooks/useToast.jsx` | Lets pages show short success or error messages. |
| `src/components/` | Shared navigation, cards, loading display, and toast UI. |
| `src/pages/` | Public home, event list and details, login, and create/edit screens. |
| `src/utils/dates.js` | Formats event dates consistently without timezone shifts. |

## API expectations

The frontend and backend share these contracts:

- `POST /auth/login` accepts `username` and `password`, and returns
  `access_token` and `token_type`.
- `GET /events` accepts `skip`, `limit`, `title`, and `date`; it returns
  `items` and the total matching count.
- Event create, update, and delete require the bearer token. Event reads are
  public.
- Event registrations can be listed and created publicly. Duplicate or
  over-capacity registrations return `409`; cancelling one requires the bearer
  token.

The shared API client adds the token to authenticated requests and displays
backend validation and error messages.
