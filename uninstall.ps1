$count = 0

# 1. Limpiar entradas bajo ProgIDs de WMP
$progIds = @("WMP11.AssocFile.MP4", "WMP11.AssocFile.MKV", "WMP11.AssocFile.AVI", "WMP11.AssocFile.MOV",
             "WMP11.AssocFile.WMV", "WMP11.AssocFile.3GP", "WMP11.AssocFile.TTS", "WMP11.AssocFile.M2TS")
foreach ($progId in $progIds) {
    $p = "HKCU:\Software\Classes\$progId\shell\BajarPesoVideo"
    if (Test-Path -LiteralPath $p) { Remove-Item -LiteralPath $p -Recurse -Force; $count++ }
}

# 2. Limpiar entradas bajo extensiones directas
foreach ($ext in @(".mp4", ".mkv", ".avi", ".mov", ".webm", ".wmv", ".flv", ".m4v", ".ts", ".mts", ".3gp")) {
    $p = "HKCU:\Software\Classes\$ext\shell\BajarPesoVideo"
    if (Test-Path -LiteralPath $p) { Remove-Item -LiteralPath $p -Recurse -Force; $count++ }
}

# 3. Limpiar entrada universal *
$p = "HKCU:\Software\Classes\*\shell\BajarPesoVideo"
if (Test-Path -LiteralPath $p) { Remove-Item -LiteralPath $p -Recurse -Force; $count++ }

Write-Host "Menú contextual eliminado de $count entradas." -ForegroundColor Green
Write-Host "Desinstalación completada. Los archivos quedan en la carpeta por si quieres reinstalar." -ForegroundColor Cyan
