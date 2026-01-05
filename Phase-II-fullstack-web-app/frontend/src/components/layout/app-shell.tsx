"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

/**
 * @spec: Dashboard App Shell Component
 * @description: Main layout wrapper for authenticated pages
 * @feature: FR-003 - Task viewing functionality
 */

export interface AppShellProps {
  children: ReactNode;
  className?: string;
  header?: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
  variant?: "dashboard" | "landing" | "auth";
}

/**
 * AppShell - Main layout wrapper with consistent structure
 *
 * Features:
 * - Responsive layout with mobile-first approach
 * - Framer Motion animations for smooth transitions
 * - Variants for different page types
 * - Optional header, sidebar, and footer
 */
export function AppShell({
  children,
  className,
  header,
  sidebar,
  footer,
  variant = "dashboard",
}: AppShellProps) {
  const variants = {
    dashboard: "min-h-screen bg-gray-50",
    landing: "min-h-screen bg-white",
    auth: "min-h-screen bg-gray-100",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(variants[variant], className)}
    >
      {/* Header */}
      <AnimatePresence mode="wait">
        {header && (
          <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="sticky top-0 z-50"
          >
            {header}
          </motion.header>
        )}
      </AnimatePresence>

      {/* Main content area with optional sidebar */}
      <div className={cn("flex", variant === "dashboard" ? "flex-col lg:flex-row" : "")}>
        {/* Sidebar */}
        <AnimatePresence mode="wait">
          {sidebar && (
            <motion.aside
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className={cn(
                "w-full lg:w-64 lg:shrink-0",
                variant === "dashboard" ? "lg:border-r lg:bg-white" : ""
              )}
            >
              {sidebar}
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main content */}
        <motion.main
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className={cn(
            "flex-1",
            variant === "dashboard" ? "p-4 lg:p-6" : "",
            variant === "landing" ? "" : "",
            variant === "auth" ? "flex items-center justify-center" : ""
          )}
        >
          {children}
        </motion.main>
      </div>

      {/* Footer */}
      <AnimatePresence mode="wait">
        {footer && (
          <motion.footer
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {footer}
          </motion.footer>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * DashboardShell - Pre-configured AppShell for dashboard pages
 */
export function DashboardShell({
  children,
  header,
  sidebar,
}: {
  children: ReactNode;
  header?: ReactNode;
  sidebar?: ReactNode;
}) {
  return (
    <AppShell variant="dashboard" header={header} sidebar={sidebar}>
      {children}
    </AppShell>
  );
}

/**
 * LandingShell - Pre-configured AppShell for landing page
 */
export function LandingShell({
  children,
  header,
  footer,
}: {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <AppShell variant="landing" header={header} footer={footer}>
      {children}
    </AppShell>
  );
}

/**
 * AuthShell - Pre-configured AppShell for authentication pages
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return <AppShell variant="auth">{children}</AppShell>;
}
