"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Status = "checking" | "connected" | "unreachable";

export default function HomePage() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    apiFetch<{ status: string }>("/api/health")
      .then(() => setStatus("connected"))
      .catch(() => setStatus("unreachable"));
  }, []);

  return (
    <section className="card">
      <h1>Student Management System</h1>
      <p>Project setup complete. Student features will be added next.</p>
      <p>
        Backend API: <strong className={`status status-${status}`}>{status}</strong>
      </p>
    </section>
  );
}
