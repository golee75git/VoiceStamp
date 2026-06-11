@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-watermark-aspect\components\StampExportCard.tsx" (
  echo Backup not found: src.pre-watermark-aspect
  exit /b 1
)
copy /Y "src.pre-watermark-aspect\components\StampExportCard.tsx" "src\components\StampExportCard.tsx"
copy /Y "src.pre-watermark-aspect\components\StampImageExportHost.tsx" "src\components\StampImageExportHost.tsx"
echo Restored watermark-aspect rollback from src.pre-watermark-aspect
