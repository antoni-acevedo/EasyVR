param([string]$InstallPath = "")

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# === FFmpeg ===
$localDir = if ($InstallPath) { Join-Path $InstallPath "ffmpeg" } else { Join-Path $scriptDir "ffmpeg" }
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

if ($InstallPath) {
    $scriptPath = Join-Path $InstallPath "launcher.bat"
    $icon = Join-Path $InstallPath "EasyVR.ico"
    $ffmpegDir = Join-Path $InstallPath "ffmpeg"
} else {
    $scriptPath = Join-Path $scriptDir "electron\launcher.bat"
    $icon = Join-Path $scriptDir "EasyVR.ico"
    $ffmpegDir = Join-Path $scriptDir "ffmpeg"
}
$cmdSingle = "`"$scriptPath`" `"%1`""
$cmdMulti = "`"$scriptPath`" %*"

function Add-MenuItem {
    param([string]$RegKey, [string]$MenuName, [string]$DisplayName, [string]$Command)
    $subPath = "Software\Classes\$RegKey\shell\$MenuName"
    $reg = [Microsoft.Win32.Registry]::CurrentUser.CreateSubKey($subPath)
    $reg.SetValue("", $DisplayName)
    $reg.SetValue("Icon", $icon)
    $reg.Close()
    $cmdReg = [Microsoft.Win32.Registry]::CurrentUser.CreateSubKey("$subPath\command")
    $cmdReg.SetValue("", $Command)
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
    Add-MenuItem $kvp.Value "EasyVRReduceSize" "EasyVR - Reduce Video Size" $cmdSingle
    Add-MenuItem $kvp.Value "EasyVRReduceAllSelected" "EasyVR - Reduce All Selected" $cmdMulti
    $count += 2
}

foreach ($ext in @(".webm", ".flv")) {
    Add-MenuItem $ext "EasyVRReduceSize" "EasyVR - Reduce Video Size" $cmdSingle
    Add-MenuItem $ext "EasyVRReduceAllSelected" "EasyVR - Reduce All Selected" $cmdMulti
    $count += 2
}

Add-MenuItem "*" "EasyVRReduceSize" "EasyVR - Reduce Video Size" $cmdSingle
Add-MenuItem "*" "EasyVRReduceAllSelected" "EasyVR - Reduce All Selected" $cmdMulti
$count += 2

Write-Host "Context menu added for $count menu entries." -ForegroundColor Green
Write-Host "`nInstallation complete." -ForegroundColor Cyan
Write-Host "Right-click 1 video -> 'EasyVR - Reduce Video Size'" -ForegroundColor White
Write-Host "Right-click N videos -> 'EasyVR - Reduce All Selected'" -ForegroundColor White
