@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-place-label\types\stamp.ts" (
  echo Backup not found: src.pre-place-label
  exit /b 1
)
xcopy /E /I /Y "src.pre-place-label\db" "src\db" >nul
xcopy /E /I /Y "src.pre-place-label\types" "src\types" >nul
xcopy /E /I /Y "src.pre-place-label\services" "src\services" >nul
xcopy /E /I /Y "src.pre-place-label\components" "src\components" >nul
xcopy /E /I /Y "src.pre-place-label\utils" "src\utils" >nul
if exist "src\services\stampPlace.ts" del "src\services\stampPlace.ts"
echo Restored place-label feature from src.pre-place-label
