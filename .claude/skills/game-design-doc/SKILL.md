---
name: game-design-doc
description: Crear o actualizar el documento de diseño (GDD) de un videojuego - concepto, core loop, mecánicas, progresión, economía, monetización y alcance del MVP. Usar al empezar un juego nuevo, añadir un modo o cambiar reglas.
---
# Game Design Document (GDD)

Escribe el GDD en `docs/gdd/<juego>.md`. Secciones obligatorias:

1. **Pitch** (1 frase) y **pilares** (3 máximo): qué sensación debe dar el juego.
2. **Core loop**: acción → recompensa → progreso, en ciclo de 30 s, 5 min y 1 semana.
3. **Mecánicas y reglas**: exactas y verificables (sirven luego para tests). Para juegos de mesa (dominó), incluir reglas de puntuación, cierre/tranque y empates.
4. **Controles y UX**: táctil primero (móvil), objetivos táctiles ≥ 44 px, feedback (haptics, sonido, animación) en cada acción.
5. **Progresión y economía**: XP, rangos/ELO, monedas; tabla de fuentes y sumideros.
6. **Contenido y arte**: estilo, paleta, lista de assets necesarios (sprites, SFX, música).
7. **Multijugador** (si aplica): autoridad del servidor, matchmaking, reconexión, anti-trampas.
8. **Métricas**: retención D1/D7, duración de partida, abandono por pantalla.
9. **Alcance**: MVP / v1 / ideas futuras. Cortar sin piedad lo que no sea MVP.

Reglas: cada mecánica nueva debe tener un criterio de aceptación concreto; no copiar juegos existentes (nombres, personajes, arte) — diseñar original.
