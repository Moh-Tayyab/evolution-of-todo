// @spec: specs/002-fullstack-web-app/plan.md
// @spec: specs/002-fullstack-web-app/spec.md
// Next.js API route handler for user registration
// Proxies requests to FastAPI backend to avoid CORS issues

import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "https://m-tayyab-evolution-of-todo-backend.hf.space";

/**
 * POST /api/auth/signup
 * Proxy signup request to FastAPI backend and automatically get JWT token
 *
 * Request body: { email: string, password: string, full_name?: string }
 * Response: { access_token: string, token_type: string, ...user data }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Call backend signup endpoint which now returns JWT token directly
    const signupResponse = await fetch(`${FASTAPI_URL}/api/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
        full_name: body.name || body.full_name || "",
      }),
    });

    if (!signupResponse.ok) {
      const errorData = await signupResponse.json().catch(() => ({ detail: "Signup failed" }));
      return NextResponse.json(
        { detail: errorData.detail || "Signup failed" },
        { status: signupResponse.status }
      );
    }

    // Backend now returns user data + JWT token in one call
    const signupData = await signupResponse.json();

    // Return complete response with user data and JWT token
    return NextResponse.json(signupData);
  } catch (error: any) {
    console.error("Signup proxy error:", error);
    // Return more detailed error for debugging
    return NextResponse.json(
      {
        detail: "Internal server error",
        error: error?.message || String(error),
        stack: error?.stack || undefined,
      },
      { status: 500 }
    );
  }
}
// Deployment trigger: Tue Feb  3 02:31:25 PKT 2026

// Rebuild with env vars: Tue Feb  3 02:43:52 PKT 2026
// Deployment trigger after root dir fix: Tue Feb  3 03:01:24 PKT 2026
