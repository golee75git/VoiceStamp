import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

type StampSaveZoomViewerProps = {
  children: ReactNode;
  scrollEnabled?: boolean;
};

/* SAVE_VIEWER_CAPTION: 저장·수정 탭 화면에서 사진+표시 글을 스크롤로 본다. 핀치·JPEG 합성·QR 생성 없음. 되돌리: restore-save-viewer-caption.bat */
/* NOTE_PAD_TUNE_HOST: 글 넣기는 하단 닫기 줄에 둔다. 되돌리: restore-note-pad-tune.bat */
export function StampSaveZoomViewer({
  children,
  scrollEnabled = true,
}: StampSaveZoomViewerProps) {
  return (
    <View style={styles.root}>
      <Text style={styles.lead}>
        사진과 표시 글을 봅니다. 사진 위 글은 아래 「글 넣기」입니다. 「닫기」로 저장 화면으로 돌아갑니다.
      </Text>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        bounces={false}
        scrollEnabled={scrollEnabled}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
  },
  scroll: {
    flex: 1,
    width: '100%',
  },
  content: {
    width: '100%',
    paddingBottom: 24,
  },
  lead: {
    color: '#e5e7eb',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 8,
  },
});
