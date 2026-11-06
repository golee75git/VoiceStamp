@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Restoring watermark shot clock files from src.pre-shot-clock\
xcopy /Y /E /I "src.pre-shot-clock\src\*" "src\" >nul
xcopy /Y /E /I "src.pre-shot-clock\modules\*" "modules\" >nul
copy /Y "src.pre-shot-clock\api\project.js" "api\project.js" >nul
copy /Y "src.pre-shot-clock\public\help.html" "public\help.html" >nul
if exist "src\services\shotClock.ts" del /Q "src\services\shotClock.ts"
echo Restored files from before the EXIF watermark clock. shotClock.ts removed.
