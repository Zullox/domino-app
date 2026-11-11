---
name: game-assets
description: Crear, generar y procesar assets de juego - sprites, fichas, iconos, atlas, efectos de sonido, música y modelos 3D - con ImageMagick, SoX, ffmpeg, Blender, Pillow o generación por IA. Usar cuando haga falta arte o audio para un juego.
---
# Assets de juego

Herramientas disponibles en el entorno: `convert`/`magick` (ImageMagick), `sox`, `ffmpeg`, `blender` (headless: `blender -b -P script.py`), Python con Pillow/numpy, `godot --headless`. Generación por IA de imágenes, vídeo, audio y 3D (GLB) vía las herramientas MCP de Higgsfield si están conectadas.

## Imágenes / sprites
- Preferir **SVG** para personajes planos, UI e iconos (nítido en cualquier densidad).
- Raster: exportar @1x/@2x/@3x, PNG optimizado o WebP: `convert in.png -resize 50% -strip -quality 85 out.webp`.
- Atlas: `convert sprite_*.png +append atlas.png` (+ JSON con coordenadas) o Pillow.
- Recorte de fondo: `convert in.png -fuzz 10% -transparent white out.png`.

## Audio
- SFX cortos (<1 s) en `.ogg` + `.mp3` fallback, mono, 44.1 kHz.
- Generar tono/clic: `sox -n click.wav synth 0.05 sine 1200 fade 0 0.05 0.04`.
- Normalizar: `sox in.wav out.wav norm -3`; convertir: `ffmpeg -i in.wav -c:a libvorbis -q:a 4 out.ogg`.
- Música en bucle: verificar que el bucle sea limpio (fade en los extremos).

## 3D
- Blender headless para render de previews o exportar glTF: `blender -b model.blend -P export.py` con `bpy.ops.export_scene.gltf(filepath=...)`.
- Formato web: `.glb` comprimido.

## Reglas
- Guardar en `games/<juego>/public/assets/<tipo>/` con nombres en kebab-case.
- Solo arte original o con licencia compatible (CC0/CC-BY); anotar autoría/licencia en `games/<juego>/public/assets/CREDITS.md`.
- No imitar arte, personajes ni marcas de juegos existentes.
