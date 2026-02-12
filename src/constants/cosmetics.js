// ============================================================================
// SISTEMA DE COSMÉTICOS - Skins, Fondos, Avatares, Títulos
// ============================================================================

// Orden de tiers para comparación
export const TIER_ORDER = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster', 'legend'];

// Verificar si un tier cumple el requisito
export const isTierUnlocked = (playerTier, requiredTier) => {
  if (!requiredTier) return true;
  if (!playerTier) return false;
  const playerIndex = TIER_ORDER.indexOf(playerTier);
  const requiredIndex = TIER_ORDER.indexOf(requiredTier);
  return playerIndex >= requiredIndex;
};

// ============================================================================
// SISTEMA DE SKIN SETS - Fichas + Tableros
// ============================================================================
export const SKIN_SETS = {
  classic: {
    id: 'classic',
    name: 'Clásico',
    type: 'css',
    price: 0,
    currency: 'tokens',
    rarity: 'common',
    tile: {
      base: '#FFFFF0',
      border: '#8B7355',
      divider: '#A0522D',
      dotColor: '#1a1a1a'
    },
    board: {
      background: '#1a4d2e',
      accent: '#2D5A3D',
      border: '#0d2e1a'
    }
  },
  wooden: {
    id: 'wooden',
    name: 'Madera Noble',
    type: 'css',
    price: 200,
    currency: 'tokens',
    rarity: 'rare',
    tile: {
      base: '#DEB887',
      border: '#8B4513',
      divider: '#A0522D',
      dotColor: '#2F1810'
    },
    board: {
      background: '#3D2314',
      accent: '#5D3A1A',
      border: '#2A1608'
    }
  },
  midnight: {
    id: 'midnight',
    name: 'Medianoche',
    type: 'css',
    price: 300,
    currency: 'tokens',
    rarity: 'epic',
    tile: {
      base: '#1a1a2e',
      border: '#4a4a6a',
      divider: '#3a3a5a',
      dotColor: '#60A5FA'
    },
    board: {
      background: '#0a0a1a',
      accent: '#1a1a3a',
      border: '#050510'
    }
  },
  golden: {
    id: 'golden',
    name: 'Oro Real',
    type: 'css',
    price: 50,
    currency: 'coins',
    rarity: 'legendary',
    tile: {
      base: '#FFF8DC',
      border: '#DAA520',
      divider: '#B8860B',
      dotColor: '#8B4513'
    },
    board: {
      background: '#1a1408',
      accent: '#3D2A0A',
      border: '#0d0a04'
    }
  },
  neon: {
    id: 'neon',
    name: 'Neón',
    type: 'css',
    price: 400,
    currency: 'tokens',
    rarity: 'epic',
    tile: {
      base: '#0d0d0d',
      border: '#00FF88',
      divider: '#00CC66',
      dotColor: '#00FF88'
    },
    board: {
      background: '#050505',
      accent: '#0a0a0a',
      border: '#00FF88'
    }
  }
};

// Cache de imágenes de skins
const skinImageCache = { tiles: {}, boards: {} };

export const preloadSkinSet = (setId) => {
  const set = SKIN_SETS[setId];
  if (!set || set.type !== 'png') return;
  
  if (set.tile?.png && !skinImageCache.tiles[setId]) {
    const img = new Image();
    img.src = set.tile.png;
    img.onload = () => { skinImageCache.tiles[setId] = img; };
    img.onerror = () => { skinImageCache.tiles[setId] = null; };
  }
  
  if (set.board?.png && !skinImageCache.boards[setId]) {
    const img = new Image();
    img.src = set.board.png;
    img.onload = () => { skinImageCache.boards[setId] = img; };
    img.onerror = () => { skinImageCache.boards[setId] = null; };
  }
};

export const getSkinSet = (setId) => SKIN_SETS[setId] || SKIN_SETS.classic;
export const getTileImage = (setId) => skinImageCache.tiles[setId] || null;
export const getBoardImage = (setId) => skinImageCache.boards[setId] || null;

export const getTileSkin = (setId) => {
  const set = getSkinSet(setId);
  return { ...set.tile, type: set.type, png: set.tile?.png };
};

export const getBoardSkin = (setId) => {
  const set = getSkinSet(setId);
  return { ...set.board, type: set.type, png: set.board?.png };
};

