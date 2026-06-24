import { and, desc, eq, gte, isNotNull } from "drizzle-orm";
import {
  filterEventsByDimensions,
  normalizeProduct,
  type AnalyticsFilters,
  type SiteSlug,
} from "@/lib/analytics-config";
import { getFirestoreDb } from "@/lib/firebase-admin";
import type { UsageEventRow } from "@/lib/reports";
import { getDb } from "@/lib/db/client";
import { events } from "@/lib/db/schema";

function sinceDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function toDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    return new Date(value);
  }
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate();
  }
  return new Date();
}

export async function fetchUsageEvents(
  days: number,
): Promise<UsageEventRow[]> {
  const since = sinceDays(days);
  const firestore = getFirestoreDb();

  if (firestore) {
    const snap = await firestore
      .collection("usageEvents")
      .where("occurredAt", ">=", since)
      .orderBy("occurredAt", "desc")
      .limit(8000)
      .get();

    return snap.docs.map((doc) => {
      const d = doc.data();
      const site = d.site as SiteSlug | undefined;
      return {
        id: doc.id,
        product: normalizeProduct(d.product as string | undefined),
        site:
          site === "landing" || site === "member" || site === "agent"
            ? site
            : null,
        eventType: String(d.eventType ?? "unknown"),
        path: String(d.path ?? ""),
        visitorId: String(d.visitorId ?? "anon"),
        sessionId: String(d.sessionId ?? d.visitorId ?? "anon"),
        occurredAt: toDate(d.occurredAt),
        country: d.country as string | undefined,
        city: d.city as string | undefined,
      };
    });
  }

  const db = getDb();
  if (!db) return [];

  const rows = await db
    .select()
    .from(events)
    .where(gte(events.occurredAt, since))
    .orderBy(desc(events.occurredAt))
    .limit(8000);

  return rows.map((r) => ({
    id: r.id,
    product: normalizeProduct(r.product ?? undefined),
    site:
      r.site === "landing" || r.site === "member" || r.site === "agent"
        ? r.site
        : null,
    eventType: r.eventType,
    path: r.path ?? "",
    visitorId: r.visitorId,
    sessionId: r.sessionId,
    occurredAt: r.occurredAt,
    country: r.country ?? undefined,
    city: r.city ?? undefined,
  }));
}

export async function fetchFilteredUsageEvents(filters: AnalyticsFilters) {
  const all = await fetchUsageEvents(filters.days);
  return filterEventsByDimensions(all, filters);
}

/** Postgres helpers used when Firestore is unavailable. */
export async function postgresDistinctVisitors(db: NonNullable<ReturnType<typeof getDb>>, days: number, product?: string | null, site?: string | null) {
  const conditions = [
    eq(events.eventType, "pageview"),
    gte(events.occurredAt, sinceDays(days)),
  ];
  if (product) conditions.push(eq(events.product, product));
  if (site) conditions.push(eq(events.site, site));

  const rows = await db.select().from(events).where(and(...conditions));
  return new Set(rows.map((r) => r.visitorId)).size;
}

export async function postgresTopPaths(db: NonNullable<ReturnType<typeof getDb>>, days: number, limit = 10) {
  const rows = await db
    .select()
    .from(events)
    .where(
      and(
        eq(events.eventType, "pageview"),
        gte(events.occurredAt, sinceDays(days)),
        isNotNull(events.path),
      ),
    );

  const map = new Map<string, Set<string>>();
  for (const r of rows) {
    const path = r.path ?? "";
    if (!map.has(path)) map.set(path, new Set());
    map.get(path)!.add(r.visitorId);
  }

  return [...map.entries()]
    .map(([path, set]) => ({ path, visitors: set.size }))
    .sort((a, b) => b.visitors - a.visitors)
    .slice(0, limit);
}
