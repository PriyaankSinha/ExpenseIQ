// @ts-nocheck
// supabase/functions/monthly-report/index.ts
// Deploy: supabase functions deploy monthly-report
// Schedule: Run on the last day of each month via cron
// NOTE: This file runs on Deno (Supabase Edge Runtime), not Node.js.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://sxrjsusozqeioldhtuex.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface ProfileRow {
  id: string;
  full_name: string | null;
  currency: string | null;
}

interface ExpenseRow {
  amount: number;
  date: string;
  merchant: string | null;
  category: { name: string } | null;
}

Deno.serve(async (_req: Request) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
    const monthEnd = `${year}-${String(month).padStart(2, "0")}-${String(
      new Date(year, month, 0).getDate()
    ).padStart(2, "0")}`;

    const monthName = now.toLocaleString("en-US", { month: "long", year: "numeric" });

    // Get all users
    const { data: profiles } = await supabase.from("profiles").select("id, full_name, currency");
    if (!profiles) return new Response(JSON.stringify({ success: true, sent: 0 }));

    let sentCount = 0;

    for (const profile of profiles as ProfileRow[]) {
      // Get monthly expenses with categories
      const { data: expenses } = await supabase
        .from("expenses")
        .select("amount, date, merchant, category:categories(name)")
        .eq("user_id", profile.id)
        .gte("date", monthStart)
        .lte("date", monthEnd)
        .order("amount", { ascending: false });

      if (!expenses || expenses.length === 0) continue;

      const typedExpenses = expenses as ExpenseRow[];
      const totalSpent = typedExpenses.reduce((sum: number, e: ExpenseRow) => sum + e.amount, 0);

      // Find top category
      const categoryTotals = new Map<string, number>();
      typedExpenses.forEach((e: ExpenseRow) => {
        const name = e.category?.name || "Unknown";
        categoryTotals.set(name, (categoryTotals.get(name) || 0) + e.amount);
      });
      const topCategory = [...categoryTotals.entries()].sort((a, b) => b[1] - a[1])[0];

      // Generate AI insight
      const expenseSummary = typedExpenses
        .slice(0, 30)
        .map((e: ExpenseRow) => `$${e.amount} on ${e.category?.name || "Unknown"}${e.merchant ? ` at ${e.merchant}` : ""}`)
        .join(", ");

      const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.7,
          messages: [
            {
              role: "system",
              content:
                "You are a financial analyst. Give a brief, insightful 2-sentence analysis of the user's monthly spending. Be specific and actionable. Keep it professional but warm.",
            },
            {
              role: "user",
              content: `Monthly summary for ${monthName}: Total spent: $${totalSpent.toFixed(2)}. Top category: ${topCategory?.[0]} ($${topCategory?.[1]?.toFixed(2)}). Expenses: ${expenseSummary}`,
            },
          ],
        }),
      });
      const aiData = await aiResponse.json();
      const insight = aiData.choices?.[0]?.message?.content || "Keep up the great tracking! Review your top spending category for potential savings.";

      const currency = profile.currency || "USD";
      const fmtAmount = (n: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);

      // Get user email
      const { data: authUser } = await supabase.auth.admin.getUserById(profile.id);
      if (!authUser?.user?.email) continue;

      // Send report email
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "SpendSmart AI <reports@spendsmart.app>",
          to: authUser.user.email,
          subject: `📊 Your ${monthName} Spending Report`,
          html: `
            <div style="font-family: 'Inter', sans-serif; max-width: 520px; margin: 0 auto; background: #0f172a; border-radius: 16px; padding: 32px; color: #f1f5f9;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px; padding: 12px;">
                  <span style="font-size: 24px;">📊</span>
                </div>
              </div>
              <h1 style="text-align: center; font-size: 22px; color: #f1f5f9; margin-bottom: 4px;">
                Month in Review
              </h1>
              <p style="text-align: center; color: #64748b; font-size: 14px; margin-bottom: 24px;">
                ${monthName}${profile.full_name ? ` • ${profile.full_name}` : ""}
              </p>

              <div style="display: flex; gap: 12px; margin-bottom: 24px;">
                <div style="flex: 1; background: #1e293b; border-radius: 12px; padding: 16px; text-align: center;">
                  <p style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Total Spent</p>
                  <p style="font-size: 22px; font-weight: 700; color: #fb7185;">${fmtAmount(totalSpent)}</p>
                </div>
                <div style="flex: 1; background: #1e293b; border-radius: 12px; padding: 16px; text-align: center;">
                  <p style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Top Category</p>
                  <p style="font-size: 16px; font-weight: 700; color: #38bdf8;">${topCategory?.[0] || "N/A"}</p>
                  <p style="color: #94a3b8; font-size: 12px;">${topCategory ? fmtAmount(topCategory[1]) : ""}</p>
                </div>
              </div>

              <div style="background: #1e293b; border: 1px solid rgba(16,185,129,0.2); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                <p style="color: #34d399; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                  ✨ AI Insight
                </p>
                <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
                  ${insight}
                </p>
              </div>

              <p style="text-align: center; color: #475569; font-size: 11px;">
                SpendSmart AI • Intelligent expense tracking
              </p>
            </div>
          `,
        }),
      });

      sentCount++;
    }

    return new Response(
      JSON.stringify({ success: true, sent: sentCount }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
