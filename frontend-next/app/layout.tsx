import "./globals.css";
import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Student Management System",
  description: "Manage student records efficiently",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// Extract the API origin at build time so the browser can open the TCP/TLS
// connection early — reduces perceived cold-start delay on Render free tier.
const API_ORIGIN = (() => {
  try {
    const raw = process.env.NEXT_PUBLIC_API_URL || "";
    if (!raw) return null;
    return new URL(raw).origin;
  } catch {
    return null;
  }
})();

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {API_ORIGIN && (
          <>
            <link rel="dns-prefetch" href={API_ORIGIN} />
            <link rel="preconnect" href={API_ORIGIN} crossOrigin="anonymous" />
          </>
        )}
      </head>
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
