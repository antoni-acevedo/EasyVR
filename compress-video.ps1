param([string]$FilePath)

Add-Type -AssemblyName PresentationFramework, PresentationCore, WindowsBase
Add-Type -AssemblyName System.Windows.Forms, System.Drawing

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

$logFile = "$env:TEMP\easyvr.log"
$durationStr = & $ffprobe -v error -show_entries format=duration -of csv=p=0 $FilePath 2>$null
$infoStr = & $ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate -of csv=p=0 $FilePath 2>$null

$duration = [double]::Parse($durationStr, [System.Globalization.CultureInfo]::InvariantCulture)
$infoParts = $infoStr -split ','
$origW = [int]$infoParts[0]
$origH = [int]$infoParts[1]
$fpsParts = $infoParts[2] -split '/'
$origFps = [math]::Round([double]$fpsParts[0] / [double]$fpsParts[1])
$fileSizeMb = [math]::Round((Get-Item $FilePath).Length / 1MB, 1)

if ($duration -le 0) {
    [System.Windows.Forms.MessageBox]::Show("Could not read video duration.", "Error", "OK", "Error")
    exit 1
}

$outNameBase = [System.IO.Path]::GetFileNameWithoutExtension($FilePath)

$xaml = @"
<Window xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="EasyVR - Reduce Video Size" Width="460" Height="500" MinWidth="440" MinHeight="460"
        SizeToContent="Height" WindowStartupLocation="CenterScreen" Topmost="True"
        FontFamily="Segoe UI Variable, Segoe UI" Background="#F0EFEF"
        UseLayoutRounding="True" SnapsToDevicePixels="True" ResizeMode="CanResize">
    <Window.Resources>
        <Style TargetType="TextBox" x:Key="InputBox">
            <Setter Property="Height" Value="36"/><Setter Property="FontSize" Value="14"/>
            <Setter Property="Padding" Value="10,4"/><Setter Property="BorderBrush" Value="#D0D0D0"/>
            <Setter Property="BorderThickness" Value="1"/><Setter Property="Background" Value="White"/>
            <Setter Property="TextAlignment" Value="Left"/>
        </Style>
        <Style TargetType="ComboBox">
            <Setter Property="Height" Value="34"/><Setter Property="FontSize" Value="13"/>
            <Setter Property="Padding" Value="8,3"/><Setter Property="Background" Value="White"/>
        </Style>
        <Style TargetType="ProgressBar">
            <Setter Property="Height" Value="6"/><Setter Property="Foreground" Value="#6C5CE7"/>
            <Setter Property="Background" Value="#E8E8E8"/><Setter Property="BorderThickness" Value="0"/>
            <Setter Property="Minimum" Value="0"/><Setter Property="Maximum" Value="100"/>
        </Style>
    </Window.Resources>
    <Border Background="White" CornerRadius="10" Margin="14">
        <Border.Effect>
            <DropShadowEffect BlurRadius="20" ShadowDepth="0" Color="#40000000" Opacity="0.12"/>
        </Border.Effect>
        <Grid Margin="24,20,24,20">
            <Grid.RowDefinitions>
                <RowDefinition Height="Auto"/><RowDefinition Height="Auto"/>
                <RowDefinition Height="Auto"/><RowDefinition Height="Auto"/>
                <RowDefinition Height="Auto"/><RowDefinition Height="Auto"/>
                <RowDefinition Height="Auto"/><RowDefinition Height="Auto"/>
            </Grid.RowDefinitions>
            <Grid Grid.Row="0" Margin="0,0,0,18">
                <Grid.ColumnDefinitions>
                    <ColumnDefinition Width="Auto"/><ColumnDefinition Width="*"/><ColumnDefinition Width="Auto"/>
                </Grid.ColumnDefinitions>
                <Border Grid.Column="0" Width="38" Height="38" CornerRadius="9" Background="#6C5CE7">
                    <TextBlock Text="E" FontSize="22" FontWeight="Bold" Foreground="White"
                               HorizontalAlignment="Center" VerticalAlignment="Center"/>
                </Border>
                <StackPanel Grid.Column="1" Margin="12,0,0,0" VerticalAlignment="Center">
                    <TextBlock Text="EasyVR" FontSize="19" FontWeight="Bold" Foreground="#1A1A1A"/>
                    <TextBlock Text="Video Resizer" FontSize="11" Foreground="#999" Margin="0,-3,0,0"/>
                </StackPanel>
                <Border Grid.Column="2" Background="#F0EEFF" CornerRadius="6" Padding="8,4" VerticalAlignment="Center">
                    <TextBlock Text="$fileSizeMb MB" FontSize="11" FontWeight="SemiBold" Foreground="#6C5CE7"/>
                </Border>
            </Grid>
            <Grid Grid.Row="1" Margin="0,0,0,14">
                <Grid.ColumnDefinitions>
                    <ColumnDefinition Width="*"/><ColumnDefinition Width="8"/><ColumnDefinition Width="*"/><ColumnDefinition Width="8"/><ColumnDefinition Width="*"/>
                </Grid.ColumnDefinitions>
                <Border Grid.Column="0" x:Name="TabFixed" Background="#6C5CE7" CornerRadius="6" Padding="0,9" Cursor="Hand">
                    <TextBlock Text="Fixed Size" FontSize="12" FontWeight="SemiBold" Foreground="White" HorizontalAlignment="Center"/>
                </Border>
                <Border Grid.Column="2" x:Name="TabPercent" Background="#F0F0F0" CornerRadius="6" Padding="0,9" Cursor="Hand">
                    <TextBlock Text="Percent" FontSize="12" FontWeight="SemiBold" Foreground="#666" HorizontalAlignment="Center"/>
                </Border>
                <Border Grid.Column="4" x:Name="TabCRF" Background="#F0F0F0" CornerRadius="6" Padding="0,9" Cursor="Hand">
                    <TextBlock Text="Quality" FontSize="12" FontWeight="SemiBold" Foreground="#666" HorizontalAlignment="Center"/>
                </Border>
            </Grid>
            <StackPanel Grid.Row="2" x:Name="FixedPanel" Margin="0,0,0,0">
                <TextBlock Text="Target size" FontSize="11" FontWeight="SemiBold" Foreground="#888" Margin="0,0,0,5"/>
                <Grid>
                    <Grid.ColumnDefinitions><ColumnDefinition Width="*"/><ColumnDefinition Width="Auto"/></Grid.ColumnDefinitions>
                    <TextBox Grid.Column="0" x:Name="SizeText" Style="{StaticResource InputBox}" Text="8" MaxLength="30"/>
                    <Border Grid.Column="1" Background="#F4F4F4" CornerRadius="0,5,5,0" Height="36" Width="56" Margin="-1,0,0,0">
                        <TextBlock Text="MB" FontSize="13" Foreground="#888" VerticalAlignment="Center" HorizontalAlignment="Center"/>
                    </Border>
                </Grid>
            </StackPanel>
            <StackPanel Grid.Row="2" x:Name="PercentPanel" Visibility="Collapsed" Margin="0,0,0,0">
                <TextBlock Text="Compression ratio" FontSize="11" FontWeight="SemiBold" Foreground="#888" Margin="0,0,0,5"/>
                <Slider x:Name="PercentSlider" Minimum="10" Maximum="90" Value="50" TickFrequency="5" IsSnapToTickEnabled="True" Height="28" Foreground="#6C5CE7" Margin="0,2,0,0"/>
                <Grid Margin="0,0,0,4"><Grid.ColumnDefinitions><ColumnDefinition Width="*"/><ColumnDefinition Width="Auto"/></Grid.ColumnDefinitions>
                    <TextBlock Grid.Column="0" Text="10%" FontSize="11" Foreground="#AAA"/>
                    <TextBlock Grid.Column="1" Text="90%" FontSize="11" Foreground="#AAA"/>
                </Grid>
                <TextBlock x:Name="PercentValue" Text="50 %" FontSize="13" FontWeight="SemiBold" Foreground="#6C5CE7" HorizontalAlignment="Center"/>
            </StackPanel>
            <StackPanel Grid.Row="2" x:Name="CRFPanel" Visibility="Collapsed" Margin="0,0,0,0">
                <TextBlock Text="Quality (CRF)" FontSize="11" FontWeight="SemiBold" Foreground="#888" Margin="0,0,0,2"/>
                <TextBlock Text="18 = best quality / 28 = smallest file" FontSize="10" Foreground="#AAA" Margin="0,0,0,4"/>
                <Slider x:Name="CRFSlider" Minimum="18" Maximum="28" Value="23" TickFrequency="1" IsSnapToTickEnabled="True" Height="28" Foreground="#6C5CE7" Margin="0,2,0,0"/>
                <Grid Margin="0,0,0,4"><Grid.ColumnDefinitions><ColumnDefinition Width="*"/><ColumnDefinition Width="Auto"/></Grid.ColumnDefinitions>
                    <TextBlock Grid.Column="0" Text="Best" FontSize="11" Foreground="#AAA"/>
                    <TextBlock Grid.Column="1" Text="Smaller" FontSize="11" Foreground="#AAA"/>
                </Grid>
                <TextBlock x:Name="CRFValue" Text="CRF 23" FontSize="13" FontWeight="SemiBold" Foreground="#6C5CE7" HorizontalAlignment="Center"/>
            </StackPanel>
            <Expander Grid.Row="3" Header="ADVANCED" FontSize="11" FontWeight="SemiBold" Foreground="#888" Margin="0,12,0,0" ExpandDirection="Down">
                <Border Background="#F8F7FC" CornerRadius="8" Padding="14,12" Margin="0,10,0,0">
                    <Grid>
                        <Grid.RowDefinitions><RowDefinition Height="Auto"/><RowDefinition Height="Auto"/><RowDefinition Height="Auto"/></Grid.RowDefinitions>
                        <Grid.ColumnDefinitions><ColumnDefinition Width="*"/><ColumnDefinition Width="12"/><ColumnDefinition Width="*"/></Grid.ColumnDefinitions>
                        <StackPanel Grid.Row="0" Grid.Column="0">
                            <TextBlock Text="RESOLUTION" FontSize="9" FontWeight="Bold" Foreground="#888" Margin="0,0,0,3"/>
                            <ComboBox x:Name="ResCombo">
                                <ComboBoxItem IsSelected="True" Tag="orig">Original (${origW}x${origH})</ComboBoxItem>
                                <ComboBoxItem Tag="4k">4K (3840x2160)</ComboBoxItem>
                                <ComboBoxItem Tag="1440p">1440p (2560x1440)</ComboBoxItem>
                                <ComboBoxItem Tag="1080p">1080p (1920x1080)</ComboBoxItem>
                                <ComboBoxItem Tag="720p">720p (1280x720)</ComboBoxItem>
                                <ComboBoxItem Tag="480p">480p (854x480)</ComboBoxItem>
                                <ComboBoxItem Tag="360p">360p (640x360)</ComboBoxItem>
                            </ComboBox>
                        </StackPanel>
                        <StackPanel Grid.Row="0" Grid.Column="2">
                            <TextBlock Text="FPS" FontSize="9" FontWeight="Bold" Foreground="#888" Margin="0,0,0,3"/>
                            <ComboBox x:Name="FPSCombo">
                                <ComboBoxItem IsSelected="True" Tag="orig">Original ($origFps)</ComboBoxItem>
                                <ComboBoxItem Tag="60">60</ComboBoxItem>
                                <ComboBoxItem Tag="30">30</ComboBoxItem>
                                <ComboBoxItem Tag="24">24</ComboBoxItem>
                                <ComboBoxItem Tag="15">15</ComboBoxItem>
                                <ComboBoxItem Tag="10">10</ComboBoxItem>
                            </ComboBox>
                        </StackPanel>
                        <StackPanel Grid.Row="1" Grid.Column="0" Margin="0,10,0,0">
                            <TextBlock Text="CODEC" FontSize="9" FontWeight="Bold" Foreground="#888" Margin="0,0,0,3"/>
                            <ComboBox x:Name="CodecCombo">
                                <ComboBoxItem IsSelected="True" Tag="h264">H.264 (x264)</ComboBoxItem>
                                <ComboBoxItem Tag="h265">H.265 (x265)</ComboBoxItem>
                            </ComboBox>
                        </StackPanel>
                        <StackPanel Grid.Row="1" Grid.Column="2" Margin="0,10,0,0">
                            <TextBlock Text="PRESET" FontSize="9" FontWeight="Bold" Foreground="#888" Margin="0,0,0,3"/>
                            <ComboBox x:Name="PresetCombo">
                                <ComboBoxItem Tag="fast">Fast</ComboBoxItem>
                                <ComboBoxItem IsSelected="True" Tag="medium">Medium</ComboBoxItem>
                                <ComboBoxItem Tag="slow">Slow</ComboBoxItem>
                            </ComboBox>
                        </StackPanel>
                        <StackPanel Grid.Row="2" Grid.Column="0" Margin="0,10,0,0">
                            <TextBlock Text="AUDIO" FontSize="9" FontWeight="Bold" Foreground="#888" Margin="0,0,0,3"/>
                            <ComboBox x:Name="AudioCombo">
                                <ComboBoxItem IsSelected="True" Tag="keep">Keep original</ComboBoxItem>
                                <ComboBoxItem Tag="reencode">Re-encode (AAC 128k)</ComboBoxItem>
                                <ComboBoxItem Tag="remove">Remove audio</ComboBoxItem>
                            </ComboBox>
                        </StackPanel>
                        <StackPanel Grid.Row="2" Grid.Column="2" Margin="0,10,0,0">
                            <TextBlock Text="OUTPUT" FontSize="9" FontWeight="Bold" Foreground="#888" Margin="0,0,0,3"/>
                            <ComboBox x:Name="FormatCombo">
                                <ComboBoxItem IsSelected="True" Tag="mp4">MP4</ComboBoxItem>
                                <ComboBoxItem Tag="mkv">MKV</ComboBoxItem>
                                <ComboBoxItem Tag="webm">WebM</ComboBoxItem>
                            </ComboBox>
                        </StackPanel>
                    </Grid>
                </Border>
            </Expander>
            <Border Grid.Row="4" x:Name="CompressBtn" Background="#6C5CE7" CornerRadius="8" Height="46" Margin="0,16,0,0" Cursor="Hand">
                <Border.Style>
                    <Style TargetType="Border">
                        <Style.Triggers>
                            <Trigger Property="IsMouseOver" Value="True"><Setter Property="Opacity" Value="0.88"/></Trigger>
                        </Style.Triggers>
                    </Style>
                </Border.Style>
                <Grid>
                    <TextBlock x:Name="BtnText" Text="COMPRESS VIDEO" FontSize="15" FontWeight="SemiBold" Foreground="White" HorizontalAlignment="Center" VerticalAlignment="Center"/>
                    <TextBlock x:Name="BtnLoader" Text="" FontSize="15" FontWeight="SemiBold" Foreground="White" HorizontalAlignment="Center" VerticalAlignment="Center" Visibility="Collapsed"/>
                </Grid>
            </Border>
            <StackPanel Grid.Row="5" x:Name="ProgressPanel" Visibility="Collapsed" Margin="0,14,0,0">
                <ProgressBar x:Name="ProgressBar" Value="0"/>
                <Grid Margin="0,8,0,0"><Grid.ColumnDefinitions><ColumnDefinition Width="*"/><ColumnDefinition Width="Auto"/></Grid.ColumnDefinitions>
                    <TextBlock Grid.Column="0" x:Name="StatusText" Text="Starting..." FontSize="12" Foreground="#666"/>
                    <TextBlock Grid.Column="1" x:Name="PctText" Text="0%" FontSize="12" FontWeight="SemiBold" Foreground="#6C5CE7"/>
                </Grid>
                <Border Background="#1E1E2E" CornerRadius="6" Padding="8" Margin="0,8,0,0" MaxHeight="120">
                    <ScrollViewer VerticalScrollBarVisibility="Auto" HorizontalScrollBarVisibility="Auto">
                        <TextBlock x:Name="ConsoleLog" Text="" FontFamily="Cascadia Code, Consolas" FontSize="10" Foreground="#CDD6F4"/>
                    </ScrollViewer>
                </Border>
            </StackPanel>
        </Grid>
    </Border>
