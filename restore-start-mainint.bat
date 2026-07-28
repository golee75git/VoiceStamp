@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "assets.pre-start-mainint\start.png" (
  echo Backup not found: assets.pre-start-mainint
  exit /b 1
)
if not exist "src.pre-start-mainint\components\StartScreen.tsx" (
  echo Backup not found: src.pre-start-mainint
  exit /b 1
)
copy /Y "assets.pre-start-mainint\start.png" "assets\start.png"
copy /Y "src.pre-start-mainint\components\StartScreen.tsx" "src\components\StartScreen.tsx"
if exist "public.pre-start-mainint\help.html" (
  copy /Y "public.pre-start-mainint\help.html" "public\help.html"
)
echo Restored start banner from assets.pre-start-mainint / src.pre-start-mainint
