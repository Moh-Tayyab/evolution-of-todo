// @spec: specs/002-fullstack-web-app/plan.md
// @spec: specs/002-fullstack-web-app/spec.md
// Next.js API route handler for getting current user
// Proxies requests to FastAPI backend to avoid CORS issues

import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

/**
 * GET /api/auth/me
 * Proxy get current user request to FastAPI backend
 *
 * Headers: Authorization: Bearer <token>
 * Response: User object or 404
 */
export async function GET(request: NextRequest) {
  try {
    // Get authorization header from the request
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { detail: "Not authenticated" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Forward the request to FastAPI backend
    const response = await fetch(`${FASTAPI_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 404) {
      return NextResponse.json(
        { detail: "User not found" },
        { status: 404 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { detail: "Failed to get user" },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Return the FastAPI response with user data
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Get user proxy error:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
