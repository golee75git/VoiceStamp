# SECURITY — join QR scan Modal preview (2026-08-10)

## Change
- Join 「QR 찍기」 uses a full-screen `Modal` with pixel `width`/`height` from `Dimensions`.
- Camera mounts after a short delay; `barcodeScannerSettings` / `onBarcodeScanned` attach only after `onCameraReady` (preview first on Samsung).
- Rollback: `restore-qr-scan-modal.bat` → `src.pre-qr-scan-modal/` · `public.pre-qr-scan-modal/`.

## Why
Absolute overlay + barcode CameraView stayed black on Samsung while recognition still worked. Modal + fixed size + ready-gated scan targets the preview surface.

## Security notes
- Same local camera permission + join link parse; no new network or npm deps.
- Scan lock still blocks duplicate reads after first QR.
- GPL/OFL: unchanged.

## Patent note
Camera preview layout / Modal presentation is routine UI; no patent-clearance claim.

## Files
- Changed: `ProjectCollectScreen.tsx`, `public/help.html` (if noted)
- New: this note, restore bat, snapshots
