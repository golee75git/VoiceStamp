/**
 * VoiceStamp project collect API (FEAT-NCP-PROJECT-01).
 * NCP Object Storage via S3-compatible SigV4 (Node crypto only — no new npm deps).
 * Env: NCP_ACCESS_KEY, NCP_SECRET_KEY, NCP_BUCKET, optional PROJECT_PIN_SALT
 */
const crypto = require('crypto');
const https = require('https');

const REGION = 'kr-standard';
const HOST = 'kr.object.ncloudstorage.com';
const SERVICE = 's3';
const EXPIRES_GET = 900;

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    const max = 3_500_000;
    req.on('data', (c) => {
      size += c.length;
      if (size > max) {
        reject(new Error('payload_too_large'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('invalid_json'));
      }
    });
    req.on('error', reject);
  });
}

function requireNcp() {
  const accessKey = String(process.env.NCP_ACCESS_KEY || '').trim();
  const secretKey = String(process.env.NCP_SECRET_KEY || '').trim();
  const bucket = String(process.env.NCP_BUCKET || '').trim();
  if (!accessKey || !secretKey || !bucket) {
    const err = new Error('ncp_not_configured');
    err.code = 'ncp_not_configured';
    throw err;
  }
  return { accessKey, secretKey, bucket };
}

function hashSecret(projectId, value) {
  const salt = process.env.PROJECT_PIN_SALT || 'voicestamp-project-v1';
  return crypto.createHash('sha256').update(`${salt}:${projectId}:${value}`).digest('hex');
}

function randomToken(len) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.randomBytes(len);
  let out = '';
  for (let i = 0; i < len; i += 1) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

function projectIdNow() {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `VS-${y}${m}${day}-${randomToken(4)}`;
}

function hmac(key, data) {
  return crypto.createHmac('sha256', key).update(data, 'utf8').digest();
}

function sha256Hex(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function amzDate(date = new Date()) {
  // Strip to YYYYMMDDTHHmmssZ (16 chars including trailing Z). Do not append another Z.
  const iso = date.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const amz = iso.endsWith('Z') ? iso : iso + 'Z';
  return { amz: amz, short: amz.slice(0, 8) };
}

function signingKey(secretKey, shortDate) {
  const kDate = hmac(`AWS4${secretKey}`, shortDate);
  const kRegion = hmac(kDate, REGION);
  const kService = hmac(kRegion, SERVICE);
  return hmac(kService, 'aws4_request');
}

/** Encode path segments; leave / separators intact. */
function encodeKeyPath(key) {
  return String(key)
    .split('/')
    .map((seg) =>
      encodeURIComponent(seg).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase()),
    )
    .join('/');
}

/**
 * SigV4 PUT/DELETE for NCP Object Storage.
 * style: path|virtual, payloadMode: hash|unsigned, signContentType: boolean
 */
function buildSignedRequest({
  method,
  key,
  contentType,
  bodyBuf,
  accessKey,
  secretKey,
  bucket,
  style,
  payloadMode,
  signContentType,
}) {
  const { amz, short } = amzDate();
  const body = Buffer.isBuffer(bodyBuf) ? bodyBuf : Buffer.alloc(0);
  const payloadHash = payloadMode === 'unsigned' ? 'UNSIGNED-PAYLOAD' : sha256Hex(body);
  const host = style === 'virtual' ? bucket + '.' + HOST : HOST;
  const canonicalUri =
    style === 'virtual' ? '/' + encodeKeyPath(key) : '/' + bucket + '/' + encodeKeyPath(key);
  const headerMap = {
    host: host,
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': amz,
  };
  if (signContentType && contentType) {
    headerMap['content-type'] = contentType;
  }
  const signedHeaderNames = Object.keys(headerMap).sort();
  const canonicalHeaders = signedHeaderNames
    .map((n) => n + ':' + String(headerMap[n]).trim() + '\n')
    .join('');
  const signedHeaders = signedHeaderNames.join(';');
  const canonicalRequest = [method, canonicalUri, '', canonicalHeaders, signedHeaders, payloadHash].join(
    '\n',
  );
  const credentialScope = short + '/' + REGION + '/' + SERVICE + '/aws4_request';
  const stringToSign = ['AWS4-HMAC-SHA256', amz, credentialScope, sha256Hex(canonicalRequest)].join(
    '\n',
  );
  const sig = crypto
    .createHmac('sha256', signingKey(secretKey, short))
    .update(stringToSign, 'utf8')
    .digest('hex');
  const authorization =
    'AWS4-HMAC-SHA256 Credential=' +
    accessKey +
    '/' +
    credentialScope +
    ', SignedHeaders=' +
    signedHeaders +
    ', Signature=' +
    sig;
  const headers = {
    Host: host,
    'Content-Length': String(body.length),
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': amz,
    Authorization: authorization,
  };
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  return {
    hostname: host,
    path: canonicalUri,
    method: method,
    headers: headers,
    body: body,
    label: style + '-' + payloadMode + (signContentType ? '-ct' : '-noct'),
  };
}

