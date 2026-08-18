import fs from 'fs';
import JSZip from 'jszip';

const z = await JSZip.loadAsync(fs.readFileSync('assets/templates/vs-form.hwpx'));
const s = await z.file('Contents/section0.xml').async('string');
const start = s.indexOf('{{STAMP_BLOCK_START}}');
const end = s.indexOf('{{STAMP_BLOCK_END}}');
if (start < 0 || end < 0) {
  throw new Error('stamp block markers missing');
}
const BLOCK_START = '{{STAMP_BLOCK_START}}';
const BLOCK_END = '{{STAMP_BLOCK_END}}';
const IMG_BINARY_REF_RE = /<(?:hc|hp):img\b[^>]*\bbinaryItemIDRef=(["'])([^"']+)\1/;
const startIdx = s.indexOf(BLOCK_START);
const endIdx = s.indexOf(BLOCK_END);
if (startIdx < 0 || endIdx <= startIdx) {
  throw new Error('stamp block markers missing');
}
const blockTemplate = s.slice(startIdx + BLOCK_START.length, endIdx);
const one = blockTemplate
  .replaceAll('{{stampIndex}}', '1')
  .replaceAll('{{stampTitle}}', 'T')
  .replaceAll('{{stampMemo}}', 'M')
  .replaceAll('{{stampMeta}}', 'meta')
  .replaceAll('{{@stampImage}}', '{{@img1}}')
  .replaceAll('binaryItemIDRef="image1"', 'binaryItemIDRef="image1"');
const expanded = s.slice(0, startIdx) + one + s.slice(endIdx + BLOCK_END.length);
const tokenIndex = expanded.indexOf('{{@img1}}');
if (tokenIndex < 0) {
  throw new Error('image token missing after expand');
}
const imgMatch = IMG_BINARY_REF_RE.exec(expanded.slice(tokenIndex + '{{@img1}}'.length));
if (!imgMatch || imgMatch[2] !== 'image1') {
  throw new Error('image binary ref missing');
}
if (!z.file('BinData/image1.png')) {
  throw new Error('BinData/image1.png missing');
}
console.log('section bytes', s.length);
console.log('fill-path ok', imgMatch[2]);
