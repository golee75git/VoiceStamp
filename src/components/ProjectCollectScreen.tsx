import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import QRCode from 'qrcode';

import {
  buildProjectJoinHttpsUrl,
  parseProjectJoinLink,
} from '../services/projectJoinLink';

import {
  apiCloseProject,
  apiCreateProject,
  apiLookupProject,
  apiManifest,
  apiRotateUploadCode,
  mapProjectApiError,
  type ManifestStamp,
} from '../services/projectCollectApi';
import { importProjectStampToPhone } from '../services/projectImportService';
import {
  buildImportGroupName,
  clearProjectJoin,
  getCollectorPin,
  getJoinMarkPref,
  getProjectDeleteAfterImport,
  getProjectImportFolderMode,
  getProjectJoin,
  listOwnedProjects,
  removeOwnedProject,
  sanitizeJoinMark,
  setCollectorPin,
  setProjectCollectEnabled,
  setProjectDeleteAfterImport,
  setProjectImportFolderMode,
  setProjectJoin,
  upsertOwnedProject,
  type OwnedProject,
  type ProjectImportFolderMode,
  type ProjectJoinState,
} from '../services/projectCollectSettings';
import { ProjectImportedList } from './ProjectImportedList';
import { loadStampXlsxExport } from '../services/exportOnDemand';
import { getStampById, listStamps } from '../services/stampRepository';

export type ProjectCollectPhase = 'hub' | 'create' | 'qr' | 'join' | 'inbox' | 'imported';

type Props = {
  onBack: () => void;
  /** After join succeeds, open stamp camera (defaults to onBack). */
  onJoinedGoCamera?: () => void;
  initialPhase?: ProjectCollectPhase;
  onImported?: () => void;
};

function parseJoinPayload(raw: string): { projectId: string; uploadCode: string } | null {
  const trimmed = raw.trim();
  try {
    if (trimmed.includes('voicestamp://join') || trimmed.includes('/join?')) {
      const url = trimmed.includes('://')
        ? new URL(trimmed.replace('voicestamp://', 'https://join.local/'))
        : new URL(trimmed, 'https://voicestamp-gilt.vercel.app/');
      const p = url.searchParams.get('p') || '';
      const c = url.searchParams.get('c') || '';
      if (p && c) return { projectId: p, uploadCode: c };
    }
  } catch {
    // fall through
  }
  const parts = trimmed.split(/[\s,|/]+/).filter(Boolean);
  if (parts.length >= 2 && parts[0].startsWith('VS-')) {
    return { projectId: parts[0], uploadCode: parts[1] };
  }
  return null;
}

/** RN has no canvas - draw qrcode.create() modules as Views (no toDataURL). */
type QrGrid = { size: number; dark: boolean[][] };

function buildQrGrid(payload: string): QrGrid | null {
  try {
    const qr = QRCode.create(payload, { errorCorrectionLevel: 'M' });
    const size = qr.modules.size;
    const dark: boolean[][] = [];
    for (let row = 0; row < size; row += 1) {
      const line: boolean[] = [];
      for (let col = 0; col < size; col += 1) {
        line.push(qr.modules.get(row, col) === 1);
      }
      dark.push(line);
    }
    return { size, dark };
  } catch {
    return null;
  }
}

