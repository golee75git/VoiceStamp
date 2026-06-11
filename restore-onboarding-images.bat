@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-onboarding-images\onboarding-1.png" (
  echo Backup not found: src.pre-onboarding-images
  exit /b 1
)
copy /Y "src.pre-onboarding-images\onboarding-1.png" "assets\onboarding\onboarding-1.png"
copy /Y "src.pre-onboarding-images\onboarding-2.png" "assets\onboarding\onboarding-2.png"
copy /Y "src.pre-onboarding-images\onboarding-3.png" "assets\onboarding\onboarding-3.png"
copy /Y "src.pre-onboarding-images\onboarding-4.png" "assets\onboarding\onboarding-4.png"
echo Restored onboarding images from src.pre-onboarding-images
