@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-school-poi\services\kakaoLocal.ts" (
  echo Backup not found: src.pre-school-poi
  exit /b 1
)
copy /Y "src.pre-school-poi\services\kakaoLocal.ts" "src\services\kakaoLocal.ts"
echo Restored kakaoLocal.ts from src.pre-school-poi
