"use client";

import { useState } from "react";
import Link from "next/link";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

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
      setError("Please fill in all required fields.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (form.phone_number.trim().length < 7) {
      setError("Phone number must be at least 7 characters.");
      return;
    }

    if (form.course.trim().length < 2) {
      setError("Course must be at least 2 characters.");
      return;
    }

    if (form.address.trim().length < 5) {
      setError("Address must be at least 5 characters.");
      return;
    }

    const dob = new Date(`${form.date_of_birth}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (Number.isNaN(dob.getTime()) || dob >= today) {
      setError("Please select a date of birth in the past.");
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

        throw new Error(detail || "Could not save student record.");
      }

      setMessage("Student successfully added!");
      setForm(initialForm);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not connect to backend server. Please verify it is running."
      );
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-base transition";

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-10 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Add Student</h1>
            <p className="mt-1 text-sm text-slate-600 sm:text-base">
              Enter student details to add a new record.
            </p>
          </div>

          <Link
            href="/students"
            className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm text-sm"
          >
            View Records
          </Link>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 md:p-8"
        >
          {error && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 break-words">
              {error}
            </div>
          )}

          {message && (
            <div role="status" className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700 break-words">
              {message}
            </div>
          )}

          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              First Name *
              <input
                required
                maxLength={100}
                className={inputClass}
                value={form.first_name}
                onChange={(e) => updateField("first_name", e.target.value)}
                placeholder="Enter first name"
              />
            </label>

            <label className="text-sm font-semibold">
              Last Name *
              <input
                required
                maxLength={100}
                className={inputClass}
                value={form.last_name}
                onChange={(e) => updateField("last_name", e.target.value)}
                placeholder="Enter last name"
              />
            </label>

            <label className="text-sm font-semibold">
              Email *
              <input
                required
                type="email"
                className={inputClass}
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="student@example.com"
              />
            </label>

            <label className="text-sm font-semibold">
              Phone Number *
              <input
                required
                minLength={7}
                maxLength={20}
                className={inputClass}
                value={form.phone_number}
                onChange={(e) => updateField("phone_number", e.target.value)}
                placeholder="Enter phone number"
              />
            </label>

            <label className="text-sm font-semibold">
              Date of Birth *
              <input
                required
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                className={inputClass}
                value={form.date_of_birth}
                onChange={(e) => updateField("date_of_birth", e.target.value)}
              />
            </label>

            <label className="text-sm font-semibold">
              Gender *
              <select
                required
                className={inputClass}
                value={form.gender}
                onChange={(e) => updateField("gender", e.target.value)}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label className="text-sm font-semibold sm:col-span-2">
              Course / Department *
              <input
                required
                minLength={2}
                maxLength={100}
                className={inputClass}
                placeholder="e.g. B.Tech Computer Science"
                value={form.course}
                onChange={(e) => updateField("course", e.target.value)}
              />
            </label>

            <label className="text-sm font-semibold sm:col-span-2">
              Address *
              <textarea
                required
                minLength={5}
                maxLength={500}
                rows={3}
                className={inputClass}
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="Enter complete address"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition shadow-sm"
          >
            {saving ? "Saving..." : "Save Student"}
          </button>
        </form>
      </div>
    </main>
  );
}
