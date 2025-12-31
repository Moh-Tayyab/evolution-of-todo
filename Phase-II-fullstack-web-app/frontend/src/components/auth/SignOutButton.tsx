// @spec: specs/002-fullstack-web-app/spec.md
// @spec: specs/002-fullstack-web-app/plan.md
// Sign out button component

"use client";

import { useState } from "react";
import { signOut } from "@/lib/auth";

export default function SignOutButton() {
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleClick = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isSigningOut}
      className="inline-flex items-center px-4 py-2 border border-primary-200 shadow-sm text-sm font-medium rounded-xl text-primary-700 bg-white hover:bg-primary-50 hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
    >
      {isSigningOut ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Signing out...
        </>
      ) : (
        "Sign Out"
      )}
    </button>
  );
}