</Window>
"@

$reader = [System.Xml.XmlReader]::Create([System.IO.StringReader]::new($xaml))
$window = [System.Windows.Markup.XamlReader]::Load($reader)

$TabFixed = $window.FindName("TabFixed")
$TabPercent = $window.FindName("TabPercent")
$TabCRF = $window.FindName("TabCRF")
$fixedPanel = $window.FindName("FixedPanel")
$percentPanel = $window.FindName("PercentPanel")
$crfPanel = $window.FindName("CRFPanel")
$sizeText = $window.FindName("SizeText")
$percentSlider = $window.FindName("PercentSlider")
$percentValue = $window.FindName("PercentValue")
$crfSlider = $window.FindName("CRFSlider")
$crfValue = $window.FindName("CRFValue")
$resCombo = $window.FindName("ResCombo")
$fpsCombo = $window.FindName("FPSCombo")
$codecCombo = $window.FindName("CodecCombo")
$presetCombo = $window.FindName("PresetCombo")
$audioCombo = $window.FindName("AudioCombo")
$formatCombo = $window.FindName("FormatCombo")
$CompressBtn = $window.FindName("CompressBtn")
$BtnText = $window.FindName("BtnText")
$BtnLoader = $window.FindName("BtnLoader")
$progressPanel = $window.FindName("ProgressPanel")
$progressBar = $window.FindName("ProgressBar")
$statusText = $window.FindName("StatusText")
$pctText = $window.FindName("PctText")
$consoleLog = $window.FindName("ConsoleLog")

