@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-building-title\services\kakaoLocal.ts" (
  echo Backup not found: src.pre-building-title
  exit /b 1
)
copy /Y "src.pre-building-title\services\kakaoLocal.ts" "src\services\kakaoLocal.ts"
echo Restored kakaoLocal.ts from src.pre-building-title
