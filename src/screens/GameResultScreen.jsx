// ============================================================================
// PANTALLA: RESULTADOS DEL JUEGO
// ============================================================================
import React, { useState, memo, useEffect } from 'react';
import { Button, Badge, ProgressBar } from '../components/ui';
import { getTranslation } from '../constants/i18n';
import { getRank, TIER_COLORS } from '../constants/game';

const C = {
  bg: { deep: '#0a0a0f', surface: '#12121a', elevated: '#1a1a24', border: '#2a2a3a' },
  text: { primary: '#ffffff', secondary: '#a0a0b0', muted: '#606070' },
  gold: { main: '#F59E0B', dark: '#D97706' },
  accent: { green: '#10B981', red: '#EF4444', blue: '#3B82F6' }
};

// Confeti para victoria
const Confetti = memo(() => {
  const colors = ['#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6'];
  
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 300,
      overflow: 'hidden',
      pointerEvents: 'none'
    }}>
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: 10,
            height: 10,
            background: colors[i % colors.length],
            borderRadius: i % 2 === 0 ? '50%' : '2px',
            left: `${Math.random() * 100}%`,
            top: -20,
            animation: `confetti ${2 + Math.random() * 2}s ease-out forwards`,
            animationDelay: `${Math.random() * 0.5}s`,
            transform: `rotate(${Math.random() * 360}deg)`
          }}
        />
      ))}
    </div>
  );
});

