"use client";

import { useRouter } from "next/navigation";
import StudentForm from "../StudentForm";
import { apiFetch, type StudentInput } from "@/lib/api";

export default function NewStudentPage() {
  const router = useRouter();

  async function createStudent(student: StudentInput) {
    await apiFetch("/students", {
      method: "POST",
      body: JSON.stringify(student),
    });
    router.push("/students?success=created");
    router.refresh();
  }

  return (
    <section className="card form-card">
      <p className="eyebrow">STUDENT RECORDS</p>
      <h1>Add student</h1>
      <p className="muted">Enter all required student details.</p>
      <StudentForm submitLabel="Save student" onSubmit={createStudent} />
    </section>
  );
}