function Write-Log {
    param([string]$msg)
    $consoleLog.Text += "[$(Get-Date -Format HH:mm:ss)] $msg`n"
}

function Reset-UI {
    $CompressBtn.IsEnabled = $true
    $BtnLoader.Visibility = [System.Windows.Visibility]::Collapsed
    $BtnText.Visibility = [System.Windows.Visibility]::Visible
    $progressPanel.Visibility = [System.Windows.Visibility]::Collapsed
}

$script:activeMode = "fixed"

function Select-Tab {
    param([string]$mode)
    $tabs = @($TabFixed, $TabPercent, $TabCRF)
    $panels = @($fixedPanel, $percentPanel, $crfPanel)
    $modes = @("fixed","percent","crf")
    for ($i = 0; $i -lt 3; $i++) {
        $sel = ($mode -eq $modes[$i])
        $tabs[$i].Background = if ($sel) { "#6C5CE7" } else { "#F0F0F0" }
        ($tabs[$i].Child).Foreground = if ($sel) { "White" } else { "#666" }
        $panels[$i].Visibility = if ($sel) { [System.Windows.Visibility]::Visible } else { [System.Windows.Visibility]::Collapsed }
    }
    if ($mode) { $script:activeMode = $mode }
}

function Get-ActiveMode {
    return $script:activeMode
}
$TabFixed.Add_MouseDown({ Select-Tab "fixed" })
$TabPercent.Add_MouseDown({ Select-Tab "percent" })
$TabCRF.Add_MouseDown({ Select-Tab "crf" })

