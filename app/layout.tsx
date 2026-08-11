import type { Metadata } from "next";
import { AppHeader } from "@/components/layout/AppHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "MathMind",
  description: "AI-powered math tutoring for K-8 students, parents, teachers, and schools.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-sans">
        <AppHeader />
        {children}
      </body>
    </html>
  );
}
