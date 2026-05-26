export function getResolvedDatabaseUrl() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || null;
}

