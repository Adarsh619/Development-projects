import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export function GET() {
  return NextResponse.json({
    aiConfigured: Boolean(process.env.OPENAI_API_KEY?.trim()),
    aiEnabled: process.env.AI_CHAT_ENABLED === "true",
    authConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim())),
  }, { headers: { "Cache-Control": "no-store" } });
}