// ============================================================================
// SISTEMA DE FONDOS DE MENÚ
// ============================================================================
export const MENU_BACKGROUNDS = {
  default: {
    id: 'default',
    name: 'Clásico',
    type: 'css',
    price: 0,
    currency: 'tokens',
    rarity: 'common',
    background: `
      radial-gradient(ellipse at 20% 20%, rgba(30, 107, 58, 0.3) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 80%, rgba(139, 90, 43, 0.2) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 50%, rgba(218, 165, 32, 0.1) 0%, transparent 70%),
      linear-gradient(180deg, #0d1117 0%, #161b22 50%, #0d1117 100%)
    `
  },
  casino_royal: {
    id: 'casino_royal',
    name: 'Casino Royal',
    type: 'css',
    price: 200,
    currency: 'tokens',
    rarity: 'rare',
    background: `
      radial-gradient(ellipse at 50% 30%, rgba(139, 69, 19, 0.4) 0%, transparent 60%),
      radial-gradient(ellipse at 20% 80%, rgba(218, 165, 32, 0.2) 0%, transparent 50%),
      linear-gradient(180deg, #1a0a00 0%, #2d1810 50%, #0d0500 100%)
    `
  },
  midnight_blue: {
    id: 'midnight_blue',
    name: 'Medianoche',
    type: 'css',
    price: 150,
    currency: 'tokens',
    rarity: 'uncommon',
    background: `
      radial-gradient(ellipse at 30% 20%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
      radial-gradient(ellipse at 70% 70%, rgba(139, 92, 246, 0.2) 0%, transparent 50%),
      linear-gradient(180deg, #0a0a1a 0%, #1a1a3a 50%, #0a0a1a 100%)
    `
  },
  emerald_luxury: {
    id: 'emerald_luxury',
    name: 'Esmeralda',
    type: 'css',
    price: 300,
    currency: 'tokens',
    rarity: 'epic',
    background: `
      radial-gradient(ellipse at 50% 50%, rgba(16, 185, 129, 0.3) 0%, transparent 60%),
      radial-gradient(ellipse at 20% 30%, rgba(6, 95, 70, 0.4) 0%, transparent 50%),
      linear-gradient(180deg, #021a0f 0%, #0d3320 50%, #021a0f 100%)
    `
  },
  sunset_gold: {
    id: 'sunset_gold',
    name: 'Atardecer Dorado',
    type: 'css',
    price: 25,
    currency: 'coins',
    rarity: 'legendary',
    background: `
      radial-gradient(ellipse at 50% 20%, rgba(251, 191, 36, 0.4) 0%, transparent 50%),
      radial-gradient(ellipse at 30% 60%, rgba(239, 68, 68, 0.2) 0%, transparent 50%),
      linear-gradient(180deg, #1a1005 0%, #2d1810 50%, #0a0500 100%)
    `
  }
};

const menuBackgroundCache = {};

export const preloadMenuBackground = (bgId) => {
  const bg = MENU_BACKGROUNDS[bgId];
  if (bg?.type === 'png' && bg.png && !menuBackgroundCache[bgId]) {
    const img = new Image();
    img.src = bg.png;
    img.onload = () => { menuBackgroundCache[bgId] = img; };
    img.onerror = () => { menuBackgroundCache[bgId] = null; };
  }
};

export const getMenuBackground = (bgId) => MENU_BACKGROUNDS[bgId] || MENU_BACKGROUNDS.default;
export const getMenuBackgroundImage = (bgId) => menuBackgroundCache[bgId] || null;

