# 보안·라이선스·특허 점검 — 성능 번들 B (2026-08-01)

## 변경 요약
- Kakao 근처 POI 카테고리 **12 → 3** (`CS2`·`CE7`·`FD6`) — 병렬 호출 축소
- 장면 키워드: 저장 화면 **자동 분석 제거** → 「장면 키워드」 **버튼** (설정 ON일 때만 표시)

## 파일 구분
| 구분 | 경로 |
|------|------|
| **신규** | `restore-perf-bundle-b.bat`, 본 문서 |
| **재사용·수정** | `kakaoLocal.ts`, `StampSaveModal.tsx`, `SettingsScreen.tsx`, `public/help.html` |
| **스냅샷** | `src.pre-perf-bundle-b/`, `public.pre-perf-bundle-b/` |

## 글꼴 (OFL)
- 폰트 파일 추가 없음. 시스템 글꼴만 사용(기존과 동일).

## 의존성·GPL
- **신규 npm/Gradle 없음.**
- Kakao REST·기존 ML Kit 장면 라벨링 재사용.
- GPL 신규 도입 없음.

## 취약점·보안·Play Store
| 항목 | 결과 |
|------|------|
| 네트워크 | POI 호출 수 감소 → 트래픽·키 쿼터 부담↓. http(s) 대상·키는 기존과 동일 |
| 권한 | 변경 없음 |
| ML | 사용자 탭 시에만 온디바이스 분석. 서버 전송 없음 |
| Data safety | 수집 항목 변화 없음. 카카오 장소 조회는 기존 opt-in 「위치 조회」와 동일 |

## 저작권·독자성
- VoiceStamp 기존 `kakaoLocal` / `suggestSceneMemo` / OCR 버튼 UX 패턴 재사용.
- 외부 구현 복사·번역 없음. 카테고리 코드 문자열은 Kakao Local API 공개 코드값.

## 특허 검토 메모 (보장 아님)
- API 호출 수 축소·버튼 트리거 ML은 일반적 UX/최적화.
- **특허 비침해를 보장하지 않음.**

## 롤백
`restore-perf-bundle-b.bat`
