# GameDev — estudio de videojuegos

Carpeta dedicada a crear videojuegos con Claude Code. Habla siempre en **español**.

## Estructura
- `games/<juego>/` — cada juego es un proyecto independiente (su propio `package.json`, tests y README).
- `templates/` — plantillas de partida (`phaser-starter`: Phaser 4 + Vite).
- `docs/gdd/<juego>.md` — documento de diseño de cada juego. Léelo antes de tocar un juego.
- `scripts/setup/` — instalación del PC (Windows y Mac/Linux).
- `.claude/` — agentes, skills, comando `/nuevo-juego`, plugins y hook de inicio.

## Juegos
| Juego | Carpeta | Estado |
|---|---|---|
| Ludus: Blood and Glory | `games/ludus` | Prototipo v0.1 jugable (gestión de gladiadores, histórico) |

## Forma de trabajar
- Juego nuevo → `/nuevo-juego <nombre>`.
- Lógica del juego **pura y determinista** en `games/<juego>/src/game/` (RNG con semilla), con tests vitest. La UI no contiene reglas.
- Antes de dar algo por terminado, dentro de la carpeta del juego: `npm test` y `npm run build`; para cambios visibles, playtest con el skill `game-playtest`.
- Equilibrio: cuando cambies números de combate o economía, simula miles de partidas y compara antes/después.
- Diseños y arte **originales**: no copiar nombres, personajes ni arte de juegos existentes.
- Actualiza la tabla de Juegos de este archivo y el GDD cuando cambie el estado de un juego.
- Commits pequeños y descriptivos en español.