// ============================================================================
// SISTEMA DE AVATARES
// ============================================================================
export const AVATARS = {
  default: {
    id: 'default',
    name: 'Novato',
    type: 'emoji',
    emoji: '😊',
    requiredTier: null,
    description: 'Avatar inicial'
  },
  cool: {
    id: 'cool',
    name: 'Genial',
    type: 'emoji',
    emoji: '😎',
    requiredTier: null,
    description: 'Para los cool'
  },
  bronze_medal: {
    id: 'bronze_medal',
    name: 'Medalla de Bronce',
    type: 'emoji',
    emoji: '🥉',
    requiredTier: 'bronze',
    description: 'Alcanza Bronce'
  },
  silver_medal: {
    id: 'silver_medal',
    name: 'Medalla de Plata',
    type: 'emoji',
    emoji: '🥈',
    requiredTier: 'silver',
    description: 'Alcanza Plata'
  },
  gold_medal: {
    id: 'gold_medal',
    name: 'Medalla de Oro',
    type: 'emoji',
    emoji: '🥇',
    requiredTier: 'gold',
    description: 'Alcanza Oro'
  },
  diamond: {
    id: 'diamond',
    name: 'Diamante',
    type: 'emoji',
    emoji: '💎',
    requiredTier: 'platinum',
    description: 'Alcanza Platino'
  },
  gem: {
    id: 'gem',
    name: 'Gema',
    type: 'emoji',
    emoji: '💠',
    requiredTier: 'diamond',
    description: 'Alcanza Diamante'
  },
  crown: {
    id: 'crown',
    name: 'Corona',
    type: 'emoji',
    emoji: '👑',
    requiredTier: 'master',
    description: 'Alcanza Maestro'
  },
  trophy: {
    id: 'trophy',
    name: 'Trofeo',
    type: 'emoji',
    emoji: '🏆',
    requiredTier: 'grandmaster',
    description: 'Alcanza Gran Maestro'
  },
  star: {
    id: 'star',
    name: 'Estrella',
    type: 'emoji',
    emoji: '⭐',
    requiredTier: 'legend',
    description: 'Alcanza Leyenda'
  }
};

const avatarImageCache = {};

export const preloadAvatar = (avatarId) => {
  const avatar = AVATARS[avatarId];
  if (avatar?.type === 'png' && avatar.png && !avatarImageCache[avatarId]) {
    const img = new Image();
    img.src = avatar.png;
    img.onload = () => { avatarImageCache[avatarId] = img; };
    img.onerror = () => { avatarImageCache[avatarId] = null; };
  }
};

export const getAvatar = (avatarId) => AVATARS[avatarId] || AVATARS.default;
export const getAvatarImage = (avatarId) => avatarImageCache[avatarId] || null;

export const getAvatarDisplay = (avatar) => {
  if (!avatar) return '😊';
  if (avatar.type === 'emoji') return avatar.emoji;
  if (avatar.type === 'png' && avatarImageCache[avatar.id]) return avatarImageCache[avatar.id];
  return avatar.fallbackEmoji || '😊';
};

// ============================================================================
// SISTEMA DE TÍTULOS
// ============================================================================
export const PLAYER_TITLES = {
  novato: {
    id: 'novato',
    name: 'Novato',
    display: 'Novato',
    requiredTier: null,
    color: '#9CA3AF',
    description: 'Título inicial'
  },
  aprendiz: {
    id: 'aprendiz',
    name: 'Aprendiz',
    display: 'Aprendiz',
    requiredTier: 'bronze',
    color: '#CD7F32',
    description: 'Alcanza Bronce'
  },
  competidor: {
    id: 'competidor',
    name: 'Competidor',
    display: 'Competidor',
    requiredTier: 'silver',
    color: '#C0C0C0',
    description: 'Alcanza Plata'
  },
  veterano: {
    id: 'veterano',
    name: 'Veterano',
    display: 'Veterano',
    requiredTier: 'gold',
    color: '#FFD700',
    description: 'Alcanza Oro'
  },
  estratega: {
    id: 'estratega',
    name: 'Estratega',
    display: 'Estratega',
    requiredTier: 'gold',
    color: '#FFD700',
    description: 'Alcanza Oro'
  },
  experto: {
    id: 'experto',
    name: 'Experto',
    display: 'Experto',
    requiredTier: 'platinum',
    color: '#E5E4E2',
    description: 'Alcanza Platino'
  },
  dominador: {
    id: 'dominador',
    name: 'Dominador',
    display: 'Dominador',
    requiredTier: 'platinum',
    color: '#E5E4E2',
    description: 'Alcanza Platino'
  },
  elite: {
    id: 'elite',
    name: 'Élite',
    display: 'Élite',
    requiredTier: 'diamond',
    color: '#B9F2FF',
    description: 'Alcanza Diamante'
  },
  imparable: {
    id: 'imparable',
    name: 'Imparable',
    display: 'Imparable',
    requiredTier: 'diamond',
    color: '#B9F2FF',
    description: 'Alcanza Diamante'
  },
  maestro: {
    id: 'maestro',
    name: 'Maestro',
    display: 'Maestro',
    requiredTier: 'master',
    color: '#9333EA',
    description: 'Alcanza Maestro'
  },
  virtuoso: {
    id: 'virtuoso',
    name: 'Virtuoso',
    display: 'Virtuoso',
    requiredTier: 'master',
    color: '#9333EA',
    description: 'Alcanza Maestro'
  },
  leyenda_viva: {
    id: 'leyenda_viva',
    name: 'Leyenda Viva',
    display: 'Leyenda Viva',
    requiredTier: 'grandmaster',
    color: '#F59E0B',
    description: 'Alcanza Gran Maestro'
  },
  invencible: {
    id: 'invencible',
    name: 'Invencible',
    display: 'Invencible',
    requiredTier: 'grandmaster',
    color: '#F59E0B',
    description: 'Alcanza Gran Maestro'
  },
  dios_domino: {
    id: 'dios_domino',
    name: 'Dios del Dominó',
    display: '⭐ Dios del Dominó ⭐',
    requiredTier: 'legend',
    color: '#EF4444',
    glow: true,
    description: 'Alcanza Leyenda'
  },
  inmortal: {
    id: 'inmortal',
    name: 'Inmortal',
    display: '✨ Inmortal ✨',
    requiredTier: 'legend',
    color: '#EF4444',
    glow: true,
    description: 'Alcanza Leyenda'
  }
};

