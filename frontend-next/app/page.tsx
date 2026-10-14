"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

type Student = {
  id?: number;
  first_name?: string;
  last_name?: string;
  course?: string;
};

export default function HomePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadStudents() {
      try {
        const response = await fetch(`${API_URL}/students`);

        if (!response.ok) {
          throw new Error("Unable to load student records.");
        }

        const data = await response.json();
        const records = Array.isArray(data)
          ? data
          : Array.isArray(data.students)
            ? data.students
            : [];

        if (active) {
          setStudents(records);
          setError("");
        }
      } catch {
        if (active) {
          setError("Backend connection check pannunga.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadStudents();

    return () => {
      active = false;
    };
  }, []);

  const totalCourses = new Set(
    students
      .map((student) => student.course?.trim().toLowerCase())
      .filter(Boolean)
  ).size;

  const stats = [
    {
      title: "Total Students",
      value: loading ? "..." : error ? "—" : String(students.length),
      description: "Registered student records",
      icon: "♙",
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "Total Courses",
      value: loading ? "..." : error ? "—" : String(totalCourses),
      description: "Unique courses registered",
      icon: "▤",
      color: "bg-emerald-50 text-emerald-700",
    },
  ];

  const actions = [
    {
      title: "Add Student",
      description: "Register a new student with personal and academic details.",
      href: "/add-student",
      icon: "＋",
      action: "Register student",
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "Student Records",
      description: "View and manage the student information in your system.",
      href: "/students",
      icon: "▤",
      action: "Explore records",
      color: "bg-indigo-50 text-indigo-700",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-900 sm:px-8 sm:py-10 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-blue-700">
              STUDENT MANAGEMENT SYSTEM
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Dashboard Overview
            </h1>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Monitor your student information at a glance.
            </p>
          </div>

          <Link
            href="/add-student"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-700/15 transition hover:-translate-y-0.5 hover:bg-blue-800"
          >
            <span className="text-xl">＋</span>
            Add Student
          </Link>
        </header>

        <section className="relative mb-8 overflow-hidden rounded-3xl bg-slate-950 p-7 text-white shadow-xl sm:p-10">
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-blue-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              YOUR STUDENT PORTAL
            </span>

            <h2 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
              Every student.
              <span className="block text-blue-400">
                One organized space.
              </span>
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
              Keep student information organized, monitor your records,
              and access essential details from one simple dashboard.
            </p>
          </div>
        </section>

        <section className="mb-9">
          <div className="mb-4">
            <h2 className="text-xl font-bold">Overview</h2>
            <p className="mt-1 text-sm text-slate-500">
              A quick summary of your registered students and courses.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {stats.map((stat) => (
              <div
                key={stat.title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md sm:p-7"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      {stat.title}
                    </p>
                    <p className="mt-3 text-4xl font-bold tracking-tight">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${stat.color}`}
                  >
                    {stat.icon}
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-500">
                  {stat.description}
                </p>
              </div>
            ))}
          </div>

          {error && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {error} Counts display aaga backend running-la irukkanum.
            </p>
          )}
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold">Quick Actions</h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose an action to continue.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {actions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/60 sm:p-7"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl transition group-hover:bg-blue-700 group-hover:text-white ${action.color}`}
                  >
                    {action.icon}
                  </div>
                  <span className="text-xl text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-700">
                    ↗
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-bold">{action.title}</h3>
                <p className="mt-2 min-h-12 max-w-md text-sm leading-6 text-slate-500">
                  {action.description}
                </p>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  <span className="text-sm font-semibold text-blue-700">
                    {action.action} →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5 text-xs text-slate-500">
          <p>Student Management System</p>
          <p>Organized. Simple. Efficient.</p>
        </footer>
      </div>
    </main>
  );
}
