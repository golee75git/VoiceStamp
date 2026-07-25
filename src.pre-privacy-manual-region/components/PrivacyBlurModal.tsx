import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  applyBlurToImage,
  countRegionsByType,
  detectPrivacyRegions,
} from '../services/privacyBlurService';
import {
  BLUR_STRENGTH_OPTIONS,
  blurStrengthLabel,
  type BlurStrength,
  type PrivacyRegion,
} from '../services/privacyBlurTypes';

type PrivacyBlurModalProps = {
  visible: boolean;
  imageUri: string | null;
  onClose: () => void;
  onApplied: (blurredUri: string) => void;
};

type ViewBox = { left: number; top: number; width: number; height: number };

function mapImageBoxToView(
  region: PrivacyRegion,
  imageWidth: number,
  imageHeight: number,
  viewWidth: number,
  viewHeight: number,
): ViewBox | null {
  if (imageWidth <= 0 || imageHeight <= 0 || viewWidth <= 0 || viewHeight <= 0) {
    return null;
  }
  const scale = Math.min(viewWidth / imageWidth, viewHeight / imageHeight);
  const drawnW = imageWidth * scale;
  const drawnH = imageHeight * scale;
  const offsetX = (viewWidth - drawnW) / 2;
  const offsetY = (viewHeight - drawnH) / 2;
  return {
    left: offsetX + region.left * scale,
    top: offsetY + region.top * scale,
    width: Math.max(8, region.width * scale),
    height: Math.max(8, region.height * scale),
  };
}

function normalizeDisplayUri(uri: string): string {
  if (uri.startsWith('file://') || uri.startsWith('content://') || uri.startsWith('http')) {
    return uri;
  }
  return `file://${uri}`;
}

