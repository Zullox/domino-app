// ============================================================================
// GameOnlineScreen - Pantalla de Juego Online (Servidor Autoritativo)
// ============================================================================
// Esta pantalla conecta con el servidor autoritativo para partidas online.
// Toda la lógica del juego está en el servidor - aquí solo renderizamos.
// ============================================================================

import React, { useEffect, useState, useCallback } from 'react';
import { useServerGame } from '../hooks/useServerGame';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';
import './GameOnlineScreen.css';

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

/**
 * Ficha de dominó renderizada
 */
const DominoTile = ({ tile, onClick, disabled, highlighted, small }) => {
  const isDouble = tile.top === tile.bottom;
  
  return (
    <div 
      className={`domino-tile ${isDouble ? 'double' : ''} ${disabled ? 'disabled' : ''} ${highlighted ? 'highlighted' : ''} ${small ? 'small' : ''}`}
      onClick={() => !disabled && onClick?.(tile)}
    >
      <div className="tile-half top">
        {renderDots(tile.top)}
      </div>
      <div className="tile-divider" />
      <div className="tile-half bottom">
        {renderDots(tile.bottom)}
      </div>
    </div>
  );
};

/**
 * Renderizar puntos de una mitad de ficha
 */
const renderDots = (value) => {
  const dots = [];
  const positions = {
    0: [],
    1: [[1, 1]],
    2: [[0, 0], [2, 2]],
    3: [[0, 0], [1, 1], [2, 2]],
    4: [[0, 0], [0, 2], [2, 0], [2, 2]],
    5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
    6: [[0, 0], [0, 1], [0, 2], [2, 0], [2, 1], [2, 2]],
    7: [[0, 0], [0, 1], [0, 2], [1, 1], [2, 0], [2, 1], [2, 2]],
    8: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 2], [2, 0], [2, 1], [2, 2]],
    9: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]]
  };
  
  positions[value]?.forEach(([row, col], i) => {
    dots.push(
      <div 
        key={i} 
        className="dot" 
        style={{ 
          gridRow: row + 1, 
          gridColumn: col + 1 
        }} 
      />
    );
  });
  
  return <div className="dots-grid">{dots}</div>;
};

/**
 * Indicador de jugador
 */
const PlayerIndicator = ({ player, isCurrentTurn, position, handCount, disconnected }) => {
  const positionLabels = ['Abajo', 'Derecha', 'Arriba', 'Izquierda'];
  
  return (
    <div className={`player-indicator position-${position} ${isCurrentTurn ? 'active' : ''} ${disconnected ? 'disconnected' : ''}`}>
      <div className="player-avatar">
        {player.avatar ? (
          <img src={player.avatar} alt={player.name} />
        ) : (
          <div className="avatar-placeholder">{player.name?.[0] || '?'}</div>
        )}
        {isCurrentTurn && <div className="turn-indicator" />}
      </div>
      <div className="player-info">
        <span className="player-name">{player.name}</span>
        <span className="player-rating">{player.rating || 1500}</span>
        <span className="hand-count">🎴 {handCount}</span>
      </div>
      {disconnected && <span className="disconnected-badge">⚠️</span>}
    </div>
  );
};

/**
 * Tablero del juego
 */
const GameBoard = ({ board, leftEnd, rightEnd }) => {
  if (board.length === 0) {
    return (
      <div className="game-board empty">
        <div className="board-placeholder">
          Esperando primera ficha...
        </div>
      </div>
    );
  }
  
  return (
    <div className="game-board">
      <div className="board-tiles">
        {board.map((tile, index) => (
          <DominoTile 
            key={tile.id} 
            tile={tile} 
            small 
            disabled
          />
        ))}
      </div>
      <div className="board-ends">
        <span className="end-indicator left">◄ {leftEnd}</span>
        <span className="end-indicator right">{rightEnd} ►</span>
      </div>
    </div>
  );
};

/**
 * Mi mano de fichas
 */
