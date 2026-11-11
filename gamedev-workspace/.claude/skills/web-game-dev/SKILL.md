---
name: web-game-dev
description: Implementar juegos o mecánicas para web/móvil con React, Canvas, Phaser, PixiJS o three.js, incluido game loop, estado, animación, input táctil y rendimiento. Usar al programar gameplay de cualquier juego en games/.
---
# Desarrollo de juegos web

## Elegir tecnología
| Necesidad | Usar |
|---|---|
| Juego de mesa / gestión / UI por turnos | React + CSS transforms/animations (como games/ludus) |
| 2D con muchas entidades, física, tilemaps | Phaser 3 (`npm i phaser`) |
| 2D de alto rendimiento solo render | PixiJS (`npm i pixi.js`) |
| 3D | three.js (`npm i three`) o @react-three/fiber |
| Audio | Web Audio / howler (`npm i howler`) |
| Juego nativo/escritorio | Godot 4 (`godot --headless`) |

## Principios
- **Lógica pura separada del render**: reglas en `games/<juego>/src/game/` como funciones puras y deterministas (estado → acción → nuevo estado). Así se testean con vitest y un servidor puede reutilizarlas.
- **Game loop**: `requestAnimationFrame` con delta time; nunca lógica atada a FPS.
- **Estado**: un único estado de partida serializable (sirve para guardar, reconectar y replays).
- **Input**: Pointer Events (unifica ratón y táctil); `touch-action: none` en el área de juego.
- **Rendimiento móvil**: animar solo `transform`/`opacity`, memoizar componentes de fichas, sprites en atlas, evitar re-renders de toda la mesa por cada jugada.
- **Aleatoriedad**: RNG con semilla para barajar (reproducible en tests y en servidor).
- **Juice**: cada acción con feedback (animación 150–250 ms, sonido, `@capacitor/haptics`).

## Verificación
1. `npm test` dentro de `games/<juego>` — tests de reglas.
2. `npm run build`.
3. Usar el skill `game-playtest` para probarlo en navegador real.
