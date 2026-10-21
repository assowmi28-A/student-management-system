"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import StudentRecords from "@/components/StudentRecords";
import { apiFetch, type StudentSummary } from "@/lib/api";

const summaryCards = [
  { key: "total_students", label: "Total Students", tone: "blue", glyph: "students" },
  { key: "total_courses", label: "Courses", tone: "violet", glyph: "courses" },
  { key: "male_students", label: "Male Students", tone: "cyan", glyph: "male" },
  { key: "female_students", label: "Female Students", tone: "rose", glyph: "female" },
] as const;

export default function HomePage() {
  const [summary, setSummary] = useState<StudentSummary | null>(null);
  const [error, setError] = useState("");

  const loadSummary = useCallback(() => {
    setError("");
    apiFetch<StudentSummary>("/students/summary")
      .then(setSummary)
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : "Could not load dashboard totals.");
      });
  }, []);

  useEffect(() => {
    loadSummary();
    window.addEventListener("students-changed", loadSummary);
    return () => window.removeEventListener("students-changed", loadSummary);
  }, [loadSummary]);

  return (
    <div className="page-stack dashboard-page">
      <section className="page-heading dashboard-heading">
        <div>
          <p className="eyebrow">OVERVIEW</p>
          <h1>Dashboard</h1>
          <p className="muted">Here&apos;s what&apos;s happening with your students today.</p>
        </div>
        <Link className="button button-primary" href="/students/new">
          <span aria-hidden="true">+</span> Add Student
        </Link>
      </section>

      <section className="dashboard-grid" aria-label="Student statistics">
        {summaryCards.map((card) => (
          <article className="card stat-card" key={card.key}>
            <span className={`stat-icon stat-icon-${card.tone}`} aria-hidden="true">
              {card.glyph === "students" ? (
                <svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2" /><path d="M3.5 20v-1.5a5.5 5.5 0 0 1 11 0V20M16 5.3a3.2 3.2 0 0 1 0 6.1m1.2 3.1a5.5 5.5 0 0 1 3.3 5V20" /></svg>
              ) : card.glyph === "courses" ? (
                <svg viewBox="0 0 24 24"><path d="m3 8 9-4 9 4-9 4-9-4Z" /><path d="M6 10v5c3.7 3 8.3 3 12 0v-5m3-2v6" /></svg>
              ) : card.glyph === "male" ? (
                <svg viewBox="0 0 24 24"><circle cx="10" cy="14" r="6" /><path d="m14.5 9.5 6-6m-5 0h5v5" /></svg>
              ) : (
                <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M5 21a7 7 0 0 1 14 0m-7-9v6m-3-3h6" /></svg>
              )}
            </span>
            <p className="stat-label">{card.label}</p>
            {error ? (
              <p className="stat-value stat-unavailable" aria-label="Unavailable">—</p>
            ) : summary ? (
              <p className="stat-value">{summary[card.key].toLocaleString()}</p>
            ) : (
              <p className="stat-value stat-loading" role="status">…</p>
            )}
            <p className="stat-footnote">
              {card.key === "total_students" ? "Active student records" : card.key === "total_courses" ? "Distinct courses" : "In student records"}
            </p>
          </article>
        ))}
      </section>
      {error && (
        <div className="alert" role="alert">
          Dashboard totals could not be loaded: {error}{" "}
          <button className="text-link inline-button" type="button" onClick={loadSummary}>Try again</button>
        </div>
      )}
      <StudentRecords showToolbarAdd={false} />
    </div>
  );
}
