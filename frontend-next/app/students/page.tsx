"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import Link from "next/link";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

type Student = {
  id: number;
  first_name?: string;
  last_name?: string;
  name?: string;
  email: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: string;
  course?: string;
  address?: string;
  age?: number;
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Student | null>(null);
  const [viewing, setViewing] = useState<Student | null>(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

  const abortControllerRef = useRef<AbortController | null>(null);
  // refreshing=true shows a subtle indicator without blanking the table
  const [refreshing, setRefreshing] = useState(false);

  const loadStudents = useCallback(async (silent = false) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");

    try {
      const response = await fetch(`${API_URL}/students`, {
        signal: controller.signal,
        // cache: "no-store" is sufficient â€” browsers ignore Cache-Control/Pragma
        // in fetch() request init headers; those are response-header concepts.
        cache: "no-store",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const detail =
          errorData?.detail ||
          errorData?.message ||
          `Failed to load students (status ${response.status}).`;
        throw new Error(
          typeof detail === "string" ? detail : "Failed to load students."
        );
      }

      const data = await response.json();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.students)
        ? data.students
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setStudents(list);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load students. Please check your backend connection."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadStudents();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadStudents]);

  // Performance: useMemo avoids re-filtering on unrelated state updates
  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return students;

    return students.filter((student) => {
      const fullName =
        student.name ||
        `${student.first_name || ""} ${student.last_name || ""}`.trim();

      const searchableText = [
        student.id,
        fullName,
        student.first_name,
        student.last_name,
        student.email,
        student.phone_number,
        student.course,
        student.gender,
        student.address,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(term);
    });
  }, [students, search]);

  // Performance: open modal immediately from existing state â€” no extra network
  // request needed because GET /students already returns all fields.
  function viewStudent(student: Student) {
    setViewing(student);
  }

  async function deleteStudent(student: Student) {
    const studentDisplayName =
      student.name ||
      `${student.first_name || ""} ${student.last_name || ""}`.trim() ||
      `Student #${student.id}`;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${studentDisplayName}?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/students/${student.id}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || "Delete failed.");
      }

      setStudents((old) => old.filter((item) => item.id !== student.id));

      if (viewing?.id === student.id) setViewing(null);
      if (editing?.id === student.id) setEditing(null);

      alert("Student deleted successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed.");
    }
  }

  async function updateStudent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editing) return;

    setSaving(true);
    setEditError("");

    const form = new FormData(event.currentTarget);

    const payload = {
      first_name: String(form.get("first_name") || "").trim(),
      last_name: String(form.get("last_name") || "").trim(),
      email: String(form.get("email") || "").trim().toLowerCase(),
      phone_number: String(form.get("phone_number") || "").trim(),
      date_of_birth: String(form.get("date_of_birth") || ""),
      gender: String(form.get("gender") || ""),
      course: String(form.get("course") || "").trim(),
      address: String(form.get("address") || "").trim(),
    };

    if (!payload.first_name || !payload.last_name) {
      setEditError("First name and last name cannot be blank.");
      setSaving(false);
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(payload.email)) {
      setEditError("Please enter a valid email address.");
      setSaving(false);
      return;
    }

    if (payload.phone_number.length < 7) {
      setEditError("Phone number must be at least 7 characters.");
      setSaving(false);
      return;
    }

    if (!payload.date_of_birth) {
      setEditError("Date of birth is required.");
      setSaving(false);
      return;
    }

    const dob = new Date(`${payload.date_of_birth}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (Number.isNaN(dob.getTime()) || dob >= today) {
      setEditError("Date of birth must be in the past.");
      setSaving(false);
      return;
    }

    if (!payload.gender) {
      setEditError("Please select a gender.");
      setSaving(false);
      return;
    }

    if (payload.course.length < 2) {
      setEditError("Course must be at least 2 characters.");
      setSaving(false);
      return;
    }

    if (payload.address.length < 5) {
      setEditError("Address must be at least 5 characters.");
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/students/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = Array.isArray(data.detail)
          ? data.detail.map((item: { msg?: string }) => item.msg).join(", ")
          : data.detail || "Update failed.";

        throw new Error(message);
      }

      setEditing(null);
      await loadStudents(true);
      alert("Student updated successfully!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Update failed.";
      setEditError(message);
      alert(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F1E8] p-4 sm:p-6 md:p-10 text-[#1F1B16]">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Student Records</h1>
            <p className="mt-1 text-sm text-[#6B6358] sm:text-base">
              Manage student information
            </p>
          </div>

          <Link
            href="/add-student"
            className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-[#1F6F6B] px-5 py-3 font-semibold text-white hover:bg-[#185956] transition shadow-sm text-sm"
          >
            + Add Student
          </Link>
        </header>

        <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="font-semibold text-sm sm:text-base">
            Total Students: {students.length}
          </p>

          <div className="flex w-full items-center gap-2 sm:w-auto">
            <input
              className="min-w-0 flex-1 sm:w-80 sm:flex-none rounded-xl border border-[#DDD5C4] bg-white px-4 py-3 text-sm sm:text-base outline-none focus:border-[#1F6F6B] transition shadow-sm"
              placeholder="Search name, email, course..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search students"
            />
            <button
              type="button"
              onClick={() => void loadStudents(students.length > 0)}
              disabled={loading || refreshing}
              className="shrink-0 rounded-xl border border-[#DDD5C4] bg-white px-4 py-3 text-sm font-semibold hover:bg-[#F5F1E8] disabled:opacity-50 transition shadow-sm"
              title="Refresh students list"
            >
              {refreshing ? "â†»" : loading ? "..." : "Refresh"}
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
          >
            <p className="font-medium text-sm sm:text-base">{error}</p>
            <button
              type="button"
              onClick={() => void loadStudents()}
              className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-[#DDD5C4] bg-white p-8 text-center shadow-sm">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="mt-3 font-medium text-slate-600">Loading students...</p>
          </div>
        ) : (
          <>
            <div className="student-cards">
              {refreshing && (
                <div className="h-0.5 w-full overflow-hidden bg-slate-100">
                  <div className="h-full animate-pulse bg-[#1F6F6B]" style={{ width: "60%" }} />
                </div>
              )}

              {filtered.length === 0 ? (
                <div className="mobile-empty-state">
                  <p className="text-base font-semibold text-slate-700">
                    No students found.
                  </p>
                  <p className="mt-1 text-sm">
                    {search.trim()
                      ? `No student records match "${search}". Try adjusting your search query.`
                      : "No student records available yet."}
                  </p>
                  {search.trim() ? (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="mt-3 rounded-lg border border-[#DDD5C4] px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                    >
                      Clear Search
                    </button>
                  ) : (
                    <Link
                      href="/add-student"
                      className="mt-3 inline-block rounded-lg bg-[#1F6F6B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#185956] transition"
                    >
                      + Add First Student
                    </Link>
                  )}
                </div>
              ) : (
                filtered.map((student) => {
                  const displayName =
                    student.name ||
                    `${student.first_name || ""} ${student.last_name || ""}`.trim() ||
                    `Student #${student.id}`;
                  const fields: Array<[string, string]> = [
                    ["Name", displayName],
                    ["Email", student.email],
                    ["Phone", student.phone_number || "Not provided"],
                    ["Course", student.course || "Not provided"],
                    ["Date of birth", student.date_of_birth || "Not provided"],
                    ["Address", student.address || "Not provided"],
                    ["Gender", student.gender || "Not provided"],
                    ["Age", student.age === undefined ? "Not provided" : String(student.age)],
                    ["Student ID", String(student.id)],
                  ];

                  return (
                    <article className="student-card" key={student.id}>
                      <div className="student-card-fields">
                        {fields.map(([label, value]) => (
                          <div className="student-card-field" key={label}>
                            <span className="student-card-label">{label}</span>
                            <span className="student-card-value">{value}</span>
                          </div>
                        ))}
                      </div>
                      <div className="student-card-actions">
                        <button
                          type="button"
                          onClick={() => viewStudent(student)}
                          className="rounded-lg bg-[#D8E9E5] px-2.5 py-1.5 text-xs font-semibold text-[#1F6F6B] hover:bg-[#C6DFD9] transition"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(student);
                            setEditError("");
                          }}
                          className="rounded-lg bg-amber-100 px-2.5 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-200 transition"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteStudent(student)}
                          className="rounded-lg bg-red-100 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>

            <div className="students-table-card">
            {/* Silent refresh indicator â€” table stays visible */}
            {refreshing && (
              <div className="h-0.5 w-full overflow-hidden bg-slate-100">
                <div className="h-full animate-pulse bg-[#1F6F6B]" style={{ width: "60%" }} />
              </div>
            )}
            <table className="students-table w-full min-w-[580px] md:min-w-full text-left">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-3 sm:p-4 font-semibold text-xs sm:text-sm">Name</th>
                  <th className="p-3 sm:p-4 font-semibold text-xs sm:text-sm">Email</th>
                  <th className="p-3 sm:p-4 font-semibold text-xs sm:text-sm">Phone</th>
                  <th className="p-3 sm:p-4 font-semibold text-xs sm:text-sm">Course</th>
                  <th className="p-3 sm:p-4 font-semibold text-xs sm:text-sm">Date of birth</th>
                  <th className="p-3 sm:p-4 font-semibold text-xs sm:text-sm">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((student) => {
                  const displayName =
                    student.name ||
                    `${student.first_name || ""} ${student.last_name || ""}`.trim() ||
                    "â€”";

                  return (
                    <tr
                      key={student.id}
                      className="student-card-row border-t border-[#DDD5C4] hover:bg-[#F5F1E8] transition"
                    >
                      <td data-label="Name" className="p-3 sm:p-4 font-medium text-[#1F1B16] whitespace-nowrap">
                        {displayName}
                      </td>
                      <td data-label="Email" className="p-3 sm:p-4 text-slate-700">
                        {student.email}
                      </td>
                      <td data-label="Phone" className="p-3 sm:p-4 text-slate-700 whitespace-nowrap">
                        {student.phone_number || "â€”"}
                      </td>
                      <td data-label="Course" className="p-3 sm:p-4 whitespace-nowrap">
                        <span className="rounded-full bg-[#F0E9DA] px-2.5 py-1 text-xs font-medium text-[#1F6F6B] border border-blue-100">
                          {student.course || "â€”"}
                        </span>
                      </td>
                      <td data-label="Date of birth" className="p-3 sm:p-4 whitespace-nowrap text-sm text-[#6B6358]">{student.date_of_birth || "—"}</td>
                      <td data-label="Actions" className="p-3 sm:p-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <button
                            type="button"
                            onClick={() => viewStudent(student)}
                            className="rounded-lg bg-[#D8E9E5] px-2.5 py-1.5 text-xs font-semibold text-[#1F6F6B] hover:bg-[#C6DFD9] transition"
                          >
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditing(student);
                              setEditError("");
                            }}
                            className="rounded-lg bg-amber-100 px-2.5 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-200 transition"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => void deleteStudent(student)}
                            className="rounded-lg bg-red-100 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200 transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#6B6358]">
                      <p className="text-base font-semibold text-slate-700">
                        No students found.
                      </p>
                      <p className="mt-1 text-sm">
                        {search.trim()
                          ? `No student records match "${search}". Try adjusting your search query.`
                          : "No student records available yet."}
                      </p>
                      {search.trim() ? (
                        <button
                          type="button"
                          onClick={() => setSearch("")}
                          className="mt-3 rounded-lg border border-[#DDD5C4] px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                        >
                          Clear Search
                        </button>
                      ) : (
                        <Link
                          href="/add-student"
                          className="mt-3 inline-block rounded-lg bg-[#1F6F6B] px-4 py-2 text-xs font-semibold text-white hover:bg-[#185956] transition"
                        >
                          + Add First Student
                        </Link>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          </>
        )}

        {/* View complete student details modal */}
        {viewing && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-3 sm:p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setViewing(null);
            }}
          >
            <section className="my-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-4 sm:p-6 md:p-8 shadow-xl">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                    Student Profile
                  </p>
                  <h2 className="mt-1 text-xl font-bold sm:text-2xl text-[#1F1B16]">
                    {viewing.name ||
                      `${viewing.first_name || ""} ${viewing.last_name || ""}`.trim() ||
                      `Student #${viewing.id}`}
                  </h2>
                  <p className="mt-0.5 text-xs sm:text-sm text-[#6B6358]">
                    Student ID: {viewing.id}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setViewing(null)}
                  className="rounded-lg border border-[#DDD5C4] px-3 py-1.5 text-sm hover:bg-[#F5F1E8] transition"
                  aria-label="Close student details"
                >
                  âœ•
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["First Name", viewing.first_name],
                  ["Last Name", viewing.last_name],
                  ["Email", viewing.email],
                  ["Phone Number", viewing.phone_number],
                  ["Date of Birth", viewing.date_of_birth],
                  ["Age", viewing.age],
                  ["Gender", viewing.gender],
                  ["Course", viewing.course],
                  ["Address", viewing.address],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-[#DDD5C4] bg-[#F5F1E8] p-3 sm:p-4"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6B6358]">
                      {label}
                    </p>
                    <p className="mt-1 break-words text-sm font-medium text-[#1F1B16]">
                      {value === null || value === undefined || value === ""
                        ? "Not provided"
                        : String(value)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewing(null)}
                  className="w-full sm:w-auto rounded-xl bg-slate-900 px-5 py-2.5 font-semibold text-white hover:bg-slate-700 transition text-sm"
                >
                  Close
                </button>
              </div>
            </section>
          </div>
        )}

        {/* Edit student form modal */}
        {editing && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-3 sm:p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setEditing(null);
            }}
          >
            <form
              onSubmit={updateStudent}
              className="my-auto max-h-[90vh] w-full max-w-xl space-y-4 overflow-y-auto rounded-2xl bg-white p-4 sm:p-6 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold sm:text-2xl">Edit Student</h2>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="rounded-lg border border-[#DDD5C4] px-3 py-1.5 text-sm hover:bg-[#F5F1E8] transition"
                  aria-label="Close edit modal"
                >
                  âœ•
                </button>
              </div>

              {editError && (
                <div role="alert" className="rounded-xl bg-red-50 p-3.5 text-sm text-red-700 break-words">
                  {editError}
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-semibold">
                  First Name *
                  <input
                    name="first_name"
                    required
                    maxLength={100}
                    defaultValue={
                      editing.first_name ||
                      editing.name?.split(" ")[0] ||
                      ""
                    }
                    className="mt-1 w-full rounded-lg border p-2.5 sm:p-3 text-base text-[#1F1B16] outline-none focus:border-[#1F6F6B]"
                  />
                </label>

                <label className="text-sm font-semibold">
                  Last Name *
                  <input
                    name="last_name"
                    required
                    maxLength={100}
                    defaultValue={
                      editing.last_name ||
                      editing.name?.split(" ").slice(1).join(" ") ||
                      ""
                    }
                    className="mt-1 w-full rounded-lg border p-2.5 sm:p-3 text-base text-[#1F1B16] outline-none focus:border-[#1F6F6B]"
                  />
                </label>

                <label className="text-sm font-semibold">
                  Email *
                  <input
                    name="email"
                    type="email"
                    required
                    defaultValue={editing.email}
                    className="mt-1 w-full rounded-lg border p-2.5 sm:p-3 text-base text-[#1F1B16] outline-none focus:border-[#1F6F6B]"
                  />
                </label>

                <label className="text-sm font-semibold">
                  Phone *
                  <input
                    name="phone_number"
                    required
                    minLength={7}
                    maxLength={20}
                    defaultValue={editing.phone_number || ""}
                    className="mt-1 w-full rounded-lg border p-2.5 sm:p-3 text-base text-[#1F1B16] outline-none focus:border-[#1F6F6B]"
                  />
                </label>

                <label className="text-sm font-semibold">
                  Date of Birth *
                  <input
                    name="date_of_birth"
                    type="date"
                    required
                    max={new Date().toISOString().slice(0, 10)}
                    defaultValue={editing.date_of_birth || ""}
                    className="mt-1 w-full rounded-lg border p-2.5 sm:p-3 text-base text-[#1F1B16] outline-none focus:border-[#1F6F6B]"
                  />
                </label>

                <label className="text-sm font-semibold">
                  Gender *
                  <select
                    name="gender"
                    required
                    defaultValue={editing.gender || ""}
                    className="mt-1 w-full rounded-lg border p-2.5 sm:p-3 text-base text-[#1F1B16] outline-none focus:border-[#1F6F6B]"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </label>

                <label className="text-sm font-semibold sm:col-span-2">
                  Course *
                  <input
                    name="course"
                    required
                    minLength={2}
                    maxLength={100}
                    defaultValue={editing.course || ""}
                    className="mt-1 w-full rounded-lg border p-2.5 sm:p-3 text-base text-[#1F1B16] outline-none focus:border-[#1F6F6B]"
                  />
                </label>

                <label className="text-sm font-semibold sm:col-span-2">
                  Address *
                  <textarea
                    name="address"
                    required
                    minLength={5}
                    maxLength={500}
                    rows={3}
                    defaultValue={editing.address || ""}
                    className="mt-1 w-full rounded-lg border p-2.5 sm:p-3 text-base text-[#1F1B16] outline-none focus:border-[#1F6F6B]"
                  />
                </label>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="w-full sm:w-auto rounded-xl border border-[#DDD5C4] px-4 py-2.5 font-semibold text-slate-700 hover:bg-[#F5F1E8] transition text-sm"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto rounded-xl bg-[#1F6F6B] px-5 py-2.5 font-semibold text-white hover:bg-[#185956] disabled:opacity-50 transition shadow-sm text-sm"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}




