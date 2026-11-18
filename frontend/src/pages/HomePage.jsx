// Welcome visitors and direct them to public events or the administrator dashboard.
import {
  ArrowRight,
  CalendarDays,
  Check,
  Compass,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

const features = [
  {
    icon: CalendarDays,
    title: "Plan with confidence",
    description:
      "Keep event dates, places, and capacity clear so everyone knows what to expect.",
  },
  {
    icon: Users,
    title: "Make room for everyone",
    description:
      "Let teammates discover events and reserve a place in just a few steps.",
  },
  {
    icon: Compass,
    title: "Keep it all together",
    description:
      "Manage event details and attendee registrations from one simple workspace.",
  },
];

const planningSteps = [
  "Choose the details",
  "Share with your team",
  "Bring everyone together",
];

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const dashboardPath = isAuthenticated ? "/dashboard" : "/login";
  const dashboardLabel = isAuthenticated ? "Open dashboard" : "Admin sign in";

  return (
    <div className="min-h-screen overflow-hidden bg-white text-ink">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-ink focus:fixed focus:left-4 focus:top-4 focus:not-sr-only"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-5 px-5 sm:px-8">
          <Link to="/" className="flex shrink-0 items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-700 text-white shadow-sm">
              <CalendarDays size={21} />
            </span>
            <span>
              <span className="block text-sm font-bold tracking-tight text-ink">
                Acme Corp
              </span>
              <span className="block text-xs text-muted">Event management</span>
            </span>
          </Link>

          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex"
          >
            <Link to="/events" className="transition hover:text-brand-700">
              Explore events
            </Link>
            <a href="#how-it-works" className="transition hover:text-brand-700">
              How it works
            </a>
          </nav>

          <Link
            to={dashboardPath}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-900 focus-visible:ring-4 focus-visible:ring-brand-100"
          >
            {dashboardLabel}
            <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      <main id="main-content">
        <section className="relative isolate overflow-hidden bg-canvas">
          <div
            aria-hidden="true"
            className="absolute -right-36 -top-40 -z-10 h-[34rem] w-[34rem] rounded-full bg-brand-100/70 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-48 -left-32 -z-10 h-[28rem] w-[28rem] rounded-full bg-orange-100/60 blur-3xl"
          />
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-24">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white/80 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.13em] text-brand-700 shadow-sm">
                <Sparkles size={14} />
                Better moments, made together
              </div>
              <h1 className="mt-7 text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-6xl">
                Make room for{" "}
                <span className="text-brand-600">great moments</span> at work.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                From a team get-together to a company-wide celebration, bring
                the details and the people together in one welcoming place.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/events"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand-700 px-5 text-sm font-semibold text-white shadow-md shadow-brand-900/10 transition hover:-translate-y-0.5 hover:bg-brand-900 focus-visible:ring-4 focus-visible:ring-brand-100"
                >
                  Explore events
                  <ArrowRight size={17} />
                </Link>
                <Link
                  to={dashboardPath}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-ink transition hover:border-brand-200 hover:bg-brand-50 focus-visible:ring-4 focus-visible:ring-brand-100"
                >
                  {dashboardLabel}
                </Link>
              </div>
              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <Check size={16} className="text-brand-600" />
                  Simple event details
                </span>
                <span className="inline-flex items-center gap-2">
                  <Check size={16} className="text-brand-600" />
                  Easy team registration
                </span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl">
              <div
                aria-hidden="true"
                className="absolute -left-5 top-16 h-24 w-24 rounded-[2rem] bg-coral/25 rotate-12"
              />
              <div
                aria-hidden="true"
                className="absolute -bottom-5 -right-3 h-28 w-28 rounded-full border-[18px] border-brand-100/80"
              />
              <div className="relative rounded-[2rem] bg-brand-900 p-4 shadow-[0_30px_90px_-35px_rgba(29,61,60,0.65)] sm:p-6">
                <div className="flex items-center justify-between px-2 pb-5 text-white">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-coral" />
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
                      The team workspace
                    </span>
                  </div>
                  <span className="rounded-full border border-white/15 px-3 py-1 text-[11px] text-white/70">
                    Acme Corp
                  </span>
                </div>

                <div className="rounded-[1.5rem] bg-white p-5 shadow-xl sm:p-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">
                    Good things start with a plan
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                    A little planning goes a long way.
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-muted">
                    Set the details, open registration, and get ready to bring
                    your people together.
                  </p>

                  <div className="mt-6 space-y-3">
                    {planningSteps.map((step, index) => (
                      <div
                        key={step}
                        className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-sm font-bold text-brand-700">
                          0{index + 1}
                        </span>
                        <span className="flex-1 text-sm font-semibold text-slate-700">
                          {step}
                        </span>
                        <Check size={17} className="text-brand-600" />
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                    <span className="flex items-center gap-2 text-xs font-medium text-slate-500">
                      <MapPin size={14} className="text-coral" />
                      All the details, in one place
                    </span>
                    <span className="flex -space-x-2" aria-label="A team coming together">
                      <span className="h-8 w-8 rounded-full border-2 border-white bg-brand-100" />
                      <span className="h-8 w-8 rounded-full border-2 border-white bg-orange-100" />
                      <span className="h-8 w-8 rounded-full border-2 border-white bg-sky-100" />
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-brand-700 text-white">
                        <Users size={14} />
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:py-24"
        >
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">
              Thoughtfully simple
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Everything your team needs to get together.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-500">
              Spend less time coordinating and more time looking forward to it.
            </p>
          </div>

          <div className="mt-11 grid gap-4 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description }, index) => (
              <article
                key={title}
                className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-card sm:p-7"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                  <Icon size={21} />
                </span>
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.13em] text-slate-400">
                  0{index + 1}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="px-5 pb-16 sm:px-8 sm:pb-20">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-brand-900 px-6 py-10 text-white sm:px-10 sm:py-14 lg:px-16">
            <div
              aria-hidden="true"
              className="absolute -right-16 -top-32 h-72 w-72 rounded-full border-[36px] border-white/5"
            />
            <div className="relative flex flex-col items-start justify-between gap-7 md:flex-row md:items-center">
              <div className="max-w-2xl">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-100">
                  <Sparkles size={15} />
                  Your next great moment starts here
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Ready to bring everyone together?
                </h2>
                <p className="mt-3 text-sm leading-6 text-white/70">
                  Explore what’s coming up or sign in to start planning.
                </p>
              </div>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Link
                  to="/events"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-brand-900 transition hover:bg-brand-50"
                >
                  Browse events
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to={dashboardPath}
                  className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/25 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {dashboardLabel}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>Acme Corp Event Management</span>
          <span>Plan together. Make it memorable.</span>
        </div>
      </footer>
    </div>
  );
}
