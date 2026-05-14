import { useEffect, useRef, useState } from "react";
import { JWT_KEY, REDIRECT_DELAY_MS } from "./config";


export default function LoginSuccess() {
  const [done, setDone]   = useState(false);
  const didRun            = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) return;

    localStorage.setItem(JWT_KEY, token);
    setDone(true);
    window.close();

    setTimeout(() => {
      if (!window.closed) window.location.replace("/");
    }, REDIRECT_DELAY_MS);
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "3rem", fontFamily: "sans-serif" }}>
      <p>Logger inn...</p>
      {done && <p><a href="/">Klikk her for å gå tilbake</a></p>}
    </div>
  );
}