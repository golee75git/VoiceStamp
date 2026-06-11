@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-intro-4\IntroScreen.tsx" (
  echo Backup not found: src.pre-intro-4
  exit /b 1
)
copy /Y "src.pre-intro-4\IntroScreen.tsx" "src\components\IntroScreen.tsx"
copy /Y "src.pre-intro-4\onboarding-1.png" "assets\onboarding\onboarding-1.png"
copy /Y "src.pre-intro-4\onboarding-2.png" "assets\onboarding\onboarding-2.png"
copy /Y "src.pre-intro-4\onboarding-3.png" "assets\onboarding\onboarding-3.png"
if exist "assets\onboarding\onboarding-4.png" del /Q "assets\onboarding\onboarding-4.png"
echo Restored 3-slide intro from src.pre-intro-4
