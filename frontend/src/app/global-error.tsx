"use client";

import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="container">
          <section className="card error-page" role="alert">
            <p className="eyebrow">APPLICATION ERROR</p>
            <h1>Student Management is temporarily unavailable</h1>
            <p className="muted">
              An unexpected application error occurred. Try loading the
              application again.
            </p>
            <button
              className="button button-primary"
              type="button"
              onClick={reset}
            >
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
