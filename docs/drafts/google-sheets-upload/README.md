# Google Sheets 업로드 초안 (소스 미연동)

이 폴더는 **복사·붙여넣기용 초안**입니다. VoiceStamp `src/`에는 연결되어 있지 않습니다.

| 파일 | 용도 |
|------|------|
| `Code.gs` | Google Apps Script 편집기에 붙여넣기 |
| `client-api.draft.ts` | 향후 `src/services/exportGoogleSheet.ts` 구현 참고 |
| `sample-payload.json` | Postman/curl 스모크 테스트 |

설계 본문: [../DESIGN-GOOGLE-SHEETS-UPLOAD.md](../DESIGN-GOOGLE-SHEETS-UPLOAD.md)

## 빠른 시작

1. Google 스프레드시트 생성
2. 확장 프로그램 → Apps Script → `Code.gs` 내용 붙여넣기 → `SECRET` 변경
3. 배포 → 웹 앱 (실행: 나 / 액세스: 모든 사용자)
4. `sample-payload.json`의 `token`·`imageBase64`를 채운 뒤 POST로 검증
5. 앱 연동은 설계 문서 §9 이후 단계에서 별도 진행
