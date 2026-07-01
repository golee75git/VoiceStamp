@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-school-skip-region\services\kakaoLocal.ts" (
  echo Backup not found: src.pre-school-skip-region
  exit /b 1
)
copy /Y "src.pre-school-skip-region\services\kakaoLocal.ts" "src\services\kakaoLocal.ts"
echo Restored school-skip-region kakaoLocal rollback
