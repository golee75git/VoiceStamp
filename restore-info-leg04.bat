@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-info-leg04\screens\MainScreen.tsx" (
  echo Backup not found: src.pre-info-leg04
  exit /b 1
)
copy /Y "src.pre-info-leg04\screens\MainScreen.tsx" "src\screens\MainScreen.tsx"
copy /Y "src.pre-info-leg04\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
copy /Y "src.pre-info-leg04\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
if exist "vercel.json.pre-info-leg04" copy /Y "vercel.json.pre-info-leg04" "vercel.json"
if exist "src\constants\infoUrls.ts" del /Q "src\constants\infoUrls.ts"
if exist "public\info.html" del /Q "public\info.html"
if exist "public\privacy.html" del /Q "public\privacy.html"
if exist "public\license.html" del /Q "public\license.html"
if exist "public\help.html" del /Q "public\help.html"
echo Restored info-leg04 rollback from src.pre-info-leg04
