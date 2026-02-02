// @spec: specs/002-fullstack-web-app/plan.md
// Authentication utilities supporting both Better Auth and JWT (FastAPI backend)

import { createAuthClient } from "better-auth/react";

/**
 * Better Auth client instance configured for JWT-based authentication.
 *
 * JWT tokens are issued by Better Auth and stored in secure cookies.
 * The FastAPI backend verifies these tokens using the shared BETTER_AUTH_SECRET.
 *
 * Token expiration: 7 days (configured in auth-server.ts)
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

// Local storage keys for JWT token from FastAPI backend
const JWT_TOKEN_KEY = 'fastapi_jwt_token';
const USER_ID_KEY = 'fastapi_user_id';

/**
 * Get the current authenticated user's ID.
 * Tries FastAPI JWT token from localStorage first, then falls back to Better Auth session.
 *
 * @returns User ID if authenticated, null otherwise
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    // First, try to get user ID from localStorage (FastAPI JWT)
    if (typeof window !== 'undefined') {
      const localUserId = localStorage.getItem(USER_ID_KEY);
      console.log("[getCurrentUserId] localStorage userId:", localUserId);
      if (localUserId) {
        return localUserId;
      }
    }

    // Fallback to Better Auth session
    const session = await authClient.getSession();
    if (session?.data?.user?.id) {
      console.log("[getCurrentUserId] Better Auth userId:", session.data.user.id);
      return session.data.user.id;
    }
    console.log("[getCurrentUserId] No userId found");
    return null;
  } catch (error) {
    console.error("Failed to get current user ID:", error);
    return null;
  }
}

/**
 * Get the current user from the session.
 * Uses Next.js API route proxy to avoid CORS issues.
 *
 * @returns User object if authenticated, null otherwise
 */
export async function getCurrentUser(): Promise<any> {
  try {
    // Get user from FastAPI backend via Next.js API route proxy
    const token = await getToken();
    if (token) {
      const API_URL = process.env.NEXT_PUBLIC_API_URL ||
        (typeof window !== 'undefined' ? window.location.origin : "http://localhost:3000");
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        return userData;
      }
    }

    // Fallback to Better Auth session
    const session = await authClient.getSession();
    return session?.data?.user || null;
  } catch (error) {
    console.error("Failed to get current user:", error);
    return null;
  }
}

/**
 * Get the current JWT token for API requests.
 * Returns JWT token from localStorage if available.
 *
 * @returns JWT token if authenticated, null otherwise
 */
export async function getToken(): Promise<string | null> {
  try {
    // Return JWT token from localStorage (from FastAPI login)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(JWT_TOKEN_KEY);
      console.log("[getToken] JWT token from localStorage:", token ? "exists" : "missing");
      if (token) {
        return token;
      }
    }
    console.log("[getToken] No JWT token found, returning null");
    return null;
  } catch (error) {
    console.error("Failed to get JWT token:", error);
    return null;
  }
}

/**
 * Get the current session for API requests.
 *
 * @returns Session data if authenticated, null otherwise
 */
export async function getSession(): Promise<any> {
  try {
    const session = await authClient.getSession();
    return session?.data || null;
  } catch (error) {
    console.error("Failed to get session:", error);
    return null;
  }
}

/**
 * Check if user is authenticated.
 *
 * @returns true if authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  const userId = await getCurrentUserId();
  return userId !== null;
}

/**
 * Ensure JWT token is available. If not, return false.
 * This handles cases where Better Auth session exists but FastAPI JWT is missing.
 *
 * @returns true if token exists, false otherwise
 */
export async function ensureAuthToken(): Promise<boolean> {
  const token = await getToken();
  if (token) {
    return true; // Token exists
  }

  // Token missing - check if we have Better Auth session
  const session = await authClient.getSession();
  if (!session?.data?.user) {
    return false; // No session at all
  }

  // We have a Better Auth session but no JWT token
  // This can happen if user was already signed in with Better Auth
  // In a real app, you'd call a refresh endpoint here
  // For now, return false to trigger re-authentication
  return false;
}

/**
 * Sign in with email and password using Next.js API route proxy.
 *
 * The Next.js API route proxies to FastAPI backend server-side,
 * avoiding CORS issues that occur with direct browser-to-backend calls.
 *
 * @param email User email
 * @param password User password
 * @returns Session data or throws error
 */
