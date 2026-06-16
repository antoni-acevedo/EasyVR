@echo off
cd /d "%~dp0"
set args=
:loop
if "%~1"=="" goto :execute
set args=%args% "%~1"
shift
goto :loop
:execute
"node_modules\.bin\electron.cmd" .%args%
