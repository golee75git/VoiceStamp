@echo off
REM Restores StampSaveModal, SettingsScreen, help from *.pre-collect-tx-badge/
set ROOT=%~dp0
copy /Y "%ROOT%src.pre-collect-tx-badge\components\StampSaveModal.tsx" "%ROOT%src\components\StampSaveModal.tsx"
copy /Y "%ROOT%src.pre-collect-tx-badge\components\SettingsScreen.tsx" "%ROOT%src\components\SettingsScreen.tsx"
copy /Y "%ROOT%public.pre-collect-tx-badge\help.html" "%ROOT%public\help.html"
echo Restored collect-tx-badge snapshots
pause
