@echo off
cd /d "%~dp0"
if not exist "src.pre-settings\services\fileService.ts" (
  echo ERROR: src.pre-settings backup not found.
  exit /b 1
)
copy /Y "src.pre-settings\services\fileService.ts" "src\services\fileService.ts" >nul
copy /Y "src.pre-settings\components\StampListScreen.tsx" "src\components\StampListScreen.tsx" >nul
copy /Y "src.pre-settings\screens\MainScreen.tsx" "src\screens\MainScreen.tsx" >nul
copy /Y "src.pre-settings\db\database.ts" "src\db\database.ts" >nul
copy /Y "src.pre-settings\db\schema.ts" "src\db\schema.ts" >nul
del "src\services\settingsService.ts" 2>nul
del "src\components\SettingsScreen.tsx" 2>nul
echo Restored settings feature files
