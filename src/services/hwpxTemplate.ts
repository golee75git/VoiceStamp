import JSZip from 'jszip';

const PLACEHOLDER_RE = /\{\{([^}=\s]+)(?:=([^}]*))?\}\}/g;
const IMG_BINARY_REF_RE = /<(?:hc|hp):img\b[^>]*\bbinaryItemIDRef=(["'])([^"']+)\1/;
const BLOCK_START = '{{STAMP_BLOCK_START}}';
const BLOCK_END = '{{STAMP_BLOCK_END}}';

export type HwpxStampFill = {
  title: string;
  memoLines: string[];
  metaLines: string[];
  imageBytes: Uint8Array;
  imageExt: 'jpg' | 'png';
};

function isTextEntry(fileName: string): boolean {
  return fileName.endsWith('.xml') || fileName.endsWith('.txt') || fileName.endsWith('.hpf');
}

function isSectionEntry(fileName: string): boolean {
  return /^Contents\/section\d+\.xml$/.test(fileName);
}

function escapeXmlText(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function replaceTokens(params: {
  input: string;
  textValues: Record<string, string>;
  imageKeys: Set<string>;
  unresolved: Set<string>;
  escapeOutput: boolean;
}): { output: string; replaced: number } {
  let replaced = 0;
  const output = params.input.replaceAll(
    PLACEHOLDER_RE,
    (fullMatch: string, key: string, defaultValue?: string) => {
      if (key.startsWith('@')) {
        if (defaultValue !== undefined) {
          return fullMatch;
        }
        if (!params.imageKeys.has(key)) {
          params.unresolved.add(key);
        }
        return fullMatch;
      }

      const explicit = params.textValues[key];
      if (explicit !== undefined) {
        replaced += 1;
        return params.escapeOutput ? escapeXmlText(explicit) : explicit;
      }

      if (defaultValue !== undefined) {
        replaced += 1;
        return params.escapeOutput ? escapeXmlText(defaultValue) : defaultValue;
      }

      params.unresolved.add(key);
      return fullMatch;
    },
  );

  return { output, replaced };
}

function cleanupPlaceholders(params: {
  input: string;
  removeUnresolvedPlaceholders: boolean;
  resolvedImageKeys: Set<string>;
}): string {
  return params.input.replaceAll(
    PLACEHOLDER_RE,
    (fullMatch: string, key: string) => {
      if (key.startsWith('@')) {
        if (params.resolvedImageKeys.has(key)) {
          return '';
        }
        return params.removeUnresolvedPlaceholders ? '' : fullMatch;
      }
      return params.removeUnresolvedPlaceholders ? '' : fullMatch;
    },
  );
}

function findBinDataEntryName(zip: JSZip, binaryItemIdRef: string): string | null {
  const prefix = `BinData/${binaryItemIdRef}.`;
  const matched = Object.keys(zip.files)
    .filter((fileName) => {
      const entry = zip.files[fileName];
      return entry && !entry.dir && fileName.startsWith(prefix);
    })
    .sort();

  if (matched.length === 0) {
    return null;
  }
  return matched[0];
}

function findBinaryItemIdRefByImagePlaceholder(
  sectionXml: string,
  imagePlaceholderKey: string,
): string | null {
  const normalizedKey = imagePlaceholderKey.startsWith('@')
    ? imagePlaceholderKey
    : `@${imagePlaceholderKey}`;
  const token = `{{${normalizedKey}}}`;
  const tokenIndex = sectionXml.indexOf(token);
  if (tokenIndex < 0) {
    return null;
  }

  const tail = sectionXml.slice(tokenIndex + token.length);
  const imgMatch = IMG_BINARY_REF_RE.exec(tail);
  return imgMatch?.[2] ?? null;
}

function mimeForImageExt(ext: 'jpg' | 'png'): string {
  return ext === 'png' ? 'image/png' : 'image/jpeg';
}

function extractStampBlock(sectionXml: string): string {
  const startIdx = sectionXml.indexOf(BLOCK_START);
  const endIdx = sectionXml.indexOf(BLOCK_END);
  if (startIdx < 0 || endIdx < 0 || endIdx <= startIdx) {
    throw new Error('HWPX 템플릿에 스탬프 블록 마커가 없습니다.');
  }
  return sectionXml.slice(startIdx + BLOCK_START.length, endIdx);
}

const LINE_VERT_STEP = 1600;
/** A4 세로 본문 칸(서식 pagePr·여백에서 계산). PDF 페이지당 장수와 같은 칸을 맞출 때 쓴다. */
const PAGE_BODY_HWP = 74266;
const CONTENT_WIDTH_HWP = 42520;
const COLUMN_GAP_HWP = 1134;
const HEADER_RESERVE_HWP = 3600;
const MIN_PIC_HWP = 4800;

export type HwpxPhotosPerPage = 1 | 2 | 3 | 4;

function pageLayout(photosPerPage: HwpxPhotosPerPage): { columns: number; rows: number } {
  if (photosPerPage === 4) {
    return { columns: 2, rows: 2 };
  }
  return { columns: photosPerPage, rows: 1 };
}

function columnWidth(columns: number): number {
  if (columns <= 1) {
    return CONTENT_WIDTH_HWP;
  }
  return Math.floor((CONTENT_WIDTH_HWP - (columns - 1) * COLUMN_GAP_HWP) / columns);
}

function slotHeight(rows: number): number {
  return Math.floor((PAGE_BODY_HWP - HEADER_RESERVE_HWP) / Math.max(1, rows));
}

/**
 * A {{token}} placeholder in HWPX sits inside one <hp:t> in one <hp:p>; text runs
 * can't hold newlines, so multi-line content needs one cloned <hp:p> per line.
 */
function expandParagraphForLines(template: string, token: string, lines: string[]): string {
  const marker = `{{${token}}}`;
  const tokenIdx = template.indexOf(marker);
  if (tokenIdx < 0) {
    return template;
  }

  const pStart = template.lastIndexOf('<hp:p ', tokenIdx);
  const pEndTagIdx = template.indexOf('</hp:p>', tokenIdx);
  if (pStart < 0 || pEndTagIdx < 0) {
    return template;
  }
  const pEnd = pEndTagIdx + '</hp:p>'.length;
  const paraTemplate = template.slice(pStart, pEnd);

  const vertposMatch = paraTemplate.match(/vertpos="(\d+)"/);
  const baseVertpos = vertposMatch ? Number(vertposMatch[1]) : 0;

  const effectiveLines = lines.length > 0 ? lines : [''];
  const paragraphs = effectiveLines
    .map((line, i) => {
      const vertpos = baseVertpos + i * LINE_VERT_STEP;
      return paraTemplate
        .replace(marker, escapeXmlText(line))
        .replace(/vertpos="\d+"/, `vertpos="${vertpos}"`);
    })
    .join('');

  return template.slice(0, pStart) + paragraphs + template.slice(pEnd);
}

function applyColumnCount(sectionXml: string, columns: number): string {
  return sectionXml.replace(
    /<hp:colPr id="" type="NEWSPAPER" layout="LEFT" colCount="\d+" sameSz="1" sameGap="0"\/>/,
    `<hp:colPr id="" type="NEWSPAPER" layout="LEFT" colCount="${columns}" sameSz="1" sameGap="0"/>`,
  );
}

function markPageOrColumnBreak(block: string, kind: 'page' | 'column'): string {
  if (kind === 'page') {
    return block.replace('pageBreak="0"', 'pageBreak="1"');
  }
  return block.replace('columnBreak="0"', 'columnBreak="1"');
}

function scaleTableToSlot(block: string, maxWidth: number): string {
  const tblStart = block.indexOf('<hp:tbl');
  const tblEnd = block.indexOf('</hp:tbl>');
  if (tblStart < 0 || tblEnd < 0 || tblEnd <= tblStart) {
    return block;
  }
  const head = block.slice(tblStart, tblEnd);
  const sizeMatch = head.match(/<hp:sz width="(\d+)"([^>]*height=")(\d+)"/);
  if (!sizeMatch) {
    return block;
  }
  const srcW = Number(sizeMatch[1]);
  const srcH = Number(sizeMatch[3]);
  if (srcW <= 0 || srcW === maxWidth) {
    return block;
  }
  const height = Math.max(1, Math.round((srcH * maxWidth) / srcW));
  let nextHead = head.replace(`<hp:sz width="${srcW}"`, `<hp:sz width="${maxWidth}"`);
  nextHead = nextHead.replace(`height="${srcH}"`, `height="${height}"`);
  nextHead = nextHead.replace(/<hp:cellSz width="\d+"/, `<hp:cellSz width="${maxWidth}"`);
  return block.slice(0, tblStart) + nextHead + block.slice(tblEnd);
}

function scalePictureToSlot(block: string, maxWidth: number, maxHeight: number): string {
  const picStart = block.indexOf('<hp:pic');
  const picEnd = block.indexOf('</hp:pic>');
  if (picStart < 0 || picEnd < 0) {
    return block;
  }
  const picEndExclusive = picEnd + '</hp:pic>'.length;
  const pic = block.slice(picStart, picEndExclusive);
  const sizeMatch = pic.match(/<hp:sz width="(\d+)"[^>]*height="(\d+)"/);
  if (!sizeMatch) {
    return block;
  }
  const srcW = Number(sizeMatch[1]);
  const srcH = Number(sizeMatch[2]);
  if (srcW <= 0 || srcH <= 0) {
    return block;
  }
  const scale = Math.min(maxWidth / srcW, maxHeight / srcH);
  const width = Math.max(1, Math.round(srcW * scale));
  const height = Math.max(1, Math.round(srcH * scale));
  let next = pic
    .replaceAll(`width="${srcW}"`, `width="${width}"`)
    .replaceAll(`height="${srcH}"`, `height="${height}"`)
    .replaceAll(`x="${srcW}"`, `x="${width}"`)
    .replaceAll(`y="${srcH}"`, `y="${height}"`)
    .replaceAll(`centerX="${Math.round(srcW / 2)}"`, `centerX="${Math.round(width / 2)}"`)
    .replaceAll(`centerY="${Math.round(srcH / 2)}"`, `centerY="${Math.round(height / 2)}"`);
  const paraEnd = block.indexOf('</hp:p>', picEndExclusive);
  let tail = block.slice(picEndExclusive, paraEnd < 0 ? block.length : paraEnd);
  tail = tail
    .replace(/vertsize="\d+"/, `vertsize="${height}"`)
    .replace(/textheight="\d+"/, `textheight="${height}"`)
    .replace(/baseline="\d+"/, `baseline="${Math.round(height * 0.85)}"`);
  const after = paraEnd < 0 ? '' : block.slice(paraEnd);
  return block.slice(0, picStart) + next + tail + after;
}

function reflowBlockLines(block: string, width: number): string {
  let cursor = 0;
  return block.replace(/<hp:lineseg\b[^>]*\/>/g, (segment, offset: number) => {
    const paraStart = block.lastIndexOf('<hp:p ', offset);
    const paraEnd = block.indexOf('</hp:p>', offset);
    const para = paraStart >= 0 && paraEnd > paraStart ? block.slice(paraStart, paraEnd) : '';
    const pic = para.includes('<hp:pic');
    const sizeMatch = pic ? para.match(/<hp:sz width="\d+"[^>]*height="(\d+)"/) : null;
    const height = sizeMatch ? Number(sizeMatch[1]) : LINE_VERT_STEP;
    const vertpos = cursor;
    cursor += height + 400;
    return segment
      .replace(/vertpos="\d+"/, `vertpos="${vertpos}"`)
      .replace(/vertsize="\d+"/, `vertsize="${pic ? height : Math.min(height, 1200)}"`)
      .replace(/horzsize="\d+"/, `horzsize="${width}"`);
  });
}

function pictureBudget(stamp: HwpxStampFill, rows: number): number {
  const textLines =
    1 +
    Math.max(stamp.memoLines.length, 1) +
    Math.max(stamp.metaLines.length, 1) +
    1;
  const room = slotHeight(rows) - textLines * LINE_VERT_STEP - 800;
  return Math.max(MIN_PIC_HWP, room);
}

function placeKind(
  index: number,
  photosPerPage: HwpxPhotosPerPage,
): 'page' | 'column' | 'continue' {
  if (index <= 0) {
    return 'continue';
  }
  if (photosPerPage === 4) {
    if (index % 4 === 0) {
      return 'page';
    }
    if (index % 4 === 2) {
      return 'column';
    }
    return 'continue';
  }
  if (photosPerPage <= 1) {
    return 'page';
  }
  if (index % photosPerPage === 0) {
    return 'page';
  }
  return 'column';
}

function bumpVertpos(block: string, delta: number): string {
  if (delta <= 0) {
    return block;
  }
  return block.replace(/vertpos="(\d+)"/g, (_full, raw: string) => `vertpos="${Number(raw) + delta}"`);
}

function blockExtent(block: string): number {
  let max = 0;
  const re = /vertpos="(\d+)"[^>]*vertsize="(\d+)"/g;
  for (const match of block.matchAll(re)) {
    max = Math.max(max, Number(match[1]) + Number(match[2]));
  }
  return max + 400;
}

function buildStampBlocks(
  blockTemplate: string,
  stamps: HwpxStampFill[],
  photosPerPage: HwpxPhotosPerPage,
): string {
  const layout = pageLayout(photosPerPage);
  const width = columnWidth(layout.columns);
  const parts: string[] = [];
  let columnCursor = 0;

  for (let index = 0; index < stamps.length; index++) {
    const stamp = stamps[index];
    const imageId = `image${index + 1}`;
    const imageKey = `@img${index + 1}`;
    let block = blockTemplate
      .replaceAll('{{stampIndex}}', String(index + 1))
      .replaceAll('{{stampTitle}}', escapeXmlText(stamp.title))
      .replaceAll('{{@stampImage}}', `{{${imageKey}}}`)
      .replaceAll('binaryItemIDRef="image1"', `binaryItemIDRef="${imageId}"`);
    block = expandParagraphForLines(block, 'stampMemo', stamp.memoLines);
    block = expandParagraphForLines(block, 'stampMeta', stamp.metaLines);
    const hasTable = block.includes('<hp:tbl');
    block = scalePictureToSlot(block, width, pictureBudget(stamp, layout.rows));
    if (hasTable) {
      block = scaleTableToSlot(block, width);
    } else {
      block = reflowBlockLines(block, width);
    }

    const kind = placeKind(index, photosPerPage);
    if (kind === 'page' || kind === 'column') {
      columnCursor = 0;
      block = markPageOrColumnBreak(block, kind);
    } else if (columnCursor > 0) {
      block = bumpVertpos(block, columnCursor);
    }
    columnCursor = blockExtent(block);
    parts.push(block);
  }

  return parts.join('');
}

function expandStampBlocks(
  sectionXml: string,
  stamps: HwpxStampFill[],
  photosPerPage: HwpxPhotosPerPage,
): string {
  const layout = pageLayout(photosPerPage);
  const withColumns = applyColumnCount(sectionXml, layout.columns);
  const blockTemplate = extractStampBlock(withColumns);
  const blocks = buildStampBlocks(blockTemplate, stamps, photosPerPage);
  const startIdx = withColumns.indexOf(BLOCK_START);
  const endIdx = withColumns.indexOf(BLOCK_END) + BLOCK_END.length;
  return withColumns.slice(0, startIdx) + blocks + withColumns.slice(endIdx);
}

function ensureHpfImageItem(
  hpfXml: string,
  imageId: string,
  fileName: string,
  mediaType: string,
): string {
  if (hpfXml.includes(`id="${imageId}"`)) {
    return hpfXml.replace(
      new RegExp(`<opf:item id="${imageId}" href="BinData/[^"]+" media-type="[^"]+" isEmbeded="1"/>`),
      `<opf:item id="${imageId}" href="BinData/${fileName}" media-type="${mediaType}" isEmbeded="1"/>`,
    );
  }

  const item = `<opf:item id="${imageId}" href="BinData/${fileName}" media-type="${mediaType}" isEmbeded="1"/>`;
  return hpfXml.replace('</opf:manifest>', `${item}</opf:manifest>`);
}

function removeUnusedBinData(zip: JSZip, keepFiles: Set<string>): void {
  for (const fileName of Object.keys(zip.files)) {
    if (!fileName.startsWith('BinData/') || fileName.endsWith('/')) {
      continue;
    }
    if (!keepFiles.has(fileName)) {
      zip.remove(fileName);
    }
  }
}

export async function renderHwpxFromTemplate(
  templateBytes: ArrayBuffer | Uint8Array,
  reportTitle: string,
  exportedAt: string,
  stamps: HwpxStampFill[],
  photosPerPage: HwpxPhotosPerPage = 1,
): Promise<Uint8Array> {
  if (stamps.length === 0) {
    throw new Error('보낼 스탬프가 없습니다.');
  }

  const zip = await JSZip.loadAsync(templateBytes);
  const sectionEntry = zip.file('Contents/section0.xml');
  if (!sectionEntry) {
    throw new Error('HWPX 템플릿에 section0.xml이 없습니다.');
  }

  let sectionXml = await sectionEntry.async('string');
  sectionXml = expandStampBlocks(sectionXml, stamps, photosPerPage);
  zip.file('Contents/section0.xml', sectionXml);

  const textValues: Record<string, string> = {
    reportTitle: reportTitle.trim() || 'VoiceStamp 보고서',
    exportedAt,
  };
  const imageValues: Record<string, Uint8Array> = {};
  const keepFiles = new Set<string>();

  for (let i = 0; i < stamps.length; i++) {
    const imageId = `image${i + 1}`;
    const ext = stamps[i].imageExt;
    const fileName = `${imageId}.${ext}`;
    keepFiles.add(`BinData/${fileName}`);
    imageValues[`@img${i + 1}`] = stamps[i].imageBytes;
    zip.file(`BinData/${fileName}`, stamps[i].imageBytes);
  }

  removeUnusedBinData(zip, keepFiles);

  const hpfEntry = zip.file('Contents/content.hpf');
  if (hpfEntry) {
    let hpfXml = await hpfEntry.async('string');
    for (let i = 0; i < stamps.length; i++) {
      const imageId = `image${i + 1}`;
      const ext = stamps[i].imageExt;
      hpfXml = ensureHpfImageItem(
        hpfXml,
        imageId,
        `${imageId}.${ext}`,
        mimeForImageExt(ext),
      );
    }
    zip.file('Contents/content.hpf', hpfXml);
  }

  const imageKeys = new Set(Object.keys(imageValues));
  const unresolved = new Set<string>();
  const sectionTexts = new Map<string, string>();

  for (const entryName of Object.keys(zip.files)) {
    const entry = zip.file(entryName);
    if (!entry || !isTextEntry(entryName)) {
      continue;
    }

    const sourceText = await entry.async('string');
    const replaced = replaceTokens({
      input: sourceText,
      textValues,
      imageKeys,
      unresolved,
      escapeOutput: entryName.endsWith('.xml') || entryName.endsWith('.hpf'),
    });
    if (isSectionEntry(entryName)) {
      sectionTexts.set(entryName, replaced.output);
    }
    if (replaced.output !== sourceText) {
      zip.file(entryName, replaced.output);
    }
  }

  const sortedSections = [...sectionTexts.entries()].sort(([a], [b]) => a.localeCompare(b));
  const resolvedImageKeys = new Set<string>();

  for (const [imageKey, imageBytes] of Object.entries(imageValues)) {
    let binaryItemIdRef: string | null = null;
    for (const [, sectionText] of sortedSections) {
      const found = findBinaryItemIdRefByImagePlaceholder(sectionText, imageKey);
      if (found) {
        binaryItemIdRef = found;
        break;
      }
    }

    if (!binaryItemIdRef) {
      unresolved.add(imageKey);
      continue;
    }

    const targetEntryName = findBinDataEntryName(zip, binaryItemIdRef);
    if (!targetEntryName) {
      throw new Error(`BinData 항목을 찾지 못했습니다: ${binaryItemIdRef}`);
    }

    zip.file(targetEntryName, imageBytes);
    resolvedImageKeys.add(imageKey);
  }

  for (const entryName of Object.keys(zip.files)) {
    const entry = zip.file(entryName);
    if (!entry || !isTextEntry(entryName)) {
      continue;
    }

    const sourceText = await entry.async('string');
    const cleaned = cleanupPlaceholders({
      input: sourceText,
      removeUnresolvedPlaceholders: true,
      resolvedImageKeys,
    });
    if (cleaned !== sourceText) {
      zip.file(entryName, cleaned);
    }
  }

  const mimeEntry = zip.file('mimetype');
  if (mimeEntry) {
    const mimeData = await mimeEntry.async('uint8array');
    zip.remove('mimetype');
    zip.file('mimetype', mimeData, { compression: 'STORE' });
  }

  return zip.generateAsync({
    type: 'uint8array',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}
