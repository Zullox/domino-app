---
name: game-release
description: Preparar y publicar una versión del juego - build web, Android con Capacitor, versionado, despliegue del servidor y checklist de tienda. Usar al lanzar una versión.
---
# Release

## Checklist
- [ ] `npm test` y `npm run build` sin errores en `games/<juego>`.
- [ ] Subir `version` en package.json y `versionCode`/`versionName` en Android.
- [ ] Playtest (skill `game-playtest`) en móvil.
- [ ] Sin secretos en el repo (`.env*` ignorados); si hay backend, reglas de seguridad revisadas.
- [ ] Si hay servidor online: compatibilidad de protocolo entre versiones de cliente.

## Android (Capacitor)
Primera vez: `npm i @capacitor/core @capacitor/cli @capacitor/android && npx cap init && npx cap add android`. Después: `npm run build && npx cap sync android` → abrir en Android Studio → AAB firmado. (El dominó en Zullox/domino-app tiene un ejemplo en `ANDROID_CONFIG.md`.)

## Servidor
Railway, Render o Docker (ver `DEPLOY.md` de Zullox/domino-server como ejemplo). Desplegar servidor antes que cliente si cambia el protocolo.

## Tienda
Icono 512 px, feature graphic 1024×500, capturas de móvil, descripción, política de privacidad, clasificación de contenido.
