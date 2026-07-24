@echo off
REM Restore in-app camera front/back facing toggle.
set ROOT=%~dp0
if not exist "%ROOT%src.pre-inapp-camera-facing\CameraScreen.tsx" (
  echo Missing snapshot: src.pre-inapp-camera-facing\
  exit /b 1
)
copy /Y "%ROOT%src.pre-inapp-camera-facing\CameraScreen.tsx" "%ROOT%src\components\CameraScreen.tsx"
copy /Y "%ROOT%src.pre-inapp-camera-facing\InAppCameraPreview.tsx" "%ROOT%src\components\InAppCameraPreview.tsx"
copy /Y "%ROOT%src.pre-inapp-camera-facing\help.html" "%ROOT%public\help.html"
echo Restored in-app camera facing. Rebuild APK if needed.
exit /b 0
