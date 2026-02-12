// ============================================================================
// SISTEMA DE INTERNACIONALIZACIÓN (i18n) - COMPLETO
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
    playersOnline: { es: 'jugadores en línea', en: 'players online', pt: 'jogadores online', fr: 'joueurs en ligne' },
    players: { es: 'jugadores', en: 'players', pt: 'jogadores', fr: 'joueurs' },
    vsAI: { es: 'Jugarás vs IA', en: 'You will play vs AI', pt: 'Você jogará vs IA', fr: 'Vous jouerez contre l\'IA' },
    rankedMatch: { es: 'Partida Rankeada', en: 'Ranked Match', pt: 'Partida Ranqueada', fr: 'Partie Classée' },
    practiceMode: { es: 'Modo Práctica', en: 'Practice Mode', pt: 'Modo Prática', fr: 'Mode Entraînement' },
    requiresConnection: { es: 'Requiere conexión', en: 'Requires connection', pt: 'Requer conexão', fr: 'Connexion requise' },
    specialEvent: { es: 'Evento Especial', en: 'Special Event', pt: 'Evento Especial', fr: 'Événement Spécial' },
    doubleXP: { es: 'Doble XP este fin de semana', en: 'Double XP this weekend', pt: 'XP Dobrado neste fim de semana', fr: 'Double XP ce week-end' },
    login: { es: 'Iniciar Sesión', en: 'Login', pt: 'Entrar', fr: 'Connexion' },
    logout: { es: 'Salir', en: 'Logout', pt: 'Sair', fr: 'Déconnexion' },
    createAccount: { es: 'Crear Cuenta', en: 'Create Account', pt: 'Criar Conta', fr: 'Créer un Compte' },
    guest: { es: 'Invitado', en: 'Guest', pt: 'Convidado', fr: 'Invité' },
    guestWarning: { es: 'Progreso no guardado', en: 'Progress not saved', pt: 'Progresso não salvo', fr: 'Progression non sauvegardée' },
    noSession: { es: 'Sin sesión', en: 'No session', pt: 'Sem sessão', fr: 'Pas de session' },
    loginToSave: { es: 'Inicia sesión para guardar', en: 'Login to save', pt: 'Entre para salvar', fr: 'Connectez-vous pour sauvegarder' },
    dailyReward: { es: 'Recompensa Diaria', en: 'Daily Reward', pt: 'Recompensa Diária', fr: 'Récompense Quotidienne' },
    claimNow: { es: '¡Reclámala ahora!', en: 'Claim it now!', pt: 'Resgate agora!', fr: 'Récupérez-la maintenant!' }
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
    waitingReconnect: { es: 'Esperando reconexión...', en: 'Waiting for reconnection...', pt: 'Aguardando reconexão...', fr: 'En attente de reconnexion...' },
    team: { es: 'Equipo', en: 'Team', pt: 'Equipe', fr: 'Équipe' },
    score: { es: 'Puntuación', en: 'Score', pt: 'Pontuação', fr: 'Score' }
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
    participation: { es: 'Participación', en: 'Participation', pt: 'Participação', fr: 'Participation' },
    winBonus: { es: 'Victoria', en: 'Victory', pt: 'Vitória', fr: 'Victoire' },
    dominoBonus: { es: 'Dominó', en: 'Domino', pt: 'Dominó', fr: 'Domino' },
    capicuaBonus: { es: 'Capicúa', en: 'Capicua', pt: 'Capicua', fr: 'Capicua' },
    perfectGame: { es: 'Partida Perfecta', en: 'Perfect Game', pt: 'Jogo Perfeito', fr: 'Partie Parfaite' },
    comeback: { es: 'Remontada', en: 'Comeback', pt: 'Virada', fr: 'Remontée' },
    streak: { es: 'Racha', en: 'Streak', pt: 'Sequência', fr: 'Série' },
    firstOfDay: { es: 'Primera del Día', en: 'First of the Day', pt: 'Primeira do Dia', fr: 'Première du Jour' },
    promoted: { es: '¡ASCENDISTE!', en: 'PROMOTED!', pt: 'PROMOVIDO!', fr: 'PROMU!' },
    demoted: { es: 'Descendiste', en: 'Demoted', pt: 'Rebaixado', fr: 'Rétrogradé' },
    rematch: { es: 'REVANCHA', en: 'REMATCH', pt: 'REVANCHE', fr: 'REVANCHE' },
    requestRematch: { es: 'Pedir Revancha', en: 'Request Rematch', pt: 'Pedir Revanche', fr: 'Demander Revanche' },
    rematchSent: { es: 'Solicitud enviada...', en: 'Request sent...', pt: 'Solicitação enviada...', fr: 'Demande envoyée...' },
    rematchReceived: { es: '¡El rival quiere revancha!', en: 'Opponent wants rematch!', pt: 'Rival quer revanche!', fr: 'L\'adversaire veut une revanche!' },
    acceptRematch: { es: 'Aceptar', en: 'Accept', pt: 'Aceitar', fr: 'Accepter' },
    declineRematch: { es: 'Rechazar', en: 'Decline', pt: 'Recusar', fr: 'Refuser' },
    rematchDeclined: { es: 'Revancha rechazada', en: 'Rematch declined', pt: 'Revanche recusada', fr: 'Revanche refusée' },
    waitingResponse: { es: 'Esperando respuesta...', en: 'Waiting for response...', pt: 'Aguardando resposta...', fr: 'En attente de réponse...' },
    rematchAccepted: { es: '¡Revancha aceptada!', en: 'Rematch accepted!', pt: 'Revanche aceita!', fr: 'Revanche acceptée!' },
    maxRematches: { es: 'Máximo de revanchas alcanzado', en: 'Maximum rematches reached', pt: 'Máximo de revanches alcançado', fr: 'Maximum de revanches atteint' },
    ratingChange: { es: 'Cambio de rating', en: 'Rating change', pt: 'Mudança de rating', fr: 'Changement de classement' }
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
    placement: { es: 'Placement', en: 'Placement', pt: 'Placement', fr: 'Placement' },
    top100: { es: 'Top 100', en: 'Top 100', pt: 'Top 100', fr: 'Top 100' },
    global: { es: 'Global', en: 'Global', pt: 'Global', fr: 'Mondial' },
    regional: { es: 'Regional', en: 'Regional', pt: 'Regional', fr: 'Régional' },
    weekly: { es: 'Semanal', en: 'Weekly', pt: 'Semanal', fr: 'Hebdomadaire' }
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // AMIGOS
  // ═══════════════════════════════════════════════════════════════════════════
  friends: {
    title: { es: 'AMIGOS', en: 'FRIENDS', pt: 'AMIGOS', fr: 'AMIS' },
    online: { es: 'En línea', en: 'Online', pt: 'Online', fr: 'En ligne' },
    offline: { es: 'Desconectado', en: 'Offline', pt: 'Offline', fr: 'Hors ligne' },
    inGame: { es: 'En partida', en: 'In game', pt: 'Em jogo', fr: 'En partie' },
    away: { es: 'Ausente', en: 'Away', pt: 'Ausente', fr: 'Absent' },
    invite: { es: 'Invitar', en: 'Invite', pt: 'Convidar', fr: 'Inviter' },
    requests: { es: 'Solicitudes', en: 'Requests', pt: 'Solicitações', fr: 'Demandes' },
    search: { es: 'Buscar', en: 'Search', pt: 'Buscar', fr: 'Rechercher' },
    searchPlaceholder: { es: 'Buscar por nombre...', en: 'Search by name...', pt: 'Buscar por nome...', fr: 'Rechercher par nom...' },
    accept: { es: 'Aceptar', en: 'Accept', pt: 'Aceitar', fr: 'Accepter' },
    reject: { es: 'Rechazar', en: 'Reject', pt: 'Recusar', fr: 'Refuser' },
    add: { es: 'Agregar', en: 'Add', pt: 'Adicionar', fr: 'Ajouter' },
    remove: { es: 'Eliminar', en: 'Remove', pt: 'Remover', fr: 'Supprimer' },
    noFriends: { es: 'No tienes amigos aún', en: 'No friends yet', pt: 'Sem amigos ainda', fr: 'Pas encore d\'amis' },
    noRequests: { es: 'Sin solicitudes', en: 'No requests', pt: 'Sem solicitações', fr: 'Pas de demandes' },
    requestSent: { es: 'Solicitud enviada', en: 'Request sent', pt: 'Solicitação enviada', fr: 'Demande envoyée' },
    friendAdded: { es: 'agregado', en: 'added', pt: 'adicionado', fr: 'ajouté' },
    friendRemoved: { es: 'eliminado', en: 'removed', pt: 'removido', fr: 'supprimé' },
    inviteSent: { es: 'Invitación enviada', en: 'Invitation sent', pt: 'Convite enviado', fr: 'Invitation envoyée' },
    total: { es: 'Total', en: 'Total', pt: 'Total', fr: 'Total' },
    playing: { es: 'Jugando', en: 'Playing', pt: 'Jogando', fr: 'En train de jouer' },
    lastSeen: { es: 'Hace', en: 'Last seen', pt: 'Visto há', fr: 'Vu il y a' },
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
    emotes: { es: 'Emotes', en: 'Emotes', pt: 'Emotes', fr: 'Emotes' },
    effects: { es: 'Efectos', en: 'Effects', pt: 'Efeitos', fr: 'Effets' },
    bundles: { es: 'Paquetes', en: 'Bundles', pt: 'Pacotes', fr: 'Packs' },
    buy: { es: 'Comprar', en: 'Buy', pt: 'Comprar', fr: 'Acheter' },
    owned: { es: 'Adquirido', en: 'Owned', pt: 'Adquirido', fr: 'Possédé' },
    equip: { es: 'Equipar', en: 'Equip', pt: 'Equipar', fr: 'Équiper' },
    equipped: { es: 'Equipado', en: 'Equipped', pt: 'Equipado', fr: 'Équipé' },
    locked: { es: 'Bloqueado', en: 'Locked', pt: 'Bloqueado', fr: 'Verrouillé' },
    unlockAt: { es: 'Desbloquea en', en: 'Unlocks at', pt: 'Desbloqueia em', fr: 'Débloqué à' },
    notEnoughCoins: { es: 'No tienes suficientes Diamantes', en: 'Not enough Diamonds', pt: 'Diamantes insuficientes', fr: 'Pas assez de Diamants' },
    notEnoughTokens: { es: 'No tienes suficientes Tokens', en: 'Not enough Tokens', pt: 'Tokens insuficientes', fr: 'Pas assez de Jetons' },
    purchased: { es: 'desbloqueado', en: 'unlocked', pt: 'desbloqueado', fr: 'débloqué' },
    free: { es: 'Gratis', en: 'Free', pt: 'Grátis', fr: 'Gratuit' },
    backgrounds: { es: 'Fondos', en: 'Backgrounds', pt: 'Fundos', fr: 'Fonds' },
    titles: { es: 'Títulos', en: 'Titles', pt: 'Títulos', fr: 'Titres' }
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // LOGROS
  // ═══════════════════════════════════════════════════════════════════════════
  achievements: {
    title: { es: 'LOGROS', en: 'ACHIEVEMENTS', pt: 'CONQUISTAS', fr: 'SUCCÈS' },
    completed: { es: 'Completado', en: 'Completed', pt: 'Completado', fr: 'Terminé' },
    progress: { es: 'Progreso', en: 'Progress', pt: 'Progresso', fr: 'Progression' },
    reward: { es: 'Recompensa', en: 'Reward', pt: 'Recompensa', fr: 'Récompense' },
    unlocked: { es: '¡LOGRO DESBLOQUEADO!', en: 'ACHIEVEMENT UNLOCKED!', pt: 'CONQUISTA DESBLOQUEADA!', fr: 'SUCCÈS DÉBLOQUÉ!' },
    all: { es: 'Todos', en: 'All', pt: 'Todos', fr: 'Tous' },
    games: { es: 'Partidas', en: 'Games', pt: 'Partidas', fr: 'Parties' },
    wins: { es: 'Victorias', en: 'Wins', pt: 'Vitórias', fr: 'Victoires' },
    special: { es: 'Especiales', en: 'Special', pt: 'Especiais', fr: 'Spéciaux' },
    rarity: {
      common: { es: 'Común', en: 'Common', pt: 'Comum', fr: 'Commun' },
      rare: { es: 'Raro', en: 'Rare', pt: 'Raro', fr: 'Rare' },
      epic: { es: 'Épico', en: 'Epic', pt: 'Épico', fr: 'Épique' },
      legendary: { es: 'Legendario', en: 'Legendary', pt: 'Lendário', fr: 'Légendaire' }
    }
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
    dailyReward: { es: '¡Recompensa Diaria!', en: 'Daily Reward!', pt: 'Recompensa Diária!', fr: 'Récompense Quotidienne!' },
    tapToClaim: { es: 'Toca para reclamar', en: 'Tap to claim', pt: 'Toque para resgatar', fr: 'Appuyez pour récupérer' },
    missions: { es: 'Misiones Diarias', en: 'Daily Missions', pt: 'Missões Diárias', fr: 'Missions Quotidiennes' },
    resetsIn: { es: 'Se reinician en', en: 'Resets in', pt: 'Reinicia em', fr: 'Réinitialisation dans' },
    complete: { es: 'Completa', en: 'Complete', pt: 'Completa', fr: 'Terminée' },
    enterDaily: { es: 'Entra cada día para mejores premios', en: 'Log in daily for better rewards', pt: 'Entre diariamente para melhores prêmios', fr: 'Connectez-vous quotidiennement pour de meilleures récompenses' }
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIGURACIÓN
  // ═══════════════════════════════════════════════════════════════════════════
  settings: {
    title: { es: 'CONFIGURACIÓN', en: 'SETTINGS', pt: 'CONFIGURAÇÕES', fr: 'PARAMÈTRES' },
    sound: { es: 'Sonido', en: 'Sound', pt: 'Som', fr: 'Son' },
    music: { es: 'Música', en: 'Music', pt: 'Música', fr: 'Musique' },
    effects: { es: 'Efectos', en: 'Effects', pt: 'Efeitos', fr: 'Effets' },
    vibration: { es: 'Vibración', en: 'Vibration', pt: 'Vibração', fr: 'Vibration' },
    notifications: { es: 'Notificaciones', en: 'Notifications', pt: 'Notificações', fr: 'Notifications' },
    language: { es: 'Idioma', en: 'Language', pt: 'Idioma', fr: 'Langue' },
    theme: { es: 'Tema', en: 'Theme', pt: 'Tema', fr: 'Thème' },
    darkMode: { es: 'Modo Oscuro', en: 'Dark Mode', pt: 'Modo Escuro', fr: 'Mode Sombre' },
    autoPass: { es: 'Auto-pasar', en: 'Auto-pass', pt: 'Passar automaticamente', fr: 'Passer automatiquement' },
    autoPassDesc: { es: 'Pasar automáticamente sin fichas jugables', en: 'Auto-pass when no playable tiles', pt: 'Passar automaticamente sem pedras jogáveis', fr: 'Passer automatiquement sans domino jouable' },
    showHints: { es: 'Mostrar pistas', en: 'Show hints', pt: 'Mostrar dicas', fr: 'Afficher les indices' },
    hintsDesc: { es: 'Resaltar fichas jugables', en: 'Highlight playable tiles', pt: 'Destacar pedras jogáveis', fr: 'Mettre en évidence les dominos jouables' },
    confirmMoves: { es: 'Confirmar jugadas', en: 'Confirm moves', pt: 'Confirmar jogadas', fr: 'Confirmer les coups' },
    aiDifficulty: { es: 'Dificultad IA', en: 'AI Difficulty', pt: 'Dificuldade IA', fr: 'Difficulté IA' },
    easy: { es: 'Fácil', en: 'Easy', pt: 'Fácil', fr: 'Facile' },
    normal: { es: 'Normal', en: 'Normal', pt: 'Normal', fr: 'Normal' },
    hard: { es: 'Difícil', en: 'Hard', pt: 'Difícil', fr: 'Difficile' },
    expert: { es: 'Experto', en: 'Expert', pt: 'Especialista', fr: 'Expert' },
    colorblind: { es: 'Modo daltónico', en: 'Colorblind mode', pt: 'Modo daltônico', fr: 'Mode daltonien' },
    gameChat: { es: 'Chat en partida', en: 'In-game chat', pt: 'Chat no jogo', fr: 'Chat en partie' },
    chatDesc: { es: 'Ver mensajes de otros jugadores', en: 'See messages from other players', pt: 'Ver mensagens de outros jogadores', fr: 'Voir les messages des autres joueurs' },
    saveHistory: { es: 'Guardar historial', en: 'Save history', pt: 'Salvar histórico', fr: 'Sauvegarder l\'historique' },
    historyDesc: { es: 'Guardar registro de partidas', en: 'Save match records', pt: 'Salvar registro de partidas', fr: 'Sauvegarder les parties' },
    back: { es: 'Volver', en: 'Back', pt: 'Voltar', fr: 'Retour' },
    general: { es: 'General', en: 'General', pt: 'Geral', fr: 'Général' },
    gameplay: { es: 'Jugabilidad', en: 'Gameplay', pt: 'Jogabilidade', fr: 'Gameplay' },
    audio: { es: 'Audio', en: 'Audio', pt: 'Áudio', fr: 'Audio' },
    account: { es: 'Cuenta', en: 'Account', pt: 'Conta', fr: 'Compte' }
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // TORNEOS
  // ═══════════════════════════════════════════════════════════════════════════
  tournaments: {
    title: { es: 'TORNEOS', en: 'TOURNAMENTS', pt: 'TORNEIOS', fr: 'TOURNOIS' },
    active: { es: 'activos', en: 'active', pt: 'ativos', fr: 'actifs' },
    upcoming: { es: 'Próximos', en: 'Upcoming', pt: 'Próximos', fr: 'À venir' },
    finished: { es: 'Finalizados', en: 'Finished', pt: 'Finalizados', fr: 'Terminés' },
    join: { es: 'Inscribirse', en: 'Join', pt: 'Inscrever-se', fr: 'S\'inscrire' },
    joined: { es: 'Inscrito', en: 'Joined', pt: 'Inscrito', fr: 'Inscrit' },
    entryFee: { es: 'Entrada', en: 'Entry fee', pt: 'Entrada', fr: 'Inscription' },
    prize: { es: 'Premio', en: 'Prize', pt: 'Prêmio', fr: 'Prix' },
    players: { es: 'Jugadores', en: 'Players', pt: 'Jogadores', fr: 'Joueurs' },
    startsIn: { es: 'Comienza en', en: 'Starts in', pt: 'Começa em', fr: 'Commence dans' },
    inProgress: { es: 'En curso', en: 'In progress', pt: 'Em andamento', fr: 'En cours' },
    brackets: { es: 'Llaves', en: 'Brackets', pt: 'Chaves', fr: 'Tableau' },
    daily: { es: 'Diario', en: 'Daily', pt: 'Diário', fr: 'Quotidien' },
    weekly: { es: 'Semanal', en: 'Weekly', pt: 'Semanal', fr: 'Hebdomadaire' },
    free: { es: 'Gratis', en: 'Free', pt: 'Grátis', fr: 'Gratuit' }
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // INVENTARIO
  // ═══════════════════════════════════════════════════════════════════════════
  inventory: {
    title: { es: 'INVENTARIO', en: 'INVENTORY', pt: 'INVENTÁRIO', fr: 'INVENTAIRE' },
    skins: { es: 'Skins', en: 'Skins', pt: 'Skins', fr: 'Skins' },
    backgrounds: { es: 'Fondos', en: 'Backgrounds', pt: 'Fundos', fr: 'Fonds' },
    titles: { es: 'Títulos', en: 'Titles', pt: 'Títulos', fr: 'Titres' },
    frames: { es: 'Marcos', en: 'Frames', pt: 'Molduras', fr: 'Cadres' },
    items: { es: 'objetos', en: 'items', pt: 'itens', fr: 'objets' },
    preview: { es: 'Vista previa', en: 'Preview', pt: 'Prévia', fr: 'Aperçu' },
    avatars: { es: 'Avatares', en: 'Avatars', pt: 'Avatares', fr: 'Avatars' },
    emotes: { es: 'Emotes', en: 'Emotes', pt: 'Emotes', fr: 'Emotes' }
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
    save: { es: 'Guardar', en: 'Save', pt: 'Salvar', fr: 'Sauvegarder' },
    close: { es: 'Cerrar', en: 'Close', pt: 'Fechar', fr: 'Fermer' },
    yes: { es: 'Sí', en: 'Yes', pt: 'Sim', fr: 'Oui' },
    no: { es: 'No', en: 'No', pt: 'Não', fr: 'Non' },
    ok: { es: 'OK', en: 'OK', pt: 'OK', fr: 'OK' },
    or: { es: 'o', en: 'or', pt: 'ou', fr: 'ou' },
    and: { es: 'y', en: 'and', pt: 'e', fr: 'et' },
    of: { es: 'de', en: 'of', pt: 'de', fr: 'de' },
    level: { es: 'Nivel', en: 'Level', pt: 'Nível', fr: 'Niveau' },
    time: { es: 'Tiempo', en: 'Time', pt: 'Tempo', fr: 'Temps' },
    wins: { es: 'Victorias', en: 'Wins', pt: 'Vitórias', fr: 'Victoires' },
    losses: { es: 'Derrotas', en: 'Losses', pt: 'Derrotas', fr: 'Défaites' },
    winRate: { es: 'Ratio', en: 'Win Rate', pt: 'Taxa de Vitória', fr: 'Taux de Victoire' },
    games: { es: 'Partidas', en: 'Games', pt: 'Partidas', fr: 'Parties' },
    tokens: { es: 'Tokens', en: 'Tokens', pt: 'Tokens', fr: 'Jetons' },
    coins: { es: 'Diamantes', en: 'Diamonds', pt: 'Diamantes', fr: 'Diamants' },
    season: { es: 'Temporada', en: 'Season', pt: 'Temporada', fr: 'Saison' }
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // TIEMPO
  // ═══════════════════════════════════════════════════════════════════════════
  time: {
    now: { es: 'Ahora', en: 'Now', pt: 'Agora', fr: 'Maintenant' },
    ago: { es: 'Hace', en: 'ago', pt: 'há', fr: 'il y a' },
    minutes: { es: 'minutos', en: 'minutes', pt: 'minutos', fr: 'minutes' },
    hours: { es: 'horas', en: 'hours', pt: 'horas', fr: 'heures' },
    days: { es: 'días', en: 'days', pt: 'dias', fr: 'jours' },
    weeks: { es: 'semanas', en: 'weeks', pt: 'semanas', fr: 'semaines' }
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // BÚSQUEDA DE PARTIDA
  // ═══════════════════════════════════════════════════════════════════════════
  searching: {
    title: { es: 'BUSCANDO PARTIDA', en: 'FINDING MATCH', pt: 'PROCURANDO PARTIDA', fr: 'RECHERCHE DE PARTIE' },
    searching: { es: 'Buscando oponentes...', en: 'Searching for opponents...', pt: 'Procurando oponentes...', fr: 'Recherche d\'adversaires...' },
    found: { es: '¡Partida encontrada!', en: 'Match found!', pt: 'Partida encontrada!', fr: 'Partie trouvée!' },
    connecting: { es: 'Conectando...', en: 'Connecting...', pt: 'Conectando...', fr: 'Connexion...' },
    cancel: { es: 'Cancelar', en: 'Cancel', pt: 'Cancelar', fr: 'Annuler' },
    estimatedTime: { es: 'Tiempo estimado', en: 'Estimated time', pt: 'Tempo estimado', fr: 'Temps estimé' },
    playersInQueue: { es: 'jugadores en cola', en: 'players in queue', pt: 'jogadores na fila', fr: 'joueurs en file' }
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // PERFIL
  // ═══════════════════════════════════════════════════════════════════════════
  profile: {
    title: { es: 'PERFIL', en: 'PROFILE', pt: 'PERFIL', fr: 'PROFIL' },
    stats: { es: 'Estadísticas', en: 'Statistics', pt: 'Estatísticas', fr: 'Statistiques' },
    history: { es: 'Historial', en: 'History', pt: 'Histórico', fr: 'Historique' },
    achievements: { es: 'Logros', en: 'Achievements', pt: 'Conquistas', fr: 'Succès' },
    memberSince: { es: 'Miembro desde', en: 'Member since', pt: 'Membro desde', fr: 'Membre depuis' },
    editProfile: { es: 'Editar Perfil', en: 'Edit Profile', pt: 'Editar Perfil', fr: 'Modifier le Profil' },
    changeName: { es: 'Cambiar nombre', en: 'Change name', pt: 'Mudar nome', fr: 'Changer le nom' },
    changeAvatar: { es: 'Cambiar avatar', en: 'Change avatar', pt: 'Mudar avatar', fr: 'Changer l\'avatar' }
  }
};

// Helper function para obtener traducción
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

export default { LANGUAGES, TRANSLATIONS, getTranslation };
