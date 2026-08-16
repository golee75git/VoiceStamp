import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Dimensions,
  FlatList,
  Image,
  Modal,
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
  type ProjectJoinCodes,
} from '../services/projectJoinLink';

import {
  apiCloseProject,
  apiCreateProject,
  apiLookupProject,
  apiManifest,
  apiRotateUploadCode,
  apiSetInviteTemplate,
  mapProjectApiError,
} from '../services/projectCollectApi';
import {
  applyInviteTemplateForJoin,
  isBuiltinStampFieldTemplateId,
  toInviteFieldTemplatePayload,
} from '../services/projectInviteTemplate';
import {
  listCustomStampFieldTemplates,
  STAMP_FIELD_TEMPLATES,
  type StampFieldTemplate,
} from '../services/stampFieldTemplates';
import { importProjectStampToPhone } from '../services/projectImportService';
import {
  buildImportGroupName,
  clearProjectJoin,
  getCollectorPin,
  getInboxExcelFontSize,
  getInboxExcelPreviewWidth,
  getJoinMarkPref,
  getProjectDeleteAfterImport,
  getProjectImportFolderMode,
  getProjectJoin,
  inboxExcelFontSizeToPt,
  listJoinedProjectHistory,
  listOwnedProjects,
  markOwnedProjectClosed,
  removeJoinedProjectHistory,
  removeOwnedProject,
  sanitizeInboxExcelFontSize,
  sanitizeInboxExcelPreviewWidth,
  sanitizeJoinMark,
  setCollectorPin,
  setInboxExcelFontSize,
  setInboxExcelPreviewWidth,
  setProjectCollectEnabled,
  setProjectDeleteAfterImport,
  setProjectImportFolderMode,
  setProjectJoin,
  upsertOwnedProject,
  DEFAULT_INBOX_EXCEL_FONT_SIZE,
  DEFAULT_INBOX_EXCEL_PREVIEW_WIDTH,
  MAX_INBOX_EXCEL_PREVIEW_WIDTH,
  MIN_INBOX_EXCEL_PREVIEW_WIDTH,
  type InboxExcelFontSize,
  type JoinedProjectHistory,
  type OwnedProject,
  type ProjectImportFolderMode,
  type ProjectJoinState,
} from '../services/projectCollectSettings';
import { StampListThumb } from './StampListThumb';
import { ProjectSentList } from './ProjectSentList';
import { loadStampXlsxExport, XLSX_ROW_FILL_MIN } from '../services/exportOnDemand';
import { resolveImageUri } from '../services/fileService';
import {
  listImportedStampsForProject,
  mergeInboxWithLocal,
  type MergedInboxItem,
} from '../services/projectImportedStamps';
import { listStamps } from '../services/stampRepository';
import { moveStampsToTrash } from '../services/stampTrash';
import type { Stamp } from '../types/stamp';

export type ProjectCollectPhase = 'hub' | 'create' | 'qr' | 'join' | 'inbox' | 'sent';

type Props = {
  onBack: () => void;
  /** After join succeeds, open stamp camera (defaults to onBack). */
  onJoinedGoCamera?: () => void;
  initialPhase?: ProjectCollectPhase;
  initialJoinText?: string;
  /** True when opened from https/voicestamp join deep link. */
  openedFromLink?: boolean;
  onImported?: () => void;
};


