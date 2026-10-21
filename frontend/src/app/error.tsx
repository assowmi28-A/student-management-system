"use client";

import { useEffect } from "react";

export default function AppError({
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
    <section className="card error-page" role="alert">
      <p className="eyebrow">SOMETHING WENT WRONG</p>
      <h1>This page couldn&apos;t be loaded</h1>
      <p className="muted">
        An unexpected error occurred. Try again, or return to the dashboard.
      </p>
      <div className="form-actions">
        <button className="button button-primary" type="button" onClick={reset}>
          Try again
        </button>
        <a className="button button-secondary" href="/">
          Go to dashboard
        </a>
      </div>
    </section>
  );
}
