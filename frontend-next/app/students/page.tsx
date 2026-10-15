
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type Student = {
  id: number;
  first_name: string;
  last_name: string;
  name: string;
  email: string;
  phone_number?: string;
  date_of_birth: string;
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

  async function loadStudents() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/students`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Could not load students.");
      }

      const data = await response.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch {
      setError(
        "Students load aagala. Backend running-ah irukka check pannunga."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadStudents();
  }, []);

  const filtered = students.filter((student) =>
    `${student.name} ${student.email} ${student.course ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  async function viewStudent(student: Student) {
    setError("");

    try {
      const response = await fetch(`${API}/students/${student.id}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to load student details.");
      }

      const fullStudent: Student = await response.json();
      setViewing(fullStudent);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load student details."
      );
    }
  }

  async function deleteStudent(student: Student) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${student.name}?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${API}/students/${student.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Delete failed.");
      }

      setStudents((old) =>
        old.filter((item) => item.id !== student.id)
      );

      if (viewing?.id === student.id) setViewing(null);
      if (editing?.id === student.id) setEditing(null);

      alert("Student deleted successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete failed.");
    }
  }

  async function updateStudent(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!editing) return;

    setSaving(true);
    setError("");

    const form = new FormData(event.currentTarget);

    const payload = {
      first_name: String(form.get("first_name") || "").trim(),
      last_name: String(form.get("last_name") || "").trim(),
      email: String(form.get("email") || "").trim(),
      phone_number: String(form.get("phone_number") || "").trim(),
      date_of_birth: String(form.get("date_of_birth") || ""),
      gender: String(form.get("gender") || ""),
      course: String(form.get("course") || "").trim(),
      address: String(form.get("address") || "").trim(),
    };

    try {
      const response = await fetch(`${API}/students/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = Array.isArray(data.detail)
          ? data.detail.map((item: { msg: string }) => item.msg).join(", ")
          : data.detail || "Update failed.";

        throw new Error(message);
      }

      setEditing(null);
      await loadStudents();
      alert("Student updated successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Update failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900 md:p-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Student Records</h1>
            <p className="mt-2 text-slate-500">
              Manage student information
            </p>
          </div>

          <Link
            href="/add-student"
            className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            + Add Student
          </Link>
        </header>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <p className="font-semibold">
            Total Students: {students.length}
          </p>

          <input
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 sm:w-80"
            placeholder="Search name, email, course..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {error && (
          <p className="mb-4 rounded-xl bg-red-50 p-4 text-red-700">
            {error}
          </p>
        )}

        {loading ? (
          <p className="rounded-xl bg-white p-6">
            Loading students...
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[950px] text-left">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Course</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((student) => (
                  <tr
                    key={student.id}
                    className="border-t border-slate-200"
                  >
                    <td className="p-4">{student.name}</td>
                    <td className="p-4">{student.email}</td>
                    <td className="p-4">
                      {student.phone_number || "—"}
                    </td>
                    <td className="p-4">
                      {student.course || "—"}
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => void viewStudent(student)}
                          className="rounded-lg bg-blue-100 px-3 py-2 font-semibold text-blue-800 hover:bg-blue-200"
                        >
                          View
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditing(student)}
                          className="rounded-lg bg-amber-100 px-3 py-2 font-semibold text-amber-800 hover:bg-amber-200"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => void deleteStudent(student)}
                          className="rounded-lg bg-red-100 px-3 py-2 font-semibold text-red-700 hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center">
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* View complete student details */}
        {viewing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
            <section className="my-6 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl sm:p-8">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                    Student Profile
                  </p>
                  <h2 className="mt-2 text-2xl font-bold">
                    {viewing.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Student ID: {viewing.id}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setViewing(null)}
                  className="rounded-lg border px-3 py-2 hover:bg-slate-50"
                  aria-label="Close student details"
                >
                  ✕
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
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
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {label}
                    </p>
                    <p className="mt-2 break-words font-medium text-slate-900">
                      {value === null || value === undefined || value === ""
                        ? "Not provided"
                        : String(value)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewing(null)}
                  className="rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-700"
                >
                  Close
                </button>
              </div>
            </section>
          </div>
        )}

        {/* Edit student form */}
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
            <form
              onSubmit={updateStudent}
              className="my-6 w-full max-w-xl space-y-4 rounded-2xl bg-white p-6 shadow-xl"
            >
              <h2 className="text-2xl font-bold">Edit Student</h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  First Name *
                  <input
                    name="first_name"
                    required
                    defaultValue={editing.first_name}
                    className="mt-1 w-full rounded-lg border p-3"
                  />
                </label>

                <label>
                  Last Name *
                  <input
                    name="last_name"
                    required
                    defaultValue={editing.last_name}
                    className="mt-1 w-full rounded-lg border p-3"
                  />
                </label>

                <label>
                  Email *
                  <input
                    name="email"
                    type="email"
                    required
                    defaultValue={editing.email}
                    className="mt-1 w-full rounded-lg border p-3"
                  />
                </label>

                <label>
                  Phone
                  <input
                    name="phone_number"
                    defaultValue={editing.phone_number || ""}
                    className="mt-1 w-full rounded-lg border p-3"
                  />
                </label>

                <label>
                  Date of Birth *
                  <input
                    name="date_of_birth"
                    type="date"
                    required
                    max={new Date().toISOString().slice(0, 10)}
                    defaultValue={editing.date_of_birth || ""}
                    className="mt-1 w-full rounded-lg border p-3"
                  />
                </label>

                <label>
                  Gender
                  <select
                    name="gender"
                    defaultValue={editing.gender || ""}
                    className="mt-1 w-full rounded-lg border p-3"
                  >
                    <option value="">Select</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </label>

                <label className="sm:col-span-2">
                  Course *
                  <input
                    name="course"
                    required
                    defaultValue={editing.course || ""}
                    className="mt-1 w-full rounded-lg border p-3"
                  />
                </label>

                <label className="sm:col-span-2">
                  Address
                  <input
                    name="address"
                    defaultValue={editing.address || ""}
                    className="mt-1 w-full rounded-lg border p-3"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="rounded-xl border px-4 py-3"
                >
                  Cancel
                </button>

                <button
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
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
