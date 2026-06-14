# EasyVR (Video Resizer)

Comprime videos desde el menú contextual de Windows. Seleccionás el archivo, elegís el peso deseado en MB, y lo comprime automáticamente con dos pasadas iterativas para acercarse al tamaño objetivo.

## Instalación

```powershell
.\install.ps1
```

El instalador:
1. Copia FFmpeg a la carpeta local (o lo descarga si no está en PATH)
2. Registra la entrada **"EasyVR - Bajar peso de video..."** en el menú contextual para `.mp4`, `.mkv`, `.avi`, `.mov`, `.webm`, `.wmv`, `.flv` y más

## Uso

1. Click derecho al video → **"EasyVR - Bajar peso de video..."**
2. Ingresá el tamaño deseado en MB
3. La consola muestra el progreso de la compresión
4. Al terminar, se guarda `video_comprimido.mp4` junto al original

## Desinstalación

```powershell
.\uninstall.ps1
```

## Cómo funciona

- Calcula el bitrate a partir del tamaño objetivo y la duración del video
- Primera pasada con x264 + el bitrate calculado
- Verifica el tamaño resultante: si difiere >10% del objetivo, ajusta el bitrate proporcionalmente y re-comprime
- El archivo final usa H.264 (compatible con todos los reproductores)

## Requisitos

- Windows 10/11
- PowerShell 5.1+
