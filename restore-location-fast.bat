@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-location-fast\services\locationService.ts" (
  echo Backup not found: src.pre-location-fast
  exit /b 1
)
copy /Y "src.pre-location-fast\services\locationService.ts" "src\services\locationService.ts"
echo Restored locationService from src.pre-location-fast (GPS cache rollback)
