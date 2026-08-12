/** Lightweight UI feedback for stamp save / project upload (no persistence). */

export type ProjectUploadFeedbackEvent =
  | { type: 'saved_local' }
  | { type: 'upload_queued'; projectName: string }
  | { type: 'uploading'; projectName: string }
  | { type: 'synced'; projectName: string }
  | { type: 'failed'; projectName: string };

type Listener = (event: ProjectUploadFeedbackEvent) => void;

const listeners = new Set<Listener>();

export function subscribeProjectUploadFeedback(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitProjectUploadFeedback(event: ProjectUploadFeedbackEvent): void {
  listeners.forEach((listener) => {
    try {
      listener(event);
    } catch {
      // ignore listener errors
    }
  });
}
