// ============================================================================
// ASSET HELPERS - Funciones auxiliares para manejo de assets
// ============================================================================
// Migrado de DominoR.jsx líneas 3653-3718
// Detección de formatos, precarga y optimización de assets
// ============================================================================

// ============================================================================
// DETECCIÓN DE SOPORTE WebP
// ============================================================================
export const supportsWebP = (() => {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  } catch (e) {
    return false;
  }
})();

// ============================================================================
// GET ASSET URL - Determinar mejor URL de asset
// ============================================================================
// Prioridad: PNG > WebP > SVG > CSS fallback
export const getAssetUrl = (skin, type = 'tile') => {
  if (!skin) return { url: null, type: 'css', format: 'css' };
  
  // Prioridad 1: PNG específico (mejor para móviles, más rendimiento)
  if (skin.assetPng) {
    return { url: skin.assetPng, type: 'png', format: 'image' };
  }
  
  // Prioridad 2: WebP (más comprimido, moderno)
  if (skin.assetWebp) {
    return { url: skin.assetWebp, type: 'webp', format: 'image' };
  }
  
  // Prioridad 3: Asset genérico (puede ser SVG, PNG, etc.)
  if (skin.asset) {
    const ext = skin.asset.split('.').pop().toLowerCase();
    const format = ['svg'].includes(ext) ? 'svg' : 'image';
    return { url: skin.asset, type: ext, format };
  }
  
  // Sin asset - usar CSS fallback
  return { url: null, type: 'css', format: 'css' };
};

// ============================================================================
// GET BEST ASSET - Obtener mejor asset según dispositivo
// ============================================================================
export const getBestAsset = (skin, type = 'tile') => {
  if (!skin) return { url: null, type: 'css' };
  
  // En móviles, preferir PNG por rendimiento
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  if (isMobile && skin.assetPng) {
    return { url: skin.assetPng, type: 'png' };
  }
  
  if (supportsWebP && skin.assetWebp) {
    return { url: skin.assetWebp, type: 'webp' };
  }
  
  if (skin.assetPng) {
    return { url: skin.assetPng, type: 'png' };
  }
  
  if (skin.asset) {
    return { url: skin.asset, type: skin.asset.split('.').pop() };
  }
  
  return { url: null, type: 'css' };
};

// ============================================================================
// PRELOAD IMAGE - Precargar una imagen
// ============================================================================
export const preloadImage = (url) => {
  return new Promise((resolve, reject) => {
    if (!url) {
      resolve(null);
      return;
    }
    
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load: ${url}`));
    img.src = url;
  });
};

// ============================================================================
// PRELOAD SKIN ASSETS - Precargar todos los assets de skins
// ============================================================================
export const preloadSkinAssets = (skins) => {
  if (!skins || !Array.isArray(skins)) {
    console.warn('[Assets] No skins provided for preloading');
    return;
  }
  
  const urls = new Set();
  
  skins.forEach(skin => {
    if (skin.asset) urls.add(skin.asset);
    if (skin.assetPng) urls.add(skin.assetPng);
    if (skin.assetWebp) urls.add(skin.assetWebp);
    if (skin.png) urls.add(skin.png);
  });
  
  // Precargar imágenes
  urls.forEach(url => {
    const img = new Image();
    img.src = url;
  });
  
  console.log(`[Assets] Preloading ${urls.size} assets...`);
  return urls.size;
};

// ============================================================================
// PRELOAD ALL SKIN SETS - Precargar desde SKIN_SETS
// ============================================================================
export const preloadAllSkinSets = (SKIN_SETS) => {
  if (!SKIN_SETS) return 0;
  
  const urls = new Set();
  
  Object.values(SKIN_SETS).forEach(set => {
    if (set.tile?.png) urls.add(set.tile.png);
    if (set.board?.png) urls.add(set.board.png);
  });
  
  urls.forEach(url => {
    const img = new Image();
    img.src = url;
  });
  
  console.log(`[Assets] Preloading ${urls.size} skin set assets...`);
  return urls.size;
};

// ============================================================================
// IMAGE CACHE
// ============================================================================
const imageCache = new Map();

export const getCachedImage = (url) => imageCache.get(url) || null;

export const cacheImage = (url, image) => {
  if (url && image) {
    imageCache.set(url, image);
  }
};

export const clearImageCache = () => {
  imageCache.clear();
};

// ============================================================================
// CHECK IMAGE LOADED
// ============================================================================
export const isImageLoaded = (url) => {
  const cached = imageCache.get(url);
  return cached?.complete && cached?.naturalWidth > 0;
};

// ============================================================================
// LOAD AND CACHE IMAGE
// ============================================================================
export const loadAndCacheImage = async (url) => {
  if (!url) return null;
  
  const cached = imageCache.get(url);
  if (cached) return cached;
  
  try {
    const img = await preloadImage(url);
    if (img) {
      imageCache.set(url, img);
    }
    return img;
  } catch (e) {
    console.warn(`[Assets] Failed to load: ${url}`);
    return null;
  }
};

export default {
  supportsWebP,
  getAssetUrl,
  getBestAsset,
  preloadImage,
  preloadSkinAssets,
  preloadAllSkinSets,
  getCachedImage,
  cacheImage,
  clearImageCache,
  isImageLoaded,
  loadAndCacheImage
};
