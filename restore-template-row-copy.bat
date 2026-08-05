@echo off
setlocal
cd /d "%~dp0"
if not exist "src.pre-template-row-copy\components\FieldTemplateSheet.tsx" (
  echo Backup not found: src.pre-template-row-copy
  exit /b 1
)
copy /Y "src.pre-template-row-copy\components\FieldTemplateSheet.tsx" "src\components\FieldTemplateSheet.tsx"
if exist "src.pre-template-row-copy\components\CustomFieldTemplateEditor.tsx" (
  copy /Y "src.pre-template-row-copy\components\CustomFieldTemplateEditor.tsx" "src\components\CustomFieldTemplateEditor.tsx"
)
if exist "public.pre-template-row-copy\help.html" (
  copy /Y "public.pre-template-row-copy\help.html" "public\help.html"
)
echo Restored template-row-copy from src.pre-template-row-copy / public.pre-template-row-copy
endlocal
