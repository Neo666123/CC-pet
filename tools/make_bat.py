
content = '''@echo off
chcp 936 >nul
title 一键启动 CCPET 与 Codex 代理

echo ========================================================
echo          CCPET 小天体桌宠与 Codex 代理 一键启动
echo ========================================================
echo.

echo [1/2] 正在检查 Codex 代理 (cli-proxy-api.exe)...
tasklist /fi "imagename eq cli-proxy-api.exe" 2>nul | find /i "cli-proxy-api.exe" >nul
if %errorlevel% equ 0 goto PROXY_RUNNING

echo [*] 未检测到 Codex 代理运行，正在启动代理服务...
start "Codex-Proxy" /d "C:\\Users\\lenovo\\Desktop\\codex-gemini\\CLIProxyAPI_7.3.17_windows_amd64" "启动代理..bat"
ping 127.0.0.1 -n 3 >nul
goto START_PET

:PROXY_RUNNING
echo [OK] Codex 代理已经在后台运行中，跳过代理启动。

:START_PET
echo.
echo [2/2] 正在启动小天体桌宠 (CCPET)...
cd /d "D:\\存储\\LLMPET-main"
start "" ".\\node_modules\\electron\\dist\\electron.exe" .

echo.
echo [OK] 启动指令已完成，窗口即将自动关闭...
ping 127.0.0.1 -n 3 >nul
exit /b 0
'''

targets = [
    r'C:\Users\lenovo\Desktop\一键启动Codex.bat',
    r'C:\Users\lenovo\Desktop\启动小天体桌宠.bat',
    r'D:\存储\LLMPET-main\一键启动CCPET.bat',
    r'D:\存储\LLMPET-main\run.bat'
]

for t in targets:
    with open(t, 'w', encoding='gbk', errors='ignore', newline='\r\n') as f:
        f.write(content.strip() + '\r\n')
    print(f'[OK] Written GBK bat to: {t}')
