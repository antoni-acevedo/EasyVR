$count = 0

# Clean old Spanish key
$oldKeys = @(Get-ChildItem "HKCU:\Software\Classes" -Recurse -Depth 3 -ErrorAction SilentlyContinue | Where-Object { $_.PSPath -like "*BajarPesoVideo" })
foreach ($old in $oldKeys) {
    Remove-Item -LiteralPath $old.PSPath -Recurse -Force -ErrorAction SilentlyContinue
    $count++
}

# Clean new English key
$newKeys = @(Get-ChildItem "HKCU:\Software\Classes" -Recurse -Depth 3 -ErrorAction SilentlyContinue | Where-Object { $_.PSPath -like "*EasyVRReduceSize" })
foreach ($entry in $newKeys) {
    Remove-Item -LiteralPath $entry.PSPath -Recurse -Force -ErrorAction SilentlyContinue
    $count++
}

Write-Host "Context menu removed from $count entries." -ForegroundColor Green
Write-Host "Uninstallation complete. Files remain in the folder for reinstall." -ForegroundColor Cyan
