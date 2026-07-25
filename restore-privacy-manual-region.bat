@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-privacy-manual-region\components\PrivacyBlurModal.tsx" (
  echo Backup not found: src.pre-privacy-manual-region
  exit /b 1
)
copy /Y "src.pre-privacy-manual-region\components\PrivacyBlurModal.tsx" "src\components\PrivacyBlurModal.tsx" >nul
if exist "src.pre-privacy-manual-region\public\help.html" copy /Y "src.pre-privacy-manual-region\public\help.html" "public\help.html" >nul
if exist "src.pre-privacy-manual-region\public\landing.html" copy /Y "src.pre-privacy-manual-region\public\landing.html" "public\landing.html" >nul
if exist "src.pre-privacy-manual-region\public\info.html" copy /Y "src.pre-privacy-manual-region\public\info.html" "public\info.html" >nul
if exist "src.pre-privacy-manual-region\apkBuildLabel.ts" copy /Y "src.pre-privacy-manual-region\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts" >nul
echo Restored privacy-manual-region from src.pre-privacy-manual-region
