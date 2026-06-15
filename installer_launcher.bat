@echo off
cd /d "%~dp0app"
"..\electron\electron.exe" . "%~1"
