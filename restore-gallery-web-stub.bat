@echo off
chcp 65001 >nul
cd /d "%~dp0"
if exist "src\services\galleryService.web.ts" del /F "src\services\galleryService.web.ts"
echo Restored gallery-web-stub rollback (removed galleryService.web.ts)
