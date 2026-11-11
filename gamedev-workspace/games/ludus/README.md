# Ludus: Blood and Glory

Juego de gestión de gladiadores (histórico, simulación). Diseño: [`docs/gdd/ludus.md`](../../docs/gdd/ludus.md).

```bash
cd games/ludus
npm install
npm run dev      # abre la URL que aparece (también desde el móvil en la misma wifi)
npm test         # tests de la lógica
```

## Estructura
- `src/game/` — lógica pura y determinista (sin React): `combat.js`, `ludus.js`, `gladiator.js`, `events.js`, `data.js`, `rng.js`. Tests en `src/game/__tests__/`.
- `src/ui/` — combate y arte SVG estilo fresco.
- `src/App.jsx` — pantallas de gestión (Ludus, Gladiadores, Mercado, Arena).

## Estado del prototipo (v0.1)
Hecho: 3 dificultades, 4 clases equilibradas, 12 rasgos, cicatrices, combate con postura + táctica + missio,
entrenamiento, 3 edificios, mercado, contratos, 10 eventos históricos, escalera de 9 combates con jefe final,
liberación con la rudis, muerte y bancarrota según la dificultad, guardado automático.

Siguiente: sonido, números de daño flotantes, retratos más variados, herrería y equipo, más arenas, Salón de la Fama con bonus.
