@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-watermark-native\services\exportStampImage.ts" (
  echo Backup not found: src.pre-watermark-native
  exit /b 1
)
copy /Y "src.pre-watermark-native\components\StampExportCard.tsx" "src\components\StampExportCard.tsx"
copy /Y "src.pre-watermark-native\components\StampImageExportHost.tsx" "src\components\StampImageExportHost.tsx"
copy /Y "src.pre-watermark-native\services\exportStampImage.ts" "src\services\exportStampImage.ts"
copy /Y "src.pre-watermark-native\package.json" "package.json"
copy /Y "src.pre-watermark-native\app.json" "app.json"
if exist "src\services\renderStampWatermarkNative.ts" del "src\services\renderStampWatermarkNative.ts"
echo Restored watermark-native rollback from src.pre-watermark-native
echo Run: npm install
