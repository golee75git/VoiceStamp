@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-road-place-fallback\services\kakaoLocal.ts" (
  echo Backup not found: src.pre-road-place-fallback
  exit /b 1
)
copy /Y "src.pre-road-place-fallback\services\kakaoLocal.ts" "src\services\kakaoLocal.ts"
echo Restored kakaoLocal.ts from src.pre-road-place-fallback
