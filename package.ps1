$ErrorActionPreference = "Continue"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "         CCPet (小天体桌宠) 一键打包工具          " -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# 检测代理
$proxyPorts = @(7897, 7890, 10808, 10809)
foreach ($p in $proxyPorts) {
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $iar = $tcp.BeginConnect("127.0.0.1", $p, $null, $null)
        $ok = $iar.AsyncWaitHandle.WaitOne(200, $false)
        if ($ok -and $tcp.Connected) {
            $tcp.EndConnect($iar)
            $tcp.Close()
            $env:HTTP_PROXY = "http://127.0.0.1:" + $p
            $env:HTTPS_PROXY = "http://127.0.0.1:" + $p
            Write-Host ("[网络] 检测到本地代理端口 " + $p + "，已启用代理加速。") -ForegroundColor Green
            break
        }
        $tcp.Close()
    } catch {}
}

# 清理旧的 win-unpacked 临时解压目录（防止 EBUSY 占用锁定）
$unpacked = Join-Path $ScriptDir "dist\win-unpacked"
if (Test-Path $unpacked) {
    for ($i = 0; $i -lt 5; $i++) {
        try {
            Remove-Item -LiteralPath $unpacked -Recurse -Force -ErrorAction Stop
            break
        } catch {
            Start-Sleep -Milliseconds 400
        }
    }
}

Write-Host ""
Write-Host "[1/2] 正在调用 electron-builder 打包 Windows 版本..." -ForegroundColor Cyan
Write-Host "      (通常需要 30 秒 ~ 1 分钟，请稍候)..." -ForegroundColor Gray
Write-Host ""

npm run package:win

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host "             打包完成！产物已生成至 dist          " -ForegroundColor Green
    Write-Host "==================================================" -ForegroundColor Green
    $dist = Join-Path $ScriptDir "dist"
    if (Test-Path $dist) {
        Get-ChildItem -Path $dist -File | Where-Object { $_.Extension -in @(".exe", ".zip") } | ForEach-Object {
            $mb = [math]::Round($_.Length / 1MB, 1)
            Write-Host ("  [产物] " + $_.Name + " (" + $mb + " MB)") -ForegroundColor Yellow
        }
        Write-Host ""
        Write-Host "[提示] 正在为你打开 dist 输出文件夹..." -ForegroundColor Cyan
        Invoke-Item $dist
    }
} else {
    Write-Host ""
    Write-Host ("[错误] 打包遇到问题，退出代码: " + $LASTEXITCODE) -ForegroundColor Red
}

Write-Host ""
Write-Host "按回车键退出..." -ForegroundColor Gray
Read-Host
