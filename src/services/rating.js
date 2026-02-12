// ============================================================================
// SISTEMA DE RATING GLICKO-2 + TEMPORADAS
// ============================================================================
// Implementación completa del algoritmo Glicko-2 para matchmaking competitivo
// Referencia: http://www.glicko.net/glicko/glicko2.pdf
// ============================================================================

// ============================================================================
// SISTEMA GLICKO-2
// ============================================================================
export const Glicko2 = {
  // Constantes del sistema
  TAU: 0.5,           // Volatilidad del sistema (0.3-1.2, menor = más estable)
  EPSILON: 0.000001,  // Precisión para convergencia del algoritmo Illinois
  SCALE: 173.7178,    // Factor de escala Glicko-2
  
  // Rating inicial para nuevos jugadores
  DEFAULT_RATING: 1500,
  DEFAULT_RD: 350,
  DEFAULT_VOLATILITY: 0.06,
  
  // Límites del sistema
  MIN_RATING: 100,
  MAX_RATING: 3500,
  MIN_RD: 30,
  MAX_RD: 350,
  MIN_VOLATILITY: 0.03,
  MAX_VOLATILITY: 0.1,
  
  // ─────────────────────────────────────────────────────────────────────────
  // Conversiones de escala
  // ─────────────────────────────────────────────────────────────────────────
  
  // Convertir rating Glicko-1 a escala Glicko-2
  toGlicko2: (rating, rd) => ({
    mu: (rating - 1500) / 173.7178,
    phi: rd / 173.7178
  }),
  
  // Convertir de escala Glicko-2 a Glicko-1
  fromGlicko2: (mu, phi) => ({
    rating: Math.round(mu * 173.7178 + 1500),
    rd: Math.round(phi * 173.7178)
  }),
  
  // ─────────────────────────────────────────────────────────────────────────
  // Funciones auxiliares del algoritmo
  // ─────────────────────────────────────────────────────────────────────────
  
  // Función g(φ) - Factor de reducción basado en la incertidumbre del oponente
  g: (phi) => 1 / Math.sqrt(1 + 3 * phi * phi / (Math.PI * Math.PI)),
  
  // Función E - Expectativa de resultado (probabilidad de ganar)
  E: (mu, muj, phij) => 1 / (1 + Math.exp(-Glicko2.g(phij) * (mu - muj))),
  
  // ─────────────────────────────────────────────────────────────────────────
  // Función principal: Actualizar rating después de partida(s)
  // ─────────────────────────────────────────────────────────────────────────
  updateRating: (player, opponents, scores) => {
    // player: { rating, rd, volatility }
    // opponents: [{ rating, rd }]
    // scores: [1 para victoria, 0.5 empate, 0 derrota]
    
    const { mu, phi } = Glicko2.toGlicko2(player.rating, player.rd);
    let sigma = player.volatility || Glicko2.DEFAULT_VOLATILITY;
    
    // ─────────────────────────────────────────────────────────────────────
    // Caso especial: Sin partidas (solo aumenta RD por inactividad)
    // ─────────────────────────────────────────────────────────────────────
    if (!opponents || opponents.length === 0) {
      const newPhi = Math.sqrt(phi * phi + sigma * sigma);
      const result = Glicko2.fromGlicko2(mu, Math.min(newPhi, Glicko2.MAX_RD / 173.7178));
      return { ...result, volatility: sigma };
    }
    
    // ─────────────────────────────────────────────────────────────────────
    // Paso 3: Calcular varianza estimada (v) y delta
    // ─────────────────────────────────────────────────────────────────────
    let vSum = 0;
    let deltaSum = 0;
    
    opponents.forEach((opp, i) => {
      const { mu: muj, phi: phij } = Glicko2.toGlicko2(opp.rating, opp.rd);
      const gPhij = Glicko2.g(phij);
      const Eij = Glicko2.E(mu, muj, phij);
      
      vSum += gPhij * gPhij * Eij * (1 - Eij);
      deltaSum += gPhij * (scores[i] - Eij);
    });
    
    const v = 1 / vSum;
    const delta = v * deltaSum;
    
    // ─────────────────────────────────────────────────────────────────────
    // Paso 4: Calcular nueva volatilidad usando algoritmo de Illinois
    // ─────────────────────────────────────────────────────────────────────
    const a = Math.log(sigma * sigma);
    const phiSq = phi * phi;
    const deltaSq = delta * delta;
    
    // Función f(x) para encontrar la nueva volatilidad
    const f = (x) => {
      const ex = Math.exp(x);
      const d = phiSq + v + ex;
      return (ex * (deltaSq - phiSq - v - ex)) / (2 * d * d) - (x - a) / (Glicko2.TAU * Glicko2.TAU);
    };
    
    // Inicializar límites A y B
    let A = a;
    let B;
    if (deltaSq > phiSq + v) {
      B = Math.log(deltaSq - phiSq - v);
    } else {
      let k = 1;
      while (f(a - k * Glicko2.TAU) < 0) k++;
      B = a - k * Glicko2.TAU;
    }
    
    let fA = f(A);
    let fB = f(B);
    
    // Algoritmo de Illinois para encontrar el cero de f
    while (Math.abs(B - A) > Glicko2.EPSILON) {
      const C = A + (A - B) * fA / (fB - fA);
      const fC = f(C);
      
      if (fC * fB < 0) {
        A = B;
        fA = fB;
      } else {
        fA = fA / 2;
      }
      B = C;
      fB = fC;
    }
    
    const newSigma = Math.exp(B / 2);
    
    // ─────────────────────────────────────────────────────────────────────
    // Paso 5-6: Actualizar RD (phi) y rating (mu)
    // ─────────────────────────────────────────────────────────────────────
    const phiStar = Math.sqrt(phiSq + newSigma * newSigma);
    const newPhi = 1 / Math.sqrt(1 / (phiStar * phiStar) + 1 / v);
    const newMu = mu + newPhi * newPhi * deltaSum;
    
    // ─────────────────────────────────────────────────────────────────────
    // Convertir de vuelta y aplicar límites
    // ─────────────────────────────────────────────────────────────────────
    const result = Glicko2.fromGlicko2(newMu, Math.min(newPhi, Glicko2.MAX_RD / 173.7178));
    
    return {
      rating: Math.max(Glicko2.MIN_RATING, Math.min(Glicko2.MAX_RATING, result.rating)),
      rd: Math.max(Glicko2.MIN_RD, Math.min(Glicko2.MAX_RD, result.rd)),
      volatility: Math.max(Glicko2.MIN_VOLATILITY, Math.min(Glicko2.MAX_VOLATILITY, newSigma))
    };
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // Utilidades adicionales
  // ─────────────────────────────────────────────────────────────────────────
  
  // Estimar cambio de rating (para mostrar en UI antes de confirmar)
  estimateRatingChange: (playerRating, opponentRating, won) => {
    const player = Glicko2.toGlicko2(playerRating, 50);
    const opponent = Glicko2.toGlicko2(opponentRating, 50);
    
    const expected = Glicko2.E(player.mu, opponent.mu, opponent.phi);
    const actual = won ? 1 : 0;
    const diff = actual - expected;
    
    // Estimación simplificada (K-factor ~32)
    const change = Math.round(32 * diff);
    return Math.max(-50, Math.min(50, change));
  },
  
  // Calcular probabilidad de victoria
  winProbability: (player1Rating, player1Rd, player2Rating, player2Rd) => {
    const { mu: mu1 } = Glicko2.toGlicko2(player1Rating, player1Rd);
    const { mu: mu2, phi: phi2 } = Glicko2.toGlicko2(player2Rating, player2Rd);
    return Glicko2.E(mu1, mu2, phi2);
  },
  
  // Crear nuevo jugador con valores por defecto
  createNewPlayer: () => ({
    rating: Glicko2.DEFAULT_RATING,
    rd: Glicko2.DEFAULT_RD,
    volatility: Glicko2.DEFAULT_VOLATILITY
  })
};

// ============================================================================
// SISTEMA DE TEMPORADAS Y PLACEMENT
// ============================================================================
export const SeasonSystem = {
  // Configuración de temporada
  SEASON_DURATION_DAYS: 90,
  PLACEMENT_GAMES: 10,
  PLACEMENT_K_FACTOR: 2.5, // Multiplicador para ajustes durante placement
  
  // ─────────────────────────────────────────────────────────────────────────
  // Soft reset para inicio de nueva temporada
  // ─────────────────────────────────────────────────────────────────────────
  softReset: (player) => {
    // Acercar MMR a la media (1500) manteniendo algo del progreso anterior
    const pullFactor = 0.5; // 50% hacia la media
    const newRating = Math.round(player.rating + (1500 - player.rating) * pullFactor);
    
    return {
      ...player,
      rating: newRating,
      rd: Math.min(250, player.rd + 100), // Aumentar incertidumbre
      placementGames: 0,
      isInPlacement: true,
      seasonWins: 0,
      seasonLosses: 0,
      peakRating: newRating,
      seasonStartDate: Date.now()
    };
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // Verificaciones de placement
  // ─────────────────────────────────────────────────────────────────────────
  
  // Verificar si está en período de placement
  isInPlacement: (player) => {
    return (player.placementGames || 0) < SeasonSystem.PLACEMENT_GAMES;
  },
  
  // Calcular multiplicador de ajuste durante placement
  // Las primeras partidas tienen más impacto
  getPlacementMultiplier: (gamesPlayed) => {
    const progress = gamesPlayed / SeasonSystem.PLACEMENT_GAMES;
    return Math.max(1, SeasonSystem.PLACEMENT_K_FACTOR * (1 - progress));
  },
  
  // ─────────────────────────────────────────────────────────────────────────
  // Utilidades de temporada
  // ─────────────────────────────────────────────────────────────────────────
  
  // Calcular días restantes de temporada
  getDaysRemaining: (seasonStartDate) => {
    const now = Date.now();
    const seasonEnd = seasonStartDate + (SeasonSystem.SEASON_DURATION_DAYS * 24 * 60 * 60 * 1000);
    const remaining = Math.max(0, Math.ceil((seasonEnd - now) / (24 * 60 * 60 * 1000)));
    return remaining;
  },
  
  // Verificar si la temporada ha terminado
  isSeasonOver: (seasonStartDate) => {
    return SeasonSystem.getDaysRemaining(seasonStartDate) <= 0;
  },
  
  // Actualizar estadísticas de temporada después de partida
  updateSeasonStats: (player, won) => {
    return {
      ...player,
      placementGames: (player.placementGames || 0) + 1,
      seasonWins: (player.seasonWins || 0) + (won ? 1 : 0),
      seasonLosses: (player.seasonLosses || 0) + (won ? 0 : 1),
      peakRating: Math.max(player.peakRating || player.rating, player.rating),
      isInPlacement: (player.placementGames || 0) + 1 < SeasonSystem.PLACEMENT_GAMES
    };
  },
  
  // Obtener información de placement
  getPlacementInfo: (player) => {
    const gamesPlayed = player.placementGames || 0;
    const gamesRemaining = Math.max(0, SeasonSystem.PLACEMENT_GAMES - gamesPlayed);
    const multiplier = SeasonSystem.getPlacementMultiplier(gamesPlayed);
    
    return {
      gamesPlayed,
      gamesRemaining,
      totalGames: SeasonSystem.PLACEMENT_GAMES,
      multiplier,
      isComplete: gamesRemaining === 0,
      progress: Math.round((gamesPlayed / SeasonSystem.PLACEMENT_GAMES) * 100)
    };
  }
};

// ============================================================================
// EXPORTACIONES
// ============================================================================
export default {
  Glicko2,
  SeasonSystem
};
