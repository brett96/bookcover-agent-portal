import {
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  visitorId: varchar("visitor_id", { length: 64 }).notNull(),
  sessionId: varchar("session_id", { length: 64 }).notNull(),
  eventType: varchar("event_type", { length: 32 }).notNull(),
  path: text("path"),
  referrer: text("referrer"),
  utmSource: varchar("utm_source", { length: 255 }),
  utmMedium: varchar("utm_medium", { length: 255 }),
  utmCampaign: varchar("utm_campaign", { length: 255 }),
  country: varchar("country", { length: 8 }),
  region: varchar("region", { length: 128 }),
  city: varchar("city", { length: 128 }),
  deviceType: varchar("device_type", { length: 64 }),
  browser: varchar("browser", { length: 64 }),
  os: varchar("os", { length: 64 }),
  ip: varchar("ip", { length: 64 }),
  userAgent: text("user_agent"),
  properties: jsonb("properties").$type<Record<string, unknown>>(),
  occurredAt: timestamp("occurred_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type EventRow = typeof events.$inferSelect;

