@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0package.ps1"
if %errorlevel% neq 0 pause
