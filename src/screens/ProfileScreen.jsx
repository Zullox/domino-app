// ============================================================================
// PANTALLA: PERFIL DEL JUGADOR
// ============================================================================
import React, { useState, memo } from 'react';
import { Button, Card, Badge, ProgressBar, Modal } from '../components/ui';
import { getTranslation } from '../constants/i18n';
import { getRank, TIER_COLORS, RANKS } from '../constants/game';

const C = {
  bg: { deep: '#0a0a0f', surface: '#12121a', elevated: '#1a1a24', border: '#2a2a3a' },
  text: { primary: '#ffffff', secondary: '#a0a0b0', muted: '#606070' },
  gold: { main: '#F59E0B' },
  accent: { green: '#10B981', red: '#EF4444', blue: '#3B82F6' }
};

// Estadística individual
const StatItem = memo(({ icon, label, value, subValue }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 0',
    borderBottom: `1px solid ${C.bg.border}`
  }}>
    <span style={{ fontSize: 24 }}>{icon}</span>
    <div style={{ flex: 1 }}>
      <div style={{ color: C.text.muted, fontSize: 11 }}>{label}</div>
      <div style={{ color: C.text.primary, fontSize: 18, fontWeight: 700 }}>{value}</div>
    </div>
    {subValue && (
      <div style={{ color: C.text.muted, fontSize: 12 }}>{subValue}</div>
    )}
  </div>
));

// Tarjeta de rango
const RankCard = memo(({ rank, rating, progress }) => {
  const tierColor = TIER_COLORS[rank.tier]?.primary || C.gold.main;
  
  return (
    <div style={{
      padding: 20,
      background: `linear-gradient(135deg, ${TIER_COLORS[rank.tier]?.bg || C.bg.surface}, ${C.bg.surface})`,
      borderRadius: 16,
      border: `2px solid ${tierColor}`,
      textAlign: 'center',
      marginBottom: 16
    }}>
      <div style={{ fontSize: 64, marginBottom: 8 }}>{rank.icon}</div>
      <div style={{ color: tierColor, fontSize: 24, fontWeight: 800 }}>{rank.name}</div>
      <div style={{ color: C.text.secondary, fontSize: 16, marginTop: 4 }}>
        {rating} MMR
      </div>
      
      {/* Progreso al siguiente rango */}
      <div style={{ marginTop: 16 }}>
        <ProgressBar
          value={progress}
          max={100}
          height={8}
          color={tierColor}
          animated
        />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginTop: 4,
          color: C.text.muted,
          fontSize: 11
        }}>
          <span>{rank.minRating}</span>
          <span>{rank.maxRating || '∞'}</span>
        </div>
      </div>
    </div>
  );
});

