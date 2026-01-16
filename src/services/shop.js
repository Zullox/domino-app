// ============================================================================
// SERVICIO: TIENDA - Conexión con Firebase
// ============================================================================
import { 
  purchaseItem as firestorePurchase, 
  equipCosmetic as firestoreEquip,
  addCurrency,
  updateUser,
  getUserById
} from '../firestore';

// ============================================================================
// CATÁLOGO DE ITEMS
// ============================================================================

export const SHOP_CATALOG = {
  // ═══════════════════════════════════════════════════════════════════════════
  // FICHAS (TILES)
  // ═══════════════════════════════════════════════════════════════════════════
  tiles: [
    // Gratis
    { id: 'classic_white', name: 'Blanco Clásico', price: 0, currency: 'tokens', rarity: 'common', free: true },
    { id: 'classic_ivory', name: 'Marfil Clásico', price: 0, currency: 'tokens', rarity: 'common', free: true },
    // Comunes
    { id: 'classic_cream', name: 'Crema', price: 100, currency: 'tokens', rarity: 'common' },
    { id: 'classic_gray', name: 'Gris Piedra', price: 150, currency: 'tokens', rarity: 'common' },
    // Poco comunes
    { id: 'obsidian', name: 'Obsidiana', price: 300, currency: 'tokens', rarity: 'uncommon' },
    { id: 'jade', name: 'Jade', price: 350, currency: 'tokens', rarity: 'uncommon' },
    { id: 'sapphire', name: 'Zafiro', price: 400, currency: 'tokens', rarity: 'uncommon' },
    { id: 'ruby', name: 'Rubí', price: 400, currency: 'tokens', rarity: 'uncommon' },
    // Raros
    { id: 'gold_plated', name: 'Bañado en Oro', price: 750, currency: 'tokens', rarity: 'rare' },
    { id: 'silver_frost', name: 'Plata Helada', price: 800, currency: 'tokens', rarity: 'rare' },
    { id: 'rose_gold', name: 'Oro Rosa', price: 850, currency: 'tokens', rarity: 'rare' },
    // Épicos
    { id: 'diamond_encrusted', name: 'Diamante', price: 50, currency: 'coins', rarity: 'epic' },
    { id: 'holographic', name: 'Holográfico', price: 75, currency: 'coins', rarity: 'epic' },
    { id: 'aurora', name: 'Aurora Boreal', price: 80, currency: 'coins', rarity: 'epic' },
    // Legendarios
    { id: 'neon_glow', name: 'Neón Brillante', price: 150, currency: 'coins', rarity: 'legendary' },
    { id: 'cosmic', name: 'Cósmico', price: 200, currency: 'coins', rarity: 'legendary' },
    { id: 'dragon_scale', name: 'Escama de Dragón', price: 250, currency: 'coins', rarity: 'legendary' }
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // TABLEROS (BOARDS)
  // ═══════════════════════════════════════════════════════════════════════════
  boards: [
    // Gratis
    { id: 'felt_green', name: 'Fieltro Verde', price: 0, currency: 'tokens', rarity: 'common', free: true },
    { id: 'felt_blue', name: 'Fieltro Azul', price: 0, currency: 'tokens', rarity: 'common', free: true },
    // Comunes
    { id: 'felt_red', name: 'Fieltro Rojo', price: 150, currency: 'tokens', rarity: 'common' },
    { id: 'felt_purple', name: 'Fieltro Púrpura', price: 150, currency: 'tokens', rarity: 'common' },
    // Poco comunes
    { id: 'wood_oak', name: 'Roble', price: 350, currency: 'tokens', rarity: 'uncommon' },
    { id: 'wood_mahogany', name: 'Caoba', price: 400, currency: 'tokens', rarity: 'uncommon' },
    { id: 'wood_bamboo', name: 'Bambú', price: 400, currency: 'tokens', rarity: 'uncommon' },
    // Raros
    { id: 'marble_white', name: 'Mármol Blanco', price: 700, currency: 'tokens', rarity: 'rare' },
    { id: 'marble_black', name: 'Mármol Negro', price: 750, currency: 'tokens', rarity: 'rare' },
    { id: 'leather', name: 'Cuero Premium', price: 800, currency: 'tokens', rarity: 'rare' },
    // Épicos
    { id: 'galaxy', name: 'Galaxia', price: 60, currency: 'coins', rarity: 'epic' },
    { id: 'underwater', name: 'Submarino', price: 70, currency: 'coins', rarity: 'epic' },
    { id: 'velvet_red', name: 'Terciopelo Real', price: 75, currency: 'coins', rarity: 'epic' },
    // Legendarios
    { id: 'aurora_board', name: 'Aurora', price: 150, currency: 'coins', rarity: 'legendary' },
    { id: 'volcano', name: 'Volcán', price: 175, currency: 'coins', rarity: 'legendary' },
    { id: 'crystal_cave', name: 'Cueva de Cristal', price: 200, currency: 'coins', rarity: 'legendary' }
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // AVATARES
  // ═══════════════════════════════════════════════════════════════════════════
  avatars: [
    // Gratis
    { id: 'default_1', name: 'Jugador 1', emoji: '😎', price: 0, currency: 'tokens', rarity: 'common', free: true },
    { id: 'default_2', name: 'Jugador 2', emoji: '🧔', price: 0, currency: 'tokens', rarity: 'common', free: true },
    { id: 'default_3', name: 'Jugador 3', emoji: '👩', price: 0, currency: 'tokens', rarity: 'common', free: true },
    // Comunes
    { id: 'cool', name: 'Cool', emoji: '😎', price: 100, currency: 'tokens', rarity: 'common' },
    { id: 'happy', name: 'Feliz', emoji: '😄', price: 100, currency: 'tokens', rarity: 'common' },
    { id: 'smart', name: 'Inteligente', emoji: '🤓', price: 150, currency: 'tokens', rarity: 'common' },
    // Poco comunes
    { id: 'crown', name: 'Rey', emoji: '👑', price: 300, currency: 'tokens', rarity: 'uncommon' },
    { id: 'star', name: 'Estrella', emoji: '⭐', price: 350, currency: 'tokens', rarity: 'uncommon' },
    { id: 'fire', name: 'En Llamas', emoji: '🔥', price: 400, currency: 'tokens', rarity: 'uncommon' },
    // Raros
    { id: 'dragon', name: 'Dragón', emoji: '🐉', price: 700, currency: 'tokens', rarity: 'rare' },
    { id: 'robot', name: 'Robot', emoji: '🤖', price: 750, currency: 'tokens', rarity: 'rare' },
    { id: 'alien', name: 'Alien', emoji: '👽', price: 800, currency: 'tokens', rarity: 'rare' },
    // Épicos
    { id: 'skull', name: 'Calavera', emoji: '💀', price: 50, currency: 'coins', rarity: 'epic' },
    { id: 'ghost', name: 'Fantasma', emoji: '👻', price: 60, currency: 'coins', rarity: 'epic' },
    { id: 'demon', name: 'Demonio', emoji: '😈', price: 70, currency: 'coins', rarity: 'epic' },
    // Legendarios
    { id: 'unicorn', name: 'Unicornio', emoji: '🦄', price: 100, currency: 'coins', rarity: 'legendary' },
    { id: 'phoenix', name: 'Fénix', emoji: '🔱', price: 150, currency: 'coins', rarity: 'legendary' },
    { id: 'diamond_avatar', name: 'Diamante', emoji: '💎', price: 200, currency: 'coins', rarity: 'legendary' }
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // MARCOS DE AVATAR (FRAMES)
  // ═══════════════════════════════════════════════════════════════════════════
  frames: [
    { id: 'frame_bronze', name: 'Bronce', price: 200, currency: 'tokens', rarity: 'common' },
    { id: 'frame_silver', name: 'Plata', price: 400, currency: 'tokens', rarity: 'uncommon' },
    { id: 'frame_gold', name: 'Oro', price: 800, currency: 'tokens', rarity: 'rare' },
    { id: 'frame_platinum', name: 'Platino', price: 50, currency: 'coins', rarity: 'epic' },
    { id: 'frame_diamond', name: 'Diamante', price: 100, currency: 'coins', rarity: 'epic' },
    { id: 'frame_legendary', name: 'Legendario', price: 200, currency: 'coins', rarity: 'legendary' },
    { id: 'frame_animated', name: 'Animado', price: 300, currency: 'coins', rarity: 'legendary' }
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // TÍTULOS
  // ═══════════════════════════════════════════════════════════════════════════
  titles: [
    { id: 'title_novato', name: 'Novato', price: 100, currency: 'tokens', rarity: 'common' },
    { id: 'title_jugador', name: 'Jugador', price: 200, currency: 'tokens', rarity: 'common' },
    { id: 'title_aficionado', name: 'Aficionado', price: 350, currency: 'tokens', rarity: 'uncommon' },
    { id: 'title_competidor', name: 'Competidor', price: 500, currency: 'tokens', rarity: 'uncommon' },
    { id: 'title_experto', name: 'Experto', price: 750, currency: 'tokens', rarity: 'rare' },
    { id: 'title_maestro', name: 'Maestro', price: 1000, currency: 'tokens', rarity: 'rare' },
    { id: 'title_campeon', name: 'Campeón', price: 75, currency: 'coins', rarity: 'epic' },
    { id: 'title_leyenda', name: 'Leyenda', price: 150, currency: 'coins', rarity: 'legendary' },
    { id: 'title_inmortal', name: 'Inmortal', price: 300, currency: 'coins', rarity: 'legendary' }
  ]
};

// Colores por rareza
export const RARITY_COLORS = {
  common: { bg: '#4B5563', border: '#6B7280', text: '#9CA3AF' },
  uncommon: { bg: '#065F46', border: '#10B981', text: '#34D399' },
  rare: { bg: '#1E40AF', border: '#3B82F6', text: '#60A5FA' },
  epic: { bg: '#5B21B6', border: '#8B5CF6', text: '#A78BFA' },
  legendary: { bg: '#92400E', border: '#F59E0B', text: '#FBBF24' }
};

// ============================================================================
// FUNCIONES DE TIENDA
// ============================================================================

/**
 * Obtener catálogo completo con estado del usuario
 */
export const getCatalogWithUserState = (category, inventory = [], equipped = {}) => {
  const items = SHOP_CATALOG[category] || [];
  
  return items.map(item => ({
    ...item,
    owned: inventory.includes(item.id),
    equipped: equipped[getSlotForCategory(category)] === item.id,
    rarityColor: RARITY_COLORS[item.rarity]
  }));
};

/**
 * Obtener slot de equipo para una categoría
 */
export const getSlotForCategory = (category) => {
  const slots = {
    tiles: 'tile',
    boards: 'board',
    avatars: 'avatar',
    frames: 'frame',
    titles: 'title'
  };
  return slots[category] || category;
};

/**
 * Comprar un item
 * @param {string} userId - ID del usuario
 * @param {string} itemId - ID del item
 * @param {string} category - Categoría (tiles, boards, avatars, etc.)
 * @returns {Object} Resultado de la compra
 */
export const buyItem = async (userId, itemId, category) => {
  try {
    // Buscar item en el catálogo
    const items = SHOP_CATALOG[category];
    const item = items?.find(i => i.id === itemId);
    
    if (!item) {
      return { success: false, error: 'Item no encontrado' };
    }
    
    if (item.free) {
      return { success: false, error: 'Este item es gratis' };
    }
    
    // Llamar a Firestore para realizar la compra
    const result = await firestorePurchase(userId, itemId, item.price, item.currency);
    
    if (result.success) {
      console.log(`✅ Compra exitosa: ${item.name}`);
      return { 
        success: true, 
        item,
        message: `¡Has comprado ${item.name}!`
      };
    }
    
    return result;
  } catch (error) {
    console.error('Error en buyItem:', error);
    return { success: false, error: 'Error al procesar la compra' };
  }
};

/**
 * Equipar un item
 * @param {string} userId - ID del usuario
 * @param {string} itemId - ID del item
 * @param {string} category - Categoría del item
 * @returns {Object} Resultado
 */
export const equipItem = async (userId, itemId, category) => {
  try {
    const slot = getSlotForCategory(category);
    const result = await firestoreEquip(userId, slot, itemId);
    
    if (result.success) {
      console.log(`✅ Equipado: ${itemId} en ${slot}`);
    }
    
    return result;
  } catch (error) {
    console.error('Error en equipItem:', error);
    return { success: false, error: 'Error al equipar' };
  }
};

/**
 * Desequipar un item (poner null)
 */
export const unequipItem = async (userId, category) => {
  try {
    const slot = getSlotForCategory(category);
    return await firestoreEquip(userId, slot, null);
  } catch (error) {
    console.error('Error en unequipItem:', error);
    return { success: false, error: 'Error al desequipar' };
  }
};

/**
 * Obtener item por ID
 */
export const getItemById = (itemId, category = null) => {
  if (category) {
    return SHOP_CATALOG[category]?.find(i => i.id === itemId);
  }
  
  // Buscar en todas las categorías
  for (const cat of Object.keys(SHOP_CATALOG)) {
    const item = SHOP_CATALOG[cat].find(i => i.id === itemId);
    if (item) return { ...item, category: cat };
  }
  
  return null;
};

/**
 * Verificar si el usuario puede comprar
 */
export const canAfford = (user, item) => {
  if (!user || !item) return false;
  if (item.free) return true;
  
  const balance = item.currency === 'tokens' ? user.tokens : user.coins;
  return (balance || 0) >= item.price;
};

/**
 * Obtener items por rareza
 */
export const getItemsByRarity = (rarity) => {
  const result = [];
  
  Object.entries(SHOP_CATALOG).forEach(([category, items]) => {
    items.filter(i => i.rarity === rarity).forEach(item => {
      result.push({ ...item, category });
    });
  });
  
  return result;
};

/**
 * Obtener items destacados (para mostrar en el menú)
 */
export const getFeaturedItems = () => {
  return [
    SHOP_CATALOG.tiles.find(i => i.rarity === 'legendary'),
    SHOP_CATALOG.boards.find(i => i.rarity === 'epic'),
    SHOP_CATALOG.avatars.find(i => i.rarity === 'legendary')
  ].filter(Boolean);
};

export default {
  SHOP_CATALOG,
  RARITY_COLORS,
  getCatalogWithUserState,
  getSlotForCategory,
  buyItem,
  equipItem,
  unequipItem,
  getItemById,
  canAfford,
  getItemsByRarity,
  getFeaturedItems
};
