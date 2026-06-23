import { Alert, Platform } from 'react-native';

type ConfirmAlertOptions = {
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
};

export function confirmAlert(
  title: string,
  message: string,
  options?: ConfirmAlertOptions,
): Promise<boolean> {
  const confirmText = options?.confirmText ?? '확인';
  const cancelText = options?.cancelText ?? '취소';

  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') {
      return Promise.resolve(false);
    }
    const text = message ? `${title}\n\n${message}` : title;
    return Promise.resolve(window.confirm(text));
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: cancelText, style: 'cancel', onPress: () => resolve(false) },
      {
        text: confirmText,
        style: options?.destructive ? 'destructive' : 'default',
        onPress: () => resolve(true),
      },
    ]);
  });
}
