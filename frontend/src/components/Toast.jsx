// Show a brief message after an action succeeds or fails.
import { useEffect } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

export default function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(onDismiss, 5000);
    return () => window.clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const isError = toast.type === "error";
  const Icon = isError ? AlertCircle : CheckCircle2;

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 z-50 mx-auto flex max-w-sm items-start gap-3 rounded-xl border bg-white p-4 shadow-card sm:bottom-5 sm:left-auto sm:right-5 ${
        isError ? "border-red-100" : "border-brand-100"
      }`}
      role={isError ? "alert" : "status"}
    >
      <Icon
        className={`mt-0.5 h-5 w-5 shrink-0 ${
          isError ? "text-red-500" : "text-brand-600"
        }`}
      />
      <p className="flex-1 text-sm leading-6 text-ink">{toast.message}</p>
      <button
        type="button"
        className="rounded p-1 text-muted hover:bg-canvas"
        onClick={onDismiss}
        aria-label="Dismiss message"
      >
        <X size={16} />
      </button>
    </div>
  );
}
