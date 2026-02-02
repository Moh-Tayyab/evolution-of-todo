// @spec: specs/002-fullstack-web-app/plan.md
// @spec: specs/002-fullstack-web-app/spec.md
// Next.js API route handler for authentication
// Proxies requests to FastAPI backend to avoid CORS issues
// This runs server-side, eliminating browser cross-origin restrictions

import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "https://m-tayyab-evolution-of-todo-backend.hf.space";

/**
 * POST /api/auth/login
 * Proxy login request to FastAPI backend
 *
 * Request body: { email: string, password: string }
 * Response: { access_token: string, token_type: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Forward the request to FastAPI backend
    const response = await fetch(`${FASTAPI_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        username: body.email,
        password: body.password,
      }),
    });

    // Log for debugging
    console.log("FastAPI login response status:", response.status);
    console.log("FastAPI login response type:", response.headers.get("content-type"));

    // Get response text first for better error handling
    const responseText = await response.text();

    if (!response.ok) {
      console.error("FastAPI login error response:", responseText);
      try {
        const data = JSON.parse(responseText);
        return NextResponse.json(
          { detail: data.detail || "Login failed" },
          { status: response.status }
        );
      } catch {
        return NextResponse.json(
          { detail: responseText || "Login failed" },
          { status: response.status }
        );
      }
    }

    // Parse JSON response
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse FastAPI response:", responseText);
      return NextResponse.json(
        { detail: "Invalid response from backend" },
        { status: 500 }
      );
    }

    // Return the FastAPI response with JWT token
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Login proxy error:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}