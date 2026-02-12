// ============================================================================
// SERVICIO DE COMPRAS IN-APP (Google Play Billing)
// ============================================================================
// Maneja compras de moneda premium (coins) con dinero real
// Las compras se verifican en el servidor antes de entregar los coins
// ============================================================================

import { Platform } from './native';
import { SERVIDOR_URL } from '../constants/serverConfig';

// ============================================================================
// CATÁLOGO DE PRODUCTOS (debe coincidir con Google Play Console)
// ============================================================================

export const COIN_PACKS = [
  {
    id: 'coins_small',
    googleId: 'com.dominoranked.coins_100',
    coins: 100,
    bonusCoins: 0,
    price: '$0.99',
    priceAmount: 0.99,
    icon: '💎',
    label: '100 Diamantes',
    popular: false
  },
  {
    id: 'coins_medium',
    googleId: 'com.dominoranked.coins_500',
    coins: 500,
    bonusCoins: 50,
    price: '$4.99',
    priceAmount: 4.99,
    icon: '💎',
    label: '550 Diamantes',
    popular: true,
    tag: 'Más popular'
  },
  {
    id: 'coins_large',
    googleId: 'com.dominoranked.coins_1200',
    coins: 1200,
    bonusCoins: 200,
    price: '$9.99',
    priceAmount: 9.99,
    icon: '💎💎',
    label: '1400 Diamantes',
    popular: false,
    tag: 'Mejor valor'
  },
  {
    id: 'coins_mega',
    googleId: 'com.dominoranked.coins_3000',
    coins: 3000,
    bonusCoins: 800,
    price: '$19.99',
    priceAmount: 19.99,
    icon: '💎💎💎',
    label: '3800 Diamantes',
    popular: false,
    tag: 'Mega pack'
  }
];

// Pases de temporada
export const PREMIUM_PRODUCTS = [
  {
    id: 'season_pass',
    googleId: 'com.dominoranked.season_pass',
    price: '$4.99',
    priceAmount: 4.99,
    icon: '🏆',
    label: 'Pase de Temporada',
    description: 'Desbloquea recompensas premium de la temporada actual',
    type: 'season'
  }
];

// ============================================================================
// ESTADO
// ============================================================================

let purchasePlugin = null;
let isInitialized = false;

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

export const initPurchases = async () => {
  if (!Platform.isNative) {
    console.log('[IAP] Solo disponible en plataformas nativas');
    return false;
  }
  
  if (isInitialized) return true;
  
  try {
    // Usamos @capgo/capacitor-purchases o plugin nativo de billing
    // Alternativa: implementar con @anthropic/capacitor-iap
    const { Purchases } = await import('@capgo/capacitor-purchases');
    purchasePlugin = Purchases;
    
    // Registrar productos
    const productIds = [
      ...COIN_PACKS.map(p => p.googleId),
      ...PREMIUM_PRODUCTS.map(p => p.googleId)
    ];
    
    await purchasePlugin.configure({
      apiKey: import.meta.env.VITE_REVENUECAT_KEY || '',
    });
    
    isInitialized = true;
    console.log('[IAP] ✅ Inicializado');
    return true;
  } catch (e) {
    console.warn('[IAP] No disponible:', e.message);
    return false;
  }
};

// ============================================================================
// COMPRAR COINS
// ============================================================================

/**
 * Iniciar compra de un paquete de coins
 * @param {string} packId - ID del paquete (coins_small, coins_medium, etc.)
 * @param {string} userId - UID del usuario de Firebase
 * @returns {Promise<Object>} Resultado de la compra
 */
export const purchaseCoinPack = async (packId, userId) => {
  const pack = COIN_PACKS.find(p => p.id === packId);
  if (!pack) {
    return { success: false, error: 'Pack no encontrado' };
  }
  
  if (!Platform.isNative) {
    // Modo desarrollo: simular compra
    if (import.meta.env.DEV) {
      console.log(`[IAP] DEV: Simulando compra de ${pack.label}`);
      // Verificar en servidor (que también puede estar en dev)
      const verified = await verifyPurchaseOnServer({
        productId: pack.googleId,
        purchaseToken: 'DEV_TOKEN_' + Date.now(),
        userId,
        packId: pack.id,
        isDev: true
      });
      return verified;
    }
    return { success: false, error: 'No disponible en web' };
  }
  
  try {
    // Iniciar flujo de compra de Google Play
    const result = await purchasePlugin.purchaseProduct({
      productIdentifier: pack.googleId
    });
    
    if (!result || !result.purchaseToken) {
      return { success: false, error: 'Compra cancelada' };
    }
    
    // IMPORTANTE: Verificar la compra en el servidor
    const verified = await verifyPurchaseOnServer({
      productId: pack.googleId,
      purchaseToken: result.purchaseToken,
      orderId: result.orderId,
      userId,
      packId: pack.id
    });
    
    return verified;
  } catch (e) {
    if (e.code === 'USER_CANCELED') {
      return { success: false, error: 'cancelled' };
    }
    console.error('[IAP] Error compra:', e);
    return { success: false, error: e.message };
  }
};

