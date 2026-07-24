@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-privacy-blur\components\StampSaveModal.tsx" (
  echo Backup not found: src.pre-privacy-blur
  exit /b 1
)
copy /Y "src.pre-privacy-blur\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
copy /Y "src.pre-privacy-blur\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
copy /Y "src.pre-privacy-blur\services\settingsService.ts" "src\services\settingsService.ts"
copy /Y "src.pre-privacy-blur\package.json" "package.json"
if exist "src.pre-privacy-blur\constants\apkBuildLabel.ts" copy /Y "src.pre-privacy-blur\constants\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
if exist "src.pre-privacy-blur\help.html" copy /Y "src.pre-privacy-blur\help.html" "public\help.html"
if exist "src.pre-privacy-blur\PRIVACY.md" copy /Y "src.pre-privacy-blur\PRIVACY.md" "docs\PRIVACY.md"
if exist "src.pre-privacy-blur\privacy.html" copy /Y "src.pre-privacy-blur\privacy.html" "public\privacy.html"
if exist "src.pre-privacy-blur\LICENSE-NOTICE.md" copy /Y "src.pre-privacy-blur\LICENSE-NOTICE.md" "docs\LICENSE-NOTICE.md"
if exist "src\components\PrivacyBlurModal.tsx" del "src\components\PrivacyBlurModal.tsx"
if exist "src\services\privacyBlurService.ts" del "src\services\privacyBlurService.ts"
if exist "src\services\privacyBlurTypes.ts" del "src\services\privacyBlurTypes.ts"
if exist "modules\voicestamp-mlkit" rmdir /S /Q "modules\voicestamp-mlkit"
echo Restored privacy blur feature from src.pre-privacy-blur
