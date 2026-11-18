// Provide short success and error messages to any page.
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import Toast from "../components/Toast.jsx";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const notify = useCallback((message, type = "success") => {
    setToast({ message, type, id: Date.now() });
  }, []);
  const dismiss = useCallback(() => setToast(null), []);
  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast toast={toast} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider.");
  return context;
}
