@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-text-align\services\settingsService.ts" (
  echo Backup not found: src.pre-text-align
  exit /b 1
)
copy /Y "src.pre-text-align\services\settingsService.ts" "src\services\settingsService.ts"
copy /Y "src.pre-text-align\services\exportPdf.ts" "src\services\exportPdf.ts"
copy /Y "src.pre-text-align\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
copy /Y "src.pre-text-align\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
copy /Y "src.pre-text-align\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-text-align\components\VoiceInputField.tsx" "src\components\VoiceInputField.tsx"
copy /Y "src.pre-text-align\components\TrashScreen.tsx" "src\components\TrashScreen.tsx"
copy /Y "src.pre-text-align\screens\MainScreen.tsx" "src\screens\MainScreen.tsx"
echo Restored text-align rollback from src.pre-text-align
