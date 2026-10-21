"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type IconName = "dashboard" | "add" | "students" | "reports" | "search" | "menu" | "close" | "school";

function Icon({ name }: { name: IconName }) {
  const shared = {
    "aria-hidden": true as const,
    fill: "none",
    height: 20,
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
    viewBox: "0 0 24 24",
    width: 20,
  };

  switch (name) {
    case "dashboard":
      return <svg {...shared}><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="5" rx="1.5" /><rect x="13" y="10" width="8" height="11" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /></svg>;
    case "add":
      return <svg {...shared}><circle cx="12" cy="8" r="4" /><path d="M5 21a7 7 0 0 1 14 0M19 8v6m-3-3h6" /></svg>;
    case "students":
      return <svg {...shared}><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m16 0v-2a4 4 0 0 0-3-3.87M14 3.13a4 4 0 0 1 0 7.75" /><circle cx="10" cy="7" r="4" /></svg>;
    case "reports":
      return <svg {...shared}><path d="M4 19V5m0 14h17M8 15l4-4 3 2 5-6" /><path d="M17 7h3v3" /></svg>;
    case "search":
      return <svg {...shared}><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></svg>;
    case "menu":
      return <svg {...shared}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
    case "close":
      return <svg {...shared}><path d="m6 6 12 12M18 6 6 18" /></svg>;
    case "school":
      return <svg {...shared}><path d="m2 9 10-5 10 5-10 5L2 9Z" /><path d="M6 11v5c3.5 3 8.5 3 12 0v-5m4-2v6" /></svg>;
  }
}

const navigation: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "Dashboard", icon: "dashboard" },
  { href: "/students/new", label: "Add Student", icon: "add" },
  { href: "/students", label: "Students", icon: "students" },
  { href: "/reports", label: "Reports", icon: "reports" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");

  function searchStudents() {
    const query = globalSearch.trim();
    const destination = query
      ? `/students?search=${encodeURIComponent(query)}`
      : "/students";
    if (pathname === "/students") {
      window.dispatchEvent(new CustomEvent("student-search", { detail: query }));
    }
    router.push(destination);
    setMenuOpen(false);
  }

  return (
    <div className="app-shell">
      {menuOpen && (
        <button
          className="sidebar-scrim"
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside className={`sidebar${menuOpen ? " sidebar-open" : ""}`}>
        <Link className="sidebar-brand" href="/" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark"><Icon name="school" /></span>
          <span><strong>Student</strong><small>MANAGEMENT</small></span>
        </Link>
        <p className="sidebar-section-label">WORKSPACE</p>
        <nav className="sidebar-nav" aria-label="Main navigation">
          {navigation.map((item) => {
            const active = item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link${active ? " sidebar-link-active" : ""}`}
                aria-current={active ? "page" : undefined}
                onClick={() => setMenuOpen(false)}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <span className="sidebar-footer-dot" />
          <span>Student records workspace</span>
        </div>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <button
            className="icon-button menu-toggle"
            type="button"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Icon name={menuOpen ? "close" : "menu"} />
          </button>
          <form
            className="global-search"
            role="search"
            onSubmit={(event: FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              searchStudents();
            }}
          >
            <Icon name="search" />
            <input
              aria-label="Search students"
              placeholder="Search students by name, email or phone..."
              value={globalSearch}
              onChange={(event) => setGlobalSearch(event.target.value)}
            />
            <button
              className="global-search-submit"
              type="button"
              aria-label="Submit student search"
              onClick={searchStudents}
            >
              <Icon name="search" />
            </button>
          </form>
        </header>
        <main className="content-area">{children}</main>
      </div>
    </div>
  );
}