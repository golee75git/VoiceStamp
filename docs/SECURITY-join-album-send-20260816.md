# SECURITY — 참여 사업 갤러리·목록 보내기 (2026-08-16)

## 변경 요약
- 사업 취합 허브 **참여한 사업** 행에 **갤러리 보내기**: 앨범 여러 장(최대 20)을 한 장씩 저장한 뒤 그 사업으로 올린다.
- 저장 목록 선택 모드 **사업으로 보내기**: 참여 이력에서 사업을 고른 뒤 기존 스탬프를 올린다. 자동 올리기가 꺼져 있어도 이 단추는 올린다.
- 웹은 안내만. 신규 npm·권한·네트워크 엔드포인트 없음. 기존 참여 코드·업로드 큐를 재사용한다.

## 파일 구분

| 구분 | 경로 |
|------|------|
| **신규** | `src/services/joinStampSend.ts`, `restore-join-album-send.bat`, 본 문서 |
| **수정** | `pickStampImage.ts`, `projectUploadQueue.ts`, `ProjectCollectScreen.tsx`, `StampListScreen.tsx`, `public/help.html`, `RESTORE.md`, `docs/README.md` |
| **재사용** | `saveStamp`, `setProjectJoin`, `enqueueProjectUpload`, `setUploadStatus`, `listJoinedProjectHistory`, `readGpsFromExif`, `findNearestSchool`, `buildJoinAwareDefaultTitle` |
| **스냅샷** | `src.pre-join-album-send/`, `public.pre-join-album-send/` |

## 글꼴·의존성·GPL
- 폰트 파일·웹폰트 **추가 없음**. 기존 OFL 자산 변경 없음.
- npm 추가 없음. exceljs 등 기존 lazy `import()` 유지.
- GPL 경로 신규 채택 없음. [LICENSE-NOTICE.md](./LICENSE-NOTICE.md)

## 취약점·보안·Play

| 항목 | 결과 |
|------|------|
| 데이터 | 올리는 대상은 이 기기가 이미 참여한 사업만. 참여 코드는 기존 로컬 이력. 수집 PIN은 쓰지 않음 |
| 권한 | 추가 없음. 앨범은 기존 `expo-image-picker` 권한 |
| 네트워크 | 기존 `prepareUpload` / Put / `completeUpload`만. 새 액션 없음 |
| 큐 | 다른 사업으로 바꿀 때 업로드 큐가 비어 있지 않으면 거절해, 다른 사업으로 잘못 올라가는 것을 막음 |
| 용량 | 갤러리는 최대 20장·한 장씩 저장. 목록은 기존 순차 업로드 큐 |
| Data safety | 신규 수집 항목 없음. 사용자가 고른 사진을 기존 취합 저장소로 보냄 |
| Play | 스토어 권한 선언 변경 없음. 웹에서는 올리지 않음 |

## 특허
- 특허 비침해를 보장하지 않음.
- GitHub 코드 검색: `connectJoinForSend`·`queueStampsToCurrentJoin`·`savePickedAlbumStamp`·`ALBUM_SEND_PICK_MAX`는 이 프로젝트 식별자.
- 앨범에서 고른 사진을 기존 업로드 큐에 넣는 구성은 일반 관용일 수 있음. 별도 청구항 대조가 필요하면 법무에서 검토.

## 롤백
`restore-join-album-send.bat`

## 배포
- APK: `VoiceStamp_20260816_164812.apk` (`0601b0a`)
- 다운로드: https://github.com/golee75git/VoiceStamp/raw/main/releases/VoiceStamp_20260816_164812.apk
