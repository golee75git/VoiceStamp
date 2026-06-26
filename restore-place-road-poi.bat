@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-place-road-poi\services\kakaoLocal.ts" (
  echo Backup not found: src.pre-place-road-poi
  exit /b 1
)
copy /Y "src.pre-place-road-poi\services\kakaoLocal.ts" "src\services\kakaoLocal.ts"
echo Restored kakaoLocal.ts from src.pre-place-road-poi
