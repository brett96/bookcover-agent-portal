import { NextResponse } from "next/server";
import { verifyDemoJwt } from "@/lib/demo-jwt";
import { DEMO_HANDOFF_PARAM, demoJwtCookieOptions } from "@/lib/demo-cookie";

const LANDING_URL =
  process.env.NEXT_PUBLIC_LANDING_URL ?? "https://bookcover.cercalabs.com";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get(DEMO_HANDOFF_PARAM)?.trim();
  const destRaw = url.searchParams.get("dest")?.trim() || "/demo";
  const dest = destRaw.startsWith("/") ? destRaw : `/${destRaw}`;

  if (!token) {
    return NextResponse.redirect(LANDING_URL, 307);
  }

  const session = await verifyDemoJwt(token);
  if (!session) {
    const landing = new URL(LANDING_URL);
    landing.searchParams.set("handoff_failed", "1");
    landing.searchParams.set("demo", "agent");
    return NextResponse.redirect(landing, 307);
  }

  const res = NextResponse.redirect(new URL(dest, url.origin), 307);
  res.cookies.set({
    ...demoJwtCookieOptions(url.hostname),
    value: token,
  });
  return res;
}
