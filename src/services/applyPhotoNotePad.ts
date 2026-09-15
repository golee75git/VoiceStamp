import { Platform } from 'react-native';
import Marker, { ImageFormat, TextBackgroundType } from 'react-native-image-marker';

import type { PhotoNotePadItem } from './photoNotePad';

function normalizeMarkedUri(markedUri: string): string {
  if (markedUri.startsWith('file://') || markedUri.startsWith('content://')) {
    return markedUri;
  }
  if (markedUri.startsWith('/')) {
    return `file://${markedUri}`;
  }
  return markedUri;
}

/** Draw round-pad notes onto a prepared photo. Empty list returns the same URI. */
export async function applyPhotoNotePadToUri(
  photoUri: string,
  width: number,
  height: number,
  notes: PhotoNotePadItem[] | undefined,
  jpegQuality: number,
): Promise<string> {
  if (Platform.OS === 'web' || !notes?.length || width <= 0 || height <= 0) {
    return photoUri;
  }
  const visible = notes.filter((note) => note.body.length > 0);
  if (visible.length === 0) {
    return photoUri;
  }
  const fontSize = Math.max(14, Math.round(Math.min(width, height) * 0.028));
  const pad = Math.max(6, Math.round(fontSize * 0.45));
  const radius = Math.max(8, Math.round(fontSize * 0.7));
  try {
    const marked = await Marker.markText({
      backgroundImage: { src: photoUri, scale: 1 },
      watermarkTexts: visible.map((note) => ({
        text: note.body,
        positionOptions: {
          X: Math.round(note.nx * width),
          Y: Math.round(note.ny * height),
        },
        style: {
          color: '#111827',
          fontSize,
          bold: true,
          textAlign: 'left' as const,
          textBackgroundStyle: {
            type: TextBackgroundType.none,
            color: '#F8FAFC',
            paddingX: pad,
            paddingY: pad,
            cornerRadius: {
              all: { x: radius, y: radius },
            },
          },
        },
      })),
      quality: Math.max(70, Math.min(100, Math.round(jpegQuality))),
      saveFormat: ImageFormat.jpg,
    });
    return normalizeMarkedUri(marked);
  } catch {
    return photoUri;
  }
}
