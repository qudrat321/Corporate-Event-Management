// Present one event as a linkable card.
import { ArrowUpRight, CalendarDays, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { formatEventDate } from "../utils/dates.js";

export default function EventCard({ event, showRegisterHint = false }) {
  return (
    <Link
      to={`/events/${event.id}`}
      className="group flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-100"
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
          Company event
        </span>
        <ArrowUpRight
          size={18}
          className="shrink-0 text-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-600"
        />
      </div>
      <h2 className="mb-2 text-xl font-semibold tracking-tight text-ink">
        {event.title}
      </h2>
      <p className="mb-6 line-clamp-2 min-h-12 text-sm leading-6 text-muted">
        {event.description || "Join your colleagues for this upcoming event."}
      </p>
      <div className="mt-auto space-y-3 border-t border-slate-100 pt-4 text-sm text-muted">
        <p className="flex items-center gap-2">
          <CalendarDays size={16} className="text-brand-600" />
          {formatEventDate(event.event_date, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        <p className="flex items-center gap-2">
          <MapPin size={16} className="text-brand-600" />
          {event.location || "Location to be announced"}
        </p>
        <p className="flex items-center gap-2">
          <Users size={16} className="text-brand-600" />
          Capacity: {event.max_capacity}
        </p>
        {showRegisterHint && (
          <p className="pt-1 text-sm font-semibold text-brand-700 transition group-hover:text-brand-900">
            View details & register →
          </p>
        )}
      </div>
    </Link>
  );
}
