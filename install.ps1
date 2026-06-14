$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# === FFmpeg ===
$localDir = Join-Path $scriptDir "ffmpeg"
$localExe = Join-Path $localDir "ffmpeg.exe"
$pathExe = (Get-Command ffmpeg.exe -ErrorAction SilentlyContinue).Source

if ($pathExe) {
    Write-Host "FFmpeg detected in PATH: $pathExe" -ForegroundColor Green
    if (-not (Test-Path $localExe)) {
        $ffBinDir = Split-Path -Parent $pathExe
        New-Item -ItemType Directory -Path $localDir -Force | Out-Null
        Copy-Item "$ffBinDir\*" $localDir -Force
        Write-Host "FFmpeg copied to local folder." -ForegroundColor Green
    } else {
        Write-Host "FFmpeg already local." -ForegroundColor Green
    }
} elseif (-not (Test-Path $localExe)) {
    Write-Host "Downloading FFmpeg..." -ForegroundColor Cyan
    $url = "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"
    $zip = Join-Path $env:TEMP "ffmpeg.zip"
    try {
        Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing -ErrorAction Stop
    } catch {
        Write-Host "Error downloading FFmpeg: $_" -ForegroundColor Red
        Write-Host "Download manually from: $url" -ForegroundColor Yellow
        Write-Host "Extract the 'bin' folder as '$localDir'" -ForegroundColor Yellow
        exit 1
    }

    Write-Host "Extracting FFmpeg..." -ForegroundColor Cyan
    $temp = Join-Path $env:TEMP "ffmpeg-extract"
    if (Test-Path $temp) { Remove-Item $temp -Recurse -Force }
    New-Item -ItemType Directory -Path $temp -Force | Out-Null
    Expand-Archive -Path $zip -DestinationPath $temp -Force
    $ffmpegZipDir = Get-ChildItem $temp -Directory | Select-Object -First 1
    New-Item -ItemType Directory -Path $localDir -Force | Out-Null
    Move-Item "$($ffmpegZipDir.FullName)\bin\*" $localDir -Force
    Remove-Item $zip -Force
    Remove-Item $temp -Recurse -Force
    Write-Host "FFmpeg downloaded and extracted." -ForegroundColor Green
} else {
    Write-Host "FFmpeg already local." -ForegroundColor Green
}

# === Context menu (HKCU - no admin required) ===
# Clean old Spanish key
$oldKeys = @(Get-ChildItem "HKCU:\Software\Classes" -Recurse -Depth 3 -ErrorAction SilentlyContinue | Where-Object { $_.PSPath -like "*BajarPesoVideo" })
foreach ($old in $oldKeys) {
    Remove-Item -LiteralPath $old.PSPath -Recurse -Force -ErrorAction SilentlyContinue
}

$scriptPath = Join-Path $scriptDir "compress-video.ps1"
$cmd = "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -STA -File `"$scriptPath`" `"%1`""
$icon = [System.IO.Path]::Combine($scriptDir, "EasyVR.ico")

function Add-MenuItem {
    param([string]$RegKey)
    $subPath = "Software\Classes\$RegKey\shell\EasyVRReduceSize"
    $reg = [Microsoft.Win32.Registry]::CurrentUser.CreateSubKey($subPath)
    $reg.SetValue("", "EasyVR - Reduce Video Size")
    $reg.SetValue("Icon", $icon)
    $reg.Close()
    $cmdReg = [Microsoft.Win32.Registry]::CurrentUser.CreateSubKey("$subPath\command")
    $cmdReg.SetValue("", $cmd)
    $cmdReg.Close()
}

$count = 0

$progIds = @{
    ".mp4"  = "WMP11.AssocFile.MP4"
    ".mkv"  = "WMP11.AssocFile.MKV"
    ".avi"  = "WMP11.AssocFile.AVI"
    ".mov"  = "WMP11.AssocFile.MOV"
    ".wmv"  = "WMP11.AssocFile.WMV"
    ".m4v"  = "WMP11.AssocFile.MP4"
    ".ts"   = "WMP11.AssocFile.TTS"
    ".mts"  = "WMP11.AssocFile.M2TS"
    ".3gp"  = "WMP11.AssocFile.3GP"
}

foreach ($kvp in $progIds.GetEnumerator()) {
    Add-MenuItem $kvp.Value
    $count++
}

foreach ($ext in @(".webm", ".flv")) {
    Add-MenuItem $ext
    $count++
}

Add-MenuItem "*"
$count++

Write-Host "Context menu added for $count video targets." -ForegroundColor Green
Write-Host "`nInstallation complete." -ForegroundColor Cyan
Write-Host "Right-click any video -> 'EasyVR - Reduce Video Size'" -ForegroundColor White
