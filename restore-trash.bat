@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-trash\services\stampRepository.ts" (
  echo Backup not found: src.pre-trash
  exit /b 1
)
copy /Y "src.pre-trash\db\schema.ts" "src\db\schema.ts"
copy /Y "src.pre-trash\db\database.ts" "src\db\database.ts"
copy /Y "src.pre-trash\types\stamp.ts" "src\types\stamp.ts"
copy /Y "src.pre-trash\services\stampRepository.ts" "src\services\stampRepository.ts"
copy /Y "src.pre-trash\services\fileService.ts" "src\services\fileService.ts"
copy /Y "src.pre-trash\screens\MainScreen.tsx" "src\screens\MainScreen.tsx"
copy /Y "src.pre-trash\components\SettingsScreen.tsx" "src\components\SettingsScreen.tsx"
copy /Y "src.pre-trash\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
if exist "src\services\stampTrash.ts" del "src\services\stampTrash.ts"
if exist "src\components\TrashScreen.tsx" del "src\components\TrashScreen.tsx"
echo Restored trash feature rollback from src.pre-trash
