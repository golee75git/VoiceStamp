@echo off
setlocal
cd /d "%~dp0"
if exist "src.pre-export-file-place\services\pdfTitleFormat.ts" copy /Y "src.pre-export-file-place\services\pdfTitleFormat.ts" "src\services\pdfTitleFormat.ts" >nul
if exist "src.pre-export-file-place\services\exportStampImage.ts" copy /Y "src.pre-export-file-place\services\exportStampImage.ts" "src\services\exportStampImage.ts" >nul
if exist "src.pre-export-file-place\components\StampListScreen.tsx" copy /Y "src.pre-export-file-place\components\StampListScreen.tsx" "src\components\StampListScreen.tsx" >nul
if exist "src.pre-export-file-place\components\FollowLinkCompareSheet.tsx" copy /Y "src.pre-export-file-place\components\FollowLinkCompareSheet.tsx" "src\components\FollowLinkCompareSheet.tsx" >nul
if exist "src.pre-export-file-place\components\SettingsScreen.tsx" copy /Y "src.pre-export-file-place\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx" >nul
if exist "public.pre-export-file-place\help.html" copy /Y "public.pre-export-file-place\help.html" "public\help.html" >nul
echo Restored export-file-place (before place in default names / per-stamp JPEG names). Reload Metro.
endlocal
