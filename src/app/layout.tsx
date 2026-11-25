import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClearAir | Winter Smog & Urban Air Quality Assistant",
  description:
    "GenAI-powered assistant helping families and communities navigate winter smog with low-emission routines, indoor air hacks, and clear impact insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
