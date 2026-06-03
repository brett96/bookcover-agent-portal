import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyDemoJwt, DEMO_JWT_COOKIE } from "@/lib/demo-jwt";

const LANDING_URL =
  process.env.NEXT_PUBLIC_LANDING_URL ?? "https://bookcover.cercalabs.com";

function redirectToLanding(req: NextRequest) {
  const landing = new URL(LANDING_URL);
  landing.searchParams.set("login", "1");
  landing.searchParams.set("return", req.nextUrl.href);
  return NextResponse.redirect(landing);
}

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (
    path.startsWith("/admin") ||
    path.startsWith("/api") ||
    path.startsWith("/login") ||
    path.startsWith("/_next")
  ) {
    return NextResponse.next();
  }

  if (path === "/" || path === "/demo" || path.startsWith("/demo/")) {
    const session = await verifyDemoJwt(
      req.cookies.get(DEMO_JWT_COOKIE)?.value
    );
    if (!session) {
      return redirectToLanding(req);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/demo", "/demo/:path*"],
};
