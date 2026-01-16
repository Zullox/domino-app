// ============================================================================
// PANTALLA: MENÚ PRINCIPAL
// ============================================================================
import React, { useState, memo, useEffect } from 'react';
import { Button, Card, Badge, ProgressBar } from '../components/ui';
import { getTranslation } from '../constants/i18n';
import { getRank, TIER_COLORS } from '../constants/game';
import SocketService from '../services/socket';

const C = {
  bg: { deep: '#0a0a0f', surface: '#12121a', elevated: '#1a1a24', card: '#1e1e2a', border: '#2a2a3a' },
  text: { primary: '#ffffff', secondary: '#a0a0b0', muted: '#606070' },
  gold: { main: '#F59E0B', dark: '#D97706', light: '#FBBF24' },
  accent: { blue: '#3B82F6', red: '#EF4444', green: '#10B981', purple: '#8B5CF6' }
};

// Tarjeta de perfil rápido
const QuickProfile = memo(({ user, rank, onPress }) => (
  <div 
    onClick={onPress}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: 16,
      background: C.bg.surface,
      borderRadius: 16,
      border: `1px solid ${C.bg.border}`,
      cursor: 'pointer'
    }}
  >
    {/* Avatar */}
    <div style={{
      width: 56,
      height: 56,
      borderRadius: '50%',
      background: `linear-gradient(135deg, ${TIER_COLORS[rank.tier]?.primary || '#666'}, ${TIER_COLORS[rank.tier]?.secondary || '#444'})`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 28,
      border: `3px solid ${TIER_COLORS[rank.tier]?.primary || '#666'}`
    }}>
      {user.avatar || '😎'}
    </div>
    
    {/* Info */}
    <div style={{ flex: 1 }}>
      <div style={{ color: C.text.primary, fontSize: 16, fontWeight: 700 }}>
        {user.name || 'Jugador'}
      </div>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 6,
        marginTop: 4
      }}>
        <span style={{ fontSize: 16 }}>{rank.icon}</span>
        <span style={{ color: TIER_COLORS[rank.tier]?.primary || '#fff', fontSize: 13, fontWeight: 600 }}>
          {rank.name}
        </span>
        <span style={{ color: C.text.muted, fontSize: 12 }}>
          {user.rating || 1500} MMR
        </span>
      </div>
      
      {/* Barra de progreso al siguiente rango */}
      <div style={{ marginTop: 8 }}>
        <ProgressBar 
          value={rank.progress || 50} 
          max={100} 
          height={4}
          color={TIER_COLORS[rank.tier]?.primary}
        />
      </div>
    </div>
    
    {/* Flecha */}
    <div style={{ color: C.text.muted, fontSize: 20 }}>›</div>
  </div>
));

// Tarjeta de monedas
const CurrencyCard = memo(({ tokens, coins, onBuyCoins }) => (
  <div style={{
    display: 'flex',
    gap: 8,
    marginTop: 12
  }}>
    {/* Tokens */}
    <div style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '10px 14px',
      background: C.bg.surface,
      borderRadius: 12,
      border: `1px solid ${C.bg.border}`
    }}>
      <span style={{ fontSize: 20 }}>🪙</span>
      <span style={{ color: C.gold.main, fontSize: 16, fontWeight: 700 }}>
        {(tokens || 0).toLocaleString()}
      </span>
    </div>
    
    {/* Coins */}
    <div 
      onClick={onBuyCoins}
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        background: C.bg.surface,
        borderRadius: 12,
        border: `1px solid ${C.bg.border}`,
        cursor: 'pointer'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 20 }}>💎</span>
        <span style={{ color: '#60A5FA', fontSize: 16, fontWeight: 700 }}>
          {(coins || 0).toLocaleString()}
        </span>
      </div>
      <span style={{ 
        color: C.gold.main, 
        fontSize: 18,
        background: 'rgba(245, 158, 11, 0.2)',
        borderRadius: 6,
        padding: '2px 8px'
      }}>+</span>
    </div>
  </div>
));

