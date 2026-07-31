const BASE = 'https://countapi.mileshilliard.com/api/v1';
const KEY_PREFIX = 'voicestamp-gilt-landing';

/** Best-effort per-instance POST throttle (serverless instances do not share memory). */
const POST_WINDOW_MS = 60_000;
const POST_MAX_PER_WINDOW = 20;
const postHitsByIp = new Map();

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function dailyCounterKey() {
  return `${KEY_PREFIX}-${todayKey()}`;
}

function totalCounterKey() {
  return `${KEY_PREFIX}-total`;
}

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return String(forwarded[0]).split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

function allowPost(ip) {
  const now = Date.now();
  let entry = postHitsByIp.get(ip);
  if (!entry || now - entry.windowStart >= POST_WINDOW_MS) {
    entry = { windowStart: now, count: 0 };
    postHitsByIp.set(ip, entry);
  }
  entry.count += 1;
  if (postHitsByIp.size > 5000) {
    for (const [key, value] of postHitsByIp) {
      if (now - value.windowStart >= POST_WINDOW_MS) {
        postHitsByIp.delete(key);
      }
    }
  }
  return entry.count <= POST_MAX_PER_WINDOW;
}

function isAllowedPostOrigin(req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host || '';
  const hostStr = Array.isArray(host) ? host[0] : String(host);
  if (!hostStr) {
    return false;
  }
  const allowed = new Set([
    `https://${hostStr}`,
    `http://${hostStr}`,
  ]);
  // Production alias (same project).
  allowed.add('https://voicestamp-gilt.vercel.app');

  const origin = req.headers.origin;
  if (typeof origin === 'string' && allowed.has(origin)) {
    return true;
  }
  const referer = req.headers.referer;
  if (typeof referer === 'string') {
    try {
      const refOrigin = new URL(referer).origin;
      if (allowed.has(refOrigin)) {
        return true;
      }
    } catch {
      return false;
    }
  }
  // Same-origin fetch from landing often sends Origin; reject bare scripted POSTs without either.
  return false;
}

async function countGet(key) {
  const res = await fetch(`${BASE}/get/${encodeURIComponent(key)}`);
  if (!res.ok) throw new Error('count get failed');
  const data = await res.json();
  const value = Number(data.value);
  return Number.isFinite(value) ? value : 0;
}

async function countHit(key) {
  const res = await fetch(`${BASE}/hit/${encodeURIComponent(key)}`);
  if (!res.ok) throw new Error('count hit failed');
  const data = await res.json();
  const value = Number(data.value);
  return Number.isFinite(value) ? value : 0;
}

async function readStats() {
  const today = todayKey();
  const [daily, total] = await Promise.all([
    countGet(dailyCounterKey()),
    countGet(totalCounterKey()),
  ]);
  return { daily, total, today };
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');

  try {
    if (req.method === 'GET') {
      return res.status(200).json(await readStats());
    }

    if (req.method === 'POST') {
      if (!isAllowedPostOrigin(req)) {
        return res.status(403).json({ error: 'forbidden' });
      }
      const ip = clientIp(req);
      if (!allowPost(ip)) {
        return res.status(429).json({ error: 'too many requests' });
      }
      const today = todayKey();
      const [daily, total] = await Promise.all([
        countHit(dailyCounterKey()),
        countHit(totalCounterKey()),
      ]);
      return res.status(200).json({ daily, total, today });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch {
    return res.status(503).json({ error: 'counter unavailable' });
  }
};
