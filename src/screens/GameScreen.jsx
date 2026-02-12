// ============================================================================
// PANTALLA: JUEGO
// ============================================================================
import React, { useState, memo, useCallback } from 'react';
import Tile from '../components/game/Tile';
import Board from '../components/game/Board';
import PlayerHand from '../components/game/PlayerHand';
import GameHUD, { EmotePanel } from '../components/game/GameHUD';
import { Modal, Button } from '../components/ui';
import { getTranslation } from '../constants/i18n';
import * as Engine from '../utils/gameEngine';

const C = {
  bg: { deep: '#0a0a0f', surface: '#12121a', elevated: '#1a1a24', border: '#2a2a3a' },
  text: { primary: '#ffffff', secondary: '#a0a0b0', muted: '#606070' },
  gold: { main: '#F59E0B' },
  accent: { green: '#10B981', red: '#EF4444' }
};

// Notificación flotante
const FloatingNotification = memo(({ notification }) => {
  if (!notification) return null;
  
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      padding: '16px 32px',
      background: 'rgba(0, 0, 0, 0.9)',
      borderRadius: 16,
      border: `2px solid ${C.gold.main}`,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      zIndex: 50,
      animation: 'fadeInOut 2.5s ease-in-out'
    }}>
      <span style={{ fontSize: 32 }}>{notification.icon}</span>
      <span style={{ 
        color: C.text.primary, 
        fontSize: 18, 
        fontWeight: 700 
      }}>
        {notification.message}
      </span>
    </div>
  );
});

// Botón de pasar turno
const PassButton = memo(({ canPass, onPass, t }) => (
  <button
    onClick={canPass ? onPass : undefined}
    disabled={!canPass}
    style={{
      padding: '12px 32px',
      borderRadius: 12,
      border: 'none',
      background: canPass 
        ? 'linear-gradient(135deg, #DC2626, #EF4444)'
        : C.bg.elevated,
      color: canPass ? '#fff' : C.text.muted,
      fontSize: 15,
      fontWeight: 700,
      cursor: canPass ? 'pointer' : 'not-allowed',
      opacity: canPass ? 1 : 0.5,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      transition: 'transform 150ms ease'
    }}
  >
    ⏭️ {t('game.pass')}
  </button>
));

// Modal de pausa
const PauseModal = memo(({ isOpen, onResume, onSurrender, onSettings, t }) => (
  <Modal
    isOpen={isOpen}
    onClose={onResume}
    title={t('game.paused')}
    size="sm"
    showClose={false}
  >
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Button
        variant="primary"
        fullWidth
        size="lg"
        icon="▶️"
        onClick={onResume}
      >
        {t('game.resume')}
      </Button>
      
      <Button
        variant="secondary"
        fullWidth
        icon="⚙️"
        onClick={onSettings}
      >
        {t('menu.settings')}
      </Button>
      
      <Button
        variant="danger"
        fullWidth
        icon="🏳️"
        onClick={onSurrender}
      >
        {t('game.surrender')}
      </Button>
    </div>
  </Modal>
));

// Modal de confirmación de rendirse
const SurrenderModal = memo(({ isOpen, onConfirm, onCancel, t }) => (
  <Modal
    isOpen={isOpen}
    onClose={onCancel}
    title={t('game.confirmSurrender')}
    size="sm"
  >
    <p style={{ color: C.text.secondary, marginBottom: 20, textAlign: 'center' }}>
      {t('game.surrenderWarning')}
    </p>
    <div style={{ display: 'flex', gap: 10 }}>
      <Button variant="ghost" fullWidth onClick={onCancel}>
        {t('common.cancel')}
      </Button>
      <Button variant="danger" fullWidth onClick={onConfirm}>
        {t('game.surrender')}
      </Button>
    </div>
  </Modal>
));

