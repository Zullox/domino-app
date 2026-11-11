# Crea tu carpeta de videojuegos y prepara Windows.
# Uso (PowerShell):
#   powershell -ExecutionPolicy Bypass -File scripts\setup\setup-windows.ps1 [-Dest C:\ruta]
# Por defecto la carpeta es  %USERPROFILE%\GameDev
param([string]$Dest = (Join-Path $HOME 'GameDev'))
$fail = @()
$Src = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
function Step($m) { Write-Host "`n==> $m" -ForegroundColor Cyan }
function Try-Run($label, [scriptblock]$cmd) {
  try { $global:LASTEXITCODE = 0; & $cmd; if ($LASTEXITCODE -ne 0) { throw "exit $LASTEXITCODE" } }
  catch { $script:fail += $label }
}

# 1. Herramientas
Step "Herramientas (winget)"
$pkgs = 'Git.Git','OpenJS.NodeJS.LTS','Python.Python.3.12','GodotEngine.GodotEngine',
        'BlenderFoundation.Blender','ImageMagick.ImageMagick','Gyan.FFmpeg'
foreach ($p in $pkgs) {
  Try-Run $p { winget install --id $p -e --accept-source-agreements --accept-package-agreements --silent }
}
$env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')

# 2. Carpeta dedicada
$sameFolder = (Test-Path $Dest) -and ((Resolve-Path $Dest).Path -eq $Src)
if (-not $sameFolder) {
  if (Test-Path $Dest) {
    Write-Host "$Dest ya existe: no la toco. Borrala o usa -Dest con otra ruta." -ForegroundColor Yellow; exit 1
  }
  Step "Creando $Dest"
  robocopy $Src $Dest /E /XD node_modules dist /NFL /NDL /NJH /NJS /NP | Out-Null
}
Set-Location $Dest
if (-not (Test-Path '.git')) {
  Step "Iniciando git en $Dest"
  Try-Run 'git init' { git init -q -b main; git add -A; git commit -qm "Estudio GameDev inicial" }
}

# 3. Claude Code y extras
if (-not (Get-Command claude -ErrorAction SilentlyContinue)) {
  Step "Claude Code"
  Try-Run 'Claude Code' { irm https://claude.ai/install.ps1 | iex }
}
Step "Python: pygame, Pillow, numpy, graphify"
Try-Run 'pip' { py -m pip install --user pygame pillow numpy graphifyy }
Try-Run 'graphify install' { py -m graphify install --platform claude }
Step "Skills de Vercel y OmniRoute"
Try-Run 'vercel skills' { npx -y skills add vercel-labs/agent-skills -g -a claude-code -y }
Try-Run 'omniroute' { npm install -g omniroute }

# 4. Dependencias de cada juego y plantilla
foreach ($d in (Get-ChildItem games, templates -Directory -ErrorAction SilentlyContinue)) {
  if (Test-Path (Join-Path $d.FullName 'package.json')) {
    Step "npm install en $($d.Name)"
    Push-Location $d.FullName
    Try-Run "npm install $($d.Name)" { npm install }
    Pop-Location
  }
}

if ($fail.Count -eq 0) { Write-Host "`nTodo listo en $Dest" -ForegroundColor Green }
else { Write-Host "`nFallaron:" -ForegroundColor Yellow; $fail | ForEach-Object { Write-Host "  - $_" } }
Write-Host "Siguiente paso:  cd `"$Dest`"; claude"
