import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";
import { isFirebaseConfigured } from "@/lib/firebase-admin";
import { getDb } from "@/lib/db/client";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const db = getDb();
  const firebase = isFirebaseConfigured();

  if (!firebase && !db) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          Analytics
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Set <code className="font-mono">FIREBASE_SERVICE_ACCOUNT</code> (shared
          with BookCover Landing) to read the unified{" "}
          <code className="font-mono">usageEvents</code> collection, or connect{" "}
          <code className="font-mono">DATABASE_URL</code> for local Postgres
          fallback.
        </p>
      </div>
    );
  }

  const landingUrl = process.env.NEXT_PUBLIC_LANDING_URL?.replace(/\/$/, "");
  const canonicalAdminUrl = landingUrl ? `${landingUrl}/admin` : undefined;

  return <AnalyticsDashboard canonicalAdminUrl={canonicalAdminUrl} />;
}
