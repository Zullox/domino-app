// ============================================================================
// PANTALLA: AMIGOS
// ============================================================================
import React, { useState, memo, useCallback } from 'react';
import { Button, Card, Badge, Modal } from '../components/ui';
import { getTranslation } from '../constants/i18n';
import { getRank, TIER_COLORS } from '../constants/game';

const C = {
  bg: { deep: '#0a0a0f', surface: '#12121a', elevated: '#1a1a24', border: '#2a2a3a' },
  text: { primary: '#ffffff', secondary: '#a0a0b0', muted: '#606070' },
  gold: { main: '#F59E0B' },
  accent: { green: '#10B981', red: '#EF4444', blue: '#3B82F6' }
};

// Tarjeta de amigo
const FriendCard = memo(({ friend, onInvite, onRemove, onViewProfile }) => {
  const rank = getRank(friend.rating || 1500);
  const tierColor = TIER_COLORS[rank.tier]?.primary || '#666';
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: 12,
      background: C.bg.surface,
      borderRadius: 12,
      border: `1px solid ${C.bg.border}`,
      gap: 12
    }}>
      {/* Avatar con estado online */}
      <div style={{ position: 'relative' }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: C.bg.elevated,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          border: `2px solid ${tierColor}`
        }}>
          {friend.avatar || '😎'}
        </div>
        {/* Indicador online/offline */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: friend.online ? C.accent.green : C.text.muted,
          border: `2px solid ${C.bg.surface}`
        }} />
      </div>
      
      {/* Info */}
      <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => onViewProfile(friend)}>
        <div style={{ color: C.text.primary, fontSize: 14, fontWeight: 600 }}>
          {friend.name}
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 6,
          marginTop: 2
        }}>
          <span style={{ fontSize: 12 }}>{rank.icon}</span>
          <span style={{ color: tierColor, fontSize: 11, fontWeight: 600 }}>
            {rank.name}
          </span>
          <span style={{ color: C.text.muted, fontSize: 10 }}>
            • {friend.rating || 1500}
          </span>
        </div>
        <div style={{ color: C.text.muted, fontSize: 11, marginTop: 2 }}>
          {friend.online 
            ? (friend.inGame ? '🎮 En partida' : '🟢 En línea')
            : `⏱️ ${friend.lastSeen || 'Hace tiempo'}`
          }
        </div>
      </div>
      
      {/* Acciones */}
      <div style={{ display: 'flex', gap: 6 }}>
        {friend.online && !friend.inGame && (
          <button
            onClick={() => onInvite(friend)}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: 'none',
              background: C.accent.green,
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            ⚔️
          </button>
        )}
        <button
          onClick={() => onRemove(friend)}
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: `1px solid ${C.bg.border}`,
            background: 'transparent',
            color: C.text.muted,
            fontSize: 12,
            cursor: 'pointer'
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
});

// Solicitud de amistad
const FriendRequestCard = memo(({ request, onAccept, onReject }) => {
  const rank = getRank(request.rating || 1500);
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: 12,
      background: 'rgba(59, 130, 246, 0.1)',
      borderRadius: 12,
      border: '1px solid rgba(59, 130, 246, 0.2)',
      gap: 12
    }}>
      <div style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: C.bg.elevated,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22
      }}>
        {request.avatar || '😎'}
      </div>
      
      <div style={{ flex: 1 }}>
        <div style={{ color: C.text.primary, fontSize: 13, fontWeight: 600 }}>
          {request.name}
        </div>
        <div style={{ color: C.text.muted, fontSize: 11 }}>
          {rank.icon} {rank.name} • {request.rating || 1500} MMR
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          onClick={() => onAccept(request)}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            background: C.accent.green,
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          ✓
        </button>
        <button
          onClick={() => onReject(request)}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: `1px solid ${C.accent.red}`,
            background: 'transparent',
            color: C.accent.red,
            fontSize: 12,
            cursor: 'pointer'
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
});

