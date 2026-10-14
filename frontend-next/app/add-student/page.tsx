
"use client";

import { useState } from "react";

const API_URL = "http://127.0.0.1:8000";

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

const initialForm: StudentForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  date_of_birth: "",
  gender: "",
  course: "",
  address: "",
};

export default function AddStudentPage() {
  const [form, setForm] = useState<StudentForm>(initialForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateField(field: keyof StudentForm, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (Object.values(form).some((value) => !value.trim())) {
      setError("Ella fields-um fill pannunga.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setError("Valid email address enter pannunga.");
      return;
    }

    if (form.phone_number.trim().length < 7) {
      setError("Phone number minimum 7 characters irukkanum.");
      return;
    }

    if (form.course.trim().length < 2 || form.address.trim().length < 5) {
      setError("Course and address details correct-ah enter pannunga.");
      return;
    }

    const dob = new Date(`${form.date_of_birth}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (Number.isNaN(dob.getTime()) || dob >= today) {
      setError("Past date of birth select pannunga.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim().toLowerCase(),
          phone_number: form.phone_number.trim(),
          course: form.course.trim(),
          address: form.address.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const detail = Array.isArray(data.detail)
          ? data.detail.map((item: { msg?: string }) => item.msg).join(", ")
          : data.detail;

        throw new Error(detail || "Student save panna mudiyala.");
      }

      setMessage("Student successfully added!");
      setForm(initialForm);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Backend connection check pannunga."
      );
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900 md:p-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">Add Student</h1>
            <p className="mt-2 text-slate-600">
              Student details enter panni save pannunga.
            </p>
          </div>

          <a
            href="/students"
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold hover:bg-slate-100"
          >
            View Records
          </a>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          {error && (
            <p role="alert" className="rounded-xl bg-red-50 p-4 text-red-700">
              {error}
            </p>
          )}

          {message && (
            <p role="status" className="rounded-xl bg-green-50 p-4 text-green-700">
              {message}
            </p>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              First Name *
              <input required maxLength={100} className={inputClass}
                value={form.first_name}
                onChange={(e) => updateField("first_name", e.target.value)}
                placeholder="Enter first name" />
            </label>

            <label className="text-sm font-semibold">
              Last Name *
              <input required maxLength={100} className={inputClass}
                value={form.last_name}
                onChange={(e) => updateField("last_name", e.target.value)}
                placeholder="Enter last name" />
            </label>

            <label className="text-sm font-semibold">
              Email *
              <input required type="email" className={inputClass}
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="student@example.com" />
            </label>

            <label className="text-sm font-semibold">
              Phone Number *
              <input required minLength={7} maxLength={20} className={inputClass}
                value={form.phone_number}
                onChange={(e) => updateField("phone_number", e.target.value)}
                placeholder="Enter phone number" />
            </label>

            <label className="text-sm font-semibold">
              Date of Birth *
              <input required type="date"
                max="9999-12-31"
                className={inputClass}
                value={form.date_of_birth}
                onChange={(e) => updateField("date_of_birth", e.target.value)} />
            </label>

            <label className="text-sm font-semibold">
              Gender *
              <select required className={inputClass} value={form.gender}
                onChange={(e) => updateField("gender", e.target.value)}>
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label className="text-sm font-semibold sm:col-span-2">
              Course / Department *
              <input required minLength={2} maxLength={100} className={inputClass}
                placeholder="B.Tech AI & DS"
                value={form.course}
                onChange={(e) => updateField("course", e.target.value)} />
            </label>

            <label className="text-sm font-semibold sm:col-span-2">
              Address *
              <textarea required minLength={5} maxLength={500} rows={3}
                className={inputClass}
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="Enter complete address" />
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Student"}
          </button>
        </form>
      </div>
    </main>
  );
}