// Tarjeta de jugador en resultados
const PlayerResultCard = memo(({ player, isWinner, showTiles = false }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    background: isWinner ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
    borderRadius: 10,
    border: `1px solid ${isWinner ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
  }}>
    <div style={{
      width: 36,
      height: 36,
      borderRadius: '50%',
      background: C.bg.elevated,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 18
    }}>
      {player.avatar || '😎'}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ 
        color: C.text.primary, 
        fontSize: 13, 
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }}>
        {player.name}
        {isWinner && <span style={{ color: C.accent.green }}>✓</span>}
      </div>
      <div style={{ color: C.text.muted, fontSize: 11 }}>
        Equipo {player.team + 1}
      </div>
    </div>
    {showTiles && player.tiles && (
      <div style={{ 
        color: C.text.muted, 
        fontSize: 11,
        padding: '4px 8px',
        background: C.bg.elevated,
        borderRadius: 6
      }}>
        {player.tiles.reduce((sum, t) => sum + t.left + t.right, 0)} pts
      </div>
    )}
  </div>
));

// Animación de cambio de rango
const RankChange = memo(({ oldRank, newRank, rating, eloChange }) => {
  const tierColor = TIER_COLORS[newRank.tier]?.primary || C.gold.main;
  const promoted = newRank.tier !== oldRank.tier && eloChange > 0;
  const demoted = newRank.tier !== oldRank.tier && eloChange < 0;
  
  return (
    <div style={{
      padding: 16,
      background: `linear-gradient(135deg, ${TIER_COLORS[newRank.tier]?.bg || C.bg.surface}, ${C.bg.surface})`,
      borderRadius: 16,
      border: `2px solid ${tierColor}`,
      textAlign: 'center'
    }}>
      {/* Icono de cambio de rango */}
      {(promoted || demoted) && (
        <div style={{
          marginBottom: 8,
          padding: '6px 16px',
          background: promoted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
          borderRadius: 20,
          display: 'inline-block'
        }}>
          <span style={{ 
            color: promoted ? C.accent.green : C.accent.red,
            fontSize: 12,
            fontWeight: 700
          }}>
            {promoted ? '⬆️ ¡ASCENDIDO!' : '⬇️ Descendido'}
          </span>
        </div>
      )}
      
      {/* Rango actual */}
      <div style={{ 
        fontSize: 48, 
        marginBottom: 8,
        animation: promoted ? 'bounce 0.5s ease' : 'none'
      }}>
        {newRank.icon}
      </div>
      <div style={{ 
        color: tierColor, 
        fontSize: 20, 
        fontWeight: 800 
      }}>
        {newRank.name}
      </div>
      
      {/* Rating */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginTop: 12
      }}>
        <span style={{ color: C.text.secondary, fontSize: 16 }}>
          {rating} MMR
        </span>
        <span style={{
          padding: '4px 10px',
          borderRadius: 8,
          background: eloChange > 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
          color: eloChange > 0 ? C.accent.green : C.accent.red,
          fontSize: 14,
          fontWeight: 700
        }}>
          {eloChange > 0 ? '+' : ''}{eloChange}
        </span>
      </div>
      
      {/* Barra de progreso al siguiente rango */}
      <div style={{ marginTop: 12 }}>
        <ProgressBar
          value={newRank.progress || 50}
          max={100}
          height={6}
          color={tierColor}
          animated={promoted}
        />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginTop: 4
        }}>
          <span style={{ color: C.text.muted, fontSize: 10 }}>
            {newRank.minRating}
          </span>
          <span style={{ color: C.text.muted, fontSize: 10 }}>
            {newRank.maxRating || '∞'}
          </span>
        </div>
      </div>
    </div>
  );
});

// Pantalla principal de resultados
const GameResultScreen = ({
  result,
  user = {},
  onPlayAgain,
  onRematch,
  onMenu,
  rematchState = {},
  canRematch = true,
  isOnline = false,
  language = 'es'
}) => {
  const t = (path) => getTranslation(path, language);
  const [showDetails, setShowDetails] = useState(false);
  
  const {
    playerWon = false,
    finalScores = [0, 0],
    winningTeam = 0,
    rewards = { tokens: 0, xp: 0 },
    eloChange = 0,
    revealedHands = []
  } = result || {};
  
  const oldRating = (user.rating || 1500) - eloChange;
  const newRating = user.rating || 1500;
  const oldRank = getRank(oldRating);
  const newRank = getRank(newRating);

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
      overflow: 'hidden'
    }}>
      {/* Confeti si ganó */}
      {playerWon && <Confetti />}
      
      {/* Header con resultado */}
      <div style={{
        padding: '60px 20px 30px',
        textAlign: 'center',
        background: playerWon 
          ? 'linear-gradient(180deg, rgba(16, 185, 129, 0.2) 0%, transparent 100%)'
          : 'linear-gradient(180deg, rgba(239, 68, 68, 0.2) 0%, transparent 100%)'
      }}>
        <div style={{ 
          fontSize: 64,
          marginBottom: 12,
          animation: 'bounce 0.5s ease'
        }}>
          {playerWon ? '🏆' : '😔'}
        </div>
        <h1 style={{
          color: playerWon ? C.accent.green : C.accent.red,
          fontSize: 32,
          fontWeight: 900,
          margin: 0
        }}>
          {playerWon ? t('endGame.victory') : t('endGame.defeat')}
        </h1>
      </div>
      
      {/* Contenido scrolleable */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0 16px 20px'
      }}>
        {/* Marcador final */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 24,
          padding: 20,
          background: C.bg.surface,
          borderRadius: 16,
          marginBottom: 16
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: C.accent.blue, fontSize: 12, marginBottom: 4 }}>
              🔵 {t('game.you')}
            </div>
            <div style={{ 
              color: '#fff', 
              fontSize: 40, 
              fontWeight: 900,
              fontFamily: 'monospace'
            }}>
              {finalScores[0]}
            </div>
          </div>
          
          <div style={{ 
            color: C.text.muted, 
            fontSize: 24,
            fontWeight: 300
          }}>
            —
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: C.accent.red, fontSize: 12, marginBottom: 4 }}>
              {t('game.rival')} 🔴
            </div>
            <div style={{ 
              color: '#fff', 
              fontSize: 40, 
              fontWeight: 900,
              fontFamily: 'monospace'
            }}>
              {finalScores[1]}
            </div>
          </div>
        </div>
        
        {/* Recompensas */}
        {rewards && (rewards.tokens > 0 || rewards.xp > 0) && (
          <div style={{
            display: 'flex',
            gap: 10,
            marginBottom: 16
          }}>
            {rewards.tokens > 0 && (
              <div style={{
                flex: 1,
                padding: 14,
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: 12,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>🪙</div>
                <div style={{ color: C.gold.main, fontSize: 18, fontWeight: 700 }}>
                  +{rewards.tokens}
                </div>
                <div style={{ color: C.text.muted, fontSize: 11 }}>Tokens</div>
              </div>
            )}
            {rewards.xp > 0 && (
              <div style={{
                flex: 1,
                padding: 14,
                background: 'rgba(139, 92, 246, 0.1)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: 12,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>⭐</div>
                <div style={{ color: '#A78BFA', fontSize: 18, fontWeight: 700 }}>
                  +{rewards.xp}
                </div>
                <div style={{ color: C.text.muted, fontSize: 11 }}>XP</div>
              </div>
            )}
          </div>
        )}
        
        {/* Cambio de rango (solo online) */}
        {isOnline && (
          <div style={{ marginBottom: 16 }}>
            <RankChange
              oldRank={oldRank}
              newRank={newRank}
              rating={newRating}
              eloChange={eloChange}
            />
          </div>
        )}
        
        {/* Ver detalles */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{
            width: '100%',
            padding: 12,
            background: C.bg.surface,
            border: `1px solid ${C.bg.border}`,
            borderRadius: 12,
            color: C.text.secondary,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16
          }}
        >
          <span>📊 {t('endGame.viewDetails')}</span>
          <span style={{ 
            transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 200ms ease'
          }}>
            ▼
          </span>
        </button>
        
        {/* Detalles expandibles */}
        {showDetails && revealedHands.length > 0 && (
          <div style={{
            background: C.bg.surface,
            borderRadius: 12,
            padding: 12,
            marginBottom: 16
          }}>
            <h4 style={{ color: C.text.secondary, fontSize: 12, marginBottom: 10 }}>
              {t('endGame.finalHands')}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {revealedHands.map((player, i) => (
                <PlayerResultCard
                  key={i}
                  player={player}
                  isWinner={player.team === winningTeam}
                  showTiles
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Botones de acción */}
      <div style={{
        padding: 16,
        borderTop: `1px solid ${C.bg.border}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }}>
        {/* Revancha (solo online) */}
        {isOnline && canRematch && !rematchState.declined && (
          <Button
            variant={rematchState.requested ? 'secondary' : 'primary'}
            fullWidth
            size="lg"
            icon="⚔️"
            disabled={rematchState.requested}
            onClick={onRematch}
          >
            {rematchState.accepted 
              ? `✓ ${t('endGame.rematchAccepted')}`
              : rematchState.requested 
                ? `⏳ ${t('endGame.waitingResponse')}`
                : t('endGame.rematch')}
          </Button>
        )}
        
        {/* Jugar de nuevo */}
        <Button
          variant={isOnline && canRematch ? 'secondary' : 'primary'}
          fullWidth
          size="lg"
          icon="🔄"
          onClick={onPlayAgain}
        >
          {t('endGame.playAgain')}
        </Button>
        
        {/* Volver al menú */}
        <Button
          variant="ghost"
          fullWidth
          icon="🏠"
          onClick={onMenu}
        >
          {t('endGame.backToMenu')}
        </Button>
      </div>
      
      {/* CSS para animaciones */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes confetti {
          0% { 
            transform: translateY(0) rotate(0deg); 
            opacity: 1; 
          }
          100% { 
            transform: translateY(400px) rotate(720deg); 
            opacity: 0; 
          }
        }
      `}</style>
    </div>
  );
};

export default memo(GameResultScreen);
