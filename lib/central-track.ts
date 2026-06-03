const CENTRAL_TRACK_URL =
  (process.env.NEXT_PUBLIC_LANDING_URL ?? "https://bookcover.cercalabs.com") +
  "/api/track";

export function forwardToCentralTrack(
  site: "member" | "agent",
  payload: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;
  const body = JSON.stringify({ site, ...payload });
  const url = CENTRAL_TRACK_URL;
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
  } else {
    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      credentials: "include",
      keepalive: true,
    });
  }
}
