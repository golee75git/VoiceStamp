@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-stamp-field-labels\db\schema.ts" (
  echo Backup not found: src.pre-stamp-field-labels
  exit /b 1
)
copy /Y "src.pre-stamp-field-labels\db\schema.ts" "src\db\schema.ts"
copy /Y "src.pre-stamp-field-labels\db\database.ts" "src\db\database.ts"
copy /Y "src.pre-stamp-field-labels\types\stamp.ts" "src\types\stamp.ts"
copy /Y "src.pre-stamp-field-labels\services\fieldLabels.ts" "src\services\fieldLabels.ts"
copy /Y "src.pre-stamp-field-labels\services\stampRepository.ts" "src\services\stampRepository.ts"
copy /Y "src.pre-stamp-field-labels\services\saveStamp.ts" "src\services\saveStamp.ts"
if exist "src.pre-stamp-field-labels\services\exportStampImage.ts" copy /Y "src.pre-stamp-field-labels\services\exportStampImage.ts" "src\services\exportStampImage.ts"
if exist "src.pre-stamp-field-labels\services\exportPdf.ts" copy /Y "src.pre-stamp-field-labels\services\exportPdf.ts" "src\services\exportPdf.ts"
if exist "src.pre-stamp-field-labels\services\exportProject.ts" copy /Y "src.pre-stamp-field-labels\services\exportProject.ts" "src\services\exportProject.ts"
copy /Y "src.pre-stamp-field-labels\components\StampListScreen.tsx" "src\components\StampListScreen.tsx"
copy /Y "src.pre-stamp-field-labels\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
if exist "src.pre-stamp-field-labels\components\StampExportCard.tsx" copy /Y "src.pre-stamp-field-labels\components\StampExportCard.tsx" "src\components\StampExportCard.tsx"
if exist "src.pre-stamp-field-labels\public\help.html" copy /Y "src.pre-stamp-field-labels\public\help.html" "public\help.html"
if exist "src.pre-stamp-field-labels\apkBuildLabel.ts" copy /Y "src.pre-stamp-field-labels\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
echo Restored stamp field labels from src.pre-stamp-field-labels
echo Note: already-saved title_field_label columns in device DB are left in place (harmless).
