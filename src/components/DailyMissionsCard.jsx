// ============================================================================
// COMPONENTE: MISIONES DIARIAS (CARD)
// ============================================================================
import React, { memo } from 'react';
import { getTranslation } from '../constants/i18n';

const C = {
  bg: { surface: '#12121a', elevated: '#1a1a24' },
  text: { primary: '#ffffff', secondary: '#a0a0b0', muted: '#606070' },
  gold: { main: '#F59E0B' },
  accent: { green: '#10B981', blue: '#3B82F6' }
};

const DEFAULT_MISSIONS = [
  { id: 'play_3', name: 'Juega 3 partidas', current: 0, target: 3, reward: 100, icon: '🎮' },
  { id: 'win_1', name: 'Gana 1 partida', current: 0, target: 1, reward: 75, icon: '🏆' },
  { id: 'domino_1', name: 'Cierra con dominó', current: 0, target: 1, reward: 50, icon: '🁣' }
];

const DailyMissionsCard = ({ 
  missions = DEFAULT_MISSIONS, 
  onClaimMission,
  resetTime = '00:00:00',
  language = 'es' 
}) => {
  const t = (path) => getTranslation(path, language);
  
  return (
    <div style={{
      background: C.bg.surface,
      borderRadius: 16,
      padding: 16,
      border: '1px solid #2a2a3a'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>📋</span>
          <span style={{ color: C.text.primary, fontSize: 14, fontWeight: 700 }}>
            {t('daily.missions')}
          </span>
        </div>
        <span style={{ color: C.text.muted, fontSize: 11 }}>
          {t('daily.resetsIn')} {resetTime}
        </span>
      </div>
      
      {/* Missions List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {missions.map((mission) => {
          const progress = Math.min(mission.current / mission.target, 1);
          const isComplete = progress >= 1;
          
          return (
            <div key={mission.id} style={{
              background: C.bg.elevated,
              borderRadius: 10,
              padding: 12,
              opacity: isComplete ? 0.7 : 1
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 8
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{mission.icon}</span>
                  <span style={{ 
                    color: isComplete ? C.accent.green : C.text.primary, 
                    fontSize: 13, 
                    fontWeight: 600 
                  }}>
                    {mission.name}
                  </span>
                </div>
                
                {isComplete ? (
                  <button onClick={() => onClaimMission?.(mission.id)} style={{
                    background: C.accent.green,
                    border: 'none',
                    borderRadius: 6,
                    padding: '4px 10px',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}>
                    {t('daily.claim')}
                  </button>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 14 }}>🪙</span>
                    <span style={{ color: C.gold.main, fontSize: 12, fontWeight: 700 }}>
                      +{mission.reward}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Progress Bar */}
              <div style={{
                height: 6,
                background: '#2a2a3a',
                borderRadius: 3,
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${progress * 100}%`,
                  background: isComplete 
                    ? C.accent.green 
                    : `linear-gradient(90deg, ${C.accent.blue}, ${C.gold.main})`,
                  borderRadius: 3,
                  transition: 'width 0.3s ease'
                }} />
              </div>
              
              {/* Progress Text */}
              <div style={{ 
                color: C.text.muted, 
                fontSize: 10, 
                marginTop: 4,
                textAlign: 'right'
              }}>
                {mission.current}/{mission.target}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default memo(DailyMissionsCard);
