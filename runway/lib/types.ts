export interface BudgetDefault {
  id: number;
  user_id: string;
  category: string;
  amount: number;
}

export interface PriceHistoryEntry {
  id: number;
  user_id: string;
  item_name_normalized: string;
  unit_price: number;
  retailer: string;
  date: string; // YYYY-MM-DD
}
