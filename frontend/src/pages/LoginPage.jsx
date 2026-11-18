// Sign in and save the API token for later requests.
import { useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole } from "lucide-react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { friendlyErrorMessage } from "../api/client.js";
import { useAuth } from "../hooks/useAuth.jsx";
import { useToast } from "../hooks/useToast.jsx";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      await login({ username, password });
      notify("Welcome back.");
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (error) {
      notify(friendlyErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  }

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="mx-auto grid max-w-4xl overflow-hidden rounded-3xl bg-white shadow-card md:grid-cols-2">
      <div className="hidden flex-col justify-between bg-brand-900 p-10 text-white md:flex">
        <div>
          <span className="inline-flex rounded-xl bg-white/10 p-3">
            <LockKeyhole size={22} />
          </span>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-brand-100">
            Acme Corp
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight">
            Good things happen when we get together.
          </h1>
          <p className="mt-4 text-sm leading-6 text-white/70">
            Sign in to create events and manage the moments that bring your team
            closer.
          </p>
        </div>
        <p className="text-xs text-white/50">Event management, made simple.</p>
      </div>

      <div className="p-6 sm:p-10">
        <div className="mb-8 md:hidden">
          <span className="inline-flex rounded-xl bg-brand-50 p-3 text-brand-700">
            <LockKeyhole size={22} />
          </span>
        </div>
        <p className="text-sm font-semibold text-brand-600">ADMIN ACCESS</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
          Welcome back
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Enter your details to manage Acme Corp events.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-ink">Username</span>
            <input
              autoComplete="username"
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500"
              placeholder="Your username"
            />
          </label>
          <div>
            <label
              htmlFor="login-password"
              className="mb-2 block text-sm font-medium text-ink"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 text-sm outline-none focus:border-brand-500"
                placeholder="Your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                aria-controls="login-password"
                className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center rounded-r-xl text-slate-500 hover:text-ink"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-900 disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
}
