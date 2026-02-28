import Database from "better-sqlite3";

const databasePath = process.env.DATABASE_PATH ?? "./runway.db";

type GlobalWithDb = typeof globalThis & {
  __runwayDb?: Database.Database;
};

const globalWithDb = globalThis as GlobalWithDb;

export const db = globalWithDb.__runwayDb ?? new Database(databasePath);

if (process.env.NODE_ENV !== "production") {
  globalWithDb.__runwayDb = db;
}
