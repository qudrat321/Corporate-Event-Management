// Prompt sign-in via login modal and redirect unauthenticated visits to home page.
import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

export default function RequireAuth() {
  const { isAuthenticated, openLoginModal } = useAuth();
  const location = useLocation();
  const isAuthed = Boolean(isAuthenticated || window.localStorage.getItem("access_token"));

  useEffect(() => {
    if (!isAuthed) {
      openLoginModal(location.pathname + location.search);
    }
  }, [isAuthed, location, openLoginModal]);

  if (!isAuthed) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