function presignGet({ key, accessKey, secretKey, bucket, expiresSec = EXPIRES_GET }) {
  const { amz, short } = amzDate();
  const credentialScope = short + '/' + REGION + '/' + SERVICE + '/aws4_request';
  const credential = accessKey + '/' + credentialScope;
  const canonicalUri = '/' + bucket + '/' + encodeKeyPath(key);
  const queryPairs = [
    ['X-Amz-Algorithm', 'AWS4-HMAC-SHA256'],
    ['X-Amz-Credential', credential],
    ['X-Amz-Date', amz],
    ['X-Amz-Expires', String(expiresSec)],
    ['X-Amz-SignedHeaders', 'host'],
  ];
  const canonicalQuery = queryPairs
    .map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v))
    .join('&');
  const canonicalRequest = [
    'GET',
    canonicalUri,
    canonicalQuery,
    'host:' + HOST + '\n',
    'host',
    'UNSIGNED-PAYLOAD',
  ].join('\n');
  const stringToSign = ['AWS4-HMAC-SHA256', amz, credentialScope, sha256Hex(canonicalRequest)].join(
    '\n',
  );
  const sig = crypto
    .createHmac('sha256', signingKey(secretKey, short))
    .update(stringToSign, 'utf8')
    .digest('hex');
  return 'https://' + HOST + canonicalUri + '?' + canonicalQuery + '&X-Amz-Signature=' + sig;
}

function httpsRequest(opts) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: opts.hostname,
        path: opts.path,
        method: opts.method,
        headers: opts.headers,
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode || 0,
            body: Buffer.concat(chunks),
          });
        });
      },
    );
    req.on('error', reject);
    if (opts.body && opts.body.length) {
      req.write(opts.body);
    }
    req.end();
  });
}

let cachedPutMode = null;

function putModeList(preferred) {
  const all = [
    { style: 'path', payloadMode: 'hash', signContentType: false },
    { style: 'path', payloadMode: 'unsigned', signContentType: false },
    { style: 'virtual', payloadMode: 'hash', signContentType: false },
    { style: 'virtual', payloadMode: 'unsigned', signContentType: false },
    { style: 'path', payloadMode: 'hash', signContentType: true },
    { style: 'virtual', payloadMode: 'hash', signContentType: true },
  ];
  if (!preferred) {
    return all;
  }
  const key = preferred.style + preferred.payloadMode + String(preferred.signContentType);
  const rest = all.filter((m) => m.style + m.payloadMode + String(m.signContentType) !== key);
  return [preferred].concat(rest);
}

async function s3PutOnce(creds, key, contentType, bodyBuf, mode) {
  const signed = buildSignedRequest({
    method: 'PUT',
    key: key,
    contentType: contentType,
    bodyBuf: bodyBuf,
    accessKey: creds.accessKey,
    secretKey: creds.secretKey,
    bucket: creds.bucket,
    style: mode.style,
    payloadMode: mode.payloadMode,
    signContentType: mode.signContentType,
  });
  const res = await httpsRequest(signed);
  if (res.statusCode >= 200 && res.statusCode < 300) {
    return { style: signed.label, mode: mode };
  }
  const text = res.body.toString('utf8');
  const err = new Error('s3_put_' + res.statusCode);
  err.code = 's3_put_' + res.statusCode;
  err.detail = text.slice(0, 240);
  err.style = signed.label;
  throw err;
}

