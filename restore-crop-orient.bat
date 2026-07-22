@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-crop-orient\services\stampImageCrop.ts" (
  echo Backup not found: src.pre-crop-orient
  exit /b 1
)
copy /Y "src.pre-crop-orient\services\stampImageCrop.ts" "src\services\stampImageCrop.ts"
copy /Y "src.pre-crop-orient\components\StampSaveModal.tsx" "src\components\StampSaveModal.tsx"
if exist "src.pre-crop-orient\public\help.html" copy /Y "src.pre-crop-orient\public\help.html" "public\help.html"
if exist "src.pre-crop-orient\apkBuildLabel.ts" copy /Y "src.pre-crop-orient\apkBuildLabel.ts" "src\constants\apkBuildLabel.ts"
if exist "src.pre-crop-orient\gallery-android\VoicestampGalleryModule.kt" copy /Y "src.pre-crop-orient\gallery-android\VoicestampGalleryModule.kt" "modules\voicestamp-gallery\android\src\main\java\expo\modules\voicestampgallery\VoicestampGalleryModule.kt"
if exist "src.pre-crop-orient\gallery-src\index.ts" copy /Y "src.pre-crop-orient\gallery-src\index.ts" "modules\voicestamp-gallery\src\index.ts"
echo Restored crop orientation bake from src.pre-crop-orient
