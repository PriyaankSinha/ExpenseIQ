// @ts-nocheck
// supabase/functions/daily-reminder/index.ts
// Deploy: supabase functions deploy daily-reminder
// Schedule: Set up a cron job to invoke this function periodically (e.g., every 15 minutes)
// NOTE: This file runs on Deno (Supabase Edge Runtime), not Node.js.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://sxrjsusozqeioldhtuex.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface ProfileRow {
  id: string;
  full_name: string | null;
  notification_time: string | null;
  last_notified_at: string | null;
  timezone: string | null;
}

Deno.serve(async (_req: Request) => {
  try {
    const now = new Date();

    // Get all users with notification settings
    const { data: profiles, error: profileErr } = await supabase
      .from("profiles")
      .select("id, full_name, notification_time, last_notified_at, timezone")
      .not("notification_time", "is", null);

    if (profileErr) throw profileErr;

    const eligibleUsers = ((profiles as ProfileRow[]) ?? []).filter((p: ProfileRow) => {
      if (!p.notification_time) return false;

      // Get current time in user's timezone (default Asia/Kolkata)
      const userTimezone = p.timezone || "Asia/Kolkata";
      const userLocalTime = new Intl.DateTimeFormat("en-GB", {
        timeZone: userTimezone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(now); // e.g. "18:10"

      const userLocalDate = new Intl.DateTimeFormat("en-CA", {
        timeZone: userTimezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(now); // e.g. "2026-03-28"

      const notifTime = p.notification_time.slice(0, 5);
      
      // Check if already notified today (in user's local date)
      const alreadyNotified = p.last_notified_at && p.last_notified_at.startsWith(userLocalDate);

      // Within a 15-minute window after the notification time
      const [notifH, notifM] = notifTime.split(":").map(Number);
      const [currH, currM] = userLocalTime.split(":").map(Number);
      const notifMinutes = (notifH ?? 0) * 60 + (notifM ?? 0);
      const currMinutes = (currH ?? 0) * 60 + (currM ?? 0);
      const inWindow = currMinutes >= notifMinutes && currMinutes < notifMinutes + 15;

      return inWindow && !alreadyNotified;
    });

    for (const user of eligibleUsers) {
      // Get user's local date for the expense check
      const userTimezone = user.timezone || "Asia/Kolkata";
      const userLocalDate = new Intl.DateTimeFormat("en-CA", {
        timeZone: userTimezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(now);

      // Check if user has any expense today (in their local date)
      const { count } = await supabase
        .from("expenses")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("date", userLocalDate);

      if ((count ?? 0) > 0) continue; // Already logged today

      // Get user email
      const { data: authUser } = await supabase.auth.admin.getUserById(user.id);
      if (!authUser?.user?.email) continue;

      // Send reminder email via Resend
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "SpendSmart AI <onboarding@resend.dev>",
          to: authUser.user.email,
          subject: "💸 Don't forget to track your expenses today!",
          html: `
            <div style="font-family: 'Inter', sans-serif; max-width: 480px; margin: 0 auto; background: #0f172a; border-radius: 16px; padding: 32px; color: #f1f5f9;">
              <div style="text-align: center; margin-bottom: 24px;">
                <div style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); border-radius: 12px; padding: 12px;">
                  <span style="font-size: 24px;">💰</span>
                </div>
              </div>
              <h1 style="text-align: center; font-size: 20px; color: #f1f5f9; margin-bottom: 8px;">
                Hey${user.full_name ? ` ${user.full_name}` : ""}! 👋
              </h1>
              <p style="text-align: center; color: #94a3b8; font-size: 14px; line-height: 1.6;">
                We noticed you haven't logged any expenses today. 
                Take a moment to track your spending — your future self will thank you!
              </p>
              <div style="text-align: center; margin-top: 24px;">
                <a href="https://spendsmartai.vercel.app/"
                   style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-weight: 600; font-size: 14px;">
                  Log an Expense →
                </a>
              </div>
              <p style="text-align: center; color: #475569; font-size: 11px; margin-top: 24px;">
                SpendSmart AI • Intelligent expense tracking
              </p>
            </div>
          `,
        }),
      });

      // Update last_notified_at
      await supabase
        .from("profiles")
        .update({ last_notified_at: now.toISOString() })
        .eq("id", user.id);
    }

    return new Response(
      JSON.stringify({ success: true, notified: eligibleUsers.length }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
