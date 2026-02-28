import { db } from "@/lib/db";
import type { BudgetDefault } from "@/lib/types";

export function getBudgetDefaults(userId: string): BudgetDefault[] {
  return db
    .prepare("SELECT * FROM budget_defaults WHERE user_id = ? ORDER BY category")
    .all(userId) as BudgetDefault[];
}

export function upsertBudgetDefault(
  userId: string,
  category: string,
  amount: number
): void {
  db.prepare(
    "INSERT INTO budget_defaults (user_id, category, amount) VALUES (?, ?, ?) ON CONFLICT(user_id, category) DO UPDATE SET amount = excluded.amount"
  ).run(userId, category, amount);
}

export function deleteBudgetDefault(userId: string, category: string): void {
  db.prepare(
    "DELETE FROM budget_defaults WHERE user_id = ? AND category = ?"
  ).run(userId, category);
}
