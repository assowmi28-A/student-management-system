"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StudentForm from "../../StudentForm";
import { apiFetch, type Student, type StudentInput } from "@/lib/api";

export default function EditStudentPage({
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
    apiFetch<Student>(`/students/${params.id}`)
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

  async function updateStudent(value: StudentInput) {
    await apiFetch<Student>(`/students/${params.id}`, {
      method: "PUT",
      body: JSON.stringify(value),
    });
    router.push("/students?success=updated");
    router.refresh();
  }

  if (loading) return <p className="loading-state">Loading student record…</p>;
  if (error) return <p className="alert" role="alert">{error}</p>;
  if (!student) return null;

  return (
    <section className="card form-card">
      <p className="eyebrow">STUDENT RECORDS</p>
      <h1>Edit student</h1>
      <p className="muted">Update {student.first_name}&apos;s record.</p>
      <StudentForm
        allowEmptyFields
        initialValue={{
          first_name: student.first_name,
          last_name: student.last_name,
          phone: student.phone,
          email: student.email ?? "",
          date_of_birth: student.date_of_birth ?? "",
          age: student.age,
          gender: student.gender ?? "",
          blood_group: student.blood_group ?? "",
          course: student.course ?? "",
          address: student.address ?? "",
        }}
        submitLabel="Save changes"
        onSubmit={updateStudent}
      />
    </section>
  );
}
