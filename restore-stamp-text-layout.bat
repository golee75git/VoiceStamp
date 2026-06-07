@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-stamp-text-layout\services\settingsService.ts" (
  echo Backup not found: src.pre-stamp-text-layout
  exit /b 1
)
copy /Y "src.pre-stamp-text-layout\services\settingsService.ts" "src\services\settingsService.ts"
copy /Y "src.pre-stamp-text-layout\services\exportPdf.ts" "src\services\exportPdf.ts"
copy /Y "src.pre-stamp-text-layout\services\exportStampImage.ts" "src\services\exportStampImage.ts"
copy /Y "src.pre-stamp-text-layout\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
copy /Y "src.pre-stamp-text-layout\components\StampExportCard.tsx" "src\components\StampExportCard.tsx"
copy /Y "src.pre-stamp-text-layout\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
echo Restored stamp-text-layout rollback from src.pre-stamp-text-layout
