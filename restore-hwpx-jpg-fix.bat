@echo off
setlocal
if not exist "src.pre-hwpx-jpg-fix\services\exportHwpx.ts" (
  echo Backup not found: src.pre-hwpx-jpg-fix
  exit /b 1
)
copy /Y "src.pre-hwpx-jpg-fix\services\exportHwpx.ts" "src\services\exportHwpx.ts"
echo Restored exportHwpx.ts from src.pre-hwpx-jpg-fix
