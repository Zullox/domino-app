// ============================================================================
// DOMINO RANKED - Componente principal del juego
// ============================================================================
// Versión unificada: juego local vs IA + juego online servidor autoritativo
// El mismo componente renderiza ambos modos
// ============================================================================

import React, { useState, useCallback, useEffect, useMemo } from 'react';

// Hooks
import { 
  usePlayerProfile, 
  useTranslation,
  useRematch,
  useFriends,
  useLocalGame
} from '../hooks';
import { useOnlineGame } from '../hooks/useOnlineGame';

// Components
import { 
  Board, 
  PlayerHandArea, 
  GameHUD,
  OpponentHandTop,
  OpponentHandSide,
  PassIndicator
} from '../components/game';
import { SettingsModal, DailyRewardsModal } from '../components/modals';

// Screens
import {
  RankingsScreen,
  ShopScreen,
  InventoryScreen,
  FriendsScreen,
  AchievementsScreen,
  TournamentsScreen,
  SettingsScreen,
  ProfileScreen,
  SearchingScreen,
  GameResultScreen,
  TutorialScreen,
  PrivateRoomScreen,
  CoinStoreScreen,
  SeasonPassScreen
} from '../screens';

// Services
import * as Socket from '../services/socket';

// Constants
import { THEME } from '../constants/game';
import { SERVIDOR_URL } from '../constants/serverConfig';

const C = THEME.colors;

