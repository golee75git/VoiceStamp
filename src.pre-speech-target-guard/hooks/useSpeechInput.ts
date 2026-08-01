import { useCallback, useRef, useState } from 'react';
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
  const listeningRef = useRef(false);

  const finishListening = useCallback(() => {
    if (!listeningRef.current) {
      return;
    }
    listeningRef.current = false;
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

  useSpeechRecognitionEvent('error', (event) => {
    if (event.error === 'aborted') {
      return;
    }
    if (event.error === 'not-allowed') {
      setAvailable(false);
    }
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
        setAvailable(false);
        return false;
      }

      listeningRef.current = true;
      setListening(true);
      ExpoSpeechRecognitionModule.start({
        lang: 'ko-KR',
        interimResults: true,
        continuous: false,
      });
      return true;
    } catch {
      listeningRef.current = false;
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