$percentSlider.Add_ValueChanged({ $percentValue.Text = "$([int]$percentSlider.Value) %" })
$crfSlider.Add_ValueChanged({ $crfValue.Text = "CRF $( [int]$crfSlider.Value )" })

$global:ffDone = $false
$global:totalFrames = 0
$global:ffResult = @{ success = $false; error = ""; exitCode = -1 }
$global:ffLogFile = $logFile
$global:ffProgressFile = "$env:TEMP\easyvr_progress.txt"
$global:lastPct = -1

function Run-FFmpeg {
    param([array]$argsList, [scriptblock]$callback)
    Remove-Item $global:ffLogFile -Force -ErrorAction SilentlyContinue
    $global:ffResult = @{ success = $false; error = ""; exitCode = -1 }
    $global:lastPct = -1
    $global:totalFrames = [math]::Round($duration * ($origFps - 0.1))

    $proc = New-Object System.Diagnostics.Process
    $proc.StartInfo.FileName = $ffmpeg
    $proc.StartInfo.Arguments = $argsList -join ' '
    $proc.StartInfo.UseShellExecute = $false
    $proc.StartInfo.CreateNoWindow = $true
    $proc.StartInfo.RedirectStandardOutput = $true
    $proc.StartInfo.RedirectStandardError = $true
    $proc.StartInfo.StandardOutputEncoding = [System.Text.Encoding]::UTF8

    $script:lastFrame = 0
    $script:stderrLines = [System.Collections.ArrayList]@()

    $proc.Add_OutputDataReceived({
        $line = $_.Data
        if (-not $line) { return }
        if ($line -match '^frame=(\d+)') { $script:lastFrame = [int]$matches[1] }
        if ($line -match '^progress=' -and $script:lastFrame -gt 0) {
            $pct = [math]::Min(99, [math]::Round($script:lastFrame / [math]::Max(1, $global:totalFrames) * 100))
            if ($pct -ne $global:lastPct) {
                $global:lastPct = $pct
                $window.Dispatcher.Invoke([Action]{ $progressBar.Value = $pct; $pctText.Text = "$pct%" }, [System.Windows.Threading.DispatcherPriority]::Send)
            }
            $script:lastFrame = 0
        }
    })

    $proc.Add_ErrorDataReceived({
        $line = $_.Data
        if ($line) { $null = $script:stderrLines.Add($line) }
    })

    $proc.Start() | Out-Null
    $proc.BeginOutputReadLine()
    $proc.BeginErrorReadLine()

    $frame = New-Object System.Windows.Threading.DispatcherFrame
    $waitTimer = New-Object System.Windows.Threading.DispatcherTimer
    $waitTimer.Interval = [TimeSpan]::FromMilliseconds(200)
    $waitTimer.Add_Tick({
        if ($proc.HasExited) {
            $waitTimer.Stop()
            $frame.Continue = $false
        }
    })
    $waitTimer.Start()
    [System.Windows.Threading.Dispatcher]::PushFrame($frame)

    [System.IO.File]::WriteAllText($global:ffLogFile, ($script:stderrLines -join "`n"))
    $exitCode = $proc.ExitCode
    $proc.Close()

    $global:ffResult.exitCode = $exitCode
    $global:ffResult.success = ($exitCode -eq 0)
    if (-not $global:ffResult.success) {
        $global:ffResult.error = "FFmpeg exit code: $exitCode"
        $pctText.Text = "Error"
        Write-Log ((Get-Content $global:ffLogFile -Tail 10) -join "`n")
    } else {
        $pctText.Text = "100%"
        $progressBar.Value = 100
    }

    if ($callback) { & $callback }
}