export function PrivacyBlurModal({
  visible,
  imageUri,
  onClose,
  onApplied,
}: PrivacyBlurModalProps) {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  /** EXIF-baked URI shared by preview, detect boxes, and mosaic apply. */
  const [workUri, setWorkUri] = useState<string | null>(null);
  const [regions, setRegions] = useState<PrivacyRegion[]>([]);
  const [includeFaces, setIncludeFaces] = useState(true);
  const [includeTexts, setIncludeTexts] = useState(true);
  const [strength, setStrength] = useState<BlurStrength>('medium');
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

  const stageMaxHeight = Math.min(windowHeight * 0.52, 420);
  const stageWidth = Math.min(windowWidth - 32, 520);

  const runDetect = useCallback(async (uri: string) => {
    setLoading(true);
    setError(null);
    setRegions([]);
    setWorkUri(null);
    try {
      const result = await detectPrivacyRegions(uri);
      if (!result) {
        setError('감지할 수 없습니다. 네트워크·Play 서비스 후 다시 시도하거나 닫고 저장하세요.');
        setImageSize({ width: 0, height: 0 });
        return;
      }
      setWorkUri(result.imageUri || uri);
      setImageSize({ width: result.width, height: result.height });
      setRegions(result.regions.map((r) => ({ ...r, enabled: true })));
      if (result.regions.length === 0) {
        setError('감지된 얼굴·숫자가 없습니다.');
      }
    } catch {
      setError('감지 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!visible || !imageUri) {
      return;
    }
    setIncludeFaces(true);
    setIncludeTexts(true);
    setStrength('medium');
    setWorkUri(null);
    void runDetect(imageUri);
  }, [visible, imageUri, runDetect]);

  const displayRegions = useMemo(() => {
    return regions.map((r) => ({
      ...r,
      enabled:
        r.enabled &&
        ((r.type === 'face' && includeFaces) || (r.type === 'text' && includeTexts)),
    }));
  }, [regions, includeFaces, includeTexts]);

  const counts = countRegionsByType(displayRegions);
  const enabledCount = displayRegions.filter((r) => r.enabled).length;

  const toggleRegion = (id: string) => {
    setRegions((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
    );
  };

  const handleApply = async () => {
    const source = workUri || imageUri;
    if (!source || enabledCount === 0 || applying) {
      return;
    }
    setApplying(true);
    setError(null);
    try {
      const out = await applyBlurToImage(source, displayRegions, strength);
      if (!out) {
        setError('가리기에 실패했습니다. 다시 시도하세요.');
        return;
      }
      onApplied(out);
    } catch {
      setError('가리기에 실패했습니다.');
    } finally {
      setApplying(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button">
            <Text style={styles.headerBtn}>취소</Text>
          </Pressable>
          <Text style={styles.headerTitle}>개인정보 가리기</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View
          style={[styles.stage, { width: stageWidth, height: stageMaxHeight }]}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            setStageSize({ width, height });
          }}
        >
          {workUri || imageUri ? (
            <Image
              source={{ uri: normalizeDisplayUri(workUri || imageUri!) }}
              style={StyleSheet.absoluteFill}
              resizeMode="contain"
            />
          ) : null}
          {displayRegions.map((region) => {
            const box = mapImageBoxToView(
              region,
              imageSize.width,
              imageSize.height,
              stageSize.width,
              stageSize.height,
            );
            if (!box) {
              return null;
            }
            const active = region.enabled;
            return (
              <Pressable
                key={region.id}
                onPress={() => toggleRegion(region.id)}
                style={[
                  styles.regionBox,
                  {
                    left: box.left,
                    top: box.top,
                    width: box.width,
                    height: box.height,
                    borderColor: active
                      ? region.type === 'face'
                        ? '#2563eb'
                        : '#ea580c'
                      : '#9ca3af',
                    opacity: active ? 1 : 0.45,
                  },
                ]}
                accessibilityLabel={
                  region.type === 'face' ? '얼굴 영역' : `숫자 텍스트 ${region.text ?? ''}`
                }
              />
            );
          })}
          {loading ? (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color="#fff" />
              <Text style={styles.loadingText}>감지 중…</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.summary}>
          감지: 얼굴 {counts.faces} · 숫자 {counts.texts}
          {enabledCount > 0 ? ` (적용 ${enabledCount})` : ''}
        </Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Text style={styles.hint}>박스를 탭하면 제외합니다. 사진은 폰 안에서만 처리됩니다.</Text>

        <View style={styles.row}>
          <Pressable
            style={[styles.chip, includeFaces && styles.chipOn]}
            onPress={() => setIncludeFaces((v) => !v)}
          >
            <Text style={[styles.chipText, includeFaces && styles.chipTextOn]}>얼굴 가리기</Text>
          </Pressable>
          <Pressable
            style={[styles.chip, includeTexts && styles.chipOn]}
            onPress={() => setIncludeTexts((v) => !v)}
          >
            <Text style={[styles.chipText, includeTexts && styles.chipTextOn]}>숫자 가리기</Text>
          </Pressable>
        </View>

        <Text style={styles.label}>강도</Text>
        <View style={styles.row}>
          {BLUR_STRENGTH_OPTIONS.map((option) => {
            const selected = strength === option;
            return (
              <Pressable
                key={option}
                style={[styles.chip, selected && styles.chipOn]}
                onPress={() => setStrength(option)}
              >
                <Text style={[styles.chipText, selected && styles.chipTextOn]}>
                  {blurStrengthLabel(option)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.footer}>
          <Pressable
            style={[styles.secondaryBtn, (loading || applying || !imageUri) && styles.btnDisabled]}
            onPress={() => imageUri && void runDetect(imageUri)}
            disabled={loading || applying || !imageUri}
          >
            <Text style={styles.secondaryBtnText}>다시 감지</Text>
          </Pressable>
          <Pressable
            style={[
              styles.primaryBtn,
              (loading || applying || enabledCount === 0) && styles.btnDisabled,
            ]}
            onPress={() => void handleApply()}
            disabled={loading || applying || enabledCount === 0}
          >
            {applying ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>적용</Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerBtn: {
    color: '#93c5fd',
    fontSize: 16,
    minWidth: 48,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#f8fafc',
    fontSize: 17,
    fontWeight: '600',
  },
  headerSpacer: { minWidth: 48 },
  stage: {
    alignSelf: 'center',
    backgroundColor: '#020617',
    borderRadius: 8,
    overflow: 'hidden',
  },
  regionBox: {
    position: 'absolute',
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: { color: '#fff', fontSize: 14 },
  summary: {
    marginTop: 12,
    color: '#e2e8f0',
    fontSize: 14,
  },
  error: {
    marginTop: 6,
    color: '#fbbf24',
    fontSize: 13,
  },
  hint: {
    marginTop: 4,
    color: '#94a3b8',
    fontSize: 12,
  },
  label: {
    marginTop: 12,
    color: '#cbd5e1',
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipOn: {
    backgroundColor: '#1d4ed8',
    borderColor: '#3b82f6',
  },
  chipText: { color: '#cbd5e1', fontSize: 14 },
  chipTextOn: { color: '#fff', fontWeight: '600' },
  footer: {
    marginTop: 'auto',
    flexDirection: 'row',
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#1e293b',
    alignItems: 'center',
  },
  secondaryBtnText: { color: '#e2e8f0', fontSize: 15, fontWeight: '600' },
  primaryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  btnDisabled: { opacity: 0.45 },
});
