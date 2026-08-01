@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-perf-bundle-b\services\kakaoLocal.ts" (
  echo Backup not found: src.pre-perf-bundle-b
  exit /b 1
)
copy /Y "src.pre-perf-bundle-b\services\kakaoLocal.ts" "src\services\kakaoLocal.ts"
copy /Y "src.pre-perf-bundle-b\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-perf-bundle-b\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
if exist "src.pre-perf-bundle-b\components\WebLimitNoticeScreen.tsx" (
  copy /Y "src.pre-perf-bundle-b\components\WebLimitNoticeScreen.tsx" "src\components\WebLimitNoticeScreen.tsx"
)
if exist "public.pre-perf-bundle-b\help.html" copy /Y "public.pre-perf-bundle-b\help.html" "public\help.html"
echo Restored perf-bundle-b from src.pre-perf-bundle-b / public.pre-perf-bundle-b
