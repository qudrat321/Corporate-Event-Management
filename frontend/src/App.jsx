// Set up page routes and the shared authentication and toast providers.
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout.jsx";
import RequireAuth from "./components/RequireAuth.jsx";
import { AuthProvider } from "./hooks/useAuth.jsx";
import { ToastProvider } from "./hooks/useToast.jsx";
import EventDetailsPage from "./pages/EventDetailsPage.jsx";
import EventFormPage from "./pages/EventFormPage.jsx";
import EventsPage from "./pages/EventsPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";

function NotFoundPage() {
  return (
    <div className="rounded-2xl bg-white px-6 py-12 text-center shadow-card">
      <p className="text-sm font-semibold text-brand-600">404</p>
      <h1 className="mt-2 text-xl font-semibold text-ink">Page not found</h1>
      <p className="mt-2 text-sm text-muted">The page you requested doesn't exist.</p>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route element={<AppLayout />}>
              <Route path="events" element={<EventsPage />} />
              <Route path="events/:id" element={<EventDetailsPage />} />
              <Route element={<RequireAuth />}>
                <Route path="dashboard" element={<EventsPage />} />
                <Route path="events/new" element={<EventFormPage />} />
                <Route path="events/:id/edit" element={<EventFormPage />} />
              </Route>
              <Route path="not-found" element={<NotFoundPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/not-found" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
