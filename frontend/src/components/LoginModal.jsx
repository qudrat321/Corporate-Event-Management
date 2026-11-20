// Modal dialog allowing users to sign in before exploring events or managing them.
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { friendlyErrorMessage } from "../api/client.js";
import { useAuth } from "../hooks/useAuth.jsx";
import { useToast } from "../hooks/useToast.jsx";

export default function LoginModal() {
  const { loginModalOpen, closeLoginModal, login, afterLoginPath } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const usernameInputRef = useRef(null);

  useEffect(() => {
    if (loginModalOpen) {
      setErrorMessage("");
      setUsername("");
      setPassword("");
      setShowPassword(false);
      setTimeout(() => {
        usernameInputRef.current?.focus();
      }, 50);
    }
  }, [loginModalOpen]);

  useEffect(() => {
    if (!loginModalOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        closeLoginModal();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [loginModalOpen, closeLoginModal]);

  if (!loginModalOpen) return null;

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      await login({ username, password });
      notify("Welcome back.");
      closeLoginModal();
      const target =
        afterLoginPath && afterLoginPath !== "/" ? afterLoginPath : "/dashboard";
      navigate(target, { replace: true });
    } catch (error) {
      setErrorMessage(friendlyErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={closeLoginModal}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl transition sm:p-8">
        <button
          type="button"
          onClick={closeLoginModal}
          aria-label="Close login dialog"
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-ink focus-visible:outline-brand-600"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
            <LockKeyhole size={20} />
          </span>
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-brand-600">
              Acme Corp
            </span>
            <h2
              id="login-modal-title"
              className="text-xl font-bold tracking-tight text-ink"
            >
              Sign in to continue
            </h2>
          </div>
        </div>

        <p className="mt-3 text-sm leading-6 text-muted">
          Please sign in to access the Acme Corp event dashboard, manage events,
          capacity, and registrations.
        </p>

        {errorMessage && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700"
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Username
            </span>
            <input
              ref={usernameInputRef}
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-ink outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            />
          </label>

          <div>
            <label
              htmlFor="modal-password"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="modal-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-3.5 pr-11 text-sm text-ink outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-400 hover:text-ink"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-900 focus-visible:ring-4 focus-visible:ring-brand-100 disabled:cursor-wait disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>
      </div>
    </div>
  );
}
