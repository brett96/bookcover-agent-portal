import { DEMO_JWT_COOKIE } from "@/lib/demo-jwt";

export const DEMO_HANDOFF_PARAM = "bc_handoff";

const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7;

export function demoJwtCookieOptions(hostname: string) {
  const isProd = process.env.NODE_ENV === "production";
  const host = hostname.toLowerCase();
  const domain =
    isProd && (host === "cercalabs.com" || host.endsWith(".cercalabs.com"))
      ? ".cercalabs.com"
      : undefined;

  return {
    name: DEMO_JWT_COOKIE,
    httpOnly: true,
    secure: isProd,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
    ...(domain ? { domain } : {}),
  };
}
