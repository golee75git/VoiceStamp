import JSZip from 'jszip';

const PLACEHOLDER_RE = /\{\{([^}=\s]+)(?:=([^}]*))?\}\}/g;
const IMG_BINARY_REF_RE = /<(?:hc|hp):img\b[^>]*\bbinaryItemIDRef=(["'])([^"']+)\1/;
const BLOCK_START = '{{STAMP_BLOCK_START}}';
const BLOCK_END = '{{STAMP_BLOCK_END}}';

export type HwpxStampFill = {
  title: string;
  memo: string;
  meta: string;
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

function buildStampBlocks(blockTemplate: string, stamps: HwpxStampFill[]): string {
  return stamps
    .map((stamp, index) => {
      const imageId = `image${index + 1}`;
      const imageKey = `@img${index + 1}`;
      return blockTemplate
        .replaceAll('{{stampIndex}}', String(index + 1))
        .replaceAll('{{stampTitle}}', escapeXmlText(stamp.title))
        .replaceAll('{{stampMemo}}', escapeXmlText(stamp.memo))
        .replaceAll('{{stampMeta}}', escapeXmlText(stamp.meta))
        .replaceAll('{{@stampImage}}', `{{${imageKey}}}`)
        .replaceAll('binaryItemIDRef="image1"', `binaryItemIDRef="${imageId}"`);
    })
    .join('');
}

function expandStampBlocks(sectionXml: string, stamps: HwpxStampFill[]): string {
  const blockTemplate = extractStampBlock(sectionXml);
  const blocks = buildStampBlocks(blockTemplate, stamps);
  const startIdx = sectionXml.indexOf(BLOCK_START);
  const endIdx = sectionXml.indexOf(BLOCK_END) + BLOCK_END.length;
  return sectionXml.slice(0, startIdx) + blocks + sectionXml.slice(endIdx);
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

function removeUnusedBinData(zip: JSZip, keepImageIds: Set<string>): void {
  for (const fileName of Object.keys(zip.files)) {
    if (!fileName.startsWith('BinData/') || fileName.endsWith('/')) {
      continue;
    }
    const base = fileName.slice('BinData/'.length);
    const imageId = base.replace(/\.[^.]+$/, '');
    if (!keepImageIds.has(imageId)) {
      zip.remove(fileName);
    }
  }
}

export async function renderHwpxFromTemplate(
  templateBytes: ArrayBuffer | Uint8Array,
  reportTitle: string,
  exportedAt: string,
  stamps: HwpxStampFill[],
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
  sectionXml = expandStampBlocks(sectionXml, stamps);
  zip.file('Contents/section0.xml', sectionXml);

  const textValues: Record<string, string> = {
    reportTitle: reportTitle.trim() || 'VoiceStamp 보고서',
    exportedAt,
  };
  const imageValues: Record<string, Uint8Array> = {};
  const keepImageIds = new Set<string>();

  for (let i = 0; i < stamps.length; i++) {
    const imageId = `image${i + 1}`;
    const ext = stamps[i].imageExt;
    const fileName = `${imageId}.${ext}`;
    keepImageIds.add(imageId);
    imageValues[`@img${i + 1}`] = stamps[i].imageBytes;
    zip.file(`BinData/${fileName}`, stamps[i].imageBytes);
  }

  removeUnusedBinData(zip, keepImageIds);

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
