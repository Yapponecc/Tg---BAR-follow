import http from "http";
import fs from "fs";
import path from "path";
import { URL } from "url";

const ROOT = path.resolve(".");
const PUBLIC_DIR = path.join(ROOT, "public");
const PORT = Number(process.env.PORT || 8787);
const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN || "";
const TG_CHAT_ID = process.env.TG_CHAT_ID || "";
const POLL_MS = Math.max(5000, Number(process.env.POLL_MS || 15000));

let cache = { value: null, at: 0, source: "empty" };

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".html") return "text/html; charset=utf-8";
  if (ext === ".css") return "text/css; charset=utf-8";
  if (ext === ".js") return "application/javascript; charset=utf-8";
  if (ext === ".json") return "application/json; charset=utf-8";
  if (ext === ".svg") return "image/svg+xml";
  return "application/octet-stream";
}

function sendJson(res, code, data) {
  const body = JSON.stringify(data);
  res.writeHead(code, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*"
  });
  res.end(body);
}

async function fetchTelegramCount() {
  if (!TG_BOT_TOKEN || !TG_CHAT_ID) throw new Error("TG_BOT_TOKEN or TG_CHAT_ID missing");
  const endpoint = `https://api.telegram.org/bot${TG_BOT_TOKEN}/getChatMemberCount?chat_id=${encodeURIComponent(TG_CHAT_ID)}`;
  const resp = await fetch(endpoint);
  if (!resp.ok) throw new Error(`Telegram HTTP ${resp.status}`);
  const data = await resp.json();
  if (!data.ok) throw new Error(`Telegram API error: ${data.description || "unknown"}`);
  return Number(data.result);
}

async function refreshCache(force = false) {
  const now = Date.now();
  if (!force && cache.value !== null && now - cache.at < POLL_MS) return cache;
  const val = await fetchTelegramCount();
  cache = { value: val, at: now, source: "telegram" };
  return cache;
}

function serveFile(reqPath, res) {
  let safe = reqPath === "/" ? "/index.html" : reqPath;
  safe = safe.split("?")[0];
  const full = path.normalize(path.join(PUBLIC_DIR, safe));
  if (!full.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  fs.readFile(full, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": contentType(full), "Cache-Control": "no-cache" });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === "/api/subscribers") {
    try {
      const data = await refreshCache(url.searchParams.get("force") === "1");
      sendJson(res, 200, { ok: true, count: data.value, updatedAt: data.at, source: data.source });
    } catch (error) {
      sendJson(res, 500, { ok: false, error: String(error.message || error), hint: "Check TG_BOT_TOKEN, TG_CHAT_ID and bot/channel permissions" });
    }
    return;
  }
  serveFile(url.pathname, res);
});

server.listen(PORT, () => console.log(`[tg-live-overlay] http://localhost:${PORT}`));
