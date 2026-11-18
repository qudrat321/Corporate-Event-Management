// Give a clear loading message while the API is working.
export default function LoadingState({ label = "Loading..." }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-48 items-center justify-center gap-3 text-sm text-muted"
    >
      <span
        className="h-5 w-5 animate-spin rounded-full border-2 border-brand-100 border-t-brand-600"
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  );
}
