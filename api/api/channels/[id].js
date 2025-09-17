// api/channels/[id].js
// Vercel Serverless function that proxies kukufm channel episodes endpoint
// GET /api/channels/:id/episodes

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    const { id } = req.query;
    // url can be: /api/channels/58559/episodes -> req.query.id === "58559"
    // but we need to support /api/channels/58559/episodes
    // Vercel maps /api/channels/[id].js, and the rest of the path (like 'episodes') will be in req.url.
    // We'll ensure the path ends with /episodes or has no extra path other than 'episodes'.

    // If the request path includes /episodes, proceed.
    const path = req.url || "";
    if (!path.includes("/episodes")) {
      return res.status(400).json({ error: "This endpoint serves channel episodes. Append /episodes to URL." });
    }

    if (!id) {
      return res.status(400).json({ error: "Missing channel id in path" });
    }

    const remoteUrl = `https://kukufm.com/api/v1/channels/${encodeURIComponent(id)}/episodes/`;

    const upstreamResp = await fetch(remoteUrl, {
      method: "GET",
      headers: {
        "User-Agent": "kuku-proxy/1.0 (+https://vercel.app)"
      }
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
    console.error("channels proxy error:", err);
    return res.status(500).json({ error: "Proxy error", details: String(err) });
  }
}
