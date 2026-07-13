@echo off
setlocal
if not exist "src.pre-export-binary-write\services\exportProject.ts" (
  echo Backup not found: src.pre-export-binary-write
  exit /b 1
)
copy /Y "src.pre-export-binary-write\services\exportProject.ts" "src\services\exportProject.ts"
copy /Y "src.pre-export-binary-write\services\exportXlsx.ts" "src\services\exportXlsx.ts"
copy /Y "src.pre-export-binary-write\services\exportHwpx.ts" "src\services\exportHwpx.ts"
if exist "src\services\writeCacheFile.ts" del /Q "src\services\writeCacheFile.ts"
if exist "src.pre-export-binary-write\help.html" copy /Y "src.pre-export-binary-write\help.html" "public\help.html"
echo Restored export binary-write changes from src.pre-export-binary-write
