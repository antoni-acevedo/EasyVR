# EasyVR (Video Resizer)

![EasyVR Logo](logo.png)

Compress videos from the Windows right-click context menu. Select a file, enter the target size in MB, and it compresses automatically with two iterative passes to hit the target size.

## Installation

```powershell
.\install.ps1
```

The installer:
1. Copies FFmpeg to the local folder (or downloads it if not in PATH)
2. Registers **"EasyVR - Reduce Video Size"** in the right-click menu for `.mp4`, `.mkv`, `.avi`, `.mov`, `.webm`, `.wmv`, `.flv` and more

## Usage

1. Right-click a video -> **"EasyVR - Reduce Video Size"**
2. Enter the target size in MB
3. The console shows compression progress
4. When done, `video_compressed.mp4` is saved next to the original

## Uninstall

```powershell
.\uninstall.ps1
```

## How it works

- Calculates bitrate from target size and video duration
- First pass with x264 at the calculated bitrate
- Checks the output size: if >10% off from target, adjusts bitrate proportionally and re-compresses
- Final output uses H.264 (compatible with all players)

## Requirements

- Windows 10/11
- PowerShell 5.1+
