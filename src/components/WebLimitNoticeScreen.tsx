import { Linking, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { INFO_BASE_URL } from '../constants/infoUrls';

const APK_DOWNLOAD_URL = `${INFO_BASE_URL}/`;

const WEB_LIMITS = [
  '개인정보 가리기 (얼굴·숫자 모자이크)',
  '글자 읽어 채우기 (사진 OCR → 제목·메모)',
  '장면 키워드 (저장 화면 버튼)',
  '앱 내 카메라·배율(1x·3x·5x)·전후면 전환',
  '갤러리 앨범 백업',
  '음성 입력·목록 검색 마이크',
] as const;

type WebLimitNoticeScreenProps = {
  onContinue: () => void;
};

/** Shown only on web (/app) before the main camera/list UI. */
export function WebLimitNoticeScreen({ onContinue }: WebLimitNoticeScreenProps) {
  const openHomeForApk = () => {
    void Linking.openURL(APK_DOWNLOAD_URL);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>웹 테스트 안내</Text>
        <Text style={styles.lead}>
          이 화면은 브라우저용 테스트입니다. 아래 기능은 Android APK에서만 사용할 수 있습니다.
        </Text>
        <View style={styles.list}>
          {WEB_LIMITS.map((item) => (
            <Text key={item} style={styles.item}>
              · {item}
            </Text>
          ))}
        </View>
        <Text style={styles.note}>
          실제 사용·평가는 홈페이지에서 APK를 받아 설치해 주세요. 데이터는 브라우저에만 남으며
          VoiceStamp 서버로 사진을 보내지 않습니다.
        </Text>
        <Pressable
          style={styles.linkButton}
          onPress={openHomeForApk}
          accessibilityRole="link"
          accessibilityLabel="APK 다운로드 홈페이지 열기"
        >
          <Text style={styles.linkText}>APK 다운로드 페이지 열기</Text>
        </Pressable>
      </ScrollView>
      <View style={styles.footer}>
        <Pressable
          style={styles.continueButton}
          onPress={onContinue}
          accessibilityRole="button"
          accessibilityLabel="확인 후 웹 테스트 계속"
        >
          <Text style={styles.continueText}>확인 후 계속</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F4FE',
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 16,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  lead: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
  },
  list: {
    gap: 6,
    paddingVertical: 4,
  },
  item: {
    fontSize: 14,
    lineHeight: 21,
    color: '#1f2937',
  },
  note: {
    fontSize: 13,
    lineHeight: 20,
    color: '#6b7280',
  },
  linkButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  linkText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2563eb',
    textDecorationLine: 'underline',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'android' ? 20 : 16,
  },
  continueButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
