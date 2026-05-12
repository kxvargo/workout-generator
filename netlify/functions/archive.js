// Persistent archive storage backed by Netlify Blobs.
// GET    /archive  → { archive: [...] }
// POST   /archive  → { ok: true }   body: { archive: [...] }
//
// This is a single shared archive (no auth). Suitable for a single-instructor
// site. If you ever want per-user archives, swap KEY for a user-derived key.

const { getStore } = require("@netlify/blobs");

const STORE_NAME = "workout-archive";
const KEY = "archive.json";

exports.handler = async function (event) {
  try {
    const store = getStore(STORE_NAME);

    if (event.httpMethod === "GET") {
      const raw = await store.get(KEY);
      const archive = raw ? JSON.parse(raw) : [];
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        body: JSON.stringify({ archive }),
      };
    }

    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      if (!Array.isArray(body.archive)) {
        return { statusCode: 400, body: JSON.stringify({ error: "archive must be an array" }) };
      }
      await store.set(KEY, JSON.stringify(body.archive));
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ok: true, count: body.archive.length }),
      };
    }

    return { statusCode: 405, body: "Method Not Allowed" };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
