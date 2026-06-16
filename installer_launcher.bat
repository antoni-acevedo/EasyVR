@echo off
cd /d "%~dp0app"
set args=
:loop
if "%~1"=="" goto :execute
set args=%args% "%~1"
shift
goto :loop
:execute
"..\electron\electron.exe" .%args%
