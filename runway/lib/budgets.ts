import { db } from "@/lib/db";

export function seedBudgetFromDefaults(userId: string, month: string): void {
  type DefaultRow = { category: string; amount: number };
  const defaults = db
    .prepare("SELECT category, amount FROM budget_defaults WHERE user_id = ?")
    .all(userId) as DefaultRow[];

  if (defaults.length === 0) return;

  const insertBudget = db.prepare(
    "INSERT INTO budgets (user_id, category, subcategory, month, amount) VALUES (?, ?, NULL, ?, ?)"
  );

  const upsert = db.transaction(() => {
    for (const def of defaults) {
      type ExistingRow = { id: number };
      const existing = db
        .prepare(
          "SELECT id FROM budgets WHERE user_id = ? AND category = ? AND month = ?"
        )
        .get(userId, def.category, month) as ExistingRow | undefined;

      if (!existing) {
        insertBudget.run(userId, def.category, month, def.amount);
      }
    }
  });

  upsert();
}
