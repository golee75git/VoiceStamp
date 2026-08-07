@echo off
setlocal
cd /d "%~dp0"
if not exist "api.pre-ncp-put-fix\project.js" (
  echo Backup not found: api.pre-ncp-put-fix
  exit /b 1
)
copy /Y "api.pre-ncp-put-fix\project.js" "api\project.js" >nul
echo Restored api\project.js from api.pre-ncp-put-fix
echo Redeploy Vercel after restore.
endlocal
