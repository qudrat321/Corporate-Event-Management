// Keep dashboard navigation, account actions, and page layout in one place.
import { useEffect, useState } from "react";
import {
  CalendarDays,
  LogIn,
  LogOut,
  Menu,
  Plus,
  X,
} from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import { useToast } from "../hooks/useToast.jsx";

function WorkspaceLink({ isAuthenticated, onNavigate }) {
  return (
    <NavLink
      to={isAuthenticated ? "/dashboard" : "/events"}
      end
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
          isActive
            ? "bg-brand-50 text-brand-700"
            : "text-slate-600 hover:bg-slate-50 hover:text-ink"
        }`
      }
    >
      <CalendarDays size={18} />
      Events
    </NavLink>
  );
}

export default function AppLayout() {
  const { isAuthenticated, logout } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return undefined;
    function closeOnEscape(event) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    notify("You have been signed out.");
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-canvas">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-ink focus:fixed focus:left-4 focus:top-4 focus:not-sr-only"
      >
        Skip to main content
      </a>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white px-5 py-6 lg:flex">
        <Link
          to={isAuthenticated ? "/dashboard" : "/"}
          className="flex items-center gap-3 px-2"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-700 text-white">
            <CalendarDays size={21} />
          </span>
          <span>
            <span className="block text-sm font-bold tracking-tight text-ink">
              Acme Corp
            </span>
            <span className="block text-xs text-muted">Event management</span>
          </span>
        </Link>

        <div className="mb-3 mt-10 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Workspace
        </div>
        <nav aria-label="Workspace navigation">
          <WorkspaceLink isAuthenticated={isAuthenticated} />
        </nav>

        <div className="mt-auto rounded-2xl bg-brand-50 p-4">
          <p className="text-sm font-semibold text-brand-900">Make it a good one.</p>
          <p className="mt-1 text-xs leading-5 text-brand-700">
            Plan events that bring your people together.
          </p>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur">
          <div className="mx-auto flex min-h-[72px] max-w-[1600px] items-center justify-between gap-4 px-4 sm:px-7 lg:px-9">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-label={menuOpen ? "Close navigation" : "Open navigation"}
                aria-expanded={menuOpen}
                aria-controls="mobile-workspace-navigation"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 lg:hidden"
              >
                {menuOpen ? <X size={19} /> : <Menu size={19} />}
              </button>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Acme Corp <span className="px-1 text-slate-300">/</span> Workspace
                </p>
                <p className="truncate text-sm font-semibold text-ink sm:text-base">
                  Event management
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/events/new"
                    aria-label="Create event"
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-700 px-3 text-sm font-semibold text-white transition hover:bg-brand-900 focus-visible:outline-white"
                  >
                    <Plus size={17} />
                    <span className="hidden sm:inline">Create event</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-ink"
                  >
                    <LogOut size={17} />
                    <span className="hidden sm:inline">Log out</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-700 px-3 text-sm font-semibold text-white transition hover:bg-brand-900"
                >
                  <LogIn size={17} />
                  Sign in
                </Link>
              )}
            </div>
          </div>

          {menuOpen && (
            <nav
              id="mobile-workspace-navigation"
              aria-label="Mobile workspace navigation"
              hidden={!menuOpen}
              className="border-t border-slate-100 bg-white px-4 py-3 lg:hidden"
            >
              <WorkspaceLink
                isAuthenticated={isAuthenticated}
                onNavigate={() => setMenuOpen(false)}
              />
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  <LogOut size={18} />
                  Log out
                </button>
              )}
            </nav>
          )}
        </header>

        <main
          id="main-content"
          className="mx-auto min-h-[calc(100vh-145px)] max-w-[1600px] px-4 py-7 sm:px-7 sm:py-9 lg:px-9"
        >
          <Outlet />
        </main>

        <footer className="border-t border-slate-200 bg-white px-4 py-4 sm:px-7 lg:px-9">
          <div className="mx-auto flex max-w-[1600px] flex-col gap-1 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
            <span>Acme Corp Event Management</span>
            <span>Plan together. Make it memorable.</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
