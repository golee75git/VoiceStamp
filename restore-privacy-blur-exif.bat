@echo off
REM Restore privacy blur EXIF bake (system camera box/mosaic alignment).
set ROOT=%~dp0
if not exist "%ROOT%src.pre-privacy-blur-exif\privacyBlurService.ts" (
  echo Missing snapshot: src.pre-privacy-blur-exif\
  exit /b 1
)
copy /Y "%ROOT%src.pre-privacy-blur-exif\privacyBlurService.ts" "%ROOT%src\services\privacyBlurService.ts"
copy /Y "%ROOT%src.pre-privacy-blur-exif\privacyBlurTypes.ts" "%ROOT%src\services\privacyBlurTypes.ts"
copy /Y "%ROOT%src.pre-privacy-blur-exif\PrivacyBlurModal.tsx" "%ROOT%src\components\PrivacyBlurModal.tsx"
copy /Y "%ROOT%src.pre-privacy-blur-exif\help.html" "%ROOT%public\help.html"
echo Restored privacy blur EXIF bake. Rebuild APK if needed.
exit /b 0
