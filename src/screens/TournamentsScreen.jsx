// ============================================================================
// PANTALLA DE TORNEOS
// ============================================================================
import React, { useState } from 'react';
import { THEME } from '../constants/game';
import { TOURNAMENTS } from '../services/rewards';

const C = THEME.colors;

const TournamentsScreen = ({ playerProfile, onClose, onJoinTournament }) => {
  const [activeTab, setActiveTab] = useState('daily');
  
  const tabs = [
    { id: 'daily', name: 'Diarios', icon: '📅' },
    { id: 'weekly', name: 'Semanales', icon: '📆' },
    { id: 'special', name: 'Especiales', icon: '⭐' }
  ];
  
  const getTournaments = () => {
    switch(activeTab) {
      case 'daily': return TOURNAMENTS?.DAILY || [];
      case 'weekly': return TOURNAMENTS?.WEEKLY || [];
      case 'special': return TOURNAMENTS?.SPECIAL || [];
      default: return [];
    }
  };

  const formatPrice = (amount, currency) => {
    if (currency === 'tokens') return `${amount} 🪙`;
    if (currency === 'coins') return `${amount} 💎`;
    return `${amount}`;
  };
  
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: C.bg.deep,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div className="safe-top" style={{
        background: C.bg.surface,
        borderBottom: `1px solid ${C.bg.border}`,
        padding: '12px 16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12
        }}>
          <button
            onClick={onClose}
            className="touch-feedback"
            style={{
              background: 'transparent',
              border: 'none',
              color: C.text.primary,
              fontSize: 24,
              cursor: 'pointer',
              padding: 8
            }}
          >
            ←
          </button>
          <h1 style={{
            color: C.text.primary,
            fontSize: 20,
            fontWeight: 700,
            margin: 0
          }}>
            🏅 Torneos
          </h1>
          <div style={{ width: 40 }} />
        </div>
        
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6 }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="touch-feedback"
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: 8,
                border: 'none',
                background: activeTab === tab.id ? C.gold.main : C.bg.card,
                color: activeTab === tab.id ? '#000' : C.text.secondary,
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Tournaments List */}
      <div className="mobile-scroll" style={{ flex: 1, padding: 16 }}>
        {getTournaments().map(tournament => (
          <div
            key={tournament.id}
            style={{
              background: C.bg.card,
              borderRadius: 16,
              padding: 16,
              marginBottom: 12,
              border: `1px solid ${C.bg.border}`
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'start',
              marginBottom: 12
            }}>
              <div>
                <h3 style={{
                  color: C.text.primary,
                  fontSize: 16,
                  fontWeight: 700,
                  margin: '0 0 4px'
                }}>
                  {tournament.name}
                </h3>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: 4,
                  background: C.bg.elevated,
                  color: C.text.secondary,
                  fontSize: 11,
                  textTransform: 'uppercase'
                }}>
                  {tournament.format?.replace('_', ' ') || 'Eliminación'}
                </span>
              </div>
              <div style={{
                padding: '8px 12px',
                borderRadius: 8,
                background: tournament.entryFee === 0 ? C.accent.green + '30' : C.bg.elevated,
                color: tournament.entryFee === 0 ? C.accent.green : C.text.primary,
                fontWeight: 700,
                fontSize: 14
              }}>
                {tournament.entryFee === 0 ? '¡GRATIS!' : formatPrice(tournament.entryFee, tournament.currency)}
              </div>
            </div>
            
            {/* Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 8,
              marginBottom: 12
            }}>
              <div style={{
                background: C.bg.elevated,
                borderRadius: 8,
                padding: 8,
                textAlign: 'center'
              }}>
                <div style={{ color: C.gold.main, fontWeight: 700, fontSize: 16 }}>
                  {typeof tournament.prizePool === 'number' 
                    ? formatPrice(tournament.prizePool, tournament.prizeType) 
                    : '🎁'}
                </div>
                <div style={{ color: C.text.secondary, fontSize: 10 }}>Premio</div>
              </div>
              <div style={{
                background: C.bg.elevated,
                borderRadius: 8,
                padding: 8,
                textAlign: 'center'
              }}>
                <div style={{ color: C.text.primary, fontWeight: 700, fontSize: 16 }}>
                  {tournament.maxPlayers || 16}
                </div>
                <div style={{ color: C.text.secondary, fontSize: 10 }}>Jugadores</div>
              </div>
              <div style={{
                background: C.bg.elevated,
                borderRadius: 8,
                padding: 8,
                textAlign: 'center'
              }}>
                <div style={{ color: C.accent.green, fontWeight: 700, fontSize: 16 }}>
                  {Math.floor(Math.random() * (tournament.maxPlayers || 16))}
                </div>
                <div style={{ color: C.text.secondary, fontSize: 10 }}>Inscritos</div>
              </div>
            </div>
            
            {/* Join Button */}
            <button
              onClick={() => onJoinTournament?.(tournament)}
              className="touch-feedback"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 10,
                border: 'none',
                background: tournament.entryFee === 0 ? C.accent.green : C.gold.main,
                color: tournament.entryFee === 0 ? '#fff' : '#000',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              {tournament.requirement ? '🔒 Requisitos' : 'Inscribirse'}
            </button>
          </div>
        ))}
        
        {/* Empty State */}
        {getTournaments().length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: 40,
            color: C.text.secondary
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏆</div>
            <div>No hay torneos disponibles en esta categoría</div>
          </div>
        )}
        
        {/* Prize Distribution */}
        <div style={{
          background: C.bg.card,
          borderRadius: 12,
          padding: 16,
          marginTop: 8,
          border: `1px solid ${C.bg.border}`
        }}>
          <h4 style={{
            color: C.text.primary,
            fontSize: 14,
            fontWeight: 700,
            margin: '0 0 12px'
          }}>
            📊 Distribución de Premios
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { place: '1', pct: 50 },
              { place: '2', pct: 25 },
              { place: '3', pct: 15 },
              { place: '4', pct: 10 }
            ].map(({ place, pct }) => (
              <div
                key={place}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '4px 0'
                }}
              >
                <span style={{ color: C.text.secondary, fontSize: 12 }}>
                  {place === '1' ? '🥇' : place === '2' ? '🥈' : place === '3' ? '🥉' : `${place}º`} Lugar
                </span>
                <span style={{ color: C.gold.main, fontWeight: 600, fontSize: 12 }}>
                  {pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentsScreen;
