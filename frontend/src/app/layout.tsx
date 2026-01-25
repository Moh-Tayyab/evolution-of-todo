// @spec: specs/002-fullstack-web-app/spec.md
// @spec: specs/002-fullstack-web-app/plan.md
// Root layout for Phase III AI Chatbot application

import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeScript } from "@/components/theme-script";
import { GSAPProvider } from "@/lib/animations/gsap-provider";
import { ReducedMotionProvider } from "@/components/animations/reduced-motion-provider";

export const metadata: Metadata = {
  title: "TaskFlow Pro | Professional Task Management",
  description: "A premium todo application with modern UI, dark mode, and professional task management features",
  keywords: ["todo", "task management", "productivity", "dashboard"],
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <ThemeScript />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ReducedMotionProvider>
          <GSAPProvider>
            {children}
            <Toaster />
          </GSAPProvider>
        </ReducedMotionProvider>
      </body>
    </html>
  );
}
