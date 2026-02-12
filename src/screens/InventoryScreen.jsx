// ============================================================================
// PANTALLA: INVENTARIO
// ============================================================================
import React, { useState, memo } from 'react';
import { getTranslation } from '../constants/i18n';
import { 
  SKIN_SETS, MENU_BACKGROUNDS, AVATARS, PLAYER_TITLES,
  getSkinSet, getMenuBackground, getAvatar, getPlayerTitle,
  isTierUnlocked, getRarityColor
} from '../constants/cosmetics';

const C = {
  bg: { deep: '#0a0a0f', surface: '#12121a', elevated: '#1a1a24', border: '#2a2a3a' },
  text: { primary: '#ffffff', secondary: '#a0a0b0', muted: '#606070' },
  gold: { main: '#F59E0B', dark: '#D97706' },
  accent: { green: '#10B981', blue: '#3B82F6' }
};

const TABS = [
  { id: 'skins', icon: '🁣', label: 'inventory.skins' },
  { id: 'backgrounds', icon: '🖼️', label: 'inventory.backgrounds' },
  { id: 'avatars', icon: '😊', label: 'inventory.avatars' },
  { id: 'titles', icon: '🏷️', label: 'inventory.titles' }
];

const InventoryScreen = ({
  playerInventory = { skins: ['classic'], backgrounds: ['default'], avatars: ['default'], titles: ['novato'] },
  equippedCosmetics = { skin: 'classic', background: 'default', avatar: 'default', title: 'novato' },
  playerTier = 'bronze',
  onEquip,
  onClose,
  language = 'es'
}) => {
  const t = (path) => getTranslation(path, language);
  const [activeTab, setActiveTab] = useState('skins');
  
  const renderSkins = () => {
    const skins = Object.values(SKIN_SETS);
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {skins.map(skin => {
          const owned = playerInventory.skins?.includes(skin.id);
          const equipped = equippedCosmetics.skin === skin.id;
          
          return (
            <div key={skin.id} style={{
              background: C.bg.elevated,
              borderRadius: 12,
              padding: 12,
              border: equipped ? `2px solid ${C.gold.main}` : `1px solid ${C.bg.border}`,
              opacity: owned ? 1 : 0.5
            }}>
              {/* Preview */}
              <div style={{
                height: 80,
                borderRadius: 8,
                marginBottom: 8,
                background: skin.tile?.base || '#1a1a1a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px solid ${skin.tile?.border || '#333'}`
              }}>
                <div style={{
                  width: 50,
                  height: 25,
                  background: skin.tile?.base || '#fff',
                  borderRadius: 4,
                  border: `2px solid ${skin.tile?.border || '#333'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: skin.tile?.dotColor || '#000'
                  }} />
                </div>
              </div>
              
              {/* Info */}
              <div style={{ color: C.text.primary, fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                {skin.name}
              </div>
              <div style={{ 
                color: getRarityColor(skin.rarity), 
                fontSize: 10, 
                fontWeight: 600,
                marginBottom: 8
              }}>
                {t(`achievements.rarity.${skin.rarity}`)}
              </div>
              
              {/* Button */}
              {owned ? (
                <button 
                  onClick={() => onEquip?.('skin', skin.id)}
                  disabled={equipped}
                  style={{
                    width: '100%',
                    padding: 8,
                    borderRadius: 6,
                    border: 'none',
                    background: equipped ? C.accent.green : C.gold.main,
                    color: equipped ? '#fff' : C.bg.deep,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: equipped ? 'default' : 'pointer'
                  }}
                >
                  {equipped ? t('shop.equipped') : t('shop.equip')}
                </button>
              ) : (
                <div style={{ 
                  color: C.text.muted, 
                  fontSize: 11, 
                  textAlign: 'center' 
                }}>
                  {t('shop.locked')}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };
  
  const renderBackgrounds = () => {
    const backgrounds = Object.values(MENU_BACKGROUNDS);
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {backgrounds.map(bg => {
          const owned = playerInventory.backgrounds?.includes(bg.id);
          const equipped = equippedCosmetics.background === bg.id;
          
          return (
            <div key={bg.id} style={{
              background: C.bg.elevated,
              borderRadius: 12,
              padding: 12,
              border: equipped ? `2px solid ${C.gold.main}` : `1px solid ${C.bg.border}`,
              opacity: owned ? 1 : 0.5
            }}>
              <div style={{
                height: 100,
                borderRadius: 8,
                marginBottom: 8,
                background: bg.type === 'css' ? bg.background : (bg.fallbackColor || '#1a1a1a'),
                backgroundSize: 'cover'
              }} />
              
              <div style={{ color: C.text.primary, fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                {bg.name}
              </div>
              <div style={{ 
                color: getRarityColor(bg.rarity), 
                fontSize: 10, 
                fontWeight: 600,
                marginBottom: 8
              }}>
                {t(`achievements.rarity.${bg.rarity}`)}
              </div>
              
              {owned ? (
                <button 
                  onClick={() => onEquip?.('background', bg.id)}
                  disabled={equipped}
                  style={{
                    width: '100%',
                    padding: 8,
                    borderRadius: 6,
                    border: 'none',
                    background: equipped ? C.accent.green : C.gold.main,
                    color: equipped ? '#fff' : C.bg.deep,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: equipped ? 'default' : 'pointer'
                  }}
                >
                  {equipped ? t('shop.equipped') : t('shop.equip')}
                </button>
              ) : (
                <div style={{ color: C.text.muted, fontSize: 11, textAlign: 'center' }}>
                  {t('shop.locked')}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };
  
  const renderAvatars = () => {
    const avatars = Object.values(AVATARS);
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {avatars.map(avatar => {
          const unlocked = isTierUnlocked(playerTier, avatar.requiredTier);
          const equipped = equippedCosmetics.avatar === avatar.id;
          
          return (
            <div key={avatar.id} style={{
              background: C.bg.elevated,
              borderRadius: 12,
              padding: 12,
              textAlign: 'center',
              border: equipped ? `2px solid ${C.gold.main}` : `1px solid ${C.bg.border}`,
              opacity: unlocked ? 1 : 0.5
            }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>
                {avatar.type === 'emoji' ? avatar.emoji : (avatar.fallbackEmoji || '😊')}
              </div>
              
              <div style={{ color: C.text.primary, fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                {avatar.name}
              </div>
              
              {avatar.requiredTier && (
                <div style={{ color: C.text.muted, fontSize: 9, marginBottom: 8 }}>
                  {t('ranks.' + avatar.requiredTier)}
                </div>
              )}
              
              {unlocked ? (
                <button 
                  onClick={() => onEquip?.('avatar', avatar.id)}
                  disabled={equipped}
                  style={{
                    width: '100%',
                    padding: 6,
                    borderRadius: 6,
                    border: 'none',
                    background: equipped ? C.accent.green : C.gold.main,
                    color: equipped ? '#fff' : C.bg.deep,
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: equipped ? 'default' : 'pointer'
                  }}
                >
                  {equipped ? '✓' : t('shop.equip')}
                </button>
              ) : (
                <div style={{ color: C.text.muted, fontSize: 9 }}>🔒</div>
              )}
            </div>
          );
        })}
      </div>
    );
  };
  
  const renderTitles = () => {
    const titles = Object.values(PLAYER_TITLES);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {titles.map(title => {
          const unlocked = isTierUnlocked(playerTier, title.requiredTier);
          const equipped = equippedCosmetics.title === title.id;
          
          return (
            <div key={title.id} style={{
              background: C.bg.elevated,
              borderRadius: 10,
              padding: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: equipped ? `2px solid ${C.gold.main}` : `1px solid ${C.bg.border}`,
              opacity: unlocked ? 1 : 0.5
            }}>
              <div>
                <div style={{ 
                  color: title.color, 
                  fontSize: 14, 
                  fontWeight: 700,
                  textShadow: title.glow ? `0 0 10px ${title.color}` : 'none'
                }}>
                  {title.display}
                </div>
                {title.requiredTier && (
                  <div style={{ color: C.text.muted, fontSize: 10, marginTop: 2 }}>
                    {t('ranks.' + title.requiredTier)}
                  </div>
                )}
              </div>
              
              {unlocked ? (
                <button 
                  onClick={() => onEquip?.('title', title.id)}
                  disabled={equipped}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: 'none',
                    background: equipped ? C.accent.green : C.gold.main,
                    color: equipped ? '#fff' : C.bg.deep,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: equipped ? 'default' : 'pointer'
                  }}
                >
                  {equipped ? t('shop.equipped') : t('shop.equip')}
                </button>
              ) : (
                <span style={{ color: C.text.muted, fontSize: 16 }}>🔒</span>
              )}
            </div>
          );
        })}
      </div>
    );
  };
  
  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg.deep,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '50px 16px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${C.bg.border}`
      }}>
        <button onClick={onClose} style={{
          background: 'transparent',
          border: 'none',
          color: C.text.secondary,
          fontSize: 24,
          cursor: 'pointer',
          padding: 8
        }}>
          ←
        </button>
        <h1 style={{ color: C.text.primary, fontSize: 18, fontWeight: 800, margin: 0 }}>
          {t('inventory.title')}
        </h1>
        <div style={{ width: 40 }} />
      </div>
      
      {/* Tabs */}
      <div style={{
        display: 'flex',
        padding: '12px 16px',
        gap: 8,
        borderBottom: `1px solid ${C.bg.border}`
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 10,
              border: 'none',
              background: activeTab === tab.id ? C.gold.main : C.bg.elevated,
              color: activeTab === tab.id ? C.bg.deep : C.text.secondary,
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4
            }}
          >
            <span style={{ fontSize: 18 }}>{tab.icon}</span>
            <span>{t(tab.label)}</span>
          </button>
        ))}
      </div>
      
      {/* Content */}
      <div style={{ flex: 1, padding: 16, overflowY: 'auto' }}>
        {activeTab === 'skins' && renderSkins()}
        {activeTab === 'backgrounds' && renderBackgrounds()}
        {activeTab === 'avatars' && renderAvatars()}
        {activeTab === 'titles' && renderTitles()}
      </div>
    </div>
  );
};

export default memo(InventoryScreen);
