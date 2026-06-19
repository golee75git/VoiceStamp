import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type {
  OpenSourceLicenseEntry,
  OpenSourceLicensesDocument,
} from '../types/openSourceLicenses';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const openSourceDocument = require('../../assets/open_source_licenses.json') as OpenSourceLicensesDocument;

type OpenSourceLicensesScreenProps = {
  onBack: () => void;
};

export function OpenSourceLicensesScreen({ onBack }: OpenSourceLicensesScreenProps) {
  const [selected, setSelected] = useState<OpenSourceLicenseEntry | null>(null);

  const reviewById = useMemo(
    () => new Map(openSourceDocument.reviewRequired.map((item) => [item.id, item])),
    [],
  );

  const pendingReviews = useMemo(
    () => openSourceDocument.reviewRequired.filter((item) => item.reviewStatus !== 'confirmed'),
    [],
  );

  const confirmedReviews = useMemo(
    () => openSourceDocument.reviewRequired.filter((item) => item.reviewStatus === 'confirmed'),
    [],
  );

  const renderItem = ({ item }: { item: OpenSourceLicenseEntry }) => {
    const review = reviewById.get(item.id);
    const isPending = review && review.reviewStatus !== 'confirmed';
    const isConfirmed = review?.reviewStatus === 'confirmed';
    return (
      <Pressable
        style={[styles.row, isPending && styles.rowReview, isConfirmed && styles.rowConfirmed]}
        onPress={() => setSelected(item)}
      >
        <Text style={styles.rowName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.rowMeta}>
          v{item.version} · {item.license}
          {isPending ? ' · 검토 필요' : ''}
          {isConfirmed && review.selectedLicense ? ` · 검토 완료 (${review.selectedLicense})` : ''}
        </Text>
        <Text style={styles.rowSource}>{item.source === 'android' ? 'Android' : 'npm'}</Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={8}>
          <Text style={styles.backText}>← 설정</Text>
        </Pressable>
        <Text style={styles.title}>오픈소스 라이선스</Text>
        <Text style={styles.subtitle}>
          npm {openSourceDocument.counts.npm} · Android {openSourceDocument.counts.android} · 총{' '}
          {openSourceDocument.counts.total}
        </Text>
      </View>

      {pendingReviews.length > 0 ? (
        <View style={styles.reviewBox}>
          <Text style={styles.reviewTitle}>상업 배포 시 검토 권장 ({pendingReviews.length})</Text>
          <Text style={styles.reviewHint}>
            GPL, AGPL, LGPL, SSPL, Commons Clause 등 copyleft·추가 제한 라이선스
          </Text>
          {pendingReviews.map((item) => (
            <Pressable
              key={item.id}
              style={styles.reviewRow}
              onPress={() => {
                const lib = openSourceDocument.libraries.find((entry) => entry.id === item.id);
                if (lib) setSelected(lib);
              }}
            >
              <Text style={styles.reviewName}>{item.name}</Text>
              <Text style={styles.reviewMeta}>
                v{item.version} · {item.license} · {item.reasons.join(', ')}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {confirmedReviews.length > 0 ? (
        <View style={styles.confirmedBox}>
          <Text style={styles.confirmedTitle}>검토 완료 ({confirmedReviews.length})</Text>
          <Text style={styles.confirmedHint}>베타·테스트 배포 기준 허용적 라이선스(MIT/BSD) 조건 적용</Text>
          {confirmedReviews.map((item) => (
            <Pressable
              key={item.id}
              style={styles.confirmedRow}
              onPress={() => {
                const lib = openSourceDocument.libraries.find((entry) => entry.id === item.id);
                if (lib) setSelected(lib);
              }}
            >
              <Text style={styles.confirmedName}>{item.name}</Text>
              <Text style={styles.confirmedMeta}>
                v{item.version} · {item.selectedLicense ?? item.license}
              </Text>
              {item.conclusion ? (
                <Text style={styles.confirmedConclusion}>{item.conclusion}</Text>
              ) : null}
            </Pressable>
          ))}
        </View>
      ) : null}

      {openSourceDocument.licenseReviewSummary ? (
        <Text style={styles.summaryHint}>
          {openSourceDocument.licenseReviewSummary.conclusion}
        </Text>
      ) : null}

      <FlatList
        data={openSourceDocument.libraries}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        initialNumToRender={24}
      />

      <Modal visible={selected !== null} animationType="slide" onRequestClose={() => setSelected(null)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setSelected(null)} hitSlop={8}>
              <Text style={styles.backText}>← 목록</Text>
            </Pressable>
            <Text style={styles.modalTitle} numberOfLines={2}>
              {selected?.name}
            </Text>
            <Text style={styles.modalMeta}>
              버전 {selected?.version} · {selected?.license}
            </Text>
            <Text style={styles.modalMeta}>
              출처 {selected?.source === 'android' ? 'Android Gradle' : 'npm'}
            </Text>
            {selected?.copyright ? (
              <Text style={styles.modalCopyright}>{selected.copyright}</Text>
            ) : null}
            {(() => {
              const review = selected ? reviewById.get(selected.id) : undefined;
              if (!review?.conclusion) return null;
              return <Text style={styles.modalConclusion}>{review.conclusion}</Text>;
            })()}
          </View>
          <ScrollView style={styles.modalBody} contentContainerStyle={styles.modalBodyContent}>
            <Text style={styles.licenseHeading}>라이선스 전문</Text>
            <Text style={styles.licenseText} selectable>
              {selected?.licenseText}
            </Text>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backText: {
    color: '#2563eb',
    fontSize: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#6b7280',
  },
  reviewBox: {
    margin: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fdba74',
  },
  reviewTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#9a3412',
  },
  reviewHint: {
    marginTop: 4,
    marginBottom: 8,
    fontSize: 12,
    color: '#c2410c',
  },
  reviewRow: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#fed7aa',
  },
  reviewName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7c2d12',
  },
  reviewMeta: {
    marginTop: 2,
    fontSize: 12,
    color: '#9a3412',
  },
  confirmedBox: {
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#6ee7b7',
  },
  confirmedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#065f46',
  },
  confirmedHint: {
    marginTop: 4,
    marginBottom: 8,
    fontSize: 12,
    color: '#047857',
  },
  confirmedRow: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#a7f3d0',
  },
  confirmedName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#064e3b',
  },
  confirmedMeta: {
    marginTop: 2,
    fontSize: 12,
    color: '#047857',
  },
  confirmedConclusion: {
    marginTop: 4,
    fontSize: 11,
    color: '#065f46',
  },
  summaryHint: {
    marginHorizontal: 16,
    marginBottom: 8,
    fontSize: 11,
    color: '#6b7280',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  row: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  rowReview: {
    borderColor: '#fdba74',
    backgroundColor: '#fffaf5',
  },
  rowConfirmed: {
    borderColor: '#6ee7b7',
    backgroundColor: '#f0fdf4',
  },
  rowName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  rowMeta: {
    marginTop: 4,
    fontSize: 12,
    color: '#4b5563',
  },
  rowSource: {
    marginTop: 2,
    fontSize: 11,
    color: '#9ca3af',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalMeta: {
    marginTop: 4,
    fontSize: 13,
    color: '#6b7280',
  },
  modalCopyright: {
    marginTop: 8,
    fontSize: 13,
    color: '#374151',
  },
  modalConclusion: {
    marginTop: 6,
    fontSize: 12,
    color: '#047857',
  },
  modalBody: {
    flex: 1,
  },
  modalBodyContent: {
    padding: 16,
    paddingBottom: 32,
  },
  licenseHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  licenseText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#374151',
    fontFamily: 'monospace',
  },
});
