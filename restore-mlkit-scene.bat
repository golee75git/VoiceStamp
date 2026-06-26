@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-mlkit-scene\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-mlkit-scene
  exit /b 1
)
copy /Y "src.pre-mlkit-scene\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-mlkit-scene\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
copy /Y "src.pre-mlkit-scene\services\settingsService.ts" "src\services\settingsService.ts"
copy /Y "src.pre-mlkit-scene\package.json" "package.json"
if exist "src\services\sceneLabelService.ts" del "src\services\sceneLabelService.ts"
if exist "src\services\sceneLabelKo.ts" del "src\services\sceneLabelKo.ts"
if exist "src\services\sceneLabelService.types.ts" del "src\services\sceneLabelService.types.ts"
if exist "src\services\voicestampMlkitNative.ts" del "src\services\voicestampMlkitNative.ts"
if exist "modules\voicestamp-mlkit" rmdir /S /Q "modules\voicestamp-mlkit"
echo Restored ML Kit scene label feature from src.pre-mlkit-scene
