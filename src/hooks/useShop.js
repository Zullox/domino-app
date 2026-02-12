// ============================================================================
// HOOK: useShop - Gestión de la tienda con Firebase
// ============================================================================
import { useState, useCallback, useEffect } from 'react';
import { 
  SHOP_CATALOG, 
  getCatalogWithUserState,
  buyItem, 
  equipItem,
  getItemById,
  canAfford 
} from '../services/shop';
import { RARITY_COLORS } from '../constants/cosmetics';
import { subscribeToUser } from '../firestore';

export const useShop = (userId) => {
  // Estado
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Datos del usuario
  const [userTokens, setUserTokens] = useState(0);
  const [userCoins, setUserCoins] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [equipped, setEquipped] = useState({});
  
  // Categoría seleccionada
  const [category, setCategory] = useState('tiles');
  
  // Suscribirse a cambios del usuario
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    const unsubscribe = subscribeToUser(userId, (userData) => {
      setUserTokens(userData.tokens || 0);
      setUserCoins(userData.coins || 0);
      setInventory(userData.inventory || []);
      setEquipped(userData.equipped || {});
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [userId]);
  
  // Obtener items de la categoría actual con estado del usuario
  const items = getCatalogWithUserState(category, inventory, equipped);
  
  // Comprar item
  const purchase = useCallback(async (itemId) => {
    if (!userId) {
      setError('Debes iniciar sesión para comprar');
      return { success: false };
    }
    
    setPurchasing(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await buyItem(userId, itemId, category);
      
      if (result.success) {
        setSuccess(`¡Has comprado ${result.item.name}!`);
        // El estado se actualiza automáticamente por la suscripción
      } else {
        setError(result.error || 'Error al comprar');
      }
      
      return result;
    } catch (err) {
      setError('Error de conexión');
      return { success: false, error: err.message };
    } finally {
      setPurchasing(false);
    }
  }, [userId, category]);
  
  // Equipar item
  const equip = useCallback(async (itemId) => {
    if (!userId) {
      setError('Debes iniciar sesión');
      return { success: false };
    }
    
    try {
      const result = await equipItem(userId, itemId, category);
      
      if (result.success) {
        setSuccess('Item equipado');
      } else {
        setError(result.error || 'Error al equipar');
      }
      
      return result;
    } catch (err) {
      setError('Error de conexión');
      return { success: false };
    }
  }, [userId, category]);
  
  // Verificar si puede comprar un item
  const checkCanAfford = useCallback((item) => {
    const user = { tokens: userTokens, coins: userCoins };
    return canAfford(user, item);
  }, [userTokens, userCoins]);
  
  // Limpiar mensajes
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);
  
  // Auto-limpiar mensajes después de 3 segundos
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(clearMessages, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success, clearMessages]);
  
  return {
    // Estado
    loading,
    purchasing,
    error,
    success,
    
    // Datos
    items,
    category,
    userTokens,
    userCoins,
    inventory,
    equipped,
    
    // Constantes
    categories: Object.keys(SHOP_CATALOG),
    rarityColors: RARITY_COLORS,
    
    // Acciones
    setCategory,
    purchase,
    equip,
    checkCanAfford,
    clearMessages,
    
    // Utils
    getItemById
  };
};

export default useShop;
