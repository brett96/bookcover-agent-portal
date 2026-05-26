import { and, countDistinct, desc, eq, gte, isNotNull } from "drizzle-orm";
import type { Db } from "@/lib/db/client";
import { events } from "@/lib/db/schema";

function since(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function formatPtDate(d: Date) {
  const s = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
  return s; // YYYY-MM-DD
}

export async function distinctVisitors(db: Db, days: number) {
  const [row] = await db
    .select({ c: countDistinct(events.visitorId) })
    .from(events)
    .where(and(eq(events.eventType, "pageview"), gte(events.occurredAt, since(days))));
  return Number(row?.c ?? 0);
}

export async function pageviewsByDay(db: Db, days: number) {
  const rows = await db
    .select()
    .from(events)
    .where(and(eq(events.eventType, "pageview"), gte(events.occurredAt, since(days))));

  const map = new Map<string, Set<string>>();
  for (const r of rows) {
    const day = formatPtDate(r.occurredAt);
    if (!map.has(day)) map.set(day, new Set());
    map.get(day)!.add(r.visitorId);
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, set]) => ({ date, visitors: set.size }));
}

export async function topPaths(db: Db, days: number, limit = 10) {
  const c = countDistinct(events.visitorId);
  return db
    .select({ path: events.path, visitors: c })
    .from(events)
    .where(
      and(
        eq(events.eventType, "pageview"),
        gte(events.occurredAt, since(days)),
        isNotNull(events.path),
      ),
    )
    .groupBy(events.path)
    .orderBy(desc(c))
    .limit(limit);
}

