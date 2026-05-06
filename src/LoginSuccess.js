import { useEffect } from "react";

export default function LoginSuccess() {

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("jwt", token);
      window.location.href = "/";
    }
  }, []);

  return <div>Logging in...</div>;
}