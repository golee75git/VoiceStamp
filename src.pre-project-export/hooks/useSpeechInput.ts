import { useCallback, useState } from 'react';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

type UseSpeechInputOptions = {
  onResult: (text: string, isFinal: boolean) => void;
};

export function useSpeechInput({ onResult }: UseSpeechInputOptions) {
  const [listening, setListening] = useState(false);
  const [available, setAvailable] = useState(true);

  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results[0]?.transcript ?? '';
    if (text) {
      onResult(text, event.isFinal);
    }
    if (event.isFinal) {
      setListening(false);
    }
  });

  useSpeechRecognitionEvent('error', () => {
    setListening(false);
  });

  const start = useCallback(async () => {
    try {
      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permission.granted) {
        return false;
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
      setListening(false);
    }
  }, []);

  return { listening, available, start, stop };
}
