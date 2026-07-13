import { File, FileMode, Paths } from 'expo-file-system';
import type JSZip from 'jszip';

/**
 * Write bytes to cache without base64 round-trip (avoids OOM on large exports).
 */
export function writeUint8ArrayToCacheFile(bytes: Uint8Array, fileName: string): string {
  const file = new File(Paths.cache, fileName);
  file.create({ overwrite: true });
  file.write(bytes);
  return file.uri;
}

/**
 * Stream JSZip output to a cache file in chunks (no full base64 string in JS/native).
 */
export async function writeJsZipToCacheFile(zip: JSZip, fileName: string): Promise<string> {
  const file = new File(Paths.cache, fileName);
  file.create({ overwrite: true });
  const handle = file.open(FileMode.WriteOnly);
  try {
    await new Promise<void>((resolve, reject) => {
      const stream = zip.generateInternalStream({
        type: 'uint8array',
        streamFiles: true,
        compression: 'DEFLATE',
      });
      stream
        .on('data', (chunk: Uint8Array) => {
          handle.writeBytes(chunk);
        })
        .on('error', (error: Error) => {
          reject(error);
        })
        .on('end', () => {
          resolve();
        })
        .resume();
    });
  } catch (error) {
    try {
      handle.close();
    } catch {
      // ignore
    }
    try {
      if (file.exists) {
        file.delete();
      }
    } catch {
      // ignore
    }
    throw error;
  }
  handle.close();
  return file.uri;
}
