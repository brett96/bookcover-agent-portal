import {
  filterEventsByDimensions,
  normalizeProduct,
  PRODUCT_LABELS,
  type AnalyticsFilters,
  type ProductSlug,
  type SiteSlug,
} from "@/lib/analytics-config";

export type UsageEventRow = {
  id: string;
  product: ProductSlug;
  site: SiteSlug | null;
  eventType: string;
  path: string;
  visitorId: string;
  sessionId: string;
  occurredAt: Date;
  country?: string;
  city?: string;
};

export type AnalyticsSummary = {
  visitors7d: number;
  visitors30d: number;
  pageviews30d: number;
  byDay: { date: string; visitors: number }[];
  topPaths: { path: string; visitors: number }[];
  byProduct: { product: ProductSlug; visitors: number; pageviews: number }[];
  recent: UsageEventRow[];
};

function formatPtDate(d: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

function sinceDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function distinctVisitors(
  events: UsageEventRow[],
  since: Date,
  eventType = "pageview",
) {
  const ids = new Set<string>();
  for (const e of events) {
    if (e.eventType !== eventType) continue;
    if (e.occurredAt < since) continue;
    ids.add(e.visitorId);
  }
  return ids.size;
}

export function buildAnalyticsSummary(
  allEvents: UsageEventRow[],
  filters: AnalyticsFilters,
): AnalyticsSummary {
  const filtered = filterEventsByDimensions(allEvents, filters);
  const since30 = sinceDays(filters.days);
  const since7 = sinceDays(7);

  const pageviews = filtered.filter(
    (e) => e.eventType === "pageview" && e.occurredAt >= since30,
  );

  const byDayMap = new Map<string, Set<string>>();
  for (const e of pageviews) {
    const day = formatPtDate(e.occurredAt);
    if (!byDayMap.has(day)) byDayMap.set(day, new Set());
    byDayMap.get(day)!.add(e.visitorId);
  }

  const pathMap = new Map<string, Set<string>>();
  for (const e of pageviews) {
    if (!e.path) continue;
    if (!pathMap.has(e.path)) pathMap.set(e.path, new Set());
    pathMap.get(e.path)!.add(e.visitorId);
  }

  const byProductMap = new Map<
    ProductSlug,
    { visitors: Set<string>; pageviews: number }
  >();
  for (const e of filtered) {
    if (e.occurredAt < since30) continue;
    const p = normalizeProduct(e.product);
    if (!byProductMap.has(p)) {
      byProductMap.set(p, { visitors: new Set(), pageviews: 0 });
    }
    const bucket = byProductMap.get(p)!;
    if (e.eventType === "pageview") {
      bucket.pageviews += 1;
      bucket.visitors.add(e.visitorId);
    }
  }

  const byProduct = [...byProductMap.entries()]
    .map(([product, stats]) => ({
      product,
      label: PRODUCT_LABELS[product],
      visitors: stats.visitors.size,
      pageviews: stats.pageviews,
    }))
    .sort((a, b) => b.visitors - a.visitors);

  const recent = [...filtered]
    .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
    .slice(0, 25);

  return {
    visitors7d: distinctVisitors(filtered, since7),
    visitors30d: distinctVisitors(filtered, since30),
    pageviews30d: pageviews.length,
    byDay: [...byDayMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, set]) => ({ date, visitors: set.size })),
    topPaths: [...pathMap.entries()]
      .map(([path, set]) => ({ path, visitors: set.size }))
      .sort((a, b) => b.visitors - a.visitors)
      .slice(0, 10),
    byProduct,
    recent,
  };
}
