---
name: game-playtest
description: Probar un juego en navegador real con Playwright - arrancar el dev server, jugar automáticamente, capturar pantallas en móvil y escritorio, medir FPS y detectar errores de consola. Usar tras cambios de gameplay o UI.
---
# Playtest automatizado

1. Arrancar dentro de `games/<juego>`: `npm run build && npx vite preview --port 4173 &` y esperar a que responda.
2. Script Playwright (Chromium preinstalado; `require('playwright')`, sin `playwright install`):
   - Viewports: `devices['Pixel 7']`, `devices['iPhone 14']` y 1280×800.
   - Capturar `page.on('console')` y `page.on('pageerror')`: cualquier error = fallo.
   - Recorrer el flujo principal del juego: menú → partida → varias acciones → fin de partida.
   - Capturas en cada paso a la carpeta scratchpad.
3. FPS: medir con `requestAnimationFrame` durante 3 s en `page.evaluate`; objetivo ≥ 55 FPS.
4. Revisar las capturas visualmente: solapamientos, texto cortado, objetivos táctiles pequeños.
5. Informar: pasos OK/fallidos, errores, FPS, capturas relevantes.
