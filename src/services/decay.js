// ============================================================================
// SISTEMA DE DECAY (Inactividad)
// ============================================================================
// Penaliza rating por inactividad en rangos altos (Maestro+)
// Esto evita que jugadores inactivos ocupen puestos altos
// ============================================================================

export const DecaySystem = {
  // ─────────────────────────────────────────────────────────────────────────
  // Configuración
  // ─────────────────────────────────────────────────────────────────────────
  DECAY_THRESHOLD_RATING: 2400,  // Solo aplica a Maestro+ (rating >= 2400)
  DECAY_DAYS_GRACE: 14,          // Días sin jugar antes de empezar decay
  DECAY_PER_WEEK: 50,            // MMR perdido por semana de inactividad
  DECAY_MIN_RATING: 2400,        // No baja de Maestro por decay
  
  // ─────────────────────────────────────────────────────────────────────────
  // Calcular decay pendiente
  // ─────────────────────────────────────────────────────────────────────────
  calculateDecay: (player) => {
    // No aplica si rating es menor al umbral
    if (!player || player.rating < DecaySystem.DECAY_THRESHOLD_RATING) {
      return { decay: 0, daysUntilDecay: null, applies: false };
    }
    
    const lastGameDate = new Date(player.lastGameDate || Date.now());
    const daysSinceLastGame = Math.floor(
      (Date.now() - lastGameDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Aún en período de gracia
    if (daysSinceLastGame <= DecaySystem.DECAY_DAYS_GRACE) {
      return {
        decay: 0,
        daysUntilDecay: DecaySystem.DECAY_DAYS_GRACE - daysSinceLastGame,
        daysSinceLastGame,
        applies: true,
        inGracePeriod: true
      };
    }
    
    // Calcular decay acumulado
    const daysAfterGrace = daysSinceLastGame - DecaySystem.DECAY_DAYS_GRACE;
    const weeksInactive = Math.floor(daysAfterGrace / 7);
    const totalDecay = weeksInactive * DecaySystem.DECAY_PER_WEEK;
    const newRating = Math.max(DecaySystem.DECAY_MIN_RATING, player.rating - totalDecay);
    
    return {
      decay: player.rating - newRating,
      weeksInactive,
      newRating,
      daysSinceLastGame,
      daysUntilNextDecay: 7 - (daysAfterGrace % 7),
      applies: true,
      inGracePeriod: false
    };
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // Aplicar decay al jugador
  // ─────────────────────────────────────────────────────────────────────────
  applyDecay: (player) => {
    const decayInfo = DecaySystem.calculateDecay(player);
    
    if (decayInfo.decay > 0) {
      return {
        ...player,
        rating: decayInfo.newRating,
        decayApplied: decayInfo.decay,
        lastDecayDate: Date.now()
      };
    }
    
    return player;
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // Resetear decay (cuando juega una partida)
  // ─────────────────────────────────────────────────────────────────────────
  resetDecay: (player) => {
    return {
      ...player,
      lastGameDate: Date.now(),
      decayApplied: 0
    };
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // Obtener mensaje de advertencia de decay
  // ─────────────────────────────────────────────────────────────────────────
  getDecayWarning: (player) => {
    const info = DecaySystem.calculateDecay(player);
    
    if (!info.applies) return null;
    
    if (info.inGracePeriod && info.daysUntilDecay <= 3) {
      return {
        type: 'warning',
        message: `¡Juega pronto! Decay comienza en ${info.daysUntilDecay} día${info.daysUntilDecay !== 1 ? 's' : ''}`
      };
    }
    
    if (info.decay > 0) {
      return {
        type: 'danger',
        message: `Has perdido ${info.decay} MMR por inactividad. ¡Juega para detener el decay!`,
        decayAmount: info.decay
      };
    }
    
    return null;
  }
};

export default DecaySystem;
