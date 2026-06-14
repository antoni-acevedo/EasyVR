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

Write-Host "Getting video info..." -ForegroundColor Cyan
$durationStr = & $ffprobe -v error -show_entries format=duration -of csv=p=0 $FilePath
$infoStr = & $ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate -of csv=p=0 $FilePath

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

$hasAudio = (& $ffprobe -v error -select_streams a:0 -show_entries stream=codec_type -of csv=p=0 $FilePath) -ne ""

$outNameBase = [System.IO.Path]::GetFileNameWithoutExtension($FilePath)

$xaml = @"
<Window xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="EasyVR - Reduce Video Size"
        Width="460" MinWidth="440" Height="480" MinHeight="460"
        SizeToContent="Height" WindowStartupLocation="CenterScreen"
        Topmost="True" ResizeMode="CanResize"
        FontFamily="Segoe UI Variable, Segoe UI" Background="#F5F5F5"
        UseLayoutRounding="True" SnapsToDevicePixels="True">
    <Window.Resources>
        <Style TargetType="Button" x:Key="PrimaryBtn">
            <Setter Property="Height" Value="44"/>
            <Setter Property="Foreground" Value="White"/>
            <Setter Property="FontSize" Value="15"/>
            <Setter Property="FontWeight" Value="SemiBold"/>
            <Setter Property="Cursor" Value="Hand"/>
            <Setter Property="Template">
                <Setter.Value>
                    <ControlTemplate TargetType="Button">
                        <Border x:Name="border" Background="{TemplateBinding Background}" CornerRadius="8" BorderThickness="0">
                            <ContentPresenter HorizontalAlignment="Center" VerticalAlignment="Center"/>
                        </Border>
                        <ControlTemplate.Triggers>
                            <Trigger Property="IsMouseOver" Value="True">
                                <Setter TargetName="border" Property="Opacity" Value="0.85"/>
                            </Trigger>
                            <Trigger Property="IsPressed" Value="True">
                                <Setter TargetName="border" Property="Opacity" Value="0.7"/>
                            </Trigger>
                            <Trigger Property="IsEnabled" Value="False">
                                <Setter TargetName="border" Property="Opacity" Value="0.4"/>
                            </Trigger>
                        </ControlTemplate.Triggers>
                    </ControlTemplate>
                </Setter.Value>
            </Setter>
        </Style>
        <Style TargetType="TextBox">
            <Setter Property="Height" Value="34"/>
            <Setter Property="FontSize" Value="14"/>
            <Setter Property="Padding" Value="10,4"/>
            <Setter Property="BorderBrush" Value="#D0D0D0"/>
            <Setter Property="BorderThickness" Value="1"/>
            <Setter Property="Background" Value="White"/>
        </Style>
        <Style TargetType="ComboBox">
            <Setter Property="Height" Value="34"/>
            <Setter Property="FontSize" Value="14"/>
            <Setter Property="Padding" Value="8,3"/>
            <Setter Property="Background" Value="White"/>
        </Style>
        <Style TargetType="ProgressBar">
            <Setter Property="Height" Value="6"/>
            <Setter Property="Foreground" Value="#6C5CE7"/>
            <Setter Property="Background" Value="#E0E0E0"/>
            <Setter Property="BorderThickness" Value="0"/>
        </Style>
    </Window.Resources>
    <Border Background="White" CornerRadius="8" Margin="12">
        <Grid Margin="20">
            <Grid.RowDefinitions>
                <RowDefinition Height="Auto"/>
                <RowDefinition Height="Auto"/>
                <RowDefinition Height="Auto"/>
                <RowDefinition Height="Auto"/>
                <RowDefinition Height="Auto"/>
                <RowDefinition Height="Auto"/>
                <RowDefinition Height="Auto"/>
            </Grid.RowDefinitions>
            <StackPanel Grid.Row="0" Orientation="Horizontal" Margin="0,0,0,16">
                <Border Width="36" Height="36" CornerRadius="8" Background="#6C5CE7">
                    <TextBlock Text="E" FontSize="20" FontWeight="Bold" Foreground="White"
                               HorizontalAlignment="Center" VerticalAlignment="Center"/>
                </Border>
                <StackPanel Margin="10,0,0,0" VerticalAlignment="Center">
                    <TextBlock Text="EasyVR" FontSize="18" FontWeight="Bold" Foreground="#1A1A1A"/>
                    <TextBlock Text="Video Resizer" FontSize="12" Foreground="#888" Margin="0,-2,0,0"/>
                </StackPanel>
                <TextBlock Text="$fileSizeMb MB" FontSize="12" Foreground="#AAA" VerticalAlignment="Center" Margin="10,0,0,0"/>
            </StackPanel>
            <TextBlock Grid.Row="1" Text="MODE" FontSize="11" FontWeight="SemiBold" Foreground="#888" Margin="0,0,0,4"/>
            <ComboBox Grid.Row="1" x:Name="ModeCombo" Margin="0,14,0,10">
                <ComboBoxItem Tag="fixed" IsSelected="True">Fixed Size (MB)</ComboBoxItem>
                <ComboBoxItem Tag="percent">Percent (%)</ComboBoxItem>
                <ComboBoxItem Tag="crf">Quality (CRF)</ComboBoxItem>
            </ComboBox>
            <StackPanel Grid.Row="2" x:Name="FixedPanel" Margin="0,0,0,4">
                <TextBlock Text="TARGET SIZE (MB)" FontSize="11" FontWeight="SemiBold" Foreground="#888" Margin="0,0,0,4"/>
                <Grid>
                    <Grid.ColumnDefinitions>
                        <ColumnDefinition Width="*"/>
                        <ColumnDefinition Width="Auto"/>
                    </Grid.ColumnDefinitions>
                    <TextBox Grid.Column="0" x:Name="SizeText" Text="8" MaxLength="30"/>
                    <Border Grid.Column="1" Background="#F0F0F0" CornerRadius="0,4,4,0" Height="34" Width="50" Margin="-1,0,0,0">
                        <TextBlock Text="MB" VerticalAlignment="Center" HorizontalAlignment="Center" Foreground="#888"/>
                    </Border>
                </Grid>
            </StackPanel>
            <StackPanel Grid.Row="2" x:Name="PercentPanel" Visibility="Collapsed" Margin="0,0,0,4">
                <TextBlock Text="COMPRESSION RATIO" FontSize="11" FontWeight="SemiBold" Foreground="#888" Margin="0,0,0,4"/>
                <Slider x:Name="PercentSlider" Minimum="10" Maximum="90" Value="50" TickFrequency="5" IsSnapToTickEnabled="True"
                        Height="30" Margin="0,4,0,0" Foreground="#6C5CE7"/>
                <Grid>
                    <Grid.ColumnDefinitions>
                        <ColumnDefinition Width="*"/>
                        <ColumnDefinition Width="Auto"/>
                    </Grid.ColumnDefinitions>
                    <TextBlock Grid.Column="0" Text="10%" FontSize="11" Foreground="#AAA"/>
                    <TextBlock Grid.Column="1" Text="90%" FontSize="11" Foreground="#AAA"/>
                </Grid>
                <TextBlock x:Name="PercentValue" Text="50 %" FontSize="14" FontWeight="SemiBold" Foreground="#6C5CE7" HorizontalAlignment="Center" Margin="0,4,0,0"/>
            </StackPanel>
            <StackPanel Grid.Row="2" x:Name="CRFPanel" Visibility="Collapsed" Margin="0,0,0,4">
                <TextBlock Text="QUALITY (CRF)" FontSize="11" FontWeight="SemiBold" Foreground="#888" Margin="0,0,0,4"/>
                <TextBlock Text="18 = Best / 28 = Smaller" FontSize="11" Foreground="#AAA" Margin="0,0,0,6"/>
                <Slider x:Name="CRFSlider" Minimum="18" Maximum="28" Value="23" TickFrequency="1" IsSnapToTickEnabled="True"
                        Height="30" Foreground="#6C5CE7"/>
                <Grid>
                    <Grid.ColumnDefinitions>
                        <ColumnDefinition Width="*"/>
                        <ColumnDefinition Width="Auto"/>
                    </Grid.ColumnDefinitions>
                    <TextBlock Grid.Column="0" Text="Best" FontSize="11" Foreground="#AAA"/>
                    <TextBlock Grid.Column="1" Text="Smaller" FontSize="11" Foreground="#AAA"/>
                </Grid>
                <TextBlock x:Name="CRFValue" Text="CRF 23" FontSize="14" FontWeight="SemiBold" Foreground="#6C5CE7" HorizontalAlignment="Center" Margin="0,4,0,0"/>
            </StackPanel>
            <Expander Grid.Row="3" Header="ADVANCED" FontSize="12" FontWeight="SemiBold" Foreground="#888" Margin="0,8,0,0">
                <Border Background="#F8F8F8" CornerRadius="6" Padding="12" Margin="0,8,0,0">
                    <Grid>
                        <Grid.RowDefinitions>
                            <RowDefinition Height="Auto"/>
                            <RowDefinition Height="Auto"/>
                            <RowDefinition Height="Auto"/>
                        </Grid.RowDefinitions>
                        <Grid.ColumnDefinitions>
                            <ColumnDefinition Width="*"/>
                            <ColumnDefinition Width="12"/>
                            <ColumnDefinition Width="*"/>
                        </Grid.ColumnDefinitions>
                        <StackPanel Grid.Row="0" Grid.Column="0">
                            <TextBlock Text="RESOLUTION" FontSize="10" FontWeight="SemiBold" Foreground="#888" Margin="0,0,0,3"/>
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
                            <TextBlock Text="FPS" FontSize="10" FontWeight="SemiBold" Foreground="#888" Margin="0,0,0,3"/>
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
                            <TextBlock Text="CODEC" FontSize="10" FontWeight="SemiBold" Foreground="#888" Margin="0,0,0,3"/>
                            <ComboBox x:Name="CodecCombo">
                                <ComboBoxItem IsSelected="True" Tag="h264">H.264 (x264)</ComboBoxItem>
                                <ComboBoxItem Tag="h265">H.265 (x265)</ComboBoxItem>
                            </ComboBox>
                        </StackPanel>
                        <StackPanel Grid.Row="1" Grid.Column="2" Margin="0,10,0,0">
                            <TextBlock Text="PRESET" FontSize="10" FontWeight="SemiBold" Foreground="#888" Margin="0,0,0,3"/>
                            <ComboBox x:Name="PresetCombo">
                                <ComboBoxItem Tag="fast">Fast</ComboBoxItem>
                                <ComboBoxItem IsSelected="True" Tag="medium">Medium</ComboBoxItem>
                                <ComboBoxItem Tag="slow">Slow</ComboBoxItem>
                            </ComboBox>
                        </StackPanel>
                        <StackPanel Grid.Row="2" Grid.Column="0" Margin="0,10,0,0">
                            <TextBlock Text="AUDIO" FontSize="10" FontWeight="SemiBold" Foreground="#888" Margin="0,0,0,3"/>
                            <ComboBox x:Name="AudioCombo">
                                <ComboBoxItem IsSelected="True" Tag="keep">Keep original</ComboBoxItem>
                                <ComboBoxItem Tag="reencode">Re-encode (AAC 128k)</ComboBoxItem>
                                <ComboBoxItem Tag="remove">Remove audio</ComboBoxItem>
                            </ComboBox>
                        </StackPanel>
                        <StackPanel Grid.Row="2" Grid.Column="2" Margin="0,10,0,0">
                            <TextBlock Text="OUTPUT FORMAT" FontSize="10" FontWeight="SemiBold" Foreground="#888" Margin="0,0,0,3"/>
                            <ComboBox x:Name="FormatCombo">
                                <ComboBoxItem IsSelected="True" Tag="mp4">MP4</ComboBoxItem>
                                <ComboBoxItem Tag="mkv">MKV</ComboBoxItem>
                                <ComboBoxItem Tag="webm">WebM</ComboBoxItem>
                            </ComboBox>
                        </StackPanel>
                    </Grid>
                </Border>
            </Expander>
            <Button Grid.Row="4" x:Name="CompressBtn" Style="{StaticResource PrimaryBtn}"
                    Content="COMPRESS VIDEO" Background="#6C5CE7" Margin="0,14,0,0"/>
            <StackPanel Grid.Row="5" x:Name="ProgressPanel" Visibility="Collapsed" Margin="0,14,0,0">
                <ProgressBar x:Name="ProgressBar" IsIndeterminate="True"/>
                <TextBlock x:Name="StatusText" Text="" Margin="0,8,0,0" FontSize="13" Foreground="#666"/>
            </StackPanel>
        </Grid>
    </Border>