// Pantalla principal de amigos
const FriendsScreen = ({
  friends = [],
  friendRequests = [],
  onClose,
  onAddFriend,
  onAcceptRequest,
  onRejectRequest,
  onInviteFriend,
  onRemoveFriend,
  onViewProfile,
  onSearch,
  searchResults = [],
  language = 'es'
}) => {
  const t = (path) => getTranslation(path, language);
  const [activeTab, setActiveTab] = useState('friends');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  
  // Separar amigos online y offline
  const onlineFriends = friends.filter(f => f.online);
  const offlineFriends = friends.filter(f => !f.online);
  
  const handleRemoveClick = useCallback((friend) => {
    setSelectedFriend(friend);
    setShowRemoveModal(true);
  }, []);
  
  const handleConfirmRemove = useCallback(() => {
    if (selectedFriend && onRemoveFriend) {
      onRemoveFriend(selectedFriend);
    }
    setShowRemoveModal(false);
    setSelectedFriend(null);
  }, [selectedFriend, onRemoveFriend]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: C.bg.deep,
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: `1px solid ${C.bg.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: C.text.secondary,
              fontSize: 24,
              cursor: 'pointer'
            }}
          >
            ←
          </button>
          <h1 style={{ color: C.text.primary, fontSize: 20, fontWeight: 800, margin: 0 }}>
            👥 {t('friends.title')}
          </h1>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            padding: '8px 16px',
            borderRadius: 10,
            border: 'none',
            background: `linear-gradient(135deg, ${C.gold.main}, #D97706)`,
            color: '#000',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          + {t('friends.add')}
        </button>
      </div>
      
      {/* Tabs */}
      <div style={{
        display: 'flex',
        padding: '0 16px',
        gap: 8,
        borderBottom: `1px solid ${C.bg.border}`
      }}>
        <button
          onClick={() => setActiveTab('friends')}
          style={{
            flex: 1,
            padding: '12px 16px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'friends' ? `2px solid ${C.gold.main}` : '2px solid transparent',
            color: activeTab === 'friends' ? C.gold.main : C.text.muted,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {t('friends.myFriends')} ({friends.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          style={{
            flex: 1,
            padding: '12px 16px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'requests' ? `2px solid ${C.gold.main}` : '2px solid transparent',
            color: activeTab === 'requests' ? C.gold.main : C.text.muted,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            position: 'relative'
          }}
        >
          {t('friends.requests')}
          {friendRequests.length > 0 && (
            <span style={{
              position: 'absolute',
              top: 8,
              right: 20,
              minWidth: 18,
              height: 18,
              borderRadius: 9,
              background: C.accent.red,
              color: '#fff',
              fontSize: 11,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {friendRequests.length}
            </span>
          )}
        </button>
      </div>
      
      {/* Contenido */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: 16
      }}>
        {activeTab === 'friends' && (
          <>
            {friends.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: 40,
                color: C.text.muted
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
                <p>{t('friends.noFriends')}</p>
                <Button 
                  variant="primary" 
                  style={{ marginTop: 16 }}
                  onClick={() => setShowAddModal(true)}
                >
                  {t('friends.addFirst')}
                </Button>
              </div>
            ) : (
              <>
                {/* Amigos online */}
                {onlineFriends.length > 0 && (
                  <>
                    <h3 style={{ 
                      color: C.accent.green, 
                      fontSize: 12, 
                      fontWeight: 600, 
                      marginBottom: 10 
                    }}>
                      🟢 {t('friends.online')} ({onlineFriends.length})
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                      {onlineFriends.map((friend, i) => (
                        <FriendCard
                          key={friend.odId || i}
                          friend={friend}
                          onInvite={onInviteFriend}
                          onRemove={handleRemoveClick}
                          onViewProfile={onViewProfile}
                        />
                      ))}
                    </div>
                  </>
                )}
                
                {/* Amigos offline */}
                {offlineFriends.length > 0 && (
                  <>
                    <h3 style={{ 
                      color: C.text.muted, 
                      fontSize: 12, 
                      fontWeight: 600, 
                      marginBottom: 10 
                    }}>
                      ⚫ {t('friends.offline')} ({offlineFriends.length})
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {offlineFriends.map((friend, i) => (
                        <FriendCard
                          key={friend.odId || i}
                          friend={friend}
                          onInvite={onInviteFriend}
                          onRemove={handleRemoveClick}
                          onViewProfile={onViewProfile}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
        
        {activeTab === 'requests' && (
          <>
            {friendRequests.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: 40,
                color: C.text.muted
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                <p>{t('friends.noRequests')}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {friendRequests.map((request, i) => (
                  <FriendRequestCard
                    key={request.odId || i}
                    request={request}
                    onAccept={onAcceptRequest}
                    onReject={onRejectRequest}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Modal agregar amigo */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setSearchQuery(''); }}
        title={t('friends.addFriend')}
        size="sm"
      >
        <div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (onSearch && e.target.value.trim().length >= 2) {
                onSearch(e.target.value.trim());
              }
            }}
            placeholder={t('friends.searchPlaceholder')}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 10,
              border: `1px solid ${C.bg.border}`,
              background: C.bg.elevated,
              color: C.text.primary,
              fontSize: 14,
              marginBottom: 12
            }}
          />
          {/* Search results */}
          {searchQuery.trim().length >= 2 && searchResults.length > 0 && (
            <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 12 }}>
              {searchResults.map(user => (
                <div key={user.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 8,
                  background: C.bg.elevated, marginBottom: 6
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: C.gold.main + '30', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                    {user.avatar || '😎'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text.primary }}>{user.name}</div>
                    <div style={{ fontSize: 11, color: C.text.muted }}>{user.rank || 'Sin rango'} • {user.rating || 1500}</div>
                  </div>
                  <button
                    onClick={() => {
                      if (onAddFriend) onAddFriend(user.id);
                      setSearchQuery('');
                      setShowAddModal(false);
                    }}
                    style={{
                      padding: '6px 12px', borderRadius: 8, border: 'none',
                      background: C.accent.blue, color: '#fff', fontSize: 12,
                      fontWeight: 600, cursor: 'pointer'
                    }}
                  >
                    + {t('friends.add')}
                  </button>
                </div>
              ))}
            </div>
          )}
          {searchQuery.trim().length >= 2 && searchResults.length === 0 && (
            <div style={{ textAlign: 'center', padding: 16, color: C.text.muted, fontSize: 13 }}>
              No se encontraron jugadores
            </div>
          )}
          {searchQuery.trim().length < 2 && searchQuery.trim().length > 0 && (
            <div style={{ textAlign: 'center', padding: 12, color: C.text.muted, fontSize: 12 }}>
              Escribe al menos 2 caracteres
            </div>
          )}
        </div>
      </Modal>
      
      {/* Modal confirmar eliminar */}
      <Modal
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        title={t('friends.confirmRemove')}
        size="sm"
      >
        <p style={{ color: C.text.secondary, marginBottom: 20, textAlign: 'center' }}>
          {t('friends.removeWarning')} <strong>{selectedFriend?.name}</strong>?
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="ghost" fullWidth onClick={() => setShowRemoveModal(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" fullWidth onClick={handleConfirmRemove}>
            {t('friends.remove')}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default memo(FriendsScreen);