// ============================================================================
// EMOTES
// ============================================================================
const EMOTES = ['👍', '👎', '👏', '😂', '😢', '😡', '🤔', '😎', '🔥', '💪', '🎯', '🎲'];

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const DominoRanked = ({ authUser, onRequestLogin, onLogout }) => {
  const { t } = useTranslation();
  
  // === MODE STATE ===
  const [gameMode, setGameMode] = useState('menu'); // menu | local | online
  const [menuPhase, setMenuPhase] = useState('menu'); // menu | searching | playing | gameOver

  // === UI STATE ===
  const [activeScreen, setActiveScreen] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showDailyRewards, setShowDailyRewards] = useState(false);
  const [showEmoteMenu, setShowEmoteMenu] = useState(false);
  const [notification, setNotification] = useState(null);
  const [lastOpponent, setLastOpponent] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);

  // === HELPERS ===
  const showNotificationFn = useCallback((type, message, icon, duration = 2500) => {
    setNotification({ type, message, icon });
    setTimeout(() => setNotification(null), duration);
  }, []);

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('dominoSettings');
      return saved ? JSON.parse(saved) : {
        sound: true,
        vibration: true,
        animations: true,
        turnTime: 30,
        aiDifficulty: 'hard',
        aiSpeed: 'normal',
        suggestMoves: true,
        showTileCount: true
      };
    } catch (e) { return {}; }
  });

  useEffect(() => {
    localStorage.setItem('dominoSettings', JSON.stringify(settings));
  }, [settings]);

  const vibrate = useCallback((pattern = [50]) => {
    if (settings.vibration && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, [settings.vibration]);

  // === ONLINE GAME HOOK ===
  const online = useOnlineGame(authUser);

  // === LOCAL GAME HOOK (full monolith logic) ===
  const local = useLocalGame({
    settings,
    vibrate,
    showNotification: showNotificationFn
  });

  // === FRIENDS HOOK ===
  const friendsHook = useFriends(authUser);

  // === PROFILE HOOK ===
  const {
    profile,
    playerProfile,
    playerCurrencies,
    setPlayerCurrencies,
    playerInventory,
    equippedCosmetics,
    dailyRewards,
    seasonPass,
    rankChange,
    lastMatchRewards,
    setLastMatchRewards,
    updatePlayerStats,
    updatePlayerRating,
    handlePurchase,
    equipCosmetic,
    claimDailyReward,
    calculateMatchRewards
  } = usePlayerProfile(authUser);

  // === REMATCH HOOK ===
  const rematch = useRematch({
    socket: Socket.getSocket(),
    gameMode,
    lastOpponent,
    onStartRematch: () => startNewGame(gameMode),
    onNotification: showNotificationFn
  });

  // ============================================================================
  // IS ONLINE? - Determines data source
  // ============================================================================
  const isOnline = gameMode === 'online';

  // Unified getters — online reads from hook, local from useLocalGame
  const activeBoard = isOnline ? online.serverBoard : local.board;
  const activePlayers = isOnline ? online.serverPlayers : local.players;
  const activeCurrent = isOnline ? online.serverCurrent : local.current;
  const activeScores = isOnline ? online.serverScores : local.scores;
  const activeTimer = isOnline ? online.turnTimeLeft : local.timer;
  const activeTarget = isOnline ? online.targetScore : local.target;
  const activeRoundResult = isOnline ? online.roundResult : local.roundResult;
  const activeMyTiles = isOnline ? online.serverHand : (local.players[0]?.tiles || []);
  const activeIsMyTurn = isOnline ? (online.serverCurrent === 0) : local.isMyTurn;

  // ============================================================================
  // VALID MOVES (unified)
  // ============================================================================
  const validMoves = useMemo(() => {
    if (!activeIsMyTurn) return [];

    if (isOnline) {
      const moves = [];
      const validSet = online.serverValidMoves || [];

      activeMyTiles.forEach(tile => {
        const vm = validSet.find(v => v.tileId === tile.id);
        if (vm) {
          const positions = [];
          if (vm.sides) {
            vm.sides.forEach(s => positions.push(s === 'left' ? 'top' : 'bottom'));
          } else {
            if (vm.canLeft || vm.left) positions.push('top');
            if (vm.canRight || vm.right) positions.push('bottom');
          }
          if (positions.length > 0) moves.push({ tile, positions });
        }
      });

      if (moves.length === 0 && validSet.length > 0 && typeof validSet[0] === 'string') {
        validSet.forEach(tileId => {
          const tile = activeMyTiles.find(t => t.id === tileId);
          if (tile) moves.push({ tile, positions: ['top', 'bottom'] });
        });
      }

      return moves;
    }

    // Local mode - use hook's validMoves
    return local.validMoves;
  }, [activeIsMyTurn, isOnline, activeMyTiles, online.serverValidMoves, local.validMoves]);

  const canPlay = validMoves.length > 0;

  // ============================================================================
  // SYNC ONLINE PHASE → MENU PHASE
  // ============================================================================
  useEffect(() => {
    if (!isOnline) return;

    if (online.onlinePhase === 'searching') {
      setMenuPhase('searching');
    } else if (online.onlinePhase === 'playing') {
      setMenuPhase('playing');
    } else if (online.onlinePhase === 'roundEnd') {
      setMenuPhase('playing');
    } else if (online.onlinePhase === 'gameOver') {
      if (online.gameEndData) {
        const won = online.gameEndData.won;
        if (calculateMatchRewards) {
          calculateMatchRewards(won, { scores: online.gameEndData.scores, type: won ? 'victory' : 'defeat' });
        }
        if (updatePlayerStats) {
          updatePlayerStats({
            gamesPlayed: (playerProfile.stats?.gamesPlayed || 0) + 1,
            wins: won ? (playerProfile.stats?.wins || 0) + 1 : playerProfile.stats?.wins || 0,
            losses: !won ? (playerProfile.stats?.losses || 0) + 1 : playerProfile.stats?.losses || 0
          });
        }
      }
      setMenuPhase('gameOver');
    } else if (online.onlinePhase === 'idle' && menuPhase === 'searching') {
      setMenuPhase('menu');
    }
  }, [isOnline, online.onlinePhase, online.gameEndData]);

  // Sync local phase → menuPhase
  useEffect(() => {
    if (isOnline) return;
    if (local.phase === 'playing') setMenuPhase('playing');
    else if (local.phase === 'gameOver') {
      const won = local.scores[0] >= local.target;
      if (calculateMatchRewards) {
        const boardEnds = local.Engine.getBoardEnds(local.board);
        const isCapicua = local.roundResult?.type === 'domino' 
          && boardEnds.leftEnd === boardEnds.rightEnd && boardEnds.leftEnd !== null;
        const wasComeback = local.scores[1] - local.scores[0] >= 30 && won;
        calculateMatchRewards(won, {
          endType: local.roundResult?.type,
          isCapicua,
          opponentScore: local.scores[1],
          wasComeback,
          winStreak: won ? (playerProfile.stats?.currentWinStreak || 0) + 1 : 0
        });
      }
      if (updatePlayerStats) {
        updatePlayerStats({
          gamesPlayed: (playerProfile.stats?.gamesPlayed || 0) + 1,
          wins: won ? (playerProfile.stats?.wins || 0) + 1 : playerProfile.stats?.wins || 0,
          losses: !won ? (playerProfile.stats?.losses || 0) + 1 : playerProfile.stats?.losses || 0,
          currentWinStreak: won ? (playerProfile.stats?.currentWinStreak || 0) + 1 : 0
        });
      }
      setLastOpponent(local.players[1]);
      setMenuPhase('gameOver');
    } else if (local.phase === 'idle') {
      // Only go back to menu if we're not already there
      if (menuPhase !== 'menu') setMenuPhase('menu');
    }
  }, [isOnline, local.phase]);

  // ============================================================================
  // START NEW GAME
  // ============================================================================
  const startNewGame = useCallback((mode = 'local') => {
    setGameMode(mode);

    if (mode === 'online') {
      setMenuPhase('searching');
      online.searchGame({ mode: 'ranked', targetScore: 200 });
      return;
    }

    // Local mode
    if (setLastMatchRewards) setLastMatchRewards(null);
    rematch.resetRematchState();
    local.startNewMatch();
  }, [online, local, rematch, setLastMatchRewards]);

  // ============================================================================
  // PLAY TILE (unified)
  // ============================================================================
  const handlePlayTile = useCallback((tile, position) => {
    if (isOnline) {
      online.playTileOnline(tile, position);
      return;
    }
    local.playTile(tile, position);
  }, [isOnline, online, local]);

  // ============================================================================
  // PASS (unified)
  // ============================================================================
  const handlePass = useCallback(() => {
    if (isOnline) { online.passOnline(); return; }
    local.pass();
  }, [isOnline, online, local]);

  // ============================================================================
  // BACK TO MENU
  // ============================================================================
  const backToMenu = useCallback(() => {
    if (isOnline) online.backToMenuOnline();
    local.reset();
    setGameMode('menu');
    setMenuPhase('menu');
    if (setLastMatchRewards) setLastMatchRewards(null);
    rematch.resetRematchState();
  }, [rematch, setLastMatchRewards, isOnline, online, local]);

  // ============================================================================
  // FETCH LEADERBOARD
  // ============================================================================
  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch(`${SERVIDOR_URL}/api/leaderboard`);
      if (res.ok) {
        const data = await res.json();
        setLeaderboardData(data.leaderboard || data || []);
      }
    } catch (e) { console.warn('[Rankings] Error:', e); }
  }, []);

  // ============================================================================
  // RENDER: SCREENS
  // ============================================================================
  if (activeScreen) {
    const screenProps = {
      onClose: () => setActiveScreen(null),
      playerProfile: profile,
      playerCurrencies,
      playerInventory,
      equippedCosmetics,
      onPurchase: handlePurchase,
      onEquip: equipCosmetic,
      t
    };

    switch (activeScreen) {
      case 'rankings':
        return <RankingsScreen {...screenProps} currentUser={profile} rankings={leaderboardData} myPosition={leaderboardData.findIndex(p => p.odId === authUser?.id) + 1} onPlayerPress={() => {}} />;
      case 'shop': return <ShopScreen {...screenProps} />;
      case 'inventory': return <InventoryScreen {...screenProps} />;
      case 'friends':
        return <FriendsScreen {...screenProps}
          friends={friendsHook.friends}
          friendRequests={friendsHook.friendRequests}
          onAddFriend={(userId) => friendsHook.addFriend(userId).then(r => { if (r.success) showNotificationFn('success', 'Solicitud enviada', '✅'); else showNotificationFn('error', r.error || 'Error', '❌'); })}
          onAcceptRequest={(req) => friendsHook.acceptRequest(req?.id || req).then(r => { if (r.success) showNotificationFn('success', '¡Amigo agregado!', '🤝'); })}
          onRejectRequest={(req) => friendsHook.rejectRequest(req?.id || req)}
          onInviteFriend={(friend) => friendsHook.inviteFriend(friend?.id || friend)}
          onRemoveFriend={(friend) => friendsHook.deleteFriend(friend?.id || friend)}
          onViewProfile={() => {}}
          onSearch={(term) => friendsHook.searchForUsers(term)}
          searchResults={friendsHook.searchResults}
        />;
      case 'achievements': return <AchievementsScreen {...screenProps} playerStats={playerProfile.stats} />;
      case 'tournaments': return <TournamentsScreen {...screenProps} />;
      case 'profile': return <ProfileScreen {...screenProps} onLogout={onLogout} />;
      case 'settings': return <SettingsScreen {...screenProps} settings={settings} onSettingsChange={setSettings} />;
      case 'tutorial': return <TutorialScreen {...screenProps} />;
      case 'privateRoom':
        return <PrivateRoomScreen {...screenProps} socket={Socket.getSocket()} user={authUser} friends={friendsHook.friends} onBack={() => setActiveScreen(null)} onGameStart={() => { setGameMode('online'); setMenuPhase('playing'); setActiveScreen(null); }} />;
      case 'coinStore':
        return <CoinStoreScreen {...screenProps}
          user={{ uid: authUser?.id || profile.odId || 'guest', coins: playerCurrencies.coins, tokens: playerCurrencies.tokens }}
          onBack={() => setActiveScreen(null)}
          onBalanceUpdate={(newBalance) => { if (newBalance) setPlayerCurrencies(prev => ({ ...prev, ...newBalance })); }}
        />;
      case 'seasonPass':
        return <SeasonPassScreen {...screenProps}
          user={{ uid: authUser?.id || profile.odId || 'guest', seasonPass: { level: seasonPass?.tier || 0, xp: seasonPass?.xp || 0, premium: seasonPass?.owned || false } }}
          onBack={() => setActiveScreen(null)}
          onPurchasePass={() => showNotificationFn('info', 'Función próximamente', '🔜')}
        />;
      default: break;
    }
  }

  // ============================================================================
  // RENDER: SEARCHING
  // ============================================================================
  if (menuPhase === 'searching') {
    return (
      <div style={{ minHeight: '100vh', background: C.bg.deep, color: '#fff', display: 'flex', flexDirection: 'column' }}>
        <SearchingScreen
          user={profile}
          searchTime={online.searchTime}
          onCancel={() => {
            online.cancelSearch();
            setGameMode('menu');
            setMenuPhase('menu');
          }}
        />
      </div>
    );
  }

  // ============================================================================
  // RENDER: MENU
  // ============================================================================
  if (menuPhase === 'menu') {
    return (
      <div style={{ minHeight: '100vh', background: C.bg.deep, color: C.text.primary, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: 16, borderBottom: `1px solid ${C.bg.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => setActiveScreen('profile')} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg, ${C.gold.main}, ${C.gold.dark})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
              {profile.rankIcon || '🎲'}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#fff' }}>{profile.name}</div>
              <div style={{ fontSize: 13, color: C.text.secondary }}>{profile.rank || 'Sin rango'} • {profile.elo || 1500}</div>
            </div>
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ padding: '8px 12px', borderRadius: 20, background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>💎</span><span style={{ color: '#a855f7', fontWeight: 700 }}>{playerCurrencies.coins}</span>
            </div>
            <div style={{ padding: '8px 12px', borderRadius: 20, background: 'rgba(247, 179, 43, 0.15)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>🪙</span><span style={{ color: '#f7b32b', fontWeight: 700 }}>{playerCurrencies.tokens}</span>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button onClick={() => startNewGame('local')} style={{ padding: 20, borderRadius: 16, border: 'none', background: `linear-gradient(135deg, ${C.accent.green}, #16a34a)`, color: '#fff', fontSize: 18, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              🎮 Jugar vs IA
            </button>
            <button onClick={() => startNewGame('online')} disabled={!online.connected} style={{ padding: 20, borderRadius: 16, border: 'none', background: online.connected ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : '#333', color: '#fff', fontSize: 18, fontWeight: 700, cursor: online.connected ? 'pointer' : 'not-allowed', opacity: online.connected ? 1 : 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              🌐 Jugar Online {online.connected && <span style={{ fontSize: 12, background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 10 }}>{online.onlineCount} en línea</span>}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { icon: '🏆', label: 'Ranking', screen: 'rankings', action: fetchLeaderboard },
              { icon: '🛒', label: 'Tienda', screen: 'shop' },
              { icon: '🎒', label: 'Inventario', screen: 'inventory' },
              { icon: '👥', label: 'Amigos', screen: 'friends' },
              { icon: '⚔️', label: 'Torneos', screen: 'tournaments' },
              { icon: '🏠', label: 'Sala', screen: 'privateRoom' },
              { icon: '💎', label: 'Monedas', screen: 'coinStore' },
              { icon: '🌟', label: 'Pase', screen: 'seasonPass' }
            ].map(item => (
              <button key={item.screen} onClick={() => { if (item.action) item.action(); setActiveScreen(item.screen); }} style={{ padding: '16px 8px', borderRadius: 12, border: `1px solid ${C.bg.border}`, background: C.bg.card, color: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 24 }}>{item.icon}</span><span style={{ fontSize: 11 }}>{item.label}</span>
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            <button onClick={() => setActiveScreen('achievements')} style={{ padding: 16, borderRadius: 12, border: `1px solid ${C.bg.border}`, background: C.bg.card, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>🏅</span>
              <div style={{ textAlign: 'left' }}><div style={{ fontWeight: 600 }}>Logros</div><div style={{ fontSize: 12, color: C.text.secondary }}>{playerProfile.stats?.achievementsUnlocked || 0} desbloqueados</div></div>
            </button>
            <button onClick={() => setActiveScreen('settings')} style={{ padding: 16, borderRadius: 12, border: `1px solid ${C.bg.border}`, background: C.bg.card, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 24 }}>⚙️</span>
              <div style={{ textAlign: 'left' }}><div style={{ fontWeight: 600 }}>Ajustes</div><div style={{ fontSize: 12, color: C.text.secondary }}>Configuración</div></div>
            </button>
          </div>
        </div>

        {online.connectionError && <div style={{ padding: 12, background: 'rgba(239, 68, 68, 0.2)', borderTop: '1px solid rgba(239, 68, 68, 0.3)', textAlign: 'center', fontSize: 13, color: '#ef4444' }}>⚠️ {online.connectionError}</div>}
        {showDailyRewards && <DailyRewardsModal dailyRewards={dailyRewards} onClaim={claimDailyReward} onClose={() => setShowDailyRewards(false)} />}
        {notification && <div style={{ position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)', background: notification.type === 'success' ? 'rgba(34, 197, 94, 0.9)' : notification.type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(59, 130, 246, 0.9)', color: '#fff', padding: '12px 24px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, zIndex: 2000, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>{notification.icon && <span>{notification.icon}</span>}{notification.message}</div>}
      </div>
    );
  }

  // ============================================================================
  // RENDER: GAME OVER
  // ============================================================================
  if (menuPhase === 'gameOver') {
    const won = isOnline ? online.gameEndData?.won : local.scores[0] >= local.target;
    const ratingChange = isOnline && online.gameEndData?.ratingChanges
      ? online.gameEndData.ratingChanges.find(r => r.position === online.myPosition)
      : null;

    return (
      <div style={{ minHeight: '100vh', background: C.bg.deep, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>{won ? '🏆' : '😢'}</div>
        <h1 style={{ fontSize: 32, marginBottom: 8 }}>{won ? '¡Victoria!' : 'Derrota'}</h1>
        <p style={{ fontSize: 18, color: C.text.secondary, marginBottom: 24 }}>{activeScores[0]} - {activeScores[1]}</p>

        {ratingChange && (
          <div style={{ background: C.bg.card, borderRadius: 12, padding: 16, marginBottom: 16, minWidth: 200 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Rating</div>
            <div style={{ fontSize: 24, color: ratingChange.change > 0 ? C.accent.green : C.accent.red }}>
              {ratingChange.change > 0 ? '+' : ''}{ratingChange.change} → {ratingChange.newRating}
            </div>
          </div>
        )}

        {lastMatchRewards && <div style={{ background: C.bg.card, borderRadius: 12, padding: 16, marginBottom: 24, minWidth: 200 }}><div style={{ fontWeight: 600, marginBottom: 8 }}>Recompensas</div><div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}><div>🪙 +{lastMatchRewards.tokens}</div><div>⭐ +{lastMatchRewards.xp} XP</div></div></div>}

        <div style={{ display: 'flex', gap: 12 }}>
          {isOnline && <button onClick={() => { backToMenu(); setTimeout(() => startNewGame('online'), 100); }} style={{ padding: '14px 28px', borderRadius: 12, border: 'none', background: C.accent.green, color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>🔄 Buscar otra</button>}
          {!isOnline && <button onClick={() => { backToMenu(); setTimeout(() => startNewGame('local'), 100); }} style={{ padding: '14px 28px', borderRadius: 12, border: 'none', background: C.accent.green, color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>🔄 Revancha</button>}
          <button onClick={backToMenu} style={{ padding: '14px 28px', borderRadius: 12, border: `1px solid ${C.bg.border}`, background: 'transparent', color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>🏠 Menú</button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: ROUND RESULT OVERLAY
  // ============================================================================
  const renderRoundResult = () => {
    if (!activeRoundResult) return null;

    const result = activeRoundResult;
    const isTie = result.isTie || result.winTeam === -1;

    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
        <div style={{ background: C.bg.surface, borderRadius: 16, padding: 24, textAlign: 'center', minWidth: 300, maxWidth: 360 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>{result.type === 'domino' ? '🎯' : '🔒'}</div>
          <h2 style={{ color: '#fff', marginBottom: 8 }}>{result.type === 'domino' ? '¡Dominó!' : '¡Tranca!'}</h2>

          {isTie ? (
            <p style={{ color: C.text.secondary, marginBottom: 12 }}>Empate — ¡Próxima ronda vale doble!</p>
          ) : (
            <>
              <p style={{ color: C.text.secondary, marginBottom: 8 }}>
                {result.winTeam === 0 ? 'Tu equipo' : 'Oponentes'} +{result.points} puntos
              </p>
              {result.bonus > 0 && (
                <p style={{ color: C.gold?.main || '#F59E0B', fontSize: 13, marginBottom: 8 }}>
                  🎯 Bonus: +{result.bonus} ({result.bonusType === 'double' ? 'ambos extremos' : 'un extremo'})
                </p>
              )}
              {result.isDouble && (
                <p style={{ color: '#a855f7', fontSize: 13, marginBottom: 8 }}>⚡ ¡Puntos dobles!</p>
              )}
            </>
          )}

          {result.playerSnapshot && (
            <div style={{ margin: '12px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
              {result.playerSnapshot.map(p => (
                <div key={p.id} style={{ padding: 8, borderRadius: 8, background: C.bg.card, color: p.team === 0 ? C.accent.green : C.accent.red }}>
                  <div>{p.avatar} {p.name}</div>
                  <div style={{ color: C.text.secondary }}>{p.points} pts ({p.tiles.length} fichas)</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ fontSize: 24, fontWeight: 700, color: C.gold?.main || '#F59E0B', marginBottom: 16 }}>{activeScores[0]} - {activeScores[1]}</div>

          {!isOnline && (
            <button onClick={() => local.nextRound()} style={{ padding: '12px 32px', borderRadius: 12, border: 'none', background: C.accent.green, color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>
              Siguiente ronda →
            </button>
          )}
        </div>
      </div>
    );
  };

  // ============================================================================
  // RENDER: PLAYING (unified local + online)
  // ============================================================================
  return (
    <div style={{ minHeight: '100vh', background: C.bg.deep, display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <GameHUD scores={activeScores} target={activeTarget} current={activeCurrent} players={activePlayers} timer={activeTimer} isMyTurn={activeIsMyTurn} onSettings={() => setShowSettings(true)} onEmotes={() => setShowEmoteMenu(!showEmoteMenu)} />

      <OpponentHandTop count={isOnline ? (activePlayers[2]?.handCount || 0) : (activePlayers[2]?.tiles?.length || 0)} tileSize={20} player={activePlayers[2]} isCurrentTurn={activeCurrent === 2} />
      <OpponentHandSide count={isOnline ? (activePlayers[1]?.handCount || 0) : (activePlayers[1]?.tiles?.length || 0)} tileSize={20} player={activePlayers[1]} side="left" isCurrentTurn={activeCurrent === 1} />
      <OpponentHandSide count={isOnline ? (activePlayers[3]?.handCount || 0) : (activePlayers[3]?.tiles?.length || 0)} tileSize={20} player={activePlayers[3]} side="right" isCurrentTurn={activeCurrent === 3} />

      {isOnline && activePlayers.some(p => p && p.connected === false) && (
        <div style={{ position: 'fixed', top: 60, left: '50%', transform: 'translateX(-50%)', background: 'rgba(239, 68, 68, 0.9)', color: '#fff', padding: '8px 16px', borderRadius: 8, zIndex: 200, fontSize: 13 }}>
          ⚠️ Un jugador se desconectó, esperando reconexión...
        </div>
      )}

      {local.msg && !isOnline && (
        <div style={{ position: 'fixed', top: 60, left: '50%', transform: 'translateX(-50%)', background: 'rgba(59, 130, 246, 0.85)', color: '#fff', padding: '6px 16px', borderRadius: 8, zIndex: 150, fontSize: 13, fontWeight: 600 }}>
          {local.msg}
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Board board={activeBoard} lastPlayed={isOnline ? null : local.lastPlayed} skinSet={equippedCosmetics.skinSet} />
      </div>

      {!isOnline && local.playerPassed !== null && <PassIndicator position={local.playerPassed} />}

      <PlayerHandArea
        tiles={activeMyTiles}
        board={activeBoard}
        onPlay={(tile, pos) => handlePlayTile(tile, pos)}
        onReorderTiles={() => {}}
        onFlipTile={() => {}}
        mustPlay={isOnline ? null : local.mustPlay}
        isMyTurn={activeIsMyTurn}
        player={activePlayers[0]}
        validMoves={validMoves}
        suggestMoves={settings.suggestMoves}
      />

      {activeIsMyTurn && !canPlay && (
        <div style={{ position: 'fixed', bottom: 140, left: '50%', transform: 'translateX(-50%)', zIndex: 100 }}>
          <button onClick={handlePass} style={{ padding: '16px 40px', borderRadius: 12, border: 'none', background: '#ef4444', color: '#fff', fontSize: 18, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)' }}>Pasar</button>
        </div>
      )}

      {renderRoundResult()}

      {showSettings && <SettingsModal settings={settings} onSettingsChange={setSettings} onClose={() => setShowSettings(false)} onSurrender={() => { if (isOnline) online.surrenderOnline(); else backToMenu(); }} onLeaveGame={backToMenu} isPlaying={true} />}

      {showEmoteMenu && <div style={{ position: 'fixed', bottom: 200, left: '50%', transform: 'translateX(-50%)', background: C.bg.surface, borderRadius: 12, padding: 12, display: 'flex', gap: 8, flexWrap: 'wrap', maxWidth: 280, justifyContent: 'center', zIndex: 100, boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>{EMOTES.map(emote => <button key={emote} onClick={() => { if (isOnline) online.sendEmoteOnline(emote); showNotificationFn('info', emote, ''); setShowEmoteMenu(false); }} style={{ width: 44, height: 44, borderRadius: 8, border: 'none', background: C.bg.card, fontSize: 24, cursor: 'pointer' }}>{emote}</button>)}</div>}

      {notification && <div style={{ position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)', background: notification.type === 'success' ? 'rgba(34, 197, 94, 0.9)' : notification.type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(59, 130, 246, 0.9)', color: '#fff', padding: '12px 24px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, zIndex: 2000, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>{notification.icon && <span>{notification.icon}</span>}{notification.message}</div>}
    </div>
  );
};

export default DominoRanked;
