// ============================================================================
// HOOK: useAchievements - Gestión de logros con Firebase
// ============================================================================
import { useState, useCallback, useEffect } from 'react';
import {
  ACHIEVEMENTS,
  ACHIEVEMENT_CATEGORIES,
  getUserAchievements,
  claimAchievementReward,
  claimAllPendingAchievements,
  checkNewAchievements,
  getAchievementsSummary
} from '../services/achievements';
import { subscribeToUser } from '../firestore';

export const useAchievements = (userId) => {
  // Estado
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Datos
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({});
  const [rating, setRating] = useState(1500);
  const [claimedIds, setClaimedIds] = useState([]);
  
  // Filtros
  const [category, setCategory] = useState('all');
  
  // Cargar logros
  const loadAchievements = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const data = await getUserAchievements(userId);
      
      setAchievements(data.achievements);
      setStats(data.stats);
      setRating(data.rating);
      setClaimedIds(data.claimedAchievements);
    } catch (err) {
      console.error('[useAchievements] Error:', err);
      setError('Error al cargar logros');
    } finally {
      setLoading(false);
    }
  }, [userId]);
  
  // Cargar al montar y cuando cambie el userId
  useEffect(() => {
    loadAchievements();
  }, [loadAchievements]);
  
  // Suscribirse a cambios del usuario para actualizar stats en tiempo real
  useEffect(() => {
    if (!userId) return;
    
    const unsubscribe = subscribeToUser(userId, (userData) => {
      // Solo actualizar si los datos relevantes cambiaron
      const newStats = userData.stats || {};
      const newRating = userData.rating || 1500;
      const newClaimedIds = userData.achievements || [];
      const newFriendsCount = userData.friends?.length || 0;
      
      setStats({ ...newStats, friendsCount: newFriendsCount });
      setRating(newRating);
      setClaimedIds(newClaimedIds);
      
      // Recalcular estado de logros
      const enrichedStats = { ...newStats, friendsCount: newFriendsCount };
      
      setAchievements(prev => prev.map(achievement => {
        let progress;
        
        if (achievement.type === 'threshold') {
          progress = newRating;
        } else {
          progress = enrichedStats[achievement.stat] || 0;
        }
        
        const completed = progress >= achievement.target;
        const claimed = newClaimedIds.includes(achievement.id);
        
        return {
          ...achievement,
          progress,
          completed,
          claimed,
          percentage: Math.min(100, (progress / achievement.target) * 100)
        };
      }));
    });
    
    return () => unsubscribe();
  }, [userId]);
  
  // Reclamar un logro
  const claimReward = useCallback(async (achievementId) => {
    if (!userId) {
      setError('Debes iniciar sesión');
      return { success: false };
    }
    
    setClaiming(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await claimAchievementReward(userId, achievementId);
      
      if (result.success) {
        const { achievement, reward } = result;
        
        let rewardText = [];
        if (reward.tokens) rewardText.push(`+${reward.tokens} 🪙`);
        if (reward.coins) rewardText.push(`+${reward.coins} 💎`);
        if (reward.xp) rewardText.push(`+${reward.xp} XP`);
        if (reward.title) rewardText.push(`🏷️ "${reward.title}"`);
        
        setSuccess(`¡${achievement.name}! ${rewardText.join(' ')}`);
        
        // Actualizar estado local inmediatamente
        setAchievements(prev => prev.map(a => 
          a.id === achievementId ? { ...a, claimed: true } : a
        ));
        setClaimedIds(prev => [...prev, achievementId]);
      } else {
        setError(result.error || 'Error al reclamar');
      }
      
      return result;
    } catch (err) {
      setError('Error de conexión');
      return { success: false };
    } finally {
      setClaiming(false);
    }
  }, [userId]);
  
  // Reclamar todos los pendientes
  const claimAllPending = useCallback(async () => {
    if (!userId) {
      setError('Debes iniciar sesión');
      return { success: false };
    }
    
    setClaiming(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await claimAllPendingAchievements(userId);
      
      if (result.success && result.claimed.length > 0) {
        const { totalReward, claimed } = result;
        
        let rewardText = [];
        if (totalReward.tokens) rewardText.push(`+${totalReward.tokens} 🪙`);
        if (totalReward.coins) rewardText.push(`+${totalReward.coins} 💎`);
        if (totalReward.xp) rewardText.push(`+${totalReward.xp} XP`);
        
        setSuccess(`¡${claimed.length} logros reclamados! ${rewardText.join(' ')}`);
        
        // Actualizar estado local
        const claimedIdsList = claimed.map(a => a.id);
        setAchievements(prev => prev.map(a => 
          claimedIdsList.includes(a.id) ? { ...a, claimed: true } : a
        ));
        setClaimedIds(prev => [...prev, ...claimedIdsList]);
      } else if (result.success) {
        setSuccess('No hay logros pendientes');
      } else {
        setError(result.error || 'Error al reclamar');
      }
      
      return result;
    } catch (err) {
      setError('Error de conexión');
      return { success: false };
    } finally {
      setClaiming(false);
    }
  }, [userId]);
  
  // Filtrar logros por categoría
  const filteredAchievements = category === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === category);
  
  // Ordenar: pendientes primero, luego completados no reclamados, luego por progreso
  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    // Completados no reclamados primero
    if (a.completed && !a.claimed && (!b.completed || b.claimed)) return -1;
    if (b.completed && !b.claimed && (!a.completed || a.claimed)) return 1;
    // Luego por porcentaje de progreso
    return b.percentage - a.percentage;
  });
  
  // Calcular resumen
  const summary = getAchievementsSummary(achievements);
  
  // Contar pendientes (completados pero no reclamados)
  const pendingCount = achievements.filter(a => a.completed && !a.claimed).length;
  
  // Limpiar mensajes
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);
  
  // Auto-limpiar mensajes
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(clearMessages, 4000);
      return () => clearTimeout(timer);
    }
  }, [error, success, clearMessages]);
  
  return {
    // Estado
    loading,
    claiming,
    error,
    success,
    
    // Datos
    achievements: sortedAchievements,
    allAchievements: achievements,
    stats,
    rating,
    summary,
    pendingCount,
    
    // Filtros
    category,
    categories: ACHIEVEMENT_CATEGORIES,
    
    // Acciones
    setCategory,
    claimReward,
    claimAllPending,
    refresh: loadAchievements,
    clearMessages
  };
};

export default useAchievements;
