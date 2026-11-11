---
description: Empezar un videojuego nuevo desde cero (idea → diseño → prototipo jugable)
argument-hint: <nombre-del-juego> [idea en una frase]
---
Vamos a crear un videojuego nuevo: $ARGUMENTS

Sigue estos pasos en orden y para a pedirme confirmación al final de los pasos 1 y 2:

1. **Idea**: si no te di la idea, hazme 3 preguntas cortas (género, plataforma, duración de partida) y propón 3 conceptos originales en una frase cada uno. No copies juegos existentes.
2. **Diseño**: con el agente `game-designer` y el skill `game-design-doc`, escribe `docs/gdd/<nombre>.md`, con un MVP pequeño que se pueda jugar en 1 día.
3. **Prototipo**: copia `templates/phaser-starter/` a `games/<nombre>/` (Phaser 4 + Vite; o Godot si el diseño lo pide) y, con el agente `gameplay-programmer`, implementa el core loop del MVP. Lógica pura en archivos aparte con tests.
4. **Arte y sonido**: con el agente `game-artist` crea assets provisionales originales (SVG/PNG y SFX con sox).
5. **Prueba**: con el agente `game-qa-tester` y el skill `game-playtest`, juega en móvil y escritorio, captura pantallas y lista los bugs. Corrige los graves.
6. **Resumen**: dime cómo ejecutarlo (`cd games/<nombre> && npm install && npm run dev`), qué funciona y qué propones para la siguiente iteración.

Haz commit al terminar cada paso.
