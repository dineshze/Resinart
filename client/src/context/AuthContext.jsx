import { createContext, useContext, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("resin_token"));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("resin_user");
    return saved ? JSON.parse(saved) : null;
  });

  async function login(payload) {
    const { data } = await api.post("/auth/login", payload);
    localStorage.setItem("resin_token", data.token);
    localStorage.setItem("resin_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    toast.success(`Welcome back, ${data.user.name}`);
    return data.user;
  }

  async function signup(payload) {
    const { data } = await api.post("/auth/signup", payload);
    localStorage.setItem("resin_token", data.token);
    localStorage.setItem("resin_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    toast.success("Your account is ready");
    return data.user;
  }

  function logout() {
    localStorage.removeItem("resin_token");
    localStorage.removeItem("resin_user");
    setToken(null);
    setUser(null);
    toast.success("Signed out");
  }

  const value = useMemo(() => ({ token, user, isAdmin: user?.role === "admin", login, signup, logout }), [token, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
