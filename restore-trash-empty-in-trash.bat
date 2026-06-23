@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-trash-empty-in-trash\components\TrashScreen.tsx" (
  echo Backup not found: src.pre-trash-empty-in-trash
  exit /b 1
)
copy /Y "src.pre-trash-empty-in-trash\components\TrashScreen.tsx" "src\components\TrashScreen.tsx"
copy /Y "src.pre-trash-empty-in-trash\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
copy /Y "src.pre-trash-empty-in-trash\screens\MainScreen.tsx" "src\screens\MainScreen.tsx"
echo Restored trash-empty-in-trash rollback from src.pre-trash-empty-in-trash
