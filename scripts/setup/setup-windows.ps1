# Prepara Windows para crear videojuegos con Claude Code.
# Uso (PowerShell, desde la carpeta domino-app):
#   powershell -ExecutionPolicy Bypass -File scripts\setup\setup-windows.ps1
$fail = @()
function Step($m) { Write-Host "`n==> $m" -ForegroundColor Cyan }
function Try-Run($label, [scriptblock]$cmd) {
  try { & $cmd; if ($LASTEXITCODE -and $LASTEXITCODE -ne 0) { throw "exit $LASTEXITCODE" } }
  catch { $script:fail += $label }
}

Step "Herramientas (winget)"
$pkgs = 'Git.Git','OpenJS.NodeJS.LTS','Python.Python.3.12','GodotEngine.GodotEngine',
        'BlenderFoundation.Blender','ImageMagick.ImageMagick','Gyan.FFmpeg'
foreach ($p in $pkgs) {
  Try-Run $p { winget install --id $p -e --accept-source-agreements --accept-package-agreements --silent }
}
# Recargar PATH para usar lo recién instalado
$env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')

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

Step "Dependencias del proyecto"
Try-Run 'npm install' { npm install }

if ($fail.Count -eq 0) { Write-Host "`nTodo instalado." -ForegroundColor Green }
else { Write-Host "`nFallaron:" -ForegroundColor Yellow; $fail | ForEach-Object { Write-Host "  - $_" } }
