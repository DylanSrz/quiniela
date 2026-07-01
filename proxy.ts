import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "@/lib/session";

const ADMIN_COOKIE = "qh_admin";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (await verifySession(token)) {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("from", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*"],
};
