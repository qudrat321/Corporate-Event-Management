// Share signed-in state and the login modal across the app.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";

const AuthContext = createContext(null);
const TOKEN_KEY = "access_token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => window.localStorage.getItem(TOKEN_KEY));
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [afterLoginPath, setAfterLoginPath] = useState("/dashboard");

  useEffect(() => {
    function handleExpiredToken() {
      setToken(null);
      setAfterLoginPath("/dashboard");
      setLoginModalOpen(true);
    }
    window.addEventListener("auth:expired", handleExpiredToken);
    return () => window.removeEventListener("auth:expired", handleExpiredToken);
  }, []);

  async function login(credentials) {
    const result = await api.login(credentials);
    if (!result?.access_token) {
      throw new Error("The login response did not include an access token.");
    }
    window.localStorage.setItem(TOKEN_KEY, result.access_token);
    setToken(result.access_token);
  }

  function logout() {
    window.localStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }

  const openLoginModal = useCallback((redirectPath = "/dashboard") => {
    const target =
      redirectPath && redirectPath !== "/" ? redirectPath : "/dashboard";
    setAfterLoginPath(target);
    setLoginModalOpen(true);
  }, []);

  const closeLoginModal = useCallback(() => {
    setLoginModalOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token || window.localStorage.getItem(TOKEN_KEY)),
      login,
      logout,
      loginModalOpen,
      afterLoginPath,
      openLoginModal,
      closeLoginModal,
    }),
    [token, loginModalOpen, afterLoginPath, openLoginModal, closeLoginModal],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider.");
  return context;
}
