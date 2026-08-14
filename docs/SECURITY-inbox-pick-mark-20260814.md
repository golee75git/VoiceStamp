# SECURITY — 수신함 하단 고름 표시·엑셀 안내 (2026-08-14)

## 변경 요약
- 사업 수신 목록에서 「전체」「내 폰으로」「엑셀」「휴지통」을 누르면 해당 단추가 검게 남고, 고른 행 왼쪽에 표시가 붙는다.
- 사진을 고르지 않고 「엑셀」(같은 흐름의 「내 폰으로」·「휴지통」)을 누르면 기기 알림으로 다시 고르라고 안내한다.
- 목록 다시 그리기(`extraData`)만 보강해, 고른 상태가 화면에 바로 보이게 한다.
- 신규 npm·네트워크 API·권한 없음. 기존 `Alert.alert`·수신 목록 UI만 사용.

## 파일 구분

| 구분 | 경로 |
|------|------|
| **수정** | `src/components/ProjectCollectScreen.tsx`, `public/help.html`, `RESTORE.md`, `docs/README.md` |
| **신규** | `restore-inbox-pick-mark.bat`, 본 문서 |
| **재사용** | `collectPressStyle`, `handleInboxExcelSelected`, `handleImportSelected`, `handleTrashSelected`, `Alert.alert`, `FlatList` |
| **스냅샷** | `src.pre-inbox-pick-mark/`, `public.pre-inbox-pick-mark/` |

## 글꼴·의존성·GPL
- 폰트 파일·웹폰트 **추가 없음**. 시스템 UI 글꼴만 사용.
- 프로젝트에 `.ttf`/`.otf` 번들 없음. 기존 OFL 글꼴 자산 변경 없음.
- npm 패키지 추가 없음. GPL 경로 신규 채택 없음. 기존 dual-license(jszip MIT 선택) 유지. [LICENSE-NOTICE.md](./LICENSE-NOTICE.md)

## 취약점·보안·Play

| 항목 | 결과 |
|------|------|
| 데이터 | 수신 목록 고름 상태는 화면 메모리만. PIN·참여코드·사진 바이트를 새로 보내지 않음 |
| 권한 | 추가 없음 |
| 네트워크 | 추가 엔드포인트 없음 |
| Data safety | 신규 수집 없음. 엑셀 공유는 기존 로컬 스탬프 경로 |
| Play | UI 안내만. 스토어 권한·데이터 안전 변경 없음 |

## 특허
- 특허 비침해를 보장하지 않음.
- GitHub 코드 검색: 안내 문구 「사진을 선택한 뒤 다시 눌러 주세요」·식별자 `barPick`/`pickBoxOn`은 공개 저장소 동일 구현으로 확인되지 않음. 목록 고름 UI는 일반 관용.
- 목록에서 항목을 고르고 단추 상태를 보여 주거나, 비어 있으면 안내하는 구성은 일반 UI 관용일 수 있음. 별도 청구항 대조가 필요하면 법무에서 검토.

## 롤백
`restore-inbox-pick-mark.bat`
