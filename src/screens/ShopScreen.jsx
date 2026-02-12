// ============================================================================
// PANTALLA: TIENDA - Conectada con Firebase
// ============================================================================
import React, { useState, memo, useCallback, useEffect } from 'react';
import { Button, Card, Badge, Modal } from '../components/ui';
import { useShop } from '../hooks/useShop';
import { RARITY_COLORS } from '../constants/cosmetics';

const CATEGORIES = [
  { id: 'tiles', name: 'Fichas', icon: '🎴' },
  { id: 'boards', name: 'Tableros', icon: '🎯' },
  { id: 'avatars', name: 'Avatares', icon: '👤' },
];

// Componente de item de tienda
const ShopItem = memo(({ item, category, onBuy, onEquip, canAfford, purchasing }) => {
  const rarityInfo = RARITY_COLORS[item.rarity] || RARITY_COLORS.common;
  const isFree = item.price === 0 || item.free;
  
  return (
    <div style={{
      background: '#1a1a24',
      borderRadius: 12,
      border: item.equipped ? '2px solid #F59E0B' : '1px solid #2a2a3a',
      padding: 12,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      opacity: purchasing ? 0.7 : 1,
      transition: 'opacity 0.2s'
    }}>
      {/* Badge de rareza */}
      <div style={{
        position: 'absolute',
        top: 8,
        right: 8
      }}>
        <Badge preset={item.rarity} size="xs">
          {rarityInfo.name}
        </Badge>
      </div>
      
      {/* Preview */}
      <div style={{
        width: 60,
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 32,
        marginBottom: 8,
        borderRadius: 8,
        background: category === 'boards' ? (item.color || '#12121a') : '#12121a'
      }}>
        {category === 'tiles' && (item.preview || '🎴')}
        {category === 'boards' && '🎯'}
        {category === 'avatars' && (item.emoji || '👤')}
      </div>
      
      {/* Nombre */}
      <div style={{ 
        color: '#fff', 
        fontSize: 12, 
        fontWeight: 600, 
        textAlign: 'center',
        marginBottom: 8
      }}>
        {item.name}
      </div>
      
      {/* Precio / Acción */}
      {item.owned ? (
        item.equipped ? (
          <div style={{
            padding: '6px 12px',
            background: 'rgba(245, 158, 11, 0.2)',
            borderRadius: 8,
            color: '#F59E0B',
            fontSize: 11,
            fontWeight: 600
          }}>
            ✓ Equipado
          </div>
        ) : (
          <button
            onClick={() => onEquip(item)}
            disabled={purchasing}
            style={{
              padding: '6px 12px',
              background: '#2a2a3a',
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Equipar
          </button>
        )
      ) : (
        <button
          onClick={() => onBuy(item)}
          disabled={purchasing || (!isFree && !canAfford)}
          style={{
            padding: '6px 12px',
            background: isFree 
              ? '#10B981' 
              : (!canAfford 
                ? '#4B5563' 
                : (item.currency === 'coins' ? '#F59E0B' : '#3B82F6')),
            border: 'none',
            borderRadius: 8,
            color: isFree ? '#fff' : (item.currency === 'coins' ? '#000' : '#fff'),
            fontSize: 11,
            fontWeight: 600,
            cursor: (!isFree && !canAfford) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            opacity: (!isFree && !canAfford) ? 0.6 : 1
          }}
        >
          {isFree ? '¡Gratis!' : (
            <>
              {item.price} {item.currency === 'coins' ? '💎' : '🪙'}
            </>
          )}
        </button>
      )}
    </div>
  );
});

// Toast de notificación
const Toast = memo(({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div style={{
      position: 'fixed',
      top: 80,
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '12px 24px',
      borderRadius: 12,
      background: type === 'error' ? '#EF4444' : '#10B981',
      color: '#fff',
      fontSize: 14,
      fontWeight: 600,
      zIndex: 200,
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      animation: 'slideDown 0.3s ease'
    }}>
      {type === 'error' ? '❌' : '✅'} {message}
    </div>
  );
});

// Pantalla principal de tienda
const ShopScreen = ({ 
  onClose, 
  userId,
  userTokens = 500, 
  userCoins = 0,
  inventory = ['classic_white', 'classic_ivory', 'felt_green', 'felt_blue', 'default_1', 'default_2', 'default_3'],
  equipped = { tile: 'classic_white', board: 'felt_green', avatar: 'default_1' },
  onUserUpdate
}) => {
  // Hook de tienda
  const shop = useShop(userId);
  
  // Estado local
  const [category, setCategory] = useState('tiles');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Usar datos del hook si está disponible, sino usar props
  const currentTokens = shop.userTokens ?? userTokens;
  const currentCoins = shop.userCoins ?? userCoins;
  const currentInventory = shop.inventory?.length > 0 ? shop.inventory : inventory;
  const currentEquipped = Object.keys(shop.equipped || {}).length > 0 ? shop.equipped : equipped;
  
  // Obtener items con estado
  const items = shop.items || [];
  
  // Cambiar categoría
  const handleCategoryChange = useCallback((newCategory) => {
    setCategory(newCategory);
    shop.setCategory(newCategory);
  }, [shop]);
  
  // Manejar compra
  const handleBuy = useCallback((item) => {
    setSelectedItem(item);
    setShowConfirm(true);
  }, []);
  
  const handleConfirmPurchase = useCallback(async () => {
    if (selectedItem) {
      const result = await shop.purchase(selectedItem.id);
      if (result.success && onUserUpdate) {
        // Notificar al padre para actualizar estado global
        onUserUpdate({
          inventory: [...currentInventory, selectedItem.id],
          [selectedItem.currency]: (selectedItem.currency === 'tokens' ? currentTokens : currentCoins) - selectedItem.price
        });
      }
    }
    setShowConfirm(false);
    setSelectedItem(null);
  }, [selectedItem, shop, onUserUpdate, currentInventory, currentTokens, currentCoins]);
  
  // Manejar equipar
  const handleEquip = useCallback(async (item) => {
    const result = await shop.equip(item.id);
    if (result.success && onUserUpdate) {
      const slot = category === 'tiles' ? 'tile' : category === 'boards' ? 'board' : 'avatar';
      onUserUpdate({
        equipped: { ...currentEquipped, [slot]: item.id }
      });
    }
  }, [shop, category, onUserUpdate, currentEquipped]);
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: '#0a0a0f',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Notificaciones */}
      {shop.error && (
        <Toast message={shop.error} type="error" onClose={shop.clearMessages} />
      )}
      {shop.success && (
        <Toast message={shop.success} type="success" onClose={shop.clearMessages} />
      )}
      
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #2a2a3a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#a0a0b0',
              fontSize: 24,
              cursor: 'pointer'
            }}
          >
            ←
          </button>
          <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 800, margin: 0 }}>
            🛒 Tienda
          </h1>
        </div>
        
        {/* Monedas */}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            background: '#1a1a24',
            borderRadius: 20
          }}>
            <span>🪙</span>
            <span style={{ color: '#F59E0B', fontWeight: 700 }}>
              {currentTokens.toLocaleString()}
            </span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            background: '#1a1a24',
            borderRadius: 20
          }}>
            <span>💎</span>
            <span style={{ color: '#60A5FA', fontWeight: 700 }}>
              {currentCoins.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
      
      {/* Categorías */}
      <div style={{
        display: 'flex',
        padding: '12px 16px',
        gap: 8,
        borderBottom: '1px solid #2a2a3a'
      }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: 10,
              border: 'none',
              background: category === cat.id 
                ? 'linear-gradient(135deg, #D97706, #F59E0B)' 
                : '#1a1a24',
              color: category === cat.id ? '#000' : '#fff',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <span>{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>
      
      {/* Loading */}
      {shop.loading ? (
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ color: '#a0a0b0' }}>Cargando...</div>
        </div>
      ) : (
        /* Grid de items */
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: 16
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 12
          }}>
            {items.map(item => (
              <ShopItem
                key={item.id}
                item={item}
                category={category}
                onBuy={handleBuy}
                onEquip={handleEquip}
                canAfford={shop.checkCanAfford(item)}
                purchasing={shop.purchasing}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Modal de confirmación */}
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirmar Compra"
        size="sm"
      >
        {selectedItem && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>
              {selectedItem.preview || selectedItem.emoji || '🎁'}
            </div>
            <h3 style={{ color: '#fff', marginBottom: 8 }}>{selectedItem.name}</h3>
            <Badge preset={selectedItem.rarity} style={{ marginBottom: 16 }}>
              {RARITY_COLORS[selectedItem.rarity]?.name}
            </Badge>
            
            <div style={{
              padding: 16,
              background: '#1a1a24',
              borderRadius: 12,
              marginBottom: 20
            }}>
              <div style={{ color: '#a0a0b0', fontSize: 13, marginBottom: 8 }}>
                Precio
              </div>
              <div style={{ 
                color: selectedItem.currency === 'coins' ? '#60A5FA' : '#F59E0B',
                fontSize: 24,
                fontWeight: 800
              }}>
                {selectedItem.price} {selectedItem.currency === 'coins' ? '💎' : '🪙'}
              </div>
              
              {/* Saldo después de compra */}
              <div style={{ 
                color: '#606070', 
                fontSize: 11, 
                marginTop: 8 
              }}>
                Saldo restante: {
                  selectedItem.currency === 'coins' 
                    ? currentCoins - selectedItem.price 
                    : currentTokens - selectedItem.price
                } {selectedItem.currency === 'coins' ? '💎' : '🪙'}
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: 10 }}>
              <Button 
                variant="ghost" 
                fullWidth 
                onClick={() => setShowConfirm(false)}
              >
                Cancelar
              </Button>
              <Button 
                variant="primary" 
                fullWidth 
                onClick={handleConfirmPurchase}
                loading={shop.purchasing}
                disabled={shop.purchasing}
              >
                {shop.purchasing ? 'Comprando...' : 'Comprar'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
      
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
};

export default memo(ShopScreen);
