"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, type Student } from "@/lib/api";

export default function StudentDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    apiFetch<Student>(`/api/students/${params.id}`)
      .then((data) => {
        if (active) setStudent(data);
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(
            reason instanceof Error ? reason.message : "Could not load this record."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [params.id]);

  async function deleteStudent() {
    if (!window.confirm("Delete this student record? This cannot be undone.")) {
      return;
    }
    try {
      await apiFetch<void>(`/api/students/${params.id}`, { method: "DELETE" });
      router.push("/students?success=deleted");
    } catch (reason: unknown) {
      setError(
        reason instanceof Error ? reason.message : "Could not delete this record."
      );
    }
  }

  if (loading) return <p className="loading-state">Loading student record…</p>;
  if (error && !student) {
    return (
      <div className="page-stack">
        <p className="alert" role="alert">{error}</p>
        <Link className="text-link" href="/students">Back to records</Link>
      </div>
    );
  }
  if (!student) return null;

  return (
    <section className="card">
      <p className="eyebrow">STUDENT RECORD</p>
      <h1>{student.first_name} {student.last_name}</h1>
      <dl className="detail-list">
        <div className="detail-item">
          <dt>First name</dt>
          <dd>{student.first_name}</dd>
        </div>
        <div className="detail-item">
          <dt>Last name</dt>
          <dd>{student.last_name}</dd>
        </div>
        <div className="detail-item">
          <dt>Phone number</dt>
          <dd>{student.phone}</dd>
        </div>
        <div className="detail-item">
          <dt>Email</dt>
          <dd>{student.email ?? "—"}</dd>
        </div>
        <div className="detail-item">
          <dt>Date of birth</dt>
          <dd>{student.date_of_birth ?? "—"}</dd>
        </div>
        <div className="detail-item">
          <dt>Gender</dt>
          <dd>{student.gender ?? "—"}</dd>
        </div>
        <div className="detail-item">
          <dt>Course</dt>
          <dd>{student.course ?? "—"}</dd>
        </div>
        <div className="detail-item detail-item-full">
          <dt>Address</dt>
          <dd>{student.address ?? "—"}</dd>
        </div>
        <div className="detail-item">
          <dt>Record ID</dt>
          <dd>{student.id}</dd>
        </div>
      </dl>
      {error && <p className="alert" role="alert">{error}</p>}
      <div className="form-actions">
        <Link className="button button-primary" href={`/students/${student.id}/edit`}>
          Edit student
        </Link>
        <button className="button button-danger" type="button" onClick={deleteStudent}>
          Delete student
        </button>
        <Link className="button button-secondary" href="/students">
          Back to records
        </Link>
      </div>
    </section>
  );
}
