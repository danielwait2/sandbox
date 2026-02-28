import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getTopFrequentItems, getCategoryTrends, getAnnualizedSpending } from "@/lib/insights";
import { model } from "@/lib/gemini";

const tipsCache = new Map<string, { tips: string[]; generatedAt: string }>();

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.email;
  const body = await request.json().catch(() => ({}));
  const month = (body as { month?: string }).month ?? new Date().toISOString().slice(0, 7);

  const cacheKey = `${userId}:${month}`;
  const cached = tipsCache.get(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  const frequentItems = getTopFrequentItems(userId, month);
  const trends = getCategoryTrends(userId, month);
  const annualized = getAnnualizedSpending(userId);

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
    const tips = JSON.parse(text) as string[];
    const entry = { tips, generatedAt: new Date().toISOString() };
    tipsCache.set(cacheKey, entry);
    return NextResponse.json(entry);
  } catch {
    return NextResponse.json(
      { error: "Failed to generate tips" },
      { status: 500 }
    );
  }
}
