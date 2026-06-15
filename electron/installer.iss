; EasyVR Installer - Inno Setup Script

#define MyAppName "EasyVR"
#define MyAppVersion "2.0.0"
#define MyAppPublisher "EasyVR"
#define MyAppURL "https://github.com/antoni-acevedo/EasyVR"
#define MyAppExeName "launcher.bat"

[Setup]
AppId={{A1B2C3D4-E5F6-7890-ABCD-EF1234567890}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
DefaultDirName={localappdata}\EasyVR
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes
OutputDir=installer
OutputBaseFilename=EasyVR-Setup-{#MyAppVersion}
Compression=lzma
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest
CloseApplications=no
UninstallDisplayIcon={app}\assets\icon.ico
SetupIconFile=..\EasyVR.ico

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"

[Tasks]
Name: "desktopicon"; Description: "Create a &desktop shortcut"; GroupDescription: "Additional shortcuts:"

[Files]
; Electron runtime
Source: "node_modules\electron\dist\chrome_100_percent.pak"; DestDir: "{app}\electron"; Flags: ignoreversion
Source: "node_modules\electron\dist\chrome_200_percent.pak"; DestDir: "{app}\electron"; Flags: ignoreversion
Source: "node_modules\electron\dist\d3dcompiler_47.dll"; DestDir: "{app}\electron"; Flags: ignoreversion
Source: "node_modules\electron\dist\electron.exe"; DestDir: "{app}\electron"; Flags: ignoreversion
Source: "node_modules\electron\dist\libEGL.dll"; DestDir: "{app}\electron"; Flags: ignoreversion
Source: "node_modules\electron\dist\libGLESv2.dll"; DestDir: "{app}\electron"; Flags: ignoreversion
Source: "node_modules\electron\dist\LICENSE"; DestDir: "{app}\electron"; Flags: ignoreversion
Source: "node_modules\electron\dist\LICENSES.chromium.html"; DestDir: "{app}\electron"; Flags: ignoreversion
Source: "node_modules\electron\dist\resources\*"; DestDir: "{app}\electron\resources"; Flags: ignoreversion recursesubdirs
Source: "node_modules\electron\dist\snapshot_blob.bin"; DestDir: "{app}\electron"; Flags: ignoreversion
Source: "node_modules\electron\dist\v8_context_snapshot.bin"; DestDir: "{app}\electron"; Flags: ignoreversion
Source: "node_modules\electron\dist\vk_swiftshader.dll"; DestDir: "{app}\electron"; Flags: ignoreversion
Source: "node_modules\electron\dist\vulkan-1.dll"; DestDir: "{app}\electron"; Flags: ignoreversion

; Electron app files (compiled)
Source: "dist\main\*"; DestDir: "{app}\app\dist\main"; Flags: ignoreversion
Source: "dist\renderer\*"; DestDir: "{app}\app\dist\renderer"; Flags: ignoreversion recursesubdirs

; App config
Source: "package.json"; DestDir: "{app}\app"; Flags: ignoreversion

; Assets
Source: "assets\*"; DestDir: "{app}\app\assets"; Flags: ignoreversion recursesubdirs

; Scripts
Source: "installer_launcher.bat"; DestDir: "{app}"; DestName: "launcher.bat"; Flags: ignoreversion
Source: "..\install.ps1"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\uninstall.ps1"; DestDir: "{app}"; Flags: ignoreversion

; FFmpeg
Source: "..\ffmpeg\*"; DestDir: "{app}\ffmpeg"; Flags: ignoreversion recursesubdirs

; Assets root
Source: "..\EasyVR.ico"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\logo.png"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\logoSinTexto.png"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\launcher.bat"; WorkingDir: "{app}\app"; IconFilename: "{app}\EasyVR.ico"
Name: "{group}\Uninstall {#MyAppName}"; Filename: "{uninstallexe}"
Name: "{commondesktop}\{#MyAppName}"; Filename: "{app}\launcher.bat"; WorkingDir: "{app}\app"; IconFilename: "{app}\EasyVR.ico"; Tasks: desktopicon

[Run]
; Register context menu via install.ps1
Filename: "powershell.exe"; Parameters: "-NoProfile -ExecutionPolicy Bypass -File ""{app}\install.ps1"" -InstallPath ""{app}"""; Flags: runhidden; Description: "Register right-click menu"; StatusMsg: "Registering context menu..."

[UninstallRun]
; Remove context menu via uninstall.ps1
Filename: "powershell.exe"; Parameters: "-NoProfile -ExecutionPolicy Bypass -File ""{app}\uninstall.ps1"""; Flags: runhidden; RunOnceId: "UnregisterEasyVR"

[Code]
function GetInstallDir(Value: string): string;
begin
  Result := ExpandConstant('{app}');
end;
