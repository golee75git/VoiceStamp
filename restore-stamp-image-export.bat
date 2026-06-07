@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-stamp-image-export\components\StampListScreen.tsx" (
  echo Backup not found: src.pre-stamp-image-export
  exit /b 1
)
copy /Y "src.pre-stamp-image-export\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
copy /Y "src.pre-stamp-image-export\package.json" "package.json"
if exist "src\services\exportStampImage.ts" del /Q "src\services\exportStampImage.ts"
if exist "src\components\StampExportCard.tsx" del /Q "src\components\StampExportCard.tsx"
if exist "src\components\StampImageExportHost.tsx" del /Q "src\components\StampImageExportHost.tsx"
echo Restored stamp-image-export rollback from src.pre-stamp-image-export
echo Run: npm install