// Botón de modo de juego
const PlayModeButton = memo(({ icon, title, subtitle, variant, disabled, onClick }) => (
  <button
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    style={{
      width: '100%',
      padding: 20,
      borderRadius: 16,
      border: variant === 'primary' ? 'none' : `2px solid ${C.bg.border}`,
      background: variant === 'primary' 
        ? (disabled ? C.bg.elevated : `linear-gradient(135deg, ${C.gold.dark}, ${C.gold.main})`)
        : C.bg.surface,
      color: variant === 'primary' ? (disabled ? C.text.muted : C.bg.deep) : C.text.primary,
      fontSize: 18,
      fontWeight: 800,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      textAlign: 'left',
      transition: 'transform 150ms ease, opacity 150ms ease'
    }}
  >
    <span style={{ fontSize: 32 }}>{icon}</span>
    <div>
      <div>{title}</div>
      {subtitle && (
        <div style={{ 
          fontSize: 12, 
          fontWeight: 500, 
          opacity: 0.8,
          marginTop: 2
        }}>
          {subtitle}
        </div>
      )}
    </div>
  </button>
));

// Grid de accesos rápidos
const QuickAccessGrid = memo(({ items, t }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 8
  }}>
    {items.map((item, i) => (
      <button
        key={i}
        onClick={item.action}
        disabled={item.disabled}
        style={{
          background: C.bg.surface,
          borderRadius: 12,
          padding: 12,
          border: `1px solid ${C.bg.border}`,
          textAlign: 'center',
          cursor: item.disabled ? 'not-allowed' : 'pointer',
          opacity: item.disabled ? 0.5 : 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          position: 'relative'
        }}
      >
        <span style={{ fontSize: 24 }}>{item.icon}</span>
        <span style={{ color: C.text.primary, fontSize: 10, fontWeight: 600 }}>
          {item.label}
        </span>
        {item.badge && (
          <div style={{
            position: 'absolute',
            top: 6,
            right: 6,
            minWidth: 16,
            height: 16,
            borderRadius: 8,
            background: C.accent.red,
            color: '#fff',
            fontSize: 10,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {item.badge}
          </div>
        )}
      </button>
    ))}
  </div>
));

