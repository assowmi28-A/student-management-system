import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Student Management System",
  description: "Manage your student records easily.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-100 text-slate-900">
        <div className="flex min-h-screen">
          <aside className="w-64 shrink-0 bg-slate-900 p-4 text-white">
            <h2 className="mb-6 px-4 text-xl font-bold">Student MS</h2>

            <nav className="space-y-2">
              <Link
                href="/"
                className="block rounded-xl px-4 py-3 hover:bg-slate-800"
              >
                ▦ Dashboard
              </Link>

              <Link
                href="/add-student"
                className="block rounded-xl px-4 py-3 hover:bg-slate-800"
              >
                ＋ Add Student
              </Link>

              <Link
                href="/students"
                className="block rounded-xl px-4 py-3 hover:bg-slate-800"
              >
                ☷ Student Records
              </Link>
            </nav>
          </aside>

          <main className="flex-1 p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}