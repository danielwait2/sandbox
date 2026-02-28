import { db } from "@/lib/db";
import type { BudgetDefault } from "@/lib/types";

export function getBudgetDefaults(userId: string): BudgetDefault[] {
  return db
    .prepare("SELECT * FROM budget_defaults WHERE user_id = ? AND deleted = 0 ORDER BY category")
    .all(userId) as BudgetDefault[];
}

export function upsertBudgetDefault(
  userId: string,
  category: string,
  amount: number
): void {
  db.prepare(
    "INSERT INTO budget_defaults (user_id, category, amount, deleted) VALUES (?, ?, ?, 0) ON CONFLICT(user_id, category) DO UPDATE SET amount = excluded.amount, deleted = 0"
  ).run(userId, category, amount);
}

export function deleteBudgetDefault(userId: string, category: string): void {
  db.prepare(
    "INSERT INTO budget_defaults (user_id, category, amount, deleted) VALUES (?, ?, 0, 1) ON CONFLICT(user_id, category) DO UPDATE SET deleted = 1"
  ).run(userId, category);
}
