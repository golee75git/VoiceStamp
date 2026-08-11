@echo off
setlocal EnableExtensions
cd /d "%~dp0"

if not exist "api.pre-security-hardening\project.js" (
  echo [ERROR] Missing api.pre-security-hardening\project.js
  exit /b 1
)

copy /Y "api.pre-security-hardening\project.js" "api\project.js" >nul
if exist "src.pre-security-hardening\components\ProjectCollectScreen.tsx" (
  copy /Y "src.pre-security-hardening\components\ProjectCollectScreen.tsx" "src\components\ProjectCollectScreen.tsx" >nul
)
if exist "src.pre-security-hardening\services\projectCollectApi.ts" (
  copy /Y "src.pre-security-hardening\services\projectCollectApi.ts" "src\services\projectCollectApi.ts" >nul
)
if exist "public.pre-security-hardening\help.html" (
  copy /Y "public.pre-security-hardening\help.html" "public\help.html" >nul
)
if exist "public.pre-security-hardening\NCP-PROJECT-SETUP.md" (
  copy /Y "public.pre-security-hardening\NCP-PROJECT-SETUP.md" "docs\NCP-PROJECT-SETUP.md" >nul
)

echo Restored api/project.js and related snapshots from *.pre-security-hardening
exit /b 0
