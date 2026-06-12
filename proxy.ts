import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyDemoJwt, DEMO_JWT_COOKIE } from "@/lib/demo-jwt";

const LANDING_URL =
  process.env.NEXT_PUBLIC_LANDING_URL ?? "https://bookcover.cercalabs.com";

/** Public demo origin (must be *.cercalabs.com so __bc_demo_jwt is sent). */
const AGENT_DEMO_ORIGIN = (
  process.env.NEXT_PUBLIC_AGENT_DEMO_URL ?? "https://bcagentportaldemo.cercalabs.com"
).replace(/\/$/, "");

function demoReturnUrl(req: NextRequest): string {
  let path = req.nextUrl.pathname + req.nextUrl.search;
  if (path === "/" || path === "") {
    path = "/demo";
  }
  return new URL(path, `${AGENT_DEMO_ORIGIN}/`).href;
}

function redirectToLanding(req: NextRequest) {
  const landing = new URL(LANDING_URL);
  if (landing.hostname === req.nextUrl.hostname) {
    return new NextResponse(
      "Demo gate misconfiguration: set NEXT_PUBLIC_LANDING_URL to https://bookcover.cercalabs.com on this Vercel project (not the agent demo URL).",
      { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }
  landing.searchParams.set("login", "1");
  landing.searchParams.set("return", demoReturnUrl(req));
  landing.searchParams.set("gate_bounce", "1");
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
