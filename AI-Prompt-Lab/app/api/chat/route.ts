import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (process.env.AI_CHAT_ENABLED !== "true") return NextResponse.json({ error: "Live AI is paused. You can explore templates and save prompts. Enable AI_CHAT_ENABLED in .env.local after funding your OpenAI API account.", code: "AI_PAUSED" }, { status: 503 });
  try {
    const body = await request.json();
    if (!body || typeof body !== "object") return NextResponse.json({ error: "Send a JSON object containing messages." }, { status: 400 });
    if (!Array.isArray(body.messages) || !body.messages.length || body.messages.length > 100) return NextResponse.json({ error: "Send between 1 and 100 messages." }, { status: 400 });
    const messages = body.messages.map((item: unknown) => {
      if (!item || typeof item !== "object") throw new Error("Invalid message.");
      const message = item as { role: string; content: string };
      if (!["user", "assistant"].includes(message.role) || typeof message.content !== "string" || !message.content.trim() || message.content.length > 20000) throw new Error("Each message needs a user or assistant role and between 1 and 20,000 characters.");
      return { role: message.role, content: message.content };
    });
    const lastUser = [...messages].reverse().find(message => message.role === "user");
    if (!lastUser) return NextResponse.json({ error: "A user message is required." }, { status: 400 });
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) return NextResponse.json({ error: "Live AI is not configured. Add OPENAI_API_KEY to .env.local and restart the app.", code: "AI_SETUP_REQUIRED" }, { status: 503 });
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
    const bearer = request.headers.get("authorization");
    if (!supabaseUrl || !publicKey) return NextResponse.json({ error: "Add your Supabase project URL and publishable key to .env.local, then restart the app.", code: "AUTH_SETUP_REQUIRED" }, { status: 503 });
    if (!bearer?.startsWith("Bearer ")) return NextResponse.json({ error: "Sign in to chat with live AI." }, { status: 401 });
    const authResponse = await fetch(`${supabaseUrl.replace(/\/$/, "")}/auth/v1/user`, { headers: { apikey: publicKey, Authorization: bearer }, cache: "no-store", signal: AbortSignal.timeout(15000) });
    if (!authResponse.ok) return NextResponse.json({ error: authResponse.status === 401 || authResponse.status === 403 ? "Your session has expired. Please sign in again." : "Could not verify your account. Check the Supabase project URL and publishable key." }, { status: authResponse.status === 401 || authResponse.status === 403 ? 401 : 503 });
    const number = (value: unknown, fallback: number, min: number, max: number) => typeof value === "number" && Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, signal: AbortSignal.timeout(60000),
      body: JSON.stringify({
        model: body.model === "GPT-4o mini" ? "gpt-4o-mini" : "gpt-4o",
        messages: [{ role: "system", content: typeof body.systemPrompt === "string" ? body.systemPrompt.slice(0, 4000) : "You are a helpful assistant." }, ...messages],
        temperature: number(body.temperature, .7, 0, 1.5), max_completion_tokens: Math.floor(number(body.maxTokens, 1000, 100, 4000)),
        top_p: number(body.topP, 1, 0, 1), frequency_penalty: number(body.frequencyPenalty, 0, -2, 2), store: false,
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      const error = response.status === 401 ? "OpenAI rejected the API key. Update OPENAI_API_KEY in .env.local and restart the app." : response.status === 429 ? result.error?.code === "insufficient_quota" ? "Your OpenAI API account has no available quota. Check API billing and usage limits." : "The AI provider's rate limit was reached. Please try again shortly." : response.status === 404 ? "This model is unavailable for your OpenAI account. Try another model." : "The AI request failed. Check your server's provider configuration.";
      return NextResponse.json({ error }, { status: response.status === 429 ? 429 : 502 });
    }
    const reply = result.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) return NextResponse.json({ error: "The AI returned an empty response. Please try again." }, { status: 502 });
    return NextResponse.json({ message: reply });
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ error: "Invalid JSON request." }, { status: 400 });
    const message = error instanceof Error ? error.message : "";
    if (/^(Invalid message|Each message)/.test(message)) return NextResponse.json({ error: message }, { status: 400 });
    return NextResponse.json({ error: error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError") ? "The service took too long to respond. Please try again." : "Could not reach the AI or authentication service. Check your connection and service configuration." }, { status: 502 });
  }
}
