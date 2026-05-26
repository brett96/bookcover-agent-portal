import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDb } from "@/lib/db/client";
import { distinctVisitors, pageviewsByDay, topPaths } from "@/lib/analytics";
import { VisitorsAreaChart } from "@/components/admin/visitors-area-chart";

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
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

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const db = getDb();
  if (!db) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          Analytics
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Connect <code className="font-mono">DATABASE_URL</code> (or{" "}
          <code className="font-mono">POSTGRES_URL</code>) to store events and view
          analytics.
        </p>
      </div>
    );
  }

  const [v7, v30, series, paths] = await Promise.all([
    distinctVisitors(db, 7),
    distinctVisitors(db, 30),
    pageviewsByDay(db, 30),
    topPaths(db, 30, 10),
  ]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-8">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Analytics
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Distinct visitors and top pages from tracked{" "}
            <code className="font-mono">pageview</code> events.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="VISITORS (7D)" value={v7} />
        <StatCard label="VISITORS (30D)" value={v30} />
        <StatCard label="TOP PAGES" value={paths.length} />
        <StatCard label="DAYS WITH DATA" value={series.length} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-black text-slate-900">Visitors by day</div>
          <div className="mt-1 text-sm text-slate-600">Last 30 days (PT)</div>
          <div className="mt-4">
            <VisitorsAreaChart data={series} />
          </div>
        </div>
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-sm font-black text-slate-900">Top pages</div>
          <div className="mt-1 text-sm text-slate-600">
            Distinct visitors by path (30d)
          </div>
          <div className="mt-4 space-y-2">
            {paths.length === 0 ? (
              <div className="text-sm text-slate-500">No data yet.</div>
            ) : (
              paths.map((p) => (
                <div
                  key={p.path ?? "—"}
                  className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                >
                  <div className="truncate text-sm font-bold text-slate-800">
                    {p.path ?? "—"}
                  </div>
                  <div className="text-sm font-black tabular-nums text-slate-900">
                    {Number(p.visitors ?? 0)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

