// Better Auth Client Configuration

"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/auth",
});

// Sign up with email
export async function signUpEmail(email: string, password: string, name: string) {
  const result = await authClient.signUp.email({
    email,
    password,
    name,
  });
  return result;
}

// Sign in with email
export async function signInEmail(email: string, password: string) {
  const result = await authClient.signIn.email({
    email,
    password,
  });
  return result;
}

// Sign in with social provider
export async function signInSocial(provider: "github" | "google") {
  await authClient.signIn.social({
    provider,
    callbackURL: "/dashboard",
  });
}

// Sign out
export async function signOut() {
  await authClient.signOut();
}

// Get current session
export async function getSession() {
  const session = await authClient.getSession();
  return session;
}
