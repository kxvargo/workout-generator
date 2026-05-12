// Persistent archive storage backed by Netlify Blobs.
// Uses Netlify Functions v2 syntax (export default + Response) so that
// @netlify/blobs auto-detects siteID and token from the function context.
//
//   GET  /api/archive  → { archive: [...] }
//   POST /api/archive  → { ok: true }  body: { archive: [...] }

import { getStore } from "@netlify/blobs";

const STORE_NAME = "workout-archive";
const KEY = "archive.json";

export default async (req) => {
  try {
    const store = getStore(STORE_NAME);

    if (req.method === "GET") {
      const raw = await store.get(KEY);
      const archive = raw ? JSON.parse(raw) : [];
      return new Response(JSON.stringify({ archive }), {
        status: 200,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      });
    }

    if (req.method === "POST") {
      const body = await req.json();
      if (!Array.isArray(body.archive)) {
        return new Response(JSON.stringify({ error: "archive must be an array" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      await store.set(KEY, JSON.stringify(body.archive));
      return new Response(JSON.stringify({ ok: true, count: body.archive.length }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Method Not Allowed", { status: 405 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = { path: "/api/archive" };