</Window>
"@

$reader = [System.Xml.XmlReader]::Create([System.IO.StringReader]::new($xaml))
$window = [System.Windows.Markup.XamlReader]::Load($reader)

$modeCombo = $window.FindName("ModeCombo")
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
$compressBtn = $window.FindName("CompressBtn")
$progressPanel = $window.FindName("ProgressPanel")
$progressBar = $window.FindName("ProgressBar")
$statusText = $window.FindName("StatusText")

$modeCombo.Add_SelectionChanged({
    $tag = ($modeCombo.SelectedItem).Tag
    $fixedPanel.Visibility = if ($tag -eq "fixed") { "Visible" } else { "Collapsed" }
    $percentPanel.Visibility = if ($tag -eq "percent") { "Visible" } else { "Collapsed" }
    $crfPanel.Visibility = if ($tag -eq "crf") { "Visible" } else { "Collapsed" }
})

$percentSlider.Add_ValueChanged({ $percentValue.Text = "$([int]$percentSlider.Value) %" })
$crfSlider.Add_ValueChanged({ $crfValue.Text = "CRF $( [int]$crfSlider.Value )" })

$compressBtn.Add_Click({
    $compressBtn.IsEnabled = $false
    $progressPanel.Visibility = "Visible"
    $statusText.Text = "Preparing..."

    $tag = ($modeCombo.SelectedItem).Tag
    $resTag = ($resCombo.SelectedItem).Tag
    $fpsTag = ($fpsCombo.SelectedItem).Tag
    $codecTag = ($codecCombo.SelectedItem).Tag
    $presetTag = ($presetCombo.SelectedItem).Tag
    $audioTag = ($audioCombo.SelectedItem).Tag
    $formatTag = ($formatCombo.SelectedItem).Tag

    $fOut = [System.IO.Path]::GetDirectoryName($FilePath) + "\" + $outNameBase + "_compressed." + $formatTag
    $fTmp = [System.IO.Path]::GetDirectoryName($FilePath) + "\" + $outNameBase + "_temp." + $formatTag

    $ffArgs = @('-y', '-i', $FilePath)

    if ($resTag -ne "orig") {
        $scaleMap = @{ "4k" = "3840:2160"; "1440p" = "2560:1440"; "1080p" = "1920:1080"
                       "720p" = "1280:720"; "480p" = "854:480"; "360p" = "640:360" }
        $scale = $scaleMap[$resTag]
        $ffArgs += '-vf', "scale=min($scale,iw):min($scale,ih):force_original_aspect_ratio=decrease,setdar=16/9"
    }

    if ($fpsTag -ne "orig") { $ffArgs += '-r', $fpsTag }

    $codecMap = @{ "h264" = "libx264"; "h265" = "libx265" }
    $ffArgs += '-c:v', $codecMap[$codecTag]
    $ffArgs += '-preset', $presetTag

    if ($tag -eq "fixed") {
        $targetMb = [double]::Parse($sizeText.Text, [System.Globalization.CultureInfo]::InvariantCulture)
        if ($targetMb -le 0) { [System.Windows.Forms.MessageBox]::Show("Enter a positive number.", "Error"); return }
        $totalBitrate = [math]::Round(($targetMb * 8192) / $duration)
        $vbr = $totalBitrate - 128
        if ($vbr -lt 100) { [System.Windows.Forms.MessageBox]::Show("Size too small for this video.", "Error"); return }

        $best = $vbr
        for ($pass = 1; $pass -le 2; $pass++) {
            $statusText.Text = "Attempt $pass - adjusting bitrate..."
            $encArgs = $ffArgs + @('-b:v', "${best}k")
            if ($codecTag -eq "h265") { $encArgs += '-x265-params', "no-open-gop=1" }
            $encArgs += '-movflags', '+faststart'
            if ($audioTag -eq "keep") { $encArgs += '-c:a', 'copy' }
            elseif ($audioTag -eq "reencode") { $encArgs += '-c:a', 'aac', '-b:a', '128k' }
            else { $encArgs += '-an' }
            $encArgs += $fTmp
            & $ffmpeg $encArgs 2>&1 | Out-Null
            if ($LASTEXITCODE -ne 0) { [System.Windows.Forms.MessageBox]::Show("Compression error.", "Error"); return }

            $actualMb = [math]::Round((Get-Item $fTmp).Length / 1MB, 2)
            $ratio = $targetMb / $actualMb
            if ($ratio -ge 0.90 -and $ratio -le 1.10 -or $pass -eq 2) {
                Move-Item $fTmp $fOut -Force; break
            }
            $best = [math]::Max(100, [math]::Round($best * $ratio))
        }
    } elseif ($tag -eq "percent") {
        $pct = [int]$percentSlider.Value / 100.0
        $targetSize = $fileSizeMb * $pct
        $totalBitrate = [math]::Round(($targetSize * 8192) / $duration)
        $vbr = $totalBitrate - 128
        if ($vbr -lt 100) { $vbr = 100 }
        $statusText.Text = "Compressing at ${vbr}k..."
        $encArgs = $ffArgs + @('-b:v', "${vbr}k")
        if ($codecTag -eq "h265") { $encArgs += '-x265-params', "no-open-gop=1" }
        $encArgs += '-movflags', '+faststart'
        if ($audioTag -eq "keep") { $encArgs += '-c:a', 'copy' }
        elseif ($audioTag -eq "reencode") { $encArgs += '-c:a', 'aac', '-b:a', '128k' }
        else { $encArgs += '-an' }
        $encArgs += $fOut
        & $ffmpeg $encArgs 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) { [System.Windows.Forms.MessageBox]::Show("Compression error.", "Error"); return }

        $actualMb = [math]::Round((Get-Item $fOut).Length / 1MB, 2)
        $ratio = $targetSize / $actualMb
        if ($ratio -lt 0.85 -or $ratio -gt 1.15) {
            $vbr2 = [math]::Max(100, [math]::Round($vbr * $ratio))
            $statusText.Text = "Adjusting to ${vbr2}k..."
            $encArgs2 = $ffArgs + @('-b:v', "${vbr2}k")
            if ($codecTag -eq "h265") { $encArgs2 += '-x265-params', "no-open-gop=1" }
            $encArgs2 += '-movflags', '+faststart'
            if ($audioTag -eq "keep") { $encArgs2 += '-c:a', 'copy' }
            elseif ($audioTag -eq "reencode") { $encArgs2 += '-c:a', 'aac', '-b:a', '128k' }
            else { $encArgs2 += '-an' }
            $encArgs2 += $fTmp
            & $ffmpeg $encArgs2 2>&1 | Out-Null
            if ($LASTEXITCODE -ne 0) { [System.Windows.Forms.MessageBox]::Show("Compression error.", "Error"); return }
            Move-Item $fTmp $fOut -Force
        }
    } else {
        $crfVal = [int]$crfSlider.Value
        $statusText.Text = "Compressing at CRF $crfVal..."
        $encArgs = $ffArgs + @('-crf', "$crfVal")
        if ($codecTag -eq "h265") { $encArgs += '-x265-params', "no-open-gop=1" }
        $encArgs += '-movflags', '+faststart'
        if ($audioTag -eq "keep") { $encArgs += '-c:a', 'copy' }
        elseif ($audioTag -eq "reencode") { $encArgs += '-c:a', 'aac', '-b:a', '128k' }
        else { $encArgs += '-an' }
        $encArgs += $fOut
        & $ffmpeg $encArgs 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) { [System.Windows.Forms.MessageBox]::Show("Compression error.", "Error"); return }
    }

    $origSize = (Get-Item $FilePath).Length
    $newSize = (Get-Item $fOut).Length
    $saved = [math]::Round(($origSize - $newSize) / 1MB, 1)
    $origMb = [math]::Round($origSize / 1MB, 1)
    $newMb = [math]::Round($newSize / 1MB, 1)

    $progressPanel.Visibility = "Collapsed"
    $compressBtn.IsEnabled = $true

    [System.Windows.Forms.MessageBox]::Show("Video compressed successfully.`n`nOriginal: $origMb MB`nCompressed: $newMb MB`nSaved: $saved MB`n`n$(Split-Path -Leaf $fOut)", "Done", "OK", "Information")
})

$window.ShowDialog() | Out-Null
