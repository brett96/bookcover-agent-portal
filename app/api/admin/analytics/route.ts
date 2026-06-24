import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  buildFilterLabel,
  parseAnalyticsFilters,
  PRODUCT_LABELS,
  PRODUCT_SLUGS,
  SITE_LABELS,
  SITE_SLUGS,
} from "@/lib/analytics-config";
import { fetchUsageEvents } from "@/lib/analytics-query";
import { isFirebaseConfigured } from "@/lib/firebase-admin";
import { buildAnalyticsSummary } from "@/lib/reports";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const filters = parseAnalyticsFilters(url.searchParams);
  const allEvents = await fetchUsageEvents(filters.days);
  const summary = buildAnalyticsSummary(allEvents, filters);

  return NextResponse.json({
    filters: {
      ...filters,
      label: buildFilterLabel(filters),
    },
    products: PRODUCT_SLUGS.map((slug) => ({
      slug,
      label: PRODUCT_LABELS[slug],
    })),
    sites: SITE_SLUGS.map((slug) => ({
      slug,
      label: SITE_LABELS[slug],
    })),
    summary,
    source: isFirebaseConfigured() ? "firestore" : "postgres",
  });
}
