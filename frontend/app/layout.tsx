import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Prozync OfficeOS",
    template: "%s · OfficeOS",
  },
  description: "Internal operating system for Prozync Innovations — manage projects, tasks, people, and everything in between.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts are imported via globals.css @import */}
      </head>
      <body className="font-sans antialiased bg-surface min-h-screen">
        {children}
      </body>
    </html>
  );
}
