export const PRODUCTS = {
  INDEPENDENT_AGENTS: "independent-agents",
  BOOKCOVER_LANDING: "bookcover-landing",
  MEMBER_DEMO: "member-demo",
  AGENT_DEMO: "agent-demo",
  LEGACY: "legacy",
} as const;

export type ProductSlug = (typeof PRODUCTS)[keyof typeof PRODUCTS];

export const PRODUCT_SLUGS: ProductSlug[] = [
  PRODUCTS.INDEPENDENT_AGENTS,
  PRODUCTS.BOOKCOVER_LANDING,
  PRODUCTS.MEMBER_DEMO,
  PRODUCTS.AGENT_DEMO,
  PRODUCTS.LEGACY,
];

export const SITES = {
  LANDING: "landing",
  MEMBER: "member",
  AGENT: "agent",
} as const;

export type SiteSlug = (typeof SITES)[keyof typeof SITES];

export const SITE_SLUGS: SiteSlug[] = [SITES.LANDING, SITES.MEMBER, SITES.AGENT];

export const PRODUCT_LABELS: Record<ProductSlug, string> = {
  [PRODUCTS.INDEPENDENT_AGENTS]: "Independent Agents",
  [PRODUCTS.BOOKCOVER_LANDING]: "BookCover Landing",
  [PRODUCTS.MEMBER_DEMO]: "Member Demo",
  [PRODUCTS.AGENT_DEMO]: "Agent Portal Demo",
  [PRODUCTS.LEGACY]: "Legacy (no product)",
};

export const SITE_LABELS: Record<SiteSlug, string> = {
  [SITES.LANDING]: "Landing",
  [SITES.MEMBER]: "Member",
  [SITES.AGENT]: "Agent",
};

/** Default product for this deployment (bcagentportaldemo.cercalabs.com). */
export const DEPLOYMENT_PRODUCT = PRODUCTS.AGENT_DEMO;

/** Default site for this deployment. */
export const DEPLOYMENT_SITE = SITES.AGENT;

export function isProductSlug(value: string): value is ProductSlug {
  return (PRODUCT_SLUGS as string[]).includes(value);
}

export function isSiteSlug(value: string): value is SiteSlug {
  return (SITE_SLUGS as string[]).includes(value);
}

export function normalizeProduct(value?: string | null): ProductSlug {
  if (!value || value.trim() === "") return PRODUCTS.LEGACY;
  const v = value.trim();
  return isProductSlug(v) ? v : PRODUCTS.LEGACY;
}

export function normalizeSite(value?: string | null): SiteSlug | null {
  if (!value || value === "all") return null;
  const v = value.trim();
  return isSiteSlug(v) ? v : null;
}

export type AnalyticsFilters = {
  product: ProductSlug | null;
  site: SiteSlug | null;
  days: number;
  productParam: string;
  siteParam: string;
};

export function parseAnalyticsFilters(
  searchParams: URLSearchParams,
): AnalyticsFilters {
  const productParam = searchParams.get("product") ?? "all";
  const siteParam = searchParams.get("site") ?? "all";
  const daysRaw = parseInt(searchParams.get("days") ?? "30", 10);
  const days = Number.isFinite(daysRaw) ? Math.min(Math.max(daysRaw, 1), 120) : 30;

  return {
    product:
      productParam === "all" ? null : normalizeProduct(productParam),
    site: normalizeSite(siteParam),
    days,
    productParam,
    siteParam,
  };
}

export function filterEventsByDimensions<
  T extends { product?: string | null; site?: string | null },
>(events: T[], filters: Pick<AnalyticsFilters, "product" | "site">): T[] {
  return events.filter((event) => {
    const product = normalizeProduct(event.product);
    const site = event.site ?? null;
    if (filters.product && product !== filters.product) return false;
    if (filters.site && site !== filters.site) return false;
    return true;
  });
}

export function buildFilterLabel(filters: AnalyticsFilters): string {
  const parts: string[] = [];
  parts.push(
    filters.product
      ? PRODUCT_LABELS[filters.product]
      : "All products",
  );
  parts.push(
    filters.site ? SITE_LABELS[filters.site] : "All sites",
  );
  parts.push(`Last ${filters.days} days`);
  return parts.join(" · ");
}
