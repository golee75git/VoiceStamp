@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-ocr-title-memo\services\settingsService.ts" (
  echo Backup not found: src.pre-ocr-title-memo
  exit /b 1
)
copy /Y "src.pre-ocr-title-memo\services\settingsService.ts" "src\services\settingsService.ts" >nul
copy /Y "src.pre-ocr-title-memo\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx" >nul
copy /Y "src.pre-ocr-title-memo\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx" >nul
copy /Y "src.pre-ocr-title-memo\modules\voicestamp-mlkit\src\index.ts" "modules\voicestamp-mlkit\src\index.ts" >nul
copy /Y "src.pre-ocr-title-memo\modules\voicestamp-mlkit\android\src\main\java\expo\modules\voicestampmlkit\VoicestampMlkitModule.kt" "modules\voicestamp-mlkit\android\src\main\java\expo\modules\voicestampmlkit\VoicestampMlkitModule.kt" >nul
if exist "src\services\ocrTitleMemoService.ts" del /F /Q "src\services\ocrTitleMemoService.ts"
if exist "src.pre-ocr-title-memo\public\help.html" copy /Y "src.pre-ocr-title-memo\public\help.html" "public\help.html" >nul
if exist "src.pre-ocr-title-memo\public\privacy.html" copy /Y "src.pre-ocr-title-memo\public\privacy.html" "public\privacy.html" >nul
if exist "src.pre-ocr-title-memo\public\landing.html" copy /Y "src.pre-ocr-title-memo\public\landing.html" "public\landing.html" >nul
if exist "src.pre-ocr-title-memo\public\info.html" copy /Y "src.pre-ocr-title-memo\public\info.html" "public\info.html" >nul
if exist "src.pre-ocr-title-memo\apkBuildLabel.ts" copy /Y "src.pre-ocr-title-memo\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts" >nul
echo Restored ocr-title-memo from src.pre-ocr-title-memo