$script:encodeState = $null  # { tag, ffArgs, audioTag, codecTag, fOut, fTmp, origSize, origMb, targetMb, bestBitrate, pass, maxPasses, adjusting }

function Start-Encode {
    param($state)
    $script:encodeState = $state
    $statusText.Text = $state.statusText
    $global:totalFrames = [math]::Round($duration * ($origFps - 0.1))
    if (($state.fpsTag) -and ($state.fpsTag -ne "orig")) { $global:totalFrames = [math]::Round($duration * [int]$state.fpsTag) }
    $encArgs = $state.ffArgs + @('-b:v', "$($state.bestBitrate)k", '-movflags', '+faststart', '-progress', 'pipe:1')
    if ($state.codecTag -eq "h265") { $encArgs += '-x265-params', 'no-open-gop=1' }
    if ($state.audioTag -eq "keep") { $encArgs += '-c:a', 'copy' }
    elseif ($state.audioTag -eq "reencode") { $encArgs += '-c:a', 'aac', '-b:a', '128k' }
    else { $encArgs += '-an' }
    $encArgs += $state.outputFile
    Run-FFmpeg $encArgs { On-EncodeDone }
}

function On-EncodeDone {
    $s = $script:encodeState
    if (-not $global:ffResult.success) {
        Write-Log "ERROR: $($global:ffResult.error)"
        Reset-UI
        [System.Windows.Forms.MessageBox]::Show("Compression failed.`n$($global:ffResult.error)", "Error", "OK", "Error")
        return
    }

    try { $actualMb = [math]::Round((Get-Item $s.outputFile).Length / 1MB, 2) } catch { $actualMb = 0 }
    Write-Log "Attempt done: $actualMb MB"

    if ($s.tag -eq "fixed" -and $s.pass -lt $s.maxPasses) {
        $ratio = $s.targetMb / $actualMb
        Write-Log "Target: $($s.targetMb) MB, ratio: $([math]::Round($ratio, 2))"
        if ($ratio -lt 0.90 -or $ratio -gt 1.10) {
            $s.bestBitrate = [math]::Max(100, [math]::Round($s.bestBitrate * $ratio))
            $s.pass++
            $statusText.Text = "Attempt $($s.pass) - bitrate $($s.bestBitrate)k"
            Write-Log "Adjusting bitrate to $($s.bestBitrate)k for attempt $($s.pass)"
            $encArgs = $s.ffArgs + @('-b:v', "$($s.bestBitrate)k", '-movflags', '+faststart', '-progress', 'pipe:1')
            if ($s.codecTag -eq "h265") { $encArgs += '-x265-params', 'no-open-gop=1' }
            if ($s.audioTag -eq "keep") { $encArgs += '-c:a', 'copy' }
            elseif ($s.audioTag -eq "reencode") { $encArgs += '-c:a', 'aac', '-b:a', '128k' }
            else { $encArgs += '-an' }
            $encArgs += $s.outputFile
            Run-FFmpeg $encArgs { On-EncodeDone }
            return
        }
    }

    if ($s.tag -eq "percent" -and -not $s.adjusting) {
        $targetSize = $s.origMb * ([int]$percentSlider.Value / 100.0)
        $ratio = $targetSize / $actualMb
        Write-Log "Target: $([math]::Round($targetSize,1)) MB, ratio: $([math]::Round($ratio,2))"
        if ($ratio -lt 0.85 -or $ratio -gt 1.15) {
            $s.bestBitrate = [math]::Max(100, [math]::Round($s.bestBitrate * $ratio))
            $s.adjusting = $true
            $statusText.Text = "Adjusting to $($s.bestBitrate)k..."
            Write-Log "Adjusting bitrate to $($s.bestBitrate)k"
            $encArgs = $s.ffArgs + @('-b:v', "$($s.bestBitrate)k", '-movflags', '+faststart', '-progress', 'pipe:1')
            if ($s.codecTag -eq "h265") { $encArgs += '-x265-params', 'no-open-gop=1' }
            if ($s.audioTag -eq "keep") { $encArgs += '-c:a', 'copy' }
            elseif ($s.audioTag -eq "reencode") { $encArgs += '-c:a', 'aac', '-b:a', '128k' }
            else { $encArgs += '-an' }
            $encArgs += $s.fOut
            Run-FFmpeg $encArgs { On-EncodeDone }
            return
        }
    }

    Move-Item $s.outputFile $s.fOut -Force -ErrorAction SilentlyContinue
    try {
        $newSize = (Get-Item $s.fOut).Length
        $newMb = [math]::Round($newSize / 1MB, 1)
        $saved = [math]::Round(($s.origSize - $newSize) / 1MB, 1)
        $statusText.Text = "Done! $($s.origMb) MB -> $newMb MB (saved $saved MB)"
        $pctText.Text = "100%"
        $progressBar.Value = 100
        Write-Log "Done: $($s.origMb) MB -> $newMb MB (saved $saved MB)"
        Reset-UI
        [System.Windows.Forms.MessageBox]::Show("Video compressed successfully.`n`nOriginal: $($s.origMb) MB`nCompressed: $newMb MB`nSaved: $saved MB`n`n$(Split-Path -Leaf $s.fOut)", "Done", "OK", "Information")
    } catch {
        Reset-UI
        [System.Windows.Forms.MessageBox]::Show("Error reading output: $_", "Error", "OK", "Error")
    }
}

