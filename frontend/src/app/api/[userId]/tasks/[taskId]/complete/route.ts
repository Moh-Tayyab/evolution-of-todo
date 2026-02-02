// @spec: specs/002-fullstack-web-app/plan.md
// @spec: specs/002-fullstack-web-app/spec.md
// Next.js API route handler for toggling task completion
// Proxies requests to FastAPI backend to avoid CORS issues

import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "https://m-tayyab-evolution-of-todo-backend.hf.space";

/**
 * PATCH /api/[userId]/tasks/[taskId]/complete
 * Proxy toggle task complete request to FastAPI backend
 *
 * Response: Updated task with toggled completion status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; taskId: string }> }
) {
  try {
    const { userId, taskId } = await params;

    // Forward the request to FastAPI backend
    const response = await fetch(
      `${FASTAPI_URL}/api/${userId}/tasks/${taskId}/complete`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          // Forward authorization header if present
          ...(request.headers.get("authorization")
            ? { Authorization: request.headers.get("authorization")! }
            : {}),
        },
      }
    );

    const responseText = await response.text();

    console.log(`FastAPI toggle complete response status: ${response.status}`);

    if (!response.ok) {
      console.error(`FastAPI toggle complete error: ${responseText}`);
      try {
        const data = JSON.parse(responseText);
        return NextResponse.json(data, { status: response.status });
      } catch {
        return NextResponse.json(
          { detail: responseText || "Failed to toggle task completion" },
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

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Toggle complete proxy error:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