const PlayerHand = ({ hand, validMoves, isMyTurn, onPlayTile, selectedTile, onSelectTile }) => {
  const getValidSidesForTile = (tileId) => {
    return validMoves
      .filter(m => m.tile.id === tileId)
      .map(m => m.side);
  };
  
  return (
    <div className="player-hand">
      {hand.map(tile => {
        const validSides = getValidSidesForTile(tile.id);
        const canPlay = isMyTurn && validSides.length > 0;
        const isSelected = selectedTile?.id === tile.id;
        
        return (
          <DominoTile
            key={tile.id}
            tile={tile}
            disabled={!canPlay}
            highlighted={isSelected}
            onClick={() => {
              if (canPlay) {
                if (validSides.length === 1) {
                  // Solo un lado posible, jugar directamente
                  onPlayTile(tile, validSides[0]);
                } else {
                  // Múltiples lados, seleccionar ficha
                  onSelectTile(isSelected ? null : tile);
                }
              }
            }}
          />
        );
      })}
    </div>
  );
};

/**
 * Selector de lado cuando hay múltiples opciones
 */
const SideSelector = ({ tile, validMoves, onSelect, onCancel }) => {
  const sides = validMoves
    .filter(m => m.tile.id === tile.id)
    .map(m => m.side);
  
  return (
    <div className="side-selector-overlay" onClick={onCancel}>
      <div className="side-selector" onClick={e => e.stopPropagation()}>
        <h3>¿Dónde jugar?</h3>
        <DominoTile tile={tile} disabled />
        <div className="side-buttons">
          {sides.includes('left') && (
            <button onClick={() => onSelect('left')}>
              ◄ Izquierda
            </button>
          )}
          {sides.includes('right') && (
            <button onClick={() => onSelect('right')}>
              Derecha ►
            </button>
          )}
        </div>
        <button className="cancel-btn" onClick={onCancel}>Cancelar</button>
      </div>
    </div>
  );
};

/**
 * Panel de marcador
 */
