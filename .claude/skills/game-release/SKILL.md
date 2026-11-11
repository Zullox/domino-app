---
name: game-release
description: Preparar y publicar una versión del juego - build web, Android con Capacitor, versionado, despliegue del servidor y checklist de tienda. Usar al lanzar una versión.
---
# Release

## Checklist
- [ ] `npm test` y `npm run build` sin errores en domino-app; `npm test` en domino-server.
- [ ] Subir `version` en package.json y `versionCode`/`versionName` en Android.
- [ ] Playtest (skill `game-playtest`) en móvil.
- [ ] Reglas Firestore revisadas (`firestore.rules`), sin secretos en el repo (`.env*` ignorados).
- [ ] Servidor: compatibilidad de protocolo socket.io entre versiones de cliente.

## Android (Capacitor)
`npm run build && npx cap sync android` → abrir en Android Studio → AAB firmado. Ver `ANDROID_CONFIG.md`.

## Servidor
Despliegue según `domino-server/DEPLOY.md` (Railway/Render/Docker). Desplegar servidor antes que cliente si cambia el protocolo.

## Tienda
Icono 512 px, feature graphic 1024×500, capturas de móvil, descripción, política de privacidad, clasificación de contenido.
