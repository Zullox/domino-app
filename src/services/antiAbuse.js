// ============================================================================
// SISTEMA DE PROTECCIÓN ANTI-ABUSE
// ============================================================================
// Detecta smurfs, boosters y partidas inválidas
// ============================================================================

export const AntiAbuse = {
  // ─────────────────────────────────────────────────────────────────────────
  // Configuración de umbrales
  // ─────────────────────────────────────────────────────────────────────────
  
  // Detección de smurfs (cuentas nuevas de jugadores expertos)
  SMURF_WINRATE_THRESHOLD: 0.85,    // 85% winrate es sospechoso
  SMURF_MIN_GAMES: 10,              // Mínimo de partidas para evaluar
  SMURF_STOMP_THRESHOLD: 0.7,       // 70% de victorias aplastantes
  
  // Detección de boosting (subir rating de otro jugador)
  BOOSTING_SAME_PARTNER_LIMIT: 5,   // Máx partidas con mismo compañero por día
  BOOSTING_WINRATE_WITH_PARTNER: 0.9, // 90% winrate con mismo partner
  
  // ─────────────────────────────────────────────────────────────────────────
  // Detectar posible smurf
  // ─────────────────────────────────────────────────────────────────────────
  detectSmurf: (player) => {
    // No evaluar si tiene pocas partidas
    if (!player || player.totalGames < AntiAbuse.SMURF_MIN_GAMES) {
      return { isSmurf: false, confidence: 0 };
    }
    
    const winrate = player.wins / player.totalGames;
    const stompRate = (player.stompWins || 0) / Math.max(1, player.wins);
    
    // Si tiene winrate muy alto Y muchas victorias aplastantes
    if (winrate >= AntiAbuse.SMURF_WINRATE_THRESHOLD && 
        stompRate >= AntiAbuse.SMURF_STOMP_THRESHOLD) {
      return {
        isSmurf: true,
        confidence: Math.min(1, (winrate - 0.7) * 2 + (stompRate - 0.5)),
        recommendation: 'accelerate_mmr', // Subir MMR más rápido para matchear mejor
        details: {
          winrate: Math.round(winrate * 100),
          stompRate: Math.round(stompRate * 100),
          gamesAnalyzed: player.totalGames
        }
      };
    }
    
    return { isSmurf: false, confidence: 0 };
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // Detectar posible boosting
  // ─────────────────────────────────────────────────────────────────────────
  detectBoosting: (player, recentMatches) => {
    if (!recentMatches || recentMatches.length === 0) {
      return { isBoosting: false };
    }
    
    // Contar partidas y victorias con cada compañero
    const partnerCounts = {};
    const partnerWins = {};
    
    recentMatches.forEach(match => {
      if (match.partner) {
        const partnerId = match.partner.id || match.partner;
        partnerCounts[partnerId] = (partnerCounts[partnerId] || 0) + 1;
        if (match.won) {
          partnerWins[partnerId] = (partnerWins[partnerId] || 0) + 1;
        }
      }
    });
    
    // Verificar cada compañero
    for (const partnerId in partnerCounts) {
      const count = partnerCounts[partnerId];
      const wins = partnerWins[partnerId] || 0;
      
      // Si juega mucho con el mismo compañero
      if (count >= AntiAbuse.BOOSTING_SAME_PARTNER_LIMIT) {
        const winrateWithPartner = wins / count;
        
        // Y tienen winrate sospechosamente alto juntos
        if (winrateWithPartner >= AntiAbuse.BOOSTING_WINRATE_WITH_PARTNER) {
          return {
            isBoosting: true,
            partnerId,
            gamesWithPartner: count,
            winrateWithPartner: Math.round(winrateWithPartner * 100),
            recommendation: 'reduce_gains', // Reducir ganancias de MMR
            details: {
              totalMatches: recentMatches.length,
              suspiciousPattern: true
            }
          };
        }
      }
    }
    
    return { isBoosting: false };
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // Verificar si partida es válida para ranked
  // ─────────────────────────────────────────────────────────────────────────
  isValidRankedMatch: (opponents) => {
    // En ranked real, todos los oponentes deben ser humanos
    if (!opponents || opponents.length === 0) return false;
    return opponents.every(opp => !opp.isAI && !opp.isBot);
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // Calcular penalización de MMR por comportamiento sospechoso
  // ─────────────────────────────────────────────────────────────────────────
  calculatePenalty: (player, recentMatches) => {
    let penalty = 1.0; // Sin penalización = 1.0
    
    const smurfCheck = AntiAbuse.detectSmurf(player);
    const boostCheck = AntiAbuse.detectBoosting(player, recentMatches);
    
    // Si es smurf, acelerar MMR (no es penalización, es corrección)
    if (smurfCheck.isSmurf) {
      return {
        multiplier: 1.5 + smurfCheck.confidence, // Ganar más MMR
        reason: 'smurf_acceleration',
        details: smurfCheck
      };
    }
    
    // Si está boosteando, reducir ganancias
    if (boostCheck.isBoosting) {
      return {
        multiplier: 0.5, // Solo gana 50% del MMR normal
        reason: 'boosting_reduction',
        details: boostCheck
      };
    }
    
    return {
      multiplier: 1.0,
      reason: null,
      details: null
    };
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // Verificar integridad de resultado de partida
  // ─────────────────────────────────────────────────────────────────────────
  validateMatchResult: (matchData) => {
    const errors = [];
    
    // Verificar que hay jugadores
    if (!matchData.players || matchData.players.length !== 4) {
      errors.push('invalid_player_count');
    }
    
    // Verificar que hay un ganador
    if (matchData.winner === undefined || matchData.winner === null) {
      errors.push('no_winner');
    }
    
    // Verificar scores válidos
    if (matchData.finalScore) {
      const { team0, team1 } = matchData.finalScore;
      if (typeof team0 !== 'number' || typeof team1 !== 'number') {
        errors.push('invalid_scores');
      }
      if (team0 < 0 || team1 < 0) {
        errors.push('negative_scores');
      }
    }
    
    // Verificar duración razonable (mínimo 30 segundos, máximo 1 hora)
    if (matchData.duration) {
      if (matchData.duration < 30) errors.push('too_short');
      if (matchData.duration > 3600) errors.push('too_long');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

export default AntiAbuse;
