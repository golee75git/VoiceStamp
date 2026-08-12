import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const appDir = path.join(dist, 'app');
const expoIndex = path.join(dist, 'index.html');
const landingSrc = path.join(dist, 'landing.html');
const landingRoot = path.join(dist, 'index.html');

if (!fs.existsSync(expoIndex)) {
  console.error('post-export-web-layout: missing dist/index.html');
  process.exit(1);
}
if (!fs.existsSync(landingSrc)) {
  console.error('post-export-web-layout: missing dist/landing.html');
  process.exit(1);
}

fs.mkdirSync(appDir, { recursive: true });
fs.renameSync(expoIndex, path.join(appDir, 'index.html'));
fs.copyFileSync(landingSrc, landingRoot);

/** Ensure Digital Asset Links file is present for Android App Links verification. */
const assetSrc = path.join(root, 'public', '.well-known', 'assetlinks.json');
const assetDir = path.join(dist, '.well-known');
const assetDest = path.join(assetDir, 'assetlinks.json');
if (fs.existsSync(assetSrc)) {
  fs.mkdirSync(assetDir, { recursive: true });
  fs.copyFileSync(assetSrc, assetDest);
  console.log('post-export-web-layout: copied .well-known/assetlinks.json');
}

console.log('post-export-web-layout: dist/index.html = landing, dist/app/index.html = expo app');
