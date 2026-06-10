@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "public.pre-apk-download\info.html" (
  echo Backup not found: public.pre-apk-download
  exit /b 1
)
copy /Y "public.pre-apk-download\info.html" "public\info.html"
echo Restored info.html from public.pre-apk-download
echo Note: releases\VoiceStamp_20260609_183510.apk is unchanged. Remove from git manually if needed.
