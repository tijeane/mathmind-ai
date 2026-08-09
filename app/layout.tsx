import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MathMind",
  description: "AI-powered math tutoring for K-8 students, parents, teachers, and schools.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
