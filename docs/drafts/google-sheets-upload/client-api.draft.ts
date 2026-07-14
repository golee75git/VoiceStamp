/**
 * GS-UPLOAD-01 클라이언트 API 초안
 *
 * ⚠️ 이 파일은 docs/drafts 용입니다. src/ 에 복사·연동하지 않은 상태입니다.
 * 구현 시 exportGoogleSheet.ts 등으로 옮기고, pdfImageForExport 압축을 재사용하세요.
 */

/** Stamp 타입은 구현 시 src/types/stamp 에서 import */
export type GsUploadStampInput = {
  id: string;
  title: string;
  memo: string;
  imagePath: string;
  createdAt: number;
  latitude?: number | null;
  longitude?: number | null;
  floor?: string | null;
  placeLabel?: string | null;
};

export type GsUploadRequest = {
  token: string;
  id: string;
  title: string;
  memo: string;
  createdAt: number;
  latitude: number | null;
  longitude: number | null;
  floor: string | null;
  placeLabel: string | null;
  imageBase64: string;
  mimeType: 'image/jpeg';
};

export type GsUploadResponse =
  | { ok: true; id: string; url: string; fileId: string }
  | { ok: false; error: string };

export type GsUploadProgress = {
  done: number;
  total: number;
  lastId?: string;
  lastError?: string;
};

export type GsUploadBatchResult = {
  okCount: number;
  failCount: number;
  failures: Array<{ id: string; error: string }>;
};

/** 환경변수(구현 시): EXPO_PUBLIC_GS_UPLOAD_URL / EXPO_PUBLIC_GS_UPLOAD_TOKEN */
export const GS_UPLOAD_LIMITS = {
  maxPerBatch: 20,
  maxRetries: 2,
  /** pdfImageForExport `compressed` 와 동일 */
  maxWidth: 1024,
  jpegCompress: 0.55,
  concurrency: 1,
} as const;

/**
 * 의사코드:
 *
 * async function compressStampJpeg(imagePath): Promise<string> {
 *   // manipulateAsync resize 1024 + SaveFormat.JPEG compress 0.55
 *   // return base64 without data: prefix
 * }
 *
 * async function uploadOne(stamp, url, token): Promise<GsUploadResponse> {
 *   const imageBase64 = await compressStampJpeg(stamp.imagePath);
 *   const body: GsUploadRequest = { token, mimeType: 'image/jpeg', ...meta, imageBase64 };
 *   const res = await fetch(url, {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'text/plain;charset=utf-8' },
 *     body: JSON.stringify(body),
 *   });
 *   return (await res.json()) as GsUploadResponse;
 * }
 *
 * async function uploadStampsToSharedSheet(
 *   stamps: GsUploadStampInput[],
 *   onProgress?: (p: GsUploadProgress) => void,
 * ): Promise<GsUploadBatchResult> {
 *   const url = process.env.EXPO_PUBLIC_GS_UPLOAD_URL;
 *   const token = process.env.EXPO_PUBLIC_GS_UPLOAD_TOKEN;
 *   if (!url || !token) throw new Error('시트 업로드가 설정되지 않았습니다.');
 *   const list = stamps.slice(0, GS_UPLOAD_LIMITS.maxPerBatch);
 *   const failures = [];
 *   let okCount = 0;
 *   for (let i = 0; i < list.length; i++) {
 *     let lastErr = 'unknown';
 *     let success = false;
 *     for (let attempt = 0; attempt <= GS_UPLOAD_LIMITS.maxRetries; attempt++) {
 *       try {
 *         const r = await uploadOne(list[i], url, token);
 *         if (r.ok) { success = true; break; }
 *         lastErr = r.error;
 *       } catch (e) {
 *         lastErr = e instanceof Error ? e.message : String(e);
 *       }
 *     }
 *     if (success) okCount++;
 *     else failures.push({ id: list[i].id, error: lastErr });
 *     onProgress?.({ done: i + 1, total: list.length, lastId: list[i].id, lastError: success ? undefined : lastErr });
 *   }
 *   return { okCount, failCount: failures.length, failures };
 * }
 */

export {};
