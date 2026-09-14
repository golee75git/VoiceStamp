/**
 * 한글이 저장한 assets/templates/report.hwpx 를 앱 보내기용으로 맞춘다.
 * 바깥 예제는 받지 않는다. 자리 표시는 문서에 이미 있다.
 * 그림 칸이 {{@stampImage}} 앞에 있으면 뒤로 옮긴다.
 * 한글이 표를 넣으며 스탬프 블록 시작/끝이 뒤바뀌면 순서를 바로잡는다.
 */
import fs from 'fs';
import JSZip from 'jszip';

const SRC = 'assets/templates/report.hwpx';
const PUBLIC_OUT = 'public/templates/report.hwpx';

function paraBounds(xml, token) {
  const idx = xml.indexOf(token);
  if (idx < 0) {
    throw new Error('자리 표시 없음: ' + token);
  }
  const start = Math.max(xml.lastIndexOf('<hp:p ', idx), xml.lastIndexOf('<hp:p>', idx));
  const end = xml.indexOf('</hp:p>', idx);
  if (start < 0 || end < 0) {
    throw new Error('문단을 찾지 못함: ' + token);
  }
  return { start, end: end + '</hp:p>'.length };
}

function extractPara(xml, token) {
  const bounds = paraBounds(xml, token);
  return { para: xml.slice(bounds.start, bounds.end), start: bounds.start, end: bounds.end };
}

function placeStampBlockMarkers(xml) {
  const startTok = '{{STAMP_BLOCK_START}}';
  const endTok = '{{STAMP_BLOCK_END}}';
  const startIdx = xml.indexOf(startTok);
  const endIdx = xml.indexOf(endTok);
  if (startIdx < 0 || endIdx < 0) {
    throw new Error('스탬프 블록 자리 표시가 없습니다.');
  }
  const block = startIdx < endIdx ? xml.slice(startIdx, endIdx) : '';
  if (block.includes('{{@stampImage}}') && block.includes('{{stampMemo}}')) {
    return xml;
  }

  const startEx = extractPara(xml, startTok);
  const endEx = extractPara(xml, endTok);
  const laterFirst = [startEx, endEx].sort((a, b) => b.start - a.start);
  let next = xml;
  for (const part of laterFirst) {
    next = next.slice(0, part.start) + next.slice(part.end);
  }

  const tblIdx = next.indexOf('<hp:tbl');
  let insertStartAt = -1;
  if (tblIdx >= 0) {
    insertStartAt = next.lastIndexOf('<hp:p ', tblIdx);
  }
  if (insertStartAt < 0) {
    const imgTok = next.indexOf('{{@stampImage}}');
    const titleTok = next.indexOf('{{stampTitle}}');
    const imgPara = imgTok >= 0 ? next.lastIndexOf('<hp:p ', imgTok) : -1;
    const titlePara = titleTok >= 0 ? next.lastIndexOf('<hp:p ', titleTok) : -1;
    const candidates = [imgPara, titlePara].filter((n) => n >= 0);
    insertStartAt = candidates.length > 0 ? Math.min(...candidates) : -1;
  }
  if (insertStartAt < 0) {
    throw new Error('스탬프 블록 시작 위치를 찾지 못했습니다.');
  }

  next = next.slice(0, insertStartAt) + startEx.para + next.slice(insertStartAt);

  const metaIdx = next.indexOf('{{stampMeta}}');
  if (metaIdx < 0) {
    throw new Error('{{stampMeta}} 가 없습니다.');
  }
  const metaEnd = next.indexOf('</hp:p>', metaIdx) + '</hp:p>'.length;
  next = next.slice(0, metaEnd) + endEx.para + next.slice(metaEnd);

  const blockStart = next.indexOf(startTok);
  const blockEnd = next.indexOf(endTok);
  if (blockStart < 0 || blockEnd <= blockStart) {
    throw new Error('스탬프 블록 자리 표시 순서를 맞추지 못했습니다.');
  }

  const exportedTok = '{{exportedAt}}';
  const exportedIdx = next.indexOf(exportedTok);
  if (exportedIdx > blockStart && exportedIdx < blockEnd) {
    const exportedEx = extractPara(next, exportedTok);
    next = next.slice(0, exportedEx.start) + next.slice(exportedEx.end);
    const startAt = next.indexOf(startTok);
    const startParaAt = next.lastIndexOf('<hp:p ', startAt);
    next = next.slice(0, startParaAt) + exportedEx.para + next.slice(startParaAt);
  }

  return next;
}

function movePicAfterStampImage(xml) {
  const tokenIdx = xml.indexOf('{{@stampImage}}');
  if (tokenIdx < 0) {
    throw new Error('{{@stampImage}} 가 없습니다.');
  }
  const picIdx = xml.indexOf('<hp:pic');
  if (picIdx < 0) {
    throw new Error('그림 칸이 없습니다.');
  }
  if (picIdx > tokenIdx) {
    return xml;
  }
  const pStart = xml.lastIndexOf('<hp:p ', picIdx);
  const pEnd = xml.indexOf('</hp:p>', picIdx) + '</hp:p>'.length;
  if (pStart < 0 || pEnd < pStart) {
    throw new Error('그림 문단을 찾지 못했습니다.');
  }
  const picPara = xml.slice(pStart, pEnd);
  xml = xml.slice(0, pStart) + xml.slice(pEnd);

  const tokenAgain = xml.indexOf('{{@stampImage}}');
  const tokenEnd = xml.indexOf('</hp:p>', tokenAgain) + '</hp:p>'.length;
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

sectionXml = placeStampBlockMarkers(sectionXml);
sectionXml = movePicAfterStampImage(sectionXml);

const startAt = sectionXml.indexOf('{{STAMP_BLOCK_START}}');
const endAt = sectionXml.indexOf('{{STAMP_BLOCK_END}}');
if (startAt < 0 || endAt <= startAt) {
  throw new Error('스탬프 블록 시작이 끝보다 뒤에 있습니다.');
}
if (sectionXml.includes('<hp:tbl') && !sectionXml.slice(startAt, endAt).includes('<hp:tbl')) {
  throw new Error('표가 스탬프 블록 밖에 있습니다.');
}

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
