// Create or update an event with simple checks before saving.
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, friendlyErrorMessage } from "../api/client.js";
import LoadingState from "../components/LoadingState.jsx";
import { useToast } from "../hooks/useToast.jsx";

const emptyForm = {
  title: "",
  description: "",
  event_date: "",
  location: "",
  max_capacity: "1",
};

function eventDateForInput(value) {
  return value ? String(value).slice(0, 10) : "";
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export default function EventFormPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { notify } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEditing);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const fieldRefs = useRef({});

  useEffect(() => {
    if (!isEditing) return undefined;
    let active = true;
    setLoading(true);
    setLoadError(false);
    api
      .getEvent(id)
      .then((event) => {
        if (!active) return;
        setForm({
          title: event.title || "",
          description: event.description || "",
          event_date: eventDateForInput(event.event_date),
          location: event.location || "",
          max_capacity: String(event.max_capacity ?? ""),
        });
      })
      .catch((error) => {
        if (!active) return;
        setLoadError(true);
        notify(friendlyErrorMessage(error), "error");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, isEditing, notify, reloadKey]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  function validate() {
    const nextErrors = {};
    const capacity = Number(form.max_capacity);
    if (!form.title.trim()) nextErrors.title = "Please enter an event title.";
    if (!form.location.trim()) nextErrors.location = "Please enter an event location.";
    if (!Number.isInteger(capacity) || capacity <= 0) {
      nextErrors.max_capacity = "Enter a whole number greater than zero.";
    }
    if (!isValidDate(form.event_date)) {
      nextErrors.event_date = "Choose a valid event date.";
    }
    setErrors(nextErrors);
    const firstInvalidField = Object.keys(nextErrors)[0];
    if (firstInvalidField) fieldRefs.current[firstInvalidField]?.focus();
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;

    const payload = {
      ...form,
      title: form.title.trim(),
      max_capacity: Number(form.max_capacity),
    };
    setSaving(true);
    try {
      const savedEvent = isEditing
        ? await api.updateEvent(id, payload)
        : await api.createEvent(payload);
      notify(isEditing ? "Event updated." : "Event created.");
      navigate(savedEvent?.id ? `/events/${savedEvent.id}` : "/dashboard");
    } catch (error) {
      notify(friendlyErrorMessage(error), "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState label="Loading event details..." />;

  if (loadError) {
    return (
      <section className="mx-auto max-w-2xl rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm sm:p-10">
        <h1 className="text-xl font-semibold text-ink">Event details unavailable</h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          We couldn't load this event, so your changes have not been started.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            className="rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-900"
          >
            Try again
          </button>
          <Link
            to="/dashboard"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-ink hover:bg-slate-50"
          >
            Back to events
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to={isEditing ? `/events/${id}` : "/dashboard"}
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-brand-700"
      >
        <ArrowLeft size={16} />
        {isEditing ? "Back to event" : "All events"}
      </Link>

      <section className="rounded-3xl bg-white p-6 shadow-card sm:p-10">
        <div className="mb-7 flex items-start gap-4">
          <span className="rounded-xl bg-brand-50 p-3 text-brand-700">
            <CalendarDays size={21} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">
              Event details
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-ink">
              {isEditing ? "Edit event" : "Create an event"}
            </h1>
            <p className="mt-2 text-sm text-muted">
              Share the key details so everyone knows what to expect.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
          noValidate
          aria-label={isEditing ? "Edit event details" : "Create event"}
        >
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-ink">Event title *</span>
            <input
              id="event-title"
              ref={(element) => {
                fieldRefs.current.title = element;
              }}
              name="title"
              required
              maxLength={200}
              value={form.title}
              onChange={updateField}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? "event-title-error" : undefined}
              autoComplete="off"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500"
              placeholder="e.g. Summer team gathering"
            />
            {errors.title && (
              <span id="event-title-error" role="alert" className="mt-1 block text-sm text-red-600">
                {errors.title}
              </span>
            )}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-ink">Description</span>
            <textarea
              id="event-description"
              name="description"
              rows={4}
              maxLength={2000}
              value={form.description}
              onChange={updateField}
              aria-describedby="event-description-help"
              className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500"
              placeholder="What should people know about this event?"
            />
            <span id="event-description-help" className="mt-1 block text-xs text-muted">
              Share the key information attendees need.
            </span>
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink">Date *</span>
              <input
                id="event-date"
                ref={(element) => {
                  fieldRefs.current.event_date = element;
                }}
                name="event_date"
                type="date"
                required
                value={form.event_date}
                onChange={updateField}
                aria-invalid={Boolean(errors.event_date)}
                aria-describedby={errors.event_date ? "event-date-error" : undefined}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500"
              />
              {errors.event_date && (
                <span id="event-date-error" role="alert" className="mt-1 block text-sm text-red-600">
                  {errors.event_date}
                </span>
              )}
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-ink">Location *</span>
              <input
                id="event-location"
                ref={(element) => {
                  fieldRefs.current.location = element;
                }}
                name="location"
                required
                maxLength={255}
                value={form.location}
                onChange={updateField}
                aria-invalid={Boolean(errors.location)}
                aria-describedby={errors.location ? "event-location-error" : undefined}
                autoComplete="off"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500"
                placeholder="Office or online"
              />
              {errors.location && (
                <span id="event-location-error" role="alert" className="mt-1 block text-sm text-red-600">
                  {errors.location}
                </span>
              )}
            </label>
          </div>

          <label className="block max-w-xs">
            <span className="mb-2 block text-sm font-medium text-ink">Maximum capacity *</span>
            <input
              id="event-capacity"
              ref={(element) => {
                fieldRefs.current.max_capacity = element;
              }}
              name="max_capacity"
              type="number"
              min="1"
              step="1"
              required
              value={form.max_capacity}
              onChange={updateField}
              aria-invalid={Boolean(errors.max_capacity)}
              aria-describedby={
                errors.max_capacity ? "event-capacity-error" : "event-capacity-help"
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500"
              placeholder="50"
            />
            <span id="event-capacity-help" className="mt-1 block text-xs text-muted">
              Enter a whole number greater than zero.
            </span>
            {errors.max_capacity && (
              <span id="event-capacity-error" role="alert" className="mt-1 block text-sm text-red-600">
                {errors.max_capacity}
              </span>
            )}
          </label>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <Link
              to={isEditing ? `/events/${id}` : "/dashboard"}
              className="rounded-xl border border-slate-200 px-5 py-3 text-center text-sm font-semibold text-ink hover:bg-canvas"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-900 disabled:cursor-wait disabled:opacity-60"
            >
              {saving ? "Saving..." : isEditing ? "Save changes" : "Create event"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
