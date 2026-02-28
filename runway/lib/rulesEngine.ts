import { db } from "@/lib/db";

type Rule = {
  match_pattern: string;
  category: string;
  subcategory: string | null;
};

type RuleMatch = {
  category: string;
  subcategory: string | null;
};

let rulesCache: Rule[] | null = null;

const loadRules = (): Rule[] => {
  if (rulesCache !== null) return rulesCache;
  rulesCache = db.prepare("SELECT match_pattern, category, subcategory FROM rules").all() as Rule[];
  return rulesCache;
};

export const clearRulesCache = (): void => {
  rulesCache = null;
};

export const applyRules = (itemName: string): RuleMatch | null => {
  const rules = loadRules();
  const lower = itemName.toLowerCase();

  for (const rule of rules) {
    if (lower.includes(rule.match_pattern.toLowerCase())) {
      return { category: rule.category, subcategory: rule.subcategory };
    }
  }

  return null;
};
