/**
 * Load PDF / ZIP / XLSX / HWPX modules only when the user exports.
 * Keeps camera-home JS graph free of exceljs / jszip until needed.
 * VoiceStamp-owned loaders — no new packages.
 */

export function loadStampPdfExport() {
  return import('./exportPdf');
}

export function loadStampProjectExport() {
  return import('./exportProject');
}

export function loadStampXlsxExport() {
  return import('./exportXlsx');
}

export function loadStampHwpxExport() {
  return import('./exportHwpx');
}
