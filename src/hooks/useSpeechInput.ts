import { useCallback, useState } from 'react';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

type UseSpeechInputOptions = {
  onResult: (text: string, isFinal: boolean) => void;
  onListeningEnd?: () => void;
};

export function useSpeechInput({ onResult, onListeningEnd }: UseSpeechInputOptions) {
  const [listening, setListening] = useState(false);
  const [available, setAvailable] = useState(true);

  const finishListening = useCallback(() => {
    setListening(false);
    onListeningEnd?.();
  }, [onListeningEnd]);

  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results[0]?.transcript ?? '';
    if (text) {
      onResult(text, event.isFinal);
    }
    if (event.isFinal) {
      finishListening();
    }
  });

  useSpeechRecognitionEvent('error', () => {
    finishListening();
  });

  useSpeechRecognitionEvent('end', () => {
    finishListening();
  });

  useSpeechRecognitionEvent('nomatch', () => {
    finishListening();
  });

  const start = useCallback(async () => {
    try {
      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permission.granted) {
        return false;
      }

      try {
        ExpoSpeechRecognitionModule.abort();
      } catch {
        // ignore stale session cleanup failures
      }

      setListening(true);
      ExpoSpeechRecognitionModule.start({
        lang: 'ko-KR',
        interimResults: true,
        continuous: false,
      });
      return true;
    } catch {
      setAvailable(false);
      setListening(false);
      return false;
    }
  }, []);

  const stop = useCallback(() => {
    try {
      ExpoSpeechRecognitionModule.stop();
    } finally {
      finishListening();
    }
  }, [finishListening]);

  return { listening, available, start, stop };
}
