@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-export-footer-datetime\services\settingsService.ts" (
  echo Backup not found: src.pre-export-footer-datetime
  exit /b 1
)
copy /Y "src.pre-export-footer-datetime\services\settingsService.ts" "src\services\settingsService.ts"
copy /Y "src.pre-export-footer-datetime\services\exportPdf.ts" "src\services\exportPdf.ts"
copy /Y "src.pre-export-footer-datetime\services\exportStampImage.ts" "src\services\exportStampImage.ts"
copy /Y "src.pre-export-footer-datetime\services\renderStampCaptionNative.ts" "src\services\renderStampCaptionNative.ts"
copy /Y "src.pre-export-footer-datetime\services\saveStamp.ts" "src\services\saveStamp.ts"
copy /Y "src.pre-export-footer-datetime\services\stampSaveModalLayoutCache.ts" "src\services\stampSaveModalLayoutCache.ts"
copy /Y "src.pre-export-footer-datetime\services\pdfTitleFormat.ts" "src\services\pdfTitleFormat.ts"
copy /Y "src.pre-export-footer-datetime\services\exportProject.ts" "src\services\exportProject.ts" 2>nul
copy /Y "src.pre-export-footer-datetime\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
copy /Y "src.pre-export-footer-datetime\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
copy /Y "src.pre-export-footer-datetime\components\StampSavePreview.tsx" "src\components\StampSavePreview.tsx"
copy /Y "src.pre-export-footer-datetime\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
if exist "src.pre-export-footer-datetime\help.html" copy /Y "src.pre-export-footer-datetime\help.html" "public\help.html"
echo Restored export footer datetime from src.pre-export-footer-datetime
