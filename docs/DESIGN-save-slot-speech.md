# DESIGN — 저장 직후 음성으로 항목 채우기 (순차만)

날짜: 2026-08-03 (표시명: 항목 말하기)

## 표시명
- 시트 제목: **항목 말하기**
- 설정: **저장 직후 음성으로 항목 채우기**
- 내부 키/파일명(`save_slot_speech_*`, `SaveSlotSpeechSheet`)은 유지

## 목적
새 스탬프 저장 화면에서 제목·장소·메모를 항목마다 이어서 말할 수 있게 한다.
키워드 일괄 분배는 포함하지 않는다.

## 동작
1. 설정 `save_slot_speech_enabled` = true (기본 false)
2. `StampSaveModal` visible && !isEdit && native
3. `SaveSlotSpeechSheet` 오픈
4. 시트 상단에서 저장 유형 확인·변경 (`applyStampFieldTemplate`)
5. 항목마다 템플릿 `placeholders`를 「말하기 예」로 표시(힌트만)
6. title → place → memo, 항목마다 `useSpeechInput.start()` (continuous: false)
7. 비어 있지 않은 항목만 부모 state에 반영 + touched 플래그

## 비범위
- 키워드 파싱 / LLM
- 추가1~3·QR URL 슬롯
- 수정 모달 자동 오픈
- 신규 npm 패키지
