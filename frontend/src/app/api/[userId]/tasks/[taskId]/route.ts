// @spec: specs/002-fullstack-web-app/plan.md
// @spec: specs/002-fullstack-web-app/spec.md
// Next.js API route handler for individual task operations
// Proxies requests to FastAPI backend to avoid CORS issues

import { NextRequest, NextResponse } from "next/server";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000";

/**
 * GET /api/[userId]/tasks/[taskId]
 * Proxy get task request to FastAPI backend
 *
 * Response: Single task object
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; taskId: string }> }
) {
  try {
    const { userId, taskId } = await params;

    const response = await fetch(
      `${FASTAPI_URL}/api/${userId}/tasks/${taskId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(request.headers.get("authorization")
            ? { Authorization: request.headers.get("authorization")! }
            : {}),
        },
      }
    );

    const responseText = await response.text();

    if (!response.ok) {
      console.error(`FastAPI get task error: ${responseText}`);
      try {
        const data = JSON.parse(responseText);
        return NextResponse.json(data, { status: response.status });
      } catch {
        return NextResponse.json(
          { detail: responseText || "Failed to fetch task" },
          { status: response.status }
        );
      }
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      return NextResponse.json(
        { detail: "Invalid response from backend" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Get task proxy error:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/[userId]/tasks/[taskId]
 * Proxy update task request to FastAPI backend (full update)
 *
 * Request body: TaskUpdate object
 * Response: Updated task
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; taskId: string }> }
) {
  try {
    const { userId, taskId } = await params;
    const body = await request.json();

    const response = await fetch(
      `${FASTAPI_URL}/api/${userId}/tasks/${taskId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(request.headers.get("authorization")
            ? { Authorization: request.headers.get("authorization")! }
            : {}),
        },
        body: JSON.stringify(body),
      }
    );

    const responseText = await response.text();

    if (!response.ok) {
      console.error(`FastAPI update task error: ${responseText}`);
      try {
        const data = JSON.parse(responseText);
        return NextResponse.json(data, { status: response.status });
      } catch {
        return NextResponse.json(
          { detail: responseText || "Failed to update task" },
          { status: response.status }
        );
      }
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      return NextResponse.json(
        { detail: "Invalid response from backend" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Update task proxy error:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/[userId]/tasks/[taskId]
 * Proxy partial update task request to FastAPI backend
 *
 * Request body: Partial TaskUpdate object
 * Response: Updated task
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; taskId: string }> }
) {
  try {
    const { userId, taskId } = await params;
    const body = await request.json();

    const response = await fetch(
      `${FASTAPI_URL}/api/${userId}/tasks/${taskId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(request.headers.get("authorization")
            ? { Authorization: request.headers.get("authorization")! }
            : {}),
        },
        body: JSON.stringify(body),
      }
    );

    const responseText = await response.text();

    if (!response.ok) {
      console.error(`FastAPI patch task error: ${responseText}`);
      try {
        const data = JSON.parse(responseText);
        return NextResponse.json(data, { status: response.status });
      } catch {
        return NextResponse.json(
          { detail: responseText || "Failed to patch task" },
          { status: response.status }
        );
      }
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      return NextResponse.json(
        { detail: "Invalid response from backend" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Patch task proxy error:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/[userId]/tasks/[taskId]
 * Proxy delete task request to FastAPI backend
 *
 * Response: 204 No Content on success
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; taskId: string }> }
) {
  try {
    const { userId, taskId } = await params;

    const response = await fetch(
      `${FASTAPI_URL}/api/${userId}/tasks/${taskId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(request.headers.get("authorization")
            ? { Authorization: request.headers.get("authorization")! }
            : {}),
        },
      }
    );

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const responseText = await response.text();

    if (!response.ok) {
      console.error(`FastAPI delete task error: ${responseText}`);
      try {
        const data = JSON.parse(responseText);
        return NextResponse.json(data, { status: response.status });
      } catch {
        return NextResponse.json(
          { detail: responseText || "Failed to delete task" },
          { status: response.status }
        );
      }
    }

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("Delete task proxy error:", error);
    return NextResponse.json(
      { detail: "Internal server error" },
      { status: 500 }
    );
  }
}
