import JSZip from 'jszip';
import * as FileSystem from 'expo-file-system/legacy';
import { File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { createStampsPdf } from './exportPdf';
import { resolveImageUri, sanitizeStampFileBaseName } from './fileService';
import { writeJsZipToCacheFile } from './writeCacheFile';
import {
  getCoordsLabelMode,
  getMemoFieldLabel,
  getMemoTextAlign,
  getExtra1FieldLabel,
  getExtra2FieldLabel,
  getExtra3FieldLabel,
  getOverlayFooterPhrase,
  getOverlayOrgName,
  getOverlayShowFooterPhrase,
  getOverlayShowOrgName,
  getPdfShowDatetime,
  getPlaceFieldLabel,
  getStampTextLayout,
  getTitleFieldLabel,
  getWatermarkStyle,
  getTitleTextAlign,
} from './settingsService';
import type { Stamp } from '../types/stamp';

export const PROJECT_MANIFEST_VERSION = 1;

export type ProjectExportSettings = {
  titleAlign: string;
  memoAlign: string;
  showDatetime: boolean;
  textLayout: string;
  coordsLabel: string;
  watermarkStyle: string;
  orgName: string;
  footerPhrase: string;
  showOrgName: boolean;
  showFooterPhrase: boolean;
  titleFieldLabel: string;
  placeFieldLabel: string;
  memoFieldLabel: string;
  extra1FieldLabel: string;
  extra2FieldLabel: string;
  extra3FieldLabel: string;
};

export type ProjectManifestStamp = {
  id: string;
  title: string;
  memo: string;
  placeLabel: string | null;
  floor: string | null;
  extra1: string | null;
  extra2: string | null;
  extra3: string | null;
  titleFieldLabel: string | null;
  placeFieldLabel: string | null;
  memoFieldLabel: string | null;
  extra1FieldLabel: string | null;
  extra2FieldLabel: string | null;
  extra3FieldLabel: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: number;
  updatedAt: number;
  imageFile: string;
};

export type ProjectManifest = {
  version: number;
  appVersion: string;
  exportedAt: number;
  reportTitle: string;
  exportSettings: ProjectExportSettings;
  stamps: ProjectManifestStamp[];
};

export type ExportFileResult = {
  uri: string;
  fileName: string;
  webBlobUrl?: string;
};

function sanitizeExportBaseName(name: string): string {
  const cleaned = name.trim().replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, ' ');
  return cleaned || 'VoiceStamp';
}

function padIndex(index: number): string {
  return String(index + 1).padStart(3, '0');
}

function shortIdFromStampId(id: string): string {
  const tail = id.includes('-') ? (id.split('-').pop() ?? id) : id;
  const safe = tail.replace(/[^a-zA-Z0-9]/g, '');
  return safe.slice(0, 8) || 'stamp';
}

function stampZipImageName(index: number, stamp: Stamp): string {
  const base = sanitizeStampFileBaseName(stamp.title.trim() || 'VoiceStamp');
  const ext = stamp.imagePath.toLowerCase().endsWith('.png') ? 'png' : 'jpg';
  return `${padIndex(index)}_${base}_${shortIdFromStampId(stamp.id)}.${ext}`;
}

async function readImageForZip(imagePath: string): Promise<Uint8Array> {
  const uri = resolveImageUri(imagePath);

  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }

  // Binary read ??avoid holding a large base64 string in JS.
  return new File(uri).bytes();
}

function downloadBlobOnWeb(blobUrl: string, fileName: string): void {
  const anchor = document.createElement('a');
  anchor.href = blobUrl;
  anchor.download = fileName;
  anchor.click();
}

