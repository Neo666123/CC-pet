@echo off
title CCPet 一键打包
cd /d "%~dp0"
echo ==================================================
echo         CCPet (小天体桌宠) 一键打包工具
echo ==================================================
echo.
echo 正在启动打包程序，请稍候...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0package.ps1"
echo.
echo ==================================================
echo 执行完毕，按任意键退出...
pause >nul