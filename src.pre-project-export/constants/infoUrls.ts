import { Linking, Platform } from 'react-native';

export const INFO_BASE_URL = 'https://voicestamp-gilt.vercel.app';

export type InfoPagePath = '/info' | '/privacy' | '/license' | '/help';

export function infoPageUrl(path: InfoPagePath): string {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.origin}${path}`;
  }
  return `${INFO_BASE_URL}${path}`;
}

export async function openInfoPage(path: InfoPagePath): Promise<void> {
  const url = infoPageUrl(path);
  await Linking.openURL(url);
}