async function s3Put(creds, key, contentType, bodyBuf) {
  const modes = putModeList(cachedPutMode);
  let lastErr = null;
  for (let i = 0; i < modes.length; i += 1) {
    try {
      const ok = await s3PutOnce(creds, key, contentType, bodyBuf, modes[i]);
      cachedPutMode = modes[i];
      return ok;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('s3_put_failed');
}

async function s3Get(creds, key) {
  const url = presignGet({ key: key, accessKey: creds.accessKey, secretKey: creds.secretKey, bucket: creds.bucket });
  const res = await fetch(url);
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    const err = new Error('s3_get_' + res.status);
    err.code = 's3_get_' + res.status;
    throw err;
  }
  return Buffer.from(await res.arrayBuffer());
}

async function s3Delete(creds, key) {
  const mode = cachedPutMode || { style: 'path', payloadMode: 'hash', signContentType: false };
  const signed = buildSignedRequest({
    method: 'DELETE',
    key: key,
    contentType: '',
    bodyBuf: Buffer.alloc(0),
    accessKey: creds.accessKey,
    secretKey: creds.secretKey,
    bucket: creds.bucket,
    style: mode.style,
    payloadMode: mode.payloadMode,
    signContentType: false,
  });
  const res = await httpsRequest(signed);
  if (res.statusCode === 404 || (res.statusCode >= 200 && res.statusCode < 300)) {
    return;
  }
  const err = new Error('s3_delete_' + res.statusCode);
  err.code = 's3_delete_' + res.statusCode;
  err.detail = res.body.toString('utf8').slice(0, 240);
  err.style = signed.label;
  throw err;
}

async function ncpListProbe(creds) {
  const { amz, short } = amzDate();
  const payloadHash = 'UNSIGNED-PAYLOAD';
  const host = HOST;
  const canonicalUri = '/' + creds.bucket;
  const queryPairs = [
    ['list-type', '2'],
    ['max-keys', '1'],
  ];
  const canonicalQuery = queryPairs
    .map(([k, v]) => encodeURIComponent(k) + '=' + encodeURIComponent(v))
    .join('&');
  const headerMap = {
    host: host,
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': amz,
  };
  const signedHeaderNames = Object.keys(headerMap).sort();
  const canonicalHeaders = signedHeaderNames
    .map((n) => n + ':' + String(headerMap[n]).trim() + '\n')
    .join('');
  const signedHeaders = signedHeaderNames.join(';');
  const canonicalRequest = [
    'GET',
    canonicalUri,
    canonicalQuery,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join('\n');
  const credentialScope = short + '/' + REGION + '/' + SERVICE + '/aws4_request';
  const stringToSign = ['AWS4-HMAC-SHA256', amz, credentialScope, sha256Hex(canonicalRequest)].join(
    '\n',
  );
  const sig = crypto
    .createHmac('sha256', signingKey(creds.secretKey, short))
    .update(stringToSign, 'utf8')
    .digest('hex');
  const authorization =
    'AWS4-HMAC-SHA256 Credential=' +
    creds.accessKey +
    '/' +
    credentialScope +
    ', SignedHeaders=' +
    signedHeaders +
    ', Signature=' +
    sig;
  const res = await httpsRequest({
    hostname: host,
    path: canonicalUri + '?' + canonicalQuery,
    method: 'GET',
    headers: {
      Host: host,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amz,
      Authorization: authorization,
    },
    body: Buffer.alloc(0),
  });
  const text = res.body.toString('utf8');
  const codeMatch = text.match(/<Code>([^<]+)<\/Code>/);
  return {
    status: res.statusCode,
    ok: res.statusCode >= 200 && res.statusCode < 300,
    ncp: codeMatch ? codeMatch[1] : undefined,
    hint: text.slice(0, 160),
  };
}

async function ncpProbePutVariants(creds) {
  const bodyBuf = Buffer.from('ok', 'utf8');
  const modes = putModeList(null);
  const results = [];
  for (let i = 0; i < modes.length; i += 1) {
    const mode = modes[i];
    const probeKey = 'voicestamp/_probe/' + randomToken(6) + '.txt';
    try {
      const put = await s3PutOnce(creds, probeKey, 'text/plain', bodyBuf, mode);
      try {
        cachedPutMode = mode;
        await s3Delete(creds, probeKey);
      } catch (_e) {
        /* best-effort */
      }
      results.push({ label: put.style, ok: true });
      cachedPutMode = mode;
    } catch (e) {
      let ncpCode;
      if (e && e.detail) {
        const m = String(e.detail).match(/<Code>([^<]+)<\/Code>/);
        if (m) ncpCode = m[1];
      }
      results.push({
        label: e && e.style ? e.style : mode.style + '-' + mode.payloadMode,
        ok: false,
        detail: e && e.code ? e.code : 'fail',
        ncp: ncpCode,
      });
    }
  }
  return results;
}

function projectKey(projectId, suffix) {
  return `voicestamp/projects/${projectId}/${suffix}`;
}

async function loadProject(creds, projectId) {
  const buf = await s3Get(creds, projectKey(projectId, 'project.json'));
  if (!buf) return null;
  return JSON.parse(buf.toString('utf8'));
}

async function saveProject(creds, project) {
  const body = Buffer.from(JSON.stringify(project), 'utf8');
  await s3Put(creds, projectKey(project.projectId, 'project.json'), 'application/json', body);
}

async function loadManifest(creds, projectId) {
  const buf = await s3Get(creds, projectKey(projectId, 'manifest.json'));
  if (!buf) {
    return { version: 1, stamps: [], lastUploadAt: null };
  }
  return JSON.parse(buf.toString('utf8'));
}

async function saveManifest(creds, projectId, manifest) {
  const body = Buffer.from(JSON.stringify(manifest), 'utf8');
  await s3Put(creds, projectKey(projectId, 'manifest.json'), 'application/json', body);
}

function assertUploadCode(project, code) {
  if (!code || hashSecret(project.projectId, String(code)) !== project.uploadCodeHash) {
    const err = new Error('bad_upload_code');
    err.code = 'bad_upload_code';
    throw err;
  }
}

function assertCollectorPin(project, pin) {
  if (!pin || hashSecret(project.projectId, String(pin)) !== project.collectorPinHash) {
    const err = new Error('bad_collector_pin');
    err.code = 'bad_collector_pin';
    throw err;
  }
}

function assertNotExpired(project) {
  if (project.closedAt || (project.expiresAt && Date.now() > project.expiresAt)) {
    const err = new Error('project_expired');
    err.code = 'project_expired';
    throw err;
  }
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    json(res, 405, { error: 'method_not_allowed' });
    return;
  }

  try {
    const body = await readBody(req);
    const action = String(body.action || '');
    const creds = requireNcp();

    if (action === 'create') {
      const name = String(body.name || '').trim().slice(0, 40);
      const ttlDays = [3, 7, 14, 30].includes(Number(body.ttlDays)) ? Number(body.ttlDays) : 7;
      const collectorPin = String(body.collectorPin || '');
      if (!name || !/^\d{4,6}$/.test(collectorPin)) {
        json(res, 400, { error: 'invalid_create' });
        return;
      }
      const projectId = projectIdNow();
      const uploadCode = randomToken(6);
      const now = Date.now();
      const project = {
        projectId,
        name,
        createdAt: now,
        expiresAt: now + ttlDays * 24 * 60 * 60 * 1000,
        ttlDays,
        uploadCodeHash: hashSecret(projectId, uploadCode),
        collectorPinHash: hashSecret(projectId, collectorPin),
        closedAt: null,
      };
      await saveProject(creds, project);
      await saveManifest(creds, projectId, { version: 1, stamps: [], lastUploadAt: null });
      json(res, 200, {
        projectId,
        name,
        uploadCode,
        expiresAt: project.expiresAt,
        ttlDays,
        qrPayload: `https://voicestamp-gilt.vercel.app/join?p=${encodeURIComponent(projectId)}&c=${encodeURIComponent(uploadCode)}`,
      });
      return;
    }

    if (action === 'upload') {
      const projectId = String(body.projectId || '');
      const uploadCode = String(body.uploadCode || '');
      const stampId = String(body.stampId || '').slice(0, 80);
      const imageBase64 = String(body.imageBase64 || '');
      const meta = body.meta && typeof body.meta === 'object' ? body.meta : {};
      if (!projectId || !stampId || !imageBase64) {
        json(res, 400, { error: 'invalid_upload' });
        return;
      }
      const project = await loadProject(creds, projectId);
      if (!project) {
        json(res, 404, { error: 'not_found' });
        return;
      }
      assertNotExpired(project);
      assertUploadCode(project, uploadCode);
      const imgBuf = Buffer.from(imageBase64, 'base64');
      if (imgBuf.length < 32 || imgBuf.length > 2_800_000) {
        json(res, 400, { error: 'bad_image' });
        return;
      }
      await s3Put(creds, projectKey(projectId, `stamps/${stampId}.jpg`), 'image/jpeg', imgBuf);
      const stampMeta = {
        stampId,
        projectId,
        uploadedByDeviceId: meta.uploadedByDeviceId || null,
        uploadedAt: Date.now(),
        title: String(meta.title || '').slice(0, 200),
        memo: String(meta.memo || '').slice(0, 4000),
        placeLabel: meta.placeLabel ?? null,
        floor: meta.floor ?? null,
        latitude: meta.latitude ?? null,
        longitude: meta.longitude ?? null,
        createdAt: meta.createdAt ?? Date.now(),
        localGroupName: meta.localGroupName ?? null,
      };
      await s3Put(
        creds,
        projectKey(projectId, `meta/${stampId}.json`),
        'application/json',
        Buffer.from(JSON.stringify(stampMeta), 'utf8'),
      );
      const manifest = await loadManifest(creds, projectId);
      const stamps = Array.isArray(manifest.stamps) ? manifest.stamps.filter((s) => s.stampId !== stampId) : [];
      stamps.push({
        stampId,
        title: stampMeta.title,
        uploadedAt: stampMeta.uploadedAt,
        uploadedByDeviceId: stampMeta.uploadedByDeviceId,
      });
      manifest.stamps = stamps;
      manifest.lastUploadAt = stampMeta.uploadedAt;
      await saveManifest(creds, projectId, manifest);
      json(res, 200, { ok: true, stampId });
      return;
    }

    if (action === 'manifest') {
      const projectId = String(body.projectId || '');
      const collectorPin = String(body.collectorPin || '');
      const project = await loadProject(creds, projectId);
      if (!project) {
        json(res, 404, { error: 'not_found' });
        return;
      }
      assertCollectorPin(project, collectorPin);
      const manifest = await loadManifest(creds, projectId);
      json(res, 200, {
        projectId,
        name: project.name,
        expiresAt: project.expiresAt,
        closedAt: project.closedAt,
        stamps: manifest.stamps || [],
        lastUploadAt: manifest.lastUploadAt,
      });
      return;
    }

    if (action === 'download') {
      const projectId = String(body.projectId || '');
      const collectorPin = String(body.collectorPin || '');
      const stampId = String(body.stampId || '');
      const project = await loadProject(creds, projectId);
      if (!project) {
        json(res, 404, { error: 'not_found' });
        return;
      }
      assertCollectorPin(project, collectorPin);
      const metaBuf = await s3Get(creds, projectKey(projectId, `meta/${stampId}.json`));
      const imgBuf = await s3Get(creds, projectKey(projectId, `stamps/${stampId}.jpg`));
      if (!metaBuf || !imgBuf) {
        json(res, 404, { error: 'stamp_not_found' });
        return;
      }
      json(res, 200, {
        meta: JSON.parse(metaBuf.toString('utf8')),
        imageBase64: imgBuf.toString('base64'),
      });
      return;
    }

    if (action === 'importAck') {
      const projectId = String(body.projectId || '');
      const collectorPin = String(body.collectorPin || '');
      const stampId = String(body.stampId || '');
      const project = await loadProject(creds, projectId);
      if (!project) {
        json(res, 404, { error: 'not_found' });
        return;
      }
      assertCollectorPin(project, collectorPin);
      await s3Delete(creds, projectKey(projectId, `stamps/${stampId}.jpg`));
      await s3Delete(creds, projectKey(projectId, `meta/${stampId}.json`));
      const manifest = await loadManifest(creds, projectId);
      manifest.stamps = (manifest.stamps || []).filter((s) => s.stampId !== stampId);
      await saveManifest(creds, projectId, manifest);
      json(res, 200, { ok: true });
      return;
    }

    if (action === 'close') {
      const projectId = String(body.projectId || '');
      const collectorPin = String(body.collectorPin || '');
      const project = await loadProject(creds, projectId);
      if (!project) {
        json(res, 404, { error: 'not_found' });
        return;
      }
      assertCollectorPin(project, collectorPin);
      project.closedAt = Date.now();
      await saveProject(creds, project);
      json(res, 200, { ok: true });
      return;
    }

    if (action === 'rotateUploadCode') {
      const projectId = String(body.projectId || '');
      const collectorPin = String(body.collectorPin || '');
      const project = await loadProject(creds, projectId);
      if (!project) {
        json(res, 404, { error: 'not_found' });
        return;
      }
      assertCollectorPin(project, collectorPin);
      assertNotExpired(project);
      const uploadCode = randomToken(6);
      project.uploadCodeHash = hashSecret(projectId, uploadCode);
      await saveProject(creds, project);
      json(res, 200, {
        uploadCode,
        qrPayload: `https://voicestamp-gilt.vercel.app/join?p=${encodeURIComponent(projectId)}&c=${encodeURIComponent(uploadCode)}`,
      });
      return;
    }

    if (action === 'lookup') {
      // Public name lookup for join confirm (no secrets). Optional.
      const projectId = String(body.projectId || '');
      const project = await loadProject(creds, projectId);
      if (!project || project.closedAt) {
        json(res, 404, { error: 'not_found' });
        return;
      }
      json(res, 200, {
        projectId: project.projectId,
        name: project.name,
        expiresAt: project.expiresAt,
        ttlDays: project.ttlDays,
      });
      return;
    }

    if (action === 'ncpProbe') {
      const list = await ncpListProbe(creds);
      const variants = await ncpProbePutVariants(creds);
      const winner = variants.find((v) => v.ok);
      json(res, 200, {
        ok: Boolean(winner),
        bucket: creds.bucket,
        accessKeyPrefix: creds.accessKey.slice(0, 6),
        accessKeyLen: creds.accessKey.length,
        secretKeyLen: creds.secretKey.length,
        style: winner ? winner.label : undefined,
        list: list,
        variants: variants.map((v) => ({
          label: v.label,
          ok: v.ok,
          detail: v.detail,
          ncp: v.ncp,
        })),
      });
      return;
    }

    json(res, 400, { error: 'unknown_action' });
  } catch (e) {
    const code = e && e.code ? e.code : e && e.message ? e.message : 'error';
    if (code === 'ncp_not_configured') {
      json(res, 503, { error: 'ncp_not_configured' });
      return;
    }
    if (code === 'bad_upload_code' || code === 'bad_collector_pin') {
      json(res, 401, { error: code });
      return;
    }
    if (code === 'project_expired') {
      json(res, 410, { error: code });
      return;
    }
    if (code === 'payload_too_large' || code === 'invalid_json') {
      json(res, 400, { error: code });
      return;
    }
    console.error('project api', e);
    const credsSafe = (() => {
      try {
        const c = requireNcp();
        return { bucket: c.bucket, accessKeyPrefix: c.accessKey.slice(0, 6) };
      } catch {
        return {};
      }
    })();
    json(res, 500, {
      error: 'server_error',
      detail: String(code).slice(0, 80),
      hint: e && e.detail ? String(e.detail).slice(0, 200) : undefined,
      style: e && e.style ? e.style : undefined,
      bucket: credsSafe.bucket,
      accessKeyPrefix: credsSafe.accessKeyPrefix,
    });
  }
};
