const STOP_WORDS = new Set(["the", "a", "an", "oz", "lb", "ct", "pk", "pack", "count"]);

export function normalizeItemName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .filter((word) => !STOP_WORDS.has(word))
    .join(" ");
}
