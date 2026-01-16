// ============================================================================
// SISTEMA DE INTERNACIONALIZACIÓN (i18n)
// ============================================================================

export const LANGUAGES = {
  es: { name: 'Español', flag: '🇪🇸', code: 'es' },
  en: { name: 'English', flag: '🇺🇸', code: 'en' },
  pt: { name: 'Português', flag: '🇧🇷', code: 'pt' },
  fr: { name: 'Français', flag: '🇫🇷', code: 'fr' }
};

export const TRANSLATIONS = {
  // ═══════════════════════════════════════════════════════════════════════════
  // MENÚ PRINCIPAL
  // ═══════════════════════════════════════════════════════════════════════════
  menu: {
    play: { es: 'JUGAR', en: 'PLAY', pt: 'JOGAR', fr: 'JOUER' },
    playOnline: { es: 'Jugar Online', en: 'Play Online', pt: 'Jogar Online', fr: 'Jouer en Ligne' },
    playOffline: { es: 'Jugar Offline', en: 'Play Offline', pt: 'Jogar Offline', fr: 'Jouer Hors Ligne' },
    findMatch: { es: 'Buscar Partida', en: 'Find Match', pt: 'Buscar Partida', fr: 'Trouver une Partie' },
    searching: { es: 'Buscando...', en: 'Searching...', pt: 'Procurando...', fr: 'Recherche...' },
    cancel: { es: 'Cancelar', en: 'Cancel', pt: 'Cancelar', fr: 'Annuler' },
    rankings: { es: 'Rankings', en: 'Rankings', pt: 'Rankings', fr: 'Classements' },
    tournaments: { es: 'Torneos', en: 'Tournaments', pt: 'Torneios', fr: 'Tournois' },
    achievements: { es: 'Logros', en: 'Achievements', pt: 'Conquistas', fr: 'Succès' },
    inventory: { es: 'Inventario', en: 'Inventory', pt: 'Inventário', fr: 'Inventaire' },
    shop: { es: 'Tienda', en: 'Shop', pt: 'Loja', fr: 'Boutique' },
    stats: { es: 'Estadísticas', en: 'Statistics', pt: 'Estatísticas', fr: 'Statistiques' },
    settings: { es: 'Ajustes', en: 'Settings', pt: 'Configurações', fr: 'Paramètres' },
    friends: { es: 'Amigos', en: 'Friends', pt: 'Amigos', fr: 'Amis' },
    profile: { es: 'Perfil', en: 'Profile', pt: 'Perfil', fr: 'Profil' },
    quickAccess: { es: 'Acceso Rápido', en: 'Quick Access', pt: 'Acesso Rápido', fr: 'Accès Rapide' },
    serverOnline: { es: 'Servidor Online', en: 'Server Online', pt: 'Servidor Online', fr: 'Serveur en Ligne' },
    offlineMode: { es: 'Modo Offline', en: 'Offline Mode', pt: 'Modo Offline', fr: 'Mode Hors Ligne' },
    players: { es: 'jugadores', en: 'players', pt: 'jogadores', fr: 'joueurs' },
    vsAI: { es: 'Jugarás vs IA', en: 'You will play vs AI', pt: 'Você jogará vs IA', fr: 'Vous jouerez contre l\'IA' },
    specialEvent: { es: 'Evento Especial', en: 'Special Event', pt: 'Evento Especial', fr: 'Événement Spécial' },
    doubleXP: { es: 'Doble XP este fin de semana', en: 'Double XP this weekend', pt: 'XP Dobrado neste fim de semana', fr: 'Double XP ce week-end' },
    login: { es: 'Iniciar Sesión', en: 'Login', pt: 'Entrar', fr: 'Connexion' },
    logout: { es: 'Salir', en: 'Logout', pt: 'Sair', fr: 'Déconnexion' },
    guest: { es: 'Invitado', en: 'Guest', pt: 'Convidado', fr: 'Invité' }
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // JUEGO
  // ═══════════════════════════════════════════════════════════════════════════
  game: {
    you: { es: 'TÚ', en: 'YOU', pt: 'VOCÊ', fr: 'VOUS' },
    rival: { es: 'RIVAL', en: 'RIVAL', pt: 'RIVAL', fr: 'RIVAL' },
    partner: { es: 'COMPAÑERO', en: 'PARTNER', pt: 'PARCEIRO', fr: 'PARTENAIRE' },
    yourTurn: { es: 'Tu turno', en: 'Your turn', pt: 'Sua vez', fr: 'Votre tour' },
    opponentTurn: { es: 'Turno del rival', en: 'Opponent\'s turn', pt: 'Vez do rival', fr: 'Tour de l\'adversaire' },
    pass: { es: 'PASAR', en: 'PASS', pt: 'PASSAR', fr: 'PASSER' },
    passed: { es: 'Pasó', en: 'Passed', pt: 'Passou', fr: 'Passé' },
    domino: { es: 'Dominó', en: 'Domino', pt: 'Dominó', fr: 'Domino' },
    blocked: { es: 'Tranca', en: 'Blocked', pt: 'Trancado', fr: 'Bloqué' },
    round: { es: 'Ronda', en: 'Round', pt: 'Rodada', fr: 'Manche' },
    points: { es: 'puntos', en: 'points', pt: 'pontos', fr: 'points' },
    tiles: { es: 'fichas', en: 'tiles', pt: 'pedras', fr: 'dominos' },
    emotes: { es: 'Emotes', en: 'Emotes', pt: 'Emotes', fr: 'Emotes' },
    pause: { es: 'Pausa', en: 'Pause', pt: 'Pausar', fr: 'Pause' },
    resume: { es: 'Continuar', en: 'Resume', pt: 'Continuar', fr: 'Reprendre' },
    surrender: { es: 'Rendirse', en: 'Surrender', pt: 'Desistir', fr: 'Abandonner' },
    confirmSurrender: { es: '¿Seguro que quieres rendirte?', en: 'Are you sure you want to surrender?', pt: 'Tem certeza que quer desistir?', fr: 'Êtes-vous sûr de vouloir abandonner?' },
    leftGame: { es: 'abandonó la partida', en: 'left the game', pt: 'abandonou a partida', fr: 'a quitté la partie' },
    waitingReconnect: { es: 'Esperando reconexión...', en: 'Waiting for reconnection...', pt: 'Aguardando reconexão...', fr: 'En attente de reconnexion...' }
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // FIN DE PARTIDA
  // ═══════════════════════════════════════════════════════════════════════════
  endGame: {
    victory: { es: '¡VICTORIA!', en: 'VICTORY!', pt: 'VITÓRIA!', fr: 'VICTOIRE!' },
    defeat: { es: 'DERROTA', en: 'DEFEAT', pt: 'DERROTA', fr: 'DÉFAITE' },
    draw: { es: 'EMPATE', en: 'DRAW', pt: 'EMPATE', fr: 'ÉGALITÉ' },
    playAgain: { es: 'JUGAR DE NUEVO', en: 'PLAY AGAIN', pt: 'JOGAR NOVAMENTE', fr: 'REJOUER' },
    backToMenu: { es: 'Menú', en: 'Menu', pt: 'Menu', fr: 'Menu' },
    rewards: { es: 'RECOMPENSAS', en: 'REWARDS', pt: 'RECOMPENSAS', fr: 'RÉCOMPENSES' },
    rematch: { es: 'REVANCHA', en: 'REMATCH', pt: 'REVANCHE', fr: 'REVANCHE' },
    rematchReceived: { es: '¡El rival quiere revancha!', en: 'Opponent wants rematch!', pt: 'Rival quer revanche!', fr: 'L\'adversaire veut une revanche!' },
    acceptRematch: { es: 'Aceptar', en: 'Accept', pt: 'Aceitar', fr: 'Accepter' },
    declineRematch: { es: 'Rechazar', en: 'Decline', pt: 'Recusar', fr: 'Refuser' },
    rematchDeclined: { es: 'Revancha rechazada', en: 'Rematch declined', pt: 'Revanche recusada', fr: 'Revanche refusée' },
    waitingResponse: { es: 'Esperando respuesta...', en: 'Waiting for response...', pt: 'Aguardando resposta...', fr: 'En attente de réponse...' },
    rematchAccepted: { es: '¡Revancha aceptada!', en: 'Rematch accepted!', pt: 'Revanche aceita!', fr: 'Revanche acceptée!' },
    maxRematches: { es: 'Máximo de revanchas alcanzado', en: 'Maximum rematches reached', pt: 'Máximo de revanches alcançado', fr: 'Maximum de revanches atteint' },
    promoted: { es: '¡ASCENDISTE!', en: 'PROMOTED!', pt: 'PROMOVIDO!', fr: 'PROMU!' },
    demoted: { es: 'Descendiste', en: 'Demoted', pt: 'Rebaixado', fr: 'Rétrogradé' }
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // RANKINGS Y RANGOS
  // ═══════════════════════════════════════════════════════════════════════════
  ranks: {
    bronze: { es: 'Bronce', en: 'Bronze', pt: 'Bronze', fr: 'Bronze' },
    silver: { es: 'Plata', en: 'Silver', pt: 'Prata', fr: 'Argent' },
    gold: { es: 'Oro', en: 'Gold', pt: 'Ouro', fr: 'Or' },
    platinum: { es: 'Platino', en: 'Platinum', pt: 'Platina', fr: 'Platine' },
    diamond: { es: 'Diamante', en: 'Diamond', pt: 'Diamante', fr: 'Diamant' },
    master: { es: 'Maestro', en: 'Master', pt: 'Mestre', fr: 'Maître' },
    grandmaster: { es: 'Gran Maestro', en: 'Grandmaster', pt: 'Grão-Mestre', fr: 'Grand Maître' },
    legend: { es: 'Leyenda', en: 'Legend', pt: 'Lenda', fr: 'Légende' },
    top100: { es: 'Top 100', en: 'Top 100', pt: 'Top 100', fr: 'Top 100' },
    global: { es: 'Global', en: 'Global', pt: 'Global', fr: 'Mondial' },
    regional: { es: 'Regional', en: 'Regional', pt: 'Regional', fr: 'Régional' }
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // AMIGOS
  // ═══════════════════════════════════════════════════════════════════════════
  friends: {
    title: { es: 'AMIGOS', en: 'FRIENDS', pt: 'AMIGOS', fr: 'AMIS' },
    online: { es: 'En línea', en: 'Online', pt: 'Online', fr: 'En ligne' },
    offline: { es: 'Desconectado', en: 'Offline', pt: 'Offline', fr: 'Hors ligne' },
    inGame: { es: 'En partida', en: 'In game', pt: 'Em jogo', fr: 'En partie' },
    invite: { es: 'Invitar', en: 'Invite', pt: 'Convidar', fr: 'Inviter' },
    requests: { es: 'Solicitudes', en: 'Requests', pt: 'Solicitações', fr: 'Demandes' },
    search: { es: 'Buscar', en: 'Search', pt: 'Buscar', fr: 'Rechercher' },
    accept: { es: 'Aceptar', en: 'Accept', pt: 'Aceitar', fr: 'Accepter' },
    reject: { es: 'Rechazar', en: 'Reject', pt: 'Recusar', fr: 'Refuser' },
    add: { es: 'Agregar', en: 'Add', pt: 'Adicionar', fr: 'Ajouter' },
    noFriends: { es: 'No tienes amigos aún', en: 'No friends yet', pt: 'Sem amigos ainda', fr: 'Pas encore d\'amis' },
    friendsOnline: { es: 'amigos en línea', en: 'friends online', pt: 'amigos online', fr: 'amis en ligne' }
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // TIENDA
  // ═══════════════════════════════════════════════════════════════════════════
  shop: {
    title: { es: 'TIENDA', en: 'SHOP', pt: 'LOJA', fr: 'BOUTIQUE' },
    tiles: { es: 'Fichas', en: 'Tiles', pt: 'Pedras', fr: 'Dominos' },
    boards: { es: 'Tableros', en: 'Boards', pt: 'Tabuleiros', fr: 'Plateaux' },
    avatars: { es: 'Avatares', en: 'Avatars', pt: 'Avatares', fr: 'Avatars' },
    buy: { es: 'Comprar', en: 'Buy', pt: 'Comprar', fr: 'Acheter' },
    owned: { es: 'Adquirido', en: 'Owned', pt: 'Adquirido', fr: 'Possédé' },
    equip: { es: 'Equipar', en: 'Equip', pt: 'Equipar', fr: 'Équiper' },
    equipped: { es: 'Equipado', en: 'Equipped', pt: 'Equipado', fr: 'Équipé' },
    locked: { es: 'Bloqueado', en: 'Locked', pt: 'Bloqueado', fr: 'Verrouillé' },
    free: { es: 'Gratis', en: 'Free', pt: 'Grátis', fr: 'Gratuit' }
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // LOGROS
  // ═══════════════════════════════════════════════════════════════════════════
  achievements: {
    title: { es: 'LOGROS', en: 'ACHIEVEMENTS', pt: 'CONQUISTAS', fr: 'SUCCÈS' },
    completed: { es: 'Completado', en: 'Completed', pt: 'Completado', fr: 'Terminé' },
    progress: { es: 'Progreso', en: 'Progress', pt: 'Progresso', fr: 'Progression' },
    unlocked: { es: '¡LOGRO DESBLOQUEADO!', en: 'ACHIEVEMENT UNLOCKED!', pt: 'CONQUISTA DESBLOQUEADA!', fr: 'SUCCÈS DÉBLOQUÉ!' },
    all: { es: 'Todos', en: 'All', pt: 'Todos', fr: 'Tous' }
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // RECOMPENSAS DIARIAS
  // ═══════════════════════════════════════════════════════════════════════════
  daily: {
    title: { es: 'RECOMPENSAS DIARIAS', en: 'DAILY REWARDS', pt: 'RECOMPENSAS DIÁRIAS', fr: 'RÉCOMPENSES QUOTIDIENNES' },
    claim: { es: 'RECLAMAR', en: 'CLAIM', pt: 'RESGATAR', fr: 'RÉCUPÉRER' },
    claimed: { es: 'Reclamado', en: 'Claimed', pt: 'Resgatado', fr: 'Récupéré' },
    day: { es: 'Día', en: 'Day', pt: 'Dia', fr: 'Jour' },
    streak: { es: 'Racha actual', en: 'Current streak', pt: 'Sequência atual', fr: 'Série actuelle' },
    days: { es: 'días', en: 'days', pt: 'dias', fr: 'jours' },
    comeBackTomorrow: { es: 'Volver mañana', en: 'Come back tomorrow', pt: 'Volte amanhã', fr: 'Revenez demain' },
    missions: { es: 'Misiones Diarias', en: 'Daily Missions', pt: 'Missões Diárias', fr: 'Missions Quotidiennes' }
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURACIÓN
  // ═══════════════════════════════════════════════════════════════════════════
  settings: {
    title: { es: 'CONFIGURACIÓN', en: 'SETTINGS', pt: 'CONFIGURAÇÕES', fr: 'PARAMÈTRES' },
    sound: { es: 'Sonido', en: 'Sound', pt: 'Som', fr: 'Son' },
    music: { es: 'Música', en: 'Music', pt: 'Música', fr: 'Musique' },
    vibration: { es: 'Vibración', en: 'Vibration', pt: 'Vibração', fr: 'Vibration' },
    language: { es: 'Idioma', en: 'Language', pt: 'Idioma', fr: 'Langue' },
    back: { es: 'Volver', en: 'Back', pt: 'Voltar', fr: 'Retour' },
    general: { es: 'General', en: 'General', pt: 'Geral', fr: 'Général' },
    gameplay: { es: 'Jugabilidad', en: 'Gameplay', pt: 'Jogabilidade', fr: 'Gameplay' },
    audio: { es: 'Audio', en: 'Audio', pt: 'Áudio', fr: 'Audio' }
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // TORNEOS
  // ═══════════════════════════════════════════════════════════════════════════
  tournaments: {
    title: { es: 'TORNEOS', en: 'TOURNAMENTS', pt: 'TORNEIOS', fr: 'TOURNOIS' },
    active: { es: 'activos', en: 'active', pt: 'ativos', fr: 'actifs' },
    join: { es: 'Inscribirse', en: 'Join', pt: 'Inscrever-se', fr: 'S\'inscrire' },
    prize: { es: 'Premio', en: 'Prize', pt: 'Prêmio', fr: 'Prix' },
    players: { es: 'Jugadores', en: 'Players', pt: 'Jogadores', fr: 'Joueurs' }
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // COMÚN
  // ═══════════════════════════════════════════════════════════════════════════
  common: {
    loading: { es: 'Cargando...', en: 'Loading...', pt: 'Carregando...', fr: 'Chargement...' },
    error: { es: 'Error', en: 'Error', pt: 'Erro', fr: 'Erreur' },
    success: { es: 'Éxito', en: 'Success', pt: 'Sucesso', fr: 'Succès' },
    confirm: { es: 'Confirmar', en: 'Confirm', pt: 'Confirmar', fr: 'Confirmer' },
    cancel: { es: 'Cancelar', en: 'Cancel', pt: 'Cancelar', fr: 'Annuler' },
    close: { es: 'Cerrar', en: 'Close', pt: 'Fechar', fr: 'Fermer' },
    yes: { es: 'Sí', en: 'Yes', pt: 'Sim', fr: 'Oui' },
    no: { es: 'No', en: 'No', pt: 'Não', fr: 'Non' },
    ok: { es: 'OK', en: 'OK', pt: 'OK', fr: 'OK' },
    wins: { es: 'Victorias', en: 'Wins', pt: 'Vitórias', fr: 'Victoires' },
    losses: { es: 'Derrotas', en: 'Losses', pt: 'Derrotas', fr: 'Défaites' },
    games: { es: 'Partidas', en: 'Games', pt: 'Partidas', fr: 'Parties' },
    tokens: { es: 'Tokens', en: 'Tokens', pt: 'Tokens', fr: 'Jetons' },
    coins: { es: 'Diamantes', en: 'Diamonds', pt: 'Diamantes', fr: 'Diamants' }
  }
};

// Helper para obtener traducción
export const getTranslation = (path, lang = 'es') => {
  const keys = path.split('.');
  let result = TRANSLATIONS;
  
  for (const key of keys) {
    if (result && result[key]) {
      result = result[key];
    } else {
      return path;
    }
  }
  
  if (typeof result === 'object' && result[lang]) {
    return result[lang];
  }
  
  return result.es || path;
};
