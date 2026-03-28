// @ts-nocheck
// supabase/functions/monthly-report/index.ts
// Deploy: supabase functions deploy monthly-report
// Schedule: Run on the last day of each month via cron
// NOTE: This file runs on Deno (Supabase Edge Runtime), not Node.js.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://sxrjsusozqeioldhtuex.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE_KEY")!;
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
      const totalSpent = typedExpenses.reduce((sum, e) => sum + e.amount, 0);

      // Find top category
      const categoryTotals = new Map<string, number>();
      typedExpenses.forEach((e) => {
        const name = e.category?.name || "Unknown";
        categoryTotals.set(name, (categoryTotals.get(name) || 0) + e.amount);
      });
      const topCategoryArr = [...categoryTotals.entries()].sort((a, b) => b[1] - a[1])[0];

      // Generate AI insight
      const expenseSummary = typedExpenses
        .slice(0, 30)
        .map((e) => `$${e.amount} on ${e.category?.name || "Unknown"}${e.merchant ? ` at ${e.merchant}` : ""}`)
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
              content: `Monthly summary for ${monthName}: Total spent: $${totalSpent.toFixed(2)}. Top category: ${topCategoryArr?.[0]} ($${topCategoryArr?.[1]?.toFixed(2)}). Expenses: ${expenseSummary}`,
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
      
      const userName = profile.full_name || authUser.user.email.split('@')[0];
      const categoryName = topCategoryArr?.[0] || 'N/A';
      const formattedTotal = fmtAmount(totalSpent);

      // We explicitly compile the React Email JSX component blueprint down to a standard raw HTML string.
      // This strictly bypasses the Typescript Deno Bundler crash failing on TSX compilation during the deployment!
      const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head></head>
        <body style="background-color: #020617; color: #f8fafc; font-family: sans-serif; margin: 0; padding: 0;">
          <div style="padding: 40px 20px; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #10b981; font-size: 24px; margin-top: 0;">SpendSmart AI: ${monthName} Report</h1>
            <p style="font-size: 16px; margin-bottom: 24px;">Hi ${userName}, here is your financial snapshot for the month.</p>
            
            <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #1e293b; border-radius: 8px; margin: 20px 0;">
              <tr>
                <td style="padding: 20px; width: 50%; vertical-align: top;">
                  <p style="color: #94a3b8; margin: 0 0 4px 0; font-size: 14px;">Total Spent</p>
                  <h2 style="margin: 0; font-size: 22px;">${formattedTotal}</h2>
                </td>
                <td style="padding: 20px; width: 50%; vertical-align: top;">
                  <p style="color: #94a3b8; margin: 0 0 4px 0; font-size: 14px;">Top Category</p>
                  <h2 style="margin: 0; font-size: 20px;">${categoryName}</h2>
                </td>
              </tr>
            </table>

            <div style="background-color: #0f172a; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
              <p style="font-weight: bold; color: #10b981; margin: 0 0 8px 0; font-size: 15px;">AI Financial Insight:</p>
              <p style="font-style: italic; margin: 0; font-size: 15px; color: #cbd5e1; line-height: 1.5;">"${insight}"</p>
            </div>

            <p style="font-size: 12px; color: #64748b; margin-top: 24px; text-align: center;">
              Keep tracking to reach your savings goals!
            </p>
          </div>
        </body>
      </html>
      `;

      // Send report email
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "SpendSmart AI <onboarding@resend.dev>",
          to: authUser.user.email,
          subject: `📊 Your ${monthName} Spending Report`,
          html: emailHtml,
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
