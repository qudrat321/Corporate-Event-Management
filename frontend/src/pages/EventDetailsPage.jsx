// Show event information, registrations, and event actions.
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Pencil,
  RefreshCw,
  Trash2,
  Users,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, friendlyErrorMessage } from "../api/client.js";
import LoadingState from "../components/LoadingState.jsx";
import { useAuth } from "../hooks/useAuth.jsx";
import { useToast } from "../hooks/useToast.jsx";
import { formatEventDate } from "../utils/dates.js";

function asList(result) {
  if (Array.isArray(result)) return result;
  return result?.items || result?.registrations || result?.results || [];
}

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { notify } = useToast();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [registrationsLoading, setRegistrationsLoading] = useState(true);
  const [registrationsError, setRegistrationsError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [employeeName, setEmployeeName] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState("");

  const loadRegistrations = useCallback(async () => {
    setRegistrationsLoading(true);
    setRegistrationsError(false);
    try {
      const result = await api.listRegistrations(id);
      setRegistrations(asList(result));
    } catch (error) {
      setRegistrations([]);
      setRegistrationsError(true);
      notify(friendlyErrorMessage(error), "error");
    } finally {
      setRegistrationsLoading(false);
    }
  }, [id, notify]);

  const loadDetails = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const eventResult = await api.getEvent(id);
      setEvent(eventResult);
    } catch (error) {
      setLoadError(true);
      notify(friendlyErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  }, [id, notify]);

  useEffect(() => {
    loadDetails();
    loadRegistrations();
  }, [loadDetails, loadRegistrations]);

  async function handleRegister(eventSubmit) {
    eventSubmit.preventDefault();
    setRegistering(true);
    try {
      await api.registerForEvent(id, {
        employee_name: employeeName.trim(),
        employee_email: employeeEmail.trim(),
      });
      notify("You're registered for this event.");
      setEmployeeName("");
      setEmployeeEmail("");
      await loadRegistrations();
    } catch (error) {
      notify(friendlyErrorMessage(error), "error");
    } finally {
      setRegistering(false);
    }
  }

  async function handleCancelRegistration(registrationId) {
    if (!window.confirm("Cancel this registration?")) return;
    setCancellingId(registrationId);
    try {
      await api.cancelRegistration(registrationId);
      notify("Registration cancelled.");
      await loadRegistrations();
    } catch (error) {
      notify(friendlyErrorMessage(error), "error");
    } finally {
      setCancellingId(null);
    }
  }

  async function handleDeleteEvent() {
    if (!window.confirm("Delete this event? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await api.deleteEvent(id);
      notify("Event deleted.");
      navigate("/dashboard");
    } catch (error) {
      notify(friendlyErrorMessage(error), "error");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) return <LoadingState label="Loading event..." />;

  if (loadError || !event) {
    return (
      <div className="rounded-2xl bg-white px-6 py-12 text-center shadow-card">
        <h1 className="text-xl font-semibold text-ink">Event unavailable</h1>
        <p className="mt-2 text-sm text-muted">
          We couldn't load this event. It may have been removed.
        </p>
        <Link to="/dashboard" className="mt-5 inline-flex text-sm font-semibold text-brand-700">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        to="/dashboard"
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-brand-700"
      >
        <ArrowLeft size={16} />
        Dashboard
      </Link>

      <section className="overflow-hidden rounded-3xl bg-white shadow-card">
        <div className="bg-brand-900 px-6 py-8 text-white sm:px-10 sm:py-10">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-2xl">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-100">
                Acme Corp event
              </span>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
                {event.title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/75">
                {event.description || "Join your colleagues for this event."}
              </p>
            </div>
            {isAuthenticated && (
              <div className="flex gap-2">
                <Link
                  to={`/events/${id}/edit`}
                  className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/20"
                >
                  <Pencil size={15} />
                  Edit
                </Link>
                <button
                  onClick={handleDeleteEvent}
                  disabled={deleting}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-400/20 px-3 py-2 text-sm font-semibold text-white hover:bg-red-400/30 disabled:cursor-wait disabled:opacity-60"
                >
                  <Trash2 size={15} />
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            )}
          </div>
          <div className="mt-8 grid gap-4 border-t border-white/15 pt-5 sm:grid-cols-3">
            <p className="flex items-center gap-3 text-sm text-white/85">
              <CalendarDays size={18} className="text-coral" />
              {formatEventDate(event.event_date, {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <p className="flex items-center gap-3 text-sm text-white/85">
              <MapPin size={18} className="text-coral" />
              {event.location || "Location to be announced"}
            </p>
            <p className="flex items-center gap-3 text-sm text-white/85">
              <Users size={18} className="text-coral" />
              Capacity: {event.max_capacity}
            </p>
          </div>
        </div>

        <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_0.85fr]">
          <section>
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
                  Who's coming
                </p>
                <h2 className="mt-1 text-xl font-semibold text-ink">Registrations</h2>
              </div>
              {!registrationsLoading && !registrationsError && (
                <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
                  {registrations.length}
                </span>
              )}
            </div>
            {registrationsLoading ? (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-canvas px-4 py-5 text-sm text-muted">
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-brand-100 border-t-brand-600"
                  aria-hidden="true"
                />
                Loading registrations...
              </div>
            ) : registrationsError ? (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-950">
                  Registrations are temporarily unavailable
                </p>
                <p className="mt-1 text-sm leading-5 text-amber-900">
                  The event details are still available. Try loading the attendee
                  list again.
                </p>
                <button
                  type="button"
                  onClick={loadRegistrations}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-amber-950 shadow-sm hover:bg-amber-100"
                >
                  <RefreshCw size={15} />
                  Retry registrations
                </button>
              </div>
            ) : registrations.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-slate-200 px-5 py-8 text-center text-sm text-muted">
                No registrations yet. Be the first to join.
              </div>
            ) : (
              <ul className="mt-4 divide-y divide-slate-100">
                {registrations.map((registration) => (
                  <li
                    key={registration.id}
                    className="flex items-center justify-between gap-4 py-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">
                        {registration.employee_name}
                      </p>
                      <p className="truncate text-sm text-muted">
                        {registration.employee_email}
                      </p>
                    </div>
                    {isAuthenticated && (
                      <button
                        type="button"
                        onClick={() => handleCancelRegistration(registration.id)}
                        disabled={cancellingId === registration.id}
                        aria-label={`Cancel registration for ${registration.employee_name}`}
                        className="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-wait disabled:opacity-50"
                      >
                        {cancellingId === registration.id ? "Cancelling..." : "Cancel"}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-slate-100 bg-canvas p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
              Save your spot
            </p>
            <h2 className="mt-1 text-xl font-semibold text-ink">
              Register for this event
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Anyone can admit themselves here — no account or admin sign-in
              required. Add your details and we’ll see you there.
            </p>
            {!registrationsLoading &&
              !registrationsError &&
              Number.isFinite(Number(event.max_capacity)) && (
                <p className="mt-3 text-sm font-medium text-brand-800">
                  {Math.max(0, Number(event.max_capacity) - registrations.length)}{" "}
                  spot
                  {Math.max(0, Number(event.max_capacity) - registrations.length) ===
                  1
                    ? ""
                    : "s"}{" "}
                  left
                </p>
              )}
            <form onSubmit={handleRegister} className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">
                  Full name
                </span>
                <input
                  required
                  value={employeeName}
                  onChange={(eventInput) => setEmployeeName(eventInput.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500"
                  placeholder="Your name"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink">
                  Work email
                </span>
                <input
                  required
                  type="email"
                  value={employeeEmail}
                  onChange={(eventInput) => setEmployeeEmail(eventInput.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500"
                  placeholder="you@acme.com"
                />
              </label>
              <button
                type="submit"
                disabled={registering}
                className="w-full rounded-xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-900 disabled:cursor-wait disabled:opacity-60"
              >
                {registering ? "Registering..." : "Confirm registration"}
              </button>
            </form>
          </section>
        </div>
      </section>
    </div>
  );
}
