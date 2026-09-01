import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const DRAFT_ROUTES: Record<string, true> = {
  "/core-values": true,
  "/terms": true,
  "/privacy": true,
};

export async function proxy(request: NextRequest) {
  if (process.env.SITE_CONTENT_APPROVED !== "true" && DRAFT_ROUTES[request.nextUrl.pathname]) {
    return new NextResponse(null, { status: 404 });
  }
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
