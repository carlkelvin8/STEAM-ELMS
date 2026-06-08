import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";

const publicPaths = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/courses",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    const isPublic = publicPaths.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`)
    );
    if (!isPublic) {
      const user = await authenticateRequest(request);
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-id", user.sub);
      requestHeaders.set("x-user-role", user.role);
      return NextResponse.next({ request: { headers: requestHeaders } });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