export async function signIn(email: string, password: string) {
  // Use Next.js API route instead of direct FastAPI call
  // This avoids CORS issues by staying on same origin
  const API_URL = process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== 'undefined' ? window.location.origin : "http://localhost:3000");

  console.log("[signIn] Calling login API...");

  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  console.log("[signIn] Response status:", response.status);

  if (!response.ok) {
    const error = await response.json();
    console.error("[signIn] Error response:", error);
    throw new Error(error.detail || "Login failed");
  }

  const data = await response.json();
  console.log("[signIn] Response data:", JSON.stringify(data));
  console.log("[signIn] Response has access_token:", !!data.access_token);

  // Store JWT token and user ID in localStorage
  const token = data.access_token;
  console.log("[signIn] Storing JWT token in localStorage...");
  localStorage.setItem(JWT_TOKEN_KEY, token);

  // Decode JWT to get user ID
  const payload = JSON.parse(atob(token.split('.')[1]));
  const userId = payload.sub;
  console.log("[signIn] Decoded userId from JWT:", userId);
  localStorage.setItem(USER_ID_KEY, userId);

  console.log("[signIn] Token stored, verifying...");
  const verifyToken = localStorage.getItem(JWT_TOKEN_KEY);
  console.log("[signIn] Verification - token in localStorage:", !!verifyToken);

  return data;
}

/**
 * Sign up with email and password using Next.js API route proxy.
 *
 * The Next.js API route proxies to FastAPI backend server-side,
 * avoiding CORS issues that occur with direct browser-to-backend calls.
 *
 * @param email User email
 * @param password User password
 * @param name User name (optional)
 * @returns Session data or throws error
 */
export async function signUp(email: string, password: string, name?: string) {
  // Use Next.js API route instead of direct FastAPI call
  // This avoids CORS issues by staying on same origin
  const API_URL = process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== 'undefined' ? window.location.origin : "http://localhost:3000");

  console.log("[Auth signUp] Calling signup API...");

  const response = await fetch(`${API_URL}/api/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      full_name: name || "",
    }),
  });

  console.log("[Auth signUp] Response status:", response.status);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Signup failed");
  }

  const data = await response.json();
  console.log("[Auth signUp] Response data has access_token:", !!data.access_token);

  // The signup route now returns the JWT token directly
  // Store JWT token and user ID in localStorage
  if (data.access_token) {
    const token = data.access_token;
    console.log("[Auth signUp] Storing JWT token in localStorage...");
    localStorage.setItem(JWT_TOKEN_KEY, token);

    // Decode JWT to get user ID
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.sub;
    console.log("[Auth signUp] Decoded userId from JWT:", userId);
    localStorage.setItem(USER_ID_KEY, userId);

    console.log("[Auth signUp] Token stored, verifying...");
    const verifyToken = localStorage.getItem(JWT_TOKEN_KEY);
    console.log("[Auth signUp] Verification - token in localStorage:", !!verifyToken);

    return data;
  }

  // Fallback: if no token in response, sign in
  console.log("[Auth signUp] No token in response, falling back to signIn");
  return signIn(email, password);
}

/**
 * Sign out the current user.
 *
 * @returns void
 */
export async function signOut() {
  // Clear JWT token and user ID from localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem(JWT_TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
  }

  // Also sign out from Better Auth
  return authClient.signOut();
}

/**
 * Make an authenticated API request to the FastAPI backend.
 * Uses JWT token from localStorage for authentication.
 *
 * Note: For task/todo endpoints, create Next.js API route proxies
 * to avoid CORS issues. Use authenticatedFetch for calls that
 * go through Next.js API routes.
 *
 * @param endpoint API endpoint path (e.g., "/api/user_id/tasks")
 * @param options Fetch options
 * @returns Fetch response
 */
export async function authenticatedFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  // Use Next.js API base URL for authentication calls
  // For other endpoints, use the Next.js API proxy pattern
  const API_URL = process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== 'undefined' ? window.location.origin : "http://localhost:3000");

  // Get JWT token from localStorage
  const token = await getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  // Add Authorization header if we have a token
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include", // Include cookies for Better Auth session
  });
}
