import { useState } from "react";
import { API_BASE_URL, APP_URL } from "../config";

const OAUTH2_LOGIN_URL   = `${API_BASE_URL}/oauth2/authorization/google`;
const LOGIN_SUCCESS_PATH = "/login-success";

function getInitialToken() {
  if (window.location.pathname === LOGIN_SUCCESS_PATH) {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      window.history.replaceState({}, "", "/");
      return token;
    }
  }
  return localStorage.getItem("token");
}

export function useAuth() {
  const [token, setToken] = useState(getInitialToken);

  const login = () => {
    const authUrl = new URL(OAUTH2_LOGIN_URL);
    authUrl.searchParams.set("prompt", "select_account");
    window.location.href = authUrl.toString();
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return { token, login, logout };
}