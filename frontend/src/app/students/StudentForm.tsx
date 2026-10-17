"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import type { StudentInput } from "@/lib/api";

type StudentFormProps = {
  initialValue?: StudentInput;
  submitLabel: string;
  onSubmit: (student: StudentInput) => Promise<void>;
};

type FormErrors = Partial<Record<keyof StudentInput, string>>;

const EMAIL_PATTERN =
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

// Letters (any case), with spaces, apostrophes, or hyphens between parts.
const NAME_PATTERN = /^\p{L}+(?:[ '-]\p{L}+)*$/u;

/**
 * Returns only the 10 local digits of a phone number.
 * Accepts "+919876543210", "919876543210" (12 digits) or plain digits,
 * so the +91 prefix is never doubled.
 */
function toLocalDigits(value: string): string {
  const trimmed = value.trim();
  let digits = trimmed.replace(/\D/g, "");
  if (trimmed.startsWith("+91")) {
    digits = digits.slice(2);
  } else if (digits.length >= 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  }
  return digits.slice(0, 10);
}

export default function StudentForm({
  initialValue = {
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    date_of_birth: "",
    gender: "",
    course: "",
    address: "",
  },
  submitLabel,
  onSubmit,
}: StudentFormProps) {
  // In the form, `phone` holds only the 10 digits. "+91" is shown as a
  // fixed prefix and added back when the form is submitted.
  const [form, setForm] = useState<StudentInput>({
    ...initialValue,
    phone: toLocalDigits(initialValue.phone ?? ""),
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateField(field: keyof StudentInput, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const phoneDigits = toLocalDigits(form.phone);
    const normalized: StudentInput = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      phone: `+91${phoneDigits}`,
      email: form.email.trim().toLowerCase(),
      date_of_birth: form.date_of_birth,
      gender: form.gender,
      course: form.course.trim(),
      address: form.address.trim(),
    };
    setForm({ ...normalized, phone: phoneDigits });

    const nextErrors: FormErrors = {};
    if (!normalized.first_name) {
      nextErrors.first_name = "Enter the first name.";
    } else if (!NAME_PATTERN.test(normalized.first_name)) {
      nextErrors.first_name =
        "Use letters, spaces, apostrophes, or hyphens only.";
    }
    if (!normalized.last_name) {
      nextErrors.last_name = "Enter the last name.";
    } else if (!NAME_PATTERN.test(normalized.last_name)) {
      nextErrors.last_name =
        "Use letters, spaces, apostrophes, or hyphens only.";
    }
    if (!/^\d{10}$/.test(phoneDigits)) {
      nextErrors.phone = "Enter exactly 10 digits after +91.";
    }
    if (!normalized.email) {
      nextErrors.email = "Enter the email address.";
    } else if (!EMAIL_PATTERN.test(normalized.email)) {
      nextErrors.email = "Enter a valid email, e.g. student@gmail.com.";
    }
    if (!normalized.date_of_birth) {
      nextErrors.date_of_birth = "Enter the student's date of birth.";
    } else if (normalized.date_of_birth > new Date().toISOString().slice(0, 10)) {
      nextErrors.date_of_birth = "Date of birth cannot be in the future.";
    }
    if (!["Male", "Female", "Other"].includes(normalized.gender)) {
      nextErrors.gender = "Select a gender.";
    }
    if (!normalized.course) {
      nextErrors.course = "Enter the student's course.";
    }
    if (!normalized.address) {
      nextErrors.address = "Enter the student's address.";
    }
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit(normalized);
    } catch (reason: unknown) {
      setFormError(
        reason instanceof Error ? reason.message : "Unable to save this record."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="student-form" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="first_name">First name</label>
          <input
            id="first_name"
            name="first_name"
            autoComplete="given-name"
            required
            maxLength={100}
            value={form.first_name}
            aria-invalid={Boolean(errors.first_name)}
            aria-describedby={errors.first_name ? "first-name-error" : undefined}
            onChange={(event) => updateField("first_name", event.target.value)}
          />
          {errors.first_name && (
            <p className="field-error" id="first-name-error">
              {errors.first_name}
            </p>
          )}
        </div>
        <div className="field">
          <label htmlFor="last_name">Last name</label>
          <input
            id="last_name"
            name="last_name"
            autoComplete="family-name"
            required
            maxLength={100}
            value={form.last_name}
            aria-invalid={Boolean(errors.last_name)}
            aria-describedby={errors.last_name ? "last-name-error" : undefined}
            onChange={(event) => updateField("last_name", event.target.value)}
          />
          {errors.last_name && (
            <p className="field-error" id="last-name-error">
              {errors.last_name}
            </p>
          )}
        </div>
        <div className="field">
          <label htmlFor="phone">Phone number</label>
          <div className="phone-input">
            <span className="phone-prefix" aria-hidden="true">
              +91
            </span>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="10-digit number"
              required
              value={form.phone}
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? "phone-error" : "phone-hint"}
              onChange={(event) =>
                updateField("phone", toLocalDigits(event.target.value))
              }
            />
          </div>
          {errors.phone ? (
            <p className="field-error" id="phone-error">
              {errors.phone}
            </p>
          ) : (
            <p className="field-hint" id="phone-hint">
              Enter exactly 10 digits after +91.
            </p>
          )}
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="student@gmail.com"
            required
            maxLength={254}
            value={form.email}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            onChange={(event) => updateField("email", event.target.value)}
          />
          {errors.email && (
            <p className="field-error" id="email-error">{errors.email}</p>
          )}
        </div>
        <div className="field">
          <label htmlFor="date_of_birth">Date of birth</label>
          <input
            id="date_of_birth"
            name="date_of_birth"
            type="date"
            autoComplete="bday"
            required
            max={new Date().toISOString().slice(0, 10)}
            value={form.date_of_birth}
            aria-invalid={Boolean(errors.date_of_birth)}
            aria-describedby={errors.date_of_birth ? "date-of-birth-error" : undefined}
            onChange={(event) => updateField("date_of_birth", event.target.value)}
          />
          {errors.date_of_birth && (
            <p className="field-error" id="date-of-birth-error">
              {errors.date_of_birth}
            </p>
          )}
        </div>
        <div className="field">
          <label htmlFor="gender">Gender</label>
          <select
            id="gender"
            name="gender"
            required
            value={form.gender}
            aria-invalid={Boolean(errors.gender)}
            aria-describedby={errors.gender ? "gender-error" : undefined}
            onChange={(event) => updateField("gender", event.target.value)}
          >
            <option value="">Select gender</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Other">Other</option>
          </select>
          {errors.gender && (
            <p className="field-error" id="gender-error">{errors.gender}</p>
          )}
        </div>
        <div className="field">
          <label htmlFor="course">Course</label>
          <input
            id="course"
            name="course"
            required
            maxLength={100}
            value={form.course}
            aria-invalid={Boolean(errors.course)}
            aria-describedby={errors.course ? "course-error" : undefined}
            onChange={(event) => updateField("course", event.target.value)}
          />
          {errors.course && (
            <p className="field-error" id="course-error">{errors.course}</p>
          )}
        </div>
        <div className="field field-full">
          <label htmlFor="address">Address</label>
          <textarea
            id="address"
            name="address"
            autoComplete="street-address"
            required
            maxLength={500}
            rows={3}
            value={form.address}
            aria-invalid={Boolean(errors.address)}
            aria-describedby={errors.address ? "address-error" : undefined}
            onChange={(event) => updateField("address", event.target.value)}
          />
          {errors.address && (
            <p className="field-error" id="address-error">{errors.address}</p>
          )}
        </div>
      </div>
      {formError && (
        <p className="alert" role="alert">
          {formError}
        </p>
      )}
      <div className="form-actions">
        <button className="button button-primary" type="submit" disabled={submitting}>
          {submitting ? "Saving…" : submitLabel}
        </button>
        <Link className="button button-secondary" href="/students">
          Cancel
        </Link>
      </div>
    </form>
  );
}