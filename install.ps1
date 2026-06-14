$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# === FFmpeg ===
$localDir = Join-Path $scriptDir "ffmpeg"
$localExe = Join-Path $localDir "ffmpeg.exe"
$pathExe = (Get-Command ffmpeg.exe -ErrorAction SilentlyContinue).Source

if ($pathExe) {
    Write-Host "FFmpeg detectado en PATH: $pathExe" -ForegroundColor Green
    # Crear symlink o copiar a carpeta local para que el contexto menu funcione sin PATH
    if (-not (Test-Path $localExe)) {
        $ffBinDir = Split-Path -Parent $pathExe
        New-Item -ItemType Directory -Path $localDir -Force | Out-Null
        Copy-Item "$ffBinDir\*" $localDir -Force
        Write-Host "FFmpeg copiado a carpeta local." -ForegroundColor Green
    } else {
        Write-Host "FFmpeg local ya existe." -ForegroundColor Green
    }
} elseif (-not (Test-Path $localExe)) {
    Write-Host "Descargando FFmpeg..." -ForegroundColor Cyan
    $url = "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"
    $zip = Join-Path $env:TEMP "ffmpeg.zip"
    try {
        Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing -ErrorAction Stop
    } catch {
        Write-Host "Error descargando FFmpeg: $_" -ForegroundColor Red
        Write-Host "Descárgalo manualmente desde: $url" -ForegroundColor Yellow
        Write-Host "Extrae la carpeta 'bin' como '$localDir'" -ForegroundColor Yellow
        exit 1
    }

    Write-Host "Extrayendo FFmpeg..." -ForegroundColor Cyan
    $temp = Join-Path $env:TEMP "ffmpeg-extract"
    if (Test-Path $temp) { Remove-Item $temp -Recurse -Force }
    New-Item -ItemType Directory -Path $temp -Force | Out-Null
    Expand-Archive -Path $zip -DestinationPath $temp -Force
    $ffmpegZipDir = Get-ChildItem $temp -Directory | Select-Object -First 1
    New-Item -ItemType Directory -Path $localDir -Force | Out-Null
    Move-Item "$($ffmpegZipDir.FullName)\bin\*" $localDir -Force
    Remove-Item $zip -Force
    Remove-Item $temp -Recurse -Force
    Write-Host "FFmpeg descargado y extraído." -ForegroundColor Green
} else {
    Write-Host "FFmpeg local ya existe." -ForegroundColor Green
}

# === Menú contextual (HKCU — no requiere admin) ===
$scriptPath = Join-Path $scriptDir "compress-video.ps1"
$cmd = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`" `"%1`""
$icon = [System.IO.Path]::Combine($scriptDir, "EasyVR.ico")

function Add-MenuItem {
    param([string]$RegKey)
    $subPath = "Software\Classes\$RegKey\shell\BajarPesoVideo"
    $reg = [Microsoft.Win32.Registry]::CurrentUser.CreateSubKey($subPath)
    $reg.SetValue("", "EasyVR - Bajar peso de video...")
    $reg.SetValue("Icon", $icon)
    $reg.Close()
    $cmdReg = [Microsoft.Win32.Registry]::CurrentUser.CreateSubKey("$subPath\command")
    $cmdReg.SetValue("", $cmd)
    $cmdReg.Close()
}

$count = 0

# Registrar bajo cada ProgID específico (Windows busca el menú ahí)
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

# Extensiones sin ProgID: registrar bajo la extensión directamente
foreach ($ext in @(".webm", ".flv")) {
    Add-MenuItem $ext
    $count++
}

# Fallback universal para cualquier archivo
Add-MenuItem "*"
$count++

# Limpiar entradas viejas bajo extensiones que ahora usan ProgID
foreach ($ext in $progIds.Keys) {
    $oldPath = "HKCU:\Software\Classes\$ext\shell\BajarPesoVideo"
    if (Test-Path -LiteralPath $oldPath) { Remove-Item -LiteralPath $oldPath -Recurse -Force }
}

Write-Host "Menú contextual añadido para $count targets de video." -ForegroundColor Green
Write-Host "`nInstalación completada." -ForegroundColor Cyan
Write-Host "Haz clic derecho en cualquier video → 'EasyVR - Bajar peso de video...'" -ForegroundColor White