// Pantalla principal del juego
const GameScreen = ({
  gameState,
  timer,
  isMyTurn,
  selectedTile,
  notification,
  onTileSelect,
  onPlayTile,
  onPass,
  onSurrender,
  onEmote,
  isOnline = false,
  settings = {},
  language = 'es'
}) => {
  const t = (path) => getTranslation(path, language);
  
  const [showPause, setShowPause] = useState(false);
  const [showSurrender, setShowSurrender] = useState(false);
  const [showEmotes, setShowEmotes] = useState(false);
  
  const { 
    players = [], 
    board = { tiles: [], leftEnd: null, rightEnd: null }, 
    currentPlayer = 0, 
    scores = [0, 0],
    roundNum = 1,
    targetScore = 100,
    starterTile
  } = gameState || {};
  
  const myHand = players[0]?.tiles || [];
  
  // Verificar si puede pasar (no tiene fichas jugables)
  const playableTiles = Engine.getPlayableTiles(myHand, board);
  const canPass = isMyTurn && playableTiles.length === 0 && (board.tiles?.length || 0) > 0;
  
  // Manejar selección de ficha
  const handleTileSelect = useCallback((tile) => {
    if (!isMyTurn) return;
    
    // Si es la ficha obligatoria del inicio, jugarla directamente
    if (starterTile && tile.id === starterTile.id) {
      onPlayTile(tile, 'center');
      return;
    }
    
    // Si ya está seleccionada, deseleccionar
    if (selectedTile?.id === tile.id) {
      onTileSelect(null);
      return;
    }
    
    // Seleccionar ficha
    onTileSelect(tile);
    
    // Si el tablero está vacío, jugar automáticamente al centro
    if ((board.tiles?.length || 0) === 0) {
      onPlayTile(tile, 'center');
      onTileSelect(null);
    }
  }, [isMyTurn, selectedTile, starterTile, board.tiles?.length, onTileSelect, onPlayTile]);
  
  // Manejar jugar ficha en posición
  const handlePlayTile = useCallback((tile, position) => {
    onPlayTile(tile, position);
    onTileSelect(null);
  }, [onPlayTile, onTileSelect]);
  
  // Manejar rendirse
  const handleSurrender = useCallback(() => {
    setShowSurrender(false);
    setShowPause(false);
    onSurrender?.();
  }, [onSurrender]);

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
      {/* HUD Superior */}
      <GameHUD
        scores={scores}
        timer={timer}
        currentPlayer={currentPlayer}
        players={players}
        roundNum={roundNum}
        targetScore={targetScore}
        onPause={() => setShowPause(true)}
        onEmote={() => setShowEmotes(true)}
        isOnline={isOnline}
      />
      
      {/* Tablero */}
      <div style={{
        flex: 1,
        padding: 8,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Board
          board={board}
          selectedTile={selectedTile}
          isMyTurn={isMyTurn}
          onPlayTile={handlePlayTile}
          skinSet={settings.skinSet || 'classic'}
          boardTheme={settings.boardTheme || 'green'}
        />
        
        {/* Notificación flotante */}
        <FloatingNotification notification={notification} />
      </div>
      
      {/* Área inferior: mano del jugador + acciones */}
      <div style={{
        background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.5))',
        paddingTop: 8
      }}>
        {/* Botón de pasar (si aplica) */}
        {isMyTurn && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 8
          }}>
            {canPass ? (
              <PassButton canPass={canPass} onPass={onPass} t={t} />
            ) : playableTiles.length > 0 ? (
              <div style={{
                padding: '8px 16px',
                background: 'rgba(16, 185, 129, 0.2)',
                borderRadius: 8,
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: C.accent.green,
                fontSize: 13,
                fontWeight: 600
              }}>
                🎯 {t('game.selectTile')}
              </div>
            ) : null}
          </div>
        )}
        
        {/* Mano del jugador */}
        <PlayerHand
          tiles={myHand}
          board={board}
          isMyTurn={isMyTurn}
          selectedTile={selectedTile}
          onTileSelect={handleTileSelect}
          showHints={settings.showHints !== false}
          skinSet={settings.skinSet || 'classic'}
        />
      </div>
      
      {/* Panel de emotes */}
      {showEmotes && (
        <EmotePanel
          onSelect={(emote) => {
            onEmote?.(emote);
            setShowEmotes(false);
          }}
          onClose={() => setShowEmotes(false)}
        />
      )}
      
      {/* Modal de pausa */}
      <PauseModal
        isOpen={showPause}
        onResume={() => setShowPause(false)}
        onSurrender={() => {
          setShowPause(false);
          setShowSurrender(true);
        }}
        onSettings={() => {
          // TODO: Abrir settings
        }}
        t={t}
      />
      
      {/* Modal de rendirse */}
      <SurrenderModal
        isOpen={showSurrender}
        onConfirm={handleSurrender}
        onCancel={() => setShowSurrender(false)}
        t={t}
      />
      
      {/* CSS para animaciones */}
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          15% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          85% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default memo(GameScreen);
