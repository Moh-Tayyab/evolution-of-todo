// @spec: specs/002-fullstack-web-app/plan.md
// @spec: specs/002-fullstack-web-app/spec.md
// Next.js API route handler for tasks
// Proxies requests to FastAPI backend to avoid CORS issues

import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

/**
 * GET /api/[userId]/tasks
 * Proxy list tasks request to FastAPI backend
 *
 * Query params: search, status, priority, tag_ids, sort, order
 * Response: Array of tasks
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Build query string
    const url = new URL(request.url);
    const queryString = url.search;

    // Forward the request to FastAPI backend
    const response = await fetch(
      `${FASTAPI_URL}/api/${userId}/tasks${queryString}`,
      {
        method: "GET",
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

    // Log for debugging
    console.log(`FastAPI tasks list response status: ${response.status}`);

    if (!response.ok) {
      console.error(`FastAPI tasks list error: ${responseText}`);
      try {
        const data = JSON.parse(responseText);
        return NextResponse.json(data, { status: response.status });
      } catch {
        return NextResponse.json(
          { detail: responseText || "Failed to fetch tasks" },
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
    console.error("Tasks list proxy error:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/[userId]/tasks
 * Proxy create task request to FastAPI backend
 *
 * Request body: TaskCreate object
 * Response: Created task
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const body = await request.json();

    // Forward the request to FastAPI backend
    const response = await fetch(`${FASTAPI_URL}/api/${userId}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(request.headers.get("authorization")
          ? { Authorization: request.headers.get("authorization")! }
          : {}),
      },
      body: JSON.stringify(body),
    });

    const responseText = await response.text();

    console.log(`FastAPI create task response status: ${response.status}`);

    if (!response.ok) {
      console.error(`FastAPI create task error: ${responseText}`);
      try {
        const data = JSON.parse(responseText);
        return NextResponse.json(data, { status: response.status });
      } catch {
        return NextResponse.json(
          { detail: responseText || "Failed to create task" },
          { status: response.status }
        );
      }
    }

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

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("Create task proxy error:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
