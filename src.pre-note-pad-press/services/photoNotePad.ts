export const PHOTO_NOTE_PAD_MAX = 8;
export const PHOTO_NOTE_PAD_BODY_MAX = 40;

export type PhotoNotePadItem = {
  id: string;
  body: string;
  nx: number;
  ny: number;
};

function clampUnit(value: number): number {
  if (!Number.isFinite(value)) {
    return 0.5;
  }
  return Math.min(0.92, Math.max(0.02, value));
}

function cleanBody(raw: string): string {
  return raw.replace(/[\u0000-\u001f]/g, '').trim().slice(0, PHOTO_NOTE_PAD_BODY_MAX);
}

export function parsePhotoNotePad(raw?: string | null): PhotoNotePadItem[] {
  if (!raw?.trim()) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as { notes?: unknown };
    if (!Array.isArray(parsed?.notes)) {
      return [];
    }
    const out: PhotoNotePadItem[] = [];
    for (const row of parsed.notes) {
      if (out.length >= PHOTO_NOTE_PAD_MAX) {
        break;
      }
      if (!row || typeof row !== 'object') {
        continue;
      }
      const rec = row as Record<string, unknown>;
      const id = typeof rec.id === 'string' ? rec.id.trim().slice(0, 40) : '';
      if (!id) {
        continue;
      }
      out.push({
        id,
        body: typeof rec.body === 'string' ? cleanBody(rec.body) : '',
        nx: clampUnit(typeof rec.nx === 'number' ? rec.nx : Number(rec.nx)),
        ny: clampUnit(typeof rec.ny === 'number' ? rec.ny : Number(rec.ny)),
      });
    }
    return out;
  } catch {
    return [];
  }
}

export function serializePhotoNotePad(items: PhotoNotePadItem[]): string | null {
  const notes = items.slice(0, PHOTO_NOTE_PAD_MAX).map((item) => ({
    id: item.id.slice(0, 40),
    body: cleanBody(item.body),
    nx: clampUnit(item.nx),
    ny: clampUnit(item.ny),
  }));
  if (notes.length === 0) {
    return null;
  }
  return JSON.stringify({ v: 1, notes });
}

export function makePhotoNotePadItem(index: number): PhotoNotePadItem {
  const step = 0.08 * (index % PHOTO_NOTE_PAD_MAX);
  return {
    id: `pn-${Date.now().toString(36)}-${index}`,
    body: '',
    nx: clampUnit(0.12 + step),
    ny: clampUnit(0.18 + step * 0.5),
  };
}

export function movePhotoNotePadItem(
  items: PhotoNotePadItem[],
  id: string,
  nx: number,
  ny: number,
): PhotoNotePadItem[] {
  return items.map((item) =>
    item.id === id ? { ...item, nx: clampUnit(nx), ny: clampUnit(ny) } : item,
  );
}

export function setPhotoNotePadBody(
  items: PhotoNotePadItem[],
  id: string,
  body: string,
): PhotoNotePadItem[] {
  return items.map((item) => (item.id === id ? { ...item, body: cleanBody(body) } : item));
}

export function dropPhotoNotePadItem(items: PhotoNotePadItem[], id: string): PhotoNotePadItem[] {
  return items.filter((item) => item.id !== id);
}