function collectPressStyle(
  ...parts: Array<object | false | null | undefined>
): (state: { pressed: boolean }) => Array<object | false | null | undefined> {
  return ({ pressed }) => [...parts, pressed ? styles.pressed : null];
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
  openedFromLink = false,
  onImported,
}: Props) {
  const [phase, setPhase] = useState<ProjectCollectPhase>(initialPhase);
  const [busy, setBusy] = useState(false);
  const [importProgress, setImportProgress] = useState<{
    current: number;
    total: number;
    title: string;
  } | null>(null);
  const [xlsxFill, setXlsxFill] = useState<{ current: number; total: number } | null>(null);
  const [owned, setOwned] = useState<OwnedProject[]>([]);
  const [joinHistory, setJoinHistory] = useState<JoinedProjectHistory[]>([]);
  const [join, setJoin] = useState<ProjectJoinState>(null);
  const [active, setActive] = useState<OwnedProject | null>(null);
  const [sentFocus, setSentFocus] = useState<JoinedProjectHistory | null>(null);
  const [qrGrid, setQrGrid] = useState<QrGrid | null>(null);
  const [qrFailed, setQrFailed] = useState(false);

  const [name, setName] = useState('');
  const [ttlDays, setTtlDays] = useState(7);
  const [creatorLabel, setCreatorLabel] = useState('');
  const [pin, setPin] = useState('');
  const [pin2, setPin2] = useState('');

  const [joinCodeText, setJoinCodeText] = useState('');
  const [joinMarkText, setJoinMarkText] = useState('');
  const [inbox, setInbox] = useState<MergedInboxItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [barPick, setBarPick] = useState<'all' | 'phone' | 'xlsx' | 'bin' | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [folderMode, setFolderMode] = useState<ProjectImportFolderMode>('date_name');
  const [deleteAfter, setDeleteAfter] = useState(true);
  const [collectorPinInput, setCollectorPinInput] = useState('');
  const [joinScanning, setJoinScanning] = useState(false);
  const [joinScanLocked, setJoinScanLocked] = useState(false);
  const [joinScanCameraMounted, setJoinScanCameraMounted] = useState(false);
  const [joinScanCameraReady, setJoinScanCameraReady] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [inviteTemplateName, setInviteTemplateName] = useState<string | null>(null);
  const [inviteTemplateSourceId, setInviteTemplateSourceId] = useState<string | null>(null);
  const [inviteId, setInviteId] = useState<string | null>(null);
  const [templatePickerVisible, setTemplatePickerVisible] = useState(false);
  const [templatePickerOptions, setTemplatePickerOptions] = useState<StampFieldTemplate[]>([]);
  const [excelPxVisible, setExcelPxVisible] = useState(false);
  const [excelPxText, setExcelPxText] = useState(String(DEFAULT_INBOX_EXCEL_PREVIEW_WIDTH));
  const [excelFontSize, setExcelFontSize] = useState<InboxExcelFontSize>(DEFAULT_INBOX_EXCEL_FONT_SIZE);
  const [excelPxPending, setExcelPxPending] = useState<{
    stamps: Stamp[];
    fileBase: string;
  } | null>(null);
  const [linkInviteHint, setLinkInviteHint] = useState<string | null>(null);

  const leaveAfterJoin = () => {
    if (onJoinedGoCamera) onJoinedGoCamera();
    else onBack();
  };


  const reload = useCallback(async () => {
    setOwned(await listOwnedProjects());
    setJoinHistory(await listJoinedProjectHistory());
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
    if (!joinScanning) {
      setJoinScanCameraMounted(false);
      setJoinScanCameraReady(false);
      return;
    }
    setJoinScanCameraMounted(false);
    setJoinScanCameraReady(false);
    const timer = setTimeout(() => setJoinScanCameraMounted(true), 80);
    return () => clearTimeout(timer);
  }, [joinScanning]);

  const closeJoinScan = useCallback(() => {
    setJoinScanning(false);
    setJoinScanCameraMounted(false);
    setJoinScanCameraReady(false);
  }, []);

  const handleHeaderBack = useCallback(() => {
    if (joinScanning) {
      closeJoinScan();
      return;
    }
    if (phase === 'hub') {
      onBack();
      return;
    }
    setSentFocus(null);
    setPhase('hub');
  }, [closeJoinScan, joinScanning, onBack, phase]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      handleHeaderBack();
      return true;
    });
    return () => sub.remove();
  }, [handleHeaderBack]);

  useEffect(() => {
    const text = (initialJoinText || '').trim();
    if (!text) return;
    setJoinCodeText(text);
    setPhase('join');
    const parsed = parseProjectJoinLink(text);
    if (parsed) {
      setLinkInviteHint(parsed.projectId);
      void apiLookupProject(parsed.projectId, { inviteId: parsed.inviteId || undefined })
        .then((looked) => {
          if (looked?.name) setLinkInviteHint(looked.name);
        })
        .catch(() => {
          /* keep projectId hint */
        });
    }
  }, [initialJoinText]);

  useEffect(() => {
    if (phase !== 'qr' || !active) {
      setQrGrid(null);
      setQrFailed(false);
      return;
    }
    const payload = buildProjectJoinHttpsUrl(active.projectId, active.uploadCode, {
      templateId:
        inviteTemplateSourceId && isBuiltinStampFieldTemplateId(inviteTemplateSourceId)
          ? inviteTemplateSourceId
          : null,
      inviteId,
    });
    const grid = buildQrGrid(payload);
    setQrGrid(grid);
    setQrFailed(!grid);
  }, [phase, active, inviteTemplateSourceId, inviteId]);

  const syncInviteStateFromOwned = (project: OwnedProject) => {
    setInviteTemplateSourceId(project.inviteTemplateSourceId || null);
    setInviteId(project.inviteId || null);
    const sid = project.inviteTemplateSourceId || null;
    if (!sid) {
      setInviteTemplateName(null);
      return;
    }
    const builtin = STAMP_FIELD_TEMPLATES.find((t) => t.id === sid);
    setInviteTemplateName(project.inviteTemplateName || builtin?.name || sid);
  };

  const openInviteForProject = (project: OwnedProject) => {
    setActive(project);
    syncInviteStateFromOwned(project);
    setPhase('qr');
  };

  const handlePickInviteTemplate = async (template: StampFieldTemplate) => {
    if (!active) return;
    setTemplatePickerVisible(false);
    const p = (await getCollectorPin(active.projectId)) || '';
    if (!p) {
      Alert.alert('저장 템플릿', '취합 PIN이 필요합니다.');
      return;
    }
    setBusy(true);
    try {
      const payload = toInviteFieldTemplatePayload(template);
      const r = await apiSetInviteTemplate({
        projectId: active.projectId,
        collectorPin: p,
        template: payload,
      });
      const next: OwnedProject = {
        ...active,
        inviteTemplateSourceId: template.id,
        inviteTemplateName: template.name,
        inviteId: r.inviteId,
      };
      await upsertOwnedProject(next);
      setActive(next);
      setInviteTemplateSourceId(template.id);
      setInviteTemplateName(template.name);
      setInviteId(r.inviteId);
    } catch (e) {
      Alert.alert('저장 템플릿', mapProjectApiError(e));
    } finally {
      setBusy(false);
    }
  };

  const openTemplatePicker = () => {
    void (async () => {
      const customs = await listCustomStampFieldTemplates();
      setTemplatePickerOptions([...STAMP_FIELD_TEMPLATES, ...customs]);
      setTemplatePickerVisible(true);
    })();
  };

  const clearInviteTemplate = () => {
    if (!active) return;
    void (async () => {
      const next: OwnedProject = {
        ...active,
        inviteTemplateSourceId: null,
        inviteTemplateName: null,
        inviteId: null,
      };
      await upsertOwnedProject(next);
      setActive(next);
      setInviteTemplateSourceId(null);
      setInviteTemplateName(null);
      setInviteId(null);
    })();
  };

  const folderPreview = useMemo(
    () => buildImportGroupName(active?.name || name || '사업', folderMode),
    [active?.name, name, folderMode],
  );

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('사업 만들기', '사업 이름을 입력하세요.');
      return;
    }
    const creator = creatorLabel.trim().replace(/[\\/:*?"<>|]/g, '_').slice(0, 40);
    if (!creator) {
      Alert.alert('사업 만들기', '만든 회사 또는 사람을 입력하세요.');
      return;
    }
    if (!/^\d{6}$/.test(pin) || pin !== pin2) {
      Alert.alert('사업 만들기', '취합 PIN 6자리를 확인하고 동일하게 입력하세요.');
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
        creatorLabel: creator,
      };
      await upsertOwnedProject(ownedItem);
      await setCollectorPin(created.projectId, pin);
      setActive(ownedItem);
      setInviteTemplateSourceId(null);
      setInviteTemplateName(null);
      setInviteId(null);
      setPhase('qr');
      await reload();
    } catch (e) {
      Alert.alert('사업 만들기', mapProjectApiError(e));
    } finally {
      setBusy(false);
    }
  };

  const finishJoinWithTemplate = async (
    projectId: string,
    projectName: string,
    uploadCode: string,
    mark: string,
    link: Pick<ProjectJoinCodes, 'templateId' | 'inviteId'>,
    fieldTemplate: Parameters<typeof applyInviteTemplateForJoin>[0]['fieldTemplate'],
  ) => {
    await setProjectCollectEnabled(true);
    await setProjectJoin({
      projectId,
      name: projectName,
      uploadCode,
      mark,
    });
    try {
      await applyInviteTemplateForJoin({
        fieldTemplate: fieldTemplate || null,
        templateId: link.templateId || null,
      });
    } catch {
      // join still ok if template apply fails
    }
    await reload();
    // One-path: go straight to camera (no success Alert). Template apply already ran above.
    leaveAfterJoin();
  };

  const confirmJoin = async (
    projectId: string,
    uploadCode: string,
    link: Pick<ProjectJoinCodes, 'templateId' | 'inviteId'> = {},
  ) => {
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
      let fieldTemplate: Parameters<typeof applyInviteTemplateForJoin>[0]['fieldTemplate'] = null;
      try {
        const looked = await apiLookupProject(projectId, { inviteId: link.inviteId });
        projectName = looked.name;
        fieldTemplate = looked.fieldTemplate || null;
      } catch {
        // still allow join; upload will validate code
      }

      const runJoin = async () => {
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
                  void finishJoinWithTemplate(
                    projectId,
                    projectName,
                    uploadCode,
                    mark,
                    link,
                    fieldTemplate,
                  );
                },
              },
            ],
          );
          return;
        }
        await finishJoinWithTemplate(
          projectId,
          projectName,
          uploadCode,
          mark,
          link,
          fieldTemplate,
        );
      };

      // One-path: connect without an extra confirm (switch-project confirm stays in runJoin).
      await runJoin();
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
    const parsed = parseProjectJoinLink(joinCodeText);
    if (!parsed) {
      Alert.alert('참여', '사업코드와 참여코드를 확인하세요.');
      return;
    }
    void confirmJoin(parsed.projectId, parsed.uploadCode, {
      templateId: parsed.templateId,
      inviteId: parsed.inviteId,
    });
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
    if (joinScanLocked || !joinScanCameraReady) return;
    const raw = String(result?.data || '').trim();
    if (!raw) return;
    setJoinScanLocked(true);
    closeJoinScan();
    const parsed = parseProjectJoinLink(raw);
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
    void confirmJoin(parsed.projectId, parsed.uploadCode, {
      templateId: parsed.templateId,
      inviteId: parsed.inviteId,
    });
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
      const all = await listStamps();
      const localImp = await listImportedStampsForProject(
        all,
        project.projectId,
        project.name,
        folderMode,
      );
      setInbox(mergeInboxWithLocal(man.stamps || [], localImp));
      setSelected(new Set());
      setBarPick(null);
      setPhase('inbox');
    } catch (e) {
      Alert.alert('수신', mapProjectApiError(e));
    } finally {
      setBusy(false);
    }
  };

  const handleImportSelected = async () => {
    setBarPick('phone');
    if (!active) return;
    const pinLocal = (await getCollectorPin(active.projectId)) || collectorPinInput;
    if (!pinLocal) {
      Alert.alert('내 폰으로', '취합 PIN이 필요합니다.');
      return;
    }
    const ids = [...selected];
    if (ids.length === 0) {
      Alert.alert('내 폰으로', '사진을 선택한 뒤 다시 눌러 주세요.');
      return;
    }
    setBusy(true);
    setImportProgress({ current: 0, total: ids.length, title: '' });
    let ok = 0;
    let skipped = 0;
    let step = 0;
    try {
      await setProjectImportFolderMode(folderMode);
      await setProjectDeleteAfterImport(deleteAfter);
      const byId = new Map(inbox.map((r) => [r.stampId, r]));
      for (const stampId of ids) {
        step += 1;
        const row = byId.get(stampId);
        setImportProgress({
          current: step,
          total: ids.length,
          title: (row?.title || stampId).slice(0, 40),
        });
        if (!row?.onServer) {
          skipped += 1;
          continue;
        }
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
      setImportProgress(null);
      setBusy(false);
    }
  };


  const runExcelExportWithWidth = async (
    stamps: Stamp[],
    fileBase: string,
    widthPx: number,
    fontSize: InboxExcelFontSize,
  ) => {
    const safeWidth = await setInboxExcelPreviewWidth(widthPx);
    const safeFont = await setInboxExcelFontSize(fontSize);
    const { createStampsXlsx, shareStampsXlsx } = await loadStampXlsxExport();
    const useFill = stamps.length >= XLSX_ROW_FILL_MIN;
    if (useFill) setXlsxFill({ current: 0, total: stamps.length });
    try {
      const result = await createStampsXlsx(stamps, fileBase, {
        previewWidthPx: safeWidth,
        fontSizePt: inboxExcelFontSizeToPt(safeFont),
        onRowFill: useFill
          ? (done, total) => {
              setXlsxFill({ current: done, total });
            }
          : undefined,
      });
      await shareStampsXlsx(result);
    } finally {
      setXlsxFill(null);
    }
  };

  const openExcelPreviewWidthPrompt = async (stamps: Stamp[], fileBase: string) => {
    const [lastWidth, lastFont] = await Promise.all([
      getInboxExcelPreviewWidth(),
      getInboxExcelFontSize(),
    ]);
    setExcelPxText(String(lastWidth));
    setExcelFontSize(lastFont);
    setExcelPxPending({ stamps, fileBase });
    setExcelPxVisible(true);
  };

  const confirmExcelPreviewWidth = () => {
    const pending = excelPxPending;
    if (!pending) {
      setExcelPxVisible(false);
      return;
    }
    const widthPx = sanitizeInboxExcelPreviewWidth(excelPxText);
    const fontSize = sanitizeInboxExcelFontSize(excelFontSize);
    setExcelPxVisible(false);
    setExcelPxPending(null);
    setBusy(true);
    if (pending.stamps.length >= XLSX_ROW_FILL_MIN) {
      setXlsxFill({ current: 0, total: pending.stamps.length });
    }
    void (async () => {
      try {
        await runExcelExportWithWidth(pending.stamps, pending.fileBase, widthPx, fontSize);
      } catch (e) {
        Alert.alert('엑셀', e instanceof Error ? e.message : '실패');
      } finally {
        setBusy(false);
      }
    })();
  };

  const handleInboxExcelSelected = async () => {
    setBarPick('xlsx');
    if (!active) return;
    const ids = [...selected];
    if (ids.length === 0) {
      Alert.alert('엑셀', '사진을 선택한 뒤 다시 눌러 주세요.');
      return;
    }
    const localIds = ids.filter((id) => inbox.some((r) => r.stampId === id && r.localImagePath));
    if (localIds.length === 0) {
      Alert.alert(
        '엑셀',
        '선택한 항목 중 내 폰으로 가져온 사진이 없습니다. 먼저 「내 폰으로」를 눌러 주세요.',
      );
      return;
    }
    try {
      const all = await listStamps();
      const want = new Set(localIds);
      const stamps = all.filter((st) => want.has(st.id) && !st.deletedAt);
      if (stamps.length === 0) {
        Alert.alert('엑셀', '선택한 항목 중 내 폰으로 가져온 사진이 없습니다.');
        return;
      }
      const base = sanitizeLoose(active.name) + '_선택_' + formatYmd(Date.now());
      await openExcelPreviewWidthPrompt(stamps, base);
    } catch (e) {
      Alert.alert('엑셀', e instanceof Error ? e.message : '실패');
    }
  };

  const handleReconnectJoin = (item: JoinedProjectHistory) => {
    const apply = () => {
      void (async () => {
        setBusy(true);
        try {
          await setProjectCollectEnabled(true);
          await setProjectJoin({
            projectId: item.projectId,
            name: item.name,
            uploadCode: item.uploadCode,
            mark: item.mark,
          });
          if (item.mark) setJoinMarkText(item.mark);
          await reload();
          Alert.alert('연결되었습니다', item.name + '에 다시 연결했습니다. 이후 저장분이 올라갑니다.');
        } catch (e) {
          Alert.alert('다시 연결', e instanceof Error ? e.message : '실패');
        } finally {
          setBusy(false);
        }
      })();
    };
    if (join && join.projectId !== item.projectId) {
      Alert.alert(
        '사업 연결',
        '지금 ' + join.name + '에 연결되어 있습니다. ' + item.name + '로 바꿀까요?',
        [
          { text: '유지', style: 'cancel' },
          { text: '바꾸기', onPress: apply },
        ],
      );
      return;
    }
    apply();
  };

  const handleRemoveJoinHistory = (item: JoinedProjectHistory) => {
    Alert.alert(
      '이력에서 제거',
      item.name + '을(를) 참여 목록에서 뺄까요? (서버 사업은 지우지 않습니다)',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '제거',
          style: 'destructive',
          onPress: () => {
            void removeJoinedProjectHistory(item.projectId).then(reload);
          },
        },
      ],
    );
  };

  const handleCloseOwnedProject = (project: OwnedProject) => {
    if (project.closedAt) {
      Alert.alert('사업 종료', '이미 종료된 사업입니다.');
      return;
    }
    Alert.alert('사업 종료', '종료하면 더 이상 올릴 수 없습니다. 보관 만료일까지 목록에 「종료됨」으로 남습니다.', [
      { text: '취소', style: 'cancel' },
      {
        text: '종료',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setBusy(true);
            try {
              const p = (await getCollectorPin(project.projectId)) || '';
              try {
                if (p) await apiCloseProject({ projectId: project.projectId, collectorPin: p });
              } catch {
                // still mark local closed
              }
              await markOwnedProjectClosed(project.projectId);
              if (active?.projectId === project.projectId) {
                setActive(null);
                setPhase('hub');
              }
              await reload();
            } catch (e) {
              Alert.alert('사업 종료', e instanceof Error ? e.message : '실패');
            } finally {
              setBusy(false);
            }
          })();
        },
      },
    ]);
  };

  const sanitizeLoose = (n: string) => n.trim().replace(/[\\/:*?"<>|]/g, '_').slice(0, 40);
  const formatYmd = (t: number) => {
    const d = new Date(t);
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  };

  const renderHub = () => (
    <ScrollView contentContainerStyle={styles.body}>
      <Pressable style={collectPressStyle(styles.row)} onPress={() => setPhase('create')}>
        <Text style={styles.rowTitle}>사업 만들기</Text>
        <Text style={styles.rowSub}>기존 사업은 유지 · 새 사업을 추가합니다 (최대 20)</Text>
      </Pressable>
      <Pressable style={collectPressStyle(styles.row)} onPress={() => setPhase('join')}>
        <Text style={styles.rowTitle}>코드로 참여</Text>
        <Text style={styles.rowSub}>촬영자 · 이력에서 다시 연결 가능</Text>
      </Pressable>
      {join ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            참여 중 · {join.name}
            {join.mark ? ' · ' + join.mark : ''}
          </Text>
          <Pressable
            style={collectPressStyle()}
            onPress={() => {
              Alert.alert(
                '사업 연결을 끊을까요?',
                '이후 저장분은 더 이상 올라가지 않습니다. 참여 목록에는 남습니다.',
                [
                  { text: '취소', style: 'cancel' },
                  {
                    text: '끊기',
                    style: 'destructive',
                    onPress: () => void clearProjectJoin().then(reload),
                  },
                ],
              );
            }}
          >
            <Text style={styles.linkDanger}>연결 끊기</Text>
          </Pressable>
        </View>
      ) : null}
      <Text style={styles.label}>참여한 사업 {joinHistory.length ? '(' + joinHistory.length + ')' : ''}</Text>
      {joinHistory.length === 0 ? (
        <View style={styles.row}>
          <Text style={styles.rowSub}>참여한 사업이 없습니다</Text>
        </View>
      ) : (
        joinHistory.map((item) => {
          const active = join?.projectId === item.projectId;
          return (
            <View key={item.projectId} style={styles.row}>
              <Text style={styles.rowTitle}>{item.name}</Text>
              <Text style={styles.rowSub}>
                {[
                  active ? '연결됨' : '',
                  item.mark || '',
                  item.joinedAt ? new Date(item.joinedAt).toLocaleDateString() : '',
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
              <View style={styles.ownedActions}>
                <Pressable
                  style={collectPressStyle(styles.ownedAction)}
                  onPress={() => {
                    setSentFocus(item);
                    setPhase('sent');
                  }}
                >
                  <Text style={styles.ownedActionText}>보낸 사진</Text>
                </Pressable>
                {!active ? (
                  <Pressable
                    style={collectPressStyle(styles.ownedAction)}
                    onPress={() => handleReconnectJoin(item)}
                    disabled={busy}
                  >
                    <Text style={styles.ownedActionText}>다시 연결</Text>
                  </Pressable>
                ) : null}
                <Pressable
                  style={collectPressStyle(styles.ownedAction)}
                  onPress={() => handleRemoveJoinHistory(item)}
                  disabled={busy}
                >
                  <Text style={styles.ownedActionText}>목록에서 빼기</Text>
                </Pressable>
              </View>
            </View>
          );
        })
      )}
      <Text style={styles.label}>만든 사업 {owned.length ? '(' + owned.length + ')' : ''}</Text>
      {owned.length === 0 ? (
        <View style={styles.row}>
          <Text style={styles.rowSub}>만든 사업이 없습니다</Text>
        </View>
      ) : (
        owned.map((project) => {
          const left = Math.max(0, Math.ceil((project.expiresAt - Date.now()) / 86400000));
          const closed = !!project.closedAt;
          return (
            <View key={project.projectId} style={styles.row}>
              <Text style={styles.rowTitle}>{project.name}</Text>
              <Text style={styles.rowSub}>
                {[
                  project.creatorLabel?.trim() || '',
                  closed ? '종료됨' : '',
                  'D-' + left,
                  project.projectId,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
              <View style={styles.ownedActions}>
                {!closed ? (
                  <Pressable
                    style={collectPressStyle(styles.ownedAction)}
                    onPress={() => openInviteForProject(project)}
                  >
                    <Text style={styles.ownedActionText}>초대</Text>
                  </Pressable>
                ) : null}
                <Pressable
                  style={collectPressStyle(styles.ownedAction)}
                  onPress={() => void openInbox(project)}
                  disabled={busy}
                >
                  <Text style={styles.ownedActionText}>수신</Text>
                </Pressable>
                {!closed ? (
                  <Pressable
                    style={collectPressStyle(styles.ownedAction)}
                    onPress={() => handleCloseOwnedProject(project)}
                    disabled={busy}
                  >
                    <Text style={[styles.ownedActionText, styles.linkDanger]}>종료</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          );
        })
      )}
      <Text style={styles.hint}>일시 보관 후 삭제됩니다. 영구 저장소가 아닙니다.</Text>
    </ScrollView>
  );

  const renderCreate = () => (
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>사업 이름</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="예: 2026 여름 점검" maxLength={40} />
      <Text style={styles.label}>만든 회사/사람</Text>
      <TextInput
        style={styles.input}
        value={creatorLabel}
        onChangeText={setCreatorLabel}
        placeholder="예: OO건설 · 홍길동"
        maxLength={40}
        accessibilityLabel="만든 회사 또는 사람"
      />
      <Text style={styles.hint}>이 기기에만 남습니다. 초대 QR·서버에는 올라가지 않습니다.</Text>
      <Text style={styles.label}>보관 기간</Text>
      <View style={styles.chips}>
        {[3, 7, 14, 30].map((d) => (
          <Pressable
            key={d}
            style={collectPressStyle(styles.chip, ttlDays === d && styles.chipOn)}
            onPress={() => setTtlDays(d)}
          >
            <Text style={[styles.chipText, ttlDays === d && styles.chipTextOn]}>{d}일</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.label}>취합 PIN (6자리)</Text>
      <TextInput style={styles.input} value={pin} onChangeText={setPin} keyboardType="number-pad" secureTextEntry maxLength={6} />
      <Text style={styles.label}>취합 PIN 확인</Text>
      <TextInput style={styles.input} value={pin2} onChangeText={setPin2} keyboardType="number-pad" secureTextEntry maxLength={6} />
      <Text style={styles.hint}>PIN은 수신·삭제에만 씁니다. QR에는 들어가지 않습니다. 새 사업은 숫자 6자리입니다.</Text>
      <Pressable style={collectPressStyle(styles.primary)} onPress={() => void handleCreate()} disabled={busy}>
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
        {active.creatorLabel?.trim() ? (
          <Text style={styles.hint}>만든이 · {active.creatorLabel.trim()}</Text>
        ) : null}
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
        <Text style={styles.label}>저장 템플릿 (선택)</Text>
        <Text style={styles.hint}>
          지정하면 링크를 받은 사람이 참여·촬영할 때 칸 이름·저장 유형이 맞춰집니다. 공유·QR을 다시
          받으세요.
        </Text>
        <Pressable style={collectPressStyle(styles.secondary)} onPress={openTemplatePicker} disabled={busy}>
          <Text style={styles.secondaryText}>
            {inviteTemplateName ? `템플릿: ${inviteTemplateName}` : '템플릿 고르기'}
          </Text>
        </Pressable>
        {inviteTemplateName ? (
          <Pressable style={collectPressStyle(styles.secondary)} onPress={clearInviteTemplate} disabled={busy}>
            <Text style={styles.secondaryText}>템플릿 빼기</Text>
          </Pressable>
        ) : null}
        <Text style={styles.hint}>이 QR은 올리기 전용입니다. PIN을 함께 보내지 마세요.</Text>
        <Pressable
          style={collectPressStyle(styles.secondary)}
          onPress={() =>
            void Share.share({
              message: `VoiceStamp 사업 참여: ${active.name}\n${buildProjectJoinHttpsUrl(
                active.projectId,
                active.uploadCode,
                {
                  templateId:
                    inviteTemplateSourceId && isBuiltinStampFieldTemplateId(inviteTemplateSourceId)
                      ? inviteTemplateSourceId
                      : null,
                  inviteId,
                },
              )}`,
            })
          }
        >
          <Text style={styles.secondaryText}>공유</Text>
        </Pressable>
        <Pressable
          style={collectPressStyle(styles.secondary)}
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
        <Pressable style={collectPressStyle(styles.primary)} onPress={() => void openInbox(active)}>
          <Text style={styles.primaryText}>수신 목록</Text>
        </Pressable>
        <Text style={styles.hint}>사업을 끝내려면 허브 목록의 「종료」를 사용하세요.</Text>
      </ScrollView>
    );
  };

  const renderJoin = () => (
    <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
      {openedFromLink ? (
        <View style={styles.linkBanner}>
          <Text style={styles.linkBannerTitle}>공유 링크로 열림</Text>
          <Text style={styles.linkBannerText}>
            {linkInviteHint
              ? `「${linkInviteHint}」 참여 코드가 채워져 있습니다. 구분 표시만 입력한 뒤 연결하면 촬영 화면으로 갑니다.`
              : '참여 코드가 채워져 있습니다. 구분 표시만 입력한 뒤 연결하면 촬영 화면으로 갑니다.'}
          </Text>
        </View>
      ) : null}
      <Text style={styles.hint}>
        연결되면 촬영 화면으로 갑니다. 안 되면 「QR 찍기」또는 코드를 붙여 넣으세요.
      </Text>
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
      {openedFromLink ? (
        <Text style={styles.hint}>공유 링크에서 자동으로 채워졌습니다. 필요하면 수정할 수 있습니다.</Text>
      ) : (
        <Text style={styles.hint}>형식: VS-… 코드 / 참여코드 또는 QR·웹 참여 링크</Text>
      )}
      <TextInput
        style={[styles.input, styles.inputMulti]}
        value={joinCodeText}
        onChangeText={setJoinCodeText}
        placeholder="https://voicestamp-gilt.vercel.app/join?p=…&c=…"
        autoCapitalize="characters"
        multiline
        editable={!openedFromLink}
      />
      {openedFromLink ? null : (
        <Pressable style={collectPressStyle(styles.secondary)} onPress={handleJoinScanPress} disabled={busy}>
          <Text style={styles.secondaryText}>QR 찍기</Text>
        </Pressable>
      )}
      <Pressable style={collectPressStyle(styles.primary)} onPress={handleJoinSubmit} disabled={busy}>
        <Text style={styles.primaryText}>{openedFromLink ? '연결 후 촬영' : '연결'}</Text>
      </Pressable>
    </ScrollView>
  );

  const handleTrashSelected = () => {
    setBarPick('bin');
    if (selected.size === 0) {
      Alert.alert('휴지통', '사진을 선택한 뒤 다시 눌러 주세요.');
      return;
    }
    const ids = [...selected].filter((id) => inbox.some((r) => r.stampId === id && r.localImagePath));
    if (ids.length === 0) {
      Alert.alert('휴지통', '내 폰에 가져온 항목만 휴지통으로 옮길 수 있습니다.');
      return;
    }
    Alert.alert('휴지통으로 이동', `선택한 ${ids.length}장을 휴지통으로 옮깁니다.`, [
      { text: '취소', style: 'cancel' },
      {
        text: '이동',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            if (!active) return;
            setBusy(true);
            try {
              await moveStampsToTrash(ids);
              onImported?.();
              await openInbox(active);
            } catch (e) {
              Alert.alert('삭제', e instanceof Error ? e.message : '실패');
            } finally {
              setBusy(false);
            }
          })();
        },
      },
    ]);
  };

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
            style={collectPressStyle(styles.chip, folderMode === 'date_name' && styles.chipOn)}
            onPress={() => {
              setFolderMode('date_name');
              if (active) void openInbox(active);
            }}
          >
            <Text style={[styles.chipText, folderMode === 'date_name' && styles.chipTextOn]}>날짜_사업명</Text>
          </Pressable>
          <Pressable
            style={collectPressStyle(styles.chip, folderMode === 'name_only' && styles.chipOn)}
            onPress={() => {
              setFolderMode('name_only');
              if (active) void openInbox(active);
            }}
          >
            <Text style={[styles.chipText, folderMode === 'name_only' && styles.chipTextOn]}>사업명만</Text>
          </Pressable>
        </View>
        <Text style={styles.hint}>미리보기: {folderPreview}</Text>
        <Pressable
          style={collectPressStyle(styles.secondary)}
          onPress={() => {
            void setProjectDeleteAfterImport(!deleteAfter).then(() => setDeleteAfter(!deleteAfter));
          }}
        >
          <Text style={styles.secondaryText}>
            가져온 뒤 일시 저장소에서 삭제: {deleteAfter ? 'ON' : 'OFF'}
          </Text>
        </Pressable>
        <Text style={styles.hint}>
          서버에 남은 사진과 내 폰으로 가져온 사진을 함께 봅니다. 썸네일을 누르면 크게 볼 수 있습니다.
        </Text>
      </View>
      <FlatList
        data={inbox}
        extraData={`${selected.size}:${[...selected].join(',')}:${barPick || ''}`}
        keyExtractor={(item) => item.stampId}
        contentContainerStyle={styles.inboxListPad}
        ListEmptyComponent={<Text style={styles.hintPad}>아직 올라온 사진이 없습니다.</Text>}
        renderItem={({ item }) => {
          const on = selected.has(item.stampId);
          const got = !!item.localImagePath;
          return (
            <Pressable
              style={collectPressStyle(styles.inboxRow, on && styles.inboxRowOn)}
              onPress={() => {
                setSelected((prev) => {
                  const next = new Set(prev);
                  if (next.has(item.stampId)) next.delete(item.stampId);
                  else next.add(item.stampId);
                  return next;
                });
              }}
            >
              <View style={[styles.pickBox, on && styles.pickBoxOn]}>
                {on ? <Text style={styles.pickGlyph}>✓</Text> : null}
              </View>
              {got ? (
                <Pressable
                  onPress={() => setPreviewUri(resolveImageUri(item.localImagePath!))}
                  hitSlop={4}
                >
                  <StampListThumb
                    id={item.stampId}
                    imagePath={item.localImagePath!}
                    style={styles.inboxThumb}
                  />
                </Pressable>
              ) : (
                <View style={styles.inboxThumbPlaceholder}>
                  <Text style={styles.inboxThumbPlaceholderText}>대기</Text>
                </View>
              )}
              <View style={styles.inboxMeta}>
                <View style={styles.inboxTitleRow}>
                  <Text style={[styles.rowTitle, styles.inboxTitleFlex]} numberOfLines={2}>
                    {item.title || item.stampId}
                  </Text>
                  {got ? <Text style={styles.importedBadge}>가져옴</Text> : null}
                </View>
                <Text style={styles.rowSub}>
                  {[
                    item.uploadedByMark || '',
                    item.uploadedAt ? new Date(item.uploadedAt).toLocaleString() : '',
                    !item.onServer && got ? '폰에만 있음' : '',
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />
      <View style={styles.bar}>
        <Pressable
          style={collectPressStyle(styles.barBtn, barPick === 'all' && styles.barBtnOn)}
          onPress={() => {
            setBarPick('all');
            const ids = inbox.map((r) => r.stampId);
            const allOn = ids.length > 0 && ids.every((id) => selected.has(id));
            setSelected(allOn ? new Set() : new Set(ids));
          }}
        >
          <Text style={[styles.barBtnText, barPick === 'all' && styles.barBtnTextOn]}>전체</Text>
        </Pressable>
        <Pressable
          style={collectPressStyle(styles.barBtn, barPick === 'phone' && styles.barBtnOn)}
          onPress={() => void handleImportSelected()}
          disabled={busy}
        >
          <Text style={[styles.barBtnText, barPick === 'phone' && styles.barBtnTextOn]}>내 폰으로</Text>
        </Pressable>
        <Pressable
          style={collectPressStyle(styles.barBtn, barPick === 'xlsx' && styles.barBtnOn)}
          onPress={() => void handleInboxExcelSelected()}
          disabled={busy}
        >
          <Text style={[styles.barBtnText, barPick === 'xlsx' && styles.barBtnTextOn]}>엑셀</Text>
        </Pressable>
        <Pressable
          style={collectPressStyle(styles.barBtn, barPick === 'bin' && styles.barBtnOn)}
          onPress={handleTrashSelected}
          disabled={busy}
        >
          <Text
            style={[
              styles.barBtnText,
              styles.barBtnDanger,
              barPick === 'bin' && styles.barBtnTextOn,
            ]}
          >
            휴지통
          </Text>
        </Pressable>
      </View>
      <Modal
        visible={!!previewUri}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewUri(null)}
      >
        <Pressable style={styles.previewBg} onPress={() => setPreviewUri(null)}>
          {previewUri ? (
            <Image source={{ uri: previewUri }} style={styles.previewImg} resizeMode="contain" />
          ) : null}
          <Text style={styles.previewHint}>탭하면 닫힙니다</Text>
        </Pressable>
      </Modal>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          style={collectPressStyle(styles.backBtn)}
          onPress={handleHeaderBack}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="뒤로"
        >
          <Text style={styles.backText}>‹ 뒤로</Text>
        </Pressable>
        <Text style={styles.headerTitle}>
          {phase === 'sent' && sentFocus ? `보낸 사진 · ${sentFocus.name}` : '사업 취합'}
        </Text>
      </View>
      {phase === 'hub' && renderHub()}
      {phase === 'create' && renderCreate()}
      {phase === 'qr' && renderQr()}
      {phase === 'join' && renderJoin()}
      {phase === 'inbox' && renderInbox()}
      {phase === 'sent' && sentFocus ? (
        <ProjectSentList project={sentFocus} onChanged={onImported} />
      ) : null}
      {busy ? (
        <View style={styles.overlay} pointerEvents="none">
          {importProgress ? (
            <View style={styles.importProgressBox}>
              <Text style={styles.importProgressText}>
                {`앱으로 가져오는 중 ${importProgress.current} / ${importProgress.total}`}
              </Text>
              {importProgress.title ? (
                <Text style={styles.importProgressTitle} numberOfLines={1}>
                  {importProgress.title}
                </Text>
              ) : null}
            </View>
          ) : null}
          {xlsxFill && xlsxFill.total >= XLSX_ROW_FILL_MIN ? (
            <View style={styles.importProgressBox}>
              <Text style={styles.importProgressText}>
                {`엑셀 만드는 중 ${xlsxFill.current} / ${xlsxFill.total}`}
              </Text>
              <View style={styles.xlsxFillTrack}>
                <View
                  style={[
                    styles.xlsxFillInner,
                    {
                      width: Math.max(
                        0,
                        Math.min(
                          220,
                          Math.round((xlsxFill.current / xlsxFill.total) * 220),
                        ),
                      ),
                    },
                  ]}
                />
              </View>
            </View>
          ) : (
            <ActivityIndicator size="large" color="#111" />
          )}
        </View>
      ) : null}
      <Modal
        visible={joinScanning}
        animationType="fade"
        presentationStyle="fullScreen"
        onRequestClose={() => {
          setJoinScanLocked(false);
          closeJoinScan();
        }}
      >
        <View style={styles.scanModalRoot}>
          {(() => {
            const win = Dimensions.get('window');
            return (
              <View
                style={[styles.scanCameraSlot, { width: win.width, height: win.height }]}
                collapsable={false}
              >
                {joinScanCameraMounted ? (
                  <CameraView
                    key="join-qr-scan-modal"
                    style={{ width: win.width, height: win.height }}
                    facing="back"
                    barcodeScannerSettings={
                      joinScanCameraReady ? { barcodeTypes: ['qr'] } : undefined
                    }
                    onBarcodeScanned={
                      joinScanCameraReady && !joinScanLocked
                        ? onJoinBarcodeScanned
                        : undefined
                    }
                    onCameraReady={() => setJoinScanCameraReady(true)}
                  />
                ) : (
                  <View
                    style={[
                      styles.scanCameraPlaceholder,
                      { width: win.width, height: win.height },
                    ]}
                  />
                )}
              </View>
            );
          })()}
          <View style={styles.scanUi} pointerEvents="box-none">
            <View style={styles.scanFrameWrap} pointerEvents="none">
              <View style={styles.scanFrame} />
            </View>
            <View style={styles.scanBottom}>
              <Text style={styles.scanHint}>가운데 네모 안에 관리자 QR이 들어오게 맞춰 주세요</Text>
              <Pressable
                style={collectPressStyle(styles.secondary)}
                onPress={() => {
                  setJoinScanLocked(false);
                  closeJoinScan();
                }}
              >
                <Text style={styles.secondaryText}>닫기</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={templatePickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTemplatePickerVisible(false)}
      >
        <View style={styles.templatePickerBg}>
          <View style={styles.templatePickerSheet}>
            <Text style={styles.label}>초대 저장 템플릿</Text>
            <Text style={styles.hint}>받는 사람 촬영 칸에 적용됩니다.</Text>
            <FlatList
              data={templatePickerOptions}
              keyExtractor={(item) => item.id}
              style={styles.templatePickerList}
              renderItem={({ item }) => (
                <Pressable
                  style={collectPressStyle(styles.templatePickerRow)}
                  onPress={() => void handlePickInviteTemplate(item)}
                >
                  <Text style={styles.templatePickerName}>{item.name}</Text>
                  <Text style={styles.hint}>{item.custom ? '내 템플릿' : '기본'}</Text>
                </Pressable>
              )}
            />
            <Pressable style={collectPressStyle(styles.secondary)} onPress={() => setTemplatePickerVisible(false)}>
              <Text style={styles.secondaryText}>닫기</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Modal
        visible={excelPxVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setExcelPxVisible(false);
          setExcelPxPending(null);
        }}
      >
        <View style={styles.excelPxBg}>
          <View style={styles.excelPxCard}>
            <Text style={styles.label}>엑셀 사진 가로 크기 (px)</Text>
            <Text style={styles.hint}>
              {MIN_INBOX_EXCEL_PREVIEW_WIDTH}–{MAX_INBOX_EXCEL_PREVIEW_WIDTH} · 기본{' '}
              {DEFAULT_INBOX_EXCEL_PREVIEW_WIDTH} · 세로는 비율 유지
            </Text>
            <TextInput
              style={styles.input}
              value={excelPxText}
              onChangeText={setExcelPxText}
              keyboardType="number-pad"
              maxLength={3}
              placeholder={String(DEFAULT_INBOX_EXCEL_PREVIEW_WIDTH)}
            />
            <View style={styles.excelPxChips}>
              {[180, 240, 320, 480, 800].map((n) => (
                <Pressable
                  key={n}
                  style={collectPressStyle(styles.chip, excelPxText === String(n) && styles.chipOn)}
                  onPress={() => setExcelPxText(String(n))}
                >
                  <Text style={[styles.chipText, excelPxText === String(n) && styles.chipTextOn]}>
                    {n}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.label}>글자 크기</Text>
            <Text style={styles.hint}>작음 10 · 보통 11 · 큼 14 (전체 시트, 머리글은 굵게)</Text>
            <View style={styles.excelPxChips}>
              {(
                [
                  { id: 'small' as const, label: '작음' },
                  { id: 'normal' as const, label: '보통' },
                  { id: 'large' as const, label: '큼' },
                ] as const
              ).map((opt) => (
                <Pressable
                  key={opt.id}
                  style={collectPressStyle(styles.chip, excelFontSize === opt.id && styles.chipOn)}
                  onPress={() => setExcelFontSize(opt.id)}
                >
                  <Text style={[styles.chipText, excelFontSize === opt.id && styles.chipTextOn]}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Pressable style={collectPressStyle(styles.primary)} onPress={confirmExcelPreviewWidth} disabled={busy}>
              <Text style={styles.primaryText}>엑셀 만들기</Text>
            </Pressable>
            <Pressable
              style={collectPressStyle(styles.secondary)}
              onPress={() => {
                setExcelPxVisible(false);
                setExcelPxPending(null);
              }}
            >
              <Text style={styles.secondaryText}>취소</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  flex: { flex: 1 },
  header: {
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 4,
  },
  backBtn: {
    alignSelf: 'flex-start',
    minHeight: 48,
    minWidth: 96,
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    marginLeft: -4,
  },
  backText: { fontSize: 20, fontWeight: '700', color: '#2563eb' },
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
  pressed: { opacity: 0.72 },
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
  linkBanner: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  linkBannerTitle: { color: '#1e3a8a', fontWeight: '700', fontSize: 15 },
  linkBannerText: { color: '#1e40af', fontSize: 13, lineHeight: 19 },
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
  inboxListPad: { paddingHorizontal: 12, paddingBottom: 8 },
  inboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 8,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  inboxThumb: { width: 64, height: 64, borderRadius: 8 },
  inboxThumbPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inboxThumbPlaceholderText: { fontSize: 11, color: '#6b7280', fontWeight: '700' },
  inboxMeta: { flex: 1, gap: 4 },
  barBtnDanger: { color: '#b91c1c' },
  previewBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  previewImg: { width: '100%', height: '80%' },
  previewHint: { color: '#fff', marginTop: 12, fontWeight: '600' },
  inboxRowOn: { backgroundColor: '#eff6ff', borderColor: '#1e40af' },
  pickBox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#9ca3af',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickBoxOn: { borderColor: '#1e40af', backgroundColor: '#1e40af' },
  pickGlyph: { color: '#fff', fontSize: 13, fontWeight: '700' },
  barBtnOn: { backgroundColor: '#111' },
  barBtnTextOn: { color: '#fff' },
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
    gap: 12,
    // Keep spinner + progress above Android system navigation.
    paddingBottom: Platform.OS === 'android' ? 72 : 24,
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  importProgressBox: {
    maxWidth: '84%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    gap: 4,
  },
  importProgressText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
    textAlign: 'center',
  },
  importProgressTitle: {
    fontSize: 13,
    color: '#4b5563',
    textAlign: 'center',
  },
  xlsxFillTrack: {
    marginTop: 8,
    width: 220,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
  },
  xlsxFillInner: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#111',
  },
  scanModalRoot: {
    flex: 1,
    backgroundColor: '#000',
  },
  scanCameraSlot: {
    backgroundColor: '#000',
  },
  scanCameraPlaceholder: {
    backgroundColor: '#111',
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
    borderColor: 'rgba(255, 255, 255, 0.92)',
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
  templatePickerBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  excelPxBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  excelPxCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  excelPxChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  templatePickerSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: Platform.OS === 'android' ? 36 : 28,
    maxHeight: '70%',
    gap: 8,
  },
  templatePickerList: { maxHeight: 360 },
  templatePickerRow: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  templatePickerName: { fontSize: 16, fontWeight: '600', color: '#111' },
});
