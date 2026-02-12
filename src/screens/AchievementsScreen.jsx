// ============================================================================
// PANTALLA: LOGROS - Conectada con Firebase
// ============================================================================
import React, { useState, memo, useEffect } from 'react';
import { Button, Badge, ProgressBar } from '../components/ui';
import { useAchievements } from '../hooks/useAchievements';

const C = {
  bg: { deep: '#0a0a0f', surface: '#12121a', elevated: '#1a1a24', border: '#2a2a3a' },
  text: { primary: '#ffffff', secondary: '#a0a0b0', muted: '#606070' },
  gold: { main: '#F59E0B', dark: '#D97706' },
  accent: { green: '#10B981', red: '#EF4444', blue: '#3B82F6', purple: '#8B5CF6' }
};

// Toast de notificación
const Toast = memo(({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
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
      animation: 'slideDown 0.3s ease',
      maxWidth: '90%',
      textAlign: 'center'
    }}>
      {type === 'error' ? '❌' : '🎉'} {message}
    </div>
  );
});

// Tarjeta de logro
const AchievementCard = memo(({ achievement, onClaim, claiming }) => {
  const canClaim = achievement.completed && !achievement.claimed;
  
  return (
    <div style={{
      background: achievement.completed ? 'rgba(16, 185, 129, 0.1)' : C.bg.surface,
      borderRadius: 12,
      padding: 14,
      border: `1px solid ${achievement.completed ? 'rgba(16, 185, 129, 0.3)' : C.bg.border}`,
      opacity: achievement.claimed ? 0.6 : 1
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Icono */}
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: achievement.completed ? 'rgba(16, 185, 129, 0.2)' : C.bg.elevated,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          flexShrink: 0
        }}>
          {achievement.icon}
        </div>
        
        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8,
            marginBottom: 4,
            flexWrap: 'wrap'
          }}>
            <span style={{ 
              color: C.text.primary, 
              fontSize: 14, 
              fontWeight: 700 
            }}>
              {achievement.name}
            </span>
            {canClaim && (
              <Badge preset="success" size="xs">¡NUEVO!</Badge>
            )}
            {achievement.claimed && (
              <Badge preset="common" size="xs">✓</Badge>
            )}
          </div>
          
          <div style={{ 
            color: C.text.muted, 
            fontSize: 12,
            marginBottom: 8
          }}>
            {achievement.description}
          </div>
          
          {/* Barra de progreso */}
          <div style={{ marginBottom: 8 }}>
            <ProgressBar
              value={achievement.progress}
              max={achievement.target}
              height={6}
              color={achievement.completed ? C.accent.green : C.gold.main}
            />
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginTop: 4
            }}>
              <span style={{ color: C.text.muted, fontSize: 10 }}>
                {achievement.progress.toLocaleString()} / {achievement.target.toLocaleString()}
              </span>
              <span style={{ color: C.text.muted, fontSize: 10 }}>
                {Math.round(achievement.percentage)}%
              </span>
            </div>
          </div>
          
          {/* Recompensa */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8,
            flexWrap: 'wrap'
          }}>
            {achievement.reward?.tokens && (
              <span style={{ 
                color: C.gold.main, 
                fontSize: 11, 
                fontWeight: 600 
              }}>
                🪙 {achievement.reward.tokens}
              </span>
            )}
            {achievement.reward?.coins && (
              <span style={{ 
                color: C.accent.blue, 
                fontSize: 11, 
                fontWeight: 600 
              }}>
                💎 {achievement.reward.coins}
              </span>
            )}
            {achievement.reward?.xp && (
              <span style={{ 
                color: C.accent.green, 
                fontSize: 11, 
                fontWeight: 600 
              }}>
                ⭐ {achievement.reward.xp} XP
              </span>
            )}
            {achievement.reward?.title && (
              <span style={{ 
                color: C.accent.purple, 
                fontSize: 11, 
                fontWeight: 600 
              }}>
                🏷️ {achievement.reward.title}
              </span>
            )}
          </div>
        </div>
        
        {/* Botón reclamar */}
        {canClaim && (
          <Button
            variant="success"
            size="sm"
            onClick={() => onClaim(achievement.id)}
            loading={claiming}
            disabled={claiming}
          >
            Reclamar
          </Button>
        )}
      </div>
    </div>
  );
});

// Pantalla principal
const AchievementsScreen = ({
  userId,
  onClose,
  language = 'es'
}) => {
  // Hook de logros
  const achievements = useAchievements(userId);
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: C.bg.deep,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      zIndex: 100
    }}>
      {/* Notificaciones */}
      {achievements.error && (
        <Toast 
          message={achievements.error} 
          type="error" 
          onClose={achievements.clearMessages} 
        />
      )}
      {achievements.success && (
        <Toast 
          message={achievements.success} 
          type="success" 
          onClose={achievements.clearMessages} 
        />
      )}
      
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: `1px solid ${C.bg.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexShrink: 0
      }}>
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
        <h1 style={{ color: C.text.primary, fontSize: 20, fontWeight: 800, margin: 0, flex: 1 }}>
          🎖️ Logros
        </h1>
        {achievements.pendingCount > 0 && (
          <Badge preset="success" glow>
            {achievements.pendingCount} nuevo{achievements.pendingCount > 1 ? 's' : ''}
          </Badge>
        )}
      </div>
      
      {/* Resumen */}
      <div style={{
        padding: 16,
        borderBottom: `1px solid ${C.bg.border}`
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8
        }}>
          <span style={{ color: C.text.secondary, fontSize: 14 }}>
            Progreso total
          </span>
          <span style={{ color: C.gold.main, fontWeight: 700 }}>
            {achievements.summary.completed} / {achievements.summary.total}
          </span>
        </div>
        <ProgressBar
          value={achievements.summary.completed}
          max={achievements.summary.total}
          height={8}
          color={C.gold.main}
          animated
        />
        
        {/* Botón reclamar todos */}
        {achievements.pendingCount > 0 && (
          <Button
            variant="success"
            fullWidth
            onClick={achievements.claimAllPending}
            loading={achievements.claiming}
            disabled={achievements.claiming}
            style={{ marginTop: 12 }}
          >
            🎁 Reclamar todos ({achievements.pendingCount})
          </Button>
        )}
      </div>
      
      {/* Categorías */}
      <div style={{
        padding: '12px 16px',
        overflowX: 'auto',
        display: 'flex',
        gap: 8,
        borderBottom: `1px solid ${C.bg.border}`,
        flexShrink: 0
      }}>
        {achievements.categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => achievements.setCategory(cat.id)}
            style={{
              padding: '8px 14px',
              borderRadius: 20,
              border: 'none',
              background: achievements.category === cat.id 
                ? `linear-gradient(135deg, ${C.gold.dark}, ${C.gold.main})`
                : C.bg.surface,
              color: achievements.category === cat.id ? '#000' : C.text.secondary,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <span>{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>
      
      {/* Lista de logros */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: 16
      }}>
        {achievements.loading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: C.text.muted
          }}>
            Cargando logros...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {achievements.achievements.map(achievement => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                onClaim={achievements.claimReward}
                claiming={achievements.claiming}
              />
            ))}
          </div>
        )}
        
        {!achievements.loading && achievements.achievements.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: 40,
            color: C.text.muted
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <p>No hay logros en esta categoría</p>
          </div>
        )}
      </div>
      
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
};

export default memo(AchievementsScreen);
