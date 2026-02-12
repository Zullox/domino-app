// ============================================================================
// APP PRINCIPAL MODULAR - DOMINÓ CUBANO ONLINE
// ============================================================================
// Versión modularizada del juego de dominó cubano.
// Todas las pantallas, hooks y componentes están separados en archivos.

import React, { useState, useCallback, useEffect, Suspense, lazy } from 'react';

// Screens - Lazy Loading
const MenuScreen = lazy(() => import('./screens/MenuScreen'));
const GameScreen = lazy(() => import('./screens/GameScreen'));
const GameResultScreen = lazy(() => import('./screens/GameResultScreen'));
const SearchingScreen = lazy(() => import('./screens/SearchingScreen'));
const SettingsScreen = lazy(() => import('./screens/SettingsScreen'));
const ShopScreen = lazy(() => import('./screens/ShopScreen'));
const ProfileScreen = lazy(() => import('./screens/ProfileScreen'));
const RankingsScreen = lazy(() => import('./screens/RankingsScreen'));
const AchievementsScreen = lazy(() => import('./screens/AchievementsScreen'));
const FriendsScreen = lazy(() => import('./screens/FriendsScreen'));
const LoginScreen = lazy(() => import('./LoginScreen'));

// Hooks
import { useOfflineGame, useOnlineGame, useSettings } from './hooks';

// Context & Services
import { AuthProvider, useAuth } from './AuthContext';
import SocketService from './services/socket';

// Constants
import { getTranslation } from './constants/i18n';

// Styles
import './App.css';

// ============================================================================
// PANTALLA DE CARGA INICIAL
// ============================================================================
const LoadingScreen = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0a0a0f'
  }}>
    <div style={{ fontSize: 72, marginBottom: 24, animation: 'pulse 2s infinite' }}>🁣</div>
    <div style={{ color: '#F59E0B', fontSize: 28, fontWeight: 900, letterSpacing: 3 }}>
      DOMINÓ
    </div>
    <div style={{ color: '#606070', fontSize: 12, marginTop: 8 }}>
      Cargando...
    </div>
  </div>
);

