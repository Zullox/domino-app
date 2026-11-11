# Empezar en casa: checklist

Todo está preparado en la rama `claude/hola-rjy4l7` de **domino-app** y **domino-server**.
Sigue los pasos en orden: tardarás unos 30–45 minutos (casi todo es esperar descargas).

## 1. Juntar los cambios (5 min, se puede hacer desde el móvil)
- [ ] En GitHub, abre un Pull Request de `claude/hola-rjy4l7` → rama principal en **domino-app** y mergéalo.
- [ ] Lo mismo en **domino-server**.

> Así todas las sesiones de Claude Code (en la nube y en tu PC) cargan los skills, agentes, plugins y el hook de instalación.

## 2. Preparar tu PC (20–30 min)
- [ ] Clona el repo (o `git pull` si ya lo tienes):
  ```
  git clone https://github.com/Zullox/domino-app.git
  cd domino-app
  ```
- [ ] Ejecuta el script de tu sistema; instala Git, Node, Python, Godot, Blender, ImageMagick, FFmpeg, Claude Code, graphify, las skills de Vercel y OmniRoute:
  - **Windows** (PowerShell):
    `powershell -ExecutionPolicy Bypass -File scripts\setup\setup-windows.ps1`
  - **Mac / Linux**:
    `bash scripts/setup/setup-mac-linux.sh`
- [ ] Al final el script te dice qué ha fallado (si algo falla, cópiame el mensaje).
- [ ] Cierra y vuelve a abrir la terminal.

## 3. Primer arranque de Claude Code (5 min)
- [ ] En la carpeta `domino-app`, ejecuta `claude` e inicia sesión.
- [ ] Te preguntará si confías en la carpeta y en los marketplaces de plugins → **acepta**. Se instalan:
  frontend-design, playwright, skills de Anthropic, ponytail, everything-claude-code y MemPalace.
- [ ] Comprueba con `/plugin` que aparecen. Si falta alguno: `/plugin install <nombre>@<marketplace>`.
- [ ] En claude.ai → Plugins, activa **Headroom** (solo está en el catálogo de claude.ai).

## 4. Probar la plantilla de juego (2 min)
- [ ] ```
  cd templates/phaser-starter
  npm install
  npm run dev
  ```
- [ ] Abre la URL que aparece (también desde el móvil en la misma wifi). Mueve el cuadrado con flechas o tocando, recoge monedas y esquiva triángulos.

## 5. Jugar a Ludus: Blood and Glory (ya está hecho el prototipo)
- [ ] ```
  cd games/ludus
  npm install
  npm run dev
  ```
- [ ] Juega una partida en *Veteranus* y apunta qué te gusta y qué no: eso guía la siguiente versión.
- [ ] Diseño completo en `docs/gdd/ludus.md`.

## 6. ¡Crear otro juego!
- [ ] Vuelve a `domino-app`, abre `claude` y escribe:
  ```
  /nuevo-juego mi-juego
  ```
  Claude te propone ideas, escribe el diseño, programa el prototipo, crea arte y sonido provisionales y lo prueba.

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
- **OmniRoute** está instalado pero **no** redirige Claude Code. Tiene avisos de seguridad; no le metas claves reales sin revisarlo antes.
- Las sesiones en la nube reinstalan todo solas con el hook `.claude/hooks/session-start.sh`; la primera tarda unos 3 minutos.
- Hay 7 tests antiguos de domino-app que ya fallaban antes (faltan archivos y algunos usan `jest`). Pídeme arreglarlos cuando quieras.
