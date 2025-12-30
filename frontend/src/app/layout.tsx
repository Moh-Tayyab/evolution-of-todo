// @spec: specs/002-fullstack-web-app/plan.md
// Root layout with providers

import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Todo App",
  description: "Manage your personal todo tasks",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
