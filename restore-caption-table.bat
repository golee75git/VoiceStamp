@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-caption-table\services\exportPdf.ts" (
  echo Backup not found: src.pre-caption-table
  exit /b 1
)
copy /Y "src.pre-caption-table\services\exportPdf.ts" "src\services\exportPdf.ts"
copy /Y "src.pre-caption-table\services\exportStampImage.ts" "src\services\exportStampImage.ts"
copy /Y "src.pre-caption-table\services\renderStampCaptionNative.ts" "src\services\renderStampCaptionNative.ts"
copy /Y "src.pre-caption-table\services\captionLayout.ts" "src\services\captionLayout.ts"
copy /Y "src.pre-caption-table\components\StampSavePreview.tsx" "src\components\StampSavePreview.tsx"
copy /Y "src.pre-caption-table\components\StampExportCard.tsx" "src\components\StampExportCard.tsx"
if exist "src.pre-caption-table\components\SettingsScreen.tsx" copy /Y "src.pre-caption-table\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
if exist "src.pre-caption-table\public\help.html" copy /Y "src.pre-caption-table\public\help.html" "public\help.html"
if exist "src.pre-caption-table\public\landing.html" copy /Y "src.pre-caption-table\public\landing.html" "public\landing.html"
if exist "src.pre-caption-table\public\info.html" copy /Y "src.pre-caption-table\public\info.html" "public\info.html"
if exist "src.pre-caption-table\report\watermark-export.js" copy /Y "src.pre-caption-table\report\watermark-export.js" "public\report\watermark-export.js"
if exist "src.pre-caption-table\apkBuildLabel.ts" copy /Y "src.pre-caption-table\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
if exist "src\services\captionTable.ts" del /F /Q "src\services\captionTable.ts"
echo Restored caption table from src.pre-caption-table
