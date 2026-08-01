/**
 * In-app / system capture size budget for stamp workflow.
 * VoiceStamp-owned knobs — no third-party capture SDK.
 * Keeps downstream preview, thumb, and caption work lighter.
 */

/** JPEG quality passed to expo-camera / ImagePicker (0–1). */
export const STAMP_CAPTURE_JPEG_QUALITY = 0.85;

/** Prefer picture sizes whose longer edge is at most this many pixels. */
export const STAMP_PICTURE_LONG_EDGE_MAX = 2560;