// ============================================================================
// VERIFICACIÓN EN SERVIDOR
// ============================================================================

/**
 * Enviar receipt al servidor para verificar y entregar coins
 * NUNCA entregar coins desde el cliente - siempre verificar en servidor
 */
const verifyPurchaseOnServer = async (purchaseData) => {
  try {
    const response = await fetch(`${SERVIDOR_URL}/api/verify-purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(purchaseData)
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`[IAP] ✅ Compra verificada: +${data.coinsAdded} coins`);
      return {
        success: true,
        coinsAdded: data.coinsAdded,
        newBalance: data.newBalance
      };
    } else {
      console.error('[IAP] Verificación fallida:', data.error);
      return { success: false, error: data.error || 'Verificación fallida' };
    }
  } catch (e) {
    console.error('[IAP] Error verificación:', e);
    return { success: false, error: 'Error de conexión con el servidor' };
  }
};

// ============================================================================
// COMPRAR PASE DE TEMPORADA
// ============================================================================

export const purchaseSeasonPass = async (userId) => {
  const product = PREMIUM_PRODUCTS.find(p => p.id === 'season_pass');
  if (!product) return { success: false, error: 'Producto no encontrado' };
  
  if (!Platform.isNative) {
    if (import.meta.env.DEV) {
      return verifyPurchaseOnServer({
        productId: product.googleId,
        purchaseToken: 'DEV_SEASON_' + Date.now(),
        userId,
        packId: product.id,
        type: 'season_pass',
        isDev: true
      });
    }
    return { success: false, error: 'No disponible en web' };
  }
  
  try {
    const result = await purchasePlugin.purchaseProduct({
      productIdentifier: product.googleId
    });
    
    if (!result?.purchaseToken) {
      return { success: false, error: 'Compra cancelada' };
    }
    
    return verifyPurchaseOnServer({
      productId: product.googleId,
      purchaseToken: result.purchaseToken,
      orderId: result.orderId,
      userId,
      packId: product.id,
      type: 'season_pass'
    });
  } catch (e) {
    if (e.code === 'USER_CANCELED') {
      return { success: false, error: 'cancelled' };
    }
    return { success: false, error: e.message };
  }
};

// ============================================================================
// RESTAURAR COMPRAS
// ============================================================================

export const restorePurchases = async (userId) => {
  if (!purchasePlugin || !Platform.isNative) {
    return { success: false, error: 'No disponible' };
  }
  
  try {
    const result = await purchasePlugin.restorePurchases();
    
    if (result?.activeSubscriptions?.length > 0 || result?.nonConsumablePurchases?.length > 0) {
      // Verificar cada compra en el servidor
      for (const purchase of [...(result.activeSubscriptions || []), ...(result.nonConsumablePurchases || [])]) {
        await verifyPurchaseOnServer({
          productId: purchase.productIdentifier,
          purchaseToken: purchase.purchaseToken,
          userId,
          type: 'restore'
        });
      }
      return { success: true, restored: true };
    }
    
    return { success: true, restored: false, message: 'No hay compras que restaurar' };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

// ============================================================================
// HELPERS
// ============================================================================

export const getCoinPacks = () => COIN_PACKS;
export const getPremiumProducts = () => PREMIUM_PRODUCTS;
export const isIAPAvailable = () => Platform.isNative;

export default {
  initPurchases,
  purchaseCoinPack,
  purchaseSeasonPass,
  restorePurchases,
  getCoinPacks,
  getPremiumProducts,
  isIAPAvailable,
  COIN_PACKS,
  PREMIUM_PRODUCTS
};
