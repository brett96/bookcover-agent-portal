"use client";

import { useEffect } from "react";

function getOrCreateId(storageKey: string) {
  if (typeof window === "undefined") return "anon";
  const existing = window.localStorage.getItem(storageKey);
  if (existing) return existing;
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  window.localStorage.setItem(storageKey, id);
  return id;
}

function getUtmParams() {
  if (typeof window === "undefined") return {};
  const url = new URL(window.location.href);
  return {
    utm_source: url.searchParams.get("utm_source") ?? undefined,
    utm_medium: url.searchParams.get("utm_medium") ?? undefined,
    utm_campaign: url.searchParams.get("utm_campaign") ?? undefined,
  };
}

export default function TrackPageView({
  eventType = "pageview",
  properties,
}: {
  eventType?: string;
  properties?: Record<string, unknown>;
}) {
  useEffect(() => {
    const visitorId = getOrCreateId("bc_visitor_id");
    const sessionId = getOrCreateId("bc_session_id");
    const path = window.location.pathname + window.location.search;

    void fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        visitorId,
        sessionId,
        eventType,
        path,
        referrer: document.referrer || null,
        ...getUtmParams(),
        properties: properties ?? {},
      }),
    });
  }, [eventType, properties]);

  return null;
}

