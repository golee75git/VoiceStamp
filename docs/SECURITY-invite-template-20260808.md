# 보안·라이선스·특허 점검 — 초대 저장 템플릿 (2026-08-08)

## 변경 요약
- 초대(QR·공유)에 저장 템플릿을 지정 가능(기본·커스텀).
- 서버 `setInviteTemplate`로 스냅샷 저장, 링크 `i=`(+내장 `t=`)로 전달.
- 참여 시 칸 이름·유형 적용, 연결 해제 시 이전 표시명 복구.
- 업로드·가져오기에 `templateId` 유지. npm 추가 없음.

## 파일 구분

| 구분 | 경로 |
|------|------|
| **신규** | `projectInviteTemplate.ts`, `restore-invite-template.bat`, 본 문서 |
| **수정** | `projectJoinLink.ts`, `projectCollectSettings.ts`, `projectCollectApi.ts`, `projectUploadQueue.ts`, `projectImportService.ts`, `stampFieldTemplates.ts`, `ProjectCollectScreen.tsx`, `api/project.js`, `public/help.html`, `RESTORE.md` |
| **재사용** | `applyStampFieldTemplate`, joinMark·OwnedProject 패턴, NCP project 저장 |
| **스냅샷** | `src.pre-invite-template/`, `api.pre-invite-template/`, `public.pre-invite-template/` |

## 글꼴·의존성·GPL
- 추가 글꼴·패키지 없음. 기존 OFL·의존성 유지. GPL 신규 도입 없음.

## 취약점·보안·Play
| 항목 | 결과 |
|------|------|
| 템플릿 스냅샷 | 서버 sanitize(이름·라벨·placeholder 길이). 비밀(PIN·uploadCode) 미포함 |
| setInviteTemplate | collectorPin 필수 |
| lookup | 초대 id가 있을 때만 fieldTemplate 공개(업로드 코드와 무관한 표시명) |
| UI | 초대 템플릿 선택·빼기 명시 |
| Data safety | 신규 개인정보 수집 없음 |

## 특허
- 특허 비침해 보장하지 않음. 원격 폼 스키마를 초대에 실어 수신 앱 UI를 맞추는 구성은 별도 검토 후보.

## 롤백
`restore-invite-template.bat`
