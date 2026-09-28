const { execFile } = require('child_process');
const script = 
Add-Type -Namespace W -Name U -MemberDefinition '
[DllImport(\ user32.dll\)] public static extern bool SetForegroundWindow(IntPtr h);
[DllImport(\user32.dll\)] public static extern bool ShowWindowAsync(IntPtr h, int cmd);
[DllImport(\user32.dll\)] public static extern bool IsIconic(IntPtr h);
[DllImport(\user32.dll\)] public static extern void SwitchToThisWindow(IntPtr h, bool alt);
'
 = Get-Process -Name 'ChatGPT','Codex','Code' -ErrorAction SilentlyContinue | Where-Object { .MainWindowHandle -ne [IntPtr]::Zero } | Select-Object -First 1
if () {
     = .MainWindowHandle
    if ([W.U]::IsIconic()) { [W.U]::ShowWindowAsync(, 9) | Out-Null }
    [W.U]::SetForegroundWindow() | Out-Null
    [W.U]::SwitchToThisWindow(, True)
    Write-Output ('ok|' + .Id + '|' + .ProcessName)
} else {
    Write-Output 'none'
}
;
execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', script], (err, stdout) => {
  console.log('Result:', stdout.trim());
});
