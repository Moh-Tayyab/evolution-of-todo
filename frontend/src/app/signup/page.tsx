// @spec: specs/002-fullstack-web-app/plan.md
// Sign up page

"use client";

import Link from "next/link";
import SignUpForm from "@/components/auth/SignUpForm";

export default function SignUpPage() {
  const handleSuccess = () => {
    window.location.href = "/dashboard";
  };

  const handleError = (error: string) => {
    // You might want to use a toast here instead of alert in production
    alert(`Error: ${error}`);
  };

  return (
    <div className="min-h-screen flex">
      {/* Brand Side */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary-500 to-primary-700 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10 text-white max-w-lg">
          <h1 className="text-5xl font-bold mb-6">Join Us</h1>
          <p className="text-xl text-primary-100">
            Create an account and start managing your tasks with clarity and style.
          </p>
        </div>
        {/* Decorative Circles */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-primary-50">
        <div className="w-full max-w-md">
          <div className="glass-card p-8 rounded-2xl shadow-xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-900">
                Create Account
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/signin"
                  className="text-primary-600 hover:text-primary-700 font-semibold hover:underline transition-all"
                >
                  Sign in
                </Link>
              </p>
            </div>
            <SignUpForm onSuccess={handleSuccess} onError={handleError} />
          </div>
        </div>
      </div>
    </div>
  );
}
