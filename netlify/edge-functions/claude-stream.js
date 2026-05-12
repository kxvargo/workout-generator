// Edge Function that proxies Claude's streaming API.
// Unlike Lambda functions (which time out at 10-26s waiting for the full
// response), Edge Functions support long-lived streaming responses — they
// just need to send the first bytes within the initial timeout.
//
// The client reads the SSE stream and accumulates text deltas as they arrive.

export default async (request, context) => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const maxTokens = Math.min(Math.max(body.max_tokens || 4000, 500), 8000);
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system: body.system,
      messages: body.messages,
      stream: true,
    }),
  });

  if (!upstream.ok) {
    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Pipe Claude's SSE stream straight through to the browser.
  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
};

export const config = { path: "/api/claude-stream" };
