// ============================================================================
// useFriends - Hook para sistema de amigos
// ============================================================================
// Conecta las funciones de Firestore (sendFriendRequest, acceptFriendRequest,
// etc.) con la UI. Provee lista de amigos, solicitudes, búsqueda y acciones.
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getFriendsList,
  getPendingRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  searchUsers,
  subscribeToUser
} from '../firestore';
import * as Socket from '../services/socket';

// ============================================================================
// HOOK
// ============================================================================
export const useFriends = (authUser) => {
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const refreshTimerRef = useRef(null);

  const userId = authUser?.id;
  const isGuest = !userId || authUser?.isGuest;

  // ════════════════════════════════════════════════════════════════════════
  // LOAD FRIENDS + REQUESTS
  // ════════════════════════════════════════════════════════════════════════

  const loadFriends = useCallback(async () => {
    if (isGuest) return;
    
    setLoading(true);
    try {
      const [friendsData, requestsData] = await Promise.all([
        getFriendsList(userId),
        getPendingRequests(userId)
      ]);
      
      setFriends(friendsData || []);
      setFriendRequests(requestsData || []);
    } catch (e) {
      console.error('[Friends] Error loading:', e);
    } finally {
      setLoading(false);
    }
  }, [userId, isGuest]);

  // Initial load + subscribe to user doc for real-time friend request updates
  useEffect(() => {
    if (isGuest) return;

    loadFriends();

    // Subscribe to user doc to detect new friend requests in real-time
    const unsubscribe = subscribeToUser(userId, (data) => {
      if (!data) return;
      
      // If friendRequests array changed, reload
      const currentRequestIds = friendRequests.map(r => r.id).sort().join(',');
      const newRequestIds = (data.friendRequests || []).sort().join(',');
      
      if (currentRequestIds !== newRequestIds) {
        loadFriends();
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userId, isGuest]);

  // Refresh online status periodically
  useEffect(() => {
    if (isGuest || friends.length === 0) return;
    
    refreshTimerRef.current = setInterval(() => {
      loadFriends();
    }, 60000); // Refresh every 60s

    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [isGuest, friends.length, loadFriends]);

  // ════════════════════════════════════════════════════════════════════════
  // ACTIONS
  // ════════════════════════════════════════════════════════════════════════

  const searchForUsers = useCallback(async (searchTerm) => {
    if (isGuest || !searchTerm || searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setSearching(true);
    try {
      const results = await searchUsers(searchTerm);
      // Filter out self and existing friends
      const friendIds = new Set(friends.map(f => f.id));
      const filtered = (results || []).filter(u => 
        u.id !== userId && !friendIds.has(u.id)
      );
      setSearchResults(filtered);
    } catch (e) {
      console.error('[Friends] Search error:', e);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [userId, isGuest, friends]);

  const addFriend = useCallback(async (targetUserId) => {
    if (isGuest) return { success: false, error: 'Inicia sesión para agregar amigos' };
    
    try {
      await sendFriendRequest(userId, targetUserId);
      return { success: true };
    } catch (e) {
      console.error('[Friends] Add error:', e);
      return { success: false, error: e.message || 'Error al enviar solicitud' };
    }
  }, [userId, isGuest]);

  const acceptRequest = useCallback(async (friendId) => {
    if (isGuest) return { success: false };
    
    try {
      await acceptFriendRequest(userId, friendId);
      // Refresh lists
      await loadFriends();
      return { success: true };
    } catch (e) {
      console.error('[Friends] Accept error:', e);
      return { success: false, error: e.message };
    }
  }, [userId, isGuest, loadFriends]);

  const rejectRequest = useCallback(async (friendId) => {
    if (isGuest) return { success: false };
    
    try {
      await rejectFriendRequest(userId, friendId);
      setFriendRequests(prev => prev.filter(r => r.id !== friendId));
      return { success: true };
    } catch (e) {
      console.error('[Friends] Reject error:', e);
      return { success: false, error: e.message };
    }
  }, [userId, isGuest]);

  const deleteFriend = useCallback(async (friendId) => {
    if (isGuest) return { success: false };
    
    try {
      await removeFriend(userId, friendId);
      setFriends(prev => prev.filter(f => f.id !== friendId));
      return { success: true };
    } catch (e) {
      console.error('[Friends] Remove error:', e);
      return { success: false, error: e.message };
    }
  }, [userId, isGuest]);

  const inviteFriend = useCallback((friendId) => {
    Socket.inviteFriend(friendId);
  }, []);

  const viewProfile = useCallback((friendId) => {
    // Could open a profile modal - for now just return friend data
    return friends.find(f => f.id === friendId) || null;
  }, [friends]);

  // ════════════════════════════════════════════════════════════════════════
  // RETURN
  // ════════════════════════════════════════════════════════════════════════

  return {
    friends,
    friendRequests,
    loading,
    searchResults,
    searching,
    
    // Actions
    loadFriends,
    searchForUsers,
    addFriend,
    acceptRequest,
    rejectRequest,
    deleteFriend,
    inviteFriend,
    viewProfile
  };
};

export default useFriends;