// Historial de rango
const RankHistory = memo(({ history }) => (
  <div style={{
    display: 'flex',
    gap: 4,
    overflowX: 'auto',
    padding: '8px 0'
  }}>
    {history.map((item, i) => (
      <div
        key={i}
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: item.won ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
          border: `1px solid ${item.won ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          color: item.won ? C.accent.green : C.accent.red,
          fontWeight: 700
        }}
      >
        {item.won ? 'W' : 'L'}
      </div>
    ))}
  </div>
));

// Logro
const AchievementBadge = memo(({ achievement, unlocked }) => (
  <div style={{
    width: 60,
    height: 60,
    borderRadius: 12,
    background: unlocked ? C.bg.elevated : C.bg.deep,
    border: `1px solid ${unlocked ? C.gold.main : C.bg.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 28,
    opacity: unlocked ? 1 : 0.4,
    position: 'relative'
  }}>
    {achievement.icon}
    {unlocked && (
      <div style={{
        position: 'absolute',
        bottom: -4,
        right: -4,
        width: 16,
        height: 16,
        borderRadius: '50%',
        background: C.accent.green,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 10
      }}>
        ✓
      </div>
    )}
  </div>
));

// Pantalla principal del perfil
const ProfileScreen = ({
  user = {},
  stats = {},
  recentMatches = [],
  achievements = [],
  onClose,
  onEditProfile,
  onViewAllAchievements,
  onViewMatchHistory,
  language = 'es'
}) => {
  const t = (path) => getTranslation(path, language);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const rank = getRank(user.rating || 1500);
  
  // Calcular progreso al siguiente rango
  const progress = rank.maxRating 
    ? ((user.rating - rank.minRating) / (rank.maxRating - rank.minRating)) * 100
    : 100;
  
  // Historial reciente (últimas 20 partidas)
  const matchHistory = recentMatches.slice(0, 20).map(m => ({
    won: m.won,
    eloChange: m.eloChange
  }));
  
  // Calcular winrate
  const winrate = stats.gamesPlayed > 0 
    ? Math.round((stats.wins / stats.gamesPlayed) * 100) 
    : 0;

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
        borderBottom: `1px solid ${C.bg.border}`,
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
              color: C.text.secondary,
              fontSize: 24,
              cursor: 'pointer'
            }}
          >
            ←
          </button>
          <h1 style={{ color: C.text.primary, fontSize: 20, fontWeight: 800, margin: 0 }}>
            👤 {t('profile.title')}
          </h1>
        </div>
        <button
          onClick={() => setShowEditModal(true)}
          style={{
            background: C.bg.elevated,
            border: `1px solid ${C.bg.border}`,
            borderRadius: 8,
            padding: '8px 12px',
            color: C.text.secondary,
            fontSize: 12,
            cursor: 'pointer'
          }}
        >
          ✏️ {t('profile.edit')}
        </button>
      </div>
      
      {/* Contenido */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {/* Avatar y nombre */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 20
        }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${TIER_COLORS[rank.tier]?.primary || '#666'}, ${TIER_COLORS[rank.tier]?.secondary || '#444'})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 40,
            border: `3px solid ${TIER_COLORS[rank.tier]?.primary || '#666'}`
          }}>
            {user.avatar || '😎'}
          </div>
          <div>
            <h2 style={{ color: C.text.primary, fontSize: 22, fontWeight: 800, margin: 0 }}>
              {user.name || 'Jugador'}
            </h2>
            {user.title && (
              <Badge preset={rank.tier} size="sm" style={{ marginTop: 6 }}>
                {user.title}
              </Badge>
            )}
            <div style={{ color: C.text.muted, fontSize: 12, marginTop: 4 }}>
              {t('profile.memberSince')}: {user.createdAt || 'Ene 2024'}
            </div>
          </div>
        </div>
        
        {/* Tarjeta de rango */}
        <RankCard rank={rank} rating={user.rating || 1500} progress={progress} />
        
        {/* Historial reciente */}
        {matchHistory.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ color: C.text.secondary, fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
              {t('profile.recentMatches')}
            </h3>
            <RankHistory history={matchHistory} />
          </div>
        )}
        
        {/* Estadísticas */}
        <Card title={t('profile.statistics')} icon="📊" style={{ marginBottom: 16 }}>
          <StatItem
            icon="🎮"
            label={t('profile.gamesPlayed')}
            value={stats.gamesPlayed || 0}
          />
          <StatItem
            icon="🏆"
            label={t('profile.wins')}
            value={stats.wins || 0}
            subValue={`${winrate}%`}
          />
          <StatItem
            icon="🔥"
            label={t('profile.bestStreak')}
            value={stats.bestStreak || 0}
          />
          <StatItem
            icon="🎯"
            label={t('profile.dominoes')}
            value={stats.dominoes || 0}
          />
          <StatItem
            icon="🔒"
            label={t('profile.trancas')}
            value={stats.trancas || 0}
          />
          <StatItem
            icon="💰"
            label={t('profile.totalPoints')}
            value={(stats.totalPoints || 0).toLocaleString()}
          />
        </Card>
        
        {/* Logros destacados */}
        <Card 
          title={t('profile.achievements')} 
          icon="🎖️"
          headerAction={
            <button
              onClick={onViewAllAchievements}
              style={{
                background: 'transparent',
                border: 'none',
                color: C.gold.main,
                fontSize: 12,
                cursor: 'pointer'
              }}
            >
              {t('common.viewAll')} →
            </button>
          }
        >
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            {achievements.slice(0, 6).map((ach, i) => (
              <AchievementBadge key={i} achievement={ach} unlocked={ach.unlocked} />
            ))}
          </div>
        </Card>
      </div>
      
      {/* Modal de edición */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={t('profile.editProfile')}
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Avatar selector */}
          <div>
            <label style={{ color: C.text.secondary, fontSize: 12, display: 'block', marginBottom: 8 }}>
              {t('profile.selectAvatar')}
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['😎', '🧔', '👩', '👨', '🤖', '🐉', '👑', '🔥'].map(emoji => (
                <button
                  key={emoji}
                  onClick={() => onEditProfile?.({ avatar: emoji })}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 12,
                    border: user.avatar === emoji ? `2px solid ${C.gold.main}` : `1px solid ${C.bg.border}`,
                    background: user.avatar === emoji ? 'rgba(245, 158, 11, 0.1)' : C.bg.elevated,
                    fontSize: 28,
                    cursor: 'pointer'
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          
          {/* Nombre */}
          <div>
            <label style={{ color: C.text.secondary, fontSize: 12, display: 'block', marginBottom: 8 }}>
              {t('profile.displayName')}
            </label>
            <input
              type="text"
              defaultValue={user.name}
              maxLength={20}
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 10,
                border: `1px solid ${C.bg.border}`,
                background: C.bg.elevated,
                color: C.text.primary,
                fontSize: 14
              }}
            />
          </div>
          
          <Button variant="primary" fullWidth onClick={() => setShowEditModal(false)}>
            {t('common.save')}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default memo(ProfileScreen);
