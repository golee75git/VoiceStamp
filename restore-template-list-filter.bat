@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-template-list-filter\components\StampListScreen.tsx" (
  echo Backup not found: src.pre-template-list-filter
  exit /b 1
)
copy /Y "src.pre-template-list-filter\types\stamp.ts" "src\types\stamp.ts"
copy /Y "src.pre-template-list-filter\db\schema.ts" "src\db\schema.ts"
copy /Y "src.pre-template-list-filter\db\database.ts" "src\db\database.ts"
copy /Y "src.pre-template-list-filter\services\stampRepository.ts" "src\services\stampRepository.ts"
copy /Y "src.pre-template-list-filter\services\saveStamp.ts" "src\services\saveStamp.ts"
copy /Y "src.pre-template-list-filter\services\stampFieldTemplates.ts" "src\services\stampFieldTemplates.ts"
copy /Y "src.pre-template-list-filter\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
if exist "public.pre-template-list-filter\help.html" (
  copy /Y "public.pre-template-list-filter\help.html" "public\help.html"
)
if exist "public.pre-template-list-filter\landing.html" (
  copy /Y "public.pre-template-list-filter\landing.html" "public\landing.html"
)
if exist "public.pre-template-list-filter\info.html" (
  copy /Y "public.pre-template-list-filter\info.html" "public\info.html"
)
if exist "src.pre-template-list-filter\apkBuildLabel.ts" (
  copy /Y "src.pre-template-list-filter\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
)
echo Restored template-list-filter
