/**
 * Extract npm (package-lock.json) + Android Gradle releaseRuntimeClasspath licenses
 * into assets/open_source_licenses.json
 *
 * Usage: node scripts/generate-open-source-licenses.mjs
 * Optional: pass path to gradle dependencies output (default: tmp-gradle-deps.txt)
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT = path.join(ROOT, 'assets', 'open_source_licenses.json');
const LOCKFILE = path.join(ROOT, 'package-lock.json');
const DEFAULT_GRADLE_LOG = path.join(ROOT, 'tmp-gradle-deps.txt');

const REVIEW_RULES = [
  { pattern: /\bAGPL(?:-|\s|$)/i, label: 'AGPL' },
  { pattern: /\bGPL(?:-|\s|$|\d)/i, label: 'GPL' },
  { pattern: /\bLGPL(?:-|\s|$|\d)/i, label: 'LGPL' },
  { pattern: /\bSSPL\b/i, label: 'SSPL' },
  { pattern: /Commons\s+Clause/i, label: 'Commons Clause' },
  { pattern: /\bEUPL\b/i, label: 'EUPL' },
  { pattern: /\bOSL(?:-|\s|$|\d)/i, label: 'OSL' },
  { pattern: /\bCPAL\b/i, label: 'CPAL' },
];

const LICENSE_FILE_NAMES = [
  'LICENSE',
  'LICENSE.md',
  'LICENSE.markdown',
  'LICENSE.txt',
  'LICENSE-MIT',
  'LICENCE',
  'LICENCE.md',
  'COPYING',
  'COPYING.txt',
  'Notice.txt',
  'UNLICENSE',
];

function normalizeLicenseName(raw) {
  if (!raw) return 'UNKNOWN';
  if (typeof raw === 'string') return raw.trim() || 'UNKNOWN';
  if (Array.isArray(raw)) {
    return raw.map((item) => normalizeLicenseName(item)).filter(Boolean).join(' OR ') || 'UNKNOWN';
  }
  if (typeof raw === 'object') {
    if (raw.type) return String(raw.type).trim();
    if (raw.name) return String(raw.name).trim();
    return JSON.stringify(raw);
  }
  return String(raw).trim() || 'UNKNOWN';
}

function extractCopyright(licenseText, pkgJson) {
  if (licenseText) {
    const lines = licenseText.split(/\r?\n/).slice(0, 8);
    for (const line of lines) {
      const trimmed = line.trim();
      if (/copyright/i.test(trimmed)) return trimmed;
    }
  }
  if (pkgJson?.author) {
    const author =
      typeof pkgJson.author === 'string'
        ? pkgJson.author
        : pkgJson.author.name
          ? `${pkgJson.author.name}${pkgJson.author.email ? ` <${pkgJson.author.email}>` : ''}`
          : null;
    if (author) return `Copyright (c) ${author}`;
  }
  return '';
}

function readLicenseText(packageDir) {
  if (!packageDir || !fs.existsSync(packageDir)) return '';
  for (const name of LICENSE_FILE_NAMES) {
    const candidate = path.join(packageDir, name);
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return fs.readFileSync(candidate, 'utf8').trim();
    }
  }
  return '';
}

function readPkgJson(packageDir) {
  const candidate = path.join(packageDir, 'package.json');
  if (!fs.existsSync(candidate)) return null;
  try {
    return JSON.parse(fs.readFileSync(candidate, 'utf8'));
  } catch {
    return null;
  }
}

function packageNameFromLockPath(lockPath) {
  if (!lockPath || lockPath === '') return null;
  const idx = lockPath.lastIndexOf('node_modules/');
  if (idx === -1) return null;
  return lockPath.slice(idx + 'node_modules/'.length);
}

function isReviewRequired(licenseName) {
  const haystack = licenseName || '';
  const hits = [];
  for (const rule of REVIEW_RULES) {
    if (rule.pattern.test(haystack)) {
      hits.push(rule.label);
    }
  }
  return hits;
}

function collectNpmLibraries() {
  const lock = JSON.parse(fs.readFileSync(LOCKFILE, 'utf8'));
  const libraries = [];
  const seen = new Set();

  for (const [lockPath, meta] of Object.entries(lock.packages ?? {})) {
    if (!meta?.version) continue;
    const name = meta.name ?? packageNameFromLockPath(lockPath);
    if (!name) continue;

    const id = `npm:${name}@${meta.version}`;
    if (seen.has(id)) continue;
    seen.add(id);

    const packageDir = path.join(ROOT, lockPath.replace(/\//g, path.sep));
    const pkgJson = readPkgJson(packageDir);
    const license = normalizeLicenseName(meta.license ?? pkgJson?.license);
    const licenseText = readLicenseText(packageDir);
    const copyright = extractCopyright(licenseText, pkgJson);

    libraries.push({
      id,
      name,
      version: meta.version,
      license,
      copyright,
      licenseText: licenseText || `License: ${license}\n\nFull license text was not bundled in the package.`,
      source: 'npm',
      repository: typeof pkgJson?.repository === 'string' ? pkgJson.repository : pkgJson?.repository?.url ?? '',
    });
  }

  return libraries.sort((a, b) => a.name.localeCompare(b.name) || a.version.localeCompare(b.version));
}

function parseGradleCoordinates(text) {
  const coords = new Map();
  const lines = text.split(/\r?\n/);
  const coordRe = /([a-zA-Z0-9._-]+):([a-zA-Z0-9._-]+):([^\s->]+)(?:\s->\s+([^\s(*]+))?/g;

  for (const line of lines) {
    if (line.includes('project :')) continue;
    let match;
    while ((match = coordRe.exec(line)) !== null) {
      const group = match[1];
      const artifact = match[2];
      const resolved = (match[4] ?? match[3]).replace(/\s+\(.*$/, '').trim();
      if (!group || !artifact || !resolved || resolved === '(n)') continue;
      if (group === 'unspecified') continue;
      const key = `${group}:${artifact}:${resolved}`;
      coords.set(key, { group, artifact, version: resolved });
    }
  }

  return [...coords.values()].sort(
    (a, b) =>
      a.group.localeCompare(b.group) ||
      a.artifact.localeCompare(b.artifact) ||
      a.version.localeCompare(b.version),
  );
}

function findGradleCachePom(group, artifact, version) {
  const cacheRoot = path.join(os.homedir(), '.gradle', 'caches', 'modules-2', 'files-2.1');
  const versionDir = path.join(cacheRoot, group, artifact, version);
  if (!fs.existsSync(versionDir)) return null;

  for (const hash of fs.readdirSync(versionDir)) {
    const hashDir = path.join(versionDir, hash);
    if (!fs.statSync(hashDir).isDirectory()) continue;
    for (const file of fs.readdirSync(hashDir)) {
      if (file.endsWith('.pom')) {
        return fs.readFileSync(path.join(hashDir, file), 'utf8');
      }
    }
  }
  return null;
}

function parsePomLicense(pomText) {
  const licenses = [];
  const blocks = pomText.match(/<license>[\s\S]*?<\/license>/gi) ?? [];
  for (const block of blocks) {
    const name = block.match(/<name>([\s\S]*?)<\/name>/i)?.[1]?.trim();
    const url = block.match(/<url>([\s\S]*?)<\/url>/i)?.[1]?.trim();
    if (name || url) licenses.push({ name: name ?? '', url: url ?? '' });
  }
  return licenses;
}

function collectAndroidLibraries(gradleLogPath) {
  if (!fs.existsSync(gradleLogPath)) {
    console.warn(`Gradle log not found: ${gradleLogPath}`);
    return [];
  }

  const text = fs.readFileSync(gradleLogPath, 'utf8');
  const treeStart = text.indexOf('releaseRuntimeClasspath');
  const treeText = treeStart >= 0 ? text.slice(treeStart) : text;
  const coordinates = parseGradleCoordinates(treeText);
  const libraries = [];

  for (const { group, artifact, version } of coordinates) {
    const name = `${group}:${artifact}`;
    const id = `android:${name}@${version}`;
    const pom = findGradleCachePom(group, artifact, version);
    const pomLicenses = pom ? parsePomLicense(pom) : [];
    const license =
      pomLicenses.map((item) => item.name).filter(Boolean).join(' OR ') ||
      'UNKNOWN (see Maven Central / POM)';
    const licenseUrls = pomLicenses.map((item) => item.url).filter(Boolean);
    const licenseTextParts = [
      `Maven coordinates: ${group}:${artifact}:${version}`,
      `License: ${license}`,
    ];
    if (licenseUrls.length) {
      licenseTextParts.push('', 'License URLs:', ...licenseUrls.map((url) => `- ${url}`));
    }
    if (pom) {
      licenseTextParts.push('', '--- POM excerpt ---', pom.slice(0, 4000));
    }

    libraries.push({
      id,
      name,
      version,
      license,
      copyright: '',
      licenseText: licenseTextParts.join('\n'),
      source: 'android',
      repository: licenseUrls[0] ?? '',
    });
  }

  return libraries;
}

function buildReviewRequired(libraries) {
  const reviewRequired = [];
  const seen = new Set();

  for (const lib of libraries) {
    const labels = isReviewRequired(lib.license);
    if (!labels.length) continue;
    const key = `${lib.source}:${lib.name}@${lib.version}`;
    if (seen.has(key)) continue;
    seen.add(key);
    reviewRequired.push({
      id: lib.id,
      name: lib.name,
      version: lib.version,
      license: lib.license,
      source: lib.source,
      reasons: labels,
      note: 'Commercial distribution may require legal review for copyleft or additional-use restrictions.',
    });
  }

  return reviewRequired.sort(
    (a, b) => a.name.localeCompare(b.name) || a.version.localeCompare(b.version),
  );
}

function ensureGradleLog(targetPath) {
  if (fs.existsSync(targetPath)) return targetPath;
  console.log('Generating Gradle dependency log...');
  execSync(
    '.\\gradlew.bat app:dependencies --configuration releaseRuntimeClasspath --no-daemon',
    {
      cwd: path.join(ROOT, 'android'),
      stdio: ['ignore', 'pipe', 'pipe'],
      encoding: 'utf8',
      maxBuffer: 50 * 1024 * 1024,
    },
  );
  return targetPath;
}

function loadExistingOutput() {
  if (!fs.existsSync(OUTPUT)) return null;
  try {
    return JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
  } catch {
    return null;
  }
}

function mergeReviewEntry(fresh, previousById) {
  const prev = previousById.get(fresh.id);
  if (!prev) return fresh;
  if (prev.version !== fresh.version || prev.license !== fresh.license) {
    console.warn(`Review reset (version/license changed): ${fresh.id}`);
    return fresh;
  }
  if (prev.reviewStatus !== 'confirmed') return fresh;
  return {
    ...fresh,
    selectedLicense: prev.selectedLicense,
    reviewStatus: prev.reviewStatus,
    conclusion: prev.conclusion,
    note: prev.note,
  };
}

function mergeReviewRequired(freshList, previousList) {
  const previousById = new Map((previousList ?? []).map((item) => [item.id, item]));
  return freshList.map((item) => mergeReviewEntry(item, previousById));
}

function main() {
  const gradleLog = process.argv[2]
    ? path.resolve(process.argv[2])
    : ensureGradleLog(DEFAULT_GRADLE_LOG);

  const npmLibraries = collectNpmLibraries();
  const androidLibraries = collectAndroidLibraries(
    fs.existsSync(gradleLog) ? gradleLog : DEFAULT_GRADLE_LOG,
  );
  const libraries = [...npmLibraries, ...androidLibraries];
  const existing = loadExistingOutput();
  const reviewRequired = mergeReviewRequired(
    buildReviewRequired(libraries),
    existing?.reviewRequired,
  );

  const output = {
    generatedAt: new Date().toISOString(),
    app: 'VoiceStamp',
    sources: ['npm/package-lock.json', 'android/app releaseRuntimeClasspath'],
    counts: {
      npm: npmLibraries.length,
      android: androidLibraries.length,
      total: libraries.length,
      reviewRequired: reviewRequired.length,
    },
    ...(existing?.licenseReviewSummary ? { licenseReviewSummary: existing.licenseReviewSummary } : {}),
    reviewRequired,
    libraries,
  };

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2), 'utf8');

  console.log(`Wrote ${OUTPUT}`);
  console.log(
    `npm=${npmLibraries.length}, android=${androidLibraries.length}, reviewRequired=${reviewRequired.length}`,
  );
  if (reviewRequired.length) {
    console.log('Review required:');
    for (const item of reviewRequired) {
      console.log(`  - ${item.name}@${item.version} [${item.license}] (${item.reasons.join(', ')})`);
    }
  }
}

main();
