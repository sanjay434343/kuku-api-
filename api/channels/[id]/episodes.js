// api/channels/[id]/episodes.js
// GET /api/channels/:id/episodes
// Proxies Kukufm channel episodes endpoint

export default async function handler(req, res) {
  // Allow CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "Missing channel id" });
    }

    const remoteUrl = `https://kukufm.com/api/v1/channels/${encodeURIComponent(id)}/episodes/`;

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
    console.error("episodes proxy error:", err);
    return res.status(500).json({ error: "Proxy error", details: String(err) });
  }
}
