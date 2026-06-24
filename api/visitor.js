const NS = 'voicestamp-gilt';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

async function countApiGet(key) {
  const res = await fetch(`https://api.countapi.xyz/get/${NS}/${key}`);
  if (!res.ok) throw new Error('count get failed');
  const data = await res.json();
  return typeof data.value === 'number' ? data.value : 0;
}

async function countApiHit(key) {
  const res = await fetch(`https://api.countapi.xyz/hit/${NS}/${key}`);
  if (!res.ok) throw new Error('count hit failed');
  const data = await res.json();
  return typeof data.value === 'number' ? data.value : 0;
}

async function readStats() {
  const today = todayKey();
  const [daily, total] = await Promise.all([
    countApiGet(`landing-${today}`),
    countApiGet('landing-total'),
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
        countApiHit(`landing-${today}`),
        countApiHit('landing-total'),
      ]);
      return res.status(200).json({ daily, total, today });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed' });
  } catch {
    return res.status(503).json({ error: 'counter unavailable' });
  }
};
