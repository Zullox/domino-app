# Iconos de la App

Necesitas generar los siguientes archivos PNG desde el favicon.svg:

## Archivos requeridos en /public/icons/

| Archivo | Tamaño | Uso |
|---------|--------|-----|
| icon-192.png | 192x192 | PWA manifest |
| icon-512.png | 512x512 | PWA manifest |
| icon-512-maskable.png | 512x512 | PWA manifest (maskable) |
| apple-touch-icon.png | 180x180 | iOS home screen |
| favicon-32.png | 32x32 | Browser tab |
| favicon-16.png | 16x16 | Browser tab |
| og-image.png | 1200x630 | Social media sharing |

## Para Android (en android/app/src/main/res/)

| Carpeta | Tamaño | Archivo |
|---------|--------|---------|
| mipmap-mdpi | 48x48 | ic_launcher.png |
| mipmap-hdpi | 72x72 | ic_launcher.png |
| mipmap-xhdpi | 96x96 | ic_launcher.png |
| mipmap-xxhdpi | 144x144 | ic_launcher.png |
| mipmap-xxxhdpi | 192x192 | ic_launcher.png |

## Generar automáticamente

Opción 1: Usar la herramienta online https://realfavicongenerator.net/
Opción 2: Con ImageMagick:

```bash
# Instalar ImageMagick si no lo tienes
# brew install imagemagick (Mac) o choco install imagemagick (Windows)

cd public/icons

# Desde el SVG base
convert ../favicon.svg -resize 192x192 icon-192.png
convert ../favicon.svg -resize 512x512 icon-512.png
convert ../favicon.svg -resize 512x512 icon-512-maskable.png
convert ../favicon.svg -resize 180x180 apple-touch-icon.png
convert ../favicon.svg -resize 32x32 favicon-32.png
convert ../favicon.svg -resize 16x16 favicon-16.png
```

Opción 3: Usar https://icon.kitchen/ para generar todos los tamaños Android
