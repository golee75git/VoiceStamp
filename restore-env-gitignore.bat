@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-env-gitignore\.gitignore" (
  echo Backup not found: src.pre-env-gitignore
  exit /b 1
)
copy /Y "src.pre-env-gitignore\.gitignore" ".gitignore"
echo Restored .gitignore from src.pre-env-gitignore
