@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-privacy-blur-scale\modules\voicestamp-mlkit\android\src\main\java\expo\modules\voicestampmlkit\VoicestampMlkitModule.kt" (
  echo Backup not found: src.pre-privacy-blur-scale
  exit /b 1
)
copy /Y "src.pre-privacy-blur-scale\modules\voicestamp-mlkit\android\src\main\java\expo\modules\voicestampmlkit\VoicestampMlkitModule.kt" "modules\voicestamp-mlkit\android\src\main\java\expo\modules\voicestampmlkit\VoicestampMlkitModule.kt"
if exist "src.pre-privacy-blur-scale\help.html" copy /Y "src.pre-privacy-blur-scale\help.html" "public\help.html"
if exist "src.pre-privacy-blur-scale\landing.html" copy /Y "src.pre-privacy-blur-scale\landing.html" "public\landing.html"
if exist "src.pre-privacy-blur-scale\info.html" copy /Y "src.pre-privacy-blur-scale\info.html" "public\info.html"
if exist "src.pre-privacy-blur-scale\apkBuildLabel.ts" copy /Y "src.pre-privacy-blur-scale\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
echo Restored privacy blur scale from src.pre-privacy-blur-scale
