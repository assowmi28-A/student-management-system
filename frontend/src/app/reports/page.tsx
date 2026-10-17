"use client";

import { useEffect, useState } from "react";
import { apiFetch, type StudentReports } from "@/lib/api";

export default function ReportsPage() {
  const [report, setReport] = useState<StudentReports | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    apiFetch<StudentReports>("/api/students/reports")
      .then((data) => {
        if (active) setReport(data);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Could not load reports.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const largestCourse = Math.max(1, ...(report?.course_counts.map((item) => item.total) ?? []));

  return (
    <div className="page-stack">
      <section className="page-heading">
        <div>
          <p className="eyebrow">INSIGHTS</p>
          <h1>Reports</h1>
          <p className="muted">A live summary of the student records in your database.</p>
        </div>
      </section>

      {loading ? (
        <section className="card loading-state" role="status">Loading reports…</section>
      ) : error ? (
        <section className="alert" role="alert">Reports could not be loaded: {error}</section>
      ) : report ? (
        <>
          <section className="report-summary-grid" aria-label="Student report totals">
            <article className="card report-total"><span>Total Students</span><strong>{report.total_students.toLocaleString()}</strong></article>
            <article className="card report-total"><span>Courses</span><strong>{report.total_courses.toLocaleString()}</strong></article>
            <article className="card report-total"><span>Male Students</span><strong>{report.male_students.toLocaleString()}</strong></article>
            <article className="card report-total"><span>Female Students</span><strong>{report.female_students.toLocaleString()}</strong></article>
          </section>

          <div className="report-grid">
            <section className="card report-panel">
              <div className="report-panel-heading">
                <div><h2>Students by Course</h2><p className="muted">Enrolments grouped by course</p></div>
                <span className="report-count">{report.course_counts.length} courses</span>
              </div>
              {report.course_counts.length === 0 ? (
                <p className="empty-state">No course records are available yet.</p>
              ) : (
                <ul className="report-list">
                  {report.course_counts.map((item) => (
                    <li className="course-report-item" key={item.label}>
                      <div className="course-report-label"><span>{item.label}</span><strong>{item.total}</strong></div>
                      <div className="report-track" aria-label={`${item.total} students`}>
                        <span style={{ width: `${(item.total / largestCourse) * 100}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="card report-panel">
              <div className="report-panel-heading">
                <div><h2>Students by Gender</h2><p className="muted">Distribution from student records</p></div>
                <span className="report-count">{report.total_students} students</span>
              </div>
              {report.gender_counts.length === 0 ? (
                <p className="empty-state">No student records are available yet.</p>
              ) : (
                <ul className="report-list gender-report-list">
                  {report.gender_counts.map((item) => (
                    <li key={item.label} className="gender-report-item">
                      <span className="gender-dot" aria-hidden="true" />
                      <span>{item.label}</span>
                      <strong>{item.total}</strong>
                      <small>{report.total_students ? Math.round((item.total / report.total_students) * 100) : 0}%</small>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      ) : null}
    </div>
  );
}
