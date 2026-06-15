@echo off
setlocal
if not exist "src.pre-hwpx-export\components\StampListScreen.tsx" (
  echo Backup not found: src.pre-hwpx-export
  exit /b 1
)
copy /Y "src.pre-hwpx-export\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
if exist "src.pre-hwpx-export\package.json" copy /Y "src.pre-hwpx-export\package.json" "package.json"
if exist "src\services\exportHwpx.ts" del /Q "src\services\exportHwpx.ts"
echo Restored HWPX export feature from backups.
echo Note: npm package hwpx-js is not removed. Run npm uninstall hwpx-js if needed.