export async function createStampsProjectZip(
  stamps: Stamp[],
  fileName: string,
  reportTitle = '',
  options?: { includePdf?: boolean },
): Promise<ExportFileResult> {
  if (stamps.length === 0) {
    throw new Error('蹂대궪 ?ㅽ꺃?꾧? ?놁뒿?덈떎.');
  }

  const safeName = sanitizeExportBaseName(fileName);
  const [titleAlign, memoAlign, showDatetime, textLayout, coordsLabel, watermarkStyle, orgName, footerPhrase, showOrgName, showFooterPhrase, titleFieldLabel, placeFieldLabel, memoFieldLabel, extra1FieldLabel, extra2FieldLabel, extra3FieldLabel] = await Promise.all([
    getTitleTextAlign(),
    getMemoTextAlign(),
    getPdfShowDatetime(),
    getStampTextLayout(),
    getCoordsLabelMode(),
    getWatermarkStyle(),
    getOverlayOrgName(),
    getOverlayFooterPhrase(),
    getOverlayShowOrgName(),
    getOverlayShowFooterPhrase(),
    getTitleFieldLabel(),
    getPlaceFieldLabel(),
    getMemoFieldLabel(),
    getExtra1FieldLabel(),
    getExtra2FieldLabel(),
    getExtra3FieldLabel(),
  ]);

  const manifestStamps: ProjectManifestStamp[] = [];
  const zip = new JSZip();
  const stampsFolder = zip.folder('stamps');
  if (!stampsFolder) {
    throw new Error('ZIP ?앹꽦???ㅽ뙣?덉뒿?덈떎.');
  }

  for (let i = 0; i < stamps.length; i++) {
    const stamp = stamps[i];
    const imageFile = stampZipImageName(i, stamp);
    const data = await readImageForZip(stamp.imagePath);
    stampsFolder.file(imageFile, data);

    manifestStamps.push({
      id: stamp.id,
      title: stamp.title,
      memo: stamp.memo,
      placeLabel: stamp.placeLabel ?? null,
      floor: stamp.floor ?? null,
      extra1: stamp.extra1 ?? null,
      extra2: stamp.extra2 ?? null,
      extra3: stamp.extra3 ?? null,
      titleFieldLabel: stamp.titleFieldLabel ?? null,
      placeFieldLabel: stamp.placeFieldLabel ?? null,
      memoFieldLabel: stamp.memoFieldLabel ?? null,
      extra1FieldLabel: stamp.extra1FieldLabel ?? null,
      extra2FieldLabel: stamp.extra2FieldLabel ?? null,
      extra3FieldLabel: stamp.extra3FieldLabel ?? null,
      latitude: stamp.latitude ?? null,
      longitude: stamp.longitude ?? null,
      createdAt: stamp.createdAt,
      updatedAt: stamp.updatedAt,
      imageFile,
    });
  }

  const manifest: ProjectManifest = {
    version: PROJECT_MANIFEST_VERSION,
    appVersion: '1.0.0',
    exportedAt: Date.now(),
    reportTitle: reportTitle.trim(),
    exportSettings: {
      titleAlign,
      memoAlign,
      showDatetime,
      textLayout,
      coordsLabel,
      watermarkStyle,
      orgName,
      footerPhrase,
      showOrgName,
      showFooterPhrase,
      titleFieldLabel,
      placeFieldLabel,
      memoFieldLabel,
      extra1FieldLabel,
      extra2FieldLabel,
      extra3FieldLabel,
    },
    stamps: manifestStamps,
  };

  zip.file('manifest.json', JSON.stringify(manifest, null, 2));

  if (options?.includePdf && Platform.OS !== 'web') {
    try {
      const pdfUri = await createStampsPdf(stamps, safeName, reportTitle);
      const pdfBase64 = await FileSystem.readAsStringAsync(pdfUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      zip.file('report.pdf', pdfBase64, { base64: true });
    } catch {
      // PDF is optional inside the project bundle.
    }
  }

  const zipFileName = `${safeName}.voicestamp.zip`;

  if (Platform.OS === 'web') {
    const blob = await zip.generateAsync({ type: 'blob' });
    const webBlobUrl = URL.createObjectURL(blob);
    return { uri: 'web', fileName: zipFileName, webBlobUrl };
  }

  // Stream ZIP chunks to disk ??do not build one giant base64 string (OOM).
  const zipPath = await writeJsZipToCacheFile(zip, zipFileName);
  return { uri: zipPath, fileName: zipFileName };
}

export async function shareProjectZip(result: ExportFileResult): Promise<void> {
  if (Platform.OS === 'web') {
    if (!result.webBlobUrl) {
      throw new Error('?ㅼ슫濡쒕뱶 ?뚯씪??以鍮꾪븯吏 紐삵뻽?듬땲??');
    }
    downloadBlobOnWeb(result.webBlobUrl, result.fileName);
    return;
  }

  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('怨듭쑀 湲곕뒫???ъ슜?????놁뒿?덈떎.');
  }

  await Sharing.shareAsync(result.uri, {
    mimeType: 'application/zip',
    dialogTitle: '?꾨줈?앺듃 ?뚯씪 怨듭쑀',
  });
}
