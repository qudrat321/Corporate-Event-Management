// Share the signed-in user state across pages and navigation.
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client.js";

const AuthContext = createContext(null);
const TOKEN_KEY = "access_token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => window.localStorage.getItem(TOKEN_KEY));

  useEffect(() => {
    function handleExpiredToken() {
      setToken(null);
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

  const value = useMemo(
    () => ({ token, isAuthenticated: Boolean(token), login, logout }),
    [token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider.");
  return context;
}