export const getPlayerTitle = (titleId) => PLAYER_TITLES[titleId] || PLAYER_TITLES.novato;

// ============================================================================
// UTILIDADES
// ============================================================================
export const RARITY_COLORS = {
  common:    { color: '#9CA3AF', bg: '#4B5563', border: '#6B7280', text: '#9CA3AF', name: 'Común' },
  uncommon:  { color: '#22C55E', bg: '#065F46', border: '#10B981', text: '#34D399', name: 'Poco Común' },
  rare:      { color: '#3B82F6', bg: '#1E40AF', border: '#3B82F6', text: '#60A5FA', name: 'Raro' },
  epic:      { color: '#A855F7', bg: '#5B21B6', border: '#8B5CF6', text: '#A78BFA', name: 'Épico' },
  legendary: { color: '#F59E0B', bg: '#92400E', border: '#F59E0B', text: '#FBBF24', name: 'Legendario' }
};

export const getRarityColor = (rarity) => (RARITY_COLORS[rarity] || RARITY_COLORS.common).color;

// ============================================================================
// DOT COLORS - Colores de puntos según skin y valor
// ============================================================================
const DEFAULT_DOT_COLORS = {
  0: '#1a1a1a',
  1: '#1a1a1a',
  2: '#1a1a1a',
  3: '#1a1a1a',
  4: '#1a1a1a',
  5: '#1a1a1a',
  6: '#1a1a1a',
  7: '#1a1a1a',
  8: '#1a1a1a',
  9: '#1a1a1a'
};

export const getDotColor = (value, skinSetId = 'classic') => {
  const set = getSkinSet(skinSetId);
  
  // Si el skin tiene colores de puntos personalizados
  if (set.tile?.dotColors && set.tile.dotColors[value] !== undefined) {
    return set.tile.dotColors[value];
  }
  
  // Si el skin tiene un color de punto único
  if (set.tile?.dotColor) {
    return set.tile.dotColor;
  }
  
  // Color por defecto
  return DEFAULT_DOT_COLORS[value] || '#1a1a1a';
};

// Precargar todos los assets al inicio
export const preloadAllAssets = () => {
  Object.keys(SKIN_SETS).forEach(id => preloadSkinSet(id));
  Object.keys(MENU_BACKGROUNDS).forEach(id => preloadMenuBackground(id));
  Object.keys(AVATARS).forEach(id => preloadAvatar(id));
};

export default {
  SKIN_SETS, MENU_BACKGROUNDS, AVATARS, PLAYER_TITLES,
  TIER_ORDER, RARITY_COLORS,
  getSkinSet, getTileSkin, getBoardSkin, getDotColor,
  getMenuBackground, getAvatar, getPlayerTitle,
  isTierUnlocked, getRarityColor, preloadAllAssets
};
