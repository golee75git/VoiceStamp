@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-school-radius-200\services\kakaoLocal.ts" (
  echo Backup not found: src.pre-school-radius-200
  exit /b 1
)
copy /Y "src.pre-school-radius-200\services\kakaoLocal.ts" "src\services\kakaoLocal.ts"
echo Restored school radius rollback from src.pre-school-radius-200
