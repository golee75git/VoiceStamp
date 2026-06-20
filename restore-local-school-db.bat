@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-local-school-db\services\kakaoLocal.ts" (
  echo Backup not found: src.pre-local-school-db
  exit /b 1
)
copy /Y "src.pre-local-school-db\services\kakaoLocal.ts" "src\services\kakaoLocal.ts" >nul
copy /Y "src.pre-local-school-db\db\database.ts" "src\db\database.ts" >nul
copy /Y "src.pre-local-school-db\db\schema.ts" "src\db\schema.ts" >nul
del "src\services\schoolLookup.ts" 2>nul
del "src\services\schoolSeed.ts" 2>nul
del "src\types\school.ts" 2>nul
del "assets\schools.seed.json" 2>nul
echo Restored local school DB changes from src.pre-local-school-db
