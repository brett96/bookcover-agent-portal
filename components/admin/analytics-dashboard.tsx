"use client";

import { useCallback, useEffect, useState } from "react";
import { VisitorsAreaChart } from "@/components/admin/visitors-area-chart";

type ProductMeta = { slug: string; label: string };
type SiteMeta = { slug: string; label: string };

type AnalyticsResponse = {
  filters: {
    productParam: string;
    siteParam: string;
    days: number;
    label: string;
  };
  products: ProductMeta[];
  sites: SiteMeta[];
  source: string;
  summary: {
    visitors7d: number;
    visitors30d: number;
    pageviews30d: number;
    byDay: { date: string; visitors: number }[];
    topPaths: { path: string; visitors: number }[];
    byProduct: {
      product: string;
      label: string;
      visitors: number;
      pageviews: number;
    }[];
    recent: {
      id: string;
      product: string;
      site: string | null;
      eventType: string;
      path: string;
      occurredAt: string;
      city?: string;
      country?: string;
    }[];
  };
};

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-extrabold tracking-[0.18em] text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-3xl font-black tracking-tight text-slate-900">
        {value}
      </div>
    </div>
  );
}

export function AnalyticsDashboard({
  canonicalAdminUrl,
}: {
  canonicalAdminUrl?: string;
}) {
  const [product, setProduct] = useState("all");
  const [site, setSite] = useState("all");
  const [days, setDays] = useState(30);
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        product,
        site,
        days: String(days),
      });
      const res = await fetch(`/api/admin/analytics?${params}`);
      if (!res.ok) throw new Error("Failed to load analytics");
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [product, site, days]);

  useEffect(() => {
    void load();
  }, [load]);

  const summary = data?.summary;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Analytics
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Shared <code className="font-mono">usageEvents</code> schema ·{" "}
            {data?.source === "firestore" ? "Firestore" : "Postgres fallback"}
          </p>
          {canonicalAdminUrl ? (
            <p className="mt-1 text-xs text-slate-500">
              Canonical admin:{" "}
              <a
                href={canonicalAdminUrl}
                className="font-semibold text-emerald-700 hover:underline"
              >
                {canonicalAdminUrl}
              </a>
            </p>
          ) : null}
        </div>
        <div className="analytics-toolbar flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            Product
            <select
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm font-medium text-slate-900"
            >
              <option value="all">All</option>
              {data?.products.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.label}
                </option>
              )) ?? (
                <>
                  <option value="agent-demo">Agent Portal Demo</option>
                  <option value="legacy">Legacy</option>
                </>
              )}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            Site
            <select
              value={site}
              onChange={(e) => setSite(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm font-medium text-slate-900"
            >
              <option value="all">All</option>
              {data?.sites.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.label}
                </option>
              )) ?? (
                <>
                  <option value="agent">Agent</option>
                  <option value="landing">Landing</option>
                </>
              )}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            Days
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm font-medium text-slate-900"
            >
              <option value={7}>7</option>
              <option value={30}>30</option>
              <option value={60}>60</option>
              <option value={90}>90</option>
            </select>
          </label>
        </div>
      </div>

      {data?.filters.label ? (
        <p className="mt-4 text-sm font-semibold text-slate-600">
          Showing: {data.filters.label}
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {loading && !summary ? (
        <p className="mt-8 text-sm text-slate-500">Loading analytics…</p>
      ) : null}

      {summary ? (
        <>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="VISITORS (7D)" value={summary.visitors7d} />
            <StatCard label="VISITORS (30D)" value={summary.visitors30d} />
            <StatCard label="PAGEVIEWS" value={summary.pageviews30d} />
            <StatCard label="DAYS WITH DATA" value={summary.byDay.length} />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-3">
              <div className="text-sm font-black text-slate-900">
                Visitors by day
              </div>
              <div className="mt-4">
                <VisitorsAreaChart data={summary.byDay} />
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
              <div className="text-sm font-black text-slate-900">Top pages</div>
              <div className="mt-4 space-y-2">
                {summary.topPaths.length === 0 ? (
                  <div className="text-sm text-slate-500">No data yet.</div>
                ) : (
                  summary.topPaths.map((p) => (
                    <div
                      key={p.path}
                      className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                    >
                      <div className="truncate text-sm font-bold text-slate-800">
                        {p.path}
                      </div>
                      <div className="text-sm font-black tabular-nums text-slate-900">
                        {p.visitors}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm font-black text-slate-900">By product</div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-500">
                      <th className="pb-2 pr-4">Product</th>
                      <th className="pb-2 pr-4 text-right">Visitors</th>
                      <th className="pb-2 text-right">Pageviews</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.byProduct.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-4 text-slate-500">
                          No data for this filter.
                        </td>
                      </tr>
                    ) : (
                      summary.byProduct.map((row) => (
                        <tr
                          key={row.product}
                          className="border-b border-slate-100"
                        >
                          <td className="py-2 pr-4 font-semibold text-slate-800">
                            {row.label}
                          </td>
                          <td className="py-2 pr-4 text-right tabular-nums">
                            {row.visitors}
                          </td>
                          <td className="py-2 text-right tabular-nums">
                            {row.pageviews}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-sm font-black text-slate-900">
                Recent events
              </div>
              <div className="mt-4 max-h-80 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 font-bold uppercase tracking-wide text-slate-500">
                      <th className="pb-2 pr-2">Time</th>
                      <th className="pb-2 pr-2">Product</th>
                      <th className="pb-2 pr-2">Type</th>
                      <th className="pb-2">Path</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.recent.map((row) => (
                      <tr key={row.id} className="border-b border-slate-100">
                        <td className="py-1.5 pr-2 whitespace-nowrap text-slate-600">
                          {new Date(row.occurredAt).toLocaleString()}
                        </td>
                        <td className="py-1.5 pr-2 font-medium text-slate-800">
                          {row.product}
                        </td>
                        <td className="py-1.5 pr-2 text-slate-600">
                          {row.eventType}
                        </td>
                        <td className="max-w-[140px] truncate py-1.5 text-slate-700">
                          {row.path}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
