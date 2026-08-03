# DESIGN — 저장 직후 칸 말하기 (순차만)

날짜: 2026-08-03

## 목적
새 스탬프 저장 화면에서 제목·장소·메모를 칸마다 이어서 말할 수 있게 한다.
키워드 일괄 분배는 포함하지 않는다.

## 동작
1. 설정 `save_slot_speech_enabled` = true (기본 false)
2. `StampSaveModal` visible && !isEdit && native
3. `SaveSlotSpeechSheet` 오픈 → title → place → memo
4. 칸마다 `useSpeechInput.start()` (continuous: false)
5. 비어 있지 않은 칸만 부모 state에 반영 + touched 플래그

## 비범위
- 키워드 파싱 / LLM
- 추가1~3·QR URL 슬롯
- 수정 모달 자동 오픈
- 신규 npm 패키지
