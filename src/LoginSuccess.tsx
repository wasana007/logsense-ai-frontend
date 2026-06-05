import { useEffect, useRef } from 'react';
import { JWT_KEY } from './config';

export default function LoginSuccess() {
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const token = new URLSearchParams(window.location.search).get('token');

    if (!token) {
      window.location.replace('/');
      return;
    }

    localStorage.setItem(JWT_KEY, token);
    window.location.replace('/');
  }, []);

  return (
    <div
      style={{
        textAlign: 'center',
        marginTop: '3rem',
        fontFamily: 'sans-serif',
      }}
    >
      <p>Logger inn...</p>
      <p>
        <a href="/">Klikk her for å gå tilbake</a>
      </p>
    </div>
  );
}
