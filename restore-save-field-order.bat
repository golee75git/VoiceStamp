@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-save-field-order\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-save-field-order
  exit /b 1
)
copy /Y "src.pre-save-field-order\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
if exist "src.pre-save-field-order\public\help.html" copy /Y "src.pre-save-field-order\public\help.html" "public\help.html"
if exist "src.pre-save-field-order\apkBuildLabel.ts" copy /Y "src.pre-save-field-order\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
echo Restored save field order from src.pre-save-field-order