// ============================================================================
// SUSPENSE FALLBACK (para lazy loading)
// ============================================================================
const ScreenLoader = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0a0a0f'
  }}>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16
    }}>
      <div style={{
        width: 48,
        height: 48,
        border: '3px solid #2a2a3a',
        borderTopColor: '#F59E0B',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <div style={{ color: '#606070', fontSize: 14 }}>Cargando...</div>
    </div>
    <style>{`
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// ============================================================================
// CONTENIDO PRINCIPAL DE LA APP
// ============================================================================
const AppContent = () => {
  // Auth
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  
  // Settings
  const { settings, updateSetting, resetSettings } = useSettings();
  
  // Game hooks
  const offlineGame = useOfflineGame({
    targetScore: settings.targetScore,
    turnTime: settings.turnTime,
    difficulty: settings.aiDifficulty
  });
  
  const onlineGame = useOnlineGame({
    name: user?.displayName || 'Jugador',
    rating: user?.rating || 1500,
    odId: user?.odId || user?.uid
  });
  
  // Navigation state
  const [screen, setScreen] = useState('menu');
  const [gameMode, setGameMode] = useState(null); // 'offline' | 'online'
  const [selectedTile, setSelectedTile] = useState(null);
  
  // Translation helper
  const t = (path) => getTranslation(path, settings.language);
  
  // ══════════════════════════════════════════════════════════════════════════
  // NAVEGACIÓN Y ACCIONES
  // ══════════════════════════════════════════════════════════════════════════
  
  // Iniciar juego offline
  const handlePlayOffline = useCallback(() => {
    setGameMode('offline');
    offlineGame.startGame();
    setScreen('game');
  }, [offlineGame]);
  
  // Iniciar búsqueda online
  const handlePlayOnline = useCallback(() => {
    setGameMode('online');
    onlineGame.searchGame();
    setScreen('searching');
  }, [onlineGame]);
  
  // Cancelar búsqueda
  const handleCancelSearch = useCallback(() => {
    onlineGame.cancelSearch();
    setScreen('menu');
    setGameMode(null);
  }, [onlineGame]);
  
  // Jugar ficha
  const handlePlayTile = useCallback((tile, position) => {
    if (gameMode === 'offline') {
      offlineGame.playTile(tile, position);
    } else {
      onlineGame.playTile(tile, position);
    }
    setSelectedTile(null);
  }, [gameMode, offlineGame, onlineGame]);
  
  // Pasar turno
  const handlePass = useCallback(() => {
    if (gameMode === 'offline') {
      offlineGame.passTurn();
    } else {
      onlineGame.passTurn();
    }
  }, [gameMode, offlineGame, onlineGame]);
  
  // Rendirse
  const handleSurrender = useCallback(() => {
    // TODO: Implementar lógica de rendirse
    if (gameMode === 'offline') {
      offlineGame.resetGame();
    } else {
      onlineGame.resetGame();
    }
    setScreen('menu');
    setGameMode(null);
  }, [gameMode, offlineGame, onlineGame]);
  
  // Volver al menú
  const handleBackToMenu = useCallback(() => {
    if (gameMode === 'offline') {
      offlineGame.resetGame();
    } else {
      onlineGame.resetGame();
    }
    setScreen('menu');
    setGameMode(null);
    setSelectedTile(null);
  }, [gameMode, offlineGame, onlineGame]);
  
  // Jugar de nuevo
  const handlePlayAgain = useCallback(() => {
    if (gameMode === 'offline') {
      offlineGame.startGame();
      setScreen('game');
    } else {
      onlineGame.searchGame();
      setScreen('searching');
    }
  }, [gameMode, offlineGame, onlineGame]);
  
  // Revancha
  const handleRematch = useCallback(() => {
    onlineGame.requestRematch();
  }, [onlineGame]);
  
  // ══════════════════════════════════════════════════════════════════════════
  // EFECTOS - TRANSICIONES DE PANTALLA
  // ══════════════════════════════════════════════════════════════════════════
  
  // Cuando se encuentra partida online
  useEffect(() => {
    if (onlineGame.phase === 'found' || onlineGame.phase === 'playing') {
      setScreen('game');
    }
  }, [onlineGame.phase]);
  
  // Cuando termina la partida
  useEffect(() => {
    const phase = gameMode === 'offline' ? offlineGame.phase : onlineGame.phase;
    if (phase === 'gameOver') {
      setScreen('result');
    }
  }, [gameMode, offlineGame.phase, onlineGame.phase]);
  
  // ══════════════════════════════════════════════════════════════════════════
  // OBTENER ESTADO DEL JUEGO ACTUAL
  // ══════════════════════════════════════════════════════════════════════════
  
  const currentGame = gameMode === 'offline' ? offlineGame : onlineGame;
  const gameState = currentGame.gameState;
  const isMyTurn = gameMode === 'offline' ? offlineGame.isMyTurn : onlineGame.isMyTurn;
  const timer = gameMode === 'offline' ? offlineGame.timer : 30; // Online usa timer del servidor
  
  // ══════════════════════════════════════════════════════════════════════════
  // LOADING
  // ══════════════════════════════════════════════════════════════════════════
  
  if (authLoading) {
    return <LoadingScreen />;
  }
  
  // Si no está autenticado, mostrar LoginScreen
  if (!isAuthenticated) {
    return (
      <Suspense fallback={<ScreenLoader />}>
        <LoginScreen />
      </Suspense>
    );
  }
  
  // ══════════════════════════════════════════════════════════════════════════
  // RENDERIZADO DE PANTALLAS
  // ══════════════════════════════════════════════════════════════════════════
  
  // Menú principal
  if (screen === 'menu') {
    return (
      <Suspense fallback={<ScreenLoader />}>
        <MenuScreen
          user={{
            name: user?.displayName || 'Jugador',
            avatar: user?.avatar || '😎',
            rating: user?.rating || 1500,
            tokens: user?.tokens || 500,
            coins: user?.coins || 0,
            friendRequests: user?.friendRequests || 0
          }}
          onPlayOnline={handlePlayOnline}
          onPlayOffline={handlePlayOffline}
          onOpenProfile={() => setScreen('profile')}
          onOpenShop={() => setScreen('shop')}
          onOpenRankings={() => setScreen('rankings')}
          onOpenFriends={() => setScreen('friends')}
          onOpenAchievements={() => setScreen('achievements')}
          onOpenTournaments={() => setScreen('tournaments')}
          onOpenInventory={() => setScreen('inventory')}
          onOpenStats={() => setScreen('stats')}
          onOpenSettings={() => setScreen('settings')}
          onOpenDailyRewards={() => setScreen('dailyRewards')}
          language={settings.language}
        />
      </Suspense>
    );
  }
  
  // Buscando partida
  if (screen === 'searching') {
    return (
      <Suspense fallback={<ScreenLoader />}>
        <SearchingScreen
          user={{
            name: user?.displayName || 'Jugador',
            rating: user?.rating || 1500
          }}
          searchTime={onlineGame.searchTime}
          queuePosition={onlineGame.queuePosition}
          onCancel={handleCancelSearch}
          language={settings.language}
        />
      </Suspense>
    );
  }
  
  // Juego
  if (screen === 'game') {
    if (!gameState) {
      // Mostrar loader mientras espera datos del juego
      return <ScreenLoader />;
    }
    return (
      <Suspense fallback={<ScreenLoader />}>
        <GameScreen
          gameState={gameState}
          timer={timer}
          isMyTurn={isMyTurn}
          selectedTile={selectedTile}
          notification={currentGame.notification}
          onTileSelect={setSelectedTile}
          onPlayTile={handlePlayTile}
          onPass={handlePass}
          onSurrender={handleSurrender}
          onEmote={gameMode === 'online' ? onlineGame.sendEmote : undefined}
          isOnline={gameMode === 'online'}
          settings={settings}
          language={settings.language}
        />
      </Suspense>
    );
  }
  
  // Resultados
  if (screen === 'result' && gameState) {
    return (
      <Suspense fallback={<ScreenLoader />}>
        <GameResultScreen
          result={gameState.gameResult}
          user={{
            rating: user?.rating || 1500
          }}
          onPlayAgain={handlePlayAgain}
          onRematch={handleRematch}
          onMenu={handleBackToMenu}
          rematchState={{}}
          canRematch={gameMode === 'online'}
          isOnline={gameMode === 'online'}
          language={settings.language}
        />
      </Suspense>
    );
  }
  
  // Configuración
  if (screen === 'settings') {
    return (
      <Suspense fallback={<ScreenLoader />}>
        <SettingsScreen
          settings={settings}
          onUpdateSetting={updateSetting}
          onResetSettings={resetSettings}
          onClose={() => setScreen('menu')}
          onLogout={logout}
          language={settings.language}
        />
      </Suspense>
    );
  }
  
  // Tienda
  if (screen === 'shop') {
    return (
      <Suspense fallback={<ScreenLoader />}>
        <ShopScreen
          onClose={() => setScreen('menu')}
          userId={user?.uid}
          userTokens={user?.tokens || 500}
          userCoins={user?.coins || 0}
          inventory={user?.inventory || []}
          equipped={user?.equipped || {}}
          onUserUpdate={(updates) => {
            // El AuthContext debería manejar esto pero por ahora log
            console.log('Usuario actualizado:', updates);
          }}
        />
      </Suspense>
    );
  }
  
  // Perfil
  if (screen === 'profile') {
    return (
      <Suspense fallback={<ScreenLoader />}>
        <ProfileScreen
          user={{
            name: user?.displayName || 'Jugador',
            odId: user?.odId || user?.uid,
            avatar: user?.avatar || '😎',
            rating: user?.rating || 1500,
            tokens: user?.tokens || 500,
            coins: user?.coins || 0,
            stats: user?.stats || {},
            achievements: user?.achievements || [],
            createdAt: user?.createdAt
          }}
          onClose={() => setScreen('menu')}
          onOpenInventory={() => setScreen('inventory')}
          onOpenStats={() => setScreen('stats')}
          language={settings.language}
        />
      </Suspense>
    );
  }
  
  // Rankings
  if (screen === 'rankings') {
    return (
      <Suspense fallback={<ScreenLoader />}>
        <RankingsScreen
          currentUserId={user?.odId || user?.uid}
          onClose={() => setScreen('menu')}
          onViewProfile={(userId) => {
            console.log('Ver perfil:', userId);
            // TODO: Implementar ver perfil de otro usuario
          }}
          language={settings.language}
        />
      </Suspense>
    );
  }
  
  // Amigos
  if (screen === 'friends') {
    return (
      <Suspense fallback={<ScreenLoader />}>
        <FriendsScreen
          userId={user?.odId || user?.uid}
          friends={user?.friends || []}
          friendRequests={user?.friendRequests || []}
          onClose={() => setScreen('menu')}
          onInviteToGame={(friendId) => {
            console.log('Invitar a juego:', friendId);
            // TODO: Implementar invitar
          }}
          language={settings.language}
        />
      </Suspense>
    );
  }
  
  // Logros
  if (screen === 'achievements') {
    return (
      <Suspense fallback={<ScreenLoader />}>
        <AchievementsScreen
          userId={user?.uid}
          onClose={() => setScreen('menu')}
          language={settings.language}
        />
      </Suspense>
    );
  }
  
  // Pantalla por defecto (loading)
  return <LoadingScreen />;
};

// ============================================================================
// APP CON PROVIDERS
// ============================================================================
const App = () => {
  // Inicializar socket al montar
  useEffect(() => {
    SocketService.initSocket();
    
    return () => {
      SocketService.disconnectSocket();
    };
  }, []);
  
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
