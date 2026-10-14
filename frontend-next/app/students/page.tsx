
"use client";

import { useEffect, useState, type FormEvent } from "react";

const API = (
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");

type Student = {
  id: number;
  name?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: string;
  course?: string;
  address?: string;
};

type StudentForm = {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
  gender: string;
  course: string;
  address: string;
};

const emptyForm: StudentForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  date_of_birth: "",
  gender: "",
  course: "",
  address: "",
};

async function getErrorMessage(response: Response) {
  const data = await response.json().catch(() => ({}));

  if (Array.isArray(data.detail)) {
    return data.detail
      .map((item: { msg?: string }) => item.msg || "")
      .filter(Boolean)
      .join(", ");
  }

  return typeof data.detail === "string"
    ? data.detail
    : `Request failed (${response.status})`;
}

export default function StudentRecordsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<StudentForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  async function loadStudents() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/students`);

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const data: unknown = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid student data received.");
      }

      setStudents(data as Student[]);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Students load aagala: ${err.message}`
          : "Backend connect aagala. Backend URL check pannunga."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadStudents();
  }, []);

  function startEdit(student: Student) {
    const nameParts = (student.name || "").trim().split(/\s+/);
    const firstName =
      student.first_name || (student.name ? nameParts.shift() || "" : "");
    const lastName =
      student.last_name || (student.name ? nameParts.join(" ") : "");

    setForm({
      first_name: firstName,
      last_name: lastName,
      email: student.email || "",
      phone_number: student.phone_number || "",
      date_of_birth: student.date_of_birth?.slice(0, 10) || "",
      gender: student.gender || "",
      course: student.course || "",
      address: student.address || "",
    });

    setEditingId(student.id);
    setNotice("");
    setError("");
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (editingId === null) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`${API}/students/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim(),
          phone_number: form.phone_number.trim(),
          date_of_birth: form.date_of_birth,
          gender: form.gender,
          course: form.course.trim(),
          address: form.address.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      setEditingId(null);
      setForm(emptyForm);
      setNotice("Student details successfully updated.");
      await loadStudents();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Student update failed."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteStudent(id: number) {
    const confirmed = window.confirm(
      "Indha student record-ah delete pannalama?"
    );

    if (!confirmed) return;

    setError("");
    setNotice("");

    try {
      const response = await fetch(`${API}/students/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      setStudents((previous) =>
        previous.filter((student) => student.id !== id)
      );

      setNotice("Student successfully deleted.");

      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Student delete failed."
      );
    }
  }

  const filtered = students.filter((student) => {
    const searchableText = [
      student.id,
      student.name,
      student.first_name,
      student.last_name,
      student.email,
      student.phone_number,
      student.date_of_birth,
      student.gender,
      student.course,
      student.address,
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(search.trim().toLowerCase());
  });

  const uniqueCourses = new Set(
    students
      .map((student) => student.course?.trim().toLowerCase())
      .filter(Boolean)
  ).size;

  const fields: {
    key: keyof StudentForm;
    label: string;
    type?: string;
  }[] = [
    { key: "first_name", label: "First Name" },
    { key: "last_name", label: "Last Name" },
    { key: "email", label: "Email", type: "email" },
    { key: "phone_number", label: "Phone Number", type: "tel" },
    { key: "date_of_birth", label: "Date of Birth", type: "date" },
    { key: "course", label: "Course" },
    { key: "address", label: "Address" },
  ];

  return (
    <main className="min-h-screen bg-slate-50 p-5 text-slate-900 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-700">
              STUDENT MANAGEMENT SYSTEM
            </p>

            <h1 className="mt-2 text-3xl font-bold">Student Records</h1>

            <p className="mt-2 text-sm text-slate-500">
              View, search, edit and manage student information.
            </p>
          </div>

          <a
            href="/add-student"
            className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
          >
            + Add Student
          </a>
        </header>

        <section className="mb-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Students</p>
            <p className="mt-2 text-3xl font-bold">
              {loading ? "..." : students.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Unique Courses</p>
            <p className="mt-2 text-3xl font-bold">{uniqueCourses}</p>
          </div>
        </section>

        {(error || notice) && (
          <div
            role={error ? "alert" : "status"}
            className={`mb-4 rounded-xl p-4 text-sm ${
              error
                ? "bg-red-50 text-red-700"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {error || notice}
          </div>
        )}

        {editingId !== null && (
          <form
            onSubmit={saveEdit}
            className="mb-6 rounded-2xl border border-blue-200 bg-white p-6 shadow-sm"
          >
            <h2 className="mb-5 text-xl font-bold">
              Edit Student #{editingId}
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {fields.map(({ key, label, type = "text" }) => (
                <label key={key} className="text-sm font-medium">
                  {label}

                  <input
                    required
                    type={type}
                    value={form[key]}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        [key]: event.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              ))}

              <label className="text-sm font-medium">
                Gender

                <select
                  required
                  value={form.gender}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      gender: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                  setError("");
                }}
                className="rounded-xl border border-slate-300 px-5 py-3 font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4 sm:p-5">
            <h2 className="font-bold">All Students</h2>

            <div className="flex gap-2">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search students..."
                aria-label="Search students"
                className="w-48 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 sm:w-64"
              />

              <button
                type="button"
                onClick={() => void loadStudents()}
                disabled={loading}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
              >
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>

          {loading ? (
            <p className="p-6 text-slate-500">Loading students...</p>
          ) : error && students.length === 0 ? (
            <div className="p-6">
              <p className="text-red-600">{error}</p>

              <button
                type="button"
                onClick={() => void loadStudents()}
                className="mt-3 underline"
              >
                Retry
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <p className="p-8 text-center text-slate-500">
              {search
                ? "No matching students found."
                : "No student records yet."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    {[
                      "ID",
                      "Name",
                      "Email",
                      "Phone",
                      "Course",
                      "Actions",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-5 py-4 font-semibold"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((student) => (
                    <tr
                      key={student.id}
                      className="border-t border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 font-medium">
                        {student.id}
                      </td>

                      <td className="px-5 py-4 font-medium">
                        {student.name ||
                          `${student.first_name || ""} ${
                            student.last_name || ""
                          }`.trim() ||
                          "—"}
                      </td>

                      <td className="px-5 py-4">{student.email}</td>

                      <td className="px-5 py-4">
                        {student.phone_number || "—"}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                          {student.course || "—"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              window.alert(
                                [
                                  `Name: ${
                                    student.name ||
                                    `${student.first_name || ""} ${
                                      student.last_name || ""
                                    }`.trim()
                                  }`,
                                  `Email: ${student.email}`,
                                  `Phone: ${student.phone_number || "—"}`,
                                  `Date of Birth: ${
                                    student.date_of_birth || "—"
                                  }`,
                                  `Gender: ${student.gender || "—"}`,
                                  `Course: ${student.course || "—"}`,
                                  `Address: ${student.address || "—"}`,
                                ].join("\n")
                              )
                            }
                            className="rounded-lg bg-blue-50 px-3 py-2 font-medium text-blue-700 hover:bg-blue-100"
                          >
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() => startEdit(student)}
                            className="rounded-lg bg-amber-50 px-3 py-2 font-medium text-amber-700 hover:bg-amber-100"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => void deleteStudent(student.id)}
                            className="rounded-lg bg-red-50 px-3 py-2 font-medium text-red-600 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
