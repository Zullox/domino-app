// ============================================================================
// PANTALLA DE SALA PRIVADA
// ============================================================================
// Crear sala → compartir código → esperar 4 jugadores → jugar
// ============================================================================

import React, { useState, useEffect, useCallback, memo } from 'react';
import { shareResult } from '../services/native';
import { SERVIDOR_URL } from '../constants/serverConfig';

const C = {
  bg: { deep: '#0a0a0f', surface: '#12121a', elevated: '#1a1a24', card: '#1e1e2a' },
  text: { primary: '#ffffff', secondary: '#a0a0b0', muted: '#606070' },
  gold: { main: '#F59E0B', dark: '#D97706' },
  accent: { blue: '#3B82F6', green: '#10B981', red: '#EF4444', purple: '#8B5CF6' }
};

// ============================================================================
// SLOT DE JUGADOR
// ============================================================================

const PlayerSlot = memo(({ player, index }) => {
  const teamColors = [C.accent.blue, C.accent.red, C.accent.blue, C.accent.red];
  const teamLabels = ['Equipo A', 'Equipo B', 'Equipo A', 'Equipo B'];
  
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: player ? C.bg.elevated : `${C.bg.elevated}60`,
      borderRadius: 12, padding: '12px 16px',
      border: `1px solid ${player ? teamColors[index] + '40' : C.bg.card}`
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        background: player ? teamColors[index] + '30' : C.bg.card,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: player ? 20 : 14
      }}>
        {player ? (player.avatar?.emoji || '😎') : '?'}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 14, fontWeight: 600,
          color: player ? C.text.primary : C.text.muted
        }}>
          {player ? player.name : 'Esperando...'}
        </div>
        <div style={{ fontSize: 11, color: teamColors[index], fontWeight: 500 }}>
          {teamLabels[index]}{player?.isHost ? ' · Host 👑' : ''}
        </div>
      </div>
    </div>
  );
});

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const PrivateRoomScreen = ({ socket, user, friends, onBack, onGameStart, t }) => {
  const [mode, setMode] = useState('choice'); // choice | create | join
  const [room, setRoom] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // ══════════════════════════════════════════════════════════════════════════
  // SOCKET EVENTS
  // ══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!socket) return;

    const onPlayerJoined = (data) => {
      setRoom(prev => {
        if (!prev) return prev;
        return { ...prev, players: [...(prev.players || []), data.player], playerCount: data.playerCount };
      });
    };

    const onPlayerLeft = (data) => {
      setRoom(prev => {
        if (!prev) return prev;
        const players = (prev.players || []).filter(p => p.name !== data.player);
        return { ...prev, players, playerCount: data.playerCount };
      });
    };

    socket.on('private:playerJoined', onPlayerJoined);
    socket.on('private:playerLeft', onPlayerLeft);

    return () => {
      socket.off('private:playerJoined', onPlayerJoined);
      socket.off('private:playerLeft', onPlayerLeft);
    };
  }, [socket]);

  // ══════════════════════════════════════════════════════════════════════════
  // CREAR SALA
  // ══════════════════════════════════════════════════════════════════════════

  const handleCreate = useCallback(() => {
    if (!socket) return;
    setLoading(true);
    setError('');

    socket.emit('private:create', {}, (res) => {
      setLoading(false);
      if (res.success) {
        setRoom(res.room);
        setMode('create');
      } else {
        setError(res.error || 'Error al crear sala');
      }
    });
  }, [socket]);

  // ══════════════════════════════════════════════════════════════════════════
  // UNIRSE A SALA
  // ══════════════════════════════════════════════════════════════════════════

  const handleJoin = useCallback(() => {
    if (!socket || !joinCode.trim()) return;
    setLoading(true);
    setError('');

    socket.emit('private:join', { code: joinCode.trim().toUpperCase() }, (res) => {
      setLoading(false);
      if (res.success) {
        setRoom(res.room);
        setMode('create'); // reuse same view
      } else {
        setError(res.error || 'Sala no encontrada');
      }
    });
  }, [socket, joinCode]);

  // ══════════════════════════════════════════════════════════════════════════
  // INICIAR PARTIDA
  // ══════════════════════════════════════════════════════════════════════════

  const handleStart = useCallback(() => {
    if (!socket) return;
    setLoading(true);

    socket.emit('private:start', (res) => {
      setLoading(false);
      if (res.success) {
        onGameStart?.();
      } else {
        setError(res.error || 'Error al iniciar');
      }
    });
  }, [socket, onGameStart]);

  // ══════════════════════════════════════════════════════════════════════════
  // COMPARTIR CÓDIGO
  // ══════════════════════════════════════════════════════════════════════════

  const handleShare = useCallback(async () => {
    if (!room?.code) return;
    
    const url = `${SERVIDOR_URL}/join/${room.code}`;
    const shared = await shareResult({
      title: '¡Juega Dominó Ranked conmigo!',
      text: `Únete a mi sala con el código: ${room.code}`,
      url
    });
    
    if (!shared) {
      try {
        await navigator.clipboard.writeText(room.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {}
    }
  }, [room]);

  // ══════════════════════════════════════════════════════════════════════════
  // INVITAR AMIGO
  // ══════════════════════════════════════════════════════════════════════════

  const handleInviteFriend = useCallback((friendId) => {
    if (!socket || !room?.code) return;
    socket.emit('private:invite', { friendId, code: room.code });
  }, [socket, room]);

  // ══════════════════════════════════════════════════════════════════════════
  // SALIR
  // ══════════════════════════════════════════════════════════════════════════

  const handleLeave = useCallback(() => {
    if (socket && room) {
      socket.emit('private:leave', () => {});
    }
    setRoom(null);
    setMode('choice');
    onBack?.();
  }, [socket, room, onBack]);

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: PANTALLA DE ELECCIÓN
  // ══════════════════════════════════════════════════════════════════════════

  if (mode === 'choice') {
    return (
      <div style={{ background: C.bg.deep, minHeight: '100vh', padding: '20px 16px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <button onClick={onBack} style={{
            background: C.bg.elevated, border: 'none', borderRadius: 10,
            width: 40, height: 40, color: C.text.secondary, fontSize: 18, cursor: 'pointer'
          }}>←</button>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.text.primary, margin: 0 }}>
            🏠 Partida Privada
          </h1>
        </div>

        {/* Crear */}
        <button onClick={handleCreate} disabled={loading} style={{
          width: '100%', padding: '20px 16px', borderRadius: 16, border: 'none',
          background: `linear-gradient(135deg, ${C.accent.blue}, ${C.accent.purple})`,
          color: '#fff', fontSize: 17, fontWeight: 700, cursor: 'pointer',
          marginBottom: 16, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 16
        }}>
          <span style={{ fontSize: 36 }}>➕</span>
          <div>
            <div>Crear sala</div>
            <div style={{ fontSize: 12, fontWeight: 400, opacity: 0.8, marginTop: 4 }}>
              Genera un código y compártelo con tus amigos
            </div>
          </div>
        </button>

        {/* Unirse */}
        <div style={{
          background: C.bg.surface, borderRadius: 16, padding: '20px 16px',
          border: `1px solid ${C.bg.elevated}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 28 }}>🔑</span>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: C.text.primary }}>Unirse a sala</div>
              <div style={{ fontSize: 12, color: C.text.muted }}>Introduce el código de tu amigo</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
              placeholder="CÓDIGO"
              maxLength={6}
              style={{
                flex: 1, background: C.bg.deep, border: `1px solid ${C.bg.elevated}`,
                borderRadius: 10, padding: '12px 16px', color: C.text.primary,
                fontSize: 20, fontWeight: 700, letterSpacing: 4, textAlign: 'center',
                outline: 'none'
              }}
            />
            <button
              onClick={handleJoin}
              disabled={joinCode.length < 4 || loading}
              style={{
                padding: '12px 20px', borderRadius: 10, border: 'none',
                background: joinCode.length >= 4 ? C.gold.main : C.bg.elevated,
                color: joinCode.length >= 4 ? '#000' : C.text.muted,
                fontWeight: 700, cursor: joinCode.length >= 4 ? 'pointer' : 'default'
              }}
            >
              Unirse
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            marginTop: 16, padding: '12px 16px', borderRadius: 10,
            background: `${C.accent.red}20`, border: `1px solid ${C.accent.red}40`,
            color: C.accent.red, fontSize: 13, textAlign: 'center'
          }}>
            {error}
          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: SALA DE ESPERA
  // ══════════════════════════════════════════════════════════════════════════

  const players = room?.players || [];
  const isHost = room?.hostId === user?.uid || players[0]?.isHost;
  const canStart = players.length === 4;

  // Build 4 slots
  const slots = [null, null, null, null];
  players.forEach((p, i) => { if (i < 4) slots[i] = p; });

  return (
    <div style={{ background: C.bg.deep, minHeight: '100vh', padding: '20px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={handleLeave} style={{
          background: C.bg.elevated, border: 'none', borderRadius: 10,
          width: 40, height: 40, color: C.text.secondary, fontSize: 18, cursor: 'pointer'
        }}>←</button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: C.text.primary, margin: 0 }}>
            Sala Privada
          </h1>
          <div style={{ fontSize: 12, color: C.text.muted }}>
            {players.length}/4 jugadores
          </div>
        </div>
      </div>

      {/* Código */}
      <div style={{
        background: C.bg.surface, borderRadius: 16, padding: '20px 16px',
        textAlign: 'center', marginBottom: 20, border: `1px solid ${C.gold.main}30`
      }}>
        <div style={{ fontSize: 12, color: C.text.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
          Código de sala
        </div>
        <div style={{
          fontSize: 36, fontWeight: 800, color: C.gold.main, letterSpacing: 6, marginBottom: 16
        }}>
          {room?.code || '------'}
        </div>
        <button onClick={handleShare} style={{
          background: `${C.gold.main}20`, border: `1px solid ${C.gold.main}40`,
          borderRadius: 10, padding: '10px 24px', color: C.gold.main,
          fontWeight: 600, fontSize: 14, cursor: 'pointer'
        }}>
          {copied ? '✅ Copiado' : '📤 Compartir código'}
        </button>
      </div>

      {/* Jugadores */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {slots.map((player, i) => (
          <PlayerSlot key={i} player={player} index={i} />
        ))}
      </div>

      {/* Invitar amigos online */}
      {friends && friends.length > 0 && players.length < 4 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: C.text.muted, marginBottom: 8 }}>
            Invitar amigos online:
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {friends.filter(f => f.online).slice(0, 6).map(f => (
              <button
                key={f.uid}
                onClick={() => handleInviteFriend(f.uid)}
                style={{
                  background: C.bg.elevated, border: `1px solid ${C.bg.card}`,
                  borderRadius: 20, padding: '6px 14px', color: C.text.secondary,
                  fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.accent.green }}/>
                {f.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Botón iniciar */}
      {isHost && (
        <button
          onClick={handleStart}
          disabled={!canStart || loading}
          style={{
            width: '100%', padding: '16px', borderRadius: 14, border: 'none',
            background: canStart
              ? `linear-gradient(135deg, ${C.accent.green}, #059669)`
              : C.bg.elevated,
            color: canStart ? '#fff' : C.text.muted,
            fontSize: 16, fontWeight: 700, cursor: canStart ? 'pointer' : 'default',
            boxShadow: canStart ? '0 4px 20px rgba(16, 185, 129, 0.3)' : 'none'
          }}
        >
          {loading ? '⏳ Iniciando...' : canStart ? '🎮 Iniciar partida' : `Esperando jugadores (${players.length}/4)`}
        </button>
      )}

      {!isHost && (
        <div style={{
          textAlign: 'center', padding: '16px', borderRadius: 14,
          background: C.bg.surface, color: C.text.muted, fontSize: 14
        }}>
          ⏳ Esperando a que el host inicie la partida...
        </div>
      )}

      {error && (
        <div style={{
          marginTop: 16, padding: '12px 16px', borderRadius: 10,
          background: `${C.accent.red}20`, color: C.accent.red, fontSize: 13, textAlign: 'center'
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default memo(PrivateRoomScreen);
