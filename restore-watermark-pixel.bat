@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-watermark-pixel\components\StampExportCard.tsx" (
  echo Backup not found: src.pre-watermark-pixel
  exit /b 1
)
copy /Y "src.pre-watermark-pixel\components\StampExportCard.tsx" "src\components\StampExportCard.tsx"
copy /Y "src.pre-watermark-pixel\components\StampImageExportHost.tsx" "src\components\StampImageExportHost.tsx"
copy /Y "src.pre-watermark-pixel\services\exportStampImage.ts" "src\services\exportStampImage.ts"
echo Restored watermark-pixel rollback from src.pre-watermark-pixel
