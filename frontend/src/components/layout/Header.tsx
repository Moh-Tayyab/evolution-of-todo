// @spec: specs/002-fullstack-web-app/plan.md
// Header component with navigation

"use client";

import Link from "next/link";
import SignOutButton from "@/components/auth/SignOutButton";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 glass border-b border-primary-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:shadow-lg transition-all duration-300">
              T
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-900">
              Todo
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <SignOutButton />
          </div>
        </div>
      </div>
    </header>
  );
}
