import {
  DEPLOYMENT_PRODUCT,
  DEPLOYMENT_SITE,
  normalizeProduct,
  type ProductSlug,
  type SiteSlug,
} from "@/lib/analytics-config";
import { getFirestoreDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export type UsageEventInput = {
  visitorId: string;
  sessionId: string;
  eventType: string;
  path?: string;
  referrer?: string | null;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  country?: string;
  region?: string;
  city?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  ip?: string;
  userAgent?: string;
  product?: string;
  site?: string;
  properties?: Record<string, unknown>;
  occurredAt?: Date;
};

export function resolveProductSite(input: {
  product?: string;
  site?: string;
}): { product: ProductSlug; site: SiteSlug } {
  const envProduct = process.env.NEXT_PUBLIC_ANALYTICS_PRODUCT;
  const product = normalizeProduct(
    input.product ?? envProduct ?? DEPLOYMENT_PRODUCT,
  );
  const siteRaw = input.site ?? DEPLOYMENT_SITE;
  const site: SiteSlug =
    siteRaw === "landing" || siteRaw === "member" || siteRaw === "agent"
      ? siteRaw
      : DEPLOYMENT_SITE;
  return { product, site };
}

export async function recordUsageEvent(
  input: UsageEventInput,
): Promise<{ stored: "firestore" | "none" }> {
  const { product, site } = resolveProductSite(input);
  const db = getFirestoreDb();
  if (!db) return { stored: "none" };

  const doc = {
    product,
    site,
    visitorId: input.visitorId,
    sessionId: input.sessionId,
    eventType: input.eventType,
    path: input.path ?? "",
    referrer: input.referrer ?? null,
    utm_source: input.utmSource,
    utm_medium: input.utmMedium,
    utm_campaign: input.utmCampaign,
    country: input.country,
    region: input.region,
    city: input.city,
    deviceType: input.deviceType,
    browser: input.browser,
    os: input.os,
    ip: input.ip,
    userAgent: input.userAgent,
    properties: input.properties ?? {},
    occurredAt: input.occurredAt ?? FieldValue.serverTimestamp(),
  };

  await db.collection("usageEvents").add(doc);
  return { stored: "firestore" };
}
