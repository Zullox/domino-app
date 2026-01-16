// ============================================================================
// APP PRINCIPAL - DOMINÓ RANKED
// ============================================================================
// Este archivo ahora es limpio y modular.
// Toda la lógica pesada está en contextos y servicios.

import React, { useState, useEffect, useCallback } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Tile, Board, PlayerHand, GameHUD, EmotePanel } from './components/game';
import { THEME, getRank, TIER_COLORS } from './constants/game';
import { getTranslation, LANGUAGES } from './constants/i18n';
import SocketService from './services/socket';
import * as Engine from './utils/gameEngine';

// CSS Global
import './App.css';

const C = THEME.colors;

// ============================================================================
// PANTALLA DE CARGA
// ============================================================================
const LoadingScreen = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: C.bg.deep
  }}>
    <div style={{ fontSize: 64, marginBottom: 24 }}>🁣</div>
    <div style={{ color: C.gold.main, fontSize: 24, fontWeight: 800 }}>
      DOMINÓ
    </div>
    <div style={{ color: C.text.muted, fontSize: 14, marginTop: 8 }}>
      Cargando...
    </div>
  </div>
);

// ============================================================================
// PANTALLA DE MENÚ
// ============================================================================
const MenuScreen = ({ onPlayOnline, onPlayOffline, settings, onOpenSettings }) => {
  const t = (path) => getTranslation(path, settings.language || 'es');
  const [connected, setConnected] = useState(SocketService.isConnected());
  
  useEffect(() => {
    const unsub = SocketService.on('onConnect', () => setConnected(true));
    const unsub2 = SocketService.on('onDisconnect', () => setConnected(false));
    return () => { unsub(); unsub2(); };
  }, []);
  
  return (
    <div style={{
      minHeight: '100vh',
      background: C.bg.deep,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '60px 20px 20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🁣</div>
        <h1 style={{ 
          color: C.gold.main, 
          fontSize: 32, 
          fontWeight: 900,
          letterSpacing: 2 
        }}>
          DOMINÓ
        </h1>
        <p style={{ color: C.text.muted, fontSize: 12 }}>
          Ranked Edition
        </p>
      </div>
      
      {/* Estado de conexión */}
      <div style={{
        margin: '0 20px 20px',
        padding: 12,
        borderRadius: 12,
        background: connected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        border: `1px solid ${connected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }}>
        <div style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: connected ? '#10B981' : '#EF4444'
        }} />
        <span style={{ color: connected ? '#10B981' : '#EF4444', fontSize: 13 }}>
          {connected ? t('menu.serverOnline') : t('menu.offlineMode')}
        </span>
      </div>
      
      {/* Botones principales */}
      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Jugar Online */}
        <button
          onClick={onPlayOnline}
          disabled={!connected}
          style={{
            width: '100%',
            padding: 20,
            borderRadius: 16,
            border: 'none',
            background: connected 
              ? `linear-gradient(135deg, ${C.gold.dark}, ${C.gold.main})`
              : C.bg.elevated,
            color: connected ? C.bg.deep : C.text.muted,
            fontSize: 18,
            fontWeight: 800,
            cursor: connected ? 'pointer' : 'not-allowed',
            opacity: connected ? 1 : 0.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10
          }}
        >
          <span style={{ fontSize: 24 }}>🌐</span>
          {t('menu.playOnline')}
        </button>
        
        {/* Jugar Offline */}
        <button
          onClick={onPlayOffline}
          style={{
            width: '100%',
            padding: 18,
            borderRadius: 16,
            border: `2px solid ${C.bg.border}`,
            background: C.bg.surface,
            color: C.text.primary,
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10
          }}
        >
          <span style={{ fontSize: 22 }}>🤖</span>
          {t('menu.playOffline')}
        </button>
      </div>
      
      {/* Grid de accesos rápidos */}
      <div style={{ padding: 20 }}>
        <h3 style={{ color: C.text.primary, fontSize: 14, fontWeight: 700, marginBottom: 10 }}>
          {t('menu.quickAccess')}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {[
            { icon: '🏆', label: t('menu.rankings') },
            { icon: '👥', label: t('menu.friends') },
            { icon: '🎖️', label: t('menu.achievements') },
            { icon: '🛒', label: t('menu.shop') },
            { icon: '🏅', label: t('menu.tournaments') },
            { icon: '🎒', label: t('menu.inventory') },
            { icon: '📊', label: t('menu.stats') },
            { icon: '⚙️', label: t('menu.settings'), action: onOpenSettings }
          ].map((item, i) => (
            <button
              key={i}
              onClick={item.action}
              style={{
                background: C.bg.surface,
                borderRadius: 12,
                padding: 10,
                border: `1px solid ${C.bg.border}`,
                textAlign: 'center',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2
              }}
            >
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ color: '#fff', fontSize: 10, fontWeight: 600 }}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PANTALLA DE JUEGO
// ============================================================================
const GameScreen = ({ 
  players, 
  board, 
  currentPlayer, 
  scores, 
  timer,
  roundNum,
  targetScore,
  isMyTurn,
  selectedTile,
  onTileSelect,
  onPlayTile,
  onPass,
  onPause,
  onEmote,
  isOnline,
  settings
}) => {
  const [showEmotes, setShowEmotes] = useState(false);
  const myHand = players[0]?.tiles || [];
  
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: C.bg.deep
    }}>
      {/* HUD superior */}
      <GameHUD
        scores={scores}
        timer={timer}
        currentPlayer={currentPlayer}
        players={players}
        roundNum={roundNum}
        targetScore={targetScore}
        onPause={onPause}
        onEmote={() => setShowEmotes(true)}
        isOnline={isOnline}
      />
      
      {/* Tablero */}
      <div style={{ flex: 1, padding: 8 }}>
        <Board
          board={board}
          selectedTile={selectedTile}
          isMyTurn={isMyTurn}
          onPlayTile={onPlayTile}
          skinSet={settings.skinSet || 'classic'}
          boardTheme={settings.boardTheme || 'green'}
        />
      </div>
      
      {/* Mano del jugador */}
      <PlayerHand
        tiles={myHand}
        board={board}
        isMyTurn={isMyTurn}
        selectedTile={selectedTile}
        onTileSelect={onTileSelect}
        showHints={true}
        skinSet={settings.skinSet || 'classic'}
      />
      
      {/* Botón de pasar */}
      {isMyTurn && !Engine.hasPlayableTile(myHand, board) && (
        <button
          onClick={onPass}
          style={{
            position: 'fixed',
            bottom: 200,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '16px 40px',
            borderRadius: 16,
            border: 'none',
            background: C.accent.red,
            color: '#fff',
            fontSize: 16,
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.4)'
          }}
        >
          PASAR
        </button>
      )}
      
      {/* Panel de emotes */}
      {showEmotes && (
        <EmotePanel
          onSelect={onEmote}
          onClose={() => setShowEmotes(false)}
        />
      )}
    </div>
  );
};

// ============================================================================
// PANTALLA DE FIN DE PARTIDA
// ============================================================================
const GameOverScreen = ({ 
  won, 
  scores, 
  eloChange, 
  rating,
  rewards,
  rematchState,
  onRematch,
  onAcceptRematch,
  onDeclineRematch,
  onPlayAgain,
  onMenu,
  settings
}) => {
  const t = (path) => getTranslation(path, settings.language || 'es');
  const rank = getRank(rating);
  const canRematch = rematchState.count < 3;
  
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      background: C.bg.deep
    }}>
      {/* Modal de revancha recibida */}
      {rematchState.received && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }}>
          <div style={{
            background: C.bg.surface,
            borderRadius: 20,
            padding: 24,
            textAlign: 'center',
            border: `2px solid ${C.gold.main}`
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚔️</div>
            <p style={{ color: C.gold.main, fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
              {t('endGame.rematchReceived')}
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={onAcceptRematch}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  borderRadius: 12,
                  border: 'none',
                  background: C.accent.green,
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                ✓ {t('endGame.acceptRematch')}
              </button>
              <button
                onClick={onDeclineRematch}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  borderRadius: 12,
                  border: `1px solid ${C.accent.red}`,
                  background: 'transparent',
                  color: C.accent.red,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                ✕ {t('endGame.declineRematch')}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Card principal */}
      <div style={{
        width: '100%',
        maxWidth: 360,
        background: C.bg.surface,
        borderRadius: 20,
        padding: 24,
        border: `2px solid ${won ? C.gold.main : C.accent.red}`,
        textAlign: 'center'
      }}>
        {/* Icono y título */}
        <div style={{ fontSize: 56, marginBottom: 8 }}>{won ? '🏆' : '😔'}</div>
        <h1 style={{ 
          color: won ? C.gold.main : C.accent.red, 
          fontSize: 28, 
          fontWeight: 900,
          marginBottom: 16 
        }}>
          {won ? t('endGame.victory') : t('endGame.defeat')}
        </h1>
        
        {/* Marcador */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          padding: 16,
          borderRadius: 12,
          background: C.bg.deep,
          marginBottom: 16
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: C.accent.blue, fontSize: 12 }}>🔵 {t('game.you')}</div>
            <div style={{ color: '#fff', fontSize: 32, fontWeight: 800 }}>{scores[0]}</div>
          </div>
          <div style={{ color: C.text.muted, fontSize: 20 }}>-</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: C.accent.red, fontSize: 12 }}>{t('game.rival')} 🔴</div>
            <div style={{ color: '#fff', fontSize: 32, fontWeight: 800 }}>{scores[1]}</div>
          </div>
        </div>
        
        {/* Recompensas */}
        {rewards && rewards.tokens > 0 && (
          <div style={{
            padding: 12,
            borderRadius: 12,
            background: 'rgba(251, 191, 36, 0.1)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            marginBottom: 16
          }}>
            <div style={{ color: C.gold.main, fontSize: 14, fontWeight: 700 }}>
              🪙 +{rewards.tokens} Tokens
            </div>
          </div>
        )}
        
        {/* Rango */}
        <div style={{
          padding: 12,
          borderRadius: 12,
          background: TIER_COLORS[rank.tier]?.bg || C.bg.card,
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 28 }}>{rank.icon}</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ color: '#fff', fontWeight: 700 }}>{rank.name}</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{rating} MMR</div>
            </div>
          </div>
          <div style={{
            padding: '6px 12px',
            borderRadius: 8,
            background: 'rgba(0,0,0,0.3)',
            color: eloChange > 0 ? '#4ade80' : '#f87171',
            fontWeight: 700
          }}>
            {eloChange > 0 ? '+' : ''}{eloChange}
          </div>
        </div>
        
        {/* Botones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Revancha */}
          {canRematch && !rematchState.declined && (
            <button
              onClick={onRematch}
              disabled={rematchState.requested}
              style={{
                width: '100%',
                padding: 14,
                borderRadius: 12,
                border: 'none',
                background: rematchState.requested 
                  ? C.bg.card 
                  : 'linear-gradient(135deg, #F59E0B, #D97706)',
                color: rematchState.requested ? C.text.muted : '#fff',
                fontSize: 14,
                fontWeight: 700,
                cursor: rematchState.requested ? 'default' : 'pointer'
              }}
            >
              {rematchState.accepted ? `✓ ${t('endGame.rematchAccepted')}` :
               rematchState.requested ? `⏳ ${t('endGame.waitingResponse')}` :
               `⚔️ ${t('endGame.rematch')}`}
            </button>
          )}
          
          {/* Jugar de nuevo */}
          <button
            onClick={onPlayAgain}
            style={{
              width: '100%',
              padding: 16,
              borderRadius: 12,
              border: 'none',
              background: `linear-gradient(135deg, ${C.gold.dark}, ${C.gold.main})`,
              color: C.bg.deep,
              fontSize: 16,
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            🔄 {t('endGame.playAgain')}
          </button>
          
          {/* Menú */}
          <button
            onClick={onMenu}
            style={{
              width: '100%',
              padding: 14,
              borderRadius: 12,
              border: `1px solid ${C.bg.border}`,
              background: C.bg.card,
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            🏠 {t('endGame.backToMenu')}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// APP PRINCIPAL CON CONTEXTO
// ============================================================================
const AppContent = () => {
  const [phase, setPhase] = useState('menu');
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('dominoSettings');
      return saved ? JSON.parse(saved) : { language: 'es', skinSet: 'classic', boardTheme: 'green' };
    } catch {
      return { language: 'es', skinSet: 'classic', boardTheme: 'green' };
    }
  });
  
  // Guardar settings
  useEffect(() => {
    localStorage.setItem('dominoSettings', JSON.stringify(settings));
  }, [settings]);
  
  // Estado del juego para modo offline
  const [gameState, setGameState] = useState(null);
  
  // Iniciar juego offline
  const startOfflineGame = useCallback(() => {
    const hands = Engine.dealTiles(4);
    const players = [
      { id: 0, name: 'Tú', tiles: hands[0], team: 0, avatar: '😎', rating: 1500 },
      { id: 1, name: 'Carlos', tiles: hands[1], team: 1, avatar: '🧔', rating: 1480 },
      { id: 2, name: 'María', tiles: hands[2], team: 0, avatar: '👩', rating: 1520 },
      { id: 3, name: 'Pedro', tiles: hands[3], team: 1, avatar: '👨', rating: 1490 }
    ];
    
    const starter = Engine.findStartingPlayer(players);
    
    setGameState({
      players,
      board: Engine.createBoard(),
      currentPlayer: starter.player,
      scores: [0, 0],
      timer: 30,
      roundNum: 1,
      targetScore: 100,
      selectedTile: null,
      isOnline: false
    });
    
    setPhase('playing');
  }, []);
  
  // Render según fase
  if (phase === 'menu') {
    return (
      <MenuScreen
        onPlayOnline={() => setPhase('searching')}
        onPlayOffline={startOfflineGame}
        settings={settings}
        onOpenSettings={() => setPhase('settings')}
      />
    );
  }
  
  if (phase === 'playing' && gameState) {
    return (
      <GameScreen
        players={gameState.players}
        board={gameState.board}
        currentPlayer={gameState.currentPlayer}
        scores={gameState.scores}
        timer={gameState.timer}
        roundNum={gameState.roundNum}
        targetScore={gameState.targetScore}
        isMyTurn={gameState.currentPlayer === 0}
        selectedTile={gameState.selectedTile}
        onTileSelect={(tile) => setGameState(g => ({ ...g, selectedTile: tile }))}
        onPlayTile={(tile, pos) => {
          const newBoard = Engine.placeTile(gameState.board, tile, pos);
          setGameState(g => ({
            ...g,
            board: newBoard,
            players: g.players.map((p, i) => 
              i === 0 ? { ...p, tiles: p.tiles.filter(t => t.id !== tile.id) } : p
            ),
            currentPlayer: (g.currentPlayer + 1) % 4,
            selectedTile: null
          }));
        }}
        onPass={() => setGameState(g => ({ ...g, currentPlayer: (g.currentPlayer + 1) % 4 }))}
        onPause={() => setPhase('paused')}
        onEmote={(e) => console.log('Emote:', e)}
        isOnline={false}
        settings={settings}
      />
    );
  }
  
  return <LoadingScreen />;
};

// ============================================================================
// EXPORT PRINCIPAL
// ============================================================================
const App = () => (
  <GameProvider>
    <AppContent />
  </GameProvider>
);

export default App;
