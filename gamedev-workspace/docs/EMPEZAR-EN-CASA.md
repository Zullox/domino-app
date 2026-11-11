# Empezar en casa: checklist

Todo tu estudio de videojuegos está en la carpeta `gamedev-workspace/` (rama `claude/hola-rjy4l7` de **domino-app**).
El script de instalación la convierte en una **carpeta dedicada en tu PC**: `GameDev` en tu carpeta de usuario
(Windows: `C:\Users\<tú>\GameDev` · Mac: `/Users/<tú>/GameDev`).

Tiempo total: 30–45 minutos (casi todo es esperar descargas).

## 1. Descargar (2 min)
- [ ] Si no tienes Git, descarga el ZIP: en GitHub → domino-app → rama `claude/hola-rjy4l7` → **Code → Download ZIP**, y descomprímelo.
- [ ] Con Git:
  ```
  git clone -b claude/hola-rjy4l7 https://github.com/Zullox/domino-app.git
  ```

## 2. Crear la carpeta GameDev e instalar todo (20–30 min)
Abre una terminal **dentro de la carpeta `domino-app`** y ejecuta:
- **Windows** (PowerShell):
  ```
  powershell -ExecutionPolicy Bypass -File gamedev-workspace\scripts\setup\setup-windows.ps1
  ```
- **Mac / Linux**:
  ```
  bash gamedev-workspace/scripts/setup/setup-mac-linux.sh
  ```
¿Quieres otra ubicación? Añade la ruta: `... setup-windows.ps1 -Dest D:\GameDev` o `... setup-mac-linux.sh ~/Juegos`.

El script:
1. Instala Git, Node, Python, Godot, Blender, ImageMagick, FFmpeg (y SoX en Mac/Linux).
2. **Crea la carpeta `GameDev`** con tus juegos, plantillas, guías y la configuración de Claude, y la inicia como repositorio git.
3. Instala Claude Code, graphify, las skills de Vercel y OmniRoute.
4. Instala las dependencias de cada juego.

- [ ] Al final te dice si algo falló (cópiame el mensaje).
- [ ] Cierra y vuelve a abrir la terminal.
- [ ] Ya puedes borrar la carpeta `domino-app` descargada si no la usas para el dominó.

## 3. Primer arranque de Claude Code (5 min)
- [ ] ```
  cd ~/GameDev        (Windows: cd $HOME\GameDev)
  claude
  ```
- [ ] Inicia sesión y **acepta** confiar en la carpeta y en los marketplaces. Se instalan los plugins:
  frontend-design, playwright, skills de Anthropic, ponytail, everything-claude-code y MemPalace.
- [ ] Comprueba con `/plugin` que aparecen.
- [ ] En claude.ai → Plugins, activa **Headroom**.

## 4. Jugar a Ludus: Blood and Glory (2 min)
- [ ] ```
  cd games/ludus
  npm run dev
  ```
- [ ] Abre la URL que aparece (también desde el móvil, en la misma wifi).
- [ ] Juega una partida en *Veteranus* y apunta qué te gusta y qué no.

## 5. Seguir creando
Desde `GameDev`, abre `claude` y pide lo que quieras:
- `Mejora Ludus: añade sonido y números de daño` (Claude lee `CLAUDE.md` y el diseño en `docs/gdd/ludus.md`).
- `/nuevo-juego <nombre>` para empezar otro juego.

## 6. (Recomendado) Subir GameDev a GitHub
Así tienes copia de seguridad y puedes seguir desde el móvil en sesiones en la nube:
- [ ] En GitHub crea un repositorio **privado y vacío** llamado `gamedev`.
- [ ] En la carpeta `GameDev`:
  ```
  git remote add origin https://github.com/Zullox/gamedev.git
  git push -u origin main
  ```

## Qué tienes disponible
| Tipo | Nombre | Para qué |
|---|---|---|
| Comando | `/nuevo-juego` | Flujo completo idea → prototipo jugable |
| Agentes | game-designer, gameplay-programmer, game-artist, game-qa-tester, multiplayer-engineer | Equipo de desarrollo |
| Skills | game-design-doc, web-game-dev, game-assets, game-playtest, game-release | Guías de cada fase |
| Skills | graphify, frontend-design, Vercel React | Mapa del código, diseño de UI, buenas prácticas React |
| Plantilla | `templates/phaser-starter` | Juego Phaser 4 + Vite listo para móvil |
| Motores | Phaser (web), Godot 4.3 (nativo), three.js (3D web) | Según el tipo de juego |

## Notas
- **OmniRoute** está instalado pero **no** redirige Claude Code. Tiene avisos de seguridad; no le metas claves reales sin revisarlo.
- En sesiones en la nube, el hook `.claude/hooks/session-start.sh` reinstala todo solo.
