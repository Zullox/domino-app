#!/bin/bash
# Prepara un Mac o Linux para crear videojuegos con Claude Code.
# Uso: bash scripts/setup/setup-mac-linux.sh   (desde la carpeta domino-app)
set -uo pipefail
fail=()
step() { echo; echo "==> $*"; }
try() { "$@" || fail+=("$*"); }

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

step "Dependencias del proyecto"
try npm install

echo
if [ ${#fail[@]} -eq 0 ]; then echo "✅ Todo instalado."; else echo "‼️ Fallaron:"; printf '  - %s\n' "${fail[@]}"; fi
