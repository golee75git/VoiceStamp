import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type StampSaveZoomViewerProps = {
  children: ReactNode;
  scrollEnabled?: boolean;
  onAddPhotoNote?: () => void;
};

/* SAVE_VIEWER_CAPTION: 저장·수정 탭 화면에서 사진+표시 글을 스크롤로 본다. 핀치·JPEG 합성·QR 생성 없음. 되돌리: restore-save-viewer-caption.bat */
/* NOTE_PAD_PRESS_HOST: 글 칸 추가는 ScrollView 밖에 둔다. 되돌리: restore-note-pad-press.bat */
export function StampSaveZoomViewer({
  children,
  scrollEnabled = true,
  onAddPhotoNote,
}: StampSaveZoomViewerProps) {
  return (
    <View style={styles.root}>
      <Text style={styles.lead}>
        입력한 표시 글을 사진과 같이 봅니다. 아래를 밀어 확인한 뒤 「닫기」로 저장 화면으로 돌아갑니다.
      </Text>
      {onAddPhotoNote ? (
        <Pressable
          style={styles.addNoteBtn}
          onPress={onAddPhotoNote}
          accessibilityRole="button"
          accessibilityLabel="글 칸 추가"
        >
          <Text style={styles.addNoteText}>글 칸 추가</Text>
        </Pressable>
      ) : null}
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
  addNoteBtn: {
    alignSelf: 'center',
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#1e293b',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#64748b',
  },
  addNoteText: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '700',
  },
});
