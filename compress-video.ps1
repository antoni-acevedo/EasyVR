param([string]$FilePath)

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

if (-not (Test-Path $FilePath)) {
    [System.Windows.Forms.MessageBox]::Show("El archivo no existe.", "Error", "OK", "Error")
    exit 1
}

$ext = [System.IO.Path]::GetExtension($FilePath).ToLower()
$validExts = @('.mp4', '.mkv', '.avi', '.mov', '.webm', '.wmv', '.flv', '.m4v', '.ts', '.mts', '.3gp')
if ($ext -notin $validExts) {
    [System.Windows.Forms.MessageBox]::Show("Formato de video no soportado.`nSoportados: $($validExts -join ', ')", "Error", "OK", "Error")
    exit 1
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
# Buscar ffmpeg: primero en PATH, luego en carpeta local
$ffmpeg = (Get-Command ffmpeg.exe -ErrorAction SilentlyContinue).Source
$ffprobe = (Get-Command ffprobe.exe -ErrorAction SilentlyContinue).Source

if (-not $ffmpeg) {
    $ffmpeg = Join-Path $scriptDir "ffmpeg\ffmpeg.exe"
    $ffprobe = Join-Path $scriptDir "ffmpeg\ffprobe.exe"
}

if (-not (Test-Path $ffmpeg)) {
    [System.Windows.Forms.MessageBox]::Show("No se encontró FFmpeg. Ejecute install.ps1 primero.", "Error", "OK", "Error")
    exit 1
}

$form = New-Object System.Windows.Forms.Form
$form.Text = "EasyVR - Bajar peso de video"
$form.Size = New-Object System.Drawing.Size(360, 180)
$form.StartPosition = "CenterScreen"
$form.Topmost = $true
$form.FormBorderStyle = "FixedDialog"
$form.MaximizeBox = $false
$form.MinimizeBox = $false
$icoPath = Join-Path $scriptDir "EasyVR.ico"
if (Test-Path $icoPath) { $form.Icon = New-Object System.Drawing.Icon($icoPath) }

$lbl = New-Object System.Windows.Forms.Label
$lbl.Text = "Tamaño deseado (MB):"
$lbl.Location = New-Object System.Drawing.Point(20, 20)
$lbl.Size = New-Object System.Drawing.Size(310, 20)
$form.Controls.Add($lbl)

$txt = New-Object System.Windows.Forms.TextBox
$txt.Location = New-Object System.Drawing.Point(20, 48)
$txt.Size = New-Object System.Drawing.Size(310, 25)
$txt.Font = New-Object System.Drawing.Font("Segoe UI", 11)
$form.Controls.Add($txt)
$form.ActiveControl = $txt

$okBtn = New-Object System.Windows.Forms.Button
$okBtn.Text = "Comprimir"
$okBtn.Location = New-Object System.Drawing.Point(80, 95)
$okBtn.Size = New-Object System.Drawing.Size(90, 30)
$okBtn.Add_Click({ $form.Tag = $txt.Text; $form.Close() })
$form.AcceptButton = $okBtn
$form.Controls.Add($okBtn)

$cancelBtn = New-Object System.Windows.Forms.Button
$cancelBtn.Text = "Cancelar"
$cancelBtn.Location = New-Object System.Drawing.Point(190, 95)
$cancelBtn.Size = New-Object System.Drawing.Size(90, 30)
$cancelBtn.Add_Click({ $form.Tag = $null; $form.Close() })
$form.Controls.Add($cancelBtn)

$form.ShowDialog() | Out-Null
$targetMb = $form.Tag
if ([string]::IsNullOrEmpty($targetMb)) { exit 0 }

$targetMb = [double]::Parse($targetMb, [System.Globalization.CultureInfo]::InvariantCulture)
if ($targetMb -le 0) {
    [System.Windows.Forms.MessageBox]::Show("Ingrese un número positivo.", "Error", "OK", "Error")
    exit 1
}

Write-Host "Obteniendo duración del video..." -ForegroundColor Cyan
$durationStr = & $ffprobe -v error -show_entries format=duration -of csv=p=0 $FilePath
$duration = [double]::Parse($durationStr, [System.Globalization.CultureInfo]::InvariantCulture)

if ($duration -le 0) {
    [System.Windows.Forms.MessageBox]::Show("No se pudo leer la duración del video.", "Error", "OK", "Error")
    exit 1
}

$audioBitrate = 128
$totalBitrate = [math]::Round(($targetMb * 8192) / $duration)
$videoBitrate = $totalBitrate - $audioBitrate

if ($videoBitrate -lt 100) {
    $minMb = [math]::Round((($duration * 100) / 8192) + 1, 1)
    [System.Windows.Forms.MessageBox]::Show("El tamaño es muy pequeño para este video.`nMínimo recomendado: $minMb MB`nDuración: $([math]::Round($duration, 1)) seg", "Error", "OK", "Error")
    exit 1
}

$outName = [System.IO.Path]::GetFileNameWithoutExtension($FilePath) + "_comprimido.mp4"
$outDir = Split-Path -Parent $FilePath
$outPath = Join-Path $outDir $outName

Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host " Archivo: $(Split-Path -Leaf $FilePath)" -ForegroundColor Yellow
Write-Host " Duración: $([math]::Round($duration, 1)) seg" -ForegroundColor Yellow
Write-Host " Tamaño objetivo: $targetMb MB" -ForegroundColor Yellow
Write-Host " Bitrate video: $videoBitrate kbps" -ForegroundColor Yellow
Write-Host " Bitrate audio: $audioBitrate kbps" -ForegroundColor Yellow
Write-Host " Salida: $outName" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Yellow

$outTmp = [System.IO.Path]::GetDirectoryName($FilePath) + "\" + [System.IO.Path]::GetFileNameWithoutExtension($FilePath) + "_temp.mp4"
$currentBitrate = $videoBitrate

for ($pass = 1; $pass -le 2; $pass++) {
    Write-Host "Compresion $pass - Bitrate: ${currentBitrate}k" -ForegroundColor Green
    & $ffmpeg -y -i $FilePath -c:v libx264 -preset medium -b:v ${currentBitrate}k -c:a aac -b:a ${audioBitrate}k -movflags +faststart $outTmp
    if ($LASTEXITCODE -ne 0) {
        Remove-Item $outTmp -Force -ErrorAction SilentlyContinue
        [System.Windows.Forms.MessageBox]::Show("Error al comprimir.", "Error", "OK", "Error")
        exit 1
    }

    $actualMb = [math]::Round((Get-Item $outTmp).Length / 1MB, 2)
    $ratio = $targetMb / $actualMb

    if ($ratio -ge 0.90 -and $ratio -le 1.10) {
        Move-Item $outTmp $outPath -Force
        Write-Host "Tamaño logrado: $actualMb MB (target: $targetMb MB)" -ForegroundColor Cyan
        break
    }

    if ($pass -eq 1) {
        $currentBitrate = [math]::Max(100, [math]::Round($currentBitrate * $ratio))
        Write-Host "Ajustando: ${videoBitrate}k → ${currentBitrate}k (ratio: $([math]::Round($ratio, 2)))" -ForegroundColor Yellow
    } else {
        Move-Item $outTmp $outPath -Force
        Write-Host "Tamaño logrado después del ajuste: $actualMb MB" -ForegroundColor Cyan
    }
}

$origSize = (Get-Item $FilePath).Length
$newSize = (Get-Item $outPath).Length
$saved = [math]::Round(($origSize - $newSize) / 1MB, 1)
$origMb = [math]::Round($origSize / 1MB, 1)
$newMb = [math]::Round($newSize / 1MB, 1)

Write-Host "`n========================================" -ForegroundColor Green
Write-Host " COMPLETADO" -ForegroundColor Green
Write-Host " Original: $origMb MB" -ForegroundColor Gray
Write-Host " Comprimido: $newMb MB" -ForegroundColor Gray
Write-Host " Ahorrado: $saved MB" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Green

[System.Windows.Forms.MessageBox]::Show("Video comprimido exitosamente.`n`nOriginal: $origMb MB`nComprimido: $newMb MB`nAhorraste: $saved MB`n`n$outName", "Completado", "OK", "Information")
