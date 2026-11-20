// Search, filter, and browse events. Guests explore publicly; admins manage.
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Plus,
  Search,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { api, friendlyErrorMessage } from "../api/client.js";
import EventCard from "../components/EventCard.jsx";
import LoadingState from "../components/LoadingState.jsx";
import { useAuth } from "../hooks/useAuth.jsx";
import { useToast } from "../hooks/useToast.jsx";

const PAGE_SIZE = 10;

function getEvents(result) {
  if (Array.isArray(result)) return result;
  return result?.items || result?.events || result?.results || [];
}

function MetricCard({ label, value, note, icon: Icon }) {
  return (
    <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-ink">
            {value}
          </p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          <Icon size={19} />
        </span>
      </div>
      <p className="mt-3 text-xs leading-5 text-muted">{note}</p>
    </article>
  );
}

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [filters, setFilters] = useState({ title: "", date: "" });
  const [searchText, setSearchText] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const { isAuthenticated } = useAuth();
  const { notify } = useToast();

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(false);

    api
      .listEvents({ skip, limit: PAGE_SIZE, ...filters })
      .then((result) => {
        if (!active) return;
        setEvents(getEvents(result));
        setTotal(typeof result?.total === "number" ? result.total : null);
      })
      .catch((error) => {
        if (!active) return;
        setEvents([]);
        setLoadError(true);
        notify(friendlyErrorMessage(error), "error");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [skip, filters, reloadKey, notify]);

  function submitSearch(event) {
    event.preventDefault();
    setSkip(0);
    setFilters({ title: searchText.trim(), date: searchDate });
  }

  function clearFilters() {
    setSearchText("");
    setSearchDate("");
    setFilters({ title: "", date: "" });
    setSkip(0);
  }

  const hasFilters = Boolean(filters.title || filters.date);
  const capacityOnPage = useMemo(
    () =>
      events.reduce((sum, event) => {
        const capacity = Number(event.max_capacity);
        return sum + (Number.isFinite(capacity) ? capacity : 0);
      }, 0),
    [events],
  );
  const pageNumber = Math.floor(skip / PAGE_SIZE) + 1;
  const canGoNext =
    total === null ? events.length === PAGE_SIZE : skip + events.length < total;

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
            <CalendarDays size={15} />
            Your workspace
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Events dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Find upcoming events, keep an eye on capacity, and manage the details in one place.
          </p>
        </div>
        {isAuthenticated && (
          <Link
            to="/events/new"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-900 focus-visible:ring-4 focus-visible:ring-brand-100"
          >
            <Plus size={16} />
            Create event
          </Link>
        )}
      </section>

      <section
        aria-label="Event summary"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        <MetricCard
          label={total === null ? "Events in view" : "Matching events"}
          value={
            loading || loadError
              ? "—"
              : (total ?? events.length).toLocaleString()
          }
          note={
            loadError
              ? "Unavailable until the API responds"
              : total === null
                ? "Events currently shown on this page"
                : "Events matching your current filters"
          }
          icon={CalendarDays}
        />
        <MetricCard
          label="Capacity on this page"
          value={loading || loadError ? "—" : capacityOnPage.toLocaleString()}
          note={
            loadError
              ? "Unavailable until the API responds"
              : "Combined capacity for the events currently shown"
          }
          icon={Users}
        />
        <MetricCard
          label="Current page"
          value={loading || loadError ? "—" : pageNumber.toLocaleString()}
          note={
            loadError
              ? "Unavailable until the API responds"
              : `${events.length} event${events.length === 1 ? "" : "s"} shown on this page`
          }
          icon={SlidersHorizontal}
        />
      </section>

      <section aria-labelledby="event-list-heading">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2
              id="event-list-heading"
              className="text-xl font-semibold tracking-tight text-ink"
            >
              Browse events
            </h2>
            <p className="mt-1 text-sm text-muted">
              Search by name or narrow the list to a date.
            </p>
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
            >
              <X size={15} />
              Clear filters
            </button>
          )}
        </div>

        <form
          onSubmit={submitSearch}
          className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
            <SlidersHorizontal size={16} className="text-brand-600" />
            Search and filters
          </div>
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_230px_auto]">
            <label className="relative block">
              <span className="sr-only">Search events by title</span>
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                placeholder="Search events by title"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-ink outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              />
            </label>
            <label>
              <span className="sr-only">Filter events by date</span>
              <input
                type="date"
                value={searchDate}
                onChange={(event) => setSearchDate(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-ink outline-none transition hover:border-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              />
            </label>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 text-sm font-semibold text-white transition hover:bg-brand-900 focus-visible:ring-4 focus-visible:ring-brand-100"
            >
              <Search size={16} />
              Apply filters
            </button>
          </div>
        </form>

        <div
          aria-live="polite"
          className="mb-4 flex min-h-6 items-center justify-between gap-3 text-sm text-muted"
        >
          <p>
            {loading
              ? "Loading events…"
              : loadError
                ? "Event results are unavailable"
                : total !== null
                  ? `${total.toLocaleString()} matching event${total === 1 ? "" : "s"}`
                  : `${events.length} event${events.length === 1 ? "" : "s"} loaded`}
          </p>
          <span className="hidden items-center gap-1.5 sm:inline-flex">
            <CircleHelp size={14} />
            Select an event to view details and manage
          </span>
        </div>

        {loading ? (
          <LoadingState label="Loading your events..." />
        ) : loadError ? (
          <div className="rounded-2xl border border-red-100 bg-white px-6 py-12 text-center shadow-sm">
            <h3 className="font-semibold text-ink">
              Events are temporarily unavailable
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
              Check your connection and try again. Your search filters will stay
              in place.
            </p>
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="mt-5 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-900"
            >
              Retry
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center shadow-sm">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
              <CalendarDays size={22} />
            </span>
            <h3 className="mt-4 font-semibold text-ink">
              {hasFilters ? "No events match these filters" : "No events yet"}
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
              {hasFilters
                ? "Try a different title or date, or clear your filters to see all events."
                : "When events are added, they will appear here for everyone to explore."}
            </p>
            {hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-ink hover:bg-slate-50"
              >
                Clear filters
              </button>
            ) : (
              isAuthenticated && (
                <Link
                  to="/events/new"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-900"
                >
                  Create the first event
                </Link>
              )
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {!loading && !loadError && events.length > 0 && (skip > 0 || canGoNext) && (
          <nav
            aria-label="Event list pages"
            className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-sm text-muted">
              Showing {skip + 1}–{skip + events.length}
              {total !== null ? ` of ${total.toLocaleString()}` : ""}
            </p>
            <div className="flex justify-between gap-2 sm:justify-end">
              <button
                type="button"
                onClick={() => setSkip(Math.max(0, skip - PAGE_SIZE))}
                disabled={skip === 0}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-ink transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              <button
                type="button"
                onClick={() => setSkip(skip + PAGE_SIZE)}
                disabled={!canGoNext}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-ink transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </nav>
        )}
      </section>
    </div>
  );
}
