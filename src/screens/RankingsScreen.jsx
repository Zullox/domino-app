// ============================================================================
// PANTALLA: RANKINGS / CLASIFICACIÓN
// ============================================================================
import React, { useState, memo, useEffect } from 'react';
import { Button, Badge, ProgressBar } from '../components/ui';
import { getTranslation } from '../constants/i18n';
import { getRank, TIER_COLORS } from '../constants/game';

const C = {
  bg: { deep: '#0a0a0f', surface: '#12121a', elevated: '#1a1a24', border: '#2a2a3a' },
  text: { primary: '#ffffff', secondary: '#a0a0b0', muted: '#606070' },
  gold: { main: '#F59E0B' },
  accent: { green: '#10B981', red: '#EF4444', blue: '#3B82F6' }
};

// Tabs de categorías
const TABS = [
  { id: 'global', label: 'Global', icon: '🌍' },
  { id: 'season', label: 'Temporada', icon: '🏆' },
  { id: 'weekly', label: 'Semanal', icon: '📅' },
  { id: 'friends', label: 'Amigos', icon: '👥' }
];

// Posición en el podio
const PodiumPosition = memo(({ player, position, isMe }) => {
  const rank = getRank(player.rating);
  const tierColor = TIER_COLORS[rank.tier]?.primary || C.gold.main;
  
  const heights = { 1: 120, 2: 90, 3: 70 };
  const colors = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' };
  const emojis = { 1: '🥇', 2: '🥈', 3: '🥉' };
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      order: position === 1 ? 2 : position === 2 ? 1 : 3
    }}>
      {/* Avatar */}
      <div style={{
        width: position === 1 ? 64 : 52,
        height: position === 1 ? 64 : 52,
        borderRadius: '50%',
        background: C.bg.elevated,
        border: `3px solid ${colors[position]}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: position === 1 ? 32 : 26,
        marginBottom: 8,
        boxShadow: isMe ? `0 0 20px ${C.gold.main}` : 'none'
      }}>
        {player.avatar || '😎'}
      </div>
      
      {/* Nombre */}
      <div style={{
        color: isMe ? C.gold.main : C.text.primary,
        fontSize: 13,
        fontWeight: 700,
        marginBottom: 4,
        maxWidth: 80,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {player.name}
      </div>
      
      {/* Rating */}
      <div style={{ color: tierColor, fontSize: 12, fontWeight: 600 }}>
        {player.rating} MMR
      </div>
      
      {/* Pedestal */}
      <div style={{
        width: 80,
        height: heights[position],
        background: `linear-gradient(180deg, ${colors[position]}40, ${colors[position]}20)`,
        borderRadius: '8px 8px 0 0',
        marginTop: 12,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 12
      }}>
        <span style={{ fontSize: 28 }}>{emojis[position]}</span>
        <span style={{ color: colors[position], fontSize: 20, fontWeight: 900 }}>
          #{position}
        </span>
      </div>
    </div>
  );
});

// Fila de ranking
const RankingRow = memo(({ player, position, isMe, onPress }) => {
  const rank = getRank(player.rating);
  const tierColor = TIER_COLORS[rank.tier]?.primary || '#666';
  
  return (
    <div
      onClick={onPress}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        background: isMe ? 'rgba(245, 158, 11, 0.1)' : C.bg.surface,
        borderRadius: 12,
        border: isMe ? `1px solid ${C.gold.main}` : `1px solid ${C.bg.border}`,
        marginBottom: 8,
        cursor: 'pointer'
      }}
    >
      {/* Posición */}
      <div style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        background: position <= 10 ? `${tierColor}20` : C.bg.elevated,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: position <= 10 ? tierColor : C.text.muted,
        fontSize: 14,
        fontWeight: 800
      }}>
        {position}
      </div>
      
      {/* Avatar */}
      <div style={{
        width: 42,
        height: 42,
        borderRadius: '50%',
        background: C.bg.elevated,
        border: `2px solid ${tierColor}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20
      }}>
        {player.avatar || '😎'}
      </div>
      
      {/* Info */}
      <div style={{ flex: 1 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <span style={{ 
            color: isMe ? C.gold.main : C.text.primary, 
            fontSize: 14, 
            fontWeight: 700 
          }}>
            {player.name}
          </span>
          {isMe && (
            <Badge preset="warning" size="xs">TÚ</Badge>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
          <span style={{ fontSize: 14 }}>{rank.icon}</span>
          <span style={{ color: tierColor, fontSize: 11, fontWeight: 600 }}>
            {rank.name}
          </span>
        </div>
      </div>
      
      {/* Rating y stats */}
      <div style={{ textAlign: 'right' }}>
        <div style={{ color: C.text.primary, fontSize: 16, fontWeight: 700 }}>
          {player.rating}
        </div>
        <div style={{ color: C.text.muted, fontSize: 11 }}>
          {player.wins}W / {player.losses}L
        </div>
      </div>
    </div>
  );
});

// Mi posición flotante
const MyPositionBar = memo(({ player, position }) => {
  const rank = getRank(player.rating);
  
  return (
    <div style={{
      position: 'sticky',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 12,
      background: 'linear-gradient(180deg, transparent, rgba(10, 10, 15, 0.95))',
      borderTop: `1px solid ${C.bg.border}`
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        background: 'rgba(245, 158, 11, 0.15)',
        borderRadius: 12,
        border: `1px solid ${C.gold.main}`
      }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: C.gold.main,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#000',
          fontSize: 14,
          fontWeight: 900
        }}>
          #{position}
        </div>
        
        <div style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: C.bg.elevated,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20
        }}>
          {player.avatar || '😎'}
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ color: C.gold.main, fontSize: 14, fontWeight: 700 }}>
            {player.name}
          </div>
          <div style={{ color: C.text.secondary, fontSize: 12 }}>
            {rank.icon} {rank.name}
          </div>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: C.text.primary, fontSize: 18, fontWeight: 800 }}>
            {player.rating}
          </div>
          <div style={{ color: C.text.muted, fontSize: 11 }}>MMR</div>
        </div>
      </div>
    </div>
  );
});

