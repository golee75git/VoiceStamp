const BASE = 'https://countapi.mileshilliard.com/api/v1';
const KEY_PREFIX = 'voicestamp-gilt-landing';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function dailyCounterKey() {
  return `${KEY_PREFIX}-${todayKey()}`;
}

function totalCounterKey() {
  return `${KEY_PREFIX}-total`;
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
