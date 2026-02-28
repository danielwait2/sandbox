import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTopFrequentItems, getCategoryTrends, getAnnualizedSpending } from "@/lib/insights";
import { model } from "@/lib/gemini";
import { parseContributorFilter, resolveAccountContextForUser } from "@/lib/account";

const tipsCache = new Map<string, { tips: string[]; generatedAt: string }>();

const stripFences = (text: string): string =>
  text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

const parseTipsResponse = (raw: string): string[] | null => {
  const cleaned = stripFences(raw);
  try {
    const parsed = JSON.parse(cleaned) as unknown;
    if (Array.isArray(parsed)) {
      const tips = parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
      return tips.length > 0 ? tips : null;
    }
  } catch {
    // Try extracting an array if the model included extra text.
  }

  const match = cleaned.match(/\[[\s\S]*\]/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]) as unknown;
    if (!Array.isArray(parsed)) return null;
    const tips = parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    return tips.length > 0 ? tips : null;
  } catch {
    return null;
  }
};

const buildFallbackTips = (
  frequentItems: ReturnType<typeof getTopFrequentItems>,
  trends: ReturnType<typeof getCategoryTrends>,
  annualized: ReturnType<typeof getAnnualizedSpending>
): string[] => {
  const tips: string[] = [];
  const risingCategory = trends
    .filter((t) => t.changePercent > 0)
    .sort((a, b) => b.changePercent - a.changePercent)[0];
  if (risingCategory) {
    tips.push(
      `${risingCategory.category} is up ${risingCategory.changePercent}% this month. Set a cap for next month and shift one purchase to a lower-cost alternative.`
    );
  }

  const topFrequent = frequentItems.sort((a, b) => b.count - a.count)[0];
  if (topFrequent) {
    tips.push(
      `You bought ${topFrequent.name} ${topFrequent.count} times this month. Buying this item in bulk or during sales can lower your per-unit cost.`
    );
  }

  const topAnnualized = annualized.sort((a, b) => b.annualProjection - a.annualProjection)[0];
  if (topAnnualized) {
    tips.push(
      `${topAnnualized.category} is projected around $${topAnnualized.annualProjection.toFixed(0)}/year. A 10% reduction would save about $${(topAnnualized.annualProjection * 0.1).toFixed(0)} annually.`
    );
  }

  if (tips.length === 0) {
    tips.push("Track one high-spend category weekly and aim for a 5-10% reduction over the next month.");
  }

  return tips.slice(0, 5);
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const month = (body as { month?: string }).month ?? new Date().toISOString().slice(0, 7);
  const bodyContributor = (body as { contributor?: string }).contributor;
  const contributor = parseContributorFilter(
    bodyContributor ?? request.nextUrl.searchParams.get("contributor")
  );
  if (bodyContributor && !parseContributorFilter(bodyContributor)) {
    return NextResponse.json({ error: "Invalid contributor filter" }, { status: 400 });
  }
  if (!contributor) {
    return NextResponse.json({ error: "Invalid contributor filter" }, { status: 400 });
  }

  const context = resolveAccountContextForUser(session.user.email);
  if (!context) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const cacheKey = `${context.accountId}:${contributor}:${month}`;
  const cached = tipsCache.get(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  const frequentItems = getTopFrequentItems(context, contributor, month);
  const trends = getCategoryTrends(context, contributor, month);
  const annualized = getAnnualizedSpending(context, contributor);

  if (frequentItems.length === 0 && trends.length === 0) {
    return NextResponse.json({ tips: ["Not enough spending data yet to generate tips."], generatedAt: new Date().toISOString() });
  }

  const prompt = `You are a personal finance advisor. Based on this spending data, suggest 3-5 actionable ways to save money. Be specific with dollar estimates where possible. Keep each tip to 1-2 sentences.

Frequently purchased items this month:
${frequentItems.map((i) => `- ${i.name}: bought ${i.count} times, total $${i.totalSpent.toFixed(2)}`).join("\n")}

Category spending trends vs last month:
${trends.map((t) => `- ${t.category}: $${t.currentSpend.toFixed(2)} (${t.changePercent > 0 ? "+" : ""}${t.changePercent}% vs last month)`).join("\n")}

Annualized spending projections:
${annualized.slice(0, 5).map((a) => `- ${a.category}: ~$${a.weeklyAvg.toFixed(2)}/week = ~$${a.annualProjection.toFixed(2)}/year`).join("\n")}

Return ONLY a JSON array of strings, each string being one tip. No markdown, no explanation, just the JSON array.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const tips = parseTipsResponse(text);
    if (!tips) {
      throw new Error("Model response could not be parsed into tips array");
    }
    const entry = { tips, generatedAt: new Date().toISOString() };
    tipsCache.set(cacheKey, entry);
    return NextResponse.json(entry);
  } catch (error) {
    console.error("[insights/tips] Gemini generation failed, returning fallback tips:", error);
    const entry = {
      tips: buildFallbackTips(frequentItems, trends, annualized),
      generatedAt: new Date().toISOString(),
    };
    tipsCache.set(cacheKey, entry);
    return NextResponse.json(entry);
  }
}
