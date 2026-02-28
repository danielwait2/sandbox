import Database from "better-sqlite3";

import { runMigrations } from "@/lib/migrations";

const databasePath = process.env.DATABASE_PATH ?? "./runway.db";

type GlobalWithDb = typeof globalThis & {
  __runwayDb?: Database.Database;
};

const globalWithDb = globalThis as GlobalWithDb;

export const db = globalWithDb.__runwayDb ?? new Database(databasePath);

runMigrations(db);

if (process.env.NODE_ENV !== "production") {
  globalWithDb.__runwayDb = db;
}
