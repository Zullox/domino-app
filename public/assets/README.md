# 🎨 Assets de Skins - Dominó Cubano

## 🎯 Formatos Soportados

| Formato | Propiedad | Prioridad | Uso Recomendado |
|---------|-----------|-----------|-----------------|
| **PNG** | `assetPng` | 1 (más alta) | Móviles, rendimiento |
| **WebP** | `assetWebp` | 2 | Web moderna, comprimido |
| **SVG** | `asset` | 3 | Escalable, cualquier tamaño |
| **CSS** | - | 4 (fallback) | Si no hay assets |

---

## 📁 Estructura

```
public/assets/
├── tiles/              # Fichas (100x200px)
│   ├── classic_white.svg
│   ├── classic_white.png
│   ├── obsidian.svg
│   ├── obsidian.png
│   └── ...
└── boards/             # Tableros (400x400px)
    ├── felt_green.svg
    ├── felt_green.png
    └── ...
```

---

## 🖼️ Tamaños Recomendados

### Fichas
- **100x200px** - Normal (1x)
- **200x400px** - Retina (2x)

### Tableros
- **400x400px** - Normal (1x)
- **800x800px** - Retina (2x)

---

## 🎲 Ejemplos de Configuración

### Solo PNG
```javascript
mi_skin: {
  name: 'Mi Skin',
  assetPng: '/assets/tiles/mi_skin.png',
  base: '#1a1a1a',
  border: '#404040',
  dotStyle: 'solid',
  dotColor: '#ffffff'
}
```

### Múltiples Formatos
```javascript
mi_skin: {
  name: 'Mi Skin',
  asset: '/assets/tiles/mi_skin.svg',      // Fallback
  assetPng: '/assets/tiles/mi_skin.png',   // Móvil
  assetWebp: '/assets/tiles/mi_skin.webp', // Comprimido
  base: '#1a1a1a',
  border: '#404040'
}
```

### Con Filtro CSS
```javascript
variante_azul: {
  name: 'Variante Azul',
  assetPng: '/assets/tiles/base.png',
  tint: 'hue-rotate(180deg) saturate(150%)',
  base: '#0a1628',
  border: '#1e3a5f'
}
```

---

## 🔧 Crear desde SVG

```bash
# ImageMagick
convert tile.svg -resize 100x200 tile.png

# Inkscape
inkscape tile.svg --export-png=tile.png -w 100

# WebP desde PNG
cwebp -q 80 tile.png -o tile.webp
```

---

## 💡 Tips

- ✅ Usar **transparencia** en bordes
- ✅ Incluir **sombras internas**
- ✅ Optimizar con [TinyPNG](https://tinypng.com/)
- ❌ Evitar fondos opacos innecesarios
- ❌ Evitar tamaños > 500KB

---

¡Diviértete creando skins! 🎲