// Pantalla principal de rankings
const RankingsScreen = ({
  currentUser = {},
  rankings = [],
  myPosition = 0,
  onClose,
  onPlayerPress,
  language = 'es'
}) => {
  const t = (path) => getTranslation(path, language);
  const [activeTab, setActiveTab] = useState('global');
  const [loading, setLoading] = useState(false);
  
  // Simular carga de datos
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [activeTab]);
  
  // Top 3 para el podio
  const topThree = rankings.slice(0, 3);
  
  // Resto del ranking
  const restOfRanking = rankings.slice(3);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: C.bg.deep,
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: `1px solid ${C.bg.border}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: C.text.secondary,
              fontSize: 24,
              cursor: 'pointer'
            }}
          >
            ←
          </button>
          <h1 style={{ color: C.text.primary, fontSize: 20, fontWeight: 800, margin: 0 }}>
            🏆 {t('rankings.title')}
          </h1>
        </div>
        
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8 }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '10px 8px',
                borderRadius: 10,
                border: 'none',
                background: activeTab === tab.id 
                  ? `linear-gradient(135deg, ${C.gold.main}, #D97706)`
                  : C.bg.elevated,
                color: activeTab === tab.id ? '#000' : C.text.secondary,
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2
              }}
            >
              <span style={{ fontSize: 16 }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Contenido */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 200,
            color: C.text.muted
          }}>
            Cargando...
          </div>
        ) : (
          <>
            {/* Podio (Top 3) */}
            {topThree.length >= 3 && (
              <div style={{
                padding: '20px 16px',
                background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.1), transparent)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end',
                gap: 8
              }}>
                {topThree.map((player, i) => (
                  <PodiumPosition
                    key={player.odId || i}
                    player={player}
                    position={i + 1}
                    isMe={player.odId === currentUser.odId}
                  />
                ))}
              </div>
            )}
            
            {/* Lista del resto */}
            <div style={{ padding: 16 }}>
              {restOfRanking.map((player, i) => (
                <RankingRow
                  key={player.odId || i}
                  player={player}
                  position={i + 4}
                  isMe={player.odId === currentUser.odId}
                  onPress={() => onPlayerPress?.(player)}
                />
              ))}
              
              {rankings.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: 40,
                  color: C.text.muted
                }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
                  <div>{t('rankings.noData')}</div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
      {/* Mi posición (si no estoy en top 10) */}
      {myPosition > 10 && (
        <MyPositionBar player={currentUser} position={myPosition} />
      )}
    </div>
  );
};

export default memo(RankingsScreen);
