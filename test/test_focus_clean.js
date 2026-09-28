const { execFile } = require('child_process');
const list = [];
const script = [
  "Add-Type -Namespace W -Name U -MemberDefinition '",
  '[DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);',
  '[DllImport("user32.dll")] public static extern bool ShowWindowAsync(IntPtr h, int cmd);',
  '[DllImport("user32.dll")] public static extern bool IsIconic(IntPtr h);',
  '[DllImport("user32.dll")] public static extern void SwitchToThisWindow(IntPtr h, bool alt);',
  "'",
  `foreach ($id in @(${list.join(',')})) {`,
  '  $p = Get-Process -Id $id -ErrorAction SilentlyContinue',
  '  if ($p -and $p.MainWindowHandle -ne [IntPtr]::Zero) {',
  '    $h = $p.MainWindowHandle',
  '    if ([W.U]::IsIconic($h)) { [W.U]::ShowWindowAsync($h, 9) | Out-Null }',
  '    [W.U]::SetForegroundWindow($h) | Out-Null',
  '    [W.U]::SwitchToThisWindow($h, $true)',
  '    Write-Output ("ok|" + $id)',
  '    exit 0',
  '  }',
  '}',
  "foreach ($p in (Get-Process -Name 'ChatGPT','Codex','Code' -ErrorAction SilentlyContinue)) {",
  '  if ($p.MainWindowHandle -ne [IntPtr]::Zero) {',
  '    $h = $p.MainWindowHandle',
  '    if ([W.U]::IsIconic($h)) { [W.U]::ShowWindowAsync($h, 9) | Out-Null }',
  '    [W.U]::SetForegroundWindow($h) | Out-Null',
  '    [W.U]::SwitchToThisWindow($h, $true)',
  '    Write-Output ("ok|" + $p.Id + "|" + $p.ProcessName)',
  '    exit 0',
  '  }',
  '}',
  "Write-Output 'none'",
].join('\n');

execFile('powershell.exe',
  ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', script],
  { timeout: 5000, windowsHide: true },
  (err, stdout) => {
    console.log('Result:', String(stdout || '').trim());
  }
);
