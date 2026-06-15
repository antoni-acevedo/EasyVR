@echo off
cd /d "%~dp0"
"node_modules\electron\dist\electron.exe" . "%1"