$CompressBtn.Add_MouseDown({
    $CompressBtn.IsEnabled = $false
    $BtnText.Visibility = [System.Windows.Visibility]::Collapsed
    $BtnLoader.Text = "Processing..."
    $BtnLoader.Visibility = [System.Windows.Visibility]::Visible
    $progressPanel.Visibility = [System.Windows.Visibility]::Visible
    $progressBar.Value = 0
    $pctText.Text = "0%"
    $consoleLog.Text = ""

    $tag = Get-ActiveMode
    $resTag = ($resCombo.SelectedItem).Tag
    $fpsTag = ($fpsCombo.SelectedItem).Tag
    $codecTag = ($codecCombo.SelectedItem).Tag
    $presetTag = ($presetCombo.SelectedItem).Tag
    $audioTag = ($audioCombo.SelectedItem).Tag
    $formatTag = ($formatCombo.SelectedItem).Tag

    $fOut = [System.IO.Path]::GetDirectoryName($FilePath) + "\" + $outNameBase + "_compressed." + $formatTag
    $fTmp = [System.IO.Path]::GetDirectoryName($FilePath) + "\" + $outNameBase + "_temp." + $formatTag

    $ffArgs = @('-y', '-i', $FilePath)
    if ($fpsTag -ne "orig") { $ffArgs += '-r', $fpsTag }
    if ($resTag -ne "orig") {
        $scaleMap = @{ "4k"="3840:2160"; "1440p"="2560:1440"; "1080p"="1920:1080"; "720p"="1280:720"; "480p"="854:480"; "360p"="640:360" }
        $ffArgs += '-vf', "scale=min($($scaleMap[$resTag]),iw):min($($scaleMap[$resTag]),ih):force_original_aspect_ratio=decrease"
    }
    $ffArgs += '-c:v', @{ "h264"="libx264"; "h265"="libx265" }[$codecTag]
    $ffArgs += '-preset', $presetTag

    $origSize = (Get-Item $FilePath).Length
    $origMb = [math]::Round($origSize / 1MB, 1)

    if ($tag -eq "fixed") {
        $targetMb = [double]::Parse($sizeText.Text, [System.Globalization.CultureInfo]::InvariantCulture)
        if ($targetMb -le 0) { Reset-UI; [System.Windows.Forms.MessageBox]::Show("Enter a positive number.", "Error"); return }
        $totalBitrate = [math]::Round(($targetMb * 8192) / $duration)
        $vbr = $totalBitrate - 128
        if ($vbr -lt 100) { Reset-UI; [System.Windows.Forms.MessageBox]::Show("Size too small for this video.", "Error"); return }
        $statusText.Text = "Attempt 1 - bitrate ${vbr}k"
        Write-Log "Starting: target $targetMb MB, bitrate ${vbr}k"
        Start-Encode @{
            tag = "fixed"; ffArgs = $ffArgs; audioTag = $audioTag; codecTag = $codecTag
            fOut = $fOut; outputFile = $fTmp; origSize = $origSize; origMb = $origMb
            targetMb = $targetMb; bestBitrate = $vbr; pass = 1; maxPasses = 2; statusText = "Attempt 1 - bitrate ${vbr}k"
            fpsTag = $fpsTag
        }
    } elseif ($tag -eq "percent") {
        $pct = [int]$percentSlider.Value / 100.0
        $targetSize = $origMb * $pct
        $totalBitrate = [math]::Round(($targetSize * 8192) / $duration)
        $vbr = [math]::Max(100, $totalBitrate - 128)
        $statusText.Text = "Encoding at ${vbr}k..."
        Write-Log "Starting: $([int]($pct*100))% of original, bitrate ${vbr}k"
        Start-Encode @{
            tag = "percent"; ffArgs = $ffArgs; audioTag = $audioTag; codecTag = $codecTag
            fOut = $fOut; outputFile = $fOut; origSize = $origSize; origMb = $origMb
            targetMb = $targetSize; bestBitrate = $vbr; pass = 1; maxPasses = 1
            adjusting = $false; statusText = "Encoding at ${vbr}k..."
            fpsTag = $fpsTag
        }
    } else {
        $crfVal = [int]$crfSlider.Value
        $statusText.Text = "Encoding at CRF $crfVal..."
        Write-Log "Starting: CRF $crfVal"
        $encArgs = $ffArgs + @('-crf', "$crfVal", '-movflags', '+faststart', '-progress', 'pipe:1')
        if ($codecTag -eq "h265") { $encArgs += '-x265-params', 'no-open-gop=1' }
        if ($audioTag -eq "keep") { $encArgs += '-c:a', 'copy' }
        elseif ($audioTag -eq "reencode") { $encArgs += '-c:a', 'aac', '-b:a', '128k' }
        else { $encArgs += '-an' }
        $encArgs += $fOut
        Run-FFmpeg $encArgs {
            if (-not $global:ffResult.success) {
                Reset-UI
                [System.Windows.Forms.MessageBox]::Show("Compression failed.`n$($global:ffResult.error)", "Error", "OK", "Error"); return
            }
            try {
                $newSize = (Get-Item $fOut).Length; $newMb = [math]::Round($newSize / 1MB, 1); $saved = [math]::Round(($origSize - $newSize) / 1MB, 1)
                $statusText.Text = "Done! $origMb MB -> $newMb MB (saved $saved MB)"
                $pctText.Text = "100%"; $progressBar.Value = 100
                Reset-UI
                [System.Windows.Forms.MessageBox]::Show("Video compressed successfully.`n`nOriginal: $origMb MB`nCompressed: $newMb MB`nSaved: $saved MB`n`n$(Split-Path -Leaf $fOut)", "Done", "OK", "Information")
            } catch { Reset-UI; [System.Windows.Forms.MessageBox]::Show("Error: $_", "Error", "OK", "Error") }
        }
    }
})

$window.ShowDialog() | Out-Null