// Pantalla principal del menú
const MenuScreen = ({ 
  user = {},
  onPlayOnline,
  onPlayOffline,
  onOpenProfile,
  onOpenShop,
  onOpenRankings,
  onOpenFriends,
  onOpenAchievements,
  onOpenTournaments,
  onOpenInventory,
  onOpenStats,
  onOpenSettings,
  onOpenDailyRewards,
  language = 'es'
}) => {
  const t = (path) => getTranslation(path, language);
  const [connected, setConnected] = useState(SocketService.isConnected());
  const [playersOnline, setPlayersOnline] = useState(0);
  
  // Calcular rango del usuario
  const rank = getRank(user.rating || 1500);
  
  // Escuchar estado de conexión
  useEffect(() => {
    const unsubConnect = SocketService.on('onConnect', () => setConnected(true));
    const unsubDisconnect = SocketService.on('onDisconnect', () => setConnected(false));
    const unsubStats = SocketService.on('estadisticas', (data) => {
      setPlayersOnline(data.jugadoresOnline || 0);
    });
    
    return () => {
      unsubConnect();
      unsubDisconnect();
      unsubStats();
    };
  }, []);
  
  // Items del grid de acceso rápido
  const quickAccessItems = [
    { icon: '🏆', label: t('menu.rankings'), action: onOpenRankings },
    { icon: '👥', label: t('menu.friends'), action: onOpenFriends, badge: user.friendRequests },
    { icon: '🎖️', label: t('menu.achievements'), action: onOpenAchievements },
    { icon: '🛒', label: t('menu.shop'), action: onOpenShop },
    { icon: '🏅', label: t('menu.tournaments'), action: onOpenTournaments, disabled: true },
    { icon: '🎒', label: t('menu.inventory'), action: onOpenInventory },
    { icon: '📊', label: t('menu.stats'), action: onOpenStats },
    { icon: '⚙️', label: t('menu.settings'), action: onOpenSettings }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg.deep,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header con logo */}
      <div style={{
        padding: '50px 20px 16px',
        textAlign: 'center',
        background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.1) 0%, transparent 100%)'
      }}>
        <div style={{ fontSize: 52, marginBottom: 4 }}>🁣</div>
        <h1 style={{ 
          color: C.gold.main, 
          fontSize: 28, 
          fontWeight: 900,
          letterSpacing: 3,
          margin: 0
        }}>
          DOMINÓ
        </h1>
        <p style={{ color: C.text.muted, fontSize: 11, marginTop: 4, letterSpacing: 1 }}>
          CUBANO • RANKED EDITION
        </p>
      </div>
      
      {/* Contenido */}
      <div style={{ flex: 1, padding: '0 16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        
        {/* Perfil rápido */}
        <QuickProfile user={user} rank={rank} onPress={onOpenProfile} />
        
        {/* Monedas */}
        <CurrencyCard 
          tokens={user.tokens} 
          coins={user.coins}
          onBuyCoins={onOpenShop}
        />
        
        {/* Estado de conexión */}
        <div style={{
          padding: 12,
          borderRadius: 12,
          background: connected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${connected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: connected ? '#10B981' : '#EF4444',
              boxShadow: connected ? '0 0 8px #10B981' : 'none'
            }} />
            <span style={{ color: connected ? '#10B981' : '#EF4444', fontSize: 13, fontWeight: 600 }}>
              {connected ? t('menu.serverOnline') : t('menu.offlineMode')}
            </span>
          </div>
          {connected && playersOnline > 0 && (
            <span style={{ color: C.text.muted, fontSize: 12 }}>
              {playersOnline} {t('menu.playersOnline')}
            </span>
          )}
        </div>
        
        {/* Botones de juego */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <PlayModeButton
            icon="🌐"
            title={t('menu.playOnline')}
            subtitle={connected ? t('menu.rankedMatch') : t('menu.requiresConnection')}
            variant="primary"
            disabled={!connected}
            onClick={onPlayOnline}
          />
          
          <PlayModeButton
            icon="🤖"
            title={t('menu.playOffline')}
            subtitle={t('menu.practiceMode')}
            variant="secondary"
            onClick={onPlayOffline}
          />
        </div>
        
        {/* Recompensa diaria */}
        <button
          onClick={onOpenDailyRewards}
          style={{
            width: '100%',
            padding: 14,
            borderRadius: 12,
            border: '2px solid rgba(245, 158, 11, 0.3)',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>🎁</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ color: C.gold.main, fontSize: 14, fontWeight: 700 }}>
                {t('menu.dailyReward')}
              </div>
              <div style={{ color: C.text.muted, fontSize: 11 }}>
                {t('menu.claimNow')}
              </div>
            </div>
          </div>
          <Badge preset="warning" size="sm">¡NUEVO!</Badge>
        </button>
        
        {/* Accesos rápidos */}
        <div style={{ marginTop: 8 }}>
          <h3 style={{ 
            color: C.text.secondary, 
            fontSize: 12, 
            fontWeight: 600, 
            marginBottom: 10,
            textTransform: 'uppercase',
            letterSpacing: 1
          }}>
            {t('menu.quickAccess')}
          </h3>
          <QuickAccessGrid items={quickAccessItems} t={t} />
        </div>
      </div>
      
      {/* Footer */}
      <div style={{
        padding: '12px 20px',
        textAlign: 'center',
        borderTop: `1px solid ${C.bg.border}`
      }}>
        <p style={{ color: C.text.muted, fontSize: 10 }}>
          Dominó Cubano v2.1 • © 2024
        </p>
      </div>
    </div>
  );
};

export default memo(MenuScreen);
