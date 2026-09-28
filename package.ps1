$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "         CCPet (小天体桌宠) 一键打包工具          " -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan

# 检测常用本地代理端口（如 Clash 7897/7890），如果通就自动加上代理加速
$ProxyPorts = @(7897, 7890, 10808, 10809)
foreach ($port in $ProxyPorts) {
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $iar = $tcp.BeginConnect("127.0.0.1", $port, $null, $null)
        $wait = $iar.AsyncWaitHandle.WaitOne(300, $false)
        if ($wait -and $tcp.Connected) {
            $tcp.EndConnect($iar)
            $tcp.Close()
            $env:HTTP_PROXY = "http://127.0.0.1:$port"
            $env:HTTPS_PROXY = "http://127.0.0.1:$port"
            Write-Host "[网络] 检测到本地代理 127.0.0.1:$port，已自动启用加速。" -ForegroundColor Green
            break
        }
        $tcp.Close()
    } catch {}
}

Write-Host "[1/2] 正在调用 electron-builder 打包 Windows 版本..." -ForegroundColor Cyan
Write-Host "      (通常需要 30 秒 ~ 1 分钟，请稍候)..." -ForegroundColor Gray

npm run package:win

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n==================================================" -ForegroundColor Green
    Write-Host "               打包成功！产物已生成                " -ForegroundColor Green
    Write-Host "==================================================" -ForegroundColor Green
    
    $DistPath = Join-Path $ScriptDir "dist"
    if (Test-Path $DistPath) {
        Get-ChildItem -Path $DistPath -File -Include "*.exe","*.zip" | ForEach-Object {
            $sizeMB = [math]::Round($_.Length / 1MB, 1)
            Write-Host "  -> $($_.Name)  ($sizeMB MB)" -ForegroundColor Yellow
        }
        Write-Host "`n[提示] 已为你打开 dist 输出目录！" -ForegroundColor Cyan
        Invoke-Item $DistPath
    }
} else {
    Write-Host "`n[错误] 打包过程中出现异常，退出代码: $LASTEXITCODE" -ForegroundColor Red
}

Write-Host "`n按回车键退出..." -ForegroundColor Gray
Read-Host
