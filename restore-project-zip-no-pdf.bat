@echo off
setlocal
if not exist "src.pre-project-zip-no-pdf\components\StampListScreen.tsx" (
  echo Backup not found: src.pre-project-zip-no-pdf
  exit /b 1
)
copy /Y "src.pre-project-zip-no-pdf\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
if exist "src.pre-project-zip-no-pdf\help.html" copy /Y "src.pre-project-zip-no-pdf\help.html" "public\help.html"
echo Restored project ZIP no-PDF default from src.pre-project-zip-no-pdf
