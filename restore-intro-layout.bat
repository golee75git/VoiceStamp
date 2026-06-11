@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-intro-layout\IntroScreen.tsx" (
  echo Backup not found: src.pre-intro-layout
  exit /b 1
)
copy /Y "src.pre-intro-layout\IntroScreen.tsx" "src\components\IntroScreen.tsx"
echo Restored IntroScreen.tsx from src.pre-intro-layout