export function ProjectCollectScreen({
  onBack,
  onJoinedGoCamera,
  initialPhase = 'hub',
  initialJoinText,
  onImported,
}: Props) {
  const [phase, setPhase] = useState<ProjectCollectPhase>(initialPhase);
  const [busy, setBusy] = useState(false);
  const [owned, setOwned] = useState<OwnedProject[]>([]);
  const [join, setJoin] = useState<ProjectJoinState>(null);
  const [active, setActive] = useState<OwnedProject | null>(null);
  const [qrGrid, setQrGrid] = useState<QrGrid | null>(null);
  const [qrFailed, setQrFailed] = useState(false);

  const [name, setName] = useState('');
  const [ttlDays, setTtlDays] = useState(7);
  const [pin, setPin] = useState('');
  const [pin2, setPin2] = useState('');

  const [joinCodeText, setJoinCodeText] = useState('');
  const [joinMarkText, setJoinMarkText] = useState('');
  const [inbox, setInbox] = useState<ManifestStamp[]>([]);
  const [importedLocalById, setImportedLocalById] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [folderMode, setFolderMode] = useState<ProjectImportFolderMode>('date_name');
  const [deleteAfter, setDeleteAfter] = useState(true);
  const [collectorPinInput, setCollectorPinInput] = useState('');
  const [joinScanning, setJoinScanning] = useState(false);
  const [joinScanLocked, setJoinScanLocked] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const leaveAfterJoin = () => {
    if (onJoinedGoCamera) onJoinedGoCamera();
    else onBack();
  };


  const reload = useCallback(async () => {
    setOwned(await listOwnedProjects());
    setJoin(await getProjectJoin());
    setFolderMode(await getProjectImportFolderMode());
    setDeleteAfter(await getProjectDeleteAfterImport());
    const pref = await getJoinMarkPref();
    if (pref) setJoinMarkText((prev) => (prev.trim() ? prev : pref));
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    const text = (initialJoinText || '').trim();
    if (!text) return;
    setJoinCodeText(text);
    setPhase('join');
  }, [initialJoinText]);

  useEffect(() => {
    if (phase !== 'qr' || !active) {
      setQrGrid(null);
      setQrFailed(false);
      return;
    }
    const payload = buildProjectJoinHttpsUrl(active.projectId, active.uploadCode);
    const grid = buildQrGrid(payload);
    setQrGrid(grid);
    setQrFailed(!grid);
  }, [phase, active]);

  const folderPreview = useMemo(
    () => buildImportGroupName(active?.name || name || '사업', folderMode),
    [active?.name, name, folderMode],
  );

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('사업 만들기', '사업 이름을 입력하세요.');
      return;
    }
    if (!/^\d{4,6}$/.test(pin) || pin !== pin2) {
      Alert.alert('사업 만들기', '취합 PIN 4~6자리를 확인하고 동일하게 입력하세요.');
      return;
    }
    setBusy(true);
    try {
      const created = await apiCreateProject({
        name: name.trim(),
        ttlDays,
        collectorPin: pin,
      });
      const ownedItem: OwnedProject = {
        projectId: created.projectId,
        name: created.name,
        createdAt: Date.now(),
        expiresAt: created.expiresAt,
        uploadCode: created.uploadCode,
      };
      await upsertOwnedProject(ownedItem);
      await setCollectorPin(created.projectId, pin);
      setActive(ownedItem);
      setPhase('qr');
      await reload();
    } catch (e) {
      Alert.alert('사업 만들기', mapProjectApiError(e));
    } finally {
      setBusy(false);
    }
  };

  const confirmJoin = async (projectId: string, uploadCode: string) => {
    const mark = sanitizeJoinMark(joinMarkText);
    if (!mark) {
      Alert.alert(
        '구분 표시',
        '필수입니다. 올리는 쪽을 구분할 짧은 글자를 입력한 뒤 다시 연결해 주세요.',
      );
      return;
    }
    setBusy(true);
    try {
      let projectName = projectId;
      try {
        const looked = await apiLookupProject(projectId);
        projectName = looked.name;
      } catch {
        // still allow join; upload will validate code
      }
      Alert.alert(
        `${projectName}에 참여할까요?`,
        `구분 표시: ${mark}\n연결 후 새로 저장하는 사진·메모·위치가 일시 저장소(한국)로 전송됩니다. ZIP을 보낼 필요는 없습니다.`,
        [
          { text: '취소', style: 'cancel' },
          {
            text: '참여하고 자동으로 올리기',
            onPress: () => {
              void (async () => {
                const existing = await getProjectJoin();
                if (existing && existing.projectId !== projectId) {
                  Alert.alert(
                    '사업 연결',
                    `지금 ${existing.name}에 연결되어 있습니다. ${projectName}로 바꿀까요?`,
                    [
                      { text: '유지', style: 'cancel' },
                      {
                        text: '바꾸기',
                        onPress: () => {
                          void (async () => {
                            await setProjectCollectEnabled(true);
                            await setProjectJoin({
                              projectId,
                              name: projectName,
                              uploadCode,
                              mark,
                            });
                            await reload();
                            Alert.alert(
                              '연결되었습니다',
                              '저장 시 자동으로 올라갑니다. 촬영 화면으로 이동합니다.',
                            );
                            leaveAfterJoin();
                          })();
                        },
                      },
                    ],
                  );
                  return;
                }
                await setProjectCollectEnabled(true);
                await setProjectJoin({
                  projectId,
                  name: projectName,
                  uploadCode,
                  mark,
                });
                await reload();
                Alert.alert('연결되었습니다', '저장 시 자동으로 올라갑니다. 촬영 화면으로 이동합니다.');
                leaveAfterJoin();
              })();
            },
          },
        ],
      );
    } finally {
      setBusy(false);
    }
  };

  const handleJoinSubmit = () => {
    if (!sanitizeJoinMark(joinMarkText)) {
      Alert.alert(
        '구분 표시',
        '필수입니다. 올리는 쪽을 구분할 짧은 글자를 입력해 주세요.',
      );
      return;
    }
    const parsed = parseJoinPayload(joinCodeText);
    if (!parsed) {
      Alert.alert('참여', '사업코드와 참여코드를 확인하세요.');
      return;
    }
    void confirmJoin(parsed.projectId, parsed.uploadCode);
  };

  const handleJoinScanPress = () => {
    if (Platform.OS === 'web') {
      Alert.alert('QR 찍기', '웹에서는 카메라 QR 인식이 없습니다. 링크를 붙여 넣으세요.');
      return;
    }
    void (async () => {
      const perm = cameraPermission?.granted
        ? cameraPermission
        : await requestCameraPermission();
      if (!perm?.granted) {
        Alert.alert('QR 찍기', '카메라 권한이 필요합니다.');
        return;
      }
      setJoinScanLocked(false);
      setJoinScanning(true);
    })();
  };

  const onJoinBarcodeScanned = (result: { data?: string }) => {
    if (joinScanLocked) return;
    const raw = String(result?.data || '').trim();
    if (!raw) return;
    setJoinScanLocked(true);
    setJoinScanning(false);
    const parsed = parseJoinPayload(raw);
    if (!parsed) {
      Alert.alert('참여', '사업 참여용 QR이 아닙니다. 관리자 QR을 다시 찍어 주세요.', [
        { text: '확인', onPress: () => setJoinScanLocked(false) },
      ]);
      return;
    }
    setJoinCodeText(raw);
    if (!sanitizeJoinMark(joinMarkText)) {
      Alert.alert(
        '구분 표시',
        '필수입니다. 위쪽 「구분 표시」칸에 적은 뒤 「연결」을 눌러 주세요.',
      );
      setJoinScanLocked(false);
      return;
    }
    void confirmJoin(parsed.projectId, parsed.uploadCode);
  };

  const openInbox = async (project: OwnedProject) => {
    setActive(project);
    let pinLocal = (await getCollectorPin(project.projectId)) || collectorPinInput;
    if (!pinLocal) {
      Alert.alert('수신', '취합 PIN을 아래 칸에 입력한 뒤 다시 눌러 주세요.');
      setPhase('inbox');
      return;
    }
    setCollectorPinInput(pinLocal);
    setBusy(true);
    try {
      await setCollectorPin(project.projectId, pinLocal);
      const man = await apiManifest({ projectId: project.projectId, collectorPin: pinLocal });
      const stamps = man.stamps || [];
      setInbox(stamps);
      const localFlags: Record<string, boolean> = {};
      for (const item of stamps) {
        try {
          const row = await getStampById(item.stampId);
          localFlags[item.stampId] = !!(row && !row.deletedAt);
        } catch {
          localFlags[item.stampId] = false;
        }
      }
      setImportedLocalById(localFlags);
      setSelected(new Set());
      setPhase('inbox');
    } catch (e) {
      Alert.alert('수신', mapProjectApiError(e));
    } finally {
      setBusy(false);
    }
  };

  const handleImportSelected = async () => {
    if (!active) return;
    const pinLocal = (await getCollectorPin(active.projectId)) || collectorPinInput;
    if (!pinLocal) {
      Alert.alert('내 폰으로', '취합 PIN이 필요합니다.');
      return;
    }
    const ids = [...selected];
    if (ids.length === 0) return;
    setBusy(true);
    let ok = 0;
    let skipped = 0;
    try {
      await setProjectImportFolderMode(folderMode);
      await setProjectDeleteAfterImport(deleteAfter);
      for (const stampId of ids) {
        const result = await importProjectStampToPhone({
          project: active,
          collectorPin: pinLocal,
          stampId,
        });
        if (result.skipped) skipped += 1;
        else ok += 1;
      }
      onImported?.();
      Alert.alert(
        '가져오기 완료',
        `${ok + skipped}장을 「${folderPreview}」에 저장했습니다.${
          skipped ? ` (이미 있는 항목 ${skipped}건 건너뜀)` : ''
        }`,
      );
      await openInbox(active);
    } catch (e) {
      Alert.alert('가져오기', mapProjectApiError(e));
    } finally {
      setBusy(false);
    }
  };

  const handleExcelCollected = async (project: OwnedProject) => {
    setActive(project);
    setBusy(true);
    try {
      const folder = buildImportGroupName(project.name, folderMode);
      const all = await listStamps();
      const matched = all.filter(
        (s) =>
          s.imagePath.includes('/' + folder + '/') ||
          s.imagePath.includes('\\' + folder + '\\'),
      );
      // Also match by group folder segment
      const stamps = matched.length
        ? matched
        : all.filter((s) =>
            s.imagePath.split('/').some((seg) => seg.includes(sanitizeLoose(project.name))),
          );
      if (stamps.length === 0) {
        Alert.alert('취합 엑셀', '아직 내 폰에 가져온 사진이 없습니다.');
        return;
      }
      const { createStampsXlsx, shareStampsXlsx } = await loadStampXlsxExport();
      const base = sanitizeLoose(project.name) + '_취합_' + formatYmd(Date.now());
      const result = await createStampsXlsx(stamps, base);
      await shareStampsXlsx(result);
    } catch (e) {
      Alert.alert('취합 엑셀', e instanceof Error ? e.message : '실패');
    } finally {
      setBusy(false);
    }
  };

  const sanitizeLoose = (n: string) => n.trim().replace(/[\\/:*?"<>|]/g, '_').slice(0, 40);
  const formatYmd = (t: number) => {
    const d = new Date(t);
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  };

  const renderHub = () => (
    <ScrollView contentContainerStyle={styles.body}>
      <Pressable style={styles.row} onPress={() => setPhase('create')}>
        <Text style={styles.rowTitle}>사업 만들기</Text>
        <Text style={styles.rowSub}>기존 사업은 유지 · 새 사업을 추가합니다 (최대 20)</Text>
      </Pressable>
      <Pressable style={styles.row} onPress={() => setPhase('join')}>
        <Text style={styles.rowTitle}>코드로 참여</Text>
        <Text style={styles.rowSub}>촬영자 · 한 번만 연결</Text>
      </Pressable>
      <Text style={styles.label}>만든 사업 {owned.length ? '(' + owned.length + ')' : ''}</Text>
      {owned.length === 0 ? (
        <View style={styles.row}>
          <Text style={styles.rowSub}>만든 사업이 없습니다</Text>
        </View>
      ) : (
        owned.map((project) => {
          const left = Math.max(0, Math.ceil((project.expiresAt - Date.now()) / 86400000));
          return (
            <View key={project.projectId} style={styles.row}>
              <Text style={styles.rowTitle}>{project.name}</Text>
              <Text style={styles.rowSub}>
                D-{left} · {project.projectId}
              </Text>
              <View style={styles.ownedActions}>
                <Pressable
                  style={styles.ownedAction}
                  onPress={() => {
                    setActive(project);
                    setPhase('qr');
                  }}
                >
                  <Text style={styles.ownedActionText}>QR</Text>
                </Pressable>
                <Pressable
                  style={styles.ownedAction}
                  onPress={() => void openInbox(project)}
                  disabled={busy}
                >
                  <Text style={styles.ownedActionText}>수신</Text>
                </Pressable>
                <Pressable
                  style={styles.ownedAction}
                  onPress={() => void handleExcelCollected(project)}
                  disabled={busy}
                >
                  <Text style={styles.ownedActionText}>엑셀</Text>
                </Pressable>
                <Pressable
                  style={styles.ownedAction}
                  onPress={() => {
                    setActive(project);
                    setPhase('imported');
                  }}
                >
                  <Text style={styles.ownedActionText}>가져옴</Text>
                </Pressable>
              </View>
            </View>
          );
        })
      )}
      {join ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            참여 중 · {join.name}
            {join.mark ? ` · ${join.mark}` : ''}
          </Text>
          <Pressable
            onPress={() => {
              Alert.alert('사업 연결을 끊을까요?', '이후 저장분은 더 이상 올라가지 않습니다.', [
                { text: '취소', style: 'cancel' },
                {
                  text: '끊기',
                  style: 'destructive',
                  onPress: () => void clearProjectJoin().then(reload),
                },
              ]);
            }}
          >
            <Text style={styles.linkDanger}>연결 끊기</Text>
          </Pressable>
        </View>
      ) : null}
      <Text style={styles.hint}>일시 보관 후 삭제됩니다. 영구 저장소가 아닙니다.</Text>
    </ScrollView>
  );

  const renderCreate = () => (
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>사업 이름</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="예: 2026 여름 점검" maxLength={40} />
      <Text style={styles.label}>보관 기간</Text>
      <View style={styles.chips}>
        {[3, 7, 14, 30].map((d) => (
          <Pressable
            key={d}
            style={[styles.chip, ttlDays === d && styles.chipOn]}
            onPress={() => setTtlDays(d)}
          >
            <Text style={[styles.chipText, ttlDays === d && styles.chipTextOn]}>{d}일</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.label}>취합 PIN (4~6자리)</Text>
      <TextInput style={styles.input} value={pin} onChangeText={setPin} keyboardType="number-pad" secureTextEntry maxLength={6} />
      <Text style={styles.label}>취합 PIN 확인</Text>
      <TextInput style={styles.input} value={pin2} onChangeText={setPin2} keyboardType="number-pad" secureTextEntry maxLength={6} />
      <Text style={styles.hint}>PIN은 수신·삭제에만 씁니다. QR에는 들어가지 않습니다.</Text>
      <Pressable style={styles.primary} onPress={() => void handleCreate()} disabled={busy}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>만들기</Text>}
      </Pressable>
    </ScrollView>
  );

  const renderQr = () => {
    if (!active) return null;
    const left = Math.max(0, Math.ceil((active.expiresAt - Date.now()) / 86400000));
    return (
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.title}>{active.name}</Text>
        <Text style={styles.hint}>일시 보관 · D-{left}</Text>
        {qrGrid ? (
          <View style={styles.qrWrap}>
            <View style={[styles.qrInner, { width: qrGrid.size * 8, height: qrGrid.size * 8 }]}>
              {qrGrid.dark.map((line, row) => (
                <View key={`r${row}`} style={styles.qrRow}>
                  {line.map((isDark, col) => (
                    <View
                      key={`c${col}`}
                      style={[styles.qrCell, isDark ? styles.qrCellDark : styles.qrCellLight]}
                    />
                  ))}
                </View>
              ))}
            </View>
          </View>
        ) : qrFailed ? (
          <Text style={styles.hint}>QR을 표시하지 못했습니다. 아래 코드·공유를 사용하세요.</Text>
        ) : (
          <Text style={styles.hint}>QR 준비 중…</Text>
        )}
        <Text style={styles.mono}>사업코드 {active.projectId}</Text>
        <Text style={styles.mono}>참여코드 {active.uploadCode}</Text>
        <Text style={styles.hint}>이 QR은 올리기 전용입니다. PIN을 함께 보내지 마세요.</Text>
        <Pressable
          style={styles.secondary}
          onPress={() =>
            void Share.share({
              message: `VoiceStamp 사업 참여: ${active.name}\n${buildProjectJoinHttpsUrl(active.projectId, active.uploadCode)}`,
            })
          }
        >
          <Text style={styles.secondaryText}>공유</Text>
        </Pressable>
        <Pressable
          style={styles.secondary}
          onPress={() => {
            void (async () => {
              const p = (await getCollectorPin(active.projectId)) || '';
              if (!p) {
                Alert.alert('코드 새로고침', '취합 PIN이 필요합니다.');
                return;
              }
              try {
                const r = await apiRotateUploadCode({ projectId: active.projectId, collectorPin: p });
                const next = { ...active, uploadCode: r.uploadCode };
                await upsertOwnedProject(next);
                setActive(next);
                await reload();
              } catch (e) {
                Alert.alert('코드 새로고침', mapProjectApiError(e));
              }
            })();
          }}
        >
          <Text style={styles.secondaryText}>코드 새로고침</Text>
        </Pressable>
        <Pressable style={styles.primary} onPress={() => void openInbox(active)}>
          <Text style={styles.primaryText}>수신 목록</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            Alert.alert('사업 종료', '종료하면 더 이상 올릴 수 없습니다.', [
              { text: '취소', style: 'cancel' },
              {
                text: '종료',
                style: 'destructive',
                onPress: () => {
                  void (async () => {
                    const p = (await getCollectorPin(active.projectId)) || '';
                    try {
                      if (p) await apiCloseProject({ projectId: active.projectId, collectorPin: p });
                    } catch {
                      // still remove local
                    }
                    await removeOwnedProject(active.projectId);
                    setActive(null);
                    setPhase('hub');
                    await reload();
                  })();
                },
              },
            ]);
          }}
        >
          <Text style={styles.linkDanger}>사업 종료</Text>
        </Pressable>
      </ScrollView>
    );
  };

  const renderJoin = () => (
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>구분 표시 (필수)</Text>
      <Text style={styles.hint}>
        올리는 쪽을 구분할 짧은 글자. 별칭·번호 끝자리 등 원하는 형태로 적어 주세요. 비울 수 없습니다.
      </Text>
      <TextInput
        style={styles.input}
        value={joinMarkText}
        onChangeText={setJoinMarkText}
        placeholder="예: 현장A / 1234"
        maxLength={40}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Text style={styles.label}>참여 링크 또는 코드</Text>
      <Text style={styles.hint}>형식: VS-… 코드 / 참여코드 또는 QR·웹 참여 링크</Text>
      <TextInput
        style={[styles.input, styles.inputMulti]}
        value={joinCodeText}
        onChangeText={setJoinCodeText}
        placeholder="https://voicestamp-gilt.vercel.app/join?p=…&c=…"
        autoCapitalize="characters"
        multiline
      />
      <Pressable style={styles.secondary} onPress={handleJoinScanPress} disabled={busy}>
        <Text style={styles.secondaryText}>QR 찍기</Text>
      </Pressable>
      <Pressable style={styles.primary} onPress={handleJoinSubmit} disabled={busy}>
        <Text style={styles.primaryText}>연결</Text>
      </Pressable>
    </ScrollView>
  );

  const renderInbox = () => (
    <View style={styles.flex}>
      <View style={styles.bodyPad}>
        <Text style={styles.label}>취합 PIN</Text>
        <TextInput
          style={styles.input}
          value={collectorPinInput}
          onChangeText={setCollectorPinInput}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={6}
        />
        <Text style={styles.label}>저장 폴더</Text>
        <View style={styles.chips}>
          <Pressable
            style={[styles.chip, folderMode === 'date_name' && styles.chipOn]}
            onPress={() => setFolderMode('date_name')}
          >
            <Text style={[styles.chipText, folderMode === 'date_name' && styles.chipTextOn]}>날짜_사업명</Text>
          </Pressable>
          <Pressable
            style={[styles.chip, folderMode === 'name_only' && styles.chipOn]}
            onPress={() => setFolderMode('name_only')}
          >
            <Text style={[styles.chipText, folderMode === 'name_only' && styles.chipTextOn]}>사업명만</Text>
          </Pressable>
        </View>
        <Text style={styles.hint}>미리보기: {folderPreview}</Text>
        <Pressable
          style={styles.secondary}
          onPress={() => {
            void setProjectDeleteAfterImport(!deleteAfter).then(() => setDeleteAfter(!deleteAfter));
          }}
        >
          <Text style={styles.secondaryText}>
            가져온 뒤 일시 저장소에서 삭제: {deleteAfter ? 'ON' : 'OFF'}
          </Text>
        </Pressable>
      </View>
      <FlatList
        data={inbox}
        keyExtractor={(item) => item.stampId}
        ListEmptyComponent={<Text style={styles.hintPad}>아직 올라온 사진이 없습니다.</Text>}
        renderItem={({ item }) => {
          const on = selected.has(item.stampId);
          return (
            <Pressable
              style={[styles.inboxRow, on && styles.inboxRowOn]}
              onPress={() => {
                setSelected((prev) => {
                  const next = new Set(prev);
                  if (next.has(item.stampId)) next.delete(item.stampId);
                  else next.add(item.stampId);
                  return next;
                });
              }}
            >
              <View style={styles.inboxTitleRow}>
                <Text style={[styles.rowTitle, styles.inboxTitleFlex]} numberOfLines={2}>
                  {item.title || item.stampId}
                </Text>
                {importedLocalById[item.stampId] ? (
                  <Text style={styles.importedBadge}>가져옴</Text>
                ) : null}
              </View>
              <Text style={styles.rowSub}>
                {[
                  item.uploadedByMark || '',
                  item.uploadedAt ? new Date(item.uploadedAt).toLocaleString() : '',
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
            </Pressable>
          );
        }}
      />
      <View style={styles.bar}>
        <Pressable
          style={styles.barBtn}
          onPress={() => setSelected(new Set(inbox.map((s) => s.stampId)))}
        >
          <Text style={styles.barBtnText}>전체</Text>
        </Pressable>
        <Pressable style={styles.barBtn} onPress={() => void handleImportSelected()} disabled={busy || selected.size === 0}>
          <Text style={styles.barBtnText}>내 폰으로</Text>
        </Pressable>
        <Pressable
          style={styles.barBtn}
          onPress={() => {
            if (selected.size === 0) return;
            Alert.alert('엑셀', '엑셀로 보내려면 먼저 「내 폰으로」를 눌러 주세요. 허브의 취합 엑셀을 사용하세요.');
          }}
        >
          <Text style={styles.barBtnText}>엑셀</Text>
        </Pressable>
        <Pressable
          style={styles.barBtn}
          onPress={() => {
            if (!active) return;
            setPhase('imported');
          }}
        >
          <Text style={styles.barBtnText}>가져옴</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            if (phase === 'hub') onBack();
            else setPhase('hub');
          }}
        >
          <Text style={styles.back}>← 뒤로</Text>
        </Pressable>
        <Text style={styles.headerTitle}>사업 취합</Text>
      </View>
      {phase === 'hub' && renderHub()}
      {phase === 'create' && renderCreate()}
      {phase === 'qr' && renderQr()}
      {phase === 'join' && renderJoin()}
      {phase === 'inbox' && renderInbox()}
      {phase === 'imported' && active ? (
        <ProjectImportedList
          project={active}
          folderMode={folderMode}
          onChanged={() => onImported?.()}
        />
      ) : null}
      {busy ? (
        <View style={styles.overlay} pointerEvents="none">
          <ActivityIndicator size="large" color="#111" />
        </View>
      ) : null}
      {joinScanning ? (
        <View style={styles.scanOverlay}>
          <CameraView
            style={styles.scanCamera}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={joinScanLocked ? undefined : onJoinBarcodeScanned}
          />
          <View style={styles.scanUi} pointerEvents="box-none">
            <View style={styles.scanFrameWrap} pointerEvents="none">
              <View style={styles.scanFrame} />
            </View>
            <View style={styles.scanBottom}>
              <Text style={styles.scanHint}>가운데 네모 안에 관리자 QR이 들어오게 맞춰 주세요</Text>
              <Pressable
                style={styles.secondary}
                onPress={() => {
                  setJoinScanning(false);
                  setJoinScanLocked(false);
                }}
              >
                <Text style={styles.secondaryText}>닫기</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  flex: { flex: 1 },
  header: {
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 8,
  },
  back: { fontSize: 16, color: '#2563eb' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111' },
  body: { padding: 20, gap: 12, paddingBottom: 40 },
  bodyPad: { paddingHorizontal: 20, paddingTop: 12, gap: 8 },
  title: { fontSize: 18, fontWeight: '700', color: '#111' },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginTop: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  inputMulti: { minHeight: 80, textAlignVertical: 'top' },
  row: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 4,
  },
  rowTitle: { fontSize: 16, fontWeight: '700', color: '#111' },
  rowSub: { fontSize: 13, color: '#6b7280' },
  ownedActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  ownedAction: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
  },
  ownedActionText: { fontWeight: '700', color: '#111', fontSize: 13 },
  hint: { fontSize: 12, color: '#6b7280', lineHeight: 18 },
  hintPad: { padding: 20, color: '#6b7280' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  chipOn: { backgroundColor: '#111', borderColor: '#111' },
  chipText: { color: '#111', fontWeight: '600' },
  chipTextOn: { color: '#fff' },
  primary: {
    backgroundColor: '#111',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  secondary: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  secondaryText: { color: '#111', fontWeight: '600' },
  linkDanger: { color: '#b91c1c', fontWeight: '600', marginTop: 12, textAlign: 'center' },
  banner: {
    backgroundColor: '#ecfdf5',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  bannerText: { color: '#065f46', fontWeight: '600' },
  qrWrap: {
    alignSelf: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  qrInner: { overflow: 'hidden' },
  qrRow: { flexDirection: 'row' },
  qrCell: { width: 8, height: 8 },
  qrCellDark: { backgroundColor: '#111' },
  qrCellLight: { backgroundColor: '#fff' },
  mono: { fontFamily: 'monospace', fontSize: 13, color: '#111' },
  inboxTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inboxTitleFlex: { flex: 1 },
  importedBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1e40af',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  inboxRow: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  inboxRowOn: { backgroundColor: '#eff6ff' },
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
    // Clear Android system navigation so 전체/내 폰으로/엑셀 stay tappable.
    paddingBottom: Platform.OS === 'android' ? 56 : 28,
  },
  barBtn: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  barBtnText: { fontWeight: '700', color: '#111' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 20,
  },
  scanCamera: {
    ...StyleSheet.absoluteFillObject,
  },
  scanUi: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  scanFrameWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 240,
    height: 240,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.92)',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  scanBottom: {
    padding: 20,
    paddingBottom: Platform.OS === 'android' ? 40 : 28,
    gap: 12,
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  scanHint: { color: '#fff', textAlign: 'center', fontWeight: '600' },
});