const Scoreboard = ({ scores, myTeam, targetScore, roundNumber }) => {
  return (
    <div className="scoreboard">
      <div className="round-info">Ronda {roundNumber}</div>
      <div className="scores">
        <div className={`team-score ${myTeam === 0 ? 'my-team' : ''}`}>
          <span className="team-label">Equipo A</span>
          <span className="score-value">{scores.team0}</span>
        </div>
        <div className="target-score">/ {targetScore}</div>
        <div className={`team-score ${myTeam === 1 ? 'my-team' : ''}`}>
          <span className="team-label">Equipo B</span>
          <span className="score-value">{scores.team1}</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Timer del turno
 */
const TurnTimer = ({ timeLeft, isMyTurn }) => {
  const isLow = timeLeft <= 10;
  
  return (
    <div className={`turn-timer ${isMyTurn ? 'my-turn' : ''} ${isLow ? 'low' : ''}`}>
      <div className="timer-bar" style={{ width: `${(timeLeft / 30) * 100}%` }} />
      <span className="timer-text">{timeLeft}s</span>
    </div>
  );
};

/**
 * Modal de resultado de ronda
 */
const RoundResultModal = ({ result, myTeam, onContinue }) => {
  const { t } = useTranslation();
  
  const isWinner = result.winner === myTeam;
  const isDraw = result.winner === -1;
  
  return (
    <div className="modal-overlay">
      <div className="round-result-modal">
        <h2>
          {result.type === 'domino' ? '¡Dominó!' : '¡Tranca!'}
        </h2>
        
        <div className={`result-status ${isWinner ? 'win' : isDraw ? 'draw' : 'lose'}`}>
          {isDraw ? 'Empate' : isWinner ? '¡Victoria!' : 'Derrota'}
        </div>
        
        {result.points > 0 && (
          <div className="points-earned">+{result.points} puntos</div>
        )}
        
        <div className="revealed-hands">
          <h4>Fichas reveladas:</h4>
          {result.hands?.map((hand, i) => (
            <div key={i} className="revealed-hand">
              <span>Jugador {i + 1} ({hand.points} pts):</span>
              <div className="mini-tiles">
                {hand.tiles.map(tile => (
                  <span key={tile.id} className="mini-tile">
                    [{tile.top}|{tile.bottom}]
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <p className="continue-hint">Siguiente ronda en breve...</p>
      </div>
    </div>
  );
};

/**
 * Modal de resultado final
 */
const GameResultModal = ({ result, myTeam, onPlayAgain, onExit }) => {
  const isWinner = result.winner === myTeam;
  
  const myRatingChange = result.ratingChanges?.find(r => r.team === myTeam);
  
  return (
    <div className="modal-overlay">
      <div className="game-result-modal">
        <h2>{isWinner ? '🏆 ¡Victoria!' : '😢 Derrota'}</h2>
        
        <div className="final-scores">
          <div className={`final-score ${myTeam === 0 ? 'highlight' : ''}`}>
            Equipo A: {result.scores.team0}
          </div>
          <div className={`final-score ${myTeam === 1 ? 'highlight' : ''}`}>
            Equipo B: {result.scores.team1}
          </div>
        </div>
        
        <div className="game-stats">
          <div>Rondas jugadas: {result.rounds}</div>
          <div>Duración: {Math.round(result.duration / 60000)} min</div>
          {result.fairPlay && <div className="fair-play">✓ Fair Play</div>}
        </div>
        
        {result.ratingChanges?.length > 0 && (
          <div className="rating-changes">
            <h4>Cambios de Rating:</h4>
            {result.ratingChanges.map((change, i) => (
              <div key={i} className={`rating-change ${change.change >= 0 ? 'positive' : 'negative'}`}>
                {change.name}: {change.oldRating} → {change.newRating} 
                ({change.change >= 0 ? '+' : ''}{change.change})
              </div>
            ))}
          </div>
        )}
        
        <div className="modal-buttons">
          <button className="play-again-btn" onClick={onPlayAgain}>
            🔄 Buscar otra partida
          </button>
          <button className="exit-btn" onClick={onExit}>
            🚪 Salir
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Pantalla de búsqueda
 */
const SearchingScreen = ({ onCancel, playersOnline }) => {
  const [dots, setDots] = useState('');
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="searching-screen">
      <div className="searching-content">
        <div className="searching-animation">🎴</div>
        <h2>Buscando partida{dots}</h2>
        <p>Jugadores online: {playersOnline || '...'}</p>
        <button className="cancel-search-btn" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </div>
  );
};

/**
 * Pantalla de conexión
 */
const ConnectingScreen = ({ error, onRetry }) => {
  return (
    <div className="connecting-screen">
      <div className="connecting-content">
        {error ? (
          <>
            <div className="error-icon">❌</div>
            <h2>Error de conexión</h2>
            <p>{error}</p>
            <button onClick={onRetry}>Reintentar</button>
          </>
        ) : (
          <>
            <div className="loading-spinner" />
            <h2>Conectando al servidor...</h2>
          </>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const GameOnlineScreen = ({ onExit }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  
  const {
    // Estado de conexión
    connected,
    identified,
    error,
    
    // Estado del juego
    phase,
    gameId,
    myPosition,
    myTeam,
    myHand,
    validMoves,
    isMyTurn,
    players,
    board,
    leftEnd,
    rightEnd,
    currentPlayer,
    scores,
    handCounts,
    roundNumber,
    targetScore,
    turnTimeLeft,
    roundResult,
    gameResult,
    notification,
    
    // Acciones
    searchGame,
    cancelSearch,
    playTile,
    passTurn,
    sendEmote,
    surrender,
    returnToMenu,
    clearNotification
  } = useServerGame(user);
  
  const [selectedTile, setSelectedTile] = useState(null);
  const [showSideSelector, setShowSideSelector] = useState(false);
  
  // Manejar jugar ficha
  const handlePlayTile = useCallback((tile, side) => {
    playTile(tile, side);
    setSelectedTile(null);
    setShowSideSelector(false);
  }, [playTile]);
  
  // Seleccionar ficha (cuando hay múltiples lados)
  const handleSelectTile = useCallback((tile) => {
    if (tile) {
      const sides = validMoves.filter(m => m.tile.id === tile.id);
      if (sides.length > 1) {
        setSelectedTile(tile);
        setShowSideSelector(true);
      }
    } else {
      setSelectedTile(null);
      setShowSideSelector(false);
    }
  }, [validMoves]);
  
  // Auto-limpiar notificaciones
  useEffect(() => {
    if (notification?.duration) {
      const timer = setTimeout(clearNotification, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification, clearNotification]);
  
  // ============================================================================
  // RENDERIZADO CONDICIONAL SEGÚN FASE
  // ============================================================================
  
  // Conectando
  if (!connected || !identified) {
    return <ConnectingScreen error={error} onRetry={() => window.location.reload()} />;
  }
  
  // Menú principal / Idle
  if (phase === 'idle') {
    return (
      <div className="online-menu">
        <h1>🎴 Dominó Online</h1>
        <p>Bienvenido, {user?.name || 'Jugador'}</p>
        <p>Rating: {user?.rating || 1500}</p>
        
        <div className="menu-buttons">
          <button className="ranked-btn" onClick={() => searchGame({ mode: 'ranked' })}>
            🏆 Partida Ranked
          </button>
          <button className="casual-btn" onClick={() => searchGame({ mode: 'casual' })}>
            🎮 Partida Casual
          </button>
          <button className="exit-btn" onClick={onExit}>
            🚪 Volver
          </button>
        </div>
      </div>
    );
  }
  
  // Buscando partida
  if (phase === 'searching' || phase === 'loading') {
    return <SearchingScreen onCancel={cancelSearch} />;
  }
  
  // Juego activo
  if (phase === 'playing' || phase === 'roundEnd' || phase === 'gameOver') {
    return (
      <div className="game-online-screen">
        {/* Header con marcador */}
        <Scoreboard 
          scores={scores}
          myTeam={myTeam}
          targetScore={targetScore}
          roundNumber={roundNumber}
        />
        
        {/* Timer */}
        <TurnTimer timeLeft={turnTimeLeft} isMyTurn={isMyTurn} />
        
        {/* Indicadores de jugadores */}
        <div className="players-container">
          {players.map((player, i) => (
            <PlayerIndicator
              key={i}
              player={player}
              position={player.position}
              isCurrentTurn={player.position === currentPlayer}
              handCount={handCounts[player.position]}
              disconnected={player.disconnected}
            />
          ))}
        </div>
        
        {/* Tablero */}
        <GameBoard 
          board={board}
          leftEnd={leftEnd}
          rightEnd={rightEnd}
        />
        
        {/* Mi mano */}
        <PlayerHand
          hand={myHand}
          validMoves={validMoves}
          isMyTurn={isMyTurn}
          onPlayTile={handlePlayTile}
          selectedTile={selectedTile}
          onSelectTile={handleSelectTile}
        />
        
        {/* Botón de pasar */}
        {isMyTurn && validMoves.length === 0 && (
          <button className="pass-btn" onClick={passTurn}>
            Pasar ⏭️
          </button>
        )}
        
        {/* Indicador de turno */}
        {isMyTurn && (
          <div className="turn-notification">
            ¡Tu turno!
          </div>
        )}
        
        {/* Selector de lado */}
        {showSideSelector && selectedTile && (
          <SideSelector
            tile={selectedTile}
            validMoves={validMoves}
            onSelect={(side) => handlePlayTile(selectedTile, side)}
            onCancel={() => handleSelectTile(null)}
          />
        )}
        
        {/* Modal resultado de ronda */}
        {phase === 'roundEnd' && roundResult && (
          <RoundResultModal
            result={roundResult}
            myTeam={myTeam}
          />
        )}
        
        {/* Modal resultado final */}
        {phase === 'gameOver' && gameResult && (
          <GameResultModal
            result={gameResult}
            myTeam={myTeam}
            onPlayAgain={() => {
              returnToMenu();
              setTimeout(() => searchGame({ mode: 'ranked' }), 100);
            }}
            onExit={() => {
              returnToMenu();
              onExit?.();
            }}
          />
        )}
        
        {/* Notificaciones */}
        {notification && (
          <div className={`game-notification ${notification.type}`}>
            {notification.message}
          </div>
        )}
        
        {/* Botón de rendirse */}
        <button className="surrender-btn" onClick={() => {
          if (window.confirm('¿Seguro que quieres rendirte?')) {
            surrender();
          }
        }}>
          🏳️
        </button>
      </div>
    );
  }
  
  return null;
};

export default GameOnlineScreen;
