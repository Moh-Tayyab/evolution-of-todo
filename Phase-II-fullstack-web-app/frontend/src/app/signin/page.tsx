// @spec: specs/002-fullstack-web-app/spec.md
// @spec: specs/002-fullstack-web-app/plan.md
// Sign in page

"use client";

import Link from "next/link";
import SignInForm from "@/components/auth/SignInForm";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex">
      {/* Brand Side */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary-500 to-primary-700 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10 text-white max-w-lg">
          <h1 className="text-5xl font-bold mb-6">Welcome Back</h1>
          <p className="text-xl text-primary-100">
            Organize your life with elegance. Sign in to access your tasks and stay productive.
          </p>
        </div>
        {/* Decorative Circles */}
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-primary-50">
        <div className="w-full max-w-md">
          <div className="glass-card p-8 rounded-2xl shadow-xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-900">
                Sign In
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="text-primary-600 hover:text-primary-700 font-semibold hover:underline transition-all"
                >
                  Sign up
                </Link>
              </p>
            </div>
            <SignInForm />
          </div>
        </div>
      </div>
    </div>
  );
}
