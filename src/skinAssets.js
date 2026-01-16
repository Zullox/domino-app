// ============================================================================
// CONFIGURACIÓN DE ASSETS DE SKINS
// Prioridad: PNG > WebP > SVG > CSS fallback
// ============================================================================

export const TILE_ASSETS = {
  classic_white: {
    svg: '/assets/tiles/classic_white.svg',
    png: '/assets/tiles/classic_white.png',
  },
  obsidian: {
    svg: '/assets/tiles/obsidian.svg',
    png: '/assets/tiles/obsidian.png',
  },
  jade: {
    svg: '/assets/tiles/jade.svg',
    png: '/assets/tiles/jade.png',
  },
  gold_plated: {
    svg: '/assets/tiles/gold_plated.svg',
    png: '/assets/tiles/gold_plated.png',
  },
  diamond_encrusted: {
    svg: '/assets/tiles/diamond_encrusted.svg',
    png: '/assets/tiles/diamond_encrusted.png',
  },
  holographic: {
    svg: '/assets/tiles/holographic.svg',
    png: '/assets/tiles/holographic.png',
  },
  neon_glow: {
    svg: '/assets/tiles/neon_glow.svg',
    png: '/assets/tiles/neon_glow.png',
  },
  carbon_fiber: {
    svg: '/assets/tiles/carbon_fiber.svg',
    png: '/assets/tiles/carbon_fiber.png',
  }
};

export const BOARD_ASSETS = {
  felt_green: {
    svg: '/assets/boards/felt_green.svg',
    png: '/assets/boards/felt_green.png',
  },
  wood_oak: {
    svg: '/assets/boards/wood_oak.svg',
    png: '/assets/boards/wood_oak.png',
  },
  marble_white: {
    svg: '/assets/boards/marble_white.svg',
    png: '/assets/boards/marble_white.png',
  },
  galaxy: {
    svg: '/assets/boards/galaxy.svg',
    png: '/assets/boards/galaxy.png',
  }
};

// Detectar soporte WebP
const supportsWebP = (() => {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  } catch (e) {
    return false;
  }
})();

// Obtener mejor URL de asset
export const getBestAssetUrl = (assetConfig) => {
  if (!assetConfig) return null;
  if (assetConfig.png) return assetConfig.png;
  if (supportsWebP && assetConfig.webp) return assetConfig.webp;
  if (assetConfig.svg) return assetConfig.svg;
  return null;
};

// Precargar assets
export const preloadAssets = () => {
  const allAssets = [...Object.values(TILE_ASSETS), ...Object.values(BOARD_ASSETS)];
  const urls = new Set();
  
  allAssets.forEach(a => {
    if (a.png) urls.add(a.png);
    if (a.svg) urls.add(a.svg);
  });
  
  urls.forEach(url => { const img = new Image(); img.src = url; });
  console.log(`[Skins] Precargando ${urls.size} assets`);
};

export default { TILE_ASSETS, BOARD_ASSETS, getBestAssetUrl, preloadAssets };
