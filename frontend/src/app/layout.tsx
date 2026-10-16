import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Student Management System",
  description: "College mini project: manage student records.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="container">Student Management System</div>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
