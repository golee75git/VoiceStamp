@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-save-preview-fast\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-save-preview-fast
  exit /b 1
)
copy /Y "src.pre-save-preview-fast\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-save-preview-fast\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
copy /Y "src.pre-save-preview-fast\build-apk.bat" "build-apk.bat"
echo export const APK_BUILD_FILENAME = '';> src\constants\apkBuildLabel.ts
echo Restored save preview fast + apk build label rollback
