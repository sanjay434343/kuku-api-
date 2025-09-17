// api/search.js
// GET /api/search?q=ramayan&limit=10&offset=0

export default async function handler(req, res) {
  // Allow CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    const q = req.query.q || "";
    const limit = req.query.limit || 10;
    const offset = req.query.offset || 0;

    if (!q) {
      return res.status(400).json({ error: "Missing 'q' query parameter" });
    }

    const remoteUrl = `https://kukufm.com/api/v1/search/?q=${encodeURIComponent(q)}&size=${limit}&offset=${offset}`;

    const upstreamResp = await fetch(remoteUrl, {
      method: "GET",
      headers: { "User-Agent": "kuku-proxy/1.0 (+https://vercel.app)" }
    });

    const contentType = upstreamResp.headers.get("content-type") || "";
    const status = upstreamResp.status;

    if (contentType.includes("application/json")) {
      const json = await upstreamResp.json();
      return res.status(status).json(json);
    } else {
      const text = await upstreamResp.text();
      res.setHeader("Content-Type", contentType || "text/plain");
      return res.status(status).send(text);
    }
  } catch (err) {
    console.error("search proxy error:", err);
    return res.status(500).json({ error: "Proxy error", details: String(err) });
  }
}
