/**
 * Serial gallery backup after stamp DB insert.
 * Caption JPEG work runs one-at-a-time after UI interactions settle,
 * so continuous capture is less likely to fight native render jobs.
 * VoiceStamp-owned queue — no new dependencies.
 */
import { InteractionManager } from 'react-native';

let tail: Promise<void> = Promise.resolve();

function waitForIdleUi(): Promise<void> {
  return new Promise((resolve) => {
    const handle = InteractionManager.runAfterInteractions(() => {
      resolve();
    });
    if (handle && typeof (handle as { cancel?: () => void }).cancel === 'function') {
      // Keep resolve even if cancelled — next job may still run.
    }
  });
}

/**
 * Enqueue gallery backup work. Failures inside `job` should be handled by the caller.
 */
export function enqueueGallerySaveIdle(job: () => Promise<void>): void {
  tail = tail
    .then(async () => {
      await waitForIdleUi();
      await job();
    })
    .catch(() => {
      // Keep the chain alive after a rejected job.
    });
}
