@echo off
setlocal
if not exist "src.pre-xlsx-image-col1\services\exportXlsx.ts" (
  echo Backup not found: src.pre-xlsx-image-col1
  exit /b 1
)
copy /Y "src.pre-xlsx-image-col1\services\exportXlsx.ts" "src\services\exportXlsx.ts"
echo Restored exportXlsx.ts from src.pre-xlsx-image-col1
