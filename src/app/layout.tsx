import type { Metadata } from "next";
import { AppProviders } from "@/components/providers/QueryProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "ALGOTHON | Collaborative Project Workspace",
  description:
    "Real-time team project management with Optimistic Concurrency Control, fractional indexing, and live presence sync.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#09090b] text-zinc-100 selection:bg-blue-600/30">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
