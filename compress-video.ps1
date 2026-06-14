param([string]$FilePath)

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

if (-not (Test-Path $FilePath)) {
    [System.Windows.Forms.MessageBox]::Show("File not found.", "Error", "OK", "Error")
    exit 1
}

$ext = [System.IO.Path]::GetExtension($FilePath).ToLower()
$validExts = @('.mp4', '.mkv', '.avi', '.mov', '.webm', '.wmv', '.flv', '.m4v', '.ts', '.mts', '.3gp')
if ($ext -notin $validExts) {
    [System.Windows.Forms.MessageBox]::Show("Unsupported video format.`nSupported: $($validExts -join ', ')", "Error", "OK", "Error")
    exit 1
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ffmpeg = (Get-Command ffmpeg.exe -ErrorAction SilentlyContinue).Source
$ffprobe = (Get-Command ffprobe.exe -ErrorAction SilentlyContinue).Source

if (-not $ffmpeg) {
    $ffmpeg = Join-Path $scriptDir "ffmpeg\ffmpeg.exe"
    $ffprobe = Join-Path $scriptDir "ffmpeg\ffprobe.exe"
}

if (-not (Test-Path $ffmpeg)) {
    [System.Windows.Forms.MessageBox]::Show("FFmpeg not found. Run install.ps1 first.", "Error", "OK", "Error")
    exit 1
}

$form = New-Object System.Windows.Forms.Form
$form.Text = "EasyVR - Reduce Video Size"
$form.Size = New-Object System.Drawing.Size(360, 180)
$form.StartPosition = "CenterScreen"
$form.Topmost = $true
$form.FormBorderStyle = "FixedDialog"
$form.MaximizeBox = $false
$form.MinimizeBox = $false
$icoPath = Join-Path $scriptDir "EasyVR.ico"
if (Test-Path $icoPath) { $form.Icon = New-Object System.Drawing.Icon($icoPath) }

$lbl = New-Object System.Windows.Forms.Label
$lbl.Text = "Target size (MB):"
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
$okBtn.Text = "Compress"
$okBtn.Location = New-Object System.Drawing.Point(80, 95)
$okBtn.Size = New-Object System.Drawing.Size(90, 30)
$okBtn.Add_Click({ $form.Tag = $txt.Text; $form.Close() })
$form.AcceptButton = $okBtn
$form.Controls.Add($okBtn)

$cancelBtn = New-Object System.Windows.Forms.Button
$cancelBtn.Text = "Cancel"
$cancelBtn.Location = New-Object System.Drawing.Point(190, 95)
$cancelBtn.Size = New-Object System.Drawing.Size(90, 30)
$cancelBtn.Add_Click({ $form.Tag = $null; $form.Close() })
$form.Controls.Add($cancelBtn)

$form.ShowDialog() | Out-Null
$targetMb = $form.Tag
if ([string]::IsNullOrEmpty($targetMb)) { exit 0 }

$targetMb = [double]::Parse($targetMb, [System.Globalization.CultureInfo]::InvariantCulture)
if ($targetMb -le 0) {
    [System.Windows.Forms.MessageBox]::Show("Enter a positive number.", "Error", "OK", "Error")
    exit 1
}

Write-Host "Getting video duration..." -ForegroundColor Cyan
$durationStr = & $ffprobe -v error -show_entries format=duration -of csv=p=0 $FilePath
$duration = [double]::Parse($durationStr, [System.Globalization.CultureInfo]::InvariantCulture)

if ($duration -le 0) {
    [System.Windows.Forms.MessageBox]::Show("Could not read video duration.", "Error", "OK", "Error")
    exit 1
}

$audioBitrate = 128
$totalBitrate = [math]::Round(($targetMb * 8192) / $duration)
$videoBitrate = $totalBitrate - $audioBitrate

if ($videoBitrate -lt 100) {
    $minMb = [math]::Round((($duration * 100) / 8192) + 1, 1)
    [System.Windows.Forms.MessageBox]::Show("Size too small for this video.`nMinimum recommended: $minMb MB`nDuration: $([math]::Round($duration, 1)) sec", "Error", "OK", "Error")
    exit 1
}

$outName = [System.IO.Path]::GetFileNameWithoutExtension($FilePath) + "_compressed.mp4"
$outDir = Split-Path -Parent $FilePath
$outPath = Join-Path $outDir $outName

Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host " File: $(Split-Path -Leaf $FilePath)" -ForegroundColor Yellow
Write-Host " Duration: $([math]::Round($duration, 1)) sec" -ForegroundColor Yellow
Write-Host " Target size: $targetMb MB" -ForegroundColor Yellow
Write-Host " Video bitrate: $videoBitrate kbps" -ForegroundColor Yellow
Write-Host " Audio bitrate: $audioBitrate kbps" -ForegroundColor Yellow
Write-Host " Output: $outName" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Yellow

$outTmp = [System.IO.Path]::GetDirectoryName($FilePath) + "\" + [System.IO.Path]::GetFileNameWithoutExtension($FilePath) + "_temp.mp4"
$currentBitrate = $videoBitrate

for ($pass = 1; $pass -le 2; $pass++) {
    Write-Host "Attempt $pass - Bitrate: ${currentBitrate}k" -ForegroundColor Green
    & $ffmpeg -y -i $FilePath -c:v libx264 -preset medium -b:v ${currentBitrate}k -c:a aac -b:a ${audioBitrate}k -movflags +faststart $outTmp
    if ($LASTEXITCODE -ne 0) {
        Remove-Item $outTmp -Force -ErrorAction SilentlyContinue
        [System.Windows.Forms.MessageBox]::Show("Compression error.", "Error", "OK", "Error")
        exit 1
    }

    $actualMb = [math]::Round((Get-Item $outTmp).Length / 1MB, 2)
    $ratio = $targetMb / $actualMb

    if ($ratio -ge 0.90 -and $ratio -le 1.10) {
        Move-Item $outTmp $outPath -Force
        Write-Host "Actual size: $actualMb MB (target: $targetMb MB)" -ForegroundColor Cyan
        break
    }

    if ($pass -eq 1) {
        $currentBitrate = [math]::Max(100, [math]::Round($currentBitrate * $ratio))
        Write-Host "Adjusting: ${videoBitrate}k -> ${currentBitrate}k (ratio: $([math]::Round($ratio, 2)))" -ForegroundColor Yellow
    } else {
        Move-Item $outTmp $outPath -Force
        Write-Host "Final size after adjustment: $actualMb MB" -ForegroundColor Cyan
    }
}

$origSize = (Get-Item $FilePath).Length
$newSize = (Get-Item $outPath).Length
$saved = [math]::Round(($origSize - $newSize) / 1MB, 1)
$origMb = [math]::Round($origSize / 1MB, 1)
$newMb = [math]::Round($newSize / 1MB, 1)

Write-Host "`n========================================" -ForegroundColor Green
Write-Host " COMPLETED" -ForegroundColor Green
Write-Host " Original: $origMb MB" -ForegroundColor Gray
Write-Host " Compressed: $newMb MB" -ForegroundColor Gray
Write-Host " Saved: $saved MB" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Green

[System.Windows.Forms.MessageBox]::Show("Video compressed successfully.`n`nOriginal: $origMb MB`nCompressed: $newMb MB`nSaved: $saved MB`n`n$outName", "Done", "OK", "Information")
