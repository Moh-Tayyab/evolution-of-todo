// @spec: specs/002-fullstack-web-app/plan.md
// Landing page with redirect logic

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserId } from "@/lib/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    async function redirect() {
      const userId = await getCurrentUserId();
      if (userId) {
        router.push("/dashboard");
      } else {
        router.push("/signin");
      }
    }

    redirect();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );
}
