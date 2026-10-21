"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch, type Student, type StudentPage } from "@/lib/api";

const PAGE_SIZE_OPTIONS = [10, 25, 50];
const MAX_VISIBLE_PAGES = 10;
type PageItem = number | "start-ellipsis" | "end-ellipsis";

function getPageItems(page: number, totalPages: number): PageItem[] {
  if (totalPages <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  const items: PageItem[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);
  if (start > 2) items.push("start-ellipsis");
  for (let number = start; number <= end; number += 1) items.push(number);
  if (end < totalPages - 1) items.push("end-ellipsis");
  items.push(totalPages);
  return items;
}

function studentName(student: Student) {
  return `${student.first_name} ${student.last_name}`;
}

function StudentActions({
  student,
  onDelete,
}: {
  student: Student;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="record-actions">
      <Link href={`/students/${student.id}`} className="action-link action-view">View</Link>
      <Link href={`/students/${student.id}/edit`} className="action-link action-edit">Edit</Link>
      <button className="action-link action-delete" type="button" onClick={() => onDelete(student.id)}>Delete</button>
    </div>
  );
}

export default function StudentRecords({
  showHeading = false,
  showToolbarAdd = true,
}: {
  showHeading?: boolean;
  showToolbarAdd?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [result, setResult] = useState<StudentPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const initialSearch = query.get("search") ?? "";
    setSearch(initialSearch);
    const successKey = query.get("success");
    const messages: Record<string, string> = {
      created: "Student record added successfully.",
      updated: "Student record updated successfully.",
      deleted: "Student record deleted successfully.",
    };
    if (successKey && messages[successKey]) setSuccess(messages[successKey]);

    const onGlobalSearch = (event: Event) => {
      const value = (event as CustomEvent<string>).detail;
      setSearch(value);
      setPage(1);
    };
    window.addEventListener("student-search", onGlobalSearch);
    return () => window.removeEventListener("student-search", onGlobalSearch);
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    const query = new URLSearchParams({
      search,
      page: String(page),
      page_size: String(pageSize),
    });
    apiFetch<StudentPage>(`/students?${query.toString()}`)
      .then((data) => {
        if (!active) return;
        setResult(data);
        if (data.page !== page) setPage(data.page);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setError(reason instanceof Error ? reason.message : "Could not load records.");
        setResult(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [search, page, pageSize, reload]);

  async function deleteStudent(id: number) {
    if (!window.confirm("Delete this student record? This cannot be undone.")) return;
    try {
      await apiFetch<void>(`/students/${id}`, { method: "DELETE" });
      setError("");
      setSuccess("Student record deleted successfully.");
      window.dispatchEvent(new Event("students-changed"));
      setReload((value) => value + 1);
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "Could not delete this record.");
    }
  }

  const totalPages = result?.total_pages ?? 1;
  const currentPage = result?.page ?? page;
  const rangeStart = result && result.total > 0 ? (result.page - 1) * pageSize + 1 : 0;
  const rangeEnd = result ? Math.min(result.page * pageSize, result.total) : 0;

  return (
    <div className="page-stack">
      {showHeading && (
        <section className="page-heading">
          <div>
            <p className="eyebrow">STUDENT DIRECTORY</p>
            <h1>Students</h1>
            <p className="muted">Search and manage student profiles.</p>
          </div>
          <Link className="button button-primary" href="/students/new">Add Student</Link>
        </section>
      )}

      <section className="card records-panel">
        <div className="records-toolbar">
          <div>
            <h2>{showHeading ? "All Students" : "Student Directory"}</h2>
            <p className="muted">Manage student information and records.</p>
          </div>
          {showToolbarAdd && (
            <Link className="button button-primary toolbar-add" href="/students/new">Add Student</Link>
          )}
        </div>

        <div className="records-controls">
          <label className="search-wrap" htmlFor="student-search">
            <span className="search-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
            </span>
            <input
              className="search-input"
              id="student-search"
              type="search"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </label>
          <label className="page-size-control">
            <span>Rows per page</span>
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
              aria-label="Rows per page"
            >
              {PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
          </label>
        </div>

        {success && <p className="success-message" role="status">{success}</p>}
        {error && (
          <div className="alert" role="alert">
            {error}{" "}
            <button className="text-link inline-button" type="button" onClick={() => setReload((value) => value + 1)}>Try again</button>
          </div>
        )}

        {loading ? (
          <p className="loading-state" role="status">Loading student records…</p>
        ) : !error && result?.items.length === 0 ? (
          <div className="empty-state">
            <h2>{search ? "No matching students" : "No student records yet"}</h2>
            <p className="muted">{search ? "Try a different name, email, or phone number." : "Add a student to get started."}</p>
          </div>
        ) : !error && result ? (
          <>
            <div className="table-wrap">
              <table className="records-table">
                <thead>
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Name</th>
                    <th scope="col">Email</th>
                    <th scope="col">Phone</th>
                    <th scope="col">Course</th>
                    <th scope="col">Gender</th>
                    <th scope="col">Date of Birth</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((student) => (
                    <tr key={student.id}>
                      <td data-label="ID"><span className="id-pill">#{student.id}</span></td>
                      <td data-label="Name"><Link className="student-name-link" href={`/students/${student.id}`}>{studentName(student)}</Link></td>
                      <td data-label="Email">{student.email || "—"}</td>
                      <td data-label="Phone">{student.phone}</td>
                      <td data-label="Course">{student.course || "—"}</td>
                      <td data-label="Gender">{student.gender || "—"}</td>
                      <td data-label="Date of Birth">{student.date_of_birth || "—"}</td>
                      <td data-label="Actions"><StudentActions student={student} onDelete={deleteStudent} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mobile-student-list">
              {result.items.map((student) => (
                <article className="student-card" key={student.id}>
                  <div className="student-card-heading">
                    <div>
                      <Link className="student-name-link" href={`/students/${student.id}`}>{studentName(student)}</Link>
                      <span className="student-card-id">Student ID #{student.id}</span>
                    </div>
                    <span className="course-badge">{student.course || "No course"}</span>
                  </div>
                  <dl className="student-card-details">
                    <div><dt>Email</dt><dd>{student.email || "—"}</dd></div>
                    <div><dt>Phone</dt><dd>{student.phone}</dd></div>
                    <div><dt>Gender</dt><dd>{student.gender || "—"}</dd></div>
                    <div><dt>Date of birth</dt><dd>{student.date_of_birth || "—"}</dd></div>
                  </dl>
                  <StudentActions student={student} onDelete={deleteStudent} />
                </article>
              ))}
            </div>
          </>
        ) : null}

        {!loading && !error && result && (
          <div className="pagination-bar">
            <p className="record-range" aria-live="polite">
              {result.total === 0
                ? "No students"
                : `Showing ${rangeStart}–${rangeEnd} of ${result.total} students`}
            </p>
            {totalPages > 1 && (
              <nav className="pagination" aria-label="Student record pages">
                <button className="page-button" type="button" disabled={currentPage <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</button>
                <div className="pagination-pages">
                  {getPageItems(currentPage, totalPages).map((item) =>
                    typeof item === "number" ? (
                      <button
                        className="page-button"
                        type="button"
                        key={item}
                        aria-label={`Page ${item}`}
                        aria-current={currentPage === item ? "page" : undefined}
                        onClick={() => setPage(item)}
                      >{item}</button>
                    ) : <span className="pagination-ellipsis" key={item} aria-hidden="true">…</span>
                  )}
                </div>
                <button className="page-button" type="button" disabled={currentPage >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Next</button>
              </nav>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
