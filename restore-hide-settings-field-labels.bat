@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-hide-settings-field-labels\components\SettingsScreen.tsx" (
  echo Backup not found: src.pre-hide-settings-field-labels
  exit /b 1
)
copy /Y "src.pre-hide-settings-field-labels\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
if exist "public.pre-hide-settings-field-labels\help.html" (
  copy /Y "public.pre-hide-settings-field-labels\help.html" "public\help.html"
)
if exist "src.pre-hide-settings-field-labels\apkBuildLabel.ts" (
  copy /Y "src.pre-hide-settings-field-labels\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
)
echo Restored hide-settings-field-labels
