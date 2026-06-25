@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "src.pre-caption-exif\services\saveStamp.ts" (
  echo Backup not found: src.pre-caption-exif
  exit /b 1
)
copy /Y "src.pre-caption-exif\services\saveStamp.ts" "src\services\saveStamp.ts"
copy /Y "src.pre-caption-exif\services\exportStampImage.ts" "src\services\exportStampImage.ts"
copy /Y "src.pre-caption-exif\modules\voicestamp-gallery\android\src\main\java\expo\modules\voicestampgallery\VoicestampGalleryModule.kt" "modules\voicestamp-gallery\android\src\main\java\expo\modules\voicestampgallery\VoicestampGalleryModule.kt"
copy /Y "src.pre-caption-exif\modules\voicestamp-gallery\android\build.gradle" "modules\voicestamp-gallery\android\build.gradle"
copy /Y "src.pre-caption-exif\modules\voicestamp-gallery\src\index.ts" "modules\voicestamp-gallery\src\index.ts"
if exist "src\services\embedCaptionExif.ts" del "src\services\embedCaptionExif.ts"
echo Restored caption EXIF rollback from src.pre-caption-exif
