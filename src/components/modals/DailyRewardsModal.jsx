// ============================================================================
// COMPONENTE: RECOMPENSAS DIARIAS (MODAL)
// ============================================================================
import React, { memo } from 'react';
import { getTranslation } from '../../constants/i18n';

const C = {
  bg: { deep: '#0a0a0f', surface: '#12121a', elevated: '#1a1a24' },
  text: { primary: '#ffffff', secondary: '#a0a0b0', muted: '#606070' },
  gold: { main: '#F59E0B', dark: '#D97706' },
  accent: { green: '#10B981' }
};

const DAILY_REWARDS = [
  { day: 1, tokens: 50, coins: 0 },
  { day: 2, tokens: 75, coins: 0 },
  { day: 3, tokens: 100, coins: 0 },
  { day: 4, tokens: 125, coins: 5 },
  { day: 5, tokens: 150, coins: 5 },
  { day: 6, tokens: 200, coins: 10 },
  { day: 7, tokens: 300, coins: 25 }
];

const DailyRewardsModal = ({ 
  isOpen, 
  onClose, 
  onClaim, 
  currentStreak = 0, 
  claimedToday = false,
  language = 'es' 
}) => {
  const t = (path) => getTranslation(path, language);
  
  if (!isOpen) return null;
  
  const todayReward = DAILY_REWARDS[Math.min(currentStreak, 6)];
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 20
    }} onClick={onClose}>
      <div style={{
        background: C.bg.surface,
        borderRadius: 20,
        padding: 24,
        maxWidth: 400,
        width: '100%',
        border: `2px solid ${C.gold.main}`,
        boxShadow: `0 0 30px ${C.gold.main}40`
      }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🎁</div>
          <h2 style={{ color: C.gold.main, fontSize: 24, fontWeight: 800, margin: 0 }}>
            {t('daily.title')}
          </h2>
          <p style={{ color: C.text.secondary, fontSize: 13, marginTop: 8 }}>
            {t('daily.enterDaily')}
          </p>
        </div>
        
        {/* Streak */}
        <div style={{
          background: C.bg.elevated,
          borderRadius: 12,
          padding: 12,
          marginBottom: 20,
          textAlign: 'center'
        }}>
          <span style={{ color: C.text.muted, fontSize: 12 }}>{t('daily.streak')}</span>
          <div style={{ color: C.gold.main, fontSize: 28, fontWeight: 800 }}>
            {currentStreak} {t('daily.days')}
          </div>
        </div>
        
        {/* Rewards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: 6,
          marginBottom: 20
        }}>
          {DAILY_REWARDS.map((reward, i) => {
            const isPast = i < currentStreak;
            const isCurrent = i === currentStreak;
            const isFuture = i > currentStreak;
            
            return (
              <div key={i} style={{
                background: isPast ? C.accent.green + '30' : isCurrent ? C.gold.main + '30' : C.bg.elevated,
                borderRadius: 8,
                padding: 8,
                textAlign: 'center',
                border: isCurrent ? `2px solid ${C.gold.main}` : '2px solid transparent',
                opacity: isFuture ? 0.5 : 1
              }}>
                <div style={{ color: C.text.muted, fontSize: 10, marginBottom: 4 }}>
                  {t('daily.day')} {reward.day}
                </div>
                <div style={{ fontSize: 16 }}>
                  {isPast ? '✅' : '🎁'}
                </div>
                <div style={{ color: C.gold.main, fontSize: 10, fontWeight: 600 }}>
                  {reward.tokens}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Today's Reward */}
        {!claimedToday && (
          <div style={{
            background: `linear-gradient(135deg, ${C.gold.dark}, ${C.gold.main})`,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            textAlign: 'center'
          }}>
            <div style={{ color: C.bg.deep, fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
              {t('daily.dailyReward')}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
              <div>
                <span style={{ fontSize: 24 }}>🪙</span>
                <span style={{ color: C.bg.deep, fontSize: 18, fontWeight: 800, marginLeft: 4 }}>
                  +{todayReward.tokens}
                </span>
              </div>
              {todayReward.coins > 0 && (
                <div>
                  <span style={{ fontSize: 24 }}>💎</span>
                  <span style={{ color: C.bg.deep, fontSize: 18, fontWeight: 800, marginLeft: 4 }}>
                    +{todayReward.coins}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1,
            padding: 14,
            borderRadius: 10,
            border: `1px solid ${C.text.muted}`,
            background: 'transparent',
            color: C.text.secondary,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer'
          }}>
            {t('common.close')}
          </button>
          
          {!claimedToday && (
            <button onClick={onClaim} style={{
              flex: 2,
              padding: 14,
              borderRadius: 10,
              border: 'none',
              background: `linear-gradient(135deg, ${C.gold.dark}, ${C.gold.main})`,
              color: C.bg.deep,
              fontSize: 16,
              fontWeight: 800,
              cursor: 'pointer'
            }}>
              {t('daily.claim')} 🎉
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(DailyRewardsModal);
