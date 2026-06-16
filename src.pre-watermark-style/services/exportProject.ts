import JSZip from 'jszip';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { createStampsPdf } from './exportPdf';
import { resolveImageUri, sanitizeStampFileBaseName } from './fileService';
import {
  getCoordsLabelMode,
  getMemoTextAlign,
  getPdfShowDatetime,
  getStampTextLayout,
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
};

export type ProjectManifestStamp = {
  id: string;
  title: string;
  memo: string;
  floor: string | null;
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

async function readImageForZip(
  imagePath: string,
): Promise<{ data: string | Uint8Array; base64: boolean }> {
  const uri = resolveImageUri(imagePath);

  if (Platform.OS === 'web') {
    const response = await fetch(uri);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    return { data: new Uint8Array(arrayBuffer), base64: false };
  }

  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return { data: base64, base64: true };
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
    throw new Error('보낼 스탬프가 없습니다.');
  }

  const safeName = sanitizeExportBaseName(fileName);
  const [titleAlign, memoAlign, showDatetime, textLayout, coordsLabel] = await Promise.all([
    getTitleTextAlign(),
    getMemoTextAlign(),
    getPdfShowDatetime(),
    getStampTextLayout(),
    getCoordsLabelMode(),
  ]);

  const manifestStamps: ProjectManifestStamp[] = [];
  const zip = new JSZip();
  const stampsFolder = zip.folder('stamps');
  if (!stampsFolder) {
    throw new Error('ZIP 생성에 실패했습니다.');
  }

  for (let i = 0; i < stamps.length; i++) {
    const stamp = stamps[i];
    const imageFile = stampZipImageName(i, stamp);
    const { data, base64 } = await readImageForZip(stamp.imagePath);

    if (base64 && typeof data === 'string') {
      stampsFolder.file(imageFile, data, { base64: true });
    } else if (data instanceof Uint8Array) {
      stampsFolder.file(imageFile, data);
    }

    manifestStamps.push({
      id: stamp.id,
      title: stamp.title,
      memo: stamp.memo,
      floor: stamp.floor ?? null,
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

  const base64Zip = await zip.generateAsync({ type: 'base64' });
  const dir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
  if (!dir) {
    throw new Error('저장 경로를 사용할 수 없습니다.');
  }

  const zipPath = `${dir}${zipFileName}`;
  await FileSystem.writeAsStringAsync(zipPath, base64Zip, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return { uri: zipPath, fileName: zipFileName };
}

export async function shareProjectZip(result: ExportFileResult): Promise<void> {
  if (Platform.OS === 'web') {
    if (!result.webBlobUrl) {
      throw new Error('다운로드 파일을 준비하지 못했습니다.');
    }
    downloadBlobOnWeb(result.webBlobUrl, result.fileName);
    return;
  }

  const available = await Sharing.isAvailableAsync();
  if (!available) {
    throw new Error('공유 기능을 사용할 수 없습니다.');
  }

  await Sharing.shareAsync(result.uri, {
    mimeType: 'application/zip',
    dialogTitle: '프로젝트 파일 공유',
  });
}
