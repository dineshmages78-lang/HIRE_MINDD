import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "Hiremind — Intelligent Recruitment and Placement System",
  description:
    "An Agentic AI-Based Intelligent Recruitment and Placement System for Automated Resume Screening, Adaptive Assessment, and Interview Evaluation with Polyglot Data Architecture.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased bg-slate-50/50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
