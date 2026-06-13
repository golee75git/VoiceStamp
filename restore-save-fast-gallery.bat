@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-save-fast-gallery\services\saveStamp.ts" (
  echo Backup not found: src.pre-save-fast-gallery
  exit /b 1
)
copy /Y "src.pre-save-fast-gallery\services\saveStamp.ts" "src\services\saveStamp.ts"
copy /Y "src.pre-save-fast-gallery\services\stampRepository.ts" "src\services\stampRepository.ts"
echo Restored save-fast-gallery from src.pre-save-fast-gallery
