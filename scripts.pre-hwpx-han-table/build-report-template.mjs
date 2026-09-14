/**
 * 한글이 저장한 assets/templates/report.hwpx 를 앱 보내기용으로 맞춘다.
 * 바깥 예제는 받지 않는다. 자리 표시는 문서에 이미 있다.
 * 그림 칸만 {{@stampImage}} 뒤로 옮긴다.
 */
import fs from 'fs';
import JSZip from 'jszip';

const SRC = 'assets/templates/report.hwpx';
const PUBLIC_OUT = 'public/templates/report.hwpx';

function movePicAfterStampImage(xml) {
  const picIdx = xml.indexOf('<hp:pic');
  if (picIdx < 0) {
    throw new Error('그림 칸이 없습니다.');
  }
  const pStart = xml.lastIndexOf('<hp:p', picIdx);
  const pEnd = xml.indexOf('</hp:p>', picIdx) + '</hp:p>'.length;
  const picPara = xml.slice(pStart, pEnd);
  xml = xml.slice(0, pStart) + xml.slice(pEnd);

  const tokenIdx = xml.indexOf('{{@stampImage}}');
  if (tokenIdx < 0) {
    throw new Error('{{@stampImage}} 가 없습니다.');
  }
  const tokenEnd = xml.indexOf('</hp:p>', tokenIdx) + '</hp:p>'.length;
  return xml.slice(0, tokenEnd) + picPara + xml.slice(tokenEnd);
}

const zip = await JSZip.loadAsync(fs.readFileSync(SRC));
const sectionEntry = zip.file('Contents/section0.xml');
if (!sectionEntry) {
  throw new Error('section0.xml 이 없습니다.');
}

let sectionXml = await sectionEntry.async('string');
const need = [
  '{{reportTitle}}',
  '{{exportedAt}}',
  '{{STAMP_BLOCK_START}}',
  '{{STAMP_BLOCK_END}}',
  '{{stampTitle}}',
  '{{stampMemo}}',
  '{{stampMeta}}',
  '{{@stampImage}}',
];
for (const token of need) {
  if (!sectionXml.includes(token)) {
    throw new Error('자리 표시 없음: ' + token);
  }
}

sectionXml = movePicAfterStampImage(sectionXml);

const tokenIdx = sectionXml.indexOf('{{@stampImage}}');
const tail = sectionXml.slice(tokenIdx);
if (!/<(?:hc|hp):img\b[^>]*\bbinaryItemIDRef=/.test(tail)) {
  throw new Error('자리 표시 뒤에 그림 칸이 없습니다.');
}

zip.file('Contents/section0.xml', sectionXml);

const mimeEntry = zip.file('mimetype');
if (mimeEntry) {
  const mimeData = await mimeEntry.async('uint8array');
  zip.remove('mimetype');
  zip.file('mimetype', mimeData, { compression: 'STORE' });
}

const outBytes = await zip.generateAsync({
  type: 'nodebuffer',
  compression: 'DEFLATE',
  compressionOptions: { level: 6 },
});

fs.mkdirSync('assets/templates', { recursive: true });
fs.mkdirSync('public/templates', { recursive: true });
fs.writeFileSync(SRC, outBytes);
fs.copyFileSync(SRC, PUBLIC_OUT);

console.log('Wrote', SRC, outBytes.length, 'bytes');
console.log('Wrote', PUBLIC_OUT);
