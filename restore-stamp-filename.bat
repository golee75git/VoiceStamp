@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-stamp-filename\services\fileService.ts" (
  echo Backup not found: src.pre-stamp-filename
  exit /b 1
)
copy /Y "src.pre-stamp-filename\services\fileService.ts" "src\services\fileService.ts"
copy /Y "src.pre-stamp-filename\services\saveStamp.ts" "src\services\saveStamp.ts"
copy /Y "src.pre-stamp-filename\services\stampRepository.ts" "src\services\stampRepository.ts"
echo Restored stamp filename behavior from src.pre-stamp-filename
