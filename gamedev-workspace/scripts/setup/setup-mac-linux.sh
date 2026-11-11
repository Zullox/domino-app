#!/bin/bash
# Crea tu carpeta de videojuegos y prepara el PC (Mac o Linux).
# Uso:  bash scripts/setup/setup-mac-linux.sh [carpeta destino]   (por defecto ~/GameDev)
set -uo pipefail
SRC="$(cd "$(dirname "$0")/../.." && pwd)"
DEST="${1:-$HOME/GameDev}"
fail=()
step() { echo; echo "==> $*"; }
try() { "$@" || fail+=("$*"); }

# 1. Herramientas del sistema
if [ "$(uname)" = "Darwin" ]; then
  if ! command -v brew >/dev/null; then
    step "Instalando Homebrew"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  fi
  step "Herramientas (brew)"
  try brew install git node python imagemagick sox ffmpeg
  try brew install --cask godot blender
else
  step "Herramientas (apt)"
  try sudo apt-get update
  try sudo apt-get install -y git nodejs npm python3 python3-pip imagemagick sox ffmpeg blender
  if ! command -v godot >/dev/null; then
    tmp="$(mktemp -d)"
    try curl -sSfL -o "$tmp/godot.zip" https://github.com/godotengine/godot/releases/download/4.3-stable/Godot_v4.3-stable_linux.x86_64.zip
    try sudo mkdir -p /opt/godot
    try sudo python3 -c "import zipfile,sys;zipfile.ZipFile(sys.argv[1]).extractall('/opt/godot')" "$tmp/godot.zip"
    try sudo chmod +x /opt/godot/Godot_v4.3-stable_linux.x86_64
    try sudo ln -sf /opt/godot/Godot_v4.3-stable_linux.x86_64 /usr/local/bin/godot
  fi
fi

# 2. Carpeta dedicada
if [ "$SRC" != "$(cd "$DEST" 2>/dev/null && pwd)" ]; then
  if [ -e "$DEST" ]; then
    echo "‼️ $DEST ya existe: no la toco. Borra la carpeta o elige otra: bash $0 /otra/ruta"; exit 1
  fi
  step "Creando $DEST"
  mkdir -p "$DEST"
  (cd "$SRC" && tar --exclude=node_modules --exclude=dist -cf - .) | (cd "$DEST" && tar -xf -)
fi
cd "$DEST"
if [ ! -d .git ]; then
  step "Iniciando git en $DEST"
  try git init -q -b main
  try git add -A
  try git commit -qm "Estudio GameDev inicial"
fi

# 3. Claude Code y extras
if ! command -v claude >/dev/null; then
  step "Claude Code"
  try bash -c "curl -fsSL https://claude.ai/install.sh | bash"
fi
step "Python: pygame, Pillow, numpy, graphify"
try python3 -m pip install --user pygame pillow numpy graphifyy
try python3 -m graphify install --platform claude
step "Skills de Vercel y OmniRoute"
try npx -y skills add vercel-labs/agent-skills -g -a claude-code -y
try npm install -g omniroute

# 4. Dependencias de cada juego y plantilla
for dir in games/*/ templates/*/; do
  [ -f "$dir/package.json" ] || continue
  step "npm install en $dir"
  try bash -c "cd '$dir' && npm install"
done

echo
if [ ${#fail[@]} -eq 0 ]; then echo "✅ Todo listo en $DEST"; else echo "‼️ Fallaron:"; printf '  - %s\n' "${fail[@]}"; fi
echo "Siguiente paso:  cd \"$DEST\" && claude"
