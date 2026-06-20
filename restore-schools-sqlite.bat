@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-schools-sqlite\services\schoolLookup.ts" (
  echo Backup not found: src.pre-schools-sqlite
  exit /b 1
)
copy /Y "src.pre-schools-sqlite\services\kakaoLocal.ts" "src\services\kakaoLocal.ts" >nul
copy /Y "src.pre-schools-sqlite\services\schoolLookup.ts" "src\services\schoolLookup.ts" >nul
copy /Y "src.pre-schools-sqlite\services\schoolSeed.ts" "src\services\schoolSeed.ts" >nul
copy /Y "src.pre-schools-sqlite\db\database.ts" "src\db\database.ts" >nul
copy /Y "src.pre-schools-sqlite\db\schema.ts" "src\db\schema.ts" >nul
copy /Y "src.pre-schools-sqlite\schools.seed.json" "assets\schools.seed.json" >nul 2>nul
del "src\services\schoolDatabase.ts" 2>nul
del "assets\schools.sqlite" 2>nul
del "scripts\build-schools-db.mjs" 2>nul
echo Restored JSON seed school DB from src.pre-schools-sqlite
