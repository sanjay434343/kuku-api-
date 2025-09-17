// api/search.js
// Vercel Serverless function that proxies kukufm search endpoint
// GET /api/search?q=ramayan

export default async function handler(req, res) {
  // Allow CORS for all origins (adjust for production)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    // preflight
    return res.status(204).end();
  }

  try {
    const q = req.query.q || "";
    if (!q) {
      return res.status(400).json({ error: "Missing 'q' query parameter" });
    }

    // Build remote URL
    const remoteUrl = `https://kukufm.com/api/v1/search/?q=${encodeURIComponent(q)}`;

    // Use global fetch (Node 18+ / Vercel runtime). If your runtime doesn't support fetch,
    // install node-fetch and replace with that.
    const upstreamResp = await fetch(remoteUrl, {
      method: "GET",
      headers: {
        // forward some headers if needed
        "User-Agent": "kuku-proxy/1.0 (+https://vercel.app)"
      },
      // you can set a timeout via AbortController if desired
    });

    // forward status and JSON (or text) back to client
    const contentType = upstreamResp.headers.get("content-type") || "";
    const status = upstreamResp.status;

    // If JSON
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
