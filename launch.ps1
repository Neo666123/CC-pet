param(
    [switch]$Restart
)

$Host.UI.RawUI.WindowTitle = "CCPET 小天体桌宠 + Codex 代理 一键启动器"
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       CCPET 小天体桌宠 + Codex 代理 一键启动器" -ForegroundColor Cyan
Write-Host "========================================================`n" -ForegroundColor Cyan

$proxyDir = "C:\Users\lenovo\Desktop\codex-gemini\CLIProxyAPI_7.3.17_windows_amd64"
$proxyExe = "cli-proxy-api"
$petDir = $PSScriptRoot

# 1. 检查 Codex 代理进程是否已启动
Write-Host "[1/3] 正在检查 Codex 代理进程 ($proxyExe)..." -ForegroundColor Yellow
$proc = Get-Process -Name $proxyExe -ErrorAction SilentlyContinue

if ($proc) {
    Write-Host "[OK] Codex 代理已在后台运行中 (PID: $($proc[0].Id))，跳过启动。" -ForegroundColor Green
} else {
    Write-Host "[*] 未检测到代理进程，正在启动 Codex 代理..." -ForegroundColor Yellow
    $proxyBat = Join-Path $proxyDir "启动代理..bat"
    if (Test-Path $proxyBat) {
        Start-Process -FilePath "cmd.exe" -ArgumentList "/c `"$proxyBat`"" -WorkingDirectory $proxyDir
    } elseif (Test-Path (Join-Path $proxyDir "$proxyExe.exe")) {
        Start-Process -FilePath (Join-Path $proxyDir "$proxyExe.exe") -ArgumentList "-config config.yaml" -WorkingDirectory $proxyDir
    } else {
        Write-Host "[-] 未找到代理路径: $proxyDir" -ForegroundColor DarkGray
    }
    Write-Host "[OK] Codex 代理启动指令已下发！" -ForegroundColor Green
    Start-Sleep -Seconds 1
}

# 2. 检查小天体桌宠 (CCPET) 进程
Write-Host "`n[2/3] 正在检查小天体桌宠 (CCPET)..." -ForegroundColor Yellow
$oldPet = Get-Process -Name "electron" -ErrorAction SilentlyContinue

if ($oldPet -and -not $Restart) {
    Write-Host "[OK] 小天体桌宠已在运行中 (PID: $($oldPet[0].Id))，跳过启动。" -ForegroundColor Green
} else {
    if ($oldPet -and $Restart) {
        Write-Host "[*] 检测到用户要求强制重启，正在停止旧进程..." -ForegroundColor Yellow
        Stop-Process -Name "electron" -Force -ErrorAction SilentlyContinue
        Start-Sleep -Milliseconds 600
    }
    Write-Host "[*] 正在启动小天体桌宠 (CCPET)..." -ForegroundColor Yellow
    $electronExe = Join-Path $petDir "node_modules\electron\dist\electron.exe"
    if (Test-Path $electronExe) {
        Start-Process -FilePath $electronExe -ArgumentList "." -WorkingDirectory $petDir
        Write-Host "[OK] 小天体桌宠已启动！" -ForegroundColor Green
    } else {
        Start-Process -FilePath "npm.cmd" -ArgumentList "start" -WorkingDirectory $petDir
        Write-Host "[OK] 已调用 npm start 启动桌宠！" -ForegroundColor Green
    }
}

# 3. 自动同步 Codex MCP 联动配置
Write-Host "`n[3/3] 正在检查 Codex MCP 联动配置..." -ForegroundColor Yellow
$setupScript = Join-Path $petDir "tools\setup-codex-integration.js"
if (Test-Path $setupScript) {
    try {
        & node $setupScript | Out-Null
        Write-Host "[OK] Codex MCP 联动配置已就绪！" -ForegroundColor Green
    } catch {
        Write-Host "[-] 同步 Codex MCP 配置跳过。" -ForegroundColor DarkGray
    }
}

Write-Host "`n[OK] 全部就绪，窗口将在 2 秒后自动关闭..." -ForegroundColor Cyan
Start-Sleep -Seconds 2
