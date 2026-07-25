@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-mlkit-scene\services\settingsService.ts" (
  echo Backup not found: src.pre-mlkit-scene
  exit /b 1
)
copy /Y "src.pre-mlkit-scene\services\settingsService.ts" "src\services\settingsService.ts" >nul
copy /Y "src.pre-mlkit-scene\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx" >nul
copy /Y "src.pre-mlkit-scene\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx" >nul
copy /Y "src.pre-mlkit-scene\modules\voicestamp-mlkit\src\index.ts" "modules\voicestamp-mlkit\src\index.ts" >nul
copy /Y "src.pre-mlkit-scene\modules\voicestamp-mlkit\android\build.gradle" "modules\voicestamp-mlkit\android\build.gradle" >nul
copy /Y "src.pre-mlkit-scene\modules\voicestamp-mlkit\android\src\main\java\expo\modules\voicestampmlkit\VoicestampMlkitModule.kt" "modules\voicestamp-mlkit\android\src\main\java\expo\modules\voicestampmlkit\VoicestampMlkitModule.kt" >nul
if exist "src\services\sceneLabelService.ts" del /F /Q "src\services\sceneLabelService.ts"
if exist "src\services\sceneLabelKo.ts" del /F /Q "src\services\sceneLabelKo.ts"
if exist "src.pre-mlkit-scene\public\help.html" copy /Y "src.pre-mlkit-scene\public\help.html" "public\help.html" >nul
if exist "src.pre-mlkit-scene\public\privacy.html" copy /Y "src.pre-mlkit-scene\public\privacy.html" "public\privacy.html" >nul
if exist "src.pre-mlkit-scene\public\landing.html" copy /Y "src.pre-mlkit-scene\public\landing.html" "public\landing.html" >nul
if exist "src.pre-mlkit-scene\public\info.html" copy /Y "src.pre-mlkit-scene\public\info.html" "public\info.html" >nul
if exist "src.pre-mlkit-scene\apkBuildLabel.ts" copy /Y "src.pre-mlkit-scene\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts" >nul
echo Restored mlkit-scene from src.pre-mlkit-scene
