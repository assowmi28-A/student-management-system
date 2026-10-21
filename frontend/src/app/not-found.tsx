import Link from "next/link";

export default function NotFound() {
  return (
    <section className="card error-page">
      <p className="eyebrow">PAGE NOT FOUND</p>
      <h1>We couldn&apos;t find that page</h1>
      <p className="muted">
        The page may have moved, or the address may be incorrect.
      </p>
      <div className="form-actions">
        <Link className="button button-primary" href="/">
          Go to dashboard
        </Link>
        <Link className="button button-secondary" href="/students">
          View student records
        </Link>
      </div>
    </section>
  );
}
