// ============================================================================
// PANTALLA DE PASE DE TEMPORADA
// ============================================================================
// Muestra el progreso del pase con track free/premium,
// tiempo restante de temporada y botón de compra de pase premium
// ============================================================================

import React, { useState, useEffect, useCallback, memo } from 'react';
import { SERVIDOR_URL } from '../constants/serverConfig';
import { purchaseSeasonPass } from '../services/purchases';

const C = {
  bg: { deep: '#0a0a0f', surface: '#12121a', elevated: '#1a1a24', card: '#1e1e2a' },
  text: { primary: '#ffffff', secondary: '#a0a0b0', muted: '#606070' },
  gold: { main: '#F59E0B', dark: '#D97706', light: '#FBBF24' },
  accent: { blue: '#3B82F6', green: '#10B981', purple: '#8B5CF6', red: '#EF4444' },
  premium: { start: '#F59E0B', end: '#EF4444' }
};

const REWARD_ICONS = {
  tokens: '🪙',
  coins: '💎',
  tile: '🁣',
  board: '🎨',
  avatar: '😎',
  frame: '🖼️',
  title: '🏷️'
};

// ============================================================================
// REWARD NODE
// ============================================================================

const RewardNode = memo(({ reward, level, unlocked, isPremium, hasPremium }) => {
  const isLocked = isPremium && !hasPremium;
  const isClaimed = unlocked;
  
  // Get icon from reward object
  const rewardType = Object.keys(reward).find(k => k !== 'level');
  const icon = REWARD_ICONS[rewardType] || '🎁';
  const value = reward[rewardType];

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      minWidth: 64, opacity: isClaimed ? 1 : isLocked ? 0.4 : 0.8
    }}>
      <div style={{ fontSize: 10, color: C.text.muted, fontWeight: 600 }}>
        Nv.{level}
      </div>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: isClaimed ? `${C.accent.green}30` : isPremium ? `${C.gold.main}15` : C.bg.elevated,
        border: `2px solid ${isClaimed ? C.accent.green : isPremium ? C.gold.main + '50' : C.bg.card}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, position: 'relative'
      }}>
        {isClaimed && (
          <div style={{
            position: 'absolute', top: -4, right: -4, width: 16, height: 16,
            borderRadius: '50%', background: C.accent.green,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10
          }}>✓</div>
        )}
        {isLocked ? '🔒' : icon}
      </div>
      <div style={{
        fontSize: 10, color: isPremium ? C.gold.main : C.text.secondary, fontWeight: 600,
        maxWidth: 64, textAlign: 'center', lineHeight: 1.2
      }}>
        {typeof value === 'number' ? value.toLocaleString() : value?.replace('season_', '')}
      </div>
    </div>
  );
});

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const SeasonPassScreen = ({ user, onBack, onPurchasePass }) => {
  const [season, setSeason] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  const userLevel = user?.seasonPass?.level || 0;
  const userXP = user?.seasonPass?.xp || 0;
  const hasPremium = user?.seasonPass?.premium || false;

  // ══════════════════════════════════════════════════════════════════════════
  // CARGAR TEMPORADA
  // ══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    const fetchSeason = async () => {
      try {
        const res = await fetch(`${SERVIDOR_URL}/api/season/current`);
        const data = await res.json();
        setSeason(data);
      } catch (e) {
        console.error('[Season] Error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchSeason();
  }, []);

  // ══════════════════════════════════════════════════════════════════════════
  // COMPRAR PASE
  // ══════════════════════════════════════════════════════════════════════════

  const handleBuyPass = useCallback(async () => {
    if (purchasing || hasPremium) return;
    setPurchasing(true);
    
    const result = await purchaseSeasonPass(user?.uid);
    setPurchasing(false);
    
    if (result.success) {
      onPurchasePass?.();
    }
  }, [purchasing, hasPremium, user, onPurchasePass]);

  if (loading) {
    return (
      <div style={{ background: C.bg.deep, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: C.text.muted }}>Cargando temporada...</div>
      </div>
    );
  }

  const xpPerLevel = season?.xpPerLevel || 500;
  const maxLevel = season?.passLevels || 30;
  const xpProgress = maxLevel > 0 ? (userXP % xpPerLevel) / xpPerLevel : 0;

  const freeRewards = season?.passRewards?.free || [];
  const premiumRewards = season?.passRewards?.premium || [];

  return (
    <div style={{ background: C.bg.deep, minHeight: '100vh', paddingBottom: 100 }}>
      {/* Header */}
      <div style={{
        padding: '20px 16px 16px', display: 'flex', alignItems: 'center', gap: 12,
        position: 'sticky', top: 0, background: C.bg.deep, zIndex: 10
      }}>
        <button onClick={onBack} style={{
          background: C.bg.elevated, border: 'none', borderRadius: 10,
          width: 40, height: 40, color: C.text.secondary, fontSize: 18, cursor: 'pointer'
        }}>←</button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text.primary, margin: 0 }}>
            🏆 {season?.name || 'Pase de Temporada'}
          </h1>
          <div style={{ fontSize: 12, color: C.gold.main }}>
            Temporada #{season?.number || 1}
          </div>
        </div>
        {season?.daysRemaining != null && (
          <div style={{
            background: season.daysRemaining <= 7 ? `${C.accent.red}20` : C.bg.elevated,
            border: `1px solid ${season.daysRemaining <= 7 ? C.accent.red + '40' : C.bg.card}`,
            borderRadius: 10, padding: '6px 12px', textAlign: 'center'
          }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: season.daysRemaining <= 7 ? C.accent.red : C.text.primary }}>
              {season.daysRemaining}
            </div>
            <div style={{ fontSize: 9, color: C.text.muted }}>DÍAS</div>
          </div>
        )}
      </div>

      {/* Level & XP */}
      <div style={{ padding: '0 16px 20px' }}>
        <div style={{
          background: C.bg.surface, borderRadius: 16, padding: '16px 20px',
          border: `1px solid ${C.bg.elevated}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text.primary }}>
              Nivel {userLevel}/{maxLevel}
            </div>
            <div style={{ fontSize: 12, color: C.text.muted }}>
              {userXP % xpPerLevel}/{xpPerLevel} XP
            </div>
          </div>
          <div style={{
            height: 8, background: C.bg.deep, borderRadius: 4, overflow: 'hidden'
          }}>
            <div style={{
              height: '100%', borderRadius: 4,
              background: `linear-gradient(90deg, ${C.gold.main}, ${C.accent.purple})`,
              width: `${xpProgress * 100}%`,
              transition: 'width 0.5s ease'
            }} />
          </div>
        </div>
      </div>

      {/* Premium banner */}
      {!hasPremium && (
        <div style={{ padding: '0 16px 20px' }}>
          <button onClick={handleBuyPass} disabled={purchasing} style={{
            width: '100%', padding: '16px 20px', borderRadius: 16, border: 'none',
            background: `linear-gradient(135deg, ${C.gold.main}, ${C.accent.red || '#EF4444'})`,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14
          }}>
            <span style={{ fontSize: 32 }}>⭐</span>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#000' }}>
                Desbloquear Pase Premium
              </div>
              <div style={{ fontSize: 12, color: '#00000080' }}>
                Cosméticos exclusivos, Diamantes extra y más
              </div>
            </div>
            <div style={{
              background: '#00000030', borderRadius: 10, padding: '8px 16px',
              fontWeight: 700, color: '#fff', fontSize: 15
            }}>
              {purchasing ? '...' : '$4.99'}
            </div>
          </button>
        </div>
      )}

      {/* Reward Tracks */}
      <div style={{ padding: '0 16px' }}>
        {/* Free track */}
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontSize: 12, color: C.text.muted, marginBottom: 10,
            textTransform: 'uppercase', letterSpacing: 1
          }}>
            🆓 Recompensas Gratis
          </div>
          <div style={{
            display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8,
            WebkitOverflowScrolling: 'touch'
          }}>
            {freeRewards.map((item, i) => (
              <RewardNode
                key={`free-${i}`}
                reward={item.reward}
                level={item.level}
                unlocked={userLevel >= item.level}
                isPremium={false}
                hasPremium={true}
              />
            ))}
          </div>
        </div>

        {/* Premium track */}
        <div>
          <div style={{
            fontSize: 12, color: C.gold.main, marginBottom: 10,
            textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600
          }}>
            ⭐ Recompensas Premium
          </div>
          <div style={{
            display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8,
            WebkitOverflowScrolling: 'touch'
          }}>
            {premiumRewards.map((item, i) => (
              <RewardNode
                key={`premium-${i}`}
                reward={item.reward}
                level={item.level}
                unlocked={userLevel >= item.level}
                isPremium={true}
                hasPremium={hasPremium}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Premium badge */}
      {hasPremium && (
        <div style={{
          position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          background: `linear-gradient(135deg, ${C.gold.main}, ${C.gold.dark})`,
          borderRadius: 20, padding: '8px 20px', fontSize: 13, fontWeight: 700,
          color: '#000', boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)'
        }}>
          ⭐ PASE PREMIUM ACTIVO
        </div>
      )}
    </div>
  );
};

export default memo(SeasonPassScreen);
