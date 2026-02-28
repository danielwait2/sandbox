export const CATEGORIES: Record<string, string[]> = {
  Groceries: ["Produce", "Dairy & Eggs", "Meat & Seafood", "Pantry", "Snacks", "Beverages", "Frozen", "Bakery"],
  Household: ["Cleaning", "Paper Goods", "Storage & Organization"],
  "Baby & Kids": ["Diapers", "Formula", "Clothing", "Toys"],
  "Health & Wellness": ["OTC Medicine", "First Aid", "Supplements"],
  "Personal Care": ["Beauty", "Hygiene"],
  Electronics: ["Devices", "Accessories"],
  "Clothing & Apparel": [],
  "Pet Supplies": ["Food", "Accessories"],
  Other: [],
};

export const DEFAULT_CATEGORIES = Object.keys(CATEGORIES);
