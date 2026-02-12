import React, { useState, useEffect, useCallback, useRef, useMemo, createContext, useContext } from 'react';

// Sistema de Audio (sonidos sintéticos - no requiere archivos)
import * as Audio from './synthAudio.js';
import { io } from 'socket.io-client';

// ============================================================================
// SISTEMA DE INTERNACIONALIZACIÓN (i18n)
// ============================================================================
const LANGUAGES = {
  es: { name: 'Español', flag: '🇪🇸', code: 'es' },
  en: { name: 'English', flag: '🇺🇸', code: 'en' },
  pt: { name: 'Português', flag: '🇧🇷', code: 'pt' },
  fr: { name: 'Français', flag: '🇫🇷', code: 'fr' }
};

const TRANSLATIONS = {
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
    createAccount: { es: 'Crear Cuenta', en: 'Create Account', pt: 'Criar Conta', fr: 'Créer un Compte' },
    guest: { es: 'Invitado', en: 'Guest', pt: 'Convidado', fr: 'Invité' },
    guestWarning: { es: 'Progreso no guardado', en: 'Progress not saved', pt: 'Progresso não salvo', fr: 'Progression non sauvegardée' },
    noSession: { es: 'Sin sesión', en: 'No session', pt: 'Sem sessão', fr: 'Pas de session' },
    loginToSave: { es: 'Inicia sesión para guardar', en: 'Login to save', pt: 'Entre para salvar', fr: 'Connectez-vous pour sauvegarder' }
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
    // Sistema de revancha
    rematch: { es: 'REVANCHA', en: 'REMATCH', pt: 'REVANCHE', fr: 'REVANCHE' },
    requestRematch: { es: 'Pedir Revancha', en: 'Request Rematch', pt: 'Pedir Revanche', fr: 'Demander Revanche' },
    rematchSent: { es: 'Solicitud enviada...', en: 'Request sent...', pt: 'Solicitação enviada...', fr: 'Demande envoyée...' },
    rematchReceived: { es: '¡El rival quiere revancha!', en: 'Opponent wants rematch!', pt: 'Rival quer revanche!', fr: 'L\'adversaire veut une revanche!' },
    acceptRematch: { es: 'Aceptar', en: 'Accept', pt: 'Aceitar', fr: 'Accepter' },
    declineRematch: { es: 'Rechazar', en: 'Decline', pt: 'Recusar', fr: 'Refuser' },
    rematchDeclined: { es: 'Revancha rechazada', en: 'Rematch declined', pt: 'Revanche recusada', fr: 'Revanche refusée' },
    waitingResponse: { es: 'Esperando respuesta...', en: 'Waiting for response...', pt: 'Aguardando resposta...', fr: 'En attente de réponse...' },
    rematchAccepted: { es: '¡Revancha aceptada!', en: 'Rematch accepted!', pt: 'Revanche aceita!', fr: 'Revanche acceptée!' },
    maxRematches: { es: 'Máximo de revanchas alcanzado', en: 'Maximum rematches reached', pt: 'Máximo de revanches alcançado', fr: 'Maximum de revanches atteint' }
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
    free: { es: 'Gratis', en: 'Free', pt: 'Grátis', fr: 'Gratuit' }
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
    preview: { es: 'Vista previa', en: 'Preview', pt: 'Prévia', fr: 'Aperçu' }
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
  }
};

// Helper function para obtener traducción
const getTranslation = (path, lang = 'es') => {
  const keys = path.split('.');
  let result = TRANSLATIONS;
  
  for (const key of keys) {
    if (result && result[key]) {
      result = result[key];
    } else {
      return path; // Retorna el path si no encuentra traducción
    }
  }
  
  if (typeof result === 'object' && result[lang]) {
    return result[lang];
  }
  
  return result.es || path; // Fallback a español
};

// Contexto de idioma
const LanguageContext = createContext({ lang: 'es', setLang: () => {}, t: () => '' });

// Hook para usar traducciones
const useTranslation = () => {
  const context = useContext(LanguageContext);
  return context;
};

// ============================================================================
// CONFIGURACIÓN DEL SERVIDOR
// ============================================================================
const SERVIDOR_URL = 'http://localhost:3001';

// ============================================================================
// SISTEMA DE RANKING GLICKO-2
// ============================================================================
const Glicko2 = {
  // Constantes del sistema
  TAU: 0.5, // Volatilidad del sistema (0.3-1.2, menor = más estable)
  EPSILON: 0.000001, // Precisión para convergencia
  SCALE: 173.7178, // Factor de escala Glicko-2
  
  // Convertir rating Glicko-1 a Glicko-2
  toGlicko2: (rating, rd) => ({
    mu: (rating - 1500) / 173.7178,
    phi: rd / 173.7178
  }),
  
  // Convertir Glicko-2 a Glicko-1
  fromGlicko2: (mu, phi) => ({
    rating: Math.round(mu * 173.7178 + 1500),
    rd: Math.round(phi * 173.7178)
  }),
  
  // Función g(φ)
  g: (phi) => 1 / Math.sqrt(1 + 3 * phi * phi / (Math.PI * Math.PI)),
  
  // Función E (expectativa de resultado)
  E: (mu, muj, phij) => 1 / (1 + Math.exp(-Glicko2.g(phij) * (mu - muj))),
  
  // Calcular nuevo rating después de una partida
  updateRating: (player, opponents, scores) => {
    // player: { rating, rd, volatility }
    // opponents: [{ rating, rd }]
    // scores: [1 para victoria, 0.5 empate, 0 derrota]
    
    const { mu, phi } = Glicko2.toGlicko2(player.rating, player.rd);
    let sigma = player.volatility || 0.06;
    
    if (opponents.length === 0) {
      // Sin partidas, solo aumenta RD por inactividad
      const newPhi = Math.sqrt(phi * phi + sigma * sigma);
      const result = Glicko2.fromGlicko2(mu, Math.min(newPhi, 350 / 173.7178));
      return { ...result, volatility: sigma };
    }
    
    // Paso 3: Calcular v (varianza estimada)
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
    
    // Paso 4: Calcular nueva volatilidad (algoritmo de Illinois)
    const a = Math.log(sigma * sigma);
    const phiSq = phi * phi;
    const deltaSq = delta * delta;
    
    const f = (x) => {
      const ex = Math.exp(x);
      const d = phiSq + v + ex;
      return (ex * (deltaSq - phiSq - v - ex)) / (2 * d * d) - (x - a) / (Glicko2.TAU * Glicko2.TAU);
    };
    
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
    
    // Paso 5-6: Actualizar RD y rating
    const phiStar = Math.sqrt(phiSq + newSigma * newSigma);
    const newPhi = 1 / Math.sqrt(1 / (phiStar * phiStar) + 1 / v);
    const newMu = mu + newPhi * newPhi * deltaSum;
    
    const result = Glicko2.fromGlicko2(newMu, Math.min(newPhi, 350 / 173.7178));
    return {
      rating: Math.max(100, Math.min(3500, result.rating)), // Clamp entre 100-3500
      rd: Math.max(30, Math.min(350, result.rd)), // RD mínimo 30, máximo 350
      volatility: Math.max(0.03, Math.min(0.1, newSigma)) // Volatilidad entre 0.03-0.1
    };
  }
};

// ============================================================================
// SISTEMA DE RANGOS VISIBLES
// ============================================================================
const RankSystem = {
  // Rangos y sus límites de MMR
  RANKS: [
    { name: 'Bronce V', min: 0, max: 799, tier: 'bronze', division: 5, icon: '🥉' },
    { name: 'Bronce IV', min: 800, max: 899, tier: 'bronze', division: 4, icon: '🥉' },
    { name: 'Bronce III', min: 900, max: 999, tier: 'bronze', division: 3, icon: '🥉' },
    { name: 'Bronce II', min: 1000, max: 1099, tier: 'bronze', division: 2, icon: '🥉' },
    { name: 'Bronce I', min: 1100, max: 1199, tier: 'bronze', division: 1, icon: '🥉' },
    { name: 'Plata V', min: 1200, max: 1299, tier: 'silver', division: 5, icon: '🥈' },
    { name: 'Plata IV', min: 1300, max: 1349, tier: 'silver', division: 4, icon: '🥈' },
    { name: 'Plata III', min: 1350, max: 1399, tier: 'silver', division: 3, icon: '🥈' },
    { name: 'Plata II', min: 1400, max: 1449, tier: 'silver', division: 2, icon: '🥈' },
    { name: 'Plata I', min: 1450, max: 1499, tier: 'silver', division: 1, icon: '🥈' },
    { name: 'Oro V', min: 1500, max: 1549, tier: 'gold', division: 5, icon: '🥇' },
    { name: 'Oro IV', min: 1550, max: 1599, tier: 'gold', division: 4, icon: '🥇' },
    { name: 'Oro III', min: 1600, max: 1649, tier: 'gold', division: 3, icon: '🥇' },
    { name: 'Oro II', min: 1650, max: 1699, tier: 'gold', division: 2, icon: '🥇' },
    { name: 'Oro I', min: 1700, max: 1799, tier: 'gold', division: 1, icon: '🥇' },
    { name: 'Platino V', min: 1800, max: 1849, tier: 'platinum', division: 5, icon: '💎' },
    { name: 'Platino IV', min: 1850, max: 1899, tier: 'platinum', division: 4, icon: '💎' },
    { name: 'Platino III', min: 1900, max: 1949, tier: 'platinum', division: 3, icon: '💎' },
    { name: 'Platino II', min: 1950, max: 1999, tier: 'platinum', division: 2, icon: '💎' },
    { name: 'Platino I', min: 2000, max: 2099, tier: 'platinum', division: 1, icon: '💎' },
    { name: 'Diamante V', min: 2100, max: 2149, tier: 'diamond', division: 5, icon: '💠' },
    { name: 'Diamante IV', min: 2150, max: 2199, tier: 'diamond', division: 4, icon: '💠' },
    { name: 'Diamante III', min: 2200, max: 2249, tier: 'diamond', division: 3, icon: '💠' },
    { name: 'Diamante II', min: 2250, max: 2299, tier: 'diamond', division: 2, icon: '💠' },
    { name: 'Diamante I', min: 2300, max: 2399, tier: 'diamond', division: 1, icon: '💠' },
    { name: 'Maestro', min: 2400, max: 2599, tier: 'master', division: 0, icon: '👑' },
    { name: 'Gran Maestro', min: 2600, max: 2799, tier: 'grandmaster', division: 0, icon: '🏆' },
    { name: 'Leyenda', min: 2800, max: 9999, tier: 'legend', division: 0, icon: '⭐' },
  ],
  
  // Colores por tier
  TIER_COLORS: {
    bronze: { primary: '#cd7f32', secondary: '#8b4513', bg: 'linear-gradient(135deg, #cd7f32, #8b4513)' },
    silver: { primary: '#c0c0c0', secondary: '#808080', bg: 'linear-gradient(135deg, #c0c0c0, #a8a8a8)' },
    gold: { primary: '#ffd700', secondary: '#daa520', bg: 'linear-gradient(135deg, #ffd700, #ffb300)' },
    platinum: { primary: '#00d4aa', secondary: '#008b8b', bg: 'linear-gradient(135deg, #00d4aa, #20b2aa)' },
    diamond: { primary: '#b9f2ff', secondary: '#00bfff', bg: 'linear-gradient(135deg, #b9f2ff, #87ceeb)' },
    master: { primary: '#9932cc', secondary: '#8b008b', bg: 'linear-gradient(135deg, #9932cc, #ba55d3)' },
    grandmaster: { primary: '#ff4500', secondary: '#dc143c', bg: 'linear-gradient(135deg, #ff4500, #ff6347)' },
    legend: { primary: '#ffd700', secondary: '#ff4500', bg: 'linear-gradient(135deg, #ffd700, #ff8c00, #ff4500)' },
  },
  
  // Obtener rango por MMR
  getRank: (mmr) => {
    for (let i = RankSystem.RANKS.length - 1; i >= 0; i--) {
      if (mmr >= RankSystem.RANKS[i].min) return RankSystem.RANKS[i];
    }
    return RankSystem.RANKS[0];
  },
  
  // Calcular progreso dentro del rango actual (0-100)
  getProgress: (mmr) => {
    const rank = RankSystem.getRank(mmr);
    const range = rank.max - rank.min;
    if (range === 0) return 100;
    return Math.min(100, Math.max(0, Math.round(((mmr - rank.min) / range) * 100)));
  },
  
  // Verificar si subió/bajó de rango
  checkRankChange: (oldMmr, newMmr) => {
    const oldRank = RankSystem.getRank(oldMmr);
    const newRank = RankSystem.getRank(newMmr);
    if (newRank.min > oldRank.min) return { type: 'promotion', from: oldRank, to: newRank };
    if (newRank.min < oldRank.min) return { type: 'demotion', from: oldRank, to: newRank };
    return null;
  }
};

// ============================================================================
// SISTEMA DE TEMPORADAS Y PLACEMENT
// ============================================================================
const SeasonSystem = {
  // Configuración de temporada
  SEASON_DURATION_DAYS: 90,
  PLACEMENT_GAMES: 10,
  PLACEMENT_K_FACTOR: 2.5, // Multiplicador para ajustes en placement
  
  // Soft reset para nueva temporada
  softReset: (player) => {
    // Acercar MMR a la media (1500) manteniendo algo de progreso
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
      peakRating: newRating
    };
  },
  
  // Verificar si está en placement
  isInPlacement: (player) => player.placementGames < SeasonSystem.PLACEMENT_GAMES,
  
  // Calcular ajuste de placement (más agresivo que normal)
  getPlacementMultiplier: (gamesPlayed) => {
    // Primeras partidas tienen más peso
    return Math.max(1, SeasonSystem.PLACEMENT_K_FACTOR * (1 - gamesPlayed / SeasonSystem.PLACEMENT_GAMES));
  }
};

// ============================================================================
// SISTEMA DE PROTECCIÓN ANTI-ABUSE
// ============================================================================
const AntiAbuse = {
  // Configuración
  SMURF_WINRATE_THRESHOLD: 0.85, // 85% winrate sospechoso
  SMURF_MIN_GAMES: 10,
  SMURF_STOMP_THRESHOLD: 0.7, // 70% de victorias aplastantes
  BOOSTING_SAME_PARTNER_LIMIT: 5, // Máx partidas con mismo compañero por día
  BOOSTING_WINRATE_WITH_PARTNER: 0.9, // 90% winrate con mismo partner = sospechoso
  
  // Detectar posible smurf
  detectSmurf: (player) => {
    if (player.totalGames < AntiAbuse.SMURF_MIN_GAMES) return { isSmurf: false };
    
    const winrate = player.wins / player.totalGames;
    const stompRate = (player.stompWins || 0) / player.wins;
    
    if (winrate >= AntiAbuse.SMURF_WINRATE_THRESHOLD && stompRate >= AntiAbuse.SMURF_STOMP_THRESHOLD) {
      return {
        isSmurf: true,
        confidence: Math.min(1, (winrate - 0.7) * 2 + (stompRate - 0.5)),
        recommendation: 'accelerate_mmr' // Subir MMR más rápido
      };
    }
    return { isSmurf: false };
  },
  
  // Detectar posible boosting
  detectBoosting: (player, recentMatches) => {
    // Contar partidas con cada compañero
    const partnerCounts = {};
    const partnerWins = {};
    
    recentMatches.forEach(match => {
      if (match.partner) {
        partnerCounts[match.partner] = (partnerCounts[match.partner] || 0) + 1;
        if (match.won) partnerWins[match.partner] = (partnerWins[match.partner] || 0) + 1;
      }
    });
    
    for (const partner in partnerCounts) {
      const count = partnerCounts[partner];
      const wins = partnerWins[partner] || 0;
      
      if (count >= AntiAbuse.BOOSTING_SAME_PARTNER_LIMIT) {
        const winrateWithPartner = wins / count;
        if (winrateWithPartner >= AntiAbuse.BOOSTING_WINRATE_WITH_PARTNER) {
          return {
            isBoosting: true,
            partner,
            gamesWithPartner: count,
            winrateWithPartner,
            recommendation: 'reduce_gains' // Reducir ganancias de MMR
          };
        }
      }
    }
    return { isBoosting: false };
  },
  
  // Verificar si partida contra IA da MMR (no debería en ranked real)
  isValidRankedMatch: (opponents) => {
    // En ranked real, todos los oponentes deben ser humanos
    return opponents.every(opp => !opp.isAI);
  }
};

// ============================================================================
// SISTEMA DE HISTORIAL DE PARTIDAS
// ============================================================================
const MatchHistory = {
  // Crear entrada de historial
  createEntry: (match) => ({
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    date: new Date().toISOString(),
    
    // Jugadores
    player: match.player,
    partner: match.partner,
    opponents: match.opponents,
    
    // Resultado
    won: match.won,
    score: match.score, // [tuEquipo, otroEquipo]
    endReason: match.endReason, // 'domino', 'tranca', 'abandon', 'timeout'
    
    // MMR
    mmrBefore: match.mmrBefore,
    mmrAfter: match.mmrAfter,
    mmrChange: match.mmrAfter - match.mmrBefore,
    
    // Estadísticas de la partida
    rounds: match.rounds,
    duration: match.duration, // en segundos
    
    // Metadata
    seasonId: match.seasonId,
    isPlacement: match.isPlacement,
    wasRanked: match.wasRanked
  }),
  
  // Guardar en localStorage
  save: (history) => {
    try {
      // Mantener solo últimas 100 partidas
      const trimmed = history.slice(-100);
      localStorage.setItem('dominoMatchHistory', JSON.stringify(trimmed));
      return true;
    } catch (e) {
      console.error('Error saving match history:', e);
      return false;
    }
  },
  
  // Cargar desde localStorage
  load: () => {
    try {
      const data = localStorage.getItem('dominoMatchHistory');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error loading match history:', e);
      return [];
    }
  }
};

// ============================================================================
// SISTEMA DE LEADERBOARD AVANZADO
// ============================================================================
const Leaderboard = {
  // Tipos de leaderboard
  TYPES: {
    GLOBAL: 'global',
    REGIONAL: 'regional',
    FRIENDS: 'friends',
    SEASON: 'season',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly'
  },
  
  // Regiones disponibles
  REGIONS: [
    { id: 'latam', name: 'Latinoamérica', flag: '🌎' },
    { id: 'spain', name: 'España', flag: '🇪🇸' },
    { id: 'usa', name: 'Estados Unidos', flag: '🇺🇸' },
    { id: 'caribbean', name: 'Caribe', flag: '🏝️' },
    { id: 'europe', name: 'Europa', flag: '🇪🇺' },
    { id: 'asia', name: 'Asia', flag: '🌏' }
  ],
  
  // Nombres realistas por región
  NAMES_BY_REGION: {
    latam: ['DominoKing', 'LaFicha', 'ElMaster', 'DobleNueve', 'Trancador', 'ElPro', 'FichaLoca', 'ManoGanadora', 'ElCrack', 'Dominator', 'ElCampeón', 'LaLeyenda', 'ElGenio', 'DobleDoble', 'Estratega', 'ElInvicto', 'ManoFirme', 'ElMaestro', 'LaEstrella', 'ElTitán', 'Capicúa', 'ElDoble', 'FichaRápida', 'ElRey', 'LaReina', 'Pollona', 'ElPolvo', 'Cerrador', 'LaTrancada', 'ElSabio'],
    spain: ['DominoMadrid', 'TileMaster', 'LaFichaLoca', 'DobleSeisESP', 'Trancador_ES', 'MadrileñoPro', 'BCN_Domino', 'SevillanoTop', 'ValenciaKing', 'ZaragozaPro', 'GaliciaFicha', 'CatalunyaDom', 'AndaluzPro', 'VascoFicha', 'Madrileño99'],
    usa: ['TileStorm', 'DominoUSA', 'NYCPlayer', 'MiamiDomino', 'LAKing', 'TexasHold', 'ChicagoTile', 'BostonPro', 'SeattleDom', 'DenverKing', 'AtlantaPro', 'PhillyDom', 'PhoenixTile', 'SanDiegoPro', 'LasVegasAce'],
    caribbean: ['IslandKing', 'CaribePro', 'TropicalDom', 'HavanaTile', 'SanJuanPro', 'DominicanKing', 'CubanMaster', 'PRBoricua', 'JamaicaPro', 'BahamasTile', 'TrinidadDom', 'ArubaKing', 'CuracaoPro', 'IslaFicha', 'MarCaribe'],
    europe: ['EuroMaster', 'ParisianTile', 'BerlinDom', 'LondonKing', 'RomaPro', 'AmsterdamDom', 'BrusselsTile', 'ViennaPro', 'PragueDom', 'WarsawKing', 'LisbonPro', 'AthensDOM', 'StockholmTile', 'OsloPro', 'CopenhagenDom'],
    asia: ['TokyoTile', 'SeoulMaster', 'SingaporePro', 'HongKongDom', 'TaipeiKing', 'BangkokTile', 'ManilaDOM', 'JakartaPro', 'KualaLumpurDom', 'ShanghaiKing', 'BeijingPro', 'MumbaiTile', 'DelhiDOM', 'DubaiPro', 'AsiaKing']
  },
  
  // Avatares por región
  AVATARS_BY_REGION: {
    latam: ['😎', '🧔', '👨', '👩', '🎭', '🌮', '⚽', '🎸', '🦜', '🌴'],
    spain: ['🇪🇸', '🐂', '🎨', '⚽', '🍷', '🏰', '💃', '🎸', '👨', '👩'],
    usa: ['🇺🇸', '🏈', '🗽', '🌟', '🎬', '🎸', '🤠', '🏀', '👨', '👩'],
    caribbean: ['🌴', '🏝️', '🌺', '🥥', '🦜', '☀️', '🌊', '🎺', '👨', '👩'],
    europe: ['🇪🇺', '🏰', '🎭', '⚽', '🍷', '🎨', '🎻', '📚', '👨', '👩'],
    asia: ['🌸', '🎎', '🐉', '🏯', '🍜', '🎋', '⛩️', '🧧', '👨', '👩']
  },
  
  // Generar jugador aleatorio para leaderboard
  generatePlayer: (rank, region = 'latam', baseRating = 2800) => {
    const names = Leaderboard.NAMES_BY_REGION[region] || Leaderboard.NAMES_BY_REGION.latam;
    const avatars = Leaderboard.AVATARS_BY_REGION[region] || Leaderboard.AVATARS_BY_REGION.latam;
    
    // Rating disminuye con el rank, con variación
    const ratingVariance = Math.floor(Math.random() * 30);
    const rating = Math.max(1200, Math.round(baseRating - (rank - 1) * 25 - ratingVariance));
    
    // Estadísticas basadas en rating
    const skillFactor = rating / 2800;
    const totalGames = Math.floor(50 + Math.random() * 300);
    const winRate = Math.min(85, Math.max(45, 50 + skillFactor * 30 + (Math.random() - 0.5) * 10));
    const wins = Math.round(totalGames * winRate / 100);
    const losses = totalGames - wins;
    
    // Estadísticas adicionales
    const dominoes = Math.floor(wins * (0.3 + Math.random() * 0.2));
    const trancas = Math.floor(wins * (0.05 + Math.random() * 0.1));
    const avgScore = Math.round(15 + skillFactor * 10 + (Math.random() - 0.5) * 5);
    const winStreak = Math.floor(Math.random() * (rating > 2000 ? 15 : 8));
    const maxWinStreak = winStreak + Math.floor(Math.random() * 10);
    
    // Datos de temporada
    const seasonGames = Math.floor(totalGames * (0.3 + Math.random() * 0.3));
    const seasonWins = Math.round(seasonGames * winRate / 100);
    
    return {
      id: `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      rank,
      name: names[Math.floor(Math.random() * names.length)] + (rank > 15 ? Math.floor(Math.random() * 999) : ''),
      avatar: avatars[Math.floor(Math.random() * avatars.length)],
      rating,
      rankInfo: RankSystem.getRank(rating),
      region,
      wins,
      losses,
      winRate: Math.round(winRate),
      dominoes,
      trancas,
      avgScore,
      winStreak,
      maxWinStreak,
      seasonWins,
      seasonGames,
      seasonRank: rank + Math.floor(Math.random() * 10) - 5,
      lastActive: Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
      isOnline: Math.random() > 0.7,
      isPlayer: false,
      isFriend: false
    };
  },
  
  // Generar leaderboard completo
  generateLeaderboard: (type, playerData, options = {}) => {
    const { region = 'latam', friendsList = [], limit: initialLimit = 100 } = options;
    const leaderboard = [];
    
    // Configurar según tipo
    let baseRating = 2800;
    let namePool = Leaderboard.NAMES_BY_REGION[region];
    let limit = initialLimit;
    
    if (type === Leaderboard.TYPES.WEEKLY) {
      baseRating = 2400; // Rankings semanales son más accesibles
    } else if (type === Leaderboard.TYPES.FRIENDS) {
      limit = Math.min(50, friendsList.length + 1);
    }
    
    // Generar jugadores
    for (let i = 0; i < limit; i++) {
      const player = Leaderboard.generatePlayer(i + 1, region, baseRating);
      
      // Para amigos, marcar algunos como amigos
      if (type === Leaderboard.TYPES.FRIENDS && i < friendsList.length) {
        player.isFriend = true;
        player.name = friendsList[i]?.name || player.name;
        player.avatar = friendsList[i]?.avatar || player.avatar;
      }
      
      leaderboard.push(player);
    }
    
    // Insertar al jugador en su posición correcta
    if (playerData) {
      const playerRating = playerData.rating || 1500;
      let insertIndex = leaderboard.findIndex(p => p.rating < playerRating);
      if (insertIndex === -1) insertIndex = leaderboard.length;
      
      const playerEntry = {
        id: playerData.id || 'player_self',
        rank: insertIndex + 1,
        name: playerData.name || 'Tú',
        avatar: playerData.avatar || '😎',
        rating: playerRating,
        rankInfo: RankSystem.getRank(playerRating),
        region: playerData.region || region,
        wins: playerData.wins || 0,
        losses: playerData.losses || 0,
        winRate: playerData.wins ? Math.round((playerData.wins / (playerData.wins + playerData.losses)) * 100) : 0,
        dominoes: playerData.seasonDominoes || 0,
        trancas: playerData.seasonTrancas || 0,
        avgScore: playerData.avgScore || 0,
        winStreak: playerData.currentStreak || 0,
        maxWinStreak: playerData.maxStreak || 0,
        seasonWins: playerData.seasonWins || 0,
        seasonGames: (playerData.seasonWins || 0) + (playerData.seasonLosses || 0),
        seasonRank: insertIndex + 1,
        lastActive: Date.now(),
        isOnline: true,
        isPlayer: true,
        isFriend: false
      };
      
      leaderboard.splice(insertIndex, 0, playerEntry);
      
      // Actualizar ranks
      leaderboard.forEach((p, i) => {
        p.rank = i + 1;
        if (type === Leaderboard.TYPES.SEASON) {
          p.seasonRank = i + 1;
        }
      });
      
      // Limitar tamaño
      if (leaderboard.length > limit) {
        leaderboard.splice(limit);
      }
    }
    
    return leaderboard;
  },
  
  // Obtener jugadores cercanos al usuario
  getNearbyPlayers: (leaderboard, playerId, range = 5) => {
    const playerIndex = leaderboard.findIndex(p => p.isPlayer || p.id === playerId);
    if (playerIndex === -1) return leaderboard.slice(0, range * 2 + 1);
    
    const start = Math.max(0, playerIndex - range);
    const end = Math.min(leaderboard.length, playerIndex + range + 1);
    
    return leaderboard.slice(start, end);
  },
  
  // Estadísticas del leaderboard
  getStats: (leaderboard, playerData) => {
    const playerRank = leaderboard.find(p => p.isPlayer)?.rank || 0;
    const totalPlayers = leaderboard.length;
    const percentile = playerRank > 0 ? Math.round((1 - playerRank / totalPlayers) * 100) : 0;
    const avgRating = Math.round(leaderboard.reduce((sum, p) => sum + p.rating, 0) / totalPlayers);
    
    return {
      playerRank,
      totalPlayers,
      percentile,
      avgRating,
      topTier: leaderboard.filter(p => p.rankInfo.tier === 'legend' || p.rankInfo.tier === 'grandmaster').length,
      activePlayers: leaderboard.filter(p => p.isOnline).length
    };
  }
};

// ============================================================================
// SISTEMA DE MONETIZACIÓN COMPETITIVA (SIN BONIFICACIONES)
// ============================================================================
const MonetizationSystem = {
  // Monedas del juego
  CURRENCIES: {
    COINS: 'coins',       // Moneda premium (comprada con dinero real)
    TOKENS: 'tokens'      // Moneda gratuita (ganada jugando)
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // RECOMPENSAS POR PARTIDA
  // ═══════════════════════════════════════════════════════════════════════════
  MATCH_REWARDS: {
    // Recompensas base
    WIN: { tokens: 25, xp: 50 },
    LOSS: { tokens: 10, xp: 20 },
    
    // Bonificaciones
    DOMINO_BONUS: { tokens: 10 },      // Ganar con dominó
    CAPICUA_BONUS: { tokens: 20 },     // Ganar con capicúa
    PERFECT_GAME: { tokens: 15 },      // Rival no anotó
    COMEBACK_BONUS: { tokens: 15 },    // Remontar 30+ puntos
    STREAK_BONUS: { tokens: 5 },       // Por cada victoria en racha (max 5)
    FIRST_WIN_DAY: { tokens: 25 },     // Primera victoria del día
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // RECOMPENSAS DIARIAS (LOGIN BONUS)
  // ═══════════════════════════════════════════════════════════════════════════
  DAILY_LOGIN: {
    // Día 1-7, se resetea después del día 7
    rewards: [
      { day: 1, tokens: 50, coins: 0 },
      { day: 2, tokens: 75, coins: 0 },
      { day: 3, tokens: 100, coins: 5 },
      { day: 4, tokens: 125, coins: 0 },
      { day: 5, tokens: 150, coins: 10 },
      { day: 6, tokens: 200, coins: 0 },
      { day: 7, tokens: 300, coins: 25 }  // Día 7 es especial
    ]
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // MISIONES DIARIAS
  // ═══════════════════════════════════════════════════════════════════════════
  DAILY_MISSIONS: [
    { id: 'play_3', name: 'Jugador Activo', description: 'Juega 3 partidas', target: 3, type: 'games', reward: { tokens: 30 } },
    { id: 'win_1', name: 'Primera Victoria', description: 'Gana 1 partida', target: 1, type: 'wins', reward: { tokens: 40 } },
    { id: 'win_3', name: 'Racha Ganadora', description: 'Gana 3 partidas', target: 3, type: 'wins', reward: { tokens: 75 } },
    { id: 'domino_1', name: 'Dominador', description: 'Gana 1 partida con dominó', target: 1, type: 'dominos', reward: { tokens: 50 } },
    { id: 'points_100', name: 'Centenario', description: 'Anota 100 puntos en una partida', target: 100, type: 'points', reward: { tokens: 40 } },
    { id: 'streak_3', name: 'En Racha', description: 'Gana 3 partidas seguidas', target: 3, type: 'streak', reward: { tokens: 100 } },
  ],
  
  // Precios de monedas (en USD centavos)
  COIN_PACKS: [
    { id: 'coins_100', coins: 100, price: 99, bonus: 0, popular: false },
    { id: 'coins_500', coins: 500, price: 499, bonus: 0, popular: false },
    { id: 'coins_1200', coins: 1200, price: 999, bonus: 0, popular: true },
    { id: 'coins_2500', coins: 2500, price: 1999, bonus: 0, popular: false },
    { id: 'coins_6500', coins: 6500, price: 4999, bonus: 0, popular: false },
    { id: 'coins_14000', coins: 14000, price: 9999, bonus: 0, popular: false }
  ],
  
  // Categorías de la tienda
  SHOP_CATEGORIES: {
    TILES: 'tiles',           // Diseños de fichas
    BOARDS: 'boards',         // Tableros
    AVATARS: 'avatars',       // Avatares
    EMOTES: 'emotes',         // Emotes/Reacciones
    EFFECTS: 'effects',       // Efectos visuales
    TITLES: 'titles',         // Títulos
    FRAMES: 'frames',         // Marcos de avatar
    BUNDLES: 'bundles'        // Paquetes
  },
  
  // ========== DISEÑOS DE FICHAS ==========
  TILE_DESIGNS: [
    // Gratis
    { id: 'classic_white', name: 'Clásico Blanco', price: 0, currency: 'tokens', rarity: 'common', preview: '⬜' },
    { id: 'classic_ivory', name: 'Marfil Clásico', price: 0, currency: 'tokens', rarity: 'common', preview: '🦴' },
    
    // Tokens (gratis ganando)
    { id: 'obsidian', name: 'Obsidiana', price: 500, currency: 'tokens', rarity: 'uncommon', preview: '⬛' },
    { id: 'jade', name: 'Jade Imperial', price: 750, currency: 'tokens', rarity: 'uncommon', preview: '🟢' },
    { id: 'sapphire', name: 'Zafiro', price: 1000, currency: 'tokens', rarity: 'rare', preview: '🔵' },
    { id: 'ruby', name: 'Rubí', price: 1000, currency: 'tokens', rarity: 'rare', preview: '🔴' },
    { id: 'amethyst', name: 'Amatista', price: 1200, currency: 'tokens', rarity: 'rare', preview: '🟣' },
    
    // Coins (premium)
    { id: 'gold_plated', name: 'Bañado en Oro', price: 150, currency: 'coins', rarity: 'epic', preview: '🥇' },
    { id: 'platinum', name: 'Platino', price: 200, currency: 'coins', rarity: 'epic', preview: '⚪' },
    { id: 'diamond_encrusted', name: 'Diamante', price: 350, currency: 'coins', rarity: 'legendary', preview: '💎' },
    { id: 'holographic', name: 'Holográfico', price: 400, currency: 'coins', rarity: 'legendary', preview: '🌈' },
    { id: 'neon_glow', name: 'Neón Brillante', price: 300, currency: 'coins', rarity: 'epic', preview: '✨' },
    { id: 'carbon_fiber', name: 'Fibra de Carbono', price: 250, currency: 'coins', rarity: 'epic', preview: '🖤' },
    { id: 'marble_luxury', name: 'Mármol de Lujo', price: 200, currency: 'coins', rarity: 'epic', preview: '🗿' },
    { id: 'crystal_clear', name: 'Cristal Puro', price: 450, currency: 'coins', rarity: 'legendary', preview: '💠' },
    { id: 'dragon_scale', name: 'Escamas de Dragón', price: 500, currency: 'coins', rarity: 'legendary', preview: '🐉' },
    { id: 'phoenix_flame', name: 'Llama del Fénix', price: 500, currency: 'coins', rarity: 'legendary', preview: '🔥' }
  ],
  
  // ========== TABLEROS ==========
  BOARD_DESIGNS: [
    { id: 'felt_green', name: 'Fieltro Verde', price: 0, currency: 'tokens', rarity: 'common', color: '#1a4d2e' },
    { id: 'felt_blue', name: 'Fieltro Azul', price: 0, currency: 'tokens', rarity: 'common', color: '#1e3a5f' },
    { id: 'wood_oak', name: 'Roble', price: 300, currency: 'tokens', rarity: 'uncommon', color: '#8b4513' },
    { id: 'wood_mahogany', name: 'Caoba', price: 400, currency: 'tokens', rarity: 'uncommon', color: '#c04000' },
    { id: 'marble_white', name: 'Mármol Blanco', price: 600, currency: 'tokens', rarity: 'rare', color: '#f5f5f5' },
    { id: 'marble_black', name: 'Mármol Negro', price: 600, currency: 'tokens', rarity: 'rare', color: '#1a1a2e' },
    { id: 'velvet_red', name: 'Terciopelo Rojo', price: 150, currency: 'coins', rarity: 'epic', color: '#8b0000' },
    { id: 'velvet_purple', name: 'Terciopelo Púrpura', price: 150, currency: 'coins', rarity: 'epic', color: '#4a0080' },
    { id: 'galaxy', name: 'Galaxia', price: 300, currency: 'coins', rarity: 'legendary', color: '#0a0a2a' },
    { id: 'sunset', name: 'Atardecer', price: 250, currency: 'coins', rarity: 'epic', color: '#ff6b35' },
    { id: 'ocean_depth', name: 'Profundidad Marina', price: 300, currency: 'coins', rarity: 'legendary', color: '#006994' },
    { id: 'aurora', name: 'Aurora Boreal', price: 350, currency: 'coins', rarity: 'legendary', color: '#00ff87' }
  ],
  
  // ========== AVATARES ==========
  AVATARS: [
    // Gratis
    { id: 'default_1', name: 'Jugador', emoji: '😎', price: 0, currency: 'tokens', rarity: 'common' },
    { id: 'default_2', name: 'Sonriente', emoji: '😊', price: 0, currency: 'tokens', rarity: 'common' },
    { id: 'default_3', name: 'Cool', emoji: '🤓', price: 0, currency: 'tokens', rarity: 'common' },
    
    // Tokens
    { id: 'crown', name: 'Rey', emoji: '👑', price: 200, currency: 'tokens', rarity: 'uncommon' },
    { id: 'star', name: 'Estrella', emoji: '⭐', price: 200, currency: 'tokens', rarity: 'uncommon' },
    { id: 'fire', name: 'En Llamas', emoji: '🔥', price: 300, currency: 'tokens', rarity: 'rare' },
    { id: 'lightning', name: 'Rayo', emoji: '⚡', price: 300, currency: 'tokens', rarity: 'rare' },
    { id: 'diamond', name: 'Diamante', emoji: '💎', price: 500, currency: 'tokens', rarity: 'rare' },
    
    // Coins
    { id: 'dragon', name: 'Dragón', emoji: '🐉', price: 100, currency: 'coins', rarity: 'epic' },
    { id: 'phoenix', name: 'Fénix', emoji: '🦅', price: 100, currency: 'coins', rarity: 'epic' },
    { id: 'unicorn', name: 'Unicornio', emoji: '🦄', price: 150, currency: 'coins', rarity: 'epic' },
    { id: 'alien', name: 'Alienígena', emoji: '👽', price: 150, currency: 'coins', rarity: 'epic' },
    { id: 'robot', name: 'Robot', emoji: '🤖', price: 200, currency: 'coins', rarity: 'legendary' },
    { id: 'skull', name: 'Calavera', emoji: '💀', price: 200, currency: 'coins', rarity: 'legendary' },
    { id: 'ghost', name: 'Fantasma', emoji: '👻', price: 200, currency: 'coins', rarity: 'legendary' }
  ],
  
  // ========== EMOTES / REACCIONES ==========
  EMOTES: [
    // Gratis
    { id: 'thumbs_up', name: 'Bien Jugado', emoji: '👍', price: 0, currency: 'tokens', rarity: 'common' },
    { id: 'thumbs_down', name: 'Mala Suerte', emoji: '👎', price: 0, currency: 'tokens', rarity: 'common' },
    { id: 'clap', name: 'Aplausos', emoji: '👏', price: 0, currency: 'tokens', rarity: 'common' },
    { id: 'thinking', name: 'Pensando', emoji: '🤔', price: 0, currency: 'tokens', rarity: 'common' },
    
    // Tokens
    { id: 'laugh', name: 'Risa', emoji: '😂', price: 100, currency: 'tokens', rarity: 'uncommon' },
    { id: 'cry', name: 'Llanto', emoji: '😭', price: 100, currency: 'tokens', rarity: 'uncommon' },
    { id: 'angry', name: 'Enojado', emoji: '😤', price: 100, currency: 'tokens', rarity: 'uncommon' },
    { id: 'shock', name: 'Sorpresa', emoji: '😱', price: 150, currency: 'tokens', rarity: 'rare' },
    { id: 'sleep', name: 'Aburrido', emoji: '😴', price: 150, currency: 'tokens', rarity: 'rare' },
    
    // Coins
    { id: 'flex', name: 'Músculo', emoji: '💪', price: 50, currency: 'coins', rarity: 'epic' },
    { id: 'money', name: 'Dinero', emoji: '💰', price: 50, currency: 'coins', rarity: 'epic' },
    { id: 'heart', name: 'Corazón', emoji: '❤️', price: 50, currency: 'coins', rarity: 'epic' },
    { id: 'mind_blown', name: 'Mente Explotada', emoji: '🤯', price: 75, currency: 'coins', rarity: 'legendary' },
    { id: 'trophy', name: 'Trofeo', emoji: '🏆', price: 75, currency: 'coins', rarity: 'legendary' }
  ],
  
  // ========== EFECTOS VISUALES ==========
  EFFECTS: [
    { id: 'sparkle', name: 'Destellos', price: 200, currency: 'tokens', rarity: 'uncommon', type: 'play' },
    { id: 'smoke', name: 'Humo', price: 300, currency: 'tokens', rarity: 'rare', type: 'play' },
    { id: 'confetti', name: 'Confeti', price: 100, currency: 'coins', rarity: 'epic', type: 'win' },
    { id: 'fireworks', name: 'Fuegos Artificiales', price: 150, currency: 'coins', rarity: 'epic', type: 'win' },
    { id: 'lightning_strike', name: 'Rayo', price: 150, currency: 'coins', rarity: 'epic', type: 'play' },
    { id: 'fire_trail', name: 'Estela de Fuego', price: 200, currency: 'coins', rarity: 'legendary', type: 'play' },
    { id: 'ice_shatter', name: 'Explosión de Hielo', price: 200, currency: 'coins', rarity: 'legendary', type: 'play' },
    { id: 'gold_shower', name: 'Lluvia Dorada', price: 250, currency: 'coins', rarity: 'legendary', type: 'win' }
  ],
  
  // ========== TÍTULOS ==========
  TITLES: [
    // Gratis (desbloqueables por logros)
    { id: 'novato', name: 'Novato', price: 0, currency: 'tokens', rarity: 'common', requirement: 'Jugar 1 partida' },
    { id: 'jugador', name: 'Jugador', price: 0, currency: 'tokens', rarity: 'common', requirement: 'Jugar 10 partidas' },
    { id: 'veterano', name: 'Veterano', price: 0, currency: 'tokens', rarity: 'uncommon', requirement: 'Jugar 100 partidas' },
    { id: 'experto', name: 'Experto', price: 0, currency: 'tokens', rarity: 'rare', requirement: 'Llegar a Oro' },
    
    // Compra con tokens
    { id: 'estratega', name: 'El Estratega', price: 500, currency: 'tokens', rarity: 'rare' },
    { id: 'calculador', name: 'El Calculador', price: 500, currency: 'tokens', rarity: 'rare' },
    { id: 'trancador', name: 'El Trancador', price: 750, currency: 'tokens', rarity: 'rare' },
    { id: 'dominador', name: 'El Dominador', price: 1000, currency: 'tokens', rarity: 'epic' },
    
    // Compra con coins
    { id: 'leyenda', name: 'La Leyenda', price: 150, currency: 'coins', rarity: 'epic' },
    { id: 'maestro', name: 'El Maestro', price: 150, currency: 'coins', rarity: 'epic' },
    { id: 'invicto', name: 'El Invicto', price: 200, currency: 'coins', rarity: 'legendary' },
    { id: 'imparable', name: 'El Imparable', price: 200, currency: 'coins', rarity: 'legendary' },
    { id: 'campeon', name: 'El Campeón', price: 250, currency: 'coins', rarity: 'legendary' },
    { id: 'titan', name: 'El Titán', price: 300, currency: 'coins', rarity: 'legendary' }
  ],
  
  // ========== MARCOS DE AVATAR ==========
  FRAMES: [
    { id: 'none', name: 'Sin Marco', price: 0, currency: 'tokens', rarity: 'common', color: 'transparent' },
    { id: 'bronze', name: 'Bronce', price: 0, currency: 'tokens', rarity: 'common', color: '#cd7f32' },
    { id: 'silver', name: 'Plata', price: 200, currency: 'tokens', rarity: 'uncommon', color: '#c0c0c0' },
    { id: 'gold', name: 'Oro', price: 400, currency: 'tokens', rarity: 'rare', color: '#ffd700' },
    { id: 'platinum', name: 'Platino', price: 100, currency: 'coins', rarity: 'epic', color: '#e5e4e2' },
    { id: 'diamond', name: 'Diamante', price: 150, currency: 'coins', rarity: 'epic', color: '#b9f2ff' },
    { id: 'ruby', name: 'Rubí', price: 200, currency: 'coins', rarity: 'legendary', color: '#e0115f' },
    { id: 'emerald', name: 'Esmeralda', price: 200, currency: 'coins', rarity: 'legendary', color: '#50c878' },
    { id: 'animated_fire', name: 'Fuego Animado', price: 300, currency: 'coins', rarity: 'legendary', color: '#ff4500', animated: true },
    { id: 'animated_ice', name: 'Hielo Animado', price: 300, currency: 'coins', rarity: 'legendary', color: '#00bfff', animated: true },
    { id: 'animated_rainbow', name: 'Arcoíris Animado', price: 400, currency: 'coins', rarity: 'legendary', color: 'rainbow', animated: true }
  ],
  
  // ========== PASE DE TEMPORADA ==========
  SEASON_PASS: {
    price: 999, // $9.99 USD
    duration: 90, // días
    name: 'Pase de Temporada',
    description: 'Desbloquea recompensas cosméticas exclusivas durante toda la temporada',
    tiers: 50, // Niveles del pase
    xpPerTier: 1000,
    
    // Recompensas del pase GRATIS
    FREE_REWARDS: {
      5: { type: 'tokens', amount: 100 },
      10: { type: 'avatar', id: 'season_basic' },
      15: { type: 'tokens', amount: 150 },
      20: { type: 'emote', id: 'season_emote_1' },
      25: { type: 'tokens', amount: 200 },
      30: { type: 'title', id: 'season_title_free' },
      35: { type: 'tokens', amount: 250 },
      40: { type: 'frame', id: 'season_frame_basic' },
      45: { type: 'tokens', amount: 300 },
      50: { type: 'tile_design', id: 'season_tile_free' }
    },
    
    // Recompensas del pase PREMIUM
    PREMIUM_REWARDS: {
      1: { type: 'tokens', amount: 50 },
      2: { type: 'emote', id: 'premium_emote_1' },
      3: { type: 'tokens', amount: 75 },
      4: { type: 'avatar', id: 'premium_avatar_1' },
      5: { type: 'tokens', amount: 100 },
      6: { type: 'effect', id: 'premium_effect_1' },
      7: { type: 'tokens', amount: 100 },
      8: { type: 'frame', id: 'premium_frame_1' },
      9: { type: 'tokens', amount: 125 },
      10: { type: 'tile_design', id: 'premium_tiles_1' },
      // ... más recompensas cada nivel
      15: { type: 'board', id: 'premium_board_1' },
      20: { type: 'title', id: 'premium_title_1' },
      25: { type: 'bundle', id: 'premium_bundle_1' },
      30: { type: 'avatar', id: 'premium_avatar_2' },
      35: { type: 'effect', id: 'premium_effect_2' },
      40: { type: 'tile_design', id: 'premium_tiles_2' },
      45: { type: 'frame', id: 'premium_frame_animated' },
      50: { type: 'legendary_bundle', id: 'season_legendary_set' }
    }
  },
  
  // ========== TORNEOS DE ENTRADA ==========
  TOURNAMENTS: {
    // Torneos diarios
    DAILY: [
      { id: 'daily_free', name: 'Torneo Diario Gratis', entryFee: 0, currency: 'tokens', prizePool: 500, prizeType: 'tokens', maxPlayers: 32, format: 'single_elimination' },
      { id: 'daily_token', name: 'Torneo Diario Token', entryFee: 50, currency: 'tokens', prizePool: 1500, prizeType: 'tokens', maxPlayers: 32, format: 'single_elimination' },
      { id: 'daily_premium', name: 'Torneo Diario Premium', entryFee: 25, currency: 'coins', prizePool: 100, prizeType: 'coins', maxPlayers: 16, format: 'single_elimination' }
    ],
    
    // Torneos semanales
    WEEKLY: [
      { id: 'weekly_major', name: 'Torneo Semanal Mayor', entryFee: 100, currency: 'tokens', prizePool: 5000, prizeType: 'tokens', maxPlayers: 64, format: 'double_elimination' },
      { id: 'weekly_premium', name: 'Torneo Semanal Premium', entryFee: 50, currency: 'coins', prizePool: 250, prizeType: 'coins', maxPlayers: 32, format: 'double_elimination' }
    ],
    
    // Torneos especiales
    SPECIAL: [
      { id: 'monthly_championship', name: 'Campeonato Mensual', entryFee: 200, currency: 'coins', prizePool: 1000, prizeType: 'coins', maxPlayers: 128, format: 'swiss', rounds: 7 },
      { id: 'season_finals', name: 'Finales de Temporada', entryFee: 0, currency: 'tokens', prizePool: 'exclusive_rewards', prizeType: 'mixed', maxPlayers: 64, format: 'double_elimination', requirement: 'top_1000_season' }
    ],
    
    // Distribución de premios (porcentaje del prize pool)
    PRIZE_DISTRIBUTION: {
      single_elimination: { 1: 50, 2: 25, 3: 15, 4: 10 },
      double_elimination: { 1: 40, 2: 25, 3: 15, 4: 10, 5: 5, 6: 5 },
      swiss: { 1: 30, 2: 20, 3: 15, 4: 12, 5: 8, 6: 6, 7: 5, 8: 4 }
    }
  },
  
  // ========== BUNDLES / PAQUETES ==========
  BUNDLES: [
    {
      id: 'starter_pack',
      name: 'Pack de Inicio',
      description: '¡Comienza con estilo!',
      price: 499, // $4.99
      currency: 'usd',
      contents: [
        { type: 'coins', amount: 500 },
        { type: 'tile_design', id: 'obsidian' },
        { type: 'avatar', id: 'crown' },
        { type: 'frame', id: 'gold' }
      ],
      savings: '30%',
      oneTimePurchase: true
    },
    {
      id: 'pro_pack',
      name: 'Pack Pro',
      description: 'Para jugadores serios',
      price: 1499, // $14.99
      currency: 'usd',
      contents: [
        { type: 'coins', amount: 1500 },
        { type: 'tile_design', id: 'gold_plated' },
        { type: 'board', id: 'velvet_red' },
        { type: 'effect', id: 'fireworks' },
        { type: 'title', id: 'dominador' }
      ],
      savings: '40%',
      oneTimePurchase: true
    },
    {
      id: 'legend_pack',
      name: 'Pack Legendario',
      description: 'La colección definitiva',
      price: 4999, // $49.99
      currency: 'usd',
      contents: [
        { type: 'coins', amount: 6000 },
        { type: 'tile_design', id: 'dragon_scale' },
        { type: 'tile_design', id: 'phoenix_flame' },
        { type: 'board', id: 'galaxy' },
        { type: 'effect', id: 'gold_shower' },
        { type: 'frame', id: 'animated_rainbow' },
        { type: 'title', id: 'titan' },
        { type: 'avatar', id: 'dragon' }
      ],
      savings: '50%',
      oneTimePurchase: true
    }
  ],
  
  // Colores de rareza
  RARITY_COLORS: {
    common: { bg: '#6b7280', text: '#ffffff', name: 'Común' },
    uncommon: { bg: '#22c55e', text: '#ffffff', name: 'Poco Común' },
    rare: { bg: '#3b82f6', text: '#ffffff', name: 'Raro' },
    epic: { bg: '#a855f7', text: '#ffffff', name: 'Épico' },
    legendary: { bg: 'linear-gradient(135deg, #fbbf24, #f59e0b)', text: '#000000', name: 'Legendario' }
  },
  
  // Función para formatear precio
  formatPrice: (price, currency) => {
    if (currency === 'usd') return `$${(price / 100).toFixed(2)}`;
    if (currency === 'coins') return `${price} 💎`;
    if (currency === 'tokens') return `${price} 🪙`;
    return price;
  },
  
  // Calcular tokens ganados por partida (SIN BONIFICACIONES)
  calculateTokensEarned: (matchResult) => {
    let tokens = 0;
    
    // Base por participar (solo ranked)
    tokens += 10;
    
    // Victoria
    if (matchResult.won) {
      tokens += 25;
    }
    
    // Dominó
    if (matchResult.endType === 'domino' && matchResult.closedByPlayer) {
      tokens += 15;
    }
    
    // Tranca ganada
    if (matchResult.endType === 'tranca' && matchResult.won) {
      tokens += 10;
    }
    
    // Bonus por racha (máximo 5 bonus)
    const streakBonus = Math.min(5, matchResult.winStreak || 0) * 5;
    tokens += streakBonus;
    
    return tokens;
  },
  
  // XP de pase de temporada ganado por partida
  calculateSeasonXP: (matchResult) => {
    let xp = 0;
    
    // Base por completar partida
    xp += 50;
    
    // Victoria
    if (matchResult.won) {
      xp += 100;
    }
    
    // Primera victoria del día
    if (matchResult.isFirstWinOfDay) {
      xp += 150;
    }
    
    // Dominó
    if (matchResult.endType === 'domino' && matchResult.closedByPlayer) {
      xp += 50;
    }
    
    return xp;
  }
};

// ============================================================================
// SISTEMA DE AMIGOS
// ============================================================================
const FriendsSystem = {
  // Estados de solicitud de amistad
  REQUEST_STATUS: {
    PENDING: 'pending',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected'
  },
  
  // Estado de conexión del jugador
  ONLINE_STATUS: {
    ONLINE: 'online',
    OFFLINE: 'offline',
    IN_GAME: 'in_game',
    AWAY: 'away'
  },
  
  // Límites
  MAX_FRIENDS: 100,
  MAX_PENDING_REQUESTS: 50,
  
  // Generar amigos de ejemplo (para demo)
  generateDemoFriends: () => {
    const names = [
      'DominoMaster', 'ElCubano', 'LaReina', 'TrankeroX', 'CapicuaKing',
      'DobleNueve', 'FichaLoca', 'ElProfesional', 'MesaVIP', 'PartidaRápida',
      'JugadorPro', 'ElInvicto', 'DominoLegend', 'CampeonMundial', 'ElEstratega'
    ];
    const avatars = ['😎', '🤓', '😊', '🔥', '⭐', '👑', '💎', '🎯', '🏆', '🎮'];
    const tiers = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master'];
    const statuses = ['online', 'offline', 'in_game', 'offline', 'offline', 'online'];
    
    return names.slice(0, 8).map((name, i) => ({
      id: `friend_${i}_${Date.now()}`,
      name: name,
      avatar: avatars[i % avatars.length],
      rating: 1000 + Math.floor(Math.random() * 1500),
      tier: tiers[Math.floor(i / 2) % tiers.length],
      status: statuses[i % statuses.length],
      lastSeen: Date.now() - Math.floor(Math.random() * 86400000 * 7),
      gamesPlayed: Math.floor(50 + Math.random() * 500),
      winRate: Math.floor(40 + Math.random() * 30),
      addedAt: Date.now() - Math.floor(Math.random() * 86400000 * 30)
    }));
  },
  
  // Generar solicitudes de ejemplo
  generateDemoRequests: () => {
    const names = ['NuevoRetador', 'ProPlayer99', 'ElMejor2024'];
    const avatars = ['🎲', '🃏', '🎰'];
    
    return names.map((name, i) => ({
      id: `request_${i}_${Date.now()}`,
      name: name,
      avatar: avatars[i],
      rating: 1200 + Math.floor(Math.random() * 800),
      tier: ['silver', 'gold', 'platinum'][i],
      sentAt: Date.now() - Math.floor(Math.random() * 86400000 * 3),
      message: ['¡Juguemos!', 'Buena partida, agrégame', ''][i]
    }));
  }
};

// ============================================================================
// SISTEMA DE DECAY (Inactividad)
// ============================================================================
const DecaySystem = {
  // Configuración
  DECAY_THRESHOLD_RATING: 2400, // Solo aplica a Maestro+
  DECAY_DAYS_GRACE: 14, // Días sin jugar antes de empezar decay
  DECAY_PER_WEEK: 50, // MMR perdido por semana de inactividad
  DECAY_MIN_RATING: 2400, // No baja de Maestro por decay
  
  // Calcular decay
  calculateDecay: (player) => {
    if (player.rating < DecaySystem.DECAY_THRESHOLD_RATING) {
      return { decay: 0, daysUntilDecay: null };
    }
    
    const lastGameDate = new Date(player.lastGameDate || Date.now());
    const daysSinceLastGame = Math.floor((Date.now() - lastGameDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastGame <= DecaySystem.DECAY_DAYS_GRACE) {
      return {
        decay: 0,
        daysUntilDecay: DecaySystem.DECAY_DAYS_GRACE - daysSinceLastGame
      };
    }
    
    const weeksInactive = Math.floor((daysSinceLastGame - DecaySystem.DECAY_DAYS_GRACE) / 7);
    const totalDecay = weeksInactive * DecaySystem.DECAY_PER_WEEK;
    const newRating = Math.max(DecaySystem.DECAY_MIN_RATING, player.rating - totalDecay);
    
    return {
      decay: player.rating - newRating,
      weeksInactive,
      newRating,
      daysUntilNextDecay: 7 - ((daysSinceLastGame - DecaySystem.DECAY_DAYS_GRACE) % 7)
    };
  },
  
  // Aplicar decay
  applyDecay: (player) => {
    const decayInfo = DecaySystem.calculateDecay(player);
    if (decayInfo.decay > 0) {
      return {
        ...player,
        rating: decayInfo.newRating,
        decayApplied: decayInfo.decay
      };
    }
    return player;
  }
};

// ============================================================================
// PERFIL DE JUGADOR RANKED
// ============================================================================
const createDefaultPlayerProfile = () => ({
  // Identificación
  id: `player_${Date.now()}`,
  name: 'Jugador',
  
  // Rating Glicko-2
  rating: 1500,
  rd: 350, // Rating Deviation (incertidumbre)
  volatility: 0.06,
  
  // Rango visible
  get rank() { return RankSystem.getRank(this.rating); },
  peakRating: 1500,
  
  // Placement
  isInPlacement: true,
  placementGames: 0,
  placementWins: 0,
  
  // Estadísticas de temporada
  seasonId: 1,
  seasonWins: 0,
  seasonLosses: 0,
  seasonDominoes: 0,
  seasonTrancas: 0,
  
  // Estadísticas totales
  totalGames: 0,
  wins: 0,
  losses: 0,
  stompWins: 0, // Victorias aplastantes (para detección de smurf)
  
  // Fechas
  createdAt: Date.now(),
  lastGameDate: Date.now(),
  
  // Historial
  matchHistory: [],
  
  // Flags de protección
  smurfScore: 0,
  boostingWarnings: 0
});

// ============================================================================
// DETECCIÓN DE DISPOSITIVO Y RENDIMIENTO
// ============================================================================
const DeviceDetection = {
  // Detectar si es dispositivo de gama baja
  isLowEndDevice: () => {
    if (typeof navigator === 'undefined') return false;
    const memory = navigator.deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;
    return memory <= 2 || cores <= 2;
  },
  
  // Detectar orientación
  isPortrait: () => {
    if (typeof window === 'undefined') return true;
    return window.innerHeight > window.innerWidth;
  },
  
  // Detectar si es móvil
  isMobile: () => {
    if (typeof navigator === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },
  
  // Detectar si soporta touch
  hasTouch: () => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },
  
  // Obtener configuración de rendimiento
  getPerformanceConfig: () => {
    const isLowEnd = DeviceDetection.isLowEndDevice();
    return {
      useReducedMotion: isLowEnd || (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches),
      animationDuration: isLowEnd ? 150 : 300,
      enableParticles: !isLowEnd,
      enableShadows: !isLowEnd,
      enableBlur: !isLowEnd,
      maxAnimatedElements: isLowEnd ? 5 : 20
    };
  }
};

// ============================================================================
// HOOK: useGesture - Gestor de gestos robusto para móvil
// Distingue entre scroll, tap, drag y long-press
// ============================================================================
const useGesture = (elementRef, callbacks = {}) => {
  const {
    onDragStart,
    onDragMove,
    onDragEnd,
    onTap,
    onDoubleTap,
    onLongPress,
    dragThreshold = 10,      // Mínimo movimiento para considerar drag
    longPressDelay = 400,    // ms para long press
    doubleTapDelay = 300     // ms entre taps para doble tap
  } = callbacks;
  
  const stateRef = useRef({
    isDragging: false,
    startPos: { x: 0, y: 0 },
    currentPos: { x: 0, y: 0 },
    startTime: 0,
    lastTapTime: 0,
    longPressTimer: null,
    rafId: null,
    touchId: null,
    velocity: { x: 0, y: 0 },
    lastMoveTime: 0
  });
  
  // Limpiar timers
  const clearTimers = useCallback(() => {
    const state = stateRef.current;
    if (state.longPressTimer) {
      clearTimeout(state.longPressTimer);
      state.longPressTimer = null;
    }
    if (state.rafId) {
      cancelAnimationFrame(state.rafId);
      state.rafId = null;
    }
  }, []);
  
  // Handle touch start
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    const state = stateRef.current;
    
    // Guardar estado inicial
    state.touchId = touch.identifier;
    state.startPos = { x: touch.clientX, y: touch.clientY };
    state.currentPos = { x: touch.clientX, y: touch.clientY };
    state.startTime = Date.now();
    state.isDragging = false;
    state.velocity = { x: 0, y: 0 };
    state.lastMoveTime = Date.now();
    
    // Configurar long press
    if (onLongPress) {
      state.longPressTimer = setTimeout(() => {
        if (!state.isDragging) {
          onLongPress({ x: state.startPos.x, y: state.startPos.y });
        }
      }, longPressDelay);
    }
  }, [onLongPress, longPressDelay]);
  
  // Handle touch move
  const handleTouchMove = useCallback((e) => {
    const state = stateRef.current;
    const touch = Array.from(e.touches).find(t => t.identifier === state.touchId);
    if (!touch) return;
    
    const now = Date.now();
    const dt = now - state.lastMoveTime;
    
    // Calcular velocidad
    if (dt > 0) {
      state.velocity = {
        x: (touch.clientX - state.currentPos.x) / dt,
        y: (touch.clientY - state.currentPos.y) / dt
      };
    }
    
    state.currentPos = { x: touch.clientX, y: touch.clientY };
    state.lastMoveTime = now;
    
    // Calcular distancia desde inicio
    const dx = touch.clientX - state.startPos.x;
    const dy = touch.clientY - state.startPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Verificar si cruza el umbral de drag
    if (!state.isDragging && distance > dragThreshold) {
      state.isDragging = true;
      clearTimers(); // Cancelar long press
      
      if (onDragStart) {
        onDragStart({
          x: touch.clientX,
          y: touch.clientY,
          startX: state.startPos.x,
          startY: state.startPos.y,
          direction: Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical'
        });
      }
    }
    
    // Emitir evento de movimiento
    if (state.isDragging && onDragMove) {
      // Usar RAF para throttle
      if (state.rafId) cancelAnimationFrame(state.rafId);
      
      state.rafId = requestAnimationFrame(() => {
        onDragMove({
          x: touch.clientX,
          y: touch.clientY,
          deltaX: dx,
          deltaY: dy,
          velocityX: state.velocity.x,
          velocityY: state.velocity.y
        });
      });
    }
  }, [onDragStart, onDragMove, dragThreshold, clearTimers]);
  
  // Handle touch end
  const handleTouchEnd = useCallback((e) => {
    const state = stateRef.current;
    clearTimers();
    
    const now = Date.now();
    const duration = now - state.startTime;
    
    if (state.isDragging) {
      // Fin del drag
      if (onDragEnd) {
        onDragEnd({
          x: state.currentPos.x,
          y: state.currentPos.y,
          startX: state.startPos.x,
          startY: state.startPos.y,
          velocityX: state.velocity.x,
          velocityY: state.velocity.y,
          duration
        });
      }
    } else if (duration < 300) {
      // Tap corto
      if (now - state.lastTapTime < doubleTapDelay && onDoubleTap) {
        onDoubleTap({ x: state.startPos.x, y: state.startPos.y });
        state.lastTapTime = 0;
      } else {
        if (onTap) {
          onTap({ x: state.startPos.x, y: state.startPos.y });
        }
        state.lastTapTime = now;
      }
    }
    
    state.isDragging = false;
    state.touchId = null;
  }, [onDragEnd, onTap, onDoubleTap, doubleTapDelay, clearTimers]);
  
  // Handle touch cancel
  const handleTouchCancel = useCallback(() => {
    clearTimers();
    stateRef.current.isDragging = false;
    stateRef.current.touchId = null;
  }, [clearTimers]);
  
  // Registrar eventos
  useEffect(() => {
    const element = elementRef?.current;
    if (!element) return;
    
    const options = { passive: false };
    
    element.addEventListener('touchstart', handleTouchStart, options);
    element.addEventListener('touchmove', handleTouchMove, options);
    element.addEventListener('touchend', handleTouchEnd, options);
    element.addEventListener('touchcancel', handleTouchCancel, options);
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchCancel);
      clearTimers();
    };
  }, [elementRef, handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel, clearTimers]);
  
  return {
    isDragging: stateRef.current.isDragging
  };
};

// ============================================================================
// HOOK: useOrientation - Detectar y reaccionar a cambios de orientación
// ============================================================================
const useOrientation = () => {
  const [orientation, setOrientation] = useState(() => ({
    isPortrait: DeviceDetection.isPortrait(),
    angle: typeof window !== 'undefined' ? window.screen?.orientation?.angle || 0 : 0
  }));
  
  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation({
        isPortrait: DeviceDetection.isPortrait(),
        angle: window.screen?.orientation?.angle || 0
      });
    };
    
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);
  
  return orientation;
};

// ============================================================================
// CSS Animations y Estilos Móviles Optimizados para Android
// ============================================================================
const GlobalStyles = () => (
  <style>{`
    /* ============================================
       RESET Y BASE - Optimizado para Android
       ============================================ */
    * {
      -webkit-tap-highlight-color: transparent;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      user-select: none;
      box-sizing: border-box;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    html {
      /* Viewport fix para Android */
      height: 100%;
      height: -webkit-fill-available;
    }
    
    body {
      height: 100%;
      min-height: 100vh;
      min-height: -webkit-fill-available;
      margin: 0;
      padding: 0;
      overflow: hidden;
      position: fixed;
      width: 100%;
      /* Prevenir pull-to-refresh en Android */
      overscroll-behavior-y: contain;
    }
    
    #root {
      height: 100%;
      width: 100%;
      height: 100dvh;
      height: -webkit-fill-available;
      overflow: hidden;
      position: fixed;
      inset: 0;
      touch-action: manipulation;
      overscroll-behavior: none;
      background: #0d1117;
      /* Forzar capa de composición GPU */
      transform: translateZ(0);
      -webkit-transform: translateZ(0);
      contain: layout style paint;
    }
    
    /* Prevenir zoom en inputs iOS/Android */
    input, select, textarea, button {
      font-size: 16px !important;
      touch-action: manipulation;
    }
    
    /* ============================================
       GPU ACCELERATION - Capas de composición
       ============================================ */
    .gpu-layer {
      transform: translate3d(0, 0, 0);
      -webkit-transform: translate3d(0, 0, 0);
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      perspective: 1000px;
      -webkit-perspective: 1000px;
    }
    
    /* Solo usar will-change cuando es necesario */
    .will-animate {
      will-change: transform, opacity;
    }
    
    .will-animate-transform {
      will-change: transform;
    }
    
    /* Contenedor de contenido aislado */
    .contain-paint {
      contain: paint;
    }
    
    .contain-layout {
      contain: layout;
    }
    
    .contain-strict {
      contain: strict;
    }
    
    /* ============================================
       SAFE AREAS - iOS/Android notch/punch-hole
       ============================================ */
    .safe-top { 
      padding-top: max(env(safe-area-inset-top, 0px), 8px); 
    }
    .safe-bottom { 
      padding-bottom: max(env(safe-area-inset-bottom, 0px), 8px);
    }
    .safe-left { 
      padding-left: env(safe-area-inset-left, 0px);
    }
    .safe-right { 
      padding-right: env(safe-area-inset-right, 0px);
    }
    .safe-all { 
      padding: max(env(safe-area-inset-top, 0px), 8px) 
               env(safe-area-inset-right, 0px) 
               max(env(safe-area-inset-bottom, 0px), 8px) 
               env(safe-area-inset-left, 0px);
    }
    
    /* ============================================
       TOUCH FEEDBACK - 60fps optimizado
       ============================================ */
    .touch-feedback {
      /* Usar transform para feedback, no cambiar layout */
      transform: translate3d(0, 0, 0) scale(1);
      -webkit-transform: translate3d(0, 0, 0) scale(1);
      transition: transform 80ms ease-out, opacity 80ms ease-out;
    }
    
    .touch-feedback:active {
      transform: translate3d(0, 0, 0) scale(0.96);
      -webkit-transform: translate3d(0, 0, 0) scale(0.96);
      opacity: 0.85;
    }
    
    /* Feedback más sutil para dispositivos lentos */
    @media (prefers-reduced-motion: reduce) {
      .touch-feedback {
        transition: opacity 50ms ease-out;
      }
      .touch-feedback:active {
        transform: none;
        opacity: 0.7;
      }
    }
    
    /* ============================================
       DRAG & DROP - Prevenir conflictos con scroll
       ============================================ */
    .draggable-item {
      touch-action: none; /* Previene scroll durante drag */
      -webkit-user-drag: none;
      user-drag: none;
    }
    
    .drag-container {
      touch-action: pan-y; /* Permite scroll vertical pero no horizontal */
      overscroll-behavior: contain;
    }
    
    .no-scroll-during-drag {
      touch-action: none;
      overflow: hidden !important;
    }
    
    /* Elemento siendo arrastrado */
    .dragging {
      position: fixed;
      z-index: 9999;
      pointer-events: none;
      transform: translate3d(0, 0, 0);
      will-change: transform;
    }
    
    /* ============================================
       SCROLL CONTAINERS - Nativo optimizado
       ============================================ */
    .mobile-scroll {
      overflow-y: auto;
      overflow-x: hidden;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior-y: contain;
      scrollbar-width: thin;
      scrollbar-color: rgba(247,179,43,0.3) transparent;
      /* GPU layer para scroll suave */
      transform: translateZ(0);
    }
    
    .mobile-scroll::-webkit-scrollbar { width: 4px; }
    .mobile-scroll::-webkit-scrollbar-track { background: transparent; }
    .mobile-scroll::-webkit-scrollbar-thumb { 
      background: rgba(247,179,43,0.3); 
      border-radius: 4px; 
    }
    
    /* Scroll horizontal para fichas con snap */
    .tile-scroll {
      display: flex;
      overflow-x: auto;
      overflow-y: hidden;
      scroll-snap-type: x mandatory;
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
      gap: 6px;
      padding: 4px;
      /* Evitar scroll fantasma */
      overscroll-behavior-x: contain;
    }
    
    .tile-scroll-item {
      scroll-snap-align: center;
      flex-shrink: 0;
    }
    
    /* Ocultar scrollbar pero mantener funcionalidad */
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
    
    /* ============================================
       ANIMACIONES GPU-ACELERADAS
       Usando transform: translate3d para composición
       ============================================ */
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    
    @keyframes float-gpu {
      0%, 100% { transform: translate3d(0, 0, 0); }
      50% { transform: translate3d(0, -5px, 0); }
    }
    
    @keyframes slide-up-gpu {
      from { transform: translate3d(0, 20px, 0); opacity: 0; }
      to { transform: translate3d(0, 0, 0); opacity: 1; }
    }
    
    @keyframes slide-down-gpu {
      from { transform: translate3d(0, -20px, 0); opacity: 0; }
      to { transform: translate3d(0, 0, 0); opacity: 1; }
    }
    
    @keyframes pop-in-gpu {
      0% { transform: translate3d(0, 0, 0) scale(0.8); opacity: 0; }
      60% { transform: translate3d(0, 0, 0) scale(1.05); }
      100% { transform: translate3d(0, 0, 0) scale(1); opacity: 1; }
    }
    
    @keyframes shake-gpu {
      0%, 100% { transform: translate3d(0, 0, 0); }
      20% { transform: translate3d(-4px, 0, 0); }
      40% { transform: translate3d(4px, 0, 0); }
      60% { transform: translate3d(-4px, 0, 0); }
      80% { transform: translate3d(4px, 0, 0); }
    }
    
    @keyframes pulse-scale {
      0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
      50% { transform: translate3d(0, 0, 0) scale(1.05); }
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    @keyframes slideDown {
      from { 
        opacity: 0; 
        transform: translateX(-50%) translateY(-30px); 
      }
      to { 
        opacity: 1; 
        transform: translateX(-50%) translateY(0); 
      }
    }
    
    @keyframes fade-in-gpu {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes tile-fly-gpu {
      0% { 
        transform: translate3d(var(--start-x, 0), var(--start-y, 0), 0) scale(1); 
        opacity: 1;
      }
      50% { 
        transform: translate3d(
          calc((var(--start-x, 0) + var(--end-x, 0)) / 2), 
          calc((var(--start-y, 0) + var(--end-y, 0)) / 2 - 30px), 
          0
        ) scale(1.15); 
        opacity: 1;
      }
      100% { 
        transform: translate3d(var(--end-x, 0), var(--end-y, 0), 0) scale(1); 
        opacity: 0;
      }
    }
    
    /* Clases de animación */
    .animate-float { animation: float-gpu 3s ease-in-out infinite; }
    .animate-slide-up { animation: slide-up-gpu 200ms ease-out forwards; }
    .animate-slide-down { animation: slide-down-gpu 200ms ease-out forwards; }
    .animate-pop-in { animation: pop-in-gpu 250ms ease-out forwards; }
    .animate-shake { animation: shake-gpu 400ms ease-in-out; }
    .animate-pulse { animation: pulse-scale 1s ease-in-out infinite; }
    .animate-fade-in { animation: fade-in-gpu 200ms ease-out forwards; }
    
    /* Animaciones reducidas para dispositivos lentos */
    @media (prefers-reduced-motion: reduce) {
      .animate-float,
      .animate-slide-up,
      .animate-slide-down,
      .animate-pop-in,
      .animate-shake,
      .animate-pulse {
        animation: none !important;
      }
      
      .animate-fade-in {
        animation: fade-in-gpu 100ms ease-out forwards;
      }
    }
    
    /* ============================================
       PORTRAIT MODE - UI específica para vertical
       ============================================ */
    @media (orientation: portrait) {
      .portrait-only { display: flex !important; }
      .landscape-only { display: none !important; }
      
      .portrait-compact {
        transform: scale(0.85);
        transform-origin: center center;
      }
      
      /* Fichas más pequeñas en portrait */
      .tile-portrait {
        width: 24px !important;
        height: 48px !important;
      }
    }
    
    @media (orientation: landscape) {
      .portrait-only { display: none !important; }
      .landscape-only { display: flex !important; }
    }
    
    /* ============================================
       LANDSCAPE MODE - Warning para pantallas muy pequeñas
       ============================================ */
    @media (max-height: 400px) and (orientation: landscape) {
      .landscape-warning { display: flex !important; }
      .game-content { display: none !important; }
    }
    
    /* ============================================
       LOW-END DEVICE OPTIMIZATIONS
       ============================================ */
    .low-end-mode .animated-element {
      animation: none !important;
      transition: none !important;
    }
    
    .low-end-mode .gpu-layer {
      will-change: auto;
    }
    
    .low-end-mode .shadow-heavy {
      box-shadow: none !important;
    }
    
    .low-end-mode .blur-effect {
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
    }
    
    /* ============================================
       GLOW EFFECTS - Solo para dispositivos potentes
       ============================================ */
    @media (prefers-reduced-motion: no-preference) {
      @keyframes glow-pulse {
        0%, 100% { box-shadow: 0 0 5px rgba(247,179,43,0.3); }
        50% { box-shadow: 0 0 15px rgba(247,179,43,0.5); }
      }
      
      .animate-glow-pulse {
        animation: glow-pulse 2s ease-in-out infinite;
      }
    }
    
    @keyframes bounce-in-gpu {
      0% { transform: translate3d(0, 0, 0) scale(0.3); opacity: 0; }
      50% { transform: scale3d(1.05, 1.05, 1); }
      70% { transform: scale3d(0.9, 0.9, 1); }
      100% { transform: scale3d(1, 1, 1); opacity: 1; }
    }
    
    /* Clases de animación */
    .animate-shimmer { background-size: 200% 100%; animation: shimmer 2s infinite linear; }
    .animate-float { animation: float 3s ease-in-out infinite; will-change: transform; }
    .animate-glow-pulse { animation: glow-pulse 2s ease-in-out infinite; }
    .animate-slide-up { animation: slide-up 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
    .animate-slide-down { animation: slide-down 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
    .animate-pop-in { animation: pop-in 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
    .animate-shake { animation: shake 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
    .animate-pulse-border { animation: pulse-border 1s ease-in-out infinite; }
    .animate-bounce-in { animation: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards; }
    .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
    
    /* ============================================
       DRAG & DROP OPTIMIZADO
       ============================================ */
    .draggable {
      touch-action: none;
      cursor: grab;
      transform: translate3d(0, 0, 0);
      -webkit-transform: translate3d(0, 0, 0);
      will-change: transform;
    }
    
    .dragging {
      cursor: grabbing;
      z-index: 1000;
      pointer-events: none;
      will-change: transform;
    }
    
    .drop-zone {
      transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1),
                  background-color 0.15s ease,
                  box-shadow 0.15s ease;
      transform: translate3d(0, 0, 0);
    }
    
    .drop-zone-active {
      transform: scale3d(1.1, 1.1, 1);
    }
    
    /* ============================================
       BOTONES TÁCTILES - Mínimo 44px (Apple HIG)
       ============================================ */
    .btn-touch {
      min-height: 44px;
      min-width: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: translate3d(0, 0, 0);
    }
    
    /* ============================================
       SCROLLBAR - Oculto en móvil, visible en desktop
       ============================================ */
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    
    @media (min-width: 768px) {
      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 4px; }
      ::-webkit-scrollbar-thumb { background: rgba(247,179,43,0.3); border-radius: 4px; }
      ::-webkit-scrollbar-thumb:hover { background: rgba(247,179,43,0.5); }
    }
    
    /* ============================================
       ORIENTACIÓN Y RESPONSIVE
       ============================================ */
    /* Portrait mode para juego con una mano */
    @media (orientation: portrait) {
      .portrait-optimized {
        /* Ajustes específicos para portrait */
      }
    }
    
    /* Landscape warning para pantallas muy pequeñas */
    @media (max-height: 400px) and (orientation: landscape) {
      .landscape-warning { display: flex !important; }
      .game-content { display: none !important; }
    }
    
    /* Reducir animaciones en dispositivos con preferencia */
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }
    
    /* ============================================
       PERFORMANCE HINTS
       ============================================ */
    .contain-layout {
      contain: layout;
    }
    
    .contain-paint {
      contain: paint;
    }
    
    .contain-strict {
      contain: strict;
    }
    
    /* Optimizar rendering de listas largas */
    .virtualized-list > * {
      contain: layout style;
    }
  `}</style>
);

// ============================================================================
// THEME & CONFIG
// ============================================================================
const THEME = {
  colors: {
    bg: { deep: '#0D1117', surface: '#161B22', card: '#21262D', border: '#30363D', elevated: '#2D333B' },
    gold: { main: '#F7B32B', light: '#FFD666', dark: '#CC8800' },
    accent: { blue: '#58A6FF', red: '#F85149', green: '#3FB950', slate: '#8B949E', gold: '#F7B32B' },
    felt: { dark: '#1a4d2e', light: '#145a32', border: '#2D5A3D' },
    tile: { base: '#F0EDE5', shadow: '#D4CFC2', highlight: '#FFFEF9', border: '#B8B0A0' },
    text: { primary: '#E6EDF3', secondary: '#8B949E', muted: '#6E7681' }
  },
  dotColors: {
    0: '#6B7280', 1: '#FBBF24', 2: '#3B82F6', 3: '#EF4444', 4: '#22C55E',
    5: '#F97316', 6: '#A855F7', 7: '#EC4899', 8: '#06B6D4', 9: '#EAB308'
  }
};

// ============================================================================
// SISTEMA DE SKINS - DEFINICIONES CON ASSETS (PNG, WebP, SVG)
// ============================================================================
// Prioridad de carga: assetPng > assetWebp > asset (SVG) > CSS fallback
// Para mejor rendimiento en móviles, usa PNG o WebP
// ============================================================================
// ============================================================================
// SISTEMA DE SKIN SETS - Ficha + Tablero combinados
// ============================================================================
// 
// CÓMO AGREGAR UN SET:
// 1. Crea tu imagen de ficha en: public/assets/tiles/png/nombre.png
// 2. Crea tu imagen de tablero en: public/assets/boards/png/nombre.png
// 3. Agrega el set aquí abajo
//
// ============================================================================

const SKIN_SETS = {
  // === GRATIS - CSS puro ===
  classic: {
    id: 'classic',
    name: 'Clásico',
    type: 'css',
    price: 0,
    currency: 'tokens',
    rarity: 'common',
    // Configuración de ficha
    tile: {
      base: '#FFFFF0',
      border: '#8B7355',
      divider: '#A0522D',
      dotColor: '#1a1a1a'
    },
    // Configuración de tablero
    board: {
      background: '#1a4d2e',
      accent: '#2D5A3D',
      border: '#0d2e1a'
    }
  }
  
  // === TUS SETS PNG ===
  // Ejemplo de cómo agregar un set:
  //
  // madera_antigua: {
  //   id: 'madera_antigua',
  //   name: 'Madera Antigua',
  //   type: 'png',
  //   price: 500,
  //   currency: 'tokens',
  //   rarity: 'rare',
  //   tile: {
  //     png: '/assets/tiles/png/madera_antigua.png',
  //     border: '#5D3A1A',
  //     divider: '#6B4423',
  //     dotColor: '#1a1a1a',
  //     fallbackBase: '#8B4513'
  //   },
  //   board: {
  //     png: '/assets/boards/png/madera_antigua.png',
  //     border: '#3D2A0A',
  //     fallbackBackground: '#5D3A1A'
  //   }
  // }
};

// Cache de imágenes precargadas
const skinImageCache = {
  tiles: {},
  boards: {}
};

// Precargar imágenes de un set
const preloadSkinSet = (setId) => {
  const set = SKIN_SETS[setId];
  if (!set || set.type !== 'png') return;
  
  // Precargar ficha
  if (set.tile?.png && !skinImageCache.tiles[setId]) {
    const img = new Image();
    img.src = set.tile.png;
    img.onload = () => {
      skinImageCache.tiles[setId] = img;
      console.log(`✅ Ficha cargada: ${set.name}`);
    };
    img.onerror = () => {
      console.warn(`⚠️ No se pudo cargar ficha: ${set.tile.png}`);
      skinImageCache.tiles[setId] = null;
    };
  }
  
  // Precargar tablero
  if (set.board?.png && !skinImageCache.boards[setId]) {
    const img = new Image();
    img.src = set.board.png;
    img.onload = () => {
      skinImageCache.boards[setId] = img;
      console.log(`✅ Tablero cargado: ${set.name}`);
    };
    img.onerror = () => {
      console.warn(`⚠️ No se pudo cargar tablero: ${set.board.png}`);
      skinImageCache.boards[setId] = null;
    };
  }
};

// Precargar todos los sets PNG al inicio
Object.keys(SKIN_SETS).forEach(setId => {
  if (SKIN_SETS[setId].type === 'png') {
    preloadSkinSet(setId);
  }
});

// Obtener set completo
const getSkinSet = (setId) => {
  return SKIN_SETS[setId] || SKIN_SETS.classic;
};

// Obtener imagen de ficha cacheada
const getTileImage = (setId) => {
  return skinImageCache.tiles[setId] || null;
};

// Obtener imagen de tablero cacheada
const getBoardImage = (setId) => {
  return skinImageCache.boards[setId] || null;
};

// Para compatibilidad con código existente
const getTileSkin = (setId) => {
  const set = getSkinSet(setId);
  return {
    ...set.tile,
    type: set.type,
    png: set.tile?.png
  };
};

const getBoardSkin = (setId) => {
  const set = getSkinSet(setId);
  return {
    ...set.board,
    type: set.type,
    png: set.board?.png
  };
};

// ============================================================================
// SISTEMA DE FONDOS DE MENÚ
// ============================================================================
// 
// CÓMO AGREGAR UN FONDO:
// 1. Crea tu imagen en: public/assets/backgrounds/nombre.png
//    - Tamaño recomendado: 1080x1920px (móvil) o 1920x1080px (desktop)
//    - Formato: PNG o JPG
// 2. Agrega la entrada aquí abajo
//
// ============================================================================

const MENU_BACKGROUNDS = {
  // === GRATIS - CSS gradiente ===
  default: {
    id: 'default',
    name: 'Clásico',
    type: 'css',
    price: 0,
    currency: 'tokens',
    rarity: 'common',
    // Gradiente CSS
    background: `
      radial-gradient(ellipse at 20% 20%, rgba(30, 107, 58, 0.3) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 80%, rgba(139, 90, 43, 0.2) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 50%, rgba(218, 165, 32, 0.1) 0%, transparent 70%),
      linear-gradient(180deg, #0d1117 0%, #161b22 50%, #0d1117 100%)
    `
  },
  
  // === FONDO ELEGANTE VERDE CON ADORNOS DORADOS ===
  elegant_green: {
    id: 'elegant_green',
    name: 'Mesa Elegante',
    type: 'png',
    png: '/assets/backgrounds/menu_elegant.png',
    price: 0, // Gratis - es el default
    currency: 'tokens',
    rarity: 'rare',
    fallbackColor: '#0d2818'
  },
  
  // === FONDOS PREMIUM ===
  casino_royal: {
    id: 'casino_royal',
    name: 'Casino Royal',
    type: 'css',
    price: 200,
    currency: 'tokens',
    rarity: 'rare',
    background: `
      radial-gradient(ellipse at 50% 30%, rgba(139, 69, 19, 0.4) 0%, transparent 60%),
      radial-gradient(ellipse at 20% 80%, rgba(218, 165, 32, 0.2) 0%, transparent 50%),
      linear-gradient(180deg, #1a0a00 0%, #2d1810 50%, #0d0500 100%)
    `
  },
  
  midnight_blue: {
    id: 'midnight_blue',
    name: 'Medianoche',
    type: 'css',
    price: 150,
    currency: 'tokens',
    rarity: 'uncommon',
    background: `
      radial-gradient(ellipse at 30% 20%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
      radial-gradient(ellipse at 70% 70%, rgba(139, 92, 246, 0.2) 0%, transparent 50%),
      linear-gradient(180deg, #0a0a1a 0%, #1a1a3a 50%, #0a0a1a 100%)
    `
  },
  
  emerald_luxury: {
    id: 'emerald_luxury',
    name: 'Esmeralda',
    type: 'css',
    price: 300,
    currency: 'tokens',
    rarity: 'epic',
    background: `
      radial-gradient(ellipse at 50% 50%, rgba(16, 185, 129, 0.3) 0%, transparent 60%),
      radial-gradient(ellipse at 20% 30%, rgba(6, 95, 70, 0.4) 0%, transparent 50%),
      linear-gradient(180deg, #021a0f 0%, #0d3320 50%, #021a0f 100%)
    `
  }
  
  // === TUS FONDOS PNG PERSONALIZADOS ===
  // Ejemplo de cómo agregar un fondo:
  //
  // casino_luxury: {
  //   id: 'casino_luxury',
  //   name: 'Casino de Lujo',
  //   type: 'png',
  //   png: '/assets/backgrounds/casino_luxury.png',
  //   price: 300,
  //   currency: 'tokens',
  //   rarity: 'rare',
  //   // Color de fondo mientras carga
  //   fallbackColor: '#1a0a00'
  // }
};

// Cache de fondos
const menuBackgroundCache = {};

// Precargar fondo de menú
const preloadMenuBackground = (bgId) => {
  const bg = MENU_BACKGROUNDS[bgId];
  if (bg?.type === 'png' && bg.png && !menuBackgroundCache[bgId]) {
    const img = new Image();
    img.src = bg.png;
    img.onload = () => {
      menuBackgroundCache[bgId] = img;
      console.log(`✅ Fondo cargado: ${bg.name}`);
    };
    img.onerror = () => {
      console.warn(`⚠️ No se pudo cargar fondo: ${bg.png}`);
      menuBackgroundCache[bgId] = null;
    };
  }
};

// Precargar todos los fondos PNG al inicio
Object.keys(MENU_BACKGROUNDS).forEach(bgId => {
  if (MENU_BACKGROUNDS[bgId].type === 'png') {
    preloadMenuBackground(bgId);
  }
});

// Obtener fondo de menú
const getMenuBackground = (bgId) => {
  return MENU_BACKGROUNDS[bgId] || MENU_BACKGROUNDS.default;
};

// Obtener imagen de fondo cacheada
const getMenuBackgroundImage = (bgId) => {
  return menuBackgroundCache[bgId] || null;
};

// ============================================================================
// SISTEMA DE AVATARES - Desbloqueables por Rango
// ============================================================================
// 
// CÓMO AGREGAR UN AVATAR:
// 1. Crea tu imagen en: public/assets/avatars/nombre.png
//    - Tamaño recomendado: 200x200px (cuadrado)
//    - Formato: PNG con transparencia
// 2. Agrega la entrada aquí abajo con el rango mínimo requerido
//
// ============================================================================

const AVATARS = {
  // === GRATIS - Sin rango ===
  default: {
    id: 'default',
    name: 'Novato',
    type: 'emoji',
    emoji: '😊',
    requiredTier: null,  // Disponible para todos
    description: 'Avatar inicial'
  },
  
  // === BRONCE ===
  bronze_player: {
    id: 'bronze_player',
    name: 'Jugador de Bronce',
    type: 'png',
    png: '/assets/avatars/bronze_player.png',
    requiredTier: 'bronze',
    fallbackEmoji: '🥉',
    description: 'Alcanza Bronce'
  },
  
  // === PLATA ===
  silver_warrior: {
    id: 'silver_warrior',
    name: 'Guerrero de Plata',
    type: 'png',
    png: '/assets/avatars/silver_warrior.png',
    requiredTier: 'silver',
    fallbackEmoji: '🥈',
    description: 'Alcanza Plata'
  },
  
  // === ORO ===
  gold_champion: {
    id: 'gold_champion',
    name: 'Campeón de Oro',
    type: 'png',
    png: '/assets/avatars/gold_champion.png',
    requiredTier: 'gold',
    fallbackEmoji: '🥇',
    description: 'Alcanza Oro'
  },
  
  // === PLATINO ===
  platinum_elite: {
    id: 'platinum_elite',
    name: 'Élite de Platino',
    type: 'png',
    png: '/assets/avatars/platinum_elite.png',
    requiredTier: 'platinum',
    fallbackEmoji: '💎',
    description: 'Alcanza Platino'
  },
  
  // === DIAMANTE ===
  diamond_master: {
    id: 'diamond_master',
    name: 'Maestro Diamante',
    type: 'png',
    png: '/assets/avatars/diamond_master.png',
    requiredTier: 'diamond',
    fallbackEmoji: '💠',
    description: 'Alcanza Diamante'
  },
  
  // === MAESTRO ===
  master_lord: {
    id: 'master_lord',
    name: 'Señor Maestro',
    type: 'png',
    png: '/assets/avatars/master_lord.png',
    requiredTier: 'master',
    fallbackEmoji: '👑',
    description: 'Alcanza Maestro'
  },
  
  // === GRAN MAESTRO ===
  grandmaster_king: {
    id: 'grandmaster_king',
    name: 'Rey Gran Maestro',
    type: 'png',
    png: '/assets/avatars/grandmaster_king.png',
    requiredTier: 'grandmaster',
    fallbackEmoji: '🏆',
    description: 'Alcanza Gran Maestro'
  },
  
  // === LEYENDA ===
  legend_god: {
    id: 'legend_god',
    name: 'Dios Legendario',
    type: 'png',
    png: '/assets/avatars/legend_god.png',
    requiredTier: 'legend',
    fallbackEmoji: '⭐',
    description: 'Alcanza Leyenda'
  }
};

// Cache de avatares
const avatarImageCache = {};

// Precargar avatar
const preloadAvatar = (avatarId) => {
  const avatar = AVATARS[avatarId];
  if (avatar?.type === 'png' && avatar.png && !avatarImageCache[avatarId]) {
    const img = new Image();
    img.src = avatar.png;
    img.onload = () => {
      avatarImageCache[avatarId] = img;
      console.log(`✅ Avatar cargado: ${avatar.name}`);
    };
    img.onerror = () => {
      console.warn(`⚠️ No se pudo cargar avatar: ${avatar.png}`);
      avatarImageCache[avatarId] = null;
    };
  }
};

// Precargar todos los avatares PNG
Object.keys(AVATARS).forEach(avatarId => {
  if (AVATARS[avatarId].type === 'png') {
    preloadAvatar(avatarId);
  }
});

// Obtener avatar
const getAvatar = (avatarId) => {
  return AVATARS[avatarId] || AVATARS.default;
};

// Obtener imagen de avatar cacheada
const getAvatarImage = (avatarId) => {
  return avatarImageCache[avatarId] || null;
};

// Orden de tiers para comparación
const TIER_ORDER = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'grandmaster', 'legend'];

// Verificar si un tier cumple el requisito
const isTierUnlocked = (playerTier, requiredTier) => {
  if (!requiredTier) return true; // Sin requisito = disponible
  if (!playerTier) return false;
  
  const playerIndex = TIER_ORDER.indexOf(playerTier);
  const requiredIndex = TIER_ORDER.indexOf(requiredTier);
  
  return playerIndex >= requiredIndex;
};

// ============================================================================
// SISTEMA DE TÍTULOS - Desbloqueables por Rango
// ============================================================================

const PLAYER_TITLES = {
  // === GRATIS ===
  novato: {
    id: 'novato',
    name: 'Novato',
    display: 'Novato',
    requiredTier: null,
    color: '#9CA3AF',
    description: 'Título inicial'
  },
  
  // === BRONCE ===
  aprendiz: {
    id: 'aprendiz',
    name: 'Aprendiz',
    display: 'Aprendiz',
    requiredTier: 'bronze',
    color: '#CD7F32',
    description: 'Alcanza Bronce'
  },
  
  // === PLATA ===
  competidor: {
    id: 'competidor',
    name: 'Competidor',
    display: 'Competidor',
    requiredTier: 'silver',
    color: '#C0C0C0',
    description: 'Alcanza Plata'
  },
  
  // === ORO ===
  veterano: {
    id: 'veterano',
    name: 'Veterano',
    display: 'Veterano',
    requiredTier: 'gold',
    color: '#FFD700',
    description: 'Alcanza Oro'
  },
  estratega: {
    id: 'estratega',
    name: 'Estratega',
    display: 'Estratega',
    requiredTier: 'gold',
    color: '#FFD700',
    description: 'Alcanza Oro'
  },
  
  // === PLATINO ===
  experto: {
    id: 'experto',
    name: 'Experto',
    display: 'Experto',
    requiredTier: 'platinum',
    color: '#E5E4E2',
    description: 'Alcanza Platino'
  },
  dominador: {
    id: 'dominador',
    name: 'Dominador',
    display: 'Dominador',
    requiredTier: 'platinum',
    color: '#E5E4E2',
    description: 'Alcanza Platino'
  },
  
  // === DIAMANTE ===
  elite: {
    id: 'elite',
    name: 'Élite',
    display: 'Élite',
    requiredTier: 'diamond',
    color: '#B9F2FF',
    description: 'Alcanza Diamante'
  },
  imparable: {
    id: 'imparable',
    name: 'Imparable',
    display: 'Imparable',
    requiredTier: 'diamond',
    color: '#B9F2FF',
    description: 'Alcanza Diamante'
  },
  
  // === MAESTRO ===
  maestro: {
    id: 'maestro',
    name: 'Maestro',
    display: 'Maestro',
    requiredTier: 'master',
    color: '#9333EA',
    description: 'Alcanza Maestro'
  },
  virtuoso: {
    id: 'virtuoso',
    name: 'Virtuoso',
    display: 'Virtuoso',
    requiredTier: 'master',
    color: '#9333EA',
    description: 'Alcanza Maestro'
  },
  
  // === GRAN MAESTRO ===
  leyenda_viva: {
    id: 'leyenda_viva',
    name: 'Leyenda Viva',
    display: 'Leyenda Viva',
    requiredTier: 'grandmaster',
    color: '#F59E0B',
    description: 'Alcanza Gran Maestro'
  },
  invencible: {
    id: 'invencible',
    name: 'Invencible',
    display: 'Invencible',
    requiredTier: 'grandmaster',
    color: '#F59E0B',
    description: 'Alcanza Gran Maestro'
  },
  
  // === LEYENDA ===
  dios_domino: {
    id: 'dios_domino',
    name: 'Dios del Dominó',
    display: '⭐ Dios del Dominó ⭐',
    requiredTier: 'legend',
    color: '#EF4444',
    glow: true,
    description: 'Alcanza Leyenda'
  },
  inmortal: {
    id: 'inmortal',
    name: 'Inmortal',
    display: '✨ Inmortal ✨',
    requiredTier: 'legend',
    color: '#EF4444',
    glow: true,
    description: 'Alcanza Leyenda'
  }
};

// Obtener título
const getPlayerTitle = (titleId) => {
  return PLAYER_TITLES[titleId] || PLAYER_TITLES.novato;
};

// ============================================================================
// SISTEMA DE LOGROS (ACHIEVEMENTS)
// ============================================================================
// 
// Los logros se desbloquean automáticamente al cumplir requisitos.
// Cada logro puede dar recompensas: tokens, coins, títulos, avatares, etc.
//
// ============================================================================

const ACHIEVEMENTS = {
  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORÍA: PARTIDAS JUGADAS
  // ═══════════════════════════════════════════════════════════════════════════
  games_10: {
    id: 'games_10',
    name: 'Primeros Pasos',
    description: 'Juega 10 partidas',
    icon: '🎮',
    category: 'games',
    requirement: { type: 'games_played', value: 10 },
    reward: { tokens: 50 },
    rarity: 'common'
  },
  games_50: {
    id: 'games_50',
    name: 'Jugador Activo',
    description: 'Juega 50 partidas',
    icon: '🎮',
    category: 'games',
    requirement: { type: 'games_played', value: 50 },
    reward: { tokens: 100 },
    rarity: 'common'
  },
  games_100: {
    id: 'games_100',
    name: 'Veterano',
    description: 'Juega 100 partidas',
    icon: '🎖️',
    category: 'games',
    requirement: { type: 'games_played', value: 100 },
    reward: { tokens: 200, coins: 10 },
    rarity: 'rare'
  },
  games_500: {
    id: 'games_500',
    name: 'Adicto al Dominó',
    description: 'Juega 500 partidas',
    icon: '🏅',
    category: 'games',
    requirement: { type: 'games_played', value: 500 },
    reward: { tokens: 500, coins: 50 },
    rarity: 'epic'
  },
  games_1000: {
    id: 'games_1000',
    name: 'Leyenda Viviente',
    description: 'Juega 1000 partidas',
    icon: '👑',
    category: 'games',
    requirement: { type: 'games_played', value: 1000 },
    reward: { tokens: 1000, coins: 100, title: 'leyenda_viva' },
    rarity: 'legendary'
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORÍA: VICTORIAS
  // ═══════════════════════════════════════════════════════════════════════════
  wins_10: {
    id: 'wins_10',
    name: 'Primera Sangre',
    description: 'Gana 10 partidas',
    icon: '🏆',
    category: 'wins',
    requirement: { type: 'wins', value: 10 },
    reward: { tokens: 75 },
    rarity: 'common'
  },
  wins_50: {
    id: 'wins_50',
    name: 'Ganador Serial',
    description: 'Gana 50 partidas',
    icon: '🏆',
    category: 'wins',
    requirement: { type: 'wins', value: 50 },
    reward: { tokens: 150 },
    rarity: 'rare'
  },
  wins_100: {
    id: 'wins_100',
    name: 'Centenario',
    description: 'Gana 100 partidas',
    icon: '💯',
    category: 'wins',
    requirement: { type: 'wins', value: 100 },
    reward: { tokens: 300, coins: 25 },
    rarity: 'rare'
  },
  wins_250: {
    id: 'wins_250',
    name: 'Conquistador',
    description: 'Gana 250 partidas',
    icon: '⚔️',
    category: 'wins',
    requirement: { type: 'wins', value: 250 },
    reward: { tokens: 500, coins: 50 },
    rarity: 'epic'
  },
  wins_500: {
    id: 'wins_500',
    name: 'Invicto',
    description: 'Gana 500 partidas',
    icon: '🎯',
    category: 'wins',
    requirement: { type: 'wins', value: 500 },
    reward: { tokens: 1000, coins: 100, title: 'invencible' },
    rarity: 'legendary'
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORÍA: RACHAS DE VICTORIAS
  // ═══════════════════════════════════════════════════════════════════════════
  streak_3: {
    id: 'streak_3',
    name: 'En Racha',
    description: 'Gana 3 partidas seguidas',
    icon: '🔥',
    category: 'streak',
    requirement: { type: 'win_streak', value: 3 },
    reward: { tokens: 50 },
    rarity: 'common'
  },
  streak_5: {
    id: 'streak_5',
    name: 'Imparable',
    description: 'Gana 5 partidas seguidas',
    icon: '🔥',
    category: 'streak',
    requirement: { type: 'win_streak', value: 5 },
    reward: { tokens: 100 },
    rarity: 'rare'
  },
  streak_10: {
    id: 'streak_10',
    name: 'En Llamas',
    description: 'Gana 10 partidas seguidas',
    icon: '💥',
    category: 'streak',
    requirement: { type: 'win_streak', value: 10 },
    reward: { tokens: 250, coins: 25 },
    rarity: 'epic'
  },
  streak_20: {
    id: 'streak_20',
    name: 'Intratable',
    description: 'Gana 20 partidas seguidas',
    icon: '☄️',
    category: 'streak',
    requirement: { type: 'win_streak', value: 20 },
    reward: { tokens: 500, coins: 50 },
    rarity: 'legendary'
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORÍA: DOMINÓ Y CAPICÚA
  // ═══════════════════════════════════════════════════════════════════════════
  domino_first: {
    id: 'domino_first',
    name: '¡Dominó!',
    description: 'Gana tu primera partida con dominó',
    icon: '🀄',
    category: 'domino',
    requirement: { type: 'domino_wins', value: 1 },
    reward: { tokens: 30 },
    rarity: 'common'
  },
  domino_10: {
    id: 'domino_10',
    name: 'Dominador',
    description: 'Gana 10 partidas con dominó',
    icon: '🀄',
    category: 'domino',
    requirement: { type: 'domino_wins', value: 10 },
    reward: { tokens: 100 },
    rarity: 'rare'
  },
  domino_50: {
    id: 'domino_50',
    name: 'Maestro del Dominó',
    description: 'Gana 50 partidas con dominó',
    icon: '🎴',
    category: 'domino',
    requirement: { type: 'domino_wins', value: 50 },
    reward: { tokens: 300, coins: 30 },
    rarity: 'epic'
  },
  capicua_first: {
    id: 'capicua_first',
    name: '¡Capicúa!',
    description: 'Gana tu primera partida con capicúa',
    icon: '🌟',
    category: 'domino',
    requirement: { type: 'capicua_wins', value: 1 },
    reward: { tokens: 50 },
    rarity: 'rare'
  },
  capicua_10: {
    id: 'capicua_10',
    name: 'Capicuero',
    description: 'Gana 10 partidas con capicúa',
    icon: '⭐',
    category: 'domino',
    requirement: { type: 'capicua_wins', value: 10 },
    reward: { tokens: 200, coins: 20 },
    rarity: 'epic'
  },
  capicua_25: {
    id: 'capicua_25',
    name: 'Rey de la Capicúa',
    description: 'Gana 25 partidas con capicúa',
    icon: '💫',
    category: 'domino',
    requirement: { type: 'capicua_wins', value: 25 },
    reward: { tokens: 500, coins: 50 },
    rarity: 'legendary'
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORÍA: PUNTUACIÓN
  // ═══════════════════════════════════════════════════════════════════════════
  points_100: {
    id: 'points_100',
    name: 'Triple Dígitos',
    description: 'Alcanza 100 puntos en una partida',
    icon: '💯',
    category: 'points',
    requirement: { type: 'max_points_game', value: 100 },
    reward: { tokens: 50 },
    rarity: 'common'
  },
  points_150: {
    id: 'points_150',
    name: 'Aplastante',
    description: 'Alcanza 150 puntos en una partida',
    icon: '🎯',
    category: 'points',
    requirement: { type: 'max_points_game', value: 150 },
    reward: { tokens: 100, coins: 10 },
    rarity: 'rare'
  },
  points_200: {
    id: 'points_200',
    name: 'Demoledor',
    description: 'Alcanza 200 puntos en una partida',
    icon: '💪',
    category: 'points',
    requirement: { type: 'max_points_game', value: 200 },
    reward: { tokens: 200, coins: 25 },
    rarity: 'epic'
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORÍA: RANGOS
  // ═══════════════════════════════════════════════════════════════════════════
  rank_silver: {
    id: 'rank_silver',
    name: 'Plata Alcanzada',
    description: 'Alcanza el rango Plata',
    icon: '🥈',
    category: 'rank',
    requirement: { type: 'rank_tier', value: 'silver' },
    reward: { tokens: 100 },
    rarity: 'common'
  },
  rank_gold: {
    id: 'rank_gold',
    name: 'Oro Alcanzado',
    description: 'Alcanza el rango Oro',
    icon: '🥇',
    category: 'rank',
    requirement: { type: 'rank_tier', value: 'gold' },
    reward: { tokens: 200, coins: 20 },
    rarity: 'rare'
  },
  rank_platinum: {
    id: 'rank_platinum',
    name: 'Platino Alcanzado',
    description: 'Alcanza el rango Platino',
    icon: '💎',
    category: 'rank',
    requirement: { type: 'rank_tier', value: 'platinum' },
    reward: { tokens: 300, coins: 30 },
    rarity: 'rare'
  },
  rank_diamond: {
    id: 'rank_diamond',
    name: 'Diamante Alcanzado',
    description: 'Alcanza el rango Diamante',
    icon: '💠',
    category: 'rank',
    requirement: { type: 'rank_tier', value: 'diamond' },
    reward: { tokens: 500, coins: 50 },
    rarity: 'epic'
  },
  rank_master: {
    id: 'rank_master',
    name: 'Maestro Alcanzado',
    description: 'Alcanza el rango Maestro',
    icon: '👑',
    category: 'rank',
    requirement: { type: 'rank_tier', value: 'master' },
    reward: { tokens: 750, coins: 75 },
    rarity: 'epic'
  },
  rank_grandmaster: {
    id: 'rank_grandmaster',
    name: 'Gran Maestro',
    description: 'Alcanza el rango Gran Maestro',
    icon: '🏆',
    category: 'rank',
    requirement: { type: 'rank_tier', value: 'grandmaster' },
    reward: { tokens: 1000, coins: 100 },
    rarity: 'legendary'
  },
  rank_legend: {
    id: 'rank_legend',
    name: 'Leyenda',
    description: 'Alcanza el rango Leyenda',
    icon: '⭐',
    category: 'rank',
    requirement: { type: 'rank_tier', value: 'legend' },
    reward: { tokens: 2000, coins: 200, title: 'dios_domino' },
    rarity: 'legendary'
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORÍA: TRANCAS
  // ═══════════════════════════════════════════════════════════════════════════
  tranca_first: {
    id: 'tranca_first',
    name: 'Primera Tranca',
    description: 'Gana tu primera partida por tranca',
    icon: '🔒',
    category: 'tranca',
    requirement: { type: 'tranca_wins', value: 1 },
    reward: { tokens: 30 },
    rarity: 'common'
  },
  tranca_10: {
    id: 'tranca_10',
    name: 'Trancador',
    description: 'Gana 10 partidas por tranca',
    icon: '🔐',
    category: 'tranca',
    requirement: { type: 'tranca_wins', value: 10 },
    reward: { tokens: 100 },
    rarity: 'rare'
  },
  tranca_survive: {
    id: 'tranca_survive',
    name: 'Superviviente',
    description: 'Gana una partida por tranca teniendo menos puntos',
    icon: '🛡️',
    category: 'tranca',
    requirement: { type: 'tranca_comeback', value: 1 },
    reward: { tokens: 150, coins: 15 },
    rarity: 'epic'
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORÍA: ESPECIALES
  // ═══════════════════════════════════════════════════════════════════════════
  perfect_game: {
    id: 'perfect_game',
    name: 'Partida Perfecta',
    description: 'Gana una partida sin que el rival anote',
    icon: '✨',
    category: 'special',
    requirement: { type: 'perfect_game', value: 1 },
    reward: { tokens: 200, coins: 20 },
    rarity: 'epic'
  },
  comeback_king: {
    id: 'comeback_king',
    name: 'Rey del Comeback',
    description: 'Gana estando 50+ puntos abajo',
    icon: '👑',
    category: 'special',
    requirement: { type: 'comeback_50', value: 1 },
    reward: { tokens: 250, coins: 25 },
    rarity: 'epic'
  },
  speed_demon: {
    id: 'speed_demon',
    name: 'Velocista',
    description: 'Gana una partida en menos de 3 minutos',
    icon: '⚡',
    category: 'special',
    requirement: { type: 'fast_win', value: 1 },
    reward: { tokens: 100 },
    rarity: 'rare'
  },
  double_starter: {
    id: 'double_starter',
    name: 'Doble o Nada',
    description: 'Empieza 10 rondas con el doble 9',
    icon: '9️⃣',
    category: 'special',
    requirement: { type: 'double9_starts', value: 10 },
    reward: { tokens: 75 },
    rarity: 'common'
  },
  all_doubles: {
    id: 'all_doubles',
    name: 'Mano de Dobles',
    description: 'Ten 4+ dobles en tu mano inicial',
    icon: '🎰',
    category: 'special',
    requirement: { type: 'four_doubles_hand', value: 1 },
    reward: { tokens: 100 },
    rarity: 'rare'
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORÍA: SOCIAL
  // ═══════════════════════════════════════════════════════════════════════════
  emote_10: {
    id: 'emote_10',
    name: 'Expresivo',
    description: 'Envía 10 emotes',
    icon: '😄',
    category: 'social',
    requirement: { type: 'emotes_sent', value: 10 },
    reward: { tokens: 25 },
    rarity: 'common'
  },
  emote_100: {
    id: 'emote_100',
    name: 'Comunicador',
    description: 'Envía 100 emotes',
    icon: '🗣️',
    category: 'social',
    requirement: { type: 'emotes_sent', value: 100 },
    reward: { tokens: 75 },
    rarity: 'rare'
  },
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CATEGORÍA: COLECCIÓN
  // ═══════════════════════════════════════════════════════════════════════════
  collector_5: {
    id: 'collector_5',
    name: 'Coleccionista',
    description: 'Desbloquea 5 items de la tienda',
    icon: '🛍️',
    category: 'collection',
    requirement: { type: 'items_owned', value: 5 },
    reward: { tokens: 50 },
    rarity: 'common'
  },
  collector_15: {
    id: 'collector_15',
    name: 'Acumulador',
    description: 'Desbloquea 15 items de la tienda',
    icon: '🎁',
    category: 'collection',
    requirement: { type: 'items_owned', value: 15 },
    reward: { tokens: 150, coins: 15 },
    rarity: 'rare'
  },
  collector_30: {
    id: 'collector_30',
    name: 'Magnate',
    description: 'Desbloquea 30 items de la tienda',
    icon: '💰',
    category: 'collection',
    requirement: { type: 'items_owned', value: 30 },
    reward: { tokens: 300, coins: 30 },
    rarity: 'epic'
  }
};

// Categorías de logros para UI
const ACHIEVEMENT_CATEGORIES = {
  games: { name: 'Partidas', icon: '🎮', color: '#60A5FA' },
  wins: { name: 'Victorias', icon: '🏆', color: '#FBBF24' },
  streak: { name: 'Rachas', icon: '🔥', color: '#F97316' },
  domino: { name: 'Dominó', icon: '🀄', color: '#A855F7' },
  points: { name: 'Puntos', icon: '💯', color: '#EC4899' },
  rank: { name: 'Rangos', icon: '🎖️', color: '#10B981' },
  tranca: { name: 'Trancas', icon: '🔒', color: '#6366F1' },
  special: { name: 'Especiales', icon: '⭐', color: '#EF4444' },
  social: { name: 'Social', icon: '💬', color: '#14B8A6' },
  collection: { name: 'Colección', icon: '🎁', color: '#8B5CF6' }
};

// Colores de rareza para logros
const ACHIEVEMENT_RARITY = {
  common: { name: 'Común', color: '#9CA3AF', bg: 'rgba(156, 163, 175, 0.2)' },
  rare: { name: 'Raro', color: '#60A5FA', bg: 'rgba(96, 165, 250, 0.2)' },
  epic: { name: 'Épico', color: '#A855F7', bg: 'rgba(168, 85, 247, 0.2)' },
  legendary: { name: 'Legendario', color: '#FBBF24', bg: 'rgba(251, 191, 36, 0.2)' }
};

// Verificar si un logro está desbloqueado
const checkAchievement = (achievement, playerStats) => {
  const req = achievement.requirement;
  
  switch (req.type) {
    case 'games_played':
      return (playerStats.gamesPlayed || 0) >= req.value;
    case 'wins':
      return (playerStats.wins || 0) >= req.value;
    case 'win_streak':
      return (playerStats.maxWinStreak || 0) >= req.value;
    case 'domino_wins':
      return (playerStats.dominoWins || 0) >= req.value;
    case 'capicua_wins':
      return (playerStats.capicuaWins || 0) >= req.value;
    case 'max_points_game':
      return (playerStats.maxPointsInGame || 0) >= req.value;
    case 'rank_tier':
      return isTierUnlocked(playerStats.currentTier, req.value);
    case 'tranca_wins':
      return (playerStats.trancaWins || 0) >= req.value;
    case 'tranca_comeback':
      return (playerStats.trancaComebacks || 0) >= req.value;
    case 'perfect_game':
      return (playerStats.perfectGames || 0) >= req.value;
    case 'comeback_50':
      return (playerStats.bigComebacks || 0) >= req.value;
    case 'fast_win':
      return (playerStats.fastWins || 0) >= req.value;
    case 'double9_starts':
      return (playerStats.double9Starts || 0) >= req.value;
    case 'four_doubles_hand':
      return (playerStats.fourDoublesHands || 0) >= req.value;
    case 'emotes_sent':
      return (playerStats.emotesSent || 0) >= req.value;
    case 'items_owned':
      return (playerStats.itemsOwned || 0) >= req.value;
    default:
      return false;
  }
};

// Obtener progreso de un logro (0-100%)
const getAchievementProgress = (achievement, playerStats) => {
  const req = achievement.requirement;
  let current = 0;
  
  switch (req.type) {
    case 'games_played': current = playerStats.gamesPlayed || 0; break;
    case 'wins': current = playerStats.wins || 0; break;
    case 'win_streak': current = playerStats.maxWinStreak || 0; break;
    case 'domino_wins': current = playerStats.dominoWins || 0; break;
    case 'capicua_wins': current = playerStats.capicuaWins || 0; break;
    case 'max_points_game': current = playerStats.maxPointsInGame || 0; break;
    case 'tranca_wins': current = playerStats.trancaWins || 0; break;
    case 'tranca_comeback': current = playerStats.trancaComebacks || 0; break;
    case 'perfect_game': current = playerStats.perfectGames || 0; break;
    case 'comeback_50': current = playerStats.bigComebacks || 0; break;
    case 'fast_win': current = playerStats.fastWins || 0; break;
    case 'double9_starts': current = playerStats.double9Starts || 0; break;
    case 'four_doubles_hand': current = playerStats.fourDoublesHands || 0; break;
    case 'emotes_sent': current = playerStats.emotesSent || 0; break;
    case 'items_owned': current = playerStats.itemsOwned || 0; break;
    case 'rank_tier':
      // Para rangos, es binario
      return isTierUnlocked(playerStats.currentTier, req.value) ? 100 : 0;
    default: return 0;
  }
  
  return Math.min(100, Math.round((current / req.value) * 100));
};

// Obtener valor actual y objetivo de un logro
const getAchievementValues = (achievement, playerStats) => {
  const req = achievement.requirement;
  let current = 0;
  
  switch (req.type) {
    case 'games_played': current = playerStats.gamesPlayed || 0; break;
    case 'wins': current = playerStats.wins || 0; break;
    case 'win_streak': current = playerStats.maxWinStreak || 0; break;
    case 'domino_wins': current = playerStats.dominoWins || 0; break;
    case 'capicua_wins': current = playerStats.capicuaWins || 0; break;
    case 'max_points_game': current = playerStats.maxPointsInGame || 0; break;
    case 'tranca_wins': current = playerStats.trancaWins || 0; break;
    case 'tranca_comeback': current = playerStats.trancaComebacks || 0; break;
    case 'perfect_game': current = playerStats.perfectGames || 0; break;
    case 'comeback_50': current = playerStats.bigComebacks || 0; break;
    case 'fast_win': current = playerStats.fastWins || 0; break;
    case 'double9_starts': current = playerStats.double9Starts || 0; break;
    case 'four_doubles_hand': current = playerStats.fourDoublesHands || 0; break;
    case 'emotes_sent': current = playerStats.emotesSent || 0; break;
    case 'items_owned': current = playerStats.itemsOwned || 0; break;
    case 'rank_tier':
      return { current: playerStats.currentTier || 'none', target: req.value };
    default: break;
  }
  
  return { current: Math.min(current, req.value), target: req.value };
};

const BOARD_SKINS = {
  // === FIELTRO (Gratis) ===
  felt_green: {
    name: 'Fieltro Verde',
    asset: '/assets/boards/felt_green.svg',
    background: '#1a4d2e',
    pattern: 'felt',
    accent: '#2D5A3D',
    gridColor: 'rgba(255,255,255,0.03)'
  },
  felt_blue: {
    name: 'Fieltro Azul',
    asset: '/assets/boards/felt_green.svg',
    tint: 'hue-rotate(180deg)',
    background: '#1e3a5f',
    pattern: 'felt',
    accent: '#2a4a70',
    gridColor: 'rgba(255,255,255,0.03)'
  },
  
  // === MADERA (Tokens) ===
  wood_oak: {
    name: 'Roble',
    asset: '/assets/boards/wood_oak.svg',
    background: '#8b4513',
    pattern: 'wood',
    accent: '#a0522d',
    gridColor: 'rgba(0,0,0,0.1)'
  },
  wood_mahogany: {
    name: 'Caoba',
    asset: '/assets/boards/wood_oak.svg',
    tint: 'saturate(80%) brightness(80%)',
    background: '#5c3317',
    pattern: 'wood',
    accent: '#6b3a1f',
    gridColor: 'rgba(0,0,0,0.1)'
  },
  
  // === MÁRMOL (Tokens) ===
  marble_white: {
    name: 'Mármol Blanco',
    asset: '/assets/boards/marble_white.svg',
    background: '#f0f0f0',
    pattern: 'marble',
    accent: '#e0e0e0',
    gridColor: 'rgba(0,0,0,0.05)'
  },
  marble_black: {
    name: 'Mármol Negro',
    asset: '/assets/boards/marble_white.svg',
    tint: 'invert(90%) hue-rotate(180deg)',
    background: '#1a1a2e',
    pattern: 'marble-dark',
    accent: '#2d2d44',
    gridColor: 'rgba(255,255,255,0.03)'
  },
  
  // === TERCIOPELO (Coins) ===
  velvet_red: {
    name: 'Terciopelo Rojo',
    asset: '/assets/boards/felt_green.svg',
    tint: 'hue-rotate(-120deg) saturate(150%)',
    background: '#5c0a0a',
    pattern: 'velvet',
    accent: '#8b0000',
    gridColor: 'rgba(255,255,255,0.02)'
  },
  velvet_purple: {
    name: 'Terciopelo Púrpura',
    asset: '/assets/boards/felt_green.svg',
    tint: 'hue-rotate(270deg) saturate(150%)',
    background: '#2d0a4e',
    pattern: 'velvet',
    accent: '#4a0080',
    gridColor: 'rgba(255,255,255,0.02)'
  },
  
  // === ESPECIALES (Coins Premium) ===
  galaxy: {
    name: 'Galaxia',
    asset: '/assets/boards/galaxy.svg',
    background: 'linear-gradient(135deg, #0a0a2e 0%, #1a0a3e 50%, #0a1a3e 100%)',
    pattern: 'stars',
    accent: '#4a4a8a',
    gridColor: 'rgba(255,255,255,0.02)',
    isGradient: true,
    animated: true
  },
  sunset: {
    name: 'Atardecer',
    asset: '/assets/boards/galaxy.svg',
    tint: 'hue-rotate(30deg) saturate(200%)',
    background: 'linear-gradient(180deg, #ff6b35 0%, #f7931a 50%, #8b4513 100%)',
    pattern: 'none',
    accent: '#cc5500',
    gridColor: 'rgba(0,0,0,0.1)',
    isGradient: true
  },
  ocean_depth: {
    name: 'Profundidad Marina',
    asset: '/assets/boards/galaxy.svg',
    assetPng: '/assets/boards/ocean_depth.png',  // PNG alternativo
    tint: 'hue-rotate(180deg)',
    background: 'linear-gradient(180deg, #006994 0%, #004466 50%, #002233 100%)',
    pattern: 'waves',
    accent: '#008080',
    gridColor: 'rgba(255,255,255,0.02)',
    isGradient: true,
    animated: true
  },
  aurora: {
    name: 'Aurora Boreal',
    asset: '/assets/boards/galaxy.svg',
    assetPng: '/assets/boards/aurora.png',  // PNG alternativo
    tint: 'hue-rotate(120deg)',
    background: 'linear-gradient(135deg, #0a1628 0%, #1a4d2e 25%, #2d0a4e 50%, #0a1628 75%, #1a4d2e 100%)',
    pattern: 'aurora',
    accent: '#00ff87',
    gridColor: 'rgba(255,255,255,0.02)',
    isGradient: true,
    animated: true
  }
};

// Función helper para obtener los colores de una skin de tablero
const getBoardSkin = (skinId) => {
  return BOARD_SKINS[skinId] || BOARD_SKINS.felt_green;
};

// Función helper para obtener el color de un punto según la skin
const getDotColor = (value, skinId) => {
  const skin = getTileSkin(skinId);
  if (skin.dotColors && skin.dotColors[value] !== undefined) {
    return skin.dotColors[value];
  }
  return THEME.dotColors[value];
};

// Función helper para obtener la URL del asset (soporta PNG, WebP, SVG con fallback)
// Prioridad: PNG > WebP > SVG > CSS fallback
// Función para obtener la URL del asset con prioridad: PNG > WebP > SVG > CSS
const getAssetUrl = (skin, type = 'tile') => {
  // Prioridad 1: PNG específico (mejor para móviles, más rendimiento)
  if (skin.assetPng) {
    return { url: skin.assetPng, type: 'png', format: 'image' };
  }
  // Prioridad 2: WebP (más comprimido, moderno)
  if (skin.assetWebp) {
    return { url: skin.assetWebp, type: 'webp', format: 'image' };
  }
  // Prioridad 3: Asset genérico (puede ser SVG, PNG, etc.)
  if (skin.asset) {
    const ext = skin.asset.split('.').pop().toLowerCase();
    const format = ['svg'].includes(ext) ? 'svg' : 'image';
    return { url: skin.asset, type: ext, format };
  }
  // Sin asset - usar CSS fallback
  return { url: null, type: 'css', format: 'css' };
};

// Detectar soporte de WebP en el navegador
const supportsWebP = (() => {
  if (typeof document === 'undefined') return false;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
})();

// Obtener el mejor asset disponible según el dispositivo
const getBestAsset = (skin, type = 'tile') => {
  // En móviles, preferir PNG por rendimiento
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  if (isMobile && skin.assetPng) {
    return { url: skin.assetPng, type: 'png' };
  }
  if (supportsWebP && skin.assetWebp) {
    return { url: skin.assetWebp, type: 'webp' };
  }
  if (skin.assetPng) {
    return { url: skin.assetPng, type: 'png' };
  }
  if (skin.asset) {
    return { url: skin.asset, type: skin.asset.split('.').pop() };
  }
  return { url: null, type: 'css' };
};

// Precargar assets de skins para mejor rendimiento
const preloadSkinAssets = () => {
  const allSkins = [...Object.values(TILE_SKINS), ...Object.values(BOARD_SKINS)];
  const urls = new Set();
  
  allSkins.forEach(skin => {
    if (skin.asset) urls.add(skin.asset);
    if (skin.assetPng) urls.add(skin.assetPng);
    if (skin.assetWebp) urls.add(skin.assetWebp);
  });
  
  // Precargar imágenes
  urls.forEach(url => {
    const img = new Image();
    img.src = url;
  });
  
  console.log(`[Skins] Precargando ${urls.size} assets...`);
};

const CONFIG = { maxTile: 9, tilesPerPlayer: 10, passesForTranca: 4, colSize: 8, centerColSize: 4 };

// ============================================================================
// COMPONENTE: LEADERBOARD COMPLETO
// ============================================================================
const LeaderboardScreen = ({ playerProfile, onClose }) => {
  const C = THEME.colors;
  const [activeTab, setActiveTab] = useState('global');
  const [selectedRegion, setSelectedRegion] = useState('latam');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [stats, setStats] = useState(null);
  const [showNearby, setShowNearby] = useState(false);
  
  useEffect(() => {
    let type = Leaderboard.TYPES.GLOBAL;
    let options = { region: selectedRegion, limit: 100 };
    
    if (activeTab === 'regional') type = Leaderboard.TYPES.REGIONAL;
    else if (activeTab === 'season') type = Leaderboard.TYPES.SEASON;
    else if (activeTab === 'weekly') type = Leaderboard.TYPES.WEEKLY;
    
    const data = Leaderboard.generateLeaderboard(type, playerProfile, options);
    setLeaderboardData(data);
    setStats(Leaderboard.getStats(data, playerProfile));
  }, [activeTab, selectedRegion, playerProfile]);
  
  const displayData = showNearby 
    ? Leaderboard.getNearbyPlayers(leaderboardData, playerProfile?.id, 10)
    : leaderboardData.slice(0, 50);
  
  const tabs = [
    { id: 'global', name: 'Global', icon: '🌍' },
    { id: 'regional', name: 'Regional', icon: '🗺️' },
    { id: 'season', name: 'Temporada', icon: '🏆' },
    { id: 'weekly', name: 'Semanal', icon: '📅' }
  ];
  
  return (
    <div style={{
      position: 'fixed', inset: 0, background: C.bg.deep, zIndex: 1000,
      display: 'flex', flexDirection: 'column', overflow: 'hidden'
    }}>
      {/* Header */}
      <div className="safe-top" style={{ background: C.bg.surface, borderBottom: `1px solid ${C.bg.border}`, padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <button onClick={onClose} className="touch-feedback" style={{ background: 'transparent', border: 'none', color: C.text.primary, fontSize: 24, cursor: 'pointer', padding: 8 }}>←</button>
          <h1 style={{ color: C.text.primary, fontSize: 20, fontWeight: 700, margin: 0 }}>🏆 Clasificaciones</h1>
          <div style={{ width: 40 }} />
        </div>
        
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }} className="hide-scrollbar">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="touch-feedback"
              style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: activeTab === tab.id ? C.gold.main : C.bg.card, color: activeTab === tab.id ? '#000' : C.text.secondary, fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>{tab.icon}</span><span>{tab.name}</span>
            </button>
          ))}
        </div>
        
        {activeTab === 'regional' && (
          <div style={{ marginTop: 8, display: 'flex', gap: 6, overflowX: 'auto' }} className="hide-scrollbar">
            {Leaderboard.REGIONS.map(region => (
              <button key={region.id} onClick={() => setSelectedRegion(region.id)} className="touch-feedback"
                style={{ padding: '6px 10px', borderRadius: 6, border: selectedRegion === region.id ? `2px solid ${C.gold.main}` : `1px solid ${C.bg.border}`, background: selectedRegion === region.id ? C.bg.elevated : C.bg.card, color: C.text.primary, fontSize: 12, whiteSpace: 'nowrap', cursor: 'pointer' }}>
                {region.flag} {region.name}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {stats && (
        <div style={{ padding: '12px 16px', background: C.bg.surface, display: 'flex', justifyContent: 'space-around', borderBottom: `1px solid ${C.bg.border}` }}>
          <div style={{ textAlign: 'center' }}><div style={{ color: C.gold.main, fontSize: 20, fontWeight: 800 }}>#{stats.playerRank || '—'}</div><div style={{ color: C.text.secondary, fontSize: 11 }}>Tu posición</div></div>
          <div style={{ textAlign: 'center' }}><div style={{ color: C.accent.green, fontSize: 20, fontWeight: 800 }}>Top {stats.percentile}%</div><div style={{ color: C.text.secondary, fontSize: 11 }}>Percentil</div></div>
          <div style={{ textAlign: 'center' }}><div style={{ color: C.text.primary, fontSize: 20, fontWeight: 800 }}>{stats.totalPlayers}</div><div style={{ color: C.text.secondary, fontSize: 11 }}>Jugadores</div></div>
        </div>
      )}
      
      <div style={{ padding: '8px 16px', background: C.bg.card }}>
        <button onClick={() => setShowNearby(!showNearby)} className="touch-feedback"
          style={{ width: '100%', padding: '10px', borderRadius: 8, border: `1px solid ${C.bg.border}`, background: showNearby ? C.accent.blue + '30' : C.bg.elevated, color: showNearby ? C.accent.blue : C.text.secondary, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          {showNearby ? '📍 Mostrando jugadores cercanos' : '🔝 Mostrar Top 50'}
        </button>
      </div>
      
      <div className="mobile-scroll" style={{ flex: 1, padding: '8px 16px' }}>
        {displayData.map((player, index) => {
          const tierColors = RankSystem.TIER_COLORS[player.rankInfo?.tier] || {};
          const isTop3 = player.rank <= 3;
          const medals = ['🥇', '🥈', '🥉'];
          
          return (
            <div key={player.id || index} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', marginBottom: 6, borderRadius: 10, background: player.isPlayer ? `linear-gradient(135deg, ${C.gold.main}20, ${C.gold.dark}20)` : C.bg.card, border: player.isPlayer ? `2px solid ${C.gold.main}` : `1px solid ${C.bg.border}` }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: isTop3 ? 'transparent' : (player.isPlayer ? C.gold.main : C.bg.elevated), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: isTop3 ? 24 : 14, color: player.isPlayer ? '#000' : C.text.primary }}>
                {isTop3 ? medals[player.rank - 1] : player.rank}
              </div>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: tierColors.bg || C.bg.elevated, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, border: `2px solid ${tierColors.primary || C.bg.border}`, position: 'relative' }}>
                {player.avatar}
                {player.isOnline && <div style={{ position: 'absolute', bottom: -2, right: -2, width: 12, height: 12, borderRadius: '50%', background: C.accent.green, border: `2px solid ${C.bg.card}` }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: player.isPlayer ? C.gold.main : C.text.primary, fontWeight: 700, fontSize: 14 }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{player.isPlayer ? '⭐ ' : ''}{player.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.text.secondary, fontSize: 12, marginTop: 2 }}>
                  <span style={{ color: tierColors.primary }}>{player.rankInfo?.icon} {player.rankInfo?.name}</span><span>•</span><span>{player.winRate}% WR</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}><div style={{ color: C.gold.main, fontWeight: 800, fontSize: 16 }}>{player.rating}</div><div style={{ color: C.text.muted, fontSize: 11 }}>MMR</div></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE: TIENDA MEJORADA
// ============================================================================
const ShopScreen = ({ playerProfile, playerInventory, onPurchase, onClose }) => {
  const C = THEME.colors;
  const [activeCategory, setActiveCategory] = useState('tiles');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showCoinPurchase, setShowCoinPurchase] = useState(false);
  
  const categories = [
    { id: 'tiles', name: 'Fichas', icon: '🀄' },
    { id: 'boards', name: 'Tableros', icon: '🎯' },
    { id: 'avatars', name: 'Avatares', icon: '😎' },
    { id: 'emotes', name: 'Emotes', icon: '👋' },
    { id: 'effects', name: 'Efectos', icon: '✨' },
    { id: 'titles', name: 'Títulos', icon: '🏷️' },
    { id: 'frames', name: 'Marcos', icon: '🖼️' },
    { id: 'bundles', name: 'Paquetes', icon: '🎁' },
    { id: 'season', name: 'Pase', icon: '🏆' }
  ];
  
  const getItemsByCategory = (category) => {
    switch(category) {
      case 'tiles': return MonetizationSystem.TILE_DESIGNS;
      case 'boards': return MonetizationSystem.BOARD_DESIGNS;
      case 'avatars': return MonetizationSystem.AVATARS;
      case 'emotes': return MonetizationSystem.EMOTES;
      case 'effects': return MonetizationSystem.EFFECTS;
      case 'titles': return MonetizationSystem.TITLES;
      case 'frames': return MonetizationSystem.FRAMES;
      case 'bundles': return MonetizationSystem.BUNDLES;
      case 'season': return [MonetizationSystem.SEASON_PASS];
      default: return [];
    }
  };
  
  const items = getItemsByCategory(activeCategory);
  const owned = playerInventory || new Set();
  
  const RarityBadge = ({ rarity }) => {
    const colors = MonetizationSystem.RARITY_COLORS[rarity];
    if (!colors) return null;
    return <span style={{ padding: '2px 8px', borderRadius: 6, background: colors.bg, color: colors.text, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{colors.name}</span>;
  };
  
  return (
    <div style={{ position: 'fixed', inset: 0, background: `linear-gradient(180deg, ${C.bg.deep} 0%, #0a1628 100%)`, zIndex: 1000, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header mejorado */}
      <div className="safe-top" style={{ background: `linear-gradient(180deg, ${C.bg.surface} 0%, ${C.bg.card} 100%)`, borderBottom: `1px solid ${C.bg.border}`, padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={onClose} className="touch-feedback" style={{ background: C.bg.elevated, border: `1px solid ${C.bg.border}`, borderRadius: 10, color: C.text.primary, fontSize: 18, cursor: 'pointer', padding: '8px 12px' }}>← Volver</button>
          <h1 style={{ color: C.gold.main, fontSize: 22, fontWeight: 800, margin: 0, textShadow: `0 0 20px ${C.gold.main}30` }}>TIENDA</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowCoinPurchase(true)} className="touch-feedback" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px', borderRadius: 12, background: `linear-gradient(135deg, #9333ea20, #7c3aed30)`, border: `1px solid #9333ea50`, cursor: 'pointer' }}>
              <span>💎</span><span style={{ color: '#a855f7', fontWeight: 700, fontSize: 14 }}>{playerProfile?.coins || 0}</span><span style={{ color: C.accent.green, fontSize: 14, fontWeight: 800 }}>+</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Categorías mejoradas */}
      <div style={{ padding: '12px 16px', background: C.bg.surface, borderBottom: `1px solid ${C.bg.border}`, overflowX: 'auto' }} className="hide-scrollbar">
        <div style={{ display: 'flex', gap: 8 }}>
          {categories.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className="touch-feedback"
              style={{ 
                padding: '10px 16px', 
                borderRadius: 12, 
                border: activeCategory === cat.id ? `2px solid ${C.gold.main}` : `1px solid ${C.bg.border}`, 
                background: activeCategory === cat.id ? `linear-gradient(135deg, ${C.gold.main}30, ${C.gold.dark}20)` : C.bg.card, 
                color: activeCategory === cat.id ? C.gold.main : C.text.secondary, 
                fontWeight: 700, 
                fontSize: 13, 
                whiteSpace: 'nowrap', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 6,
                boxShadow: activeCategory === cat.id ? `0 0 15px ${C.gold.main}20` : 'none'
              }}>
              <span style={{ fontSize: 16 }}>{cat.icon}</span><span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="mobile-scroll" style={{ flex: 1, padding: 16 }}>
        {activeCategory === 'season' ? (
          <div style={{ background: `linear-gradient(135deg, ${C.gold.main}30, ${C.accent.blue}30)`, borderRadius: 16, padding: 20, border: `2px solid ${C.gold.main}` }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>🏆</div>
              <h2 style={{ color: C.gold.main, fontSize: 24, fontWeight: 800, margin: '0 0 8px' }}>Pase de Temporada</h2>
              <p style={{ color: C.text.secondary, fontSize: 14, margin: 0 }}>{MonetizationSystem.SEASON_PASS.description}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div style={{ background: C.bg.card, borderRadius: 12, padding: 12, textAlign: 'center' }}><div style={{ color: C.text.secondary, fontSize: 12, marginBottom: 4 }}>Duración</div><div style={{ color: C.text.primary, fontWeight: 700 }}>{MonetizationSystem.SEASON_PASS.duration} días</div></div>
              <div style={{ background: C.bg.card, borderRadius: 12, padding: 12, textAlign: 'center' }}><div style={{ color: C.text.secondary, fontSize: 12, marginBottom: 4 }}>Niveles</div><div style={{ color: C.text.primary, fontWeight: 700 }}>{MonetizationSystem.SEASON_PASS.tiers} niveles</div></div>
            </div>
            <button className="touch-feedback" style={{ width: '100%', padding: '16px', borderRadius: 12, border: 'none', background: `linear-gradient(135deg, ${C.gold.main}, ${C.gold.dark})`, color: '#000', fontWeight: 800, fontSize: 18, cursor: 'pointer' }}>
              Comprar - ${(MonetizationSystem.SEASON_PASS.price / 100).toFixed(2)}
            </button>
          </div>
        ) : activeCategory === 'bundles' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {items.map(bundle => (
              <div key={bundle.id} style={{ background: C.bg.card, borderRadius: 16, padding: 16, border: `1px solid ${C.bg.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                  <div><h3 style={{ color: C.text.primary, fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>{bundle.name}</h3><p style={{ color: C.text.secondary, fontSize: 12, margin: 0 }}>{bundle.description}</p></div>
                  <span style={{ padding: '4px 8px', borderRadius: 6, background: C.accent.green + '30', color: C.accent.green, fontSize: 12, fontWeight: 700 }}>{bundle.savings} OFF</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  {bundle.contents.map((item, i) => (<span key={i} style={{ padding: '4px 8px', borderRadius: 6, background: C.bg.elevated, color: C.text.secondary, fontSize: 11 }}>{item.type === 'coins' ? `💎 ${item.amount}` : item.type === 'tokens' ? `🪙 ${item.amount}` : `✨ ${item.id}`}</span>))}
                </div>
                <button className="touch-feedback" style={{ width: '100%', padding: '12px', borderRadius: 10, border: 'none', background: C.gold.main, color: '#000', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>${(bundle.price / 100).toFixed(2)}</button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {items.map(item => {
              const isOwned = owned.has(item.id);
              return (
                <div key={item.id} onClick={() => !isOwned && setSelectedItem(item)} className="touch-feedback" style={{ background: C.bg.card, borderRadius: 12, padding: 12, border: isOwned ? `2px solid ${C.accent.green}` : `1px solid ${C.bg.border}`, cursor: isOwned ? 'default' : 'pointer', opacity: isOwned ? 0.7 : 1 }}>
                  <div style={{ width: '100%', aspectRatio: '1', borderRadius: 8, background: C.bg.elevated, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, marginBottom: 8, border: item.color ? `3px solid ${item.color}` : 'none' }}>{item.emoji || item.preview || '✨'}</div>
                  <div style={{ marginBottom: 8 }}><div style={{ color: C.text.primary, fontWeight: 600, fontSize: 13, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div><RarityBadge rarity={item.rarity} /></div>
                  {isOwned ? (<div style={{ textAlign: 'center', padding: '8px', borderRadius: 8, background: C.accent.green + '20', color: C.accent.green, fontWeight: 700, fontSize: 12 }}>✓ Desbloqueado</div>) : (<div style={{ textAlign: 'center', padding: '8px', borderRadius: 8, background: item.price === 0 ? C.accent.green + '20' : C.bg.elevated, color: item.price === 0 ? C.accent.green : C.text.primary, fontWeight: 700, fontSize: 14 }}>{item.price === 0 ? 'GRATIS' : MonetizationSystem.formatPrice(item.price, item.currency)}</div>)}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {selectedItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 1001 }} onClick={() => setSelectedItem(null)}>
          <div style={{ background: C.bg.surface, borderRadius: 20, padding: 24, maxWidth: 320, width: '100%' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 100, height: 100, margin: '0 auto 16px', borderRadius: 16, background: C.bg.card, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56 }}>{selectedItem.emoji || selectedItem.preview || '✨'}</div>
            <h3 style={{ color: C.text.primary, fontSize: 20, fontWeight: 700, textAlign: 'center', margin: '0 0 8px' }}>{selectedItem.name}</h3>
            <div style={{ textAlign: 'center', marginBottom: 16 }}><RarityBadge rarity={selectedItem.rarity} /></div>
            <button onClick={() => { onPurchase?.(selectedItem); setSelectedItem(null); }} className="touch-feedback" style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: selectedItem.price === 0 ? C.accent.green : C.gold.main, color: selectedItem.price === 0 ? '#fff' : '#000', fontWeight: 700, fontSize: 16, cursor: 'pointer', marginBottom: 8 }}>{selectedItem.price === 0 ? '¡Obtener Gratis!' : `Comprar - ${MonetizationSystem.formatPrice(selectedItem.price, selectedItem.currency)}`}</button>
            <button onClick={() => setSelectedItem(null)} className="touch-feedback" style={{ width: '100%', padding: '12px', borderRadius: 12, border: `1px solid ${C.bg.border}`, background: 'transparent', color: C.text.secondary, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Cancelar</button>
          </div>
        </div>
      )}
      
      {showCoinPurchase && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 1001 }} onClick={() => setShowCoinPurchase(false)}>
          <div style={{ background: C.bg.surface, borderRadius: 20, padding: 20, maxWidth: 340, width: '100%', maxHeight: '80vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: C.text.primary, fontSize: 20, fontWeight: 700, textAlign: 'center', margin: '0 0 16px' }}>💎 Comprar Diamantes</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {MonetizationSystem.COIN_PACKS.map(pack => (
                <button key={pack.id} className="touch-feedback" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 12, border: pack.popular ? `2px solid ${C.gold.main}` : `1px solid ${C.bg.border}`, background: pack.popular ? C.gold.main + '20' : C.bg.card, cursor: 'pointer', position: 'relative' }}>
                  {pack.popular && <span style={{ position: 'absolute', top: -10, right: 10, padding: '2px 8px', borderRadius: 10, background: C.gold.main, color: '#000', fontSize: 10, fontWeight: 700 }}>POPULAR</span>}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><span style={{ fontSize: 24 }}>💎</span><span style={{ color: C.text.primary, fontWeight: 700, fontSize: 18 }}>{pack.coins}</span></div>
                  <span style={{ color: C.accent.green, fontWeight: 700, fontSize: 16, padding: '6px 12px', borderRadius: 8, background: C.accent.green + '20' }}>${(pack.price / 100).toFixed(2)}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setShowCoinPurchase(false)} className="touch-feedback" style={{ width: '100%', marginTop: 16, padding: '12px', borderRadius: 12, border: `1px solid ${C.bg.border}`, background: 'transparent', color: C.text.secondary, fontWeight: 600, cursor: 'pointer' }}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// COMPONENTE: INVENTARIO - Equipar Skins y Fondos
// ============================================================================
const InventoryScreen = ({ equippedCosmetics, onEquip, playerInventory, playerTier, onClose }) => {
  const C = THEME.colors;
  const [activeTab, setActiveTab] = useState('skinSets');
  
  const tabs = [
    { id: 'skinSets', name: 'Fichas', icon: '🀄' },
    { id: 'backgrounds', name: 'Fondos', icon: '🖼️' },
    { id: 'avatars', name: 'Avatares', icon: '😎' },
    { id: 'titles', name: 'Títulos', icon: '🏷️' }
  ];
  
  // Obtener skin sets que el jugador tiene
  const ownedSkinSets = Object.entries(SKIN_SETS).filter(([id]) => 
    id === 'classic' || playerInventory?.has(id)
  );
  
  // Obtener fondos que el jugador tiene
  const ownedBackgrounds = Object.entries(MENU_BACKGROUNDS).filter(([id]) => 
    id === 'default' || playerInventory?.has(id)
  );
  
  // Obtener avatares (desbloqueados por rango)
  const allAvatars = Object.entries(AVATARS);
  
  // Obtener títulos (desbloqueados por rango)
  const allTitles = Object.entries(PLAYER_TITLES);
  
  const handleEquipSkinSet = (setId) => {
    onEquip({ ...equippedCosmetics, skinSet: setId });
  };
  
  const handleEquipBackground = (bgId) => {
    onEquip({ ...equippedCosmetics, menuBackground: bgId });
  };
  
  const handleEquipAvatar = (avatarId) => {
    const avatar = AVATARS[avatarId];
    if (isTierUnlocked(playerTier, avatar.requiredTier)) {
      onEquip({ ...equippedCosmetics, avatar: avatarId });
    }
  };
  
  const handleEquipTitle = (titleId) => {
    const title = PLAYER_TITLES[titleId];
    if (isTierUnlocked(playerTier, title.requiredTier)) {
      onEquip({ ...equippedCosmetics, title: titleId });
    }
  };
  
  // Preview de Skin Set
  const SkinSetPreview = ({ setId, skinSet, isEquipped }) => {
    const tileImage = getTileImage(setId);
    const boardImage = getBoardImage(setId);
    
    return (
      <div 
        onClick={() => handleEquipSkinSet(setId)}
        className="touch-feedback"
        style={{
          background: isEquipped ? `linear-gradient(135deg, ${C.gold.main}20, ${C.gold.dark}10)` : C.bg.card,
          border: isEquipped ? `2px solid ${C.gold.main}` : `1px solid ${C.bg.border}`,
          borderRadius: 16,
          padding: 12,
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, justifyContent: 'center', alignItems: 'center' }}>
          <div style={{
            width: 60, height: 60, borderRadius: 8,
            background: (boardImage && skinSet.type === 'png')
              ? `url(${skinSet.board?.png}) center/cover`
              : `linear-gradient(135deg, ${skinSet.board?.background || '#1a4d2e'}, ${skinSet.board?.accent || '#2D5A3D'})`,
            border: `2px solid ${skinSet.board?.border || '#0d2e1a'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{
              width: 20, height: 36, borderRadius: 3,
              background: (tileImage && skinSet.type === 'png')
                ? `url(${skinSet.tile?.png}) center/cover`
                : skinSet.tile?.base || '#FFFFF0',
              border: `1px solid ${skinSet.tile?.border || '#8B7355'}`,
              display: 'flex', flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center', padding: 2
            }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: skinSet.tile?.dotColor || '#1a1a1a' }} />
              <div style={{ width: '80%', height: 1, background: skinSet.tile?.divider || '#A0522D' }} />
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: skinSet.tile?.dotColor || '#1a1a1a' }} />
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <h4 style={{ color: isEquipped ? C.gold.main : C.text.primary, fontSize: 14, fontWeight: 700, margin: '0 0 4px' }}>{skinSet.name}</h4>
          {isEquipped && <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, background: C.gold.main, color: '#000', fontSize: 10, fontWeight: 700 }}>EQUIPADO</span>}
        </div>
      </div>
    );
  };
  
  // Preview de Fondo
  const BackgroundPreview = ({ bgId, background, isEquipped }) => {
    const bgImage = getMenuBackgroundImage(bgId);
    return (
      <div onClick={() => handleEquipBackground(bgId)} className="touch-feedback"
        style={{
          background: isEquipped ? `linear-gradient(135deg, ${C.gold.main}20, ${C.gold.dark}10)` : C.bg.card,
          border: isEquipped ? `2px solid ${C.gold.main}` : `1px solid ${C.bg.border}`,
          borderRadius: 16, padding: 12, cursor: 'pointer', transition: 'all 0.2s ease'
        }}>
        <div style={{
          width: '100%', height: 80, borderRadius: 8, marginBottom: 12, overflow: 'hidden',
          background: (bgImage && background.type === 'png') ? `url(${background.png}) center/cover` : background.background,
          border: `1px solid ${C.bg.border}`
        }} />
        <div style={{ textAlign: 'center' }}>
          <h4 style={{ color: isEquipped ? C.gold.main : C.text.primary, fontSize: 14, fontWeight: 700, margin: '0 0 4px' }}>{background.name}</h4>
          {isEquipped && <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, background: C.gold.main, color: '#000', fontSize: 10, fontWeight: 700 }}>EQUIPADO</span>}
        </div>
      </div>
    );
  };
  
  // Preview de Avatar
  const AvatarPreview = ({ avatarId, avatar, isEquipped }) => {
    const isUnlocked = isTierUnlocked(playerTier, avatar.requiredTier);
    const avatarImage = getAvatarImage(avatarId);
    
    const tierColors = {
      bronze: '#CD7F32', silver: '#C0C0C0', gold: '#FFD700', platinum: '#E5E4E2',
      diamond: '#B9F2FF', master: '#9333EA', grandmaster: '#F59E0B', legend: '#EF4444'
    };
    
    return (
      <div 
        onClick={() => isUnlocked && handleEquipAvatar(avatarId)} 
        className="touch-feedback"
        style={{
          background: isEquipped ? `linear-gradient(135deg, ${C.gold.main}20, ${C.gold.dark}10)` : C.bg.card,
          border: isEquipped ? `2px solid ${C.gold.main}` : `1px solid ${C.bg.border}`,
          borderRadius: 16, padding: 12, cursor: isUnlocked ? 'pointer' : 'not-allowed',
          opacity: isUnlocked ? 1 : 0.5, transition: 'all 0.2s ease', position: 'relative'
        }}
      >
        {/* Badge de rango requerido */}
        {avatar.requiredTier && (
          <div style={{
            position: 'absolute', top: 8, right: 8,
            padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 700,
            background: isUnlocked ? tierColors[avatar.requiredTier] + '30' : C.bg.elevated,
            color: isUnlocked ? tierColors[avatar.requiredTier] : C.text.muted,
            textTransform: 'uppercase'
          }}>
            {avatar.requiredTier}
          </div>
        )}
        
        {/* Avatar */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: C.bg.elevated,
            border: `3px solid ${isEquipped ? C.gold.main : (isUnlocked ? tierColors[avatar.requiredTier] || C.bg.border : C.bg.border)}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', fontSize: 32
          }}>
            {avatar.type === 'png' && avatarImage ? (
              <img src={avatar.png} alt={avatar.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : avatar.type === 'png' && avatar.fallbackEmoji ? (
              avatar.fallbackEmoji
            ) : (
              avatar.emoji || '😊'
            )}
          </div>
        </div>
        
        {/* Info */}
        <div style={{ textAlign: 'center' }}>
          <h4 style={{ color: isEquipped ? C.gold.main : C.text.primary, fontSize: 13, fontWeight: 700, margin: '0 0 4px' }}>{avatar.name}</h4>
          <p style={{ color: C.text.muted, fontSize: 10, margin: 0 }}>{avatar.description}</p>
          {!isUnlocked && (
            <span style={{ display: 'inline-block', marginTop: 6, padding: '2px 8px', borderRadius: 4, background: C.bg.elevated, color: C.text.muted, fontSize: 10 }}>🔒 Bloqueado</span>
          )}
          {isEquipped && (
            <span style={{ display: 'inline-block', marginTop: 6, padding: '2px 8px', borderRadius: 4, background: C.gold.main, color: '#000', fontSize: 10, fontWeight: 700 }}>EQUIPADO</span>
          )}
        </div>
      </div>
    );
  };
  
  // Preview de Título
  const TitlePreview = ({ titleId, title, isEquipped }) => {
    const isUnlocked = isTierUnlocked(playerTier, title.requiredTier);
    
    return (
      <div 
        onClick={() => isUnlocked && handleEquipTitle(titleId)} 
        className="touch-feedback"
        style={{
          background: isEquipped ? `linear-gradient(135deg, ${C.gold.main}20, ${C.gold.dark}10)` : C.bg.card,
          border: isEquipped ? `2px solid ${C.gold.main}` : `1px solid ${C.bg.border}`,
          borderRadius: 12, padding: 12, cursor: isUnlocked ? 'pointer' : 'not-allowed',
          opacity: isUnlocked ? 1 : 0.5, transition: 'all 0.2s ease'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            color: title.color, 
            fontSize: 16, 
            fontWeight: 700, 
            marginBottom: 4,
            textShadow: title.glow ? `0 0 10px ${title.color}` : 'none'
          }}>
            {title.display}
          </div>
          <p style={{ color: C.text.muted, fontSize: 10, margin: '0 0 6px' }}>{title.description}</p>
          {!isUnlocked && (
            <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, background: C.bg.elevated, color: C.text.muted, fontSize: 10 }}>🔒 Bloqueado</span>
          )}
          {isEquipped && (
            <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, background: C.gold.main, color: '#000', fontSize: 10, fontWeight: 700 }}>EQUIPADO</span>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div style={{ position: 'fixed', inset: 0, background: C.bg.deep, zIndex: 1000, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div className="safe-top" style={{ background: C.bg.surface, borderBottom: `1px solid ${C.bg.border}`, padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={onClose} className="touch-feedback" style={{ background: C.bg.elevated, border: `1px solid ${C.bg.border}`, borderRadius: 10, color: C.text.primary, fontSize: 18, cursor: 'pointer', padding: '8px 12px' }}>← Volver</button>
          <h1 style={{ color: C.gold.main, fontSize: 22, fontWeight: 800, margin: 0, textShadow: `0 0 20px ${C.gold.main}30` }}>🎒 INVENTARIO</h1>
          <div style={{ width: 80 }} />
        </div>
      </div>
      
      {/* Tabs - Scrollable */}
      <div style={{ padding: '12px 16px', background: C.bg.surface, borderBottom: `1px solid ${C.bg.border}`, overflowX: 'auto' }} className="hide-scrollbar">
        <div style={{ display: 'flex', gap: 8, minWidth: 'max-content' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="touch-feedback"
              style={{
                padding: '10px 16px', borderRadius: 12,
                border: activeTab === tab.id ? `2px solid ${C.gold.main}` : `1px solid ${C.bg.border}`,
                background: activeTab === tab.id ? `linear-gradient(135deg, ${C.gold.main}30, ${C.gold.dark}20)` : C.bg.card,
                color: activeTab === tab.id ? C.gold.main : C.text.secondary,
                fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap'
              }}>
              <span style={{ fontSize: 18 }}>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="mobile-scroll" style={{ flex: 1, padding: 16 }}>
        {activeTab === 'skinSets' && (
          <>
            <p style={{ color: C.text.secondary, fontSize: 13, marginBottom: 16, textAlign: 'center' }}>Selecciona un set para cambiar fichas y tablero</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {ownedSkinSets.map(([id, skinSet]) => (
                <SkinSetPreview key={id} setId={id} skinSet={skinSet} isEquipped={equippedCosmetics.skinSet === id} />
              ))}
            </div>
            {ownedSkinSets.length <= 1 && (
              <div style={{ marginTop: 24, padding: 20, background: C.bg.card, borderRadius: 12, textAlign: 'center', border: `1px dashed ${C.bg.border}` }}>
                <p style={{ color: C.text.secondary, fontSize: 14, margin: '0 0 12px' }}>¡Consigue más sets en la tienda!</p>
                <button onClick={onClose} className="touch-feedback" style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: C.gold.main, color: '#000', fontWeight: 700, cursor: 'pointer' }}>Ir a Tienda</button>
              </div>
            )}
          </>
        )}
        
        {activeTab === 'backgrounds' && (
          <>
            <p style={{ color: C.text.secondary, fontSize: 13, marginBottom: 16, textAlign: 'center' }}>Personaliza el fondo del menú principal</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {ownedBackgrounds.map(([id, background]) => (
                <BackgroundPreview key={id} bgId={id} background={background} isEquipped={equippedCosmetics.menuBackground === id} />
              ))}
            </div>
            {ownedBackgrounds.length <= 1 && (
              <div style={{ marginTop: 24, padding: 20, background: C.bg.card, borderRadius: 12, textAlign: 'center', border: `1px dashed ${C.bg.border}` }}>
                <p style={{ color: C.text.secondary, fontSize: 14, margin: '0 0 12px' }}>¡Consigue más fondos en la tienda!</p>
                <button onClick={onClose} className="touch-feedback" style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: C.gold.main, color: '#000', fontWeight: 700, cursor: 'pointer' }}>Ir a Tienda</button>
              </div>
            )}
          </>
        )}
        
        {activeTab === 'avatars' && (
          <>
            <p style={{ color: C.text.secondary, fontSize: 13, marginBottom: 16, textAlign: 'center' }}>Desbloquea avatares subiendo de rango</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {allAvatars.map(([id, avatar]) => (
                <AvatarPreview key={id} avatarId={id} avatar={avatar} isEquipped={equippedCosmetics.avatar === id} />
              ))}
            </div>
          </>
        )}
        
        {activeTab === 'titles' && (
          <>
            <p style={{ color: C.text.secondary, fontSize: 13, marginBottom: 16, textAlign: 'center' }}>Desbloquea títulos subiendo de rango</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {allTitles.map(([id, title]) => (
                <TitlePreview key={id} titleId={id} title={title} isEquipped={equippedCosmetics.title === id} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE: RECOMPENSAS DIARIAS (MODAL)
// ============================================================================
const DailyRewardsModal = ({ dailyRewards, onClaim, onClose }) => {
  const C = THEME.colors;
  const rewards = MonetizationSystem.DAILY_LOGIN.rewards;
  const currentDay = dailyRewards.todayClaimed ? dailyRewards.currentStreak : 
    (dailyRewards.currentStreak === 7 ? 1 : dailyRewards.currentStreak + 1);
  
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.85)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16
    }} onClick={onClose}>
      <div style={{
        background: C.bg.surface,
        borderRadius: 20,
        padding: 20,
        maxWidth: 360,
        width: '100%',
        border: `2px solid ${C.gold.main}`
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🎁</div>
          <h2 style={{ color: C.gold.main, fontSize: 22, fontWeight: 800, margin: 0 }}>
            RECOMPENSAS DIARIAS
          </h2>
          <p style={{ color: C.text.secondary, fontSize: 12, margin: '4px 0 0' }}>
            ¡Entra cada día para mejores premios!
          </p>
        </div>
        
        {/* Grid de días */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 16 }}>
          {rewards.map((reward, i) => {
            const dayNum = i + 1;
            const isPast = dayNum < currentDay;
            const isCurrent = dayNum === currentDay;
            const canClaim = isCurrent && !dailyRewards.todayClaimed;
            
            return (
              <div key={i} style={{
                background: isPast ? 'rgba(16, 185, 129, 0.2)' : isCurrent ? C.gold.main + '30' : C.bg.card,
                border: `2px solid ${isPast ? '#10B981' : isCurrent ? C.gold.main : C.bg.border}`,
                borderRadius: 10,
                padding: 8,
                textAlign: 'center',
                position: 'relative',
                opacity: isPast ? 0.6 : 1
              }}>
                <div style={{ fontSize: 10, color: C.text.muted, marginBottom: 4 }}>Día {dayNum}</div>
                <div style={{ fontSize: 18 }}>{dayNum === 7 ? '🎉' : '🪙'}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: isPast ? '#10B981' : isCurrent ? C.gold.main : C.text.primary }}>
                  {reward.tokens}
                </div>
                {reward.coins > 0 && (
                  <div style={{ fontSize: 9, color: '#A855F7' }}>+{reward.coins}💎</div>
                )}
                {isPast && (
                  <div style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    background: '#10B981',
                    borderRadius: '50%',
                    width: 16,
                    height: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    color: '#fff'
                  }}>✓</div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Racha */}
        <div style={{
          background: C.bg.card,
          borderRadius: 12,
          padding: 12,
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ color: C.text.secondary, fontSize: 11 }}>Racha actual</div>
            <div style={{ color: '#F97316', fontSize: 18, fontWeight: 800 }}>
              🔥 {dailyRewards.currentStreak} {dailyRewards.currentStreak === 1 ? 'día' : 'días'}
            </div>
          </div>
          {dailyRewards.todayClaimed && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.2)',
              color: '#10B981',
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 700
            }}>
              ✓ Reclamado
            </div>
          )}
        </div>
        
        {/* Botón reclamar */}
        {!dailyRewards.todayClaimed ? (
          <button
            onClick={onClaim}
            style={{
              width: '100%',
              padding: 16,
              borderRadius: 12,
              border: 'none',
              background: `linear-gradient(135deg, ${C.gold.dark}, ${C.gold.main})`,
              color: C.bg.deep,
              fontSize: 16,
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            🎁 RECLAMAR DÍA {currentDay}
          </button>
        ) : (
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: 14,
              borderRadius: 12,
              border: `1px solid ${C.bg.border}`,
              background: C.bg.card,
              color: C.text.primary,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Volver mañana
          </button>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE: MISIONES DIARIAS (CARD)
// ============================================================================
const DailyMissionsCard = ({ dailyRewards, playerCurrencies, onClaimMission }) => {
  const C = THEME.colors;
  
  // Obtener 3 misiones aleatorias (pero consistentes por día)
  const today = new Date().toDateString();
  const seed = today.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const missions = MonetizationSystem.DAILY_MISSIONS
    .sort((a, b) => ((a.id.charCodeAt(0) * seed) % 100) - ((b.id.charCodeAt(0) * seed) % 100))
    .slice(0, 3);
  
  // Progreso de cada misión
  const getMissionProgress = (mission) => {
    switch (mission.type) {
      case 'games': return Math.min(dailyRewards.gamesPlayedToday, mission.target);
      case 'wins': return Math.min(dailyRewards.winsToday, mission.target);
      case 'dominos': return Math.min(dailyRewards.dominosToday, mission.target);
      case 'points': return Math.min(dailyRewards.pointsToday, mission.target);
      case 'streak': return Math.min(dailyRewards.streakToday, mission.target);
      default: return 0;
    }
  };
  
  return (
    <div style={{
      background: C.bg.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ color: C.text.primary, fontSize: 16, fontWeight: 700, margin: 0 }}>
          📋 Misiones Diarias
        </h3>
        <span style={{ color: C.text.muted, fontSize: 11 }}>
          Se reinician en {24 - new Date().getHours()}h
        </span>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {missions.map(mission => {
          const progress = getMissionProgress(mission);
          const isComplete = progress >= mission.target;
          const percent = Math.round((progress / mission.target) * 100);
          
          return (
            <div key={mission.id} style={{
              background: isComplete ? 'rgba(16, 185, 129, 0.1)' : C.bg.card,
              border: `1px solid ${isComplete ? '#10B981' : C.bg.border}`,
              borderRadius: 12,
              padding: 12
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                <div>
                  <div style={{ color: isComplete ? '#10B981' : C.text.primary, fontSize: 13, fontWeight: 600 }}>
                    {mission.name}
                  </div>
                  <div style={{ color: C.text.muted, fontSize: 11 }}>
                    {mission.description}
                  </div>
                </div>
                <div style={{
                  background: isComplete ? 'rgba(16, 185, 129, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                  color: isComplete ? '#10B981' : '#FBBF24',
                  padding: '4px 8px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 700
                }}>
                  {isComplete ? '✓ Completa' : `+${mission.reward.tokens} 🪙`}
                </div>
              </div>
              
              {/* Barra de progreso */}
              <div style={{
                height: 6,
                background: C.bg.elevated,
                borderRadius: 3,
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${percent}%`,
                  background: isComplete ? '#10B981' : '#FBBF24',
                  borderRadius: 3,
                  transition: 'width 0.3s ease'
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ color: C.text.muted, fontSize: 10 }}>{progress}/{mission.target}</span>
                <span style={{ color: C.text.muted, fontSize: 10 }}>{percent}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE: SISTEMA DE AMIGOS
// ============================================================================
const FriendsScreen = ({ 
  friends, 
  friendRequests, 
  onAcceptRequest, 
  onRejectRequest, 
  onRemoveFriend,
  onSendRequest,
  onInviteToGame,
  onClose,
  currentUser
}) => {
  const C = THEME.colors;
  const [activeTab, setActiveTab] = useState('friends'); // 'friends', 'requests', 'search'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Ordenar amigos: online primero, luego por rating
  const sortedFriends = [...friends].sort((a, b) => {
    const statusOrder = { online: 0, in_game: 1, away: 2, offline: 3 };
    const statusDiff = (statusOrder[a.status] || 3) - (statusOrder[b.status] || 3);
    if (statusDiff !== 0) return statusDiff;
    return b.rating - a.rating;
  });
  
  const onlineFriends = friends.filter(f => f.status === 'online' || f.status === 'in_game');
  
  // Simular búsqueda de jugadores
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    
    // Simular delay de red
    setTimeout(() => {
      // Generar resultados de búsqueda simulados
      const results = [
        { id: 'search_1', name: searchQuery + '123', avatar: '🎮', rating: 1450, tier: 'gold' },
        { id: 'search_2', name: 'Pro' + searchQuery, avatar: '⭐', rating: 1820, tier: 'platinum' },
        { id: 'search_3', name: searchQuery + '_Domino', avatar: '🎯', rating: 1250, tier: 'silver' }
      ].filter(r => !friends.some(f => f.name === r.name));
      
      setSearchResults(results);
      setIsSearching(false);
    }, 500);
  };
  
  // Formatear tiempo transcurrido
  const formatLastSeen = (timestamp) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes}m`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days}d`;
    return `Hace ${Math.floor(days / 7)}sem`;
  };
  
  // Colores de estado
  const statusColors = {
    online: '#10B981',
    in_game: '#F59E0B',
    away: '#6B7280',
    offline: '#374151'
  };
  
  const statusLabels = {
    online: 'En línea',
    in_game: 'En partida',
    away: 'Ausente',
    offline: 'Desconectado'
  };
  
  // Colores de tier
  const tierColors = {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#E5E4E2',
    diamond: '#B9F2FF',
    master: '#9333EA',
    grandmaster: '#F59E0B',
    legend: '#EF4444'
  };
  
  // Componente de tarjeta de amigo
  const FriendCard = ({ friend, showActions = true }) => (
    <div style={{
      background: C.bg.card,
      borderRadius: 14,
      padding: 14,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      border: `1px solid ${friend.status === 'online' ? 'rgba(16, 185, 129, 0.3)' : C.bg.border}`
    }}>
      {/* Avatar con indicador de estado */}
      <div style={{ position: 'relative' }}>
        <div style={{
          width: 50,
          height: 50,
          borderRadius: '50%',
          background: C.bg.elevated,
          border: `2px solid ${tierColors[friend.tier] || C.bg.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24
        }}>
          {friend.avatar}
        </div>
        <div style={{
          position: 'absolute',
          bottom: 2,
          right: 2,
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: statusColors[friend.status] || statusColors.offline,
          border: `2px solid ${C.bg.card}`,
          boxShadow: friend.status === 'online' ? `0 0 8px ${statusColors.online}` : 'none'
        }} />
      </div>
      
      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ 
            color: C.text.primary, 
            fontSize: 14, 
            fontWeight: 700,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {friend.name}
          </span>
          <span style={{
            padding: '2px 6px',
            borderRadius: 4,
            background: tierColors[friend.tier] + '30',
            color: tierColors[friend.tier],
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase'
          }}>
            {friend.tier}
          </span>
        </div>
        <div style={{ color: C.text.secondary, fontSize: 12 }}>
          {friend.rating} MMR • {friend.winRate}% WR
        </div>
        <div style={{ 
          color: statusColors[friend.status], 
          fontSize: 11,
          display: 'flex',
          alignItems: 'center',
          gap: 4
        }}>
          <span style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: statusColors[friend.status]
          }} />
          {friend.status === 'offline' ? formatLastSeen(friend.lastSeen) : statusLabels[friend.status]}
        </div>
      </div>
      
      {/* Acciones */}
      {showActions && (
        <div style={{ display: 'flex', gap: 8 }}>
          {(friend.status === 'online') && (
            <button
              onClick={() => onInviteToGame?.(friend)}
              className="touch-feedback"
              style={{
                background: C.accent.green,
                border: 'none',
                borderRadius: 10,
                padding: '10px 14px',
                color: '#fff',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              ⚔️ Invitar
            </button>
          )}
          <button
            onClick={() => onRemoveFriend?.(friend)}
            className="touch-feedback"
            style={{
              background: 'transparent',
              border: `1px solid ${C.bg.border}`,
              borderRadius: 10,
              padding: '10px',
              color: C.text.muted,
              fontSize: 14,
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
  
  // Componente de solicitud de amistad
  const RequestCard = ({ request, type = 'received' }) => (
    <div style={{
      background: C.bg.card,
      borderRadius: 14,
      padding: 14,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      border: `1px solid ${C.bg.border}`
    }}>
      {/* Avatar */}
      <div style={{
        width: 50,
        height: 50,
        borderRadius: '50%',
        background: C.bg.elevated,
        border: `2px solid ${tierColors[request.tier] || C.bg.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 24
      }}>
        {request.avatar}
      </div>
      
      {/* Info */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: C.text.primary, fontSize: 14, fontWeight: 700 }}>
            {request.name}
          </span>
          <span style={{
            padding: '2px 6px',
            borderRadius: 4,
            background: tierColors[request.tier] + '30',
            color: tierColors[request.tier],
            fontSize: 10,
            fontWeight: 700
          }}>
            {request.tier}
          </span>
        </div>
        <div style={{ color: C.text.secondary, fontSize: 12 }}>
          {request.rating} MMR
        </div>
        {request.message && (
          <div style={{ color: C.text.muted, fontSize: 11, fontStyle: 'italic' }}>
            "{request.message}"
          </div>
        )}
      </div>
      
      {/* Botones */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => onAcceptRequest?.(request)}
          className="touch-feedback"
          style={{
            background: C.accent.green,
            border: 'none',
            borderRadius: 10,
            padding: '10px 16px',
            color: '#fff',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          ✓ Aceptar
        </button>
        <button
          onClick={() => onRejectRequest?.(request)}
          className="touch-feedback"
          style={{
            background: 'transparent',
            border: `1px solid ${C.accent.red}`,
            borderRadius: 10,
            padding: '10px 16px',
            color: C.accent.red,
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
  
  // Componente de resultado de búsqueda
  const SearchResultCard = ({ player }) => {
    const isFriend = friends.some(f => f.id === player.id);
    const isPending = friendRequests.some(r => r.id === player.id);
    
    return (
      <div style={{
        background: C.bg.card,
        borderRadius: 14,
        padding: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        border: `1px solid ${C.bg.border}`
      }}>
        {/* Avatar */}
        <div style={{
          width: 50,
          height: 50,
          borderRadius: '50%',
          background: C.bg.elevated,
          border: `2px solid ${tierColors[player.tier] || C.bg.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24
        }}>
          {player.avatar}
        </div>
        
        {/* Info */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: C.text.primary, fontSize: 14, fontWeight: 700 }}>
              {player.name}
            </span>
            <span style={{
              padding: '2px 6px',
              borderRadius: 4,
              background: tierColors[player.tier] + '30',
              color: tierColors[player.tier],
              fontSize: 10,
              fontWeight: 700
            }}>
              {player.tier}
            </span>
          </div>
          <div style={{ color: C.text.secondary, fontSize: 12 }}>
            {player.rating} MMR
          </div>
        </div>
        
        {/* Botón agregar */}
        <button
          onClick={() => !isFriend && !isPending && onSendRequest?.(player)}
          disabled={isFriend || isPending}
          className="touch-feedback"
          style={{
            background: isFriend ? C.bg.elevated : isPending ? 'transparent' : C.accent.blue,
            border: isPending ? `1px solid ${C.bg.border}` : 'none',
            borderRadius: 10,
            padding: '10px 16px',
            color: isFriend || isPending ? C.text.muted : '#fff',
            fontSize: 12,
            fontWeight: 700,
            cursor: isFriend || isPending ? 'default' : 'pointer',
            opacity: isFriend || isPending ? 0.6 : 1
          }}
        >
          {isFriend ? '✓ Amigos' : isPending ? 'Pendiente' : '+ Agregar'}
        </button>
      </div>
    );
  };
  
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: C.bg.deep,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div className="safe-top" style={{
        background: C.bg.surface,
        borderBottom: `1px solid ${C.bg.border}`,
        padding: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button
            onClick={onClose}
            className="touch-feedback"
            style={{
              background: C.bg.elevated,
              border: `1px solid ${C.bg.border}`,
              borderRadius: 10,
              color: C.text.primary,
              fontSize: 18,
              cursor: 'pointer',
              padding: '8px 12px'
            }}
          >
            ← Volver
          </button>
          <h1 style={{
            color: C.text.primary,
            fontSize: 20,
            fontWeight: 800,
            margin: 0
          }}>
            👥 AMIGOS
          </h1>
          <div style={{
            background: onlineFriends.length > 0 ? 'rgba(16, 185, 129, 0.2)' : C.bg.elevated,
            color: onlineFriends.length > 0 ? '#10B981' : C.text.muted,
            padding: '6px 12px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700
          }}>
            {onlineFriends.length} online
          </div>
        </div>
        
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { id: 'friends', label: 'Amigos', icon: '👥', count: friends.length },
            { id: 'requests', label: 'Solicitudes', icon: '📩', count: friendRequests.length },
            { id: 'search', label: 'Buscar', icon: '🔍', count: null }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="touch-feedback"
              style={{
                flex: 1,
                padding: '10px 8px',
                borderRadius: 10,
                border: activeTab === tab.id ? `2px solid ${C.gold.main}` : `1px solid ${C.bg.border}`,
                background: activeTab === tab.id ? `${C.gold.main}20` : C.bg.card,
                color: activeTab === tab.id ? C.gold.main : C.text.secondary,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                position: 'relative'
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.count > 0 && tab.id === 'requests' && (
                <span style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  background: C.accent.red,
                  color: '#fff',
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  fontSize: 10,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Contenido */}
      <div className="mobile-scroll" style={{ flex: 1, padding: 16 }}>
        {/* TAB: AMIGOS */}
        {activeTab === 'friends' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Estadísticas */}
            <div style={{
              background: C.bg.surface,
              borderRadius: 14,
              padding: 14,
              display: 'flex',
              justifyContent: 'space-around',
              marginBottom: 8
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: C.text.primary, fontSize: 20, fontWeight: 800 }}>{friends.length}</div>
                <div style={{ color: C.text.muted, fontSize: 11 }}>Total</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#10B981', fontSize: 20, fontWeight: 800 }}>{onlineFriends.length}</div>
                <div style={{ color: C.text.muted, fontSize: 11 }}>En línea</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#F59E0B', fontSize: 20, fontWeight: 800 }}>
                  {friends.filter(f => f.status === 'in_game').length}
                </div>
                <div style={{ color: C.text.muted, fontSize: 11 }}>Jugando</div>
              </div>
            </div>
            
            {/* Lista de amigos */}
            {sortedFriends.length > 0 ? (
              sortedFriends.map(friend => (
                <FriendCard key={friend.id} friend={friend} />
              ))
            ) : (
              <div style={{
                textAlign: 'center',
                padding: 40,
                color: C.text.secondary
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                  No tienes amigos aún
                </div>
                <div style={{ fontSize: 13, color: C.text.muted }}>
                  Busca jugadores y envía solicitudes de amistad
                </div>
                <button
                  onClick={() => setActiveTab('search')}
                  style={{
                    marginTop: 16,
                    background: C.accent.blue,
                    border: 'none',
                    borderRadius: 10,
                    padding: '12px 24px',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  🔍 Buscar jugadores
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* TAB: SOLICITUDES */}
        {activeTab === 'requests' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {friendRequests.length > 0 ? (
              <>
                <div style={{ color: C.text.secondary, fontSize: 13, marginBottom: 8 }}>
                  {friendRequests.length} solicitud{friendRequests.length !== 1 ? 'es' : ''} pendiente{friendRequests.length !== 1 ? 's' : ''}
                </div>
                {friendRequests.map(request => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: 40,
                color: C.text.secondary
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                  Sin solicitudes
                </div>
                <div style={{ fontSize: 13, color: C.text.muted }}>
                  Las solicitudes de amistad aparecerán aquí
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* TAB: BUSCAR */}
        {activeTab === 'search' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Barra de búsqueda */}
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Buscar por nombre..."
                style={{
                  flex: 1,
                  background: C.bg.card,
                  border: `1px solid ${C.bg.border}`,
                  borderRadius: 12,
                  padding: '14px 16px',
                  color: C.text.primary,
                  fontSize: 14,
                  outline: 'none'
                }}
              />
              <button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="touch-feedback"
                style={{
                  background: C.accent.blue,
                  border: 'none',
                  borderRadius: 12,
                  padding: '14px 20px',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                  opacity: isSearching || !searchQuery.trim() ? 0.6 : 1
                }}
              >
                {isSearching ? '...' : '🔍'}
              </button>
            </div>
            
            {/* Resultados */}
            {searchResults.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ color: C.text.secondary, fontSize: 13 }}>
                  {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''}
                </div>
                {searchResults.map(player => (
                  <SearchResultCard key={player.id} player={player} />
                ))}
              </div>
            ) : searchQuery && !isSearching ? (
              <div style={{
                textAlign: 'center',
                padding: 40,
                color: C.text.secondary
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                <div style={{ fontSize: 14 }}>
                  No se encontraron jugadores
                </div>
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: 40,
                color: C.text.muted
              }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                <div style={{ fontSize: 14 }}>
                  Escribe un nombre para buscar jugadores
                </div>
              </div>
            )}
            
            {/* Sugerencias */}
            <div style={{
              marginTop: 16,
              background: C.bg.surface,
              borderRadius: 14,
              padding: 16
            }}>
              <div style={{ color: C.text.primary, fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
                💡 También puedes agregar amigos
              </div>
              <div style={{ color: C.text.secondary, fontSize: 12, lineHeight: 1.6 }}>
                • Después de una partida, toca el perfil del rival{'\n'}
                • Comparte tu código de amigo: <span style={{ color: C.gold.main, fontWeight: 700 }}>{currentUser?.name || 'TuNombre'}#1234</span>{'\n'}
                • Conecta con redes sociales
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE: LOGROS (ACHIEVEMENTS)
// ============================================================================
const AchievementsScreen = ({ playerStats, unlockedAchievements, onClose }) => {
  const C = THEME.colors;
  const [activeCategory, setActiveCategory] = useState('all');
  
  const categories = [
    { id: 'all', name: 'Todos', icon: '🏅' },
    ...Object.entries(ACHIEVEMENT_CATEGORIES).map(([id, cat]) => ({
      id, name: cat.name, icon: cat.icon
    }))
  ];
  
  // Filtrar logros por categoría
  const filteredAchievements = Object.values(ACHIEVEMENTS).filter(a => 
    activeCategory === 'all' || a.category === activeCategory
  );
  
  // Ordenar: desbloqueados primero, luego por progreso
  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    const aUnlocked = unlockedAchievements.has(a.id);
    const bUnlocked = unlockedAchievements.has(b.id);
    
    if (aUnlocked && !bUnlocked) return -1;
    if (!aUnlocked && bUnlocked) return 1;
    
    // Si ambos están bloqueados, ordenar por progreso
    if (!aUnlocked && !bUnlocked) {
      const aProgress = getAchievementProgress(a, playerStats);
      const bProgress = getAchievementProgress(b, playerStats);
      return bProgress - aProgress;
    }
    
    return 0;
  });
  
  // Estadísticas
  const totalAchievements = Object.keys(ACHIEVEMENTS).length;
  const unlockedCount = unlockedAchievements.size;
  const completionPercent = Math.round((unlockedCount / totalAchievements) * 100);
  
  // Componente de logro individual
  const AchievementCard = ({ achievement }) => {
    const isUnlocked = unlockedAchievements.has(achievement.id);
    const progress = getAchievementProgress(achievement, playerStats);
    const values = getAchievementValues(achievement, playerStats);
    const rarity = ACHIEVEMENT_RARITY[achievement.rarity];
    const category = ACHIEVEMENT_CATEGORIES[achievement.category];
    
    return (
      <div style={{
        background: isUnlocked 
          ? `linear-gradient(135deg, ${rarity.bg}, ${C.bg.card})` 
          : C.bg.card,
        border: `1px solid ${isUnlocked ? rarity.color + '50' : C.bg.border}`,
        borderRadius: 16,
        padding: 16,
        opacity: isUnlocked ? 1 : 0.8,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Badge de completado */}
        {isUnlocked && (
          <div style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: '#10B981',
            color: '#fff',
            padding: '2px 8px',
            borderRadius: 4,
            fontSize: 10,
            fontWeight: 700
          }}>
            ✓ COMPLETADO
          </div>
        )}
        
        {/* Header con icono y nombre */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 50,
            height: 50,
            borderRadius: 12,
            background: isUnlocked ? rarity.bg : C.bg.elevated,
            border: `2px solid ${isUnlocked ? rarity.color : C.bg.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            filter: isUnlocked ? 'none' : 'grayscale(50%)'
          }}>
            {achievement.icon}
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ 
              color: isUnlocked ? rarity.color : C.text.primary, 
              fontSize: 15, 
              fontWeight: 700, 
              margin: '0 0 4px',
              paddingRight: isUnlocked ? 80 : 0
            }}>
              {achievement.name}
            </h4>
            <p style={{ color: C.text.secondary, fontSize: 12, margin: 0 }}>
              {achievement.description}
            </p>
          </div>
        </div>
        
        {/* Barra de progreso (solo si no está desbloqueado) */}
        {!isUnlocked && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: C.text.muted, fontSize: 11 }}>Progreso</span>
              <span style={{ color: C.text.secondary, fontSize: 11, fontWeight: 600 }}>
                {typeof values.current === 'number' ? `${values.current}/${values.target}` : `${values.current}`}
              </span>
            </div>
            <div style={{
              height: 6,
              background: C.bg.elevated,
              borderRadius: 3,
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${category.color}, ${category.color}cc)`,
                borderRadius: 3,
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        )}
        
        {/* Recompensas */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          paddingTop: 8,
          borderTop: `1px solid ${C.bg.border}`
        }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {achievement.reward.tokens && (
              <span style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 4, 
                padding: '4px 8px', 
                borderRadius: 6, 
                background: 'rgba(251, 191, 36, 0.2)', 
                color: '#FBBF24', 
                fontSize: 12, 
                fontWeight: 600 
              }}>
                🪙 {achievement.reward.tokens}
              </span>
            )}
            {achievement.reward.coins && (
              <span style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 4, 
                padding: '4px 8px', 
                borderRadius: 6, 
                background: 'rgba(139, 92, 246, 0.2)', 
                color: '#A855F7', 
                fontSize: 12, 
                fontWeight: 600 
              }}>
                💎 {achievement.reward.coins}
              </span>
            )}
            {achievement.reward.title && (
              <span style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 4, 
                padding: '4px 8px', 
                borderRadius: 6, 
                background: 'rgba(236, 72, 153, 0.2)', 
                color: '#EC4899', 
                fontSize: 12, 
                fontWeight: 600 
              }}>
                🏷️ Título
              </span>
            )}
          </div>
          <span style={{ 
            padding: '2px 8px', 
            borderRadius: 4, 
            background: rarity.bg, 
            color: rarity.color, 
            fontSize: 10, 
            fontWeight: 700,
            textTransform: 'uppercase'
          }}>
            {rarity.name}
          </span>
        </div>
      </div>
    );
  };
  
  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      background: C.bg.deep, 
      zIndex: 1000, 
      display: 'flex', 
      flexDirection: 'column', 
      overflow: 'hidden' 
    }}>
      {/* Header */}
      <div className="safe-top" style={{ 
        background: C.bg.surface, 
        borderBottom: `1px solid ${C.bg.border}`, 
        padding: '16px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <button 
            onClick={onClose} 
            className="touch-feedback" 
            style={{ 
              background: C.bg.elevated, 
              border: `1px solid ${C.bg.border}`, 
              borderRadius: 10, 
              color: C.text.primary, 
              fontSize: 18, 
              cursor: 'pointer', 
              padding: '8px 12px' 
            }}
          >
            ← Volver
          </button>
          <h1 style={{ 
            color: C.gold.main, 
            fontSize: 22, 
            fontWeight: 800, 
            margin: 0, 
            textShadow: `0 0 20px ${C.gold.main}30` 
          }}>
            🏆 LOGROS
          </h1>
          <div style={{ width: 80 }} />
        </div>
        
        {/* Progreso general */}
        <div style={{
          background: C.bg.card,
          borderRadius: 12,
          padding: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <div style={{
            width: 50,
            height: 50,
            borderRadius: '50%',
            background: `conic-gradient(${C.gold.main} ${completionPercent}%, ${C.bg.elevated} 0%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: C.bg.card,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
              color: C.gold.main
            }}>
              {completionPercent}%
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: C.text.primary, fontWeight: 700, fontSize: 14 }}>
              {unlockedCount} / {totalAchievements} Logros
            </div>
            <div style={{ color: C.text.secondary, fontSize: 12 }}>
              ¡Sigue jugando para desbloquear más!
            </div>
          </div>
        </div>
      </div>
      
      {/* Categorías */}
      <div style={{ 
        padding: '12px 16px', 
        background: C.bg.surface, 
        borderBottom: `1px solid ${C.bg.border}`,
        overflowX: 'auto'
      }} className="hide-scrollbar">
        <div style={{ display: 'flex', gap: 8, minWidth: 'max-content' }}>
          {categories.map(cat => (
            <button 
              key={cat.id} 
              onClick={() => setActiveCategory(cat.id)} 
              className="touch-feedback"
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                border: activeCategory === cat.id ? `2px solid ${C.gold.main}` : `1px solid ${C.bg.border}`,
                background: activeCategory === cat.id ? `linear-gradient(135deg, ${C.gold.main}30, ${C.gold.dark}20)` : C.bg.card,
                color: activeCategory === cat.id ? C.gold.main : C.text.secondary,
                fontWeight: 600,
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                whiteSpace: 'nowrap'
              }}
            >
              <span style={{ fontSize: 16 }}>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Lista de logros */}
      <div className="mobile-scroll" style={{ flex: 1, padding: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sortedAchievements.map(achievement => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
        
        {sortedAchievements.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: 40,
            color: C.text.secondary
          }}>
            No hay logros en esta categoría
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE: TORNEOS
// ============================================================================
const TournamentsScreen = ({ playerProfile, onClose, onJoinTournament }) => {
  const C = THEME.colors;
  const [activeTab, setActiveTab] = useState('daily');
  
  const tabs = [{ id: 'daily', name: 'Diarios', icon: '📅' }, { id: 'weekly', name: 'Semanales', icon: '📆' }, { id: 'special', name: 'Especiales', icon: '⭐' }];
  
  const getTournaments = () => {
    switch(activeTab) {
      case 'daily': return MonetizationSystem.TOURNAMENTS.DAILY;
      case 'weekly': return MonetizationSystem.TOURNAMENTS.WEEKLY;
      case 'special': return MonetizationSystem.TOURNAMENTS.SPECIAL;
      default: return [];
    }
  };
  
  return (
    <div style={{ position: 'fixed', inset: 0, background: C.bg.deep, zIndex: 1000, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="safe-top" style={{ background: C.bg.surface, borderBottom: `1px solid ${C.bg.border}`, padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <button onClick={onClose} className="touch-feedback" style={{ background: 'transparent', border: 'none', color: C.text.primary, fontSize: 24, cursor: 'pointer', padding: 8 }}>←</button>
          <h1 style={{ color: C.text.primary, fontSize: 20, fontWeight: 700, margin: 0 }}>🏅 Torneos</h1>
          <div style={{ width: 40 }} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {tabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className="touch-feedback" style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: activeTab === tab.id ? C.gold.main : C.bg.card, color: activeTab === tab.id ? '#000' : C.text.secondary, fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}><span>{tab.icon}</span><span>{tab.name}</span></button>))}
        </div>
      </div>
      
      <div className="mobile-scroll" style={{ flex: 1, padding: 16 }}>
        {getTournaments().map(tournament => (
          <div key={tournament.id} style={{ background: C.bg.card, borderRadius: 16, padding: 16, marginBottom: 12, border: `1px solid ${C.bg.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
              <div><h3 style={{ color: C.text.primary, fontSize: 16, fontWeight: 700, margin: '0 0 4px' }}>{tournament.name}</h3><span style={{ padding: '2px 8px', borderRadius: 4, background: C.bg.elevated, color: C.text.secondary, fontSize: 11, textTransform: 'uppercase' }}>{tournament.format.replace('_', ' ')}</span></div>
              <div style={{ padding: '8px 12px', borderRadius: 8, background: tournament.entryFee === 0 ? C.accent.green + '30' : C.bg.elevated, color: tournament.entryFee === 0 ? C.accent.green : C.text.primary, fontWeight: 700, fontSize: 14 }}>{tournament.entryFee === 0 ? '¡GRATIS!' : MonetizationSystem.formatPrice(tournament.entryFee, tournament.currency)}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
              <div style={{ background: C.bg.elevated, borderRadius: 8, padding: 8, textAlign: 'center' }}><div style={{ color: C.gold.main, fontWeight: 700, fontSize: 16 }}>{typeof tournament.prizePool === 'number' ? MonetizationSystem.formatPrice(tournament.prizePool, tournament.prizeType) : '🎁'}</div><div style={{ color: C.text.secondary, fontSize: 10 }}>Premio</div></div>
              <div style={{ background: C.bg.elevated, borderRadius: 8, padding: 8, textAlign: 'center' }}><div style={{ color: C.text.primary, fontWeight: 700, fontSize: 16 }}>{tournament.maxPlayers}</div><div style={{ color: C.text.secondary, fontSize: 10 }}>Jugadores</div></div>
              <div style={{ background: C.bg.elevated, borderRadius: 8, padding: 8, textAlign: 'center' }}><div style={{ color: C.accent.green, fontWeight: 700, fontSize: 16 }}>{Math.floor(Math.random() * tournament.maxPlayers)}</div><div style={{ color: C.text.secondary, fontSize: 10 }}>Inscritos</div></div>
            </div>
            <button onClick={() => onJoinTournament?.(tournament)} className="touch-feedback" style={{ width: '100%', padding: '12px', borderRadius: 10, border: 'none', background: tournament.entryFee === 0 ? C.accent.green : C.gold.main, color: tournament.entryFee === 0 ? '#fff' : '#000', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>{tournament.requirement ? '🔒 Requisitos' : 'Inscribirse'}</button>
          </div>
        ))}
        
        <div style={{ background: C.bg.card, borderRadius: 12, padding: 16, marginTop: 8, border: `1px solid ${C.bg.border}` }}>
          <h4 style={{ color: C.text.primary, fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>📊 Distribución de Premios</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {Object.entries(MonetizationSystem.TOURNAMENTS.PRIZE_DISTRIBUTION.single_elimination).map(([place, pct]) => (
              <div key={place} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ color: C.text.secondary, fontSize: 12 }}>{place === '1' ? '🥇' : place === '2' ? '🥈' : place === '3' ? '🥉' : `${place}º`} Lugar</span>
                <span style={{ color: C.gold.main, fontWeight: 600, fontSize: 12 }}>{pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// ENGINE - Adaptado para SnakeBoard con SOCKETS
// ============================================================================
const Engine = {
  generateTiles: () => {
    const tiles = [];
    for (let i = 0; i <= CONFIG.maxTile; i++) {
      for (let j = i; j <= CONFIG.maxTile; j++) tiles.push({ left: i, right: j, id: `${i}-${j}` });
    }
    return tiles;
  },
  shuffle: arr => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  },
  isDouble: t => t.left === t.right,
  tileValue: t => t.left + t.right,
  tilesValue: tiles => tiles.reduce((s, t) => s + t.left + t.right, 0),
  
  // Obtener extremos del tablero (usando sockets)
  getBoardEnds: board => {
    if (!board.center) return { leftEnd: null, rightEnd: null };
    return {
      leftEnd: board.snakeTop?.value ?? null,
      rightEnd: board.snakeBottom?.value ?? null
    };
  },
  
  // Verificar si se puede jugar en una posición
  canPlayAt: (tile, pos, board) => {
    if (!board.center) return pos === 'center';
    if (pos === 'center') return false;
    const { leftEnd, rightEnd } = Engine.getBoardEnds(board);
    const endValue = pos === 'left' ? leftEnd : rightEnd;
    return tile.left === endValue || tile.right === endValue;
  },
  
  getValidPositions: (tile, board) => {
    if (!board.center) return ['center'];
    const pos = [];
    if (Engine.canPlayAt(tile, 'left', board)) pos.push('left');
    if (Engine.canPlayAt(tile, 'right', board)) pos.push('right');
    return pos;
  },
  
  canPlay: (tiles, board) => tiles.some(t => Engine.getValidPositions(t, board).length > 0),
  
  // Crear tablero inicial usando SnakeBoard
  createBoard: () => SnakeBoard.create(),
  
  // Colocar ficha en el tablero (deep clone para inmutabilidad)
  placeOnBoard: (board, tile, pos) => {
    // Deep clone del board (manejando el Set de occupiedCells)
    const newBoard = {
      tiles: JSON.parse(JSON.stringify(board.tiles)),
      center: board.center ? JSON.parse(JSON.stringify(board.center)) : null,
      occupiedCells: new Set(board.occupiedCells || []),
      snakeTop: board.snakeTop ? JSON.parse(JSON.stringify(board.snakeTop)) : null,
      snakeBottom: board.snakeBottom ? JSON.parse(JSON.stringify(board.snakeBottom)) : null
    };
    
    if (!newBoard.center) {
      // Colocar ficha central
      SnakeBoard.placeCenter(newBoard, tile);
    } else {
      // Colocar en un socket (left = top, right = bottom)
      const socketId = pos === 'left' ? 'top' : 'bottom';
      SnakeBoard.placeTile(newBoard, tile, socketId);
    }
    
    return newBoard;
  },
  
  findHighestDouble: players => {
    let highest = null, idx = 0;
    players.forEach((p, i) => p.tiles.forEach(t => { if (Engine.isDouble(t) && (!highest || t.left > highest.left)) { highest = t; idx = i; } }));
    return { tile: highest, playerIndex: idx };
  },
  
  // Si nadie tiene dobles, encontrar la ficha con mayor suma de pips
  findHighestTile: players => {
    let highest = null, idx = 0, maxSum = -1;
    players.forEach((p, i) => p.tiles.forEach(t => { 
      const sum = t.left + t.right;
      if (sum > maxSum) { 
        maxSum = sum; 
        highest = t; 
        idx = i; 
      } 
    }));
    return { tile: highest, playerIndex: idx };
  },
  
  // Encontrar el jugador con menor puntaje de un equipo
  findLowestInTeam: (players, team) => {
    let minPoints = Infinity, idx = 0;
    players.forEach((p, i) => {
      if (p.team === team) {
        const pts = Engine.tilesValue(p.tiles);
        if (pts < minPoints) {
          minPoints = pts;
          idx = i;
        }
      }
    });
    return idx;
  },
  
  teamPoints: players => { const pts = [0, 0]; players.forEach(p => { pts[p.team] += Engine.tilesValue(p.tiles); }); return pts; },
  removeTile: (players, pIdx, tileId) => players.map((p, i) => i === pIdx ? { ...p, tiles: p.tiles.filter(t => t.id !== tileId) } : p)
};

const AI = {
  // Cuenta cuántas fichas tiene cada número
  countNumbers: (tiles) => {
    const counts = {};
    for (let i = 0; i <= 9; i++) counts[i] = 0;
    tiles.forEach(t => {
      counts[t.left]++;
      counts[t.right]++;
    });
    return counts;
  },
  
  // Analiza qué números han sido jugados en el tablero
  getPlayedNumbers: (board) => {
    const played = {};
    for (let i = 0; i <= 9; i++) played[i] = 0;
    if (board.tiles) {
      board.tiles.forEach(t => {
        played[t.left]++;
        played[t.right]++;
      });
    }
    return played;
  },
  
  // Calcula qué números están "muertos" (ya salieron las 10 apariciones)
  getDeadNumbers: (board, myTiles) => {
    const dead = new Set();
    const played = AI.getPlayedNumbers(board);
    const mine = AI.countNumbers(myTiles);
    
    for (let i = 0; i <= 9; i++) {
      if (played[i] + mine[i] >= 9) {
        dead.add(i);
      }
    }
    return dead;
  },
  
  // Evalúa una jugada considerando JUEGO EN EQUIPO
  scoreMove: (move, player, board, teammate, opponents, isFirstMove, pIdx, passedNumbers) => {
    let score = 0;
    const tile = move.tile;
    const isDouble = Engine.isDouble(tile);
    const myCounts = AI.countNumbers(player.tiles);
    const deadNumbers = AI.getDeadNumbers(board, player.tiles);
    const myTeam = player.team;
    const teammateIdx = (pIdx + 2) % 4;
    
    // === ESTRATEGIA 1: Control de números ===
    const leftCount = myCounts[tile.left] || 0;
    const rightCount = myCounts[tile.right] || 0;
    
    // === ESTRATEGIA 2: Dobles - salir de ellos pronto ===
    if (isDouble) {
      score += 50 + tile.left * 5;
      if (leftCount >= 3) {
        score -= 30;
      }
    }
    
    // === ESTRATEGIA 3: Dejar extremos que controlo ===
    const ends = board.tiles?.length > 0 
      ? { left: board.snakeTop?.value, right: board.snakeBottom?.value }
      : { left: null, right: null };
    
    let numberILeave;
    if (move.position === 'left') {
      numberILeave = tile.left === ends.left ? tile.right : tile.left;
    } else if (move.position === 'right') {
      numberILeave = tile.left === ends.right ? tile.right : tile.left;
    } else {
      numberILeave = isDouble ? tile.left : Math.max(tile.left, tile.right);
    }
    
    const controlCount = myCounts[numberILeave] || 0;
    score += controlCount * 15;
    
    // === ESTRATEGIA 4: Evitar números muertos ===
    if (deadNumbers.has(numberILeave)) {
      score -= 40;
    }
    
    // === ESTRATEGIA 5: Bloquear oponentes ===
    const played = AI.getPlayedNumbers(board);
    if (played[numberILeave] >= 6) {
      score += 25;
    }
    
    // === ESTRATEGIA 6: Reducir puntos en mano ===
    score += Engine.tileValue(tile) * 2;
    
    // === ESTRATEGIA 7: Mantener opciones futuras ===
    const remainingTiles = player.tiles.filter(t => t.id !== tile.id);
    const newEnds = { ...ends };
    if (move.position === 'left') {
      newEnds.left = numberILeave;
    } else if (move.position === 'right') {
      newEnds.right = numberILeave;
    }
    
    let futurePlayable = 0;
    remainingTiles.forEach(t => {
      if (t.left === newEnds.left || t.right === newEnds.left ||
          t.left === newEnds.right || t.right === newEnds.right) {
        futurePlayable++;
      }
    });
    score += futurePlayable * 10;
    
    // === ESTRATEGIA 8: Primera jugada ===
    if (isFirstMove) {
      if (isDouble) {
        score += 30 + tile.left * 3;
      }
      score += (leftCount + rightCount) * 8;
    }
    
    // === ESTRATEGIA 9: JUEGO EN EQUIPO - Memoria de pases ===
    // Si mi compañero pasó cuando había cierto número, NO lo tiene
    if (passedNumbers && passedNumbers[teammateIdx]) {
      const teammateDoesntHave = passedNumbers[teammateIdx];
      if (teammateDoesntHave.has(numberILeave)) {
        score -= 50; // ¡No dejar un número que mi compañero no tiene!
      }
    }
    
    // Si un oponente pasó cuando había cierto número, bloquear con ese número es bueno
    const opp1 = (pIdx + 1) % 4;
    const opp2 = (pIdx + 3) % 4;
    if (passedNumbers) {
      if (passedNumbers[opp1]?.has(numberILeave)) {
        score += 30; // Oponente 1 no tiene este número
      }
      if (passedNumbers[opp2]?.has(numberILeave)) {
        score += 30; // Oponente 2 no tiene este número
      }
    }
    
    // === ESTRATEGIA 10: Ayudar al compañero ===
    const totalPlayed = played[numberILeave] || 0;
    const iHave = myCounts[numberILeave] || 0;
    const remainingInGame = 10 - totalPlayed - iHave;
    
    // Si quedan muchas de ese número, mi compañero podría tenerlas
    if (remainingInGame >= 3) {
      score += 15;
    }
    
    // === ESTRATEGIA 11: Castigar si dejo cerrado para mi equipo ===
    if (remainingInGame <= 1 && controlCount <= 1) {
      score -= 20;
    }
    
    // === ESTRATEGIA 12: Preferir cerrar números que los oponentes tienen ===
    if (totalPlayed <= 3 && iHave <= 1) {
      if (numberILeave === tile.left || numberILeave === tile.right) {
        score -= 15;
      }
    }
    
    // === ESTRATEGIA 13: Si el compañero tiene pocas fichas, dejarlo ganar ===
    if (teammate && teammate.tiles && teammate.tiles.length <= 2) {
      // Intentar no cerrar el juego, darle chance
      if (remainingInGame >= 2) {
        score += 20;
      }
    }
    
    // === ESTRATEGIA 14: Cuadrar cuando conviene ===
    // Si puedo cerrar y mi equipo tiene menos puntos probable
    if (ends.left === ends.right && 
        (tile.left === ends.left && tile.right === ends.left)) {
      // Esta ficha cuadra el juego
      score += 25;
    }
    
    return score;
  },
  
  decide: (state, pIdx, passedNumbers) => {
    const player = state.players[pIdx];
    const teammate = state.players[(pIdx + 2) % 4];
    const opponents = [state.players[(pIdx + 1) % 4], state.players[(pIdx + 3) % 4]];
    const board = state.board;
    const isFirstMove = !board.tiles || board.tiles.length === 0;
    
    if (state.mustPlayDouble) {
      const must = player.tiles.find(t => t.id === state.mustPlayDouble.id);
      if (must) return { action: 'play', tile: must, position: 'center' };
    }
    
    const moves = [];
    player.tiles.forEach(t => {
      Engine.getValidPositions(t, board).forEach(pos => {
        moves.push({ tile: t, position: pos });
      });
    });
    
    if (!moves.length) return { action: 'pass' };
    
    const scoredMoves = moves.map(m => ({
      ...m,
      score: AI.scoreMove(m, player, board, teammate, opponents, isFirstMove, pIdx, passedNumbers)
    }));
    
    scoredMoves.sort((a, b) => b.score - a.score);
    
    // Variación entre mejores jugadas para no ser predecible
    const topMoves = scoredMoves.filter(m => m.score >= scoredMoves[0].score - 10);
    const chosen = topMoves[Math.floor(Math.random() * topMoves.length)];
    
    return { action: 'play', tile: chosen.tile, position: chosen.position };
  }
};

// ============================================================================
// COMPONENTS - Diseño premium de fichas
// ============================================================================

// Patrón de puntos del dominó - basado en la cuadrícula 3x3 del doble 9
// Posiciones fijas: esquinas [20,80], medios [50], centro [50,50]
const DOT_GRID = {
  topLeft: [20, 20],
  topCenter: [50, 20],
  topRight: [80, 20],
  midLeft: [20, 50],
  midCenter: [50, 50],
  midRight: [80, 50],
  botLeft: [20, 80],
  botCenter: [50, 80],
  botRight: [80, 80]
};

// Qué posiciones usar para cada número (quitando del 9 hacia abajo)
const DOT_POSITIONS = {
  0: [],
  1: [DOT_GRID.midCenter],
  2: [DOT_GRID.topRight, DOT_GRID.botLeft],
  3: [DOT_GRID.topRight, DOT_GRID.midCenter, DOT_GRID.botLeft],
  4: [DOT_GRID.topLeft, DOT_GRID.topRight, DOT_GRID.botLeft, DOT_GRID.botRight],
  5: [DOT_GRID.topLeft, DOT_GRID.topRight, DOT_GRID.midCenter, DOT_GRID.botLeft, DOT_GRID.botRight],
  6: [DOT_GRID.topLeft, DOT_GRID.topRight, DOT_GRID.midLeft, DOT_GRID.midRight, DOT_GRID.botLeft, DOT_GRID.botRight],
  7: [DOT_GRID.topLeft, DOT_GRID.topRight, DOT_GRID.midLeft, DOT_GRID.midCenter, DOT_GRID.midRight, DOT_GRID.botLeft, DOT_GRID.botRight],
  8: [DOT_GRID.topLeft, DOT_GRID.topCenter, DOT_GRID.topRight, DOT_GRID.midLeft, DOT_GRID.midRight, DOT_GRID.botLeft, DOT_GRID.botCenter, DOT_GRID.botRight],
  9: [DOT_GRID.topLeft, DOT_GRID.topCenter, DOT_GRID.topRight, DOT_GRID.midLeft, DOT_GRID.midCenter, DOT_GRID.midRight, DOT_GRID.botLeft, DOT_GRID.botCenter, DOT_GRID.botRight]
};

// Icono de ficha Doble 9 - para usar como logo del juego
const Doble9Icon = ({ size = 60, animate = false }) => {
  const dotPositions = DOT_POSITIONS[9];
  const dotRadius = 4;
  const dotColor = '#1a1a1a';
  
  return (
    <div style={{
      width: size,
      height: size * 2,
      background: 'linear-gradient(180deg, #f5f5f0 0%, #e8e8e0 50%, #d4d4cc 100%)',
      borderRadius: size * 0.12,
      border: '2px solid #8b7355',
      boxShadow: '0 4px 15px rgba(0,0,0,0.3), inset 0 2px 0 rgba(255,255,255,0.8)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      animation: animate ? 'float-gpu 3s ease-in-out infinite' : 'none'
    }}>
      {/* Mitad superior - 9 */}
      <div style={{ flex: 1, borderBottom: '2px solid #b8a88a', padding: 2 }}>
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
          {dotPositions.map((p, i) => (
            <g key={`top-${i}`}>
              <circle cx={p[0] + 1} cy={p[1] + 1} r={dotRadius + 1} fill="rgba(0,0,0,0.15)" />
              <circle cx={p[0]} cy={p[1]} r={dotRadius} fill={dotColor} />
            </g>
          ))}
        </svg>
      </div>
      {/* Mitad inferior - 9 */}
      <div style={{ flex: 1, padding: 2 }}>
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
          {dotPositions.map((p, i) => (
            <g key={`bot-${i}`}>
              <circle cx={p[0] + 1} cy={p[1] + 1} r={dotRadius + 1} fill="rgba(0,0,0,0.15)" />
              <circle cx={p[0]} cy={p[1]} r={dotRadius} fill={dotColor} />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

// Componente de puntos que se adapta al tamaño del contenedor - NEGRO
const DotPattern = ({ num, size = 20, color, rotate = false }) => {
  const positions = DOT_POSITIONS[num] || [];
  const dotRadius = 8;
  const dotColor = color || '#1a1a1a';
  
  return (
    <svg 
      viewBox="0 0 100 100" 
      style={{ 
        width: '100%', 
        height: '100%',
        display: 'block',
        transform: rotate ? 'rotate(90deg)' : 'none'
      }}
    >
      {positions.map((p, i) => (
        <g key={i}>
          <circle cx={p[0] + 1} cy={p[1] + 1} r={dotRadius + 1} fill="rgba(0,0,0,0.15)" />
          <circle cx={p[0]} cy={p[1]} r={dotRadius} fill={dotColor} />
        </g>
      ))}
    </svg>
  );
};

// Puntos del dominó - NEGROS
const Dots = ({ num, color = '#1a1a1a', glowColor = null }) => {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {/* Sombra sutil de los puntos */}
      {DOT_POSITIONS[num]?.map((p, i) => (
        <circle key={`shadow-${i}`} cx={p[0] + 1} cy={p[1] + 1} r={9} fill="rgba(0,0,0,0.15)" />
      ))}
      {/* Puntos principales */}
      {DOT_POSITIONS[num]?.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={8} fill={color} 
          style={{ 
            filter: glowColor 
              ? `drop-shadow(0 0 3px ${glowColor}) drop-shadow(0 0 6px ${glowColor})`
              : 'drop-shadow(0 0 1px rgba(0,0,0,0.3))' 
          }} />
      ))}
    </svg>
  );
};

// Ficha horizontal (para tablero) - SIMPLIFICADA
const TileH = ({ leftNum, rightNum, isLast, isSelected, isPlayable, isMust }) => {
  const C = THEME.colors;
  
  return (
    <div style={{ 
      width: 48, 
      height: 24, 
      backgroundColor: isSelected ? '#FFD700' : '#FFFFF0',
      boxShadow: isSelected 
        ? '0 4px 12px rgba(255,215,0,0.5)'
        : isMust 
          ? '0 0 10px rgba(239,68,68,0.5)'
          : '2px 2px 6px rgba(0,0,0,0.3)',
      border: isSelected 
        ? '2px solid #B8860B' 
        : isMust 
          ? '2px solid #EF4444'
          : isPlayable 
            ? '2px solid #22C55E'
            : '2px solid #8B7355', 
      display: 'flex',
      borderRadius: 4
    }}>
      <div style={{ 
        flex: 1, 
        padding: 2, 
        borderRight: '2px solid #A0522D',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Dots num={leftNum} color="#1a1a1a" />
      </div>
      <div style={{ flex: 1, padding: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Dots num={rightNum} color="#1a1a1a" />
      </div>
    </div>
  );
};

// Ficha vertical (para mano del jugador) - SIMPLIFICADA
const TileV = ({ topNum, bottomNum, isLast, isSelected, isPlayable, isMust, size = 'normal', skinSetId = 'classic' }) => {
  const C = THEME.colors;
  // Obtener configuración del set
  const skinSet = getSkinSet(skinSetId);
  const tileConfig = skinSet.tile;
  const tileImage = getTileImage(skinSetId);
  
  // Tamaños adaptativos para móvil
  const sizes = {
    small: { w: 28, h: 56 },
    normal: { w: 36, h: 72 },
    large: { w: 44, h: 88 }
  };
  const { w, h } = sizes[size];
  
  // Determinar fondo según tipo de skin
  const backgroundStyle = (tileImage && skinSet.type === 'png')
    ? { backgroundImage: `url(${tileConfig.png})`, backgroundSize: 'cover' }
    : { backgroundColor: isSelected ? '#FFD700' : (tileConfig.base || '#FFFFF0') };
  
  return (
    <div 
      className="touch-feedback"
      style={{ 
        width: w, 
        height: h,
        minWidth: w,
        minHeight: h,
        ...backgroundStyle,
        boxShadow: isSelected 
          ? '0 6px 20px rgba(255,215,0,0.6)'
          : isMust 
            ? '0 0 15px rgba(239,68,68,0.6)'
            : '2px 2px 8px rgba(0,0,0,0.3)',
        border: isSelected 
          ? '3px solid #B8860B' 
          : isMust 
            ? '3px solid #EF4444'
            : isPlayable 
              ? `3px solid #22C55E`
              : `2px solid ${tileConfig.border || '#8B7355'}`, 
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 6,
        transform: isSelected ? 'scale(1.1) translateY(-8px)' : 'none',
        zIndex: isSelected ? 10 : 1,
        transition: 'transform 0.15s ease'
      }}>
      <div style={{ 
        flex: 1, 
        padding: 4, 
        borderBottom: `2px solid ${tileConfig.divider || '#A0522D'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Dots num={topNum} color={tileConfig.dotColor || '#1a1a1a'} />
      </div>
      <div style={{ 
        flex: 1, 
        padding: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Dots num={bottomNum} color={tileConfig.dotColor || '#1a1a1a'} />
      </div>
    </div>
  );
};

// ============================================================================
// DOMINO CUBANO - ENGINE CON COORDENADAS ENTERAS
// Socket = celda donde comienza la próxima ficha
// ============================================================================

const SegmentType = { VERTICAL: 'VERTICAL', HORIZONTAL: 'HORIZONTAL' };
const Direction = { UP: 'UP', DOWN: 'DOWN', LEFT: 'LEFT', RIGHT: 'RIGHT' };

// ============================================================================
// ENGINE DE SERPIENTE - PATRÓN S CON DOBLES CENTRADOS
// ============================================================================
// Basado en el diseño del usuario:
// - Fichas normales: coordenadas enteras (7.0, 10.0)
// - Dobles: offset de .5 para centrar (6.5, 9.5)
// - TOP sube, llega al borde, gira a DERECHA, baja por nueva columna
// - BOTTOM baja, llega al borde, gira a IZQUIERDA, sube por nueva columna

const BOARD_CONFIG = {
  width: 13,
  height: 19,
  centerX: 6,
  centerY: 9
};

// Sistema de ocupación (usa coordenadas enteras)
const createOccupancySet = () => new Set();

const markOccupied = (set, x, y, isDouble, isHorizontal) => {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  
  // Todas las fichas ocupan 2 celdas (incluyendo dobles)
  if (isHorizontal) {
    set.add(`${ix},${iy}`);
    set.add(`${ix + 1},${iy}`);
  } else {
    set.add(`${ix},${iy}`);
    set.add(`${ix},${iy + 1}`);
  }
};

const canPlaceTile = (set, x, y, isDouble, isHorizontal) => {
  const { width, height } = BOARD_CONFIG;
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  
  if (ix < 0 || iy < 0) return false;
  
  // Todas las fichas ocupan 2 celdas
  if (isHorizontal) {
    if (ix + 1 >= width || iy >= height) return false;
    if (set.has(`${ix},${iy}`) || set.has(`${ix + 1},${iy}`)) return false;
  } else {
    if (ix >= width || iy + 1 >= height) return false;
    if (set.has(`${ix},${iy}`) || set.has(`${ix},${iy + 1}`)) return false;
  }
  
  return true;
};

// ============================================================================
// SNAKE BOARD - Motor del tablero con patrón S
// ============================================================================
const SnakeBoard = {
  create: () => ({
    tiles: [],
    center: null,
    occupiedCells: createOccupancySet(),
    snakeTop: null,
    snakeBottom: null
  }),

  placeCenter: (board, tile) => {
    const { centerX, centerY } = BOARD_CONFIG;
    const isDouble = tile.left === tile.right;
    
    // Si es doble, centrar con offset 0.5 (igual que en tramos verticales)
    const x = isDouble ? centerX - 0.5 : centerX;
    const y = centerY;
    const isHorizontal = isDouble;
    
    const placed = {
      id: tile.id,
      left: tile.left,
      right: tile.right,
      x,
      y,
      isDouble,
      isHorizontal,
      orientation: isHorizontal ? 'HORIZONTAL' : 'VERTICAL',
      isCenter: true,
      visualTop: tile.left,
      visualBottom: tile.right
    };

    board.tiles = [placed];
    board.center = placed;
    board.occupiedCells = createOccupancySet();
    markOccupied(board.occupiedCells, x, y, isDouble, isHorizontal);

    // Inicializar estados de serpiente
    // Si es doble (horizontal), solo ocupa 1 celda de alto
    // Si no es doble (vertical), ocupa 2 celdas de alto
    if (isDouble) {
      board.snakeTop = {
        column: centerX,
        y: centerY - 2,
        direction: 'UP',
        value: tile.left,
        inElbow: false,
        elbowCount: 0,
        // Campos para posición real de última ficha (usados en codos)
        lastTileX: x,
        lastTileY: y,
        lastTileWasHorizontal: true,
        side: 'top'
      };
      
      board.snakeBottom = {
        column: centerX,
        y: centerY + 1,
        direction: 'DOWN',
        value: tile.right,
        inElbow: false,
        elbowCount: 0,
        lastTileX: x,
        lastTileY: y,
        lastTileWasHorizontal: true,
        side: 'bottom'
      };
    } else {
      board.snakeTop = {
        column: centerX,
        y: centerY - 2,
        direction: 'UP',
        value: tile.left,
        inElbow: false,
        elbowCount: 0,
        lastTileX: x,
        lastTileY: y,
        lastTileWasHorizontal: false,
        side: 'top'
      };
      
      board.snakeBottom = {
        column: centerX,
        y: centerY + 2,
        direction: 'DOWN',
        value: tile.right,
        inElbow: false,
        elbowCount: 0,
        lastTileX: x,
        lastTileY: y,
        lastTileWasHorizontal: false,
        side: 'bottom'
      };
    }

    return board;
  },

  canPlace: (tile, socketValue) => {
    return tile.left === socketValue || tile.right === socketValue;
  },

  getEnds: (board) => {
    if (!board.center) return { left: null, right: null };
    return {
      left: board.snakeTop?.value ?? null,
      right: board.snakeBottom?.value ?? null
    };
  },

  placeTile: (board, tile, socketId) => {
    const snake = socketId === 'top' ? board.snakeTop : board.snakeBottom;
    if (!snake) return null;

    // Validar conexión
    if (tile.left !== snake.value && tile.right !== snake.value) {
      return null;
    }

    const isDouble = tile.left === tile.right;

    // Valores de conexión
    let valueConecta, valueExpuesto;
    if (tile.left === snake.value) {
      valueConecta = tile.left;
      valueExpuesto = tile.right;
    } else {
      valueConecta = tile.right;
      valueExpuesto = tile.left;
    }

    // Calcular posición y orientación
    let x, y, isHorizontal;
    
    if (snake.inElbow) {
      // En codo - TODAS las fichas se colocan horizontal (incluyendo dobles)
      // Usar posiciones REALES de la última ficha
      const lastX = snake.lastTileX;
      const lastY = snake.lastTileY;
      const lastWasHorizontal = snake.lastTileWasHorizontal;
      
      const goingRight = snake.side === 'top';
      
      if (goingRight) {
        // TOP gira a la derecha
        // La ficha horizontal del codo debe ir a la derecha de la última ficha
        if (lastWasHorizontal) {
          // Última fue doble horizontal (centrado con .5): mantener decimal para que queden pegadas
          x = lastX + 2;
        } else {
          // Última fue vertical: columna entera
          x = Math.floor(lastX) + 1;
        }
        // Y: alineado con la última ficha
        if (snake.direction === 'UP') {
          // Venía subiendo - codo en la parte superior de la última ficha
          y = Math.floor(lastY);
        } else {
          // Venía bajando - codo en la parte inferior de la última ficha
          y = lastWasHorizontal ? Math.floor(lastY) : Math.floor(lastY) + 1;
        }
      } else {
        // BOTTOM gira a la izquierda
        // La ficha horizontal del codo debe ir a la izquierda de la última ficha
        if (lastWasHorizontal) {
          // Última fue doble horizontal (centrado con .5): mantener decimal
          x = lastX - 2;
        } else {
          // Última fue vertical: columna entera
          x = Math.floor(lastX) - 2;
        }
        // Y: alineado con la última ficha
        if (snake.direction === 'DOWN') {
          // Venía bajando - codo en la parte inferior de la última ficha
          y = lastWasHorizontal ? Math.floor(lastY) : Math.floor(lastY) + 1;
        } else {
          // Venía subiendo - codo en la parte superior de la última ficha
          y = Math.floor(lastY);
        }
      }
      isHorizontal = true;
    } else {
      // En tramo vertical
      if (isDouble) {
        // Doble horizontal en tramo vertical - CENTRADO con offset 0.5
        // x = column - 0.5 para que quede centrado visualmente
        x = snake.column - 0.5;
        if (snake.direction === 'UP') {
          y = snake.y + 1;
        } else {
          y = snake.y;
        }
        isHorizontal = true;
      } else {
        // Ficha vertical normal
        x = snake.column;
        y = snake.y;
        isHorizontal = false;
      }
    }

    // En codo, el doble se comporta como ficha normal (2 celdas)
    const effectiveIsDouble = snake.inElbow ? false : isDouble;

    // Validar que cabe
    if (!canPlaceTile(board.occupiedCells, x, y, effectiveIsDouble, isHorizontal)) {
      return null;
    }

    // Valores visuales
    let visualTop, visualBottom;
    if (!isHorizontal) {
      // Vertical
      if (snake.direction === 'UP') {
        visualTop = valueExpuesto;
        visualBottom = valueConecta;
      } else {
        visualTop = valueConecta;
        visualBottom = valueExpuesto;
      }
    } else {
      // Horizontal
      if (snake.inElbow) {
        if (socketId === 'top') {
          // TOP gira a la derecha: conecta izquierda, expone derecha
          visualTop = valueConecta;
          visualBottom = valueExpuesto;
        } else {
          // BOTTOM gira a la izquierda: conecta derecha, expone izquierda
          visualTop = valueExpuesto;
          visualBottom = valueConecta;
        }
      } else {
        // Doble horizontal en tramo vertical
        visualTop = tile.left;
        visualBottom = tile.right;
      }
    }

    const placed = {
      id: tile.id,
      left: tile.left,
      right: tile.right,
      x,
      y,
      isDouble,
      isHorizontal,
      orientation: isHorizontal ? 'HORIZONTAL' : 'VERTICAL',
      visualTop,
      visualBottom,
      // En codo, el doble se comporta como ficha normal (2 celdas)
      inElbow: snake.inElbow
    };

    board.tiles.push(placed);
    markOccupied(board.occupiedCells, x, y, effectiveIsDouble, isHorizontal);

    // Actualizar estado de la serpiente
    SnakeBoard.updateSnake(snake, socketId, isDouble, placed);
    snake.value = valueExpuesto;

    return placed;
  },

  updateSnake: (snake, socketId, isDouble, placedTile) => {
    const { height, width } = BOARD_CONFIG;
    
    if (snake.inElbow) {
      // En codo - después de colocar la ficha horizontal del codo
      snake.elbowCount++;
      
      const goingRight = snake.side === 'top';
      
      // Después de 1 ficha horizontal, volver a vertical
      if (snake.elbowCount >= 1) {
        snake.inElbow = false;
        snake.elbowCount = 0;
        
        // Invertir dirección vertical
        snake.direction = snake.direction === 'UP' ? 'DOWN' : 'UP';
        
        // Calcular columna: debajo/arriba del número expuesto (extremo alejado del codo)
        // La ficha del codo ocupa (placedTile.x, placedTile.y) y (placedTile.x+1, placedTile.y)
        // Usar Math.round para obtener columna entera más cercana al centro del número expuesto
        if (goingRight) {
          // TOP: número expuesto está en x+1 (derecha), centro en x+1.5
          snake.column = Math.round(placedTile.x + 1);
        } else {
          // BOTTOM: número expuesto está en x (izquierda), centro en x+0.5
          snake.column = Math.round(placedTile.x);
        }
        
        // Calcular posición Y para la siguiente ficha vertical
        if (snake.direction === 'DOWN') {
          // Ahora baja - empieza justo debajo del codo
          snake.y = Math.floor(placedTile.y) + 1;
          // Verificar si necesita otro codo inmediato
          if (snake.y + 1 >= 18) {
            snake.inElbow = true;
            snake.elbowCount = 0;
            snake.lastTileX = placedTile.x;
            snake.lastTileY = placedTile.y;
            snake.lastTileWasHorizontal = true;
          }
        } else {
          // Ahora sube - empieza justo arriba del codo
          snake.y = Math.floor(placedTile.y) - 2;
          // Verificar si necesita otro codo inmediato
          if (snake.y < 0) {
            snake.inElbow = true;
            snake.elbowCount = 0;
            snake.lastTileX = placedTile.x;
            snake.lastTileY = placedTile.y;
            snake.lastTileWasHorizontal = true;
          }
        }
      }
    } else {
      // En tramo vertical - actualizar Y para la siguiente ficha
      if (snake.direction === 'UP') {
        snake.y = Math.floor(placedTile.y) - 2;
      } else {
        if (isDouble) {
          snake.y = Math.floor(placedTile.y) + 1;
        } else {
          snake.y = Math.floor(placedTile.y) + 2;
        }
      }
      
      // Verificar bordes - activar codo si la siguiente ficha vertical no cabe
      const needsElbowUp = snake.direction === 'UP' && snake.y < 0;
      const needsElbowDown = snake.direction === 'DOWN' && (snake.y + 1 >= 18);
      
      if (needsElbowUp || needsElbowDown) {
        snake.inElbow = true;
        snake.elbowCount = 0;
        
        // Guardar posición REAL de la última ficha colocada
        snake.lastTileX = placedTile.x;
        snake.lastTileY = placedTile.y;
        snake.lastTileWasHorizontal = placedTile.isHorizontal;
      }
    }
  }
};

// ============================================================================
// TABLERO VISUAL - Contenedor real con fondo y bordes
// ============================================================================

// Dimensiones del tablero en celdas (deben coincidir con BOARD_CONFIG)
const BOARD_COLS = BOARD_CONFIG.width;
const BOARD_ROWS = BOARD_CONFIG.height;

// Componente de ficha boca abajo para oponentes - SIMPLE Y VISIBLE
const FaceDownTile = ({ size = 20, isVertical = true }) => {
  const width = isVertical ? size : size * 2;
  const height = isVertical ? size * 2 : size;
  
  return (
    <div style={{
      width,
      height,
      backgroundColor: '#FFFEF0',
      border: '2px solid #8B4513',
      borderRadius: 4,
      boxShadow: '2px 2px 4px rgba(0,0,0,0.3)',
      display: 'flex',
      flexDirection: isVertical ? 'column' : 'row'
    }}>
      <div style={{
        flex: 1,
        backgroundColor: '#FFF8E7',
        borderBottom: isVertical ? '2px solid #A0522D' : 'none',
        borderRight: !isVertical ? '2px solid #A0522D' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: Math.max(6, size * 0.3),
          height: Math.max(6, size * 0.3),
          borderRadius: '50%',
          backgroundColor: '#8B4513'
        }} />
      </div>
      <div style={{
        flex: 1,
        backgroundColor: '#FFF8E7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: Math.max(6, size * 0.3),
          height: Math.max(6, size * 0.3),
          borderRadius: '50%',
          backgroundColor: '#8B4513'
        }} />
      </div>
    </div>
  );
};

// Componente Board - Solo el tablero verde (sin manos de oponentes)
// ============================================================================
// BOARD CANVAS - Renderizado GPU-acelerado para Android
// Con colores de puntos iguales a las fichas de la mano
// ============================================================================
const BoardCanvas = ({ board, lastPlayed, cellSize, onBoardInfo, skinSetId = 'classic' }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const C = THEME.colors;
  const perfConfig = DeviceDetection.getPerformanceConfig();
  
  // Obtener set completo
  const skinSet = getSkinSet(skinSetId);
  const tileConfig = skinSet.tile;
  const boardConfig = skinSet.board;
  const tileImage = getTileImage(skinSetId);
  const boardImage = getBoardImage(skinSetId);
  
  const boardWidth = BOARD_COLS * cellSize;
  const boardHeight = BOARD_ROWS * cellSize;
  
  // Colores del tablero según set
  const feltColor = boardConfig.accent || '#2D5A3D';
  const feltDark = boardConfig.background || '#1a4d2e';
  
  // Color de puntos según set
  const dotColor = tileConfig.dotColor || '#1a1a1a';
  
  // Posiciones de puntos para cada número (igual que DOT_POSITIONS)
  const getDotPositions = useCallback((num, size) => {
    const s = size * 0.2;
    const m = size * 0.5;
    const e = size * 0.8;
    const positions = {
      0: [],
      1: [[m, m]],
      2: [[e, s], [s, e]],
      3: [[e, s], [m, m], [s, e]],
      4: [[s, s], [e, s], [s, e], [e, e]],
      5: [[s, s], [e, s], [m, m], [s, e], [e, e]],
      6: [[s, s], [e, s], [s, m], [e, m], [s, e], [e, e]],
      7: [[s, s], [e, s], [s, m], [m, m], [e, m], [s, e], [e, e]],
      8: [[s, s], [m, s], [e, s], [s, m], [e, m], [s, e], [m, e], [e, e]],
      9: [[s, s], [m, s], [e, s], [s, m], [m, m], [e, m], [s, e], [m, e], [e, e]]
    };
    return positions[num] || [];
  }, []);
  
  // Dibujar un punto con color y sombra (igual que Dots SVG)
  const drawDot = useCallback((ctx, cx, cy, radius, color) => {
    // Sombra del punto (ligeramente más grande, igual que en Dots: r=9 vs r=8)
    ctx.beginPath();
    ctx.arc(cx + 1, cy + 1, radius * 1.125, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fill();
    
    // Punto principal con color
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    
    // Brillo sutil (igual posición y tamaño que en Dots)
    if (!perfConfig.useReducedMotion) {
      ctx.beginPath();
      ctx.arc(cx - radius * 0.3, cy - radius * 0.3, radius * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fill();
    }
  }, [perfConfig.useReducedMotion]);
  
  // Dibujar una mitad de ficha con puntos negros
  const drawTileHalf = useCallback((ctx, x, y, size, num, isRotated = false) => {
    // Radio igual que en Dots SVG: 8 en viewBox de 100 = 8%
    const dotRadius = size * 0.08;
    const positions = getDotPositions(num, size);
    
    positions.forEach(([px, py]) => {
      let dotX, dotY;
      if (isRotated) {
        dotX = x + py;
        dotY = y + (size - px);
      } else {
        dotX = x + px;
        dotY = y + py;
      }
      drawDot(ctx, dotX, dotY, dotRadius, dotColor);
    });
  }, [getDotPositions, drawDot, dotColor]);
  
  // Dibujar ficha completa - con soporte PNG
  const drawTile = useCallback((ctx, tile) => {
    const x = tile.x * cellSize;
    const y = tile.y * cellSize;
    const isHorizontal = tile.orientation === 'HORIZONTAL';
    const isCenter = tile.isCenter;
    
    const tileWidth = isHorizontal ? cellSize * 2 : cellSize;
    const tileHeight = isHorizontal ? cellSize : cellSize * 2;
    const cornerRadius = 4;
    
    // Sombra externa
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // Dibujar fondo de la ficha
    ctx.beginPath();
    ctx.roundRect(x, y, tileWidth, tileHeight, cornerRadius);
    
    // Si hay imagen PNG cargada, usarla
    if (tileImage && skinSet.type === 'png') {
      ctx.save();
      ctx.clip();
      ctx.drawImage(tileImage, x, y, tileWidth, tileHeight);
      ctx.restore();
    } else {
      // Fallback a color sólido
      ctx.fillStyle = tileConfig.base || tileConfig.fallbackBase || '#FFFFF0';
      ctx.fill();
    }
    
    // Resetear sombra
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Borde
    ctx.strokeStyle = isCenter ? '#DC2626' : (tileConfig.border || '#8B7355');
    ctx.lineWidth = isCenter ? 3 : 2;
    ctx.beginPath();
    ctx.roundRect(x, y, tileWidth, tileHeight, cornerRadius);
    ctx.stroke();
    
    // Línea divisoria
    ctx.strokeStyle = tileConfig.divider || '#A0522D';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (isHorizontal) {
      ctx.moveTo(x + tileWidth / 2, y + 2);
      ctx.lineTo(x + tileWidth / 2, y + tileHeight - 2);
    } else {
      ctx.moveTo(x + 2, y + tileHeight / 2);
      ctx.lineTo(x + tileWidth - 2, y + tileHeight / 2);
    }
    ctx.stroke();
    
    // Dibujar puntos
    if (isHorizontal) {
      drawTileHalf(ctx, x, y, cellSize, tile.visualTop, true);
      drawTileHalf(ctx, x + cellSize, y, cellSize, tile.visualBottom, true);
    } else {
      drawTileHalf(ctx, x, y, cellSize, tile.visualTop, false);
      drawTileHalf(ctx, x, y + cellSize, cellSize, tile.visualBottom, false);
    }
  }, [cellSize, lastPlayed, drawTileHalf, skinSet, tileConfig, tileImage]);
  
  // Renderizar canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: false });
    const dpr = window.devicePixelRatio || 1;
    
    // Configurar canvas para alta resolución
    canvas.width = boardWidth * dpr;
    canvas.height = boardHeight * dpr;
    canvas.style.width = `${boardWidth}px`;
    canvas.style.height = `${boardHeight}px`;
    ctx.scale(dpr, dpr);
    
    // Fondo del tablero
    if (boardImage && skinSet.type === 'png') {
      // Usar imagen PNG del tablero
      ctx.drawImage(boardImage, 0, 0, boardWidth, boardHeight);
    } else {
      // CSS fallback - gradiente verde fieltro
      const gradient = ctx.createLinearGradient(0, 0, boardWidth, boardHeight);
      gradient.addColorStop(0, feltDark);
      gradient.addColorStop(0.5, feltColor);
      gradient.addColorStop(1, feltDark);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, boardWidth, boardHeight);
      
      // Textura de fieltro (fibras)
      ctx.globalAlpha = 0.15;
      for (let i = 0; i < 200; i++) {
        const x1 = Math.random() * boardWidth;
        const y1 = Math.random() * boardHeight;
        const length = 3 + Math.random() * 8;
        const angle = Math.random() * Math.PI * 2;
        
        ctx.strokeStyle = Math.random() > 0.5 ? '#0a3d1f' : '#2a7d4f';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 + Math.cos(angle) * length, y1 + Math.sin(angle) * length);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    
    // Viñeta sutil en los bordes
    const vignette = ctx.createRadialGradient(
      boardWidth/2, boardHeight/2, Math.min(boardWidth, boardHeight) * 0.3,
      boardWidth/2, boardHeight/2, Math.max(boardWidth, boardHeight) * 0.7
    );
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.15)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, boardWidth, boardHeight);
    
    // Borde del tablero
    ctx.strokeStyle = boardConfig.border || '#0d2e1a';
    ctx.lineWidth = 3;
    ctx.strokeRect(1, 1, boardWidth - 2, boardHeight - 2);
    
    // Estado vacío
    if (!board.tiles || board.tiles.length === 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.font = 'bold 24px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🀄', boardWidth / 2, boardHeight / 2 - 15);
      ctx.font = '12px system-ui';
      ctx.fillText('Esperando...', boardWidth / 2, boardHeight / 2 + 15);
      return;
    }
    
    // Dibujar fichas
    board.tiles.forEach(tile => drawTile(ctx, tile));
    
  }, [board, boardWidth, boardHeight, drawTile, perfConfig.useReducedMotion]);
  
  // Reportar posición del tablero para drag & drop
  useEffect(() => {
    if (!containerRef.current || !onBoardInfo) return;
    
    const updatePosition = () => {
      const rect = containerRef.current.getBoundingClientRect();
      
      // Calcular posiciones de los sockets
      let topSocket = null, bottomSocket = null, centerSocket = null;
      
      if (board.snakeTop) {
        topSocket = {
          x: board.snakeTop.column,
          y: board.snakeTop.y,
          screenX: board.snakeTop.column * cellSize + cellSize / 2,
          screenY: board.snakeTop.y * cellSize + cellSize
        };
      }
      
      if (board.snakeBottom) {
        bottomSocket = {
          x: board.snakeBottom.column,
          y: board.snakeBottom.y,
          screenX: board.snakeBottom.column * cellSize + cellSize / 2,
          screenY: board.snakeBottom.y * cellSize + cellSize
        };
      }
      
      if (!board.tiles || board.tiles.length === 0) {
        centerSocket = {
          x: BOARD_CONFIG.centerX,
          y: BOARD_CONFIG.centerY,
          screenX: BOARD_CONFIG.centerX * cellSize + cellSize / 2,
          screenY: BOARD_CONFIG.centerY * cellSize + cellSize
        };
      }
      
      onBoardInfo(
        { x: rect.left, y: rect.top, width: rect.width, height: rect.height, cellSize },
        { top: topSocket, bottom: bottomSocket, center: centerSocket }
      );
    };
    
    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [board, cellSize, onBoardInfo]);
  
  return (
    <div 
      ref={containerRef}
      className="gpu-layer contain-paint"
      style={{
        width: boardWidth,
        height: boardHeight,
        position: 'relative',
        border: `3px solid ${C.felt.border}`,
        borderRadius: 8,
        boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
        overflow: 'hidden',
        flexShrink: 0
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  );
};

// Board wrapper - usa Canvas en móvil, DOM en desktop
const Board = ({ board, lastPlayed, cellSize, onBoardInfo, skinSetId = 'classic' }) => {
  const isMobile = DeviceDetection.isMobile();
  const isLowEnd = DeviceDetection.isLowEndDevice();
  
  // Usar Canvas en móviles o dispositivos de gama baja
  if (isMobile || isLowEnd) {
    return <BoardCanvas board={board} lastPlayed={lastPlayed} cellSize={cellSize} onBoardInfo={onBoardInfo} skinSetId={skinSetId} />;
  }
  
  // Versión DOM para desktop
  return <BoardDOM board={board} lastPlayed={lastPlayed} cellSize={cellSize} onBoardInfo={onBoardInfo} skinSetId={skinSetId} />;
};

// Versión DOM del Board (para desktop) - con soporte PNG
const BoardDOM = ({ board, lastPlayed, cellSize, onBoardInfo, skinSetId = 'classic' }) => {
  const C = THEME.colors;
  const containerRef = useRef(null);
  
  // Obtener set completo
  const skinSet = getSkinSet(skinSetId);
  const tileConfig = skinSet.tile;
  const boardConfig = skinSet.board;
  const tileImage = getTileImage(skinSetId);
  
  const boardWidth = BOARD_COLS * cellSize;
  const boardHeight = BOARD_ROWS * cellSize;
  
  // Reportar posición del tablero
  useEffect(() => {
    if (!containerRef.current || !onBoardInfo) return;
    
    const updatePosition = () => {
      const rect = containerRef.current.getBoundingClientRect();
      
      let topSocket = null, bottomSocket = null, centerSocket = null;
      
      if (board.snakeTop) {
        topSocket = {
          x: board.snakeTop.column,
          y: board.snakeTop.y,
          screenX: board.snakeTop.column * cellSize + cellSize / 2,
          screenY: board.snakeTop.y * cellSize + cellSize
        };
      }
      
      if (board.snakeBottom) {
        bottomSocket = {
          x: board.snakeBottom.column,
          y: board.snakeBottom.y,
          screenX: board.snakeBottom.column * cellSize + cellSize / 2,
          screenY: board.snakeBottom.y * cellSize + cellSize
        };
      }
      
      if (!board.tiles || board.tiles.length === 0) {
        centerSocket = {
          x: BOARD_CONFIG.centerX,
          y: BOARD_CONFIG.centerY,
          screenX: BOARD_CONFIG.centerX * cellSize + cellSize / 2,
          screenY: BOARD_CONFIG.centerY * cellSize + cellSize
        };
      }
      
      onBoardInfo(
        { x: rect.left, y: rect.top, width: rect.width, height: rect.height, cellSize },
        { top: topSocket, bottom: bottomSocket, center: centerSocket }
      );
    };
    
    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [board, cellSize, onBoardInfo]);
  
  // Renderizar ficha - con soporte PNG
  const RenderTile = ({ tile }) => {
    const isCenter = tile.isCenter;
    const left = tile.x * cellSize;
    const top = tile.y * cellSize;
    const isHorizontal = tile.orientation === 'HORIZONTAL';
    
    const tileWidth = isHorizontal ? cellSize * 2 : cellSize;
    const tileHeight = isHorizontal ? cellSize : cellSize * 2;
    
    // Determinar fondo según tipo de skin
    const backgroundStyle = (tileImage && skinSet.type === 'png')
      ? { backgroundImage: `url(${tileConfig.png})`, backgroundSize: 'cover' }
      : { backgroundColor: tileConfig.base || '#FFFFF0' };
    
    return (
      <div 
        className="gpu-layer"
        style={{
          position: 'absolute',
          left,
          top,
          width: tileWidth,
          height: tileHeight,
          display: 'flex',
          flexDirection: isHorizontal ? 'row' : 'column',
          ...backgroundStyle,
          border: isCenter 
            ? '2px solid #DC2626' 
            : `2px solid ${tileConfig.border || '#8B7355'}`,
          borderRadius: 4,
          boxShadow: '2px 2px 6px rgba(0,0,0,0.4)'
        }}
      >
        {/* Mitad superior/izquierda */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRight: isHorizontal ? `2px solid ${tileConfig.divider || '#A0522D'}` : 'none',
          borderBottom: !isHorizontal ? `2px solid ${tileConfig.divider || '#A0522D'}` : 'none'
        }}>
          <Dots num={tile.visualTop} color={tileConfig.dotColor || '#1a1a1a'} />
        </div>
        {/* Mitad inferior/derecha */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Dots num={tile.visualBottom} color={tileConfig.dotColor || '#1a1a1a'} />
        </div>
      </div>
    );
  };

  // Determinar fondo del tablero
  const boardImage = getBoardImage(skinSetId);
  const boardBackgroundStyle = (boardImage && skinSet.type === 'png')
    ? { backgroundImage: `url(${boardConfig.png})`, backgroundSize: 'cover' }
    : { background: `linear-gradient(145deg, ${boardConfig.background || '#1a4d2e'} 0%, ${boardConfig.accent || '#2D5A3D'} 50%, ${boardConfig.background || '#1a4d2e'} 100%)` };

  return (
    <div 
      ref={containerRef}
      className="gpu-layer contain-paint"
      style={{
        width: boardWidth,
        height: boardHeight,
        position: 'relative',
        ...boardBackgroundStyle,
        border: `3px solid ${boardConfig.border || '#0d2e1a'}`,
        borderRadius: 8,
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.4), 0 4px 15px rgba(0,0,0,0.5)',
        overflow: 'hidden',
        flexShrink: 0
      }}>
      {(!board.tiles || board.tiles.length === 0) && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ marginBottom: 8, opacity: 0.5 }}>
            <Doble9Icon size={30} />
          </div>
          <p style={{ color: C.accent.slate, fontSize: 12, fontWeight: 500 }}>
            Esperando...
          </p>
        </div>
      )}
      
      {board.tiles && board.tiles.map(tile => (
        <RenderTile key={tile.id} tile={tile} />
      ))}
    </div>
  );
};

// Mano de oponente horizontal (arriba) con avatar y nombre
const OpponentHandTop = ({ count, tileSize, player, onAvatarClick, isCurrentTurn }) => {
  const C = THEME.colors;
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      padding: '4px 0',
      flexShrink: 0
    }}>
      {/* Fichas */}
      <div style={{ display: 'flex', gap: 2 }}>
        {Array(count).fill(0).map((_, i) => (
          <FaceDownTile key={i} size={tileSize} isVertical={true} />
        ))}
      </div>
      {/* Avatar y Nombre */}
      {player && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}>
          <button
            onClick={() => onAvatarClick?.(player)}
            className="touch-feedback"
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: player.team === 0 ? C.accent.blue : C.accent.red,
              border: isCurrentTurn ? '3px solid #FFD700' : '2px solid rgba(255,255,255,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: isCurrentTurn ? '0 0 10px #FFD700' : '0 2px 4px rgba(0,0,0,0.3)',
              animation: isCurrentTurn ? 'pulse 1.5s infinite' : 'none'
            }}
          >
            {player.avatar}
          </button>
          <span style={{
            fontSize: 11,
            fontWeight: 'bold',
            color: '#FFFFFF',
            textShadow: '0 1px 3px rgba(0,0,0,0.8)',
            maxWidth: 70,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {player.name}
          </span>
        </div>
      )}
    </div>
  );
};

// Mano de oponente vertical (lados) con avatar y nombre
const OpponentHandSide = ({ count, tileSize, player, onAvatarClick, side, isCurrentTurn }) => {
  const C = THEME.colors;
  const isLeft = side === 'left';
  
  return (
    <div style={{
      display: 'flex',
      flexDirection: isLeft ? 'row' : 'row-reverse',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
      padding: '0 4px',
      flexShrink: 0
    }}>
      {/* Fichas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {Array(count).fill(0).map((_, i) => (
          <FaceDownTile key={i} size={tileSize} isVertical={false} />
        ))}
      </div>
      {/* Avatar y Nombre */}
      {player && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}>
          <button
            onClick={() => onAvatarClick?.(player)}
            className="touch-feedback"
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: player.team === 0 ? C.accent.blue : C.accent.red,
              border: isCurrentTurn ? '3px solid #FFD700' : '2px solid rgba(255,255,255,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              cursor: 'pointer',
              boxShadow: isCurrentTurn ? '0 0 10px #FFD700' : '0 2px 4px rgba(0,0,0,0.3)',
              animation: isCurrentTurn ? 'pulse 1.5s infinite' : 'none'
            }}
          >
            {player.avatar}
          </button>
          <span style={{
            fontSize: 10,
            fontWeight: 'bold',
            color: '#FFFFFF',
            textShadow: '0 1px 3px rgba(0,0,0,0.8)',
            maxWidth: 60,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            writingMode: 'horizontal-tb'
          }}>
            {player.name}
          </span>
        </div>
      )}
    </div>
  );
};

// Área de juego completa con tablero y manos de oponentes
const GameArea = ({ board, lastPlayed, players, playerPassed, flyingTile, onAvatarClick, onBoardInfo, currentPlayer = 0, skinSetId = 'classic' }) => {
  const C = THEME.colors;
  const containerRef = useRef(null);
  const boardRef = useRef(null);
  const [cellSize, setCellSize] = useState(28);
  
  // cellSize fijo para que las fichas del tablero sean del mismo tamaño que las de la mano
  useEffect(() => {
    setCellSize(28);
  }, []);
  
  // Calcular y exponer posiciones de drop cuando cambia el board
  useEffect(() => {
    if (!boardRef.current || !onBoardInfo) return;
    
    const boardRect = boardRef.current.getBoundingClientRect();
    const boardWidth = BOARD_COLS * cellSize;
    const boardHeight = BOARD_ROWS * cellSize;
    
    // Calcular posiciones de drop en coordenadas de pantalla
    const snakePositions = {};
    
    // Centro (primera ficha)
    if (!board.tiles || board.tiles.length === 0) {
      snakePositions.center = {
        screenX: (BOARD_CONFIG.centerX + 0.5) * cellSize,
        screenY: (BOARD_CONFIG.centerY + 1) * cellSize
      };
    }
    
    // Extremo TOP (snake top)
    if (board.snakeTop) {
      const snake = board.snakeTop;
      let dropX, dropY;
      
      if (snake.inElbow) {
        // En codo horizontal - usar posición real
        const lastX = snake.lastTileX || snake.column;
        const lastY = snake.lastTileY || snake.y;
        const lastWasHorizontal = snake.lastTileWasHorizontal || false;
        
        if (snake.side === 'top') {
          // TOP gira derecha: codo va a la derecha
          // Mantener decimal si última fue horizontal (doble centrado)
          const elbowX = lastWasHorizontal ? lastX + 2 : Math.floor(lastX) + 1;
          dropX = elbowX * cellSize + cellSize; // Centro de la ficha horizontal
        } else {
          // BOTTOM gira izquierda: codo va a la izquierda
          const elbowX = lastWasHorizontal ? lastX - 2 : Math.floor(lastX) - 2;
          dropX = elbowX * cellSize + cellSize;
        }
        dropY = Math.floor(lastY) * cellSize + cellSize / 2;
      } else {
        // Vertical normal
        dropX = (snake.column + 0.5) * cellSize;
        dropY = (snake.y + 1) * cellSize;
      }
      snakePositions.top = { screenX: dropX, screenY: dropY };
    }
    
    // Extremo BOTTOM (snake bottom)
    if (board.snakeBottom) {
      const snake = board.snakeBottom;
      let dropX, dropY;
      
      if (snake.inElbow) {
        // En codo horizontal - usar posición real
        const lastX = snake.lastTileX || snake.column;
        const lastY = snake.lastTileY || snake.y;
        const lastWasHorizontal = snake.lastTileWasHorizontal || false;
        
        if (snake.side === 'top') {
          // TOP gira derecha
          const elbowX = lastWasHorizontal ? lastX + 2 : Math.floor(lastX) + 1;
          dropX = elbowX * cellSize + cellSize;
        } else {
          // BOTTOM gira izquierda
          const elbowX = lastWasHorizontal ? lastX - 2 : Math.floor(lastX) - 2;
          dropX = elbowX * cellSize + cellSize;
        }
        const elbowY = lastWasHorizontal ? Math.floor(lastY) : Math.floor(lastY) + 1;
        dropY = elbowY * cellSize + cellSize / 2;
      } else {
        // Vertical normal
        dropX = (snake.column + 0.5) * cellSize;
        dropY = (snake.y + 1) * cellSize;
      }
      snakePositions.bottom = { screenX: dropX, screenY: dropY };
    }
    
    onBoardInfo({
      x: boardRect.left,
      y: boardRect.top,
      width: boardWidth,
      height: boardHeight,
      cellSize
    }, snakePositions);
  }, [board, cellSize, onBoardInfo]);
  
  // Fichas de oponentes - un poco más grandes
  const opponentTileSize = Math.max(20, cellSize);
  
  const getPlayerTileCount = (idx) => {
    if (!players || !players[idx]) return 7;
    return players[idx].tiles?.length ?? 0;
  };
  
  // Indicador de "PASÓ"
  const PassIndicator = ({ position }) => (
    <div style={{
      position: 'absolute',
      ...position,
      background: `${C.accent.red}ee`,
      color: '#fff',
      padding: '2px 8px',
      borderRadius: 8,
      fontSize: 10,
      fontWeight: 900,
      animation: 'fadeInOut 1.5s ease-out forwards',
      zIndex: 100,
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
    }}>
      PASÓ
    </div>
  );
  
  // Posiciones de los indicadores de pase según jugador
  const passPositions = {
    0: { bottom: 10, left: '50%', transform: 'translateX(-50%)' }, // Abajo (jugador)
    1: { right: 40, top: '50%', transform: 'translateY(-50%)' },   // Derecha
    2: { top: 45, left: '50%', transform: 'translateX(-50%)' },    // Arriba
    3: { left: 40, top: '50%', transform: 'translateY(-50%)' }     // Izquierda
  };
  
  // Animación de ficha volando hacia posición exacta
  const FlyingTileAnimation = () => {
    if (!flyingTile) return null;
    
    const { tile, fromPlayer, targetX, targetY, isHorizontal } = flyingTile;
    
    // Calcular dimensiones del tablero
    const boardWidth = BOARD_COLS * cellSize;
    const boardHeight = BOARD_ROWS * cellSize;
    
    // El tablero está centrado, calcular offset
    const containerWidth = containerRef.current?.offsetWidth || 300;
    const containerHeight = containerRef.current?.offsetHeight || 400;
    
    // Posición del tablero dentro del contenedor (centrado)
    const boardOffsetX = (containerWidth - boardWidth) / 2;
    const boardOffsetY = (containerHeight - boardHeight) / 2 + 22; // +22 por mano superior
    
    // Posición final exacta de la ficha en píxeles
    const finalX = boardOffsetX + (targetX * cellSize);
    const finalY = boardOffsetY + (targetY * cellSize);
    
    // Posiciones iniciales según el jugador (en píxeles)
    const getStartPosition = () => {
      switch(fromPlayer) {
        case 0: // Abajo (jugador)
          return { x: containerWidth / 2, y: containerHeight };
        case 1: // Derecha
          return { x: containerWidth, y: containerHeight / 2 };
        case 2: // Arriba (compañero)
          return { x: containerWidth / 2, y: 0 };
        case 3: // Izquierda
          return { x: 0, y: containerHeight / 2 };
        default:
          return { x: containerWidth / 2, y: containerHeight / 2 };
      }
    };
    
    const startPos = getStartPosition();
    
    // Todas las fichas son de 2 celdas (incluyendo dobles)
    const tileWidth = isHorizontal ? cellSize * 2 : cellSize;
    const tileHeight = isHorizontal ? cellSize : cellSize * 2;
    
    return (
      <>
        <div 
          className="flying-tile-animation"
          style={{
            position: 'absolute',
            left: startPos.x - tileWidth / 2,
            top: startPos.y - tileHeight / 2,
            width: tileWidth,
            height: tileHeight,
            zIndex: 200,
            '--end-x': `${finalX - startPos.x + tileWidth / 2}px`,
            '--end-y': `${finalY - startPos.y + tileHeight / 2}px`,
            animation: 'flyToPosition 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
          }}>
          <div style={{
            width: '100%',
            height: '100%',
            background: `linear-gradient(180deg, ${C.tile.highlight}, ${C.tile.base})`,
            border: `2px solid ${C.gold.main}`,
            borderRadius: 4,
            display: 'flex',
            flexDirection: isHorizontal ? 'row' : 'column',
            boxShadow: `0 8px 30px rgba(0,0,0,0.6), 0 0 20px ${C.gold.main}50`
          }}>
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              borderRight: isHorizontal ? `1px solid ${C.tile.shadow}` : 'none',
              borderBottom: isHorizontal ? 'none' : `1px solid ${C.tile.shadow}`,
              padding: 1
            }}>
              <DotPattern num={tile.left} size={cellSize} rotate={isHorizontal} />
            </div>
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: 1
            }}>
              <DotPattern num={tile.right} size={cellSize} rotate={isHorizontal} />
            </div>
          </div>
        </div>
        <style>{`
          @keyframes flyToPosition {
            0% {
              transform: translate(0, 0) scale(1.2);
              opacity: 1;
            }
            70% {
              transform: translate(var(--end-x), var(--end-y)) scale(1.1);
              opacity: 1;
            }
            100% {
              transform: translate(var(--end-x), var(--end-y)) scale(1);
              opacity: 0;
            }
          }
        `}</style>
      </>
    );
  };

  return (
    <div ref={containerRef} style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 0,
      minHeight: 0,
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Indicadores de pase */}
      {playerPassed !== null && <PassIndicator position={passPositions[playerPassed]} />}
      
      {/* Ficha volando */}
      <FlyingTileAnimation />
      
      {/* Mano oponente ARRIBA (compañero - jugador 2) */}
      <OpponentHandTop 
        count={getPlayerTileCount(2)} 
        tileSize={opponentTileSize} 
        player={players[2]}
        onAvatarClick={onAvatarClick}
        isCurrentTurn={currentPlayer === 2}
      />
      
      {/* Fila central: Izquierda - Tablero - Derecha */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        width: '100%',
        minHeight: 0
      }}>
        {/* Mano oponente IZQUIERDA (jugador 3) */}
        <OpponentHandSide 
          count={getPlayerTileCount(3)} 
          tileSize={opponentTileSize} 
          player={players[3]}
          onAvatarClick={onAvatarClick}
          side="left"
          isCurrentTurn={currentPlayer === 3}
        />
        
        {/* Tablero */}
        <div ref={boardRef}>
          <Board board={board} lastPlayed={lastPlayed} cellSize={cellSize} onBoardInfo={onBoardInfo} skinSetId={skinSetId} />
        </div>
        
        {/* Mano oponente DERECHA (jugador 1) */}
        <OpponentHandSide 
          count={getPlayerTileCount(1)} 
          tileSize={opponentTileSize} 
          player={players[1]}
          onAvatarClick={onAvatarClick}
          side="right"
          isCurrentTurn={currentPlayer === 1}
        />
      </div>
      
      {/* Estilos de animación para indicador de pase */}
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateX(-50%) scale(0.5); }
          20% { opacity: 1; transform: translateX(-50%) scale(1.1); }
          80% { opacity: 1; transform: translateX(-50%) scale(1); }
          100% { opacity: 0; transform: translateX(-50%) scale(0.8); }
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// HUD - Información del juego (ultra compacto)
// ============================================================================
const GameHUD = ({ scores, timer, currentPlayer, players, board, onPause, onSettings, onEmote, isOnline }) => {
  const C = THEME.colors;
  const currentTeam = players[currentPlayer]?.team;
  const timerColor = timer <= 3 ? C.accent.red : timer <= 7 ? '#FBBF24' : '#fff';
  
  // Obtener extremos
  const ends = board.tiles?.length > 0 
    ? { left: board.snakeTop?.value, right: board.snakeBottom?.value }
    : { left: null, right: null };
  
  return (
    <div style={{
      flexShrink: 0,
      padding: '4px 6px',
      background: C.bg.surface,
      borderBottom: `1px solid ${C.bg.border}`
    }}>
      {/* Fila única ultra compacta */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 3 }}>
        {/* Pausa */}
        <button onClick={onPause} className="touch-feedback" style={{
          width: 32, height: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: C.bg.card,
          borderRadius: 6,
          border: 'none',
          cursor: 'pointer'
        }}>
          <span style={{ fontSize: 14 }}>⏸️</span>
        </button>
        
        {/* Emote (solo online) */}
        {isOnline && onEmote && (
          <button onClick={onEmote} className="touch-feedback" style={{
            width: 32, height: 32,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: C.bg.card,
            borderRadius: 6,
            border: 'none',
            cursor: 'pointer'
          }}>
            <span style={{ fontSize: 14 }}>💬</span>
          </button>
        )}
        
        {/* Extremo arriba + Score Azul */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.accent.green }}>▲{ends.left ?? '-'}</span>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 2,
            padding: '3px 6px',
            background: currentTeam === 0 ? `${C.accent.blue}30` : 'transparent',
            border: `2px solid ${C.accent.blue}`,
            borderRadius: 5
          }}>
            <span style={{ fontSize: 10 }}>🔵</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 14, color: '#fff' }}>{scores[0]}</span>
          </div>
        </div>
        
        {/* Timer central */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            padding: '2px 10px',
            background: timer <= 10 ? `${timerColor}20` : 'transparent',
            border: `2px solid ${timer <= 10 ? timerColor : C.bg.border}`,
            borderRadius: 5
          }}>
            <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 18, color: timerColor }}>{timer}</span>
          </div>
          <span style={{ fontSize: 8, color: currentPlayer === 0 ? C.gold.main : C.accent.slate }}>
            {currentPlayer === 0 ? '⚡TU TURNO' : players[currentPlayer]?.name}
          </span>
        </div>
        
        {/* Score Rojo + Extremo abajo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 2,
            padding: '3px 6px',
            background: currentTeam === 1 ? `${C.accent.red}30` : 'transparent',
            border: `2px solid ${C.accent.red}`,
            borderRadius: 5
          }}>
            <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 14, color: '#fff' }}>{scores[1]}</span>
            <span style={{ fontSize: 10 }}>🔴</span>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.accent.green }}>▼{ends.right ?? '-'}</span>
        </div>
        
        {/* Settings */}
        <button onClick={onSettings} className="touch-feedback" style={{
          width: 32, height: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: C.bg.card,
          borderRadius: 6,
          border: 'none',
          cursor: 'pointer'
        }}>
          <span style={{ fontSize: 14 }}>⚙️</span>
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// MANO DEL JUGADOR - Contenedor fijo abajo (OPTIMIZADO PARA ANDROID)
// ============================================================================
const PlayerHandArea = ({ 
  tiles, 
  board, 
  selected, 
  onSelect, 
  onPlay, 
  onPass, 
  canPass, 
  isMyTurn,
  showChoice,
  onCancelChoice,
  player,
  onAvatarClick,
  boardRect,
  snakePositions,
  onReorderTiles,
  onFlipTile,
  mustPlay,
  skinSetId = 'classic'
}) => {
  const C = THEME.colors;
  const skinSet = getSkinSet(skinSetId);
  const tileConfig = skinSet.tile;
  const [dragging, setDragging] = useState(null);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [dropTarget, setDropTarget] = useState(null);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [isReordering, setIsReordering] = useState(false);
  const [reorderTarget, setReorderTarget] = useState(null);
  const [lastTap, setLastTap] = useState({ id: null, time: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const tilesRef = useRef([]);
  const rafRef = useRef(null);
  const dragPosRef = useRef({ x: 0, y: 0 });
  
  // Calcular fichas jugables
  const ends = board.tiles?.length > 0 
    ? { left: board.snakeTop?.value, right: board.snakeBottom?.value }
    : { left: null, right: null };
  
  const getPlayablePositions = (tile) => {
    if (!board.tiles || board.tiles.length === 0) return ['center'];
    const positions = [];
    if (tile.left === ends.left || tile.right === ends.left) positions.push('left');
    if (tile.left === ends.right || tile.right === ends.right) positions.push('right');
    return positions;
  };
  
  const isPlayable = (tile) => getPlayablePositions(tile).length > 0;
  
  // Tamaño de fichas en mano
  const cellSize = 28;
  const tileWidth = cellSize;
  const tileHeight = cellSize * 2;
  
  // Doble tap para girar ficha
  const handleDoubleTap = (tile) => {
    const now = Date.now();
    if (lastTap.id === tile.id && now - lastTap.time < 300) {
      if (onFlipTile) {
        onFlipTile(tile.id);
      }
      setLastTap({ id: null, time: 0 });
    } else {
      setLastTap({ id: tile.id, time: now });
    }
  };
  
  // Detectar drop target - OPTIMIZADO con menos cálculos
  const detectDropTarget = useCallback((clientX, clientY) => {
    if (!boardRect || !snakePositions || !dragging) return null;
    
    const positions = getPlayablePositions(dragging);
    const dropRadius = boardRect.cellSize * 2.5;
    const dropRadiusSq = dropRadius * dropRadius; // Evitar Math.hypot
    
    if (positions.includes('center') && snakePositions.center) {
      const dx = clientX - (boardRect.x + snakePositions.center.screenX);
      const dy = clientY - (boardRect.y + snakePositions.center.screenY);
      if (dx * dx + dy * dy < dropRadiusSq) return 'center';
    }
    
    if (positions.includes('left') && snakePositions.top) {
      const dx = clientX - (boardRect.x + snakePositions.top.screenX);
      const dy = clientY - (boardRect.y + snakePositions.top.screenY);
      if (dx * dx + dy * dy < dropRadiusSq) return 'left';
    }
    
    if (positions.includes('right') && snakePositions.bottom) {
      const dx = clientX - (boardRect.x + snakePositions.bottom.screenX);
      const dy = clientY - (boardRect.y + snakePositions.bottom.screenY);
      if (dx * dx + dy * dy < dropRadiusSq) return 'right';
    }
    
    return null;
  }, [boardRect, snakePositions, dragging]);
  
  // Detectar sobre qué ficha estamos para reordenar
  const detectReorderTarget = useCallback((clientX, clientY) => {
    const handArea = document.getElementById('player-hand-tiles');
    if (!handArea) return null;
    
    const handRect = handArea.getBoundingClientRect();
    if (clientY < handRect.top - 20 || clientY > handRect.bottom + 20) return null;
    
    for (let i = 0; i < tilesRef.current.length; i++) {
      const el = tilesRef.current[i];
      if (!el || tiles[i]?.id === dragging?.id) continue;
      
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      
      if (clientX < centerX) return i;
    }
    return tiles.length;
  }, [tiles, dragging]);
  
  // Handler de drag start - OPTIMIZADO
  const handleDragStart = useCallback((e, tile, index) => {
    handleDoubleTap(tile);
    
    e.preventDefault();
    e.stopPropagation();
    
    const touch = e.touches ? e.touches[0] : e;
    const rect = tilesRef.current[index]?.getBoundingClientRect();
    
    // Calcular offset del toque relativo al centro de la ficha
    const offsetX = rect ? touch.clientX - (rect.left + rect.width / 2) : 0;
    const offsetY = rect ? touch.clientY - (rect.top + rect.height / 2) : 0;
    
    setDragging(tile);
    setDragOffset({ x: offsetX, y: offsetY });
    setDragPos({ x: touch.clientX, y: touch.clientY });
    setDragStartPos({ x: touch.clientX, y: touch.clientY });
    dragPosRef.current = { x: touch.clientX, y: touch.clientY };
    setIsReordering(false);
    
    // Prevenir scroll
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
  }, []);
  
  // Handler de drag move - OPTIMIZADO con requestAnimationFrame
  const handleDragMove = useCallback((e) => {
    if (!dragging) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const touch = e.touches ? e.touches[0] : e;
    const clientX = touch.clientX;
    const clientY = touch.clientY;
    
    // Actualizar ref inmediatamente para la posición visual
    dragPosRef.current = { x: clientX, y: clientY };
    
    // Usar RAF para actualizar estado y detección de zonas
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    
    rafRef.current = requestAnimationFrame(() => {
      setDragPos({ x: clientX, y: clientY });
      
      const verticalDist = dragStartPos.y - clientY;
      const playable = isPlayable(dragging);
      
      if (verticalDist > 50 && playable && isMyTurn) {
        setIsReordering(false);
        setReorderTarget(null);
        setDropTarget(detectDropTarget(clientX, clientY));
      } else {
        setIsReordering(true);
        setDropTarget(null);
        setReorderTarget(detectReorderTarget(clientX, clientY));
      }
    });
  }, [dragging, dragStartPos, isMyTurn, detectDropTarget, detectReorderTarget]);
  
  // Handler de drag end
  const handleDragEnd = useCallback(() => {
    if (!dragging) return;
    
    // Cancelar RAF pendiente
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    
    // Restaurar scroll
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
    
    if (dropTarget && !isReordering) {
      onPlay(dragging, dropTarget);
    } else if (isReordering && reorderTarget !== null && onReorderTiles) {
      const currentIndex = tiles.findIndex(t => t.id === dragging.id);
      if (currentIndex !== -1 && currentIndex !== reorderTarget) {
        const newTiles = [...tiles];
        const [removed] = newTiles.splice(currentIndex, 1);
        const insertAt = reorderTarget > currentIndex ? reorderTarget - 1 : reorderTarget;
        newTiles.splice(insertAt, 0, removed);
        onReorderTiles(newTiles);
      }
    }
    
    setDragging(null);
    setDragPos({ x: 0, y: 0 });
    setDropTarget(null);
    setIsReordering(false);
    setReorderTarget(null);
    setDragOffset({ x: 0, y: 0 });
  }, [dragging, dropTarget, isReordering, reorderTarget, tiles, onPlay, onReorderTiles]);
  
  // Listeners globales - OPTIMIZADO
  useEffect(() => {
    if (!dragging) return;
    
    const moveHandler = (e) => handleDragMove(e);
    const endHandler = () => handleDragEnd();
    
    // Usar capture para mejor rendimiento
    window.addEventListener('touchmove', moveHandler, { passive: false, capture: true });
    window.addEventListener('touchend', endHandler, { capture: true });
    window.addEventListener('touchcancel', endHandler, { capture: true });
    window.addEventListener('mousemove', moveHandler, { capture: true });
    window.addEventListener('mouseup', endHandler, { capture: true });
    
    return () => {
      window.removeEventListener('touchmove', moveHandler, { capture: true });
      window.removeEventListener('touchend', endHandler, { capture: true });
      window.removeEventListener('touchcancel', endHandler, { capture: true });
      window.removeEventListener('mousemove', moveHandler, { capture: true });
      window.removeEventListener('mouseup', endHandler, { capture: true });
      
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [dragging, handleDragMove, handleDragEnd]);
  
  // Componente de zona de drop en el tablero - OPTIMIZADO con GPU
  const DropZone = ({ position, type, value }) => {
    if (!position || !boardRect) return null;
    
    const isActive = dropTarget === type;
    const size = boardRect.cellSize * 2;
    
    return (
      <div 
        className="gpu-accelerated drop-zone"
        style={{
          position: 'fixed',
          left: boardRect.x + position.screenX - size/2,
          top: boardRect.y + position.screenY - size/2,
          width: size,
          height: size,
          borderRadius: '50%',
          background: isActive 
            ? (type === 'left' ? C.accent.green : type === 'right' ? C.accent.blue : C.gold.main)
            : 'rgba(255,255,255,0.2)',
          border: `3px dashed ${isActive ? '#fff' : 'rgba(255,255,255,0.5)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          transform: isActive ? 'scale3d(1.2, 1.2, 1) translate3d(0, 0, 0)' : 'scale3d(1, 1, 1) translate3d(0, 0, 0)',
          boxShadow: isActive ? `0 0 30px ${type === 'left' ? C.accent.green : type === 'right' ? C.accent.blue : C.gold.main}` : 'none',
          pointerEvents: 'none',
          willChange: 'transform, background-color, box-shadow'
        }}>
        <span style={{
          color: '#fff',
          fontWeight: 900,
          fontSize: boardRect.cellSize * 0.8,
          textShadow: '0 2px 4px rgba(0,0,0,0.5)'
        }}>
          {type === 'center' ? '🎯' : value}
        </span>
      </div>
    );
  };
  
  return (
    <>
      {/* Zonas de drop en el tablero */}
      {dragging && boardRect && snakePositions && (
        <>
          {getPlayablePositions(dragging).includes('center') && snakePositions.center && (
            <DropZone position={snakePositions.center} type="center" value="🎯" />
          )}
          {getPlayablePositions(dragging).includes('left') && snakePositions.top && (
            <DropZone position={snakePositions.top} type="left" value={ends.left} />
          )}
          {getPlayablePositions(dragging).includes('right') && snakePositions.bottom && (
            <DropZone position={snakePositions.bottom} type="right" value={ends.right} />
          )}
        </>
      )}
      
      {/* Ficha siendo arrastrada - OPTIMIZADA con GPU */}
      {dragging && (
        <div 
          className="gpu-accelerated dragging"
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: tileWidth,
            height: tileHeight,
            background: dropTarget 
              ? `linear-gradient(180deg, ${C.accent.green}, #059669)`
              : `linear-gradient(180deg, ${C.tile.highlight}, ${C.tile.base}, ${C.tile.shadow})`,
            border: `2px solid ${dropTarget ? '#34D399' : C.gold.dark}`,
            borderRadius: 6,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 1001,
            pointerEvents: 'none',
            boxShadow: `0 8px 25px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.6)`,
            transform: `translate3d(${dragPos.x - tileWidth / 2}px, ${dragPos.y - tileHeight / 2}px, 0) scale3d(1.15, 1.15, 1) rotate(-3deg)`,
            willChange: 'transform'
          }}>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderBottom: `1px solid ${C.tile.shadow}`,
            padding: 2
          }}>
            <Dots num={dragging.left} />
          </div>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 2
          }}>
            <Dots num={dragging.right} />
          </div>
        </div>
      )}
      
      {/* Mano del jugador */}
      <div style={{
        flexShrink: 0,
        padding: '4px 4px 6px',
        marginTop: 8,
        background: C.bg.surface,
        borderTop: `1px solid ${C.bg.border}`
      }}>
        {/* Fichas y Avatar */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 8
        }}>
          <div 
            id="player-hand-tiles"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 6,
              overflowX: 'auto',
              padding: 0,
              margin: 0
            }}
          >
            {tiles.map((tile, index) => {
              const isDragging = dragging?.id === tile.id;
              const showInsertBefore = isReordering && reorderTarget === index;
              const playable = isPlayable(tile);
              const isMust = mustPlay?.id === tile.id;
              
              return (
                <React.Fragment key={tile.id}>
                  {/* Indicador de inserción */}
                  {showInsertBefore && (
                    <div style={{
                      width: 4,
                      height: tileHeight,
                      background: C.accent.blue,
                      borderRadius: 2,
                      boxShadow: `0 0 10px ${C.accent.blue}`
                    }} />
                  )}
                  <div
                    ref={el => tilesRef.current[index] = el}
                    onTouchStart={(e) => handleDragStart(e, tile, index)}
                    onMouseDown={(e) => handleDragStart(e, tile, index)}
                    className="gpu-accelerated draggable touch-feedback"
                    style={{
                      width: tileWidth,
                      height: tileHeight,
                      padding: 0,
                      backgroundColor: '#FFFFF0',
                      border: isMust 
                        ? `3px solid ${C.gold.main}` 
                        : playable
                          ? '2px solid #22C55E'
                          : '2px solid #8B7355',
                      borderRadius: 6,
                      opacity: isDragging ? 0.3 : 1,
                      boxShadow: isMust 
                        ? '0 0 15px rgba(255,215,0,0.6)'
                        : '2px 2px 8px rgba(0,0,0,0.3)',
                      cursor: 'grab',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                    flexShrink: 0,
                    userSelect: 'none',
                    touchAction: 'none'
                  }}
                >
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: '2px solid #A0522D',
                    padding: 2
                  }}>
                    <Dots num={tile.left} color="#1a1a1a" />
                  </div>
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 2
                  }}>
                    <Dots num={tile.right} color="#1a1a1a" />
                  </div>
                </div>
                </React.Fragment>
              );
            })}
            {/* Indicador de inserción al final */}
            {isReordering && reorderTarget === tiles.length && (
              <div style={{
                width: 4,
                height: tileHeight,
                background: C.accent.blue,
                borderRadius: 2,
                boxShadow: `0 0 10px ${C.accent.blue}`
              }} />
            )}
          </div>
          
          {player && (
            <button
              onClick={() => onAvatarClick?.(player)}
              className="touch-feedback"
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${player.team === 0 ? C.accent.blue : C.accent.red}, ${player.team === 0 ? '#1d4ed8' : '#b91c1c'})`,
                border: `2px solid ${player.team === 0 ? '#60a5fa' : '#f87171'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                flexShrink: 0
              }}
            >
              {player.avatar}
            </button>
          )}
        </div>
      </div>
    </>
  );
};


// ============================================================================
// DEFAULT SETTINGS
// ============================================================================
const getDefaultSettings = () => ({
  // Audio
  musicVolume: 70,
  sfxVolume: 100,
  vibration: true,
  soundNotifications: true,
  
  // Juego
  confirmPlay: false,
  quickSelect: false,
  aiDifficulty: 'hard',
  
  // Visual
  animationSpeed: 'fast',
  textSize: 'normal',
  tileTheme: 'classic',
  boardTheme: 'green',
  colorblindMode: 'none',
  particles: true,
  darkMode: true,
  
  // Social
  showChat: true,
  allowEmotes: true,
  showOnlineStatus: true,
  showElo: true,
  gameInvites: 'friends',
  friendRequests: 'all',
  
  // Otros
  language: 'es',
  region: 'auto',
  keepAwake: true,
  saveHistory: true
});


// ============================================================================
// MAIN APP
// ============================================================================
const DominoRanked = ({ authUser, onRequestLogin, onLogout }) => {
  const [phase, setPhase] = useState('menu');
  const [players, setPlayers] = useState([
    { id: 0, name: 'Tú', tiles: [], team: 0, avatar: '😎', elo: 1847 },
    { id: 1, name: 'Carlos', tiles: [], team: 1, avatar: '🧔', elo: 1823 },
    { id: 2, name: 'María', tiles: [], team: 0, avatar: '👩', elo: 1856 },
    { id: 3, name: 'Pedro', tiles: [], team: 1, avatar: '👨', elo: 1834 }
  ]);
  const [board, setBoard] = useState(() => SnakeBoard.create());
  const [current, setCurrent] = useState(0);
  const [scores, setScores] = useState([0, 0]);
  const [passes, setPasses] = useState(0);
  const [msg, setMsg] = useState('');
  const [selected, setSelected] = useState(null);
  const [showChoice, setShowChoice] = useState(false);
  const [firstRound, setFirstRound] = useState(true);
  const [lastWinner, setLastWinner] = useState(0);
  const [roundStarter, setRoundStarter] = useState(0); // Quién inició la mano actual
  const [moveCount, setMoveCount] = useState(0); // Contador de jugadas en la mano (para Regla 8)
  const [strategicBonusEligible, setStrategicBonusEligible] = useState(false); // Si el segundo jugador pasó
  const [lastPlayed, setLastPlayed] = useState(null);
  const [lastPlayPositions, setLastPlayPositions] = useState(1); // Cuántas posiciones válidas tenía la última ficha
  const [doubleNextRound, setDoubleNextRound] = useState(false); // Puntos dobles por empate anterior
  const [mustPlay, setMustPlay] = useState(null);
  const [target, setTarget] = useState(200);
  const [timer, setTimer] = useState(30);
  const [searching, setSearching] = useState(false);
  const [eloChange, setEloChange] = useState(0);
  
  // Estados para navegación y configuración
  const [currentScreen, setCurrentScreen] = useState('home'); // home, stats, ranking, shop
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  // Estados para notificaciones y efectos
  const [notification, setNotification] = useState(null); // { type, message, icon }
  const [showConfetti, setShowConfetti] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  const [lastEvent, setLastEvent] = useState(null); // 'pass', 'play', 'domino', 'tranca'
  const [showTurnIndicator, setShowTurnIndicator] = useState(false);
  const [roundResult, setRoundResult] = useState(null); // Para mostrar resultado de ronda
  const [playerPassed, setPlayerPassed] = useState(null); // Jugador que acaba de pasar (0-3)
  const [flyingTile, setFlyingTile] = useState(null); // { tile, fromPlayer, toPosition } para animación
  const [selectedPlayerStats, setSelectedPlayerStats] = useState(null); // Jugador cuyas stats mostrar
  const [boardRect, setBoardRect] = useState(null); // { x, y, width, height, cellSize }
  const [snakePositions, setSnakePositions] = useState(null); // { top, bottom, center }
  const [passedNumbers, setPassedNumbers] = useState({ 0: new Set(), 1: new Set(), 2: new Set(), 3: new Set() }); // Números que cada jugador no tiene (pasó cuando estaban)
  
  // Estados del menú principal
  const [menuTab, setMenuTab] = useState('home');
  const [menuNotifications, setMenuNotifications] = useState(3);
  const [battlePassLevel, setBattlePassLevel] = useState(24);
  const [battlePassProgress, setBattlePassProgress] = useState(67);
  
  // ══════════════════════════════════════════════════════════════════════════
  // ESTADOS PARA MODO ONLINE
  // ══════════════════════════════════════════════════════════════════════════
  const [gameMode, setGameMode] = useState('local'); // 'local' o 'online'
  const [socket, setSocket] = useState(null);
  const [conectado, setConectado] = useState(false);
  const [identificado, setIdentificado] = useState(false);
  const [miSocketId, setMiSocketId] = useState(null);
  const [miOdId, setMiOdId] = useState(null); // ID único para reconexión
  const [jugadoresOnline, setJugadoresOnline] = useState(0);
  const [partidaOnline, setPartidaOnline] = useState(null); // Datos de la partida online
  const [miPosicionOnline, setMiPosicionOnline] = useState(0); // Mi posición en la partida (0-3)
  const [errorConexion, setErrorConexion] = useState(null);
  
  // Estados para emotes
  const [showEmoteMenu, setShowEmoteMenu] = useState(false);
  const [emoteRecibido, setEmoteRecibido] = useState(null); // { jugadorPosicion, emote, timestamp }
  const [emoteCooldown, setEmoteCooldown] = useState(false);
  
  // Estados para reconexión
  const [reconectando, setReconectando] = useState(false);
  const [jugadorDesconectado, setJugadorDesconectado] = useState(null); // { nombre, tiempoRestante }
  
  // Emotes disponibles
  const EMOTES = ['👍', '👎', '👏', '😂', '😢', '😡', '🤔', '😎', '🔥', '💪', '🎯', '🎲'];
  const EMOTE_FRASES = ['¡Buena!', '¡Vamos!', '¡Suerte!', 'GG', '¡Tranca!', '¡Dominó!'];
  
  // Handler para recibir info del tablero
  const handleBoardInfo = useCallback((rect, positions) => {
    setBoardRect(rect);
    setSnakePositions(positions);
  }, []);
  
  // Configuraciones del juego
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('dominoSettings');
      if (saved) {
        return { ...getDefaultSettings(), ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Error loading settings:', e);
    }
    return getDefaultSettings();
  });
  
  // Guardar settings cuando cambien
  useEffect(() => {
    try {
      localStorage.setItem('dominoSettings', JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings:', e);
    }
  }, [settings]);
  
  // ══════════════════════════════════════════════════════════════════════════
  // CONEXIÓN AL SERVIDOR ONLINE
  // ══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    // Solo conectar si estamos en modo online o buscando
    console.log('🔌 Intentando conectar al servidor...');
    
    const newSocket = io(SERVIDOR_URL, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true
    });
    
    // ─────────────────────────────────────────────────────────────────────
    // EVENTOS DE CONEXIÓN
    // ─────────────────────────────────────────────────────────────────────
    newSocket.on('connect', () => {
      console.log('✅ Conectado al servidor:', newSocket.id);
      setConectado(true);
      setMiSocketId(newSocket.id);
      setErrorConexion(null);
      
      // Identificarse automáticamente con el perfil guardado
      const nombreGuardado = localStorage.getItem('dominoPlayerName') || 'Jugador';
      newSocket.emit('identificarse', { 
        nombre: nombreGuardado, 
        elo: playerProfile?.rating || 1500 
      });
    });
    
    newSocket.on('disconnect', (reason) => {
      console.log('❌ Desconectado:', reason);
      setConectado(false);
      setIdentificado(false);
    });
    
    newSocket.on('connect_error', (err) => {
      console.log('⚠️ Error de conexión:', err.message);
      setErrorConexion('No se puede conectar al servidor');
      setConectado(false);
    });
    
    // ─────────────────────────────────────────────────────────────────────
    // EVENTOS DEL JUEGO
    // ─────────────────────────────────────────────────────────────────────
    newSocket.on('identificado', (datos) => {
      console.log('👤 Identificado:', datos);
      setIdentificado(true);
      if (datos.odId) {
        setMiOdId(datos.odId);
        localStorage.setItem('dominoOdId', datos.odId);
      }
    });
    
    // ─────────────────────────────────────────────────────────────────────
    // EVENTO: Reconectado a partida en curso
    // ─────────────────────────────────────────────────────────────────────
    newSocket.on('reconectado', (datos) => {
      console.log('🔄 ¡RECONECTADO A PARTIDA!', datos);
      setReconectando(false);
      setIdentificado(true);
      
      if (datos.odId) {
        setMiOdId(datos.odId);
      }
      
      // Restaurar estado de la partida
      setMiPosicionOnline(datos.tuPosicion);
      localStorage.setItem('miPosicionOnline', datos.tuPosicion.toString());
      
      // Configurar jugadores
      const miPos = datos.tuPosicion;
      const jugadoresOrdenados = [];
      for (let i = 0; i < 4; i++) {
        const posReal = (miPos + i) % 4;
        const jugadorOnline = datos.jugadores.find(j => j.posicion === posReal);
        jugadoresOrdenados.push({
          id: i,
          socketId: jugadorOnline?.id,
          name: i === 0 ? 'Tú' : jugadorOnline?.nombre || `Jugador ${i+1}`,
          tiles: i === 0 ? datos.tusFichas : [],
          tilesCount: jugadorOnline?.cantidadFichas || 0,
          team: jugadorOnline?.equipo || (i % 2),
          avatar: ['😎', '🧔', '👩', '👨'][i],
          elo: 1500,
          isOnline: true,
          conectado: jugadorOnline?.conectado !== false
        });
      }
      
      // Reconstruir el tablero con las fichas jugadas
      let boardReconstruido = SnakeBoard.create();
      datos.tablero.forEach((jugada, idx) => {
        const pos = idx === 0 ? null : jugada.posicion === 'derecha' ? 'right' : 'left';
        boardReconstruido = Engine.placeOnBoard(boardReconstruido, jugada.ficha, pos);
      });
      
      const turnoLocalNuevo = datos.turnoActualPosicion !== undefined 
        ? (datos.turnoActualPosicion - miPos + 4) % 4 
        : 0;
      
      setPlayers(jugadoresOrdenados);
      setBoard(boardReconstruido);
      setCurrent(turnoLocalNuevo);
      setScores(datos.puntos || [0, 0]);
      setGameMode('online');
      setSearching(false);
      setPhase('playing');
      setMsg('¡Reconectado! Continúa jugando');
      
      showNotification('success', '¡Reconectado a la partida!', '🔄');
    });
    
    // ─────────────────────────────────────────────────────────────────────
    // EVENTO: Jugador reconectado
    // ─────────────────────────────────────────────────────────────────────
    newSocket.on('jugadorReconectado', (datos) => {
      console.log('🔄 Jugador reconectado:', datos.jugadorNombre);
      setJugadorDesconectado(null);
      showNotification('info', `${datos.jugadorNombre} se reconectó`, '🔄');
    });
    
    // ─────────────────────────────────────────────────────────────────────
    // EVENTO: Emote recibido
    // ─────────────────────────────────────────────────────────────────────
    newSocket.on('emoteRecibido', (datos) => {
      console.log('💬 Emote:', datos.jugadorNombre, datos.emote);
      
      // Sonido de emote
      Audio.playEmoteReceive();
      
      const miPos = parseInt(localStorage.getItem('miPosicionOnline') || '0');
      const posLocal = (datos.jugadorPosicion - miPos + 4) % 4;
      
      setEmoteRecibido({
        jugadorPosicion: posLocal,
        jugadorNombre: datos.jugadorNombre,
        emote: datos.emote,
        timestamp: datos.timestamp
      });
      
      // Ocultar después de 3 segundos
      setTimeout(() => {
        setEmoteRecibido(prev => {
          if (prev && prev.timestamp === datos.timestamp) {
            return null;
          }
          return prev;
        });
      }, 3000);
    });
    
    newSocket.on('estadisticas', (datos) => {
      setJugadoresOnline(datos.jugadoresOnline || 0);
    });
    
    newSocket.on('buscando', (datos) => {
      console.log('🔍 Buscando partida, posición:', datos.posicionEnCola);
    });
    
    newSocket.on('busquedaCancelada', () => {
      console.log('❌ Búsqueda cancelada');
      setSearching(false);
    });
    
    newSocket.on('partidaEncontrada', (datos) => {
      console.log('🎮 ¡PARTIDA ENCONTRADA!', datos);
      setPartidaOnline(datos);
      // Sonido de partida encontrada
      Audio.playMatchFound();
      // Mostrar pantalla de "partida encontrada"
    });
    
    newSocket.on('partidaIniciada', (datos) => {
      console.log('🎲 Partida iniciada:', datos);
      
      // Guardar datos de la partida para referencia
      setPartidaOnline(datos);
      
      // Encontrar mi posición
      const miPos = datos.tuPosicion;
      setMiPosicionOnline(miPos);
      
      // Guardar para que los handlers puedan acceder
      localStorage.setItem('miPosicionOnline', miPos.toString());
      
      // Configurar jugadores según la partida online
      // Reordenar para que yo siempre esté en posición 0 (abajo)
      const jugadoresOrdenados = [];
      for (let i = 0; i < 4; i++) {
        const posReal = (miPos + i) % 4;
        const jugadorOnline = datos.jugadores.find(j => j.posicion === posReal);
        jugadoresOrdenados.push({
          id: i,
          odId: jugadorOnline?.id, // ID del socket
          socketId: jugadorOnline?.id,
          name: i === 0 ? 'Tú' : jugadorOnline?.nombre || `Jugador ${i+1}`,
          tiles: i === 0 ? datos.tusFichas : [], // Solo yo veo mis fichas
          tilesCount: jugadorOnline?.cantidadFichas || 10,
          team: jugadorOnline?.equipo || (i % 2),
          avatar: ['😎', '🧔', '👩', '👨'][i],
          elo: 1500,
          isOnline: true
        });
      }
      
      // Encontrar quién tiene el turno (convertir a mi sistema de posiciones)
      const turnoRealPos = datos.turnoActualPosicion;
      const turnoLocal = (turnoRealPos - miPos + 4) % 4;
      
      // Configurar el juego
      setPlayers(jugadoresOrdenados);
      setBoard(SnakeBoard.create());
      setCurrent(turnoLocal);
      setRoundStarter(turnoLocal);
      setScores(datos.puntos || [0, 0]);
      setPasses(0);
      setMoveCount(0);
      setMustPlay(datos.fichaObligatoria);
      setLastPlayed(null);
      setSelected(null);
      setShowChoice(false);
      setSearching(false);
      setGameMode('online');
      setRoundResult(null);
      setMsg(datos.fichaObligatoria ? 
        `Abre con doble ${datos.fichaObligatoria.left}` : 
        'Comienza la partida');
      setPhase('playing');
    });
    
    // ─────────────────────────────────────────────────────────────────────
    // EVENTO: Ficha jugada (por cualquier jugador)
    // ─────────────────────────────────────────────────────────────────────
    newSocket.on('fichaJugada', (datos) => {
      console.log('🎯 Ficha jugada:', datos);
      
      // Obtener mi posición actual
      const miPos = parseInt(localStorage.getItem('miPosicionOnline') || '0');
      
      // Convertir posición del servidor a posición local
      const posJugadorLocal = (datos.jugadorPosicion - miPos + 4) % 4;
      const turnoLocalNuevo = (datos.turnoActualPosicion - miPos + 4) % 4;
      
      // Si la jugada es de otro jugador, mostrar animación
      if (posJugadorLocal !== 0) {
        // Iniciar animación de ficha volando desde el jugador
        setFlyingTile({
          tile: datos.ficha,
          fromPlayer: posJugadorLocal,
          pos: datos.posicion === 'derecha' ? 'right' : datos.posicion === 'izquierda' ? 'left' : 'center'
        });
        
        // Quitar la animación después de 600ms
        setTimeout(() => setFlyingTile(null), 600);
      }
      
      // Actualizar el tablero localmente con la ficha jugada (después de la animación)
      setTimeout(() => {
        setBoard(prevBoard => {
          // Si es la primera ficha (centro), no pasamos posición
          if (datos.tableroLength === 1 || datos.posicion === 'centro') {
            return Engine.placeOnBoard(prevBoard, datos.ficha, null);
          }
          // Convertir posición del servidor a formato del cliente
          const pos = datos.posicion === 'derecha' ? 'right' : 'left';
          return Engine.placeOnBoard(prevBoard, datos.ficha, pos);
        });
      }, posJugadorLocal !== 0 ? 500 : 0); // Delay si hay animación
      
      // Actualizar conteo de fichas de todos los jugadores
      setPlayers(prevPlayers => {
        return prevPlayers.map((p, idx) => {
          // Encontrar el dato correspondiente
          const fichaData = datos.fichasRestantes.find(f => {
            const posLocal = (f.posicion - miPos + 4) % 4;
            return posLocal === idx;
          });
          
          // Si soy yo (posición 0), mis fichas se actualizan con tusFichasActualizadas
          if (idx === 0) return p;
          
          return {
            ...p,
            tilesCount: fichaData?.cantidad || p.tilesCount
          };
        });
      });
      
      // Actualizar turno
      setCurrent(turnoLocalNuevo);
      setMustPlay(null);
      setPasses(0);
      
      // Mensaje
      if (posJugadorLocal === 0) {
        setMsg(`Jugaste [${datos.ficha.left}|${datos.ficha.right}]`);
      } else {
        setMsg(`${datos.jugadorNombre} jugó [${datos.ficha.left}|${datos.ficha.right}]`);
      }
    });
    
    // ─────────────────────────────────────────────────────────────────────
    // EVENTO: Mis fichas actualizadas (después de jugar)
    // ─────────────────────────────────────────────────────────────────────
    newSocket.on('tusFichasActualizadas', (datos) => {
      console.log('🃏 Fichas actualizadas:', datos.fichas.length);
      
      setPlayers(prevPlayers => {
        const updated = [...prevPlayers];
        updated[0] = { ...updated[0], tiles: datos.fichas };
        return updated;
      });
    });
    
    // ─────────────────────────────────────────────────────────────────────
    // EVENTO: Jugador pasó
    // ─────────────────────────────────────────────────────────────────────
    newSocket.on('jugadorPaso', (datos) => {
      console.log('⏭️ Jugador pasó:', datos.jugadorNombre);
      
      const miPos = parseInt(localStorage.getItem('miPosicionOnline') || '0');
      const posJugadorLocal = (datos.jugadorPosicion - miPos + 4) % 4;
      
      setPasses(datos.pasesConsecutivos);
      setPlayerPassed(posJugadorLocal);
      setTimeout(() => setPlayerPassed(null), 1500);
      
      setMsg(`${datos.jugadorNombre} pasó`);
    });
    
    // ─────────────────────────────────────────────────────────────────────
    // EVENTO: Turno actualizado
    // ─────────────────────────────────────────────────────────────────────
    newSocket.on('turnoActualizado', (datos) => {
      console.log('🔄 Turno actualizado');
      
      const miPos = parseInt(localStorage.getItem('miPosicionOnline') || '0');
      const turnoLocal = (datos.turnoActualPosicion - miPos + 4) % 4;
      
      setCurrent(turnoLocal);
    });
    
    // ─────────────────────────────────────────────────────────────────────
    // EVENTO: Ronda terminada
    // ─────────────────────────────────────────────────────────────────────
    newSocket.on('rondaTerminada', (datos) => {
      console.log('🏆 Ronda terminada:', datos);
      
      // Actualizar puntuación
      setScores(datos.puntosTotales);
      
      // Mostrar resultado de ronda
      setRoundResult({
        type: datos.tipo,
        winner: datos.equipoGanador,
        points: datos.puntosRonda,
        ganadorNombre: datos.ganadorNombre
      });
      
      // Revelar fichas de todos
      const miPos = parseInt(localStorage.getItem('miPosicionOnline') || '0');
      setPlayers(prevPlayers => {
        return prevPlayers.map((p, idx) => {
          const posReal = (miPos + idx) % 4;
          const fichasJugador = datos.fichasReveladas.find(f => f.posicion === posReal);
          return {
            ...p,
            tiles: fichasJugador?.fichas || p.tiles
          };
        });
      });
    });
    
    // ─────────────────────────────────────────────────────────────────────
    // EVENTO: Nueva ronda
    // ─────────────────────────────────────────────────────────────────────
    newSocket.on('nuevaRonda', (datos) => {
      console.log('🔄 Nueva ronda:', datos.ronda);
      
      const miPos = parseInt(localStorage.getItem('miPosicionOnline') || '0');
      const turnoLocal = (datos.turnoActualPosicion - miPos + 4) % 4;
      
      // Reconfigurar jugadores con nuevas fichas
      setPlayers(prevPlayers => {
        return prevPlayers.map((p, idx) => {
          if (idx === 0) {
            return { ...p, tiles: datos.tusFichas, tilesCount: 10 };
          }
          return { ...p, tiles: [], tilesCount: 10 };
        });
      });
      
      // Resetear tablero y estado
      setBoard(SnakeBoard.create());
      setCurrent(turnoLocal);
      setMustPlay(datos.fichaObligatoria);
      setPasses(0);
      setMoveCount(0);
      setRoundResult(null);
      setLastPlayed(null);
      setScores(datos.puntos);
      
      setMsg(datos.fichaObligatoria ? 
        `Ronda ${datos.ronda} - Abre con doble ${datos.fichaObligatoria.left}` : 
        `Ronda ${datos.ronda}`);
    });
    
    // ─────────────────────────────────────────────────────────────────────
    // EVENTO: Partida terminada
    // ─────────────────────────────────────────────────────────────────────
    newSocket.on('partidaTerminada', (datos) => {
      console.log('🎊 Partida terminada:', datos);
      
      const miPos = parseInt(localStorage.getItem('miPosicionOnline') || '0');
      const miEquipo = miPos % 2; // 0 o 1
      const gane = datos.equipoGanador === miEquipo;
      
      // Actualizar ranking
      // updatePlayerRanking(gane);
      
      // Mostrar pantalla de victoria/derrota
      setPhase('end');
      setScores(datos.puntosFinal);
      setEloChange(gane ? 25 : -15);
    });
    
    // ─────────────────────────────────────────────────────────────────────
    // EVENTO: Error del servidor
    // ─────────────────────────────────────────────────────────────────────
    newSocket.on('error', (datos) => {
      console.error('⚠️ Error del servidor:', datos.mensaje);
      setErrorConexion(datos.mensaje);
      setTimeout(() => setErrorConexion(null), 3000);
    });
    
    // ─────────────────────────────────────────────────────────────────────
    // EVENTO: Jugador desconectado
    // ─────────────────────────────────────────────────────────────────────
    newSocket.on('jugadorDesconectado', (datos) => {
      console.log('👋 Jugador desconectado:', datos.jugadorNombre);
      
      const miPos = parseInt(localStorage.getItem('miPosicionOnline') || '0');
      const posLocal = (datos.jugadorPosicion - miPos + 4) % 4;
      
      // Actualizar estado del jugador
      setPlayers(prev => prev.map((p, idx) => 
        idx === posLocal ? { ...p, conectado: false } : p
      ));
      
      if (datos.puedeReconectar) {
        setJugadorDesconectado({
          nombre: datos.jugadorNombre,
          posicion: posLocal,
          tiempoRestante: datos.tiempoRestante || 300
        });
        showNotification('warning', `${datos.jugadorNombre} se desconectó. Puede reconectarse en 5 min.`, '⚠️', 5000);
      } else {
        setErrorConexion(`${datos.jugadorNombre} abandonó la partida`);
        setTimeout(() => setErrorConexion(null), 5000);
      }
    });
    
    // ─────────────────────────────────────────────────────────────────────
    // EVENTO: Jugador abandonó (no se reconectó a tiempo)
    // ─────────────────────────────────────────────────────────────────────
    newSocket.on('jugadorAbandono', (datos) => {
      console.log('🚪 Jugador abandonó:', datos.jugadorNombre);
      setJugadorDesconectado(null);
      showNotification('error', `${datos.jugadorNombre} abandonó la partida`, '🚪', 5000);
    });
    
    setSocket(newSocket);
    
    // Limpiar al desmontar
    return () => {
      console.log('🔌 Desconectando...');
      newSocket.disconnect();
    };
  }, []);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CONTADOR DE TIEMPO DE DESCONEXIÓN
  // ═══════════════════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!jugadorDesconectado) return;
    
    const timer = setInterval(() => {
      setJugadorDesconectado(prev => {
        if (!prev) return null;
        if (prev.tiempoRestante <= 1) {
          clearInterval(timer);
          return null;
        }
        return { ...prev, tiempoRestante: prev.tiempoRestante - 1 };
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [jugadorDesconectado?.nombre]); // Solo re-crear cuando cambie el jugador
  
  // ========== SISTEMA DE RANKING ==========
  // Perfil del jugador (cargado desde localStorage)
  const [playerProfile, setPlayerProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('dominoPlayerProfile');
      if (saved) {
        const profile = JSON.parse(saved);
        // Aplicar decay si es necesario
        return DecaySystem.applyDecay(profile);
      }
    } catch (e) {
      console.error('Error loading profile:', e);
    }
    return createDefaultPlayerProfile();
  });
  
  // Historial de partidas
  const [matchHistory, setMatchHistory] = useState(() => MatchHistory.load());
  
  // Leaderboard
  const [leaderboard, setLeaderboard] = useState([]);
  
  // Estado de la partida ranked actual
  const [matchStartTime, setMatchStartTime] = useState(null);
  const [matchRounds, setMatchRounds] = useState(0);
  
  // Cambio de rango (para mostrar animación)
  const [rankChange, setRankChange] = useState(null); // { type: 'promotion'/'demotion', from, to }
  
  // ========== SISTEMA DE MONETIZACIÓN Y TIENDA ==========
  // Inventario del jugador (items desbloqueados)
  const [playerInventory, setPlayerInventory] = useState(() => {
    try {
      const saved = localStorage.getItem('dominoPlayerInventory');
      if (saved) return new Set(JSON.parse(saved));
    } catch (e) { console.error('Error loading inventory:', e); }
    // Items gratuitos por defecto
    return new Set(['classic_white', 'classic_ivory', 'felt_green', 'felt_blue', 'default_1', 'default_2', 'default_3', 'thumbs_up', 'thumbs_down', 'clap', 'thinking', 'none', 'bronze', 'novato']);
  });
  
  // Monedas del jugador
  const [playerCurrencies, setPlayerCurrencies] = useState(() => {
    try {
      const saved = localStorage.getItem('dominoPlayerCurrencies');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error('Error loading currencies:', e); }
    return { coins: 0, tokens: 500 }; // 500 tokens gratis al empezar
  });
  
  // Cosméticos equipados
  const [equippedCosmetics, setEquippedCosmetics] = useState(() => {
    try {
      const saved = localStorage.getItem('dominoEquippedCosmetics');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error('Error loading cosmetics:', e); }
    return { 
      skinSet: 'classic', 
      menuBackground: 'elegant_green', 
      avatar: 'default', 
      title: 'novato',
      frame: 'none', 
      effect: null 
    };
  });
  
  // Pase de temporada
  const [seasonPass, setSeasonPass] = useState(() => {
    try {
      const saved = localStorage.getItem('dominoSeasonPass');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error('Error loading season pass:', e); }
    return { owned: false, tier: 0, xp: 0, claimedFree: [], claimedPremium: [] };
  });
  
  // Sistema de recompensas diarias
  const [dailyRewards, setDailyRewards] = useState(() => {
    try {
      const saved = localStorage.getItem('dominoDailyRewards');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error('Error loading daily rewards:', e); }
    return {
      lastLoginDate: null,
      currentStreak: 0,
      todayClaimed: false,
      firstWinToday: false,
      gamesPlayedToday: 0,
      winsToday: 0,
      dominosToday: 0,
      pointsToday: 0,
      streakToday: 0
    };
  });
  
  // Recompensas de la última partida (para mostrar en pantalla de fin)
  const [lastMatchRewards, setLastMatchRewards] = useState(null);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SISTEMA DE REVANCHA
  // ═══════════════════════════════════════════════════════════════════════════
  const [rematchState, setRematchState] = useState({
    requested: false,      // Yo pedí revancha
    received: false,       // Recibí solicitud de revancha
    accepted: false,       // Revancha aceptada
    declined: false,       // Revancha rechazada
    count: 0,              // Número de revanchas en esta sesión
    maxRematches: 3,       // Máximo de revanchas permitidas
    opponentId: null,      // ID del oponente para revancha
    opponentName: null     // Nombre del oponente
  });
  
  // Guardar datos del oponente al terminar partida
  const [lastOpponent, setLastOpponent] = useState(null);
  
  // Función para pedir revancha
  const requestRematch = useCallback(() => {
    if (rematchState.count >= rematchState.maxRematches) {
      showNotification('warning', t('endGame.maxRematches'), '⚠️');
      return;
    }
    
    if (gameMode === 'online' && socket && socket.connected) {
      // Enviar solicitud de revancha al servidor
      socket.emit('rematch_request', { opponentId: lastOpponent?.odentifierId });
      setRematchState(prev => ({ ...prev, requested: true }));
    } else {
      // Modo offline: IA siempre acepta
      setRematchState(prev => ({ ...prev, requested: true, accepted: true }));
      setTimeout(() => {
        startRematch();
      }, 1000);
    }
  }, [gameMode, socket, lastOpponent, rematchState.count, rematchState.maxRematches]);
  
  // Función para aceptar revancha
  const acceptRematch = useCallback(() => {
    if (gameMode === 'online' && socket && socket.connected) {
      socket.emit('rematch_accept', { opponentId: lastOpponent?.id });
    }
    setRematchState(prev => ({ ...prev, accepted: true, received: false }));
    setTimeout(() => {
      startRematch();
    }, 500);
  }, [gameMode, socket, lastOpponent]);
  
  // Función para rechazar revancha
  const declineRematch = useCallback(() => {
    if (gameMode === 'online' && socket && socket.connected) {
      socket.emit('rematch_decline', { opponentId: lastOpponent?.id });
    }
    setRematchState(prev => ({ ...prev, declined: true, received: false }));
  }, [gameMode, socket, lastOpponent]);
  
  // Función para iniciar revancha
  const startRematch = useCallback(() => {
    setRematchState(prev => ({
      ...prev,
      requested: false,
      received: false,
      accepted: false,
      declined: false,
      count: prev.count + 1
    }));
    
    // Resetear estado del juego pero mantener oponentes
    setScores([0, 0]);
    setRoundNum(1);
    setBoard(SnakeBoard.create());
    setLastMatchRewards(null);
    setRankChange(null);
    setEloChange(0);
    
    // Iniciar nueva partida
    if (gameMode === 'online') {
      setPhase('playing');
    } else {
      setPhase('dealing');
    }
  }, [gameMode]);
  
  // Resetear estado de revancha al volver al menú
  const resetRematchState = useCallback(() => {
    setRematchState({
      requested: false,
      received: false,
      accepted: false,
      declined: false,
      count: 0,
      maxRematches: 3,
      opponentId: null,
      opponentName: null
    });
    setLastOpponent(null);
  }, []);
  
  // ═══════════════════════════════════════════════════════════════════════════
  // FUNCIÓN DE TRADUCCIÓN HELPER
  // ═══════════════════════════════════════════════════════════════════════════
  const t = useCallback((path) => {
    return getTranslation(path, settings.language || 'es');
  }, [settings.language]);
  
  // Verificar y resetear datos diarios
  useEffect(() => {
    const today = new Date().toDateString();
    if (dailyRewards.lastLoginDate !== today) {
      setDailyRewards(prev => ({
        ...prev,
        lastLoginDate: today,
        todayClaimed: false,
        firstWinToday: false,
        gamesPlayedToday: 0,
        winsToday: 0,
        dominosToday: 0,
        pointsToday: 0,
        streakToday: 0
      }));
    }
  }, []);
  
  // Guardar recompensas diarias
  useEffect(() => {
    try { localStorage.setItem('dominoDailyRewards', JSON.stringify(dailyRewards)); }
    catch (e) { console.error('Error saving daily rewards:', e); }
  }, [dailyRewards]);
  
  // Función para reclamar recompensa diaria
  const claimDailyReward = useCallback(() => {
    if (dailyRewards.todayClaimed) return null;
    
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    let newStreak = 1;
    if (dailyRewards.lastLoginDate === yesterday) {
      newStreak = Math.min(7, dailyRewards.currentStreak + 1);
    } else if (dailyRewards.lastLoginDate !== today) {
      newStreak = 1; // Reset streak si no entró ayer
    } else {
      newStreak = dailyRewards.currentStreak;
    }
    
    const reward = MonetizationSystem.DAILY_LOGIN.rewards[newStreak - 1];
    
    // Dar recompensas
    setPlayerCurrencies(prev => ({
      ...prev,
      tokens: prev.tokens + reward.tokens,
      coins: prev.coins + reward.coins
    }));
    
    setDailyRewards(prev => ({
      ...prev,
      lastLoginDate: today,
      currentStreak: newStreak,
      todayClaimed: true
    }));
    
    return { day: newStreak, ...reward };
  }, [dailyRewards]);
  
  // Función para calcular recompensas de partida
  const calculateMatchRewards = useCallback((won, matchData) => {
    const rewards = { tokens: 0, bonuses: [] };
    const MR = MonetizationSystem.MATCH_REWARDS;
    
    if (won) {
      // Base por victoria
      rewards.tokens += MR.WIN.tokens;
      rewards.bonuses.push({ name: 'Victoria', tokens: MR.WIN.tokens });
      
      // Bonus por dominó
      if (matchData.endType === 'domino') {
        rewards.tokens += MR.DOMINO_BONUS.tokens;
        rewards.bonuses.push({ name: 'Dominó', tokens: MR.DOMINO_BONUS.tokens });
      }
      
      // Bonus por capicúa
      if (matchData.isCapicua) {
        rewards.tokens += MR.CAPICUA_BONUS.tokens;
        rewards.bonuses.push({ name: 'Capicúa', tokens: MR.CAPICUA_BONUS.tokens });
      }
      
      // Bonus por partida perfecta
      if (matchData.opponentScore === 0) {
        rewards.tokens += MR.PERFECT_GAME.tokens;
        rewards.bonuses.push({ name: 'Partida Perfecta', tokens: MR.PERFECT_GAME.tokens });
      }
      
      // Bonus por comeback
      if (matchData.wasComeback) {
        rewards.tokens += MR.COMEBACK_BONUS.tokens;
        rewards.bonuses.push({ name: 'Remontada', tokens: MR.COMEBACK_BONUS.tokens });
      }
      
      // Bonus por racha (máximo 5 partidas)
      const streakBonus = Math.min(5, matchData.winStreak) * MR.STREAK_BONUS.tokens;
      if (streakBonus > 0) {
        rewards.tokens += streakBonus;
        rewards.bonuses.push({ name: `Racha x${Math.min(5, matchData.winStreak)}`, tokens: streakBonus });
      }
      
      // Bonus primera victoria del día
      if (!dailyRewards.firstWinToday) {
        rewards.tokens += MR.FIRST_WIN_DAY.tokens;
        rewards.bonuses.push({ name: 'Primera del Día', tokens: MR.FIRST_WIN_DAY.tokens });
      }
    } else {
      // Base por derrota (consolación)
      rewards.tokens += MR.LOSS.tokens;
      rewards.bonuses.push({ name: 'Participación', tokens: MR.LOSS.tokens });
    }
    
    return rewards;
  }, [dailyRewards.firstWinToday]);
  
  // Estadísticas del jugador (para logros)
  const [playerStats, setPlayerStats] = useState(() => {
    try {
      const saved = localStorage.getItem('dominoPlayerStats');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error('Error loading stats:', e); }
    return {
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      currentWinStreak: 0,
      maxWinStreak: 0,
      dominoWins: 0,
      capicuaWins: 0,
      trancaWins: 0,
      trancaComebacks: 0,
      perfectGames: 0,
      bigComebacks: 0,
      fastWins: 0,
      double9Starts: 0,
      fourDoublesHands: 0,
      maxPointsInGame: 0,
      emotesSent: 0,
      itemsOwned: 14, // Items gratis iniciales
      currentTier: 'bronze'
    };
  });
  
  // Logros desbloqueados
  const [unlockedAchievements, setUnlockedAchievements] = useState(() => {
    try {
      const saved = localStorage.getItem('dominoUnlockedAchievements');
      if (saved) return new Set(JSON.parse(saved));
    } catch (e) { console.error('Error loading achievements:', e); }
    return new Set();
  });
  
  // Cola de logros pendientes de mostrar
  const [achievementQueue, setAchievementQueue] = useState([]);
  const [showingAchievement, setShowingAchievement] = useState(null);
  
  // Pantallas de tienda/leaderboard/torneos/inventario/logros
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showTournaments, setShowTournaments] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showDailyRewards, setShowDailyRewards] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  
  // Sistema de amigos
  const [friendsList, setFriendsList] = useState(() => {
    try {
      const saved = localStorage.getItem('dominoFriendsList');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error('Error loading friends:', e); }
    // Generar amigos de demo para primera vez
    return FriendsSystem.generateDemoFriends();
  });
  
  const [friendRequests, setFriendRequests] = useState(() => {
    try {
      const saved = localStorage.getItem('dominoFriendRequests');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error('Error loading friend requests:', e); }
    // Generar solicitudes de demo
    return FriendsSystem.generateDemoRequests();
  });
  
  // Guardar amigos
  useEffect(() => {
    try { localStorage.setItem('dominoFriendsList', JSON.stringify(friendsList)); }
    catch (e) { console.error('Error saving friends:', e); }
  }, [friendsList]);
  
  // Guardar solicitudes
  useEffect(() => {
    try { localStorage.setItem('dominoFriendRequests', JSON.stringify(friendRequests)); }
    catch (e) { console.error('Error saving friend requests:', e); }
  }, [friendRequests]);
  
  // Funciones de amigos
  const handleAcceptFriendRequest = useCallback((request) => {
    // Agregar a lista de amigos
    const newFriend = {
      id: request.id,
      name: request.name,
      avatar: request.avatar,
      rating: request.rating,
      tier: request.tier,
      status: 'offline',
      lastSeen: Date.now(),
      gamesPlayed: 0,
      winRate: 50,
      addedAt: Date.now()
    };
    
    setFriendsList(prev => [...prev, newFriend]);
    setFriendRequests(prev => prev.filter(r => r.id !== request.id));
    showNotification('success', `¡${request.name} agregado!`, '👥');
  }, [showNotification]);
  
  const handleRejectFriendRequest = useCallback((request) => {
    setFriendRequests(prev => prev.filter(r => r.id !== request.id));
  }, []);
  
  const handleRemoveFriend = useCallback((friend) => {
    setFriendsList(prev => prev.filter(f => f.id !== friend.id));
    showNotification('info', `${friend.name} eliminado`, '👋');
  }, [showNotification]);
  
  const handleSendFriendRequest = useCallback((player) => {
    // En un caso real, esto enviaría la solicitud al servidor
    showNotification('success', `Solicitud enviada a ${player.name}`, '📩');
  }, [showNotification]);
  
  const handleInviteToGame = useCallback((friend) => {
    // En un caso real, esto enviaría la invitación por socket
    showNotification('info', `Invitación enviada a ${friend.name}`, '⚔️');
  }, [showNotification]);
  
  // Guardar inventario cuando cambie
  useEffect(() => {
    try { localStorage.setItem('dominoPlayerInventory', JSON.stringify([...playerInventory])); }
    catch (e) { console.error('Error saving inventory:', e); }
  }, [playerInventory]);
  
  // Guardar monedas cuando cambien
  useEffect(() => {
    try { localStorage.setItem('dominoPlayerCurrencies', JSON.stringify(playerCurrencies)); }
    catch (e) { console.error('Error saving currencies:', e); }
  }, [playerCurrencies]);
  
  // Guardar cosméticos equipados
  useEffect(() => {
    try { localStorage.setItem('dominoEquippedCosmetics', JSON.stringify(equippedCosmetics)); }
    catch (e) { console.error('Error saving cosmetics:', e); }
  }, [equippedCosmetics]);
  
  // Guardar pase de temporada
  useEffect(() => {
    try { localStorage.setItem('dominoSeasonPass', JSON.stringify(seasonPass)); }
    catch (e) { console.error('Error saving season pass:', e); }
  }, [seasonPass]);
  
  // Guardar estadísticas del jugador
  useEffect(() => {
    try { localStorage.setItem('dominoPlayerStats', JSON.stringify(playerStats)); }
    catch (e) { console.error('Error saving stats:', e); }
  }, [playerStats]);
  
  // Guardar logros desbloqueados
  useEffect(() => {
    try { localStorage.setItem('dominoUnlockedAchievements', JSON.stringify([...unlockedAchievements])); }
    catch (e) { console.error('Error saving achievements:', e); }
  }, [unlockedAchievements]);
  
  // Mostrar logros de la cola uno por uno
  useEffect(() => {
    if (achievementQueue.length > 0 && !showingAchievement) {
      const [next, ...rest] = achievementQueue;
      setShowingAchievement(next);
      setAchievementQueue(rest);
      
      // Ocultar después de 3 segundos
      setTimeout(() => {
        setShowingAchievement(null);
      }, 3000);
    }
  }, [achievementQueue, showingAchievement]);
  
  // Función para verificar y desbloquear logros
  const checkAndUnlockAchievements = useCallback((newStats) => {
    const newlyUnlocked = [];
    
    Object.values(ACHIEVEMENTS).forEach(achievement => {
      // Si ya está desbloqueado, saltar
      if (unlockedAchievements.has(achievement.id)) return;
      
      // Verificar si cumple requisitos
      if (checkAchievement(achievement, newStats)) {
        newlyUnlocked.push(achievement);
      }
    });
    
    // Si hay nuevos logros desbloqueados
    if (newlyUnlocked.length > 0) {
      // Agregar a desbloqueados
      setUnlockedAchievements(prev => {
        const updated = new Set(prev);
        newlyUnlocked.forEach(a => updated.add(a.id));
        return updated;
      });
      
      // Dar recompensas
      let totalTokens = 0;
      let totalCoins = 0;
      
      newlyUnlocked.forEach(achievement => {
        if (achievement.reward.tokens) totalTokens += achievement.reward.tokens;
        if (achievement.reward.coins) totalCoins += achievement.reward.coins;
      });
      
      if (totalTokens > 0 || totalCoins > 0) {
        setPlayerCurrencies(prev => ({
          ...prev,
          tokens: prev.tokens + totalTokens,
          coins: prev.coins + totalCoins
        }));
      }
      
      // Agregar a cola de notificaciones
      setAchievementQueue(prev => [...prev, ...newlyUnlocked]);
    }
    
    return newlyUnlocked;
  }, [unlockedAchievements]);
  
  // Actualizar estadísticas del jugador
  const updatePlayerStats = useCallback((updates) => {
    setPlayerStats(prev => {
      const newStats = { ...prev, ...updates };
      
      // Actualizar max win streak si es necesario
      if (updates.currentWinStreak !== undefined) {
        newStats.maxWinStreak = Math.max(newStats.maxWinStreak, updates.currentWinStreak);
      }
      
      // Actualizar tier actual
      if (profile?.rankTier) {
        newStats.currentTier = profile.rankTier;
      }
      
      // Actualizar items owned
      newStats.itemsOwned = playerInventory.size;
      
      // Verificar logros con las nuevas stats
      setTimeout(() => checkAndUnlockAchievements(newStats), 100);
      
      return newStats;
    });
  }, [checkAndUnlockAchievements, profile?.rankTier, playerInventory.size]);
  
  // Función para comprar items
  const handlePurchase = useCallback(async (item) => {
    if (!item || playerInventory.has(item.id)) return false;
    
    const currency = item.currency;
    const price = item.price;
    
    // Verificar si tiene suficiente moneda
    if (currency === 'coins' && playerCurrencies.coins < price) {
      setNotification({ type: 'error', message: 'No tienes suficientes 💎 Diamantes', icon: '❌' });
      setTimeout(() => setNotification(null), 2000);
      return false;
    }
    if (currency === 'tokens' && playerCurrencies.tokens < price) {
      setNotification({ type: 'error', message: 'No tienes suficientes 🪙 Tokens', icon: '❌' });
      setTimeout(() => setNotification(null), 2000);
      return false;
    }
    
    // Descontar moneda (items gratis no cuestan nada)
    if (price > 0) {
      setPlayerCurrencies(prev => ({
        ...prev,
        [currency]: prev[currency] - price
      }));
    }
    
    // Agregar al inventario
    setPlayerInventory(prev => new Set([...prev, item.id]));
    
    // Actualizar stats de items owned para logros
    setPlayerStats(prev => ({ ...prev, itemsOwned: (prev.itemsOwned || 0) + 1 }));
    
    setNotification({ type: 'success', message: `¡${item.name} desbloqueado!`, icon: '🎉' });
    setTimeout(() => setNotification(null), 2000);
    
    // Guardar en Firestore si el usuario está autenticado
    if (authUser?.id && !authUser.isGuest) {
      try {
        const { purchaseItem } = await import('./firestore.js');
        await purchaseItem(authUser.id, item.id, price, currency);
        console.log('[Firestore] Compra guardada:', item.id);
      } catch (e) {
        console.error('[Firestore] Error guardando compra:', e);
      }
    }
    
    return true;
  }, [playerInventory, playerCurrencies, authUser]);
  
  // Función para equipar un cosmético
  const equipCosmetic = useCallback(async (type, itemId) => {
    // Verificar que el item esté en el inventario
    if (!playerInventory.has(itemId)) {
      setNotification({ type: 'error', message: 'No tienes este item', icon: '❌' });
      setTimeout(() => setNotification(null), 2000);
      return false;
    }
    
    setEquippedCosmetics(prev => ({
      ...prev,
      [type]: itemId
    }));
    
    // Obtener nombre del item
    let itemName = itemId;
    if (type === 'tile') {
      const skin = TILE_SKINS[itemId];
      itemName = skin?.name || itemId;
    } else if (type === 'board') {
      const skin = BOARD_SKINS[itemId];
      itemName = skin?.name || itemId;
    }
    
    setNotification({ type: 'success', message: `${itemName} equipado`, icon: '✅' });
    setTimeout(() => setNotification(null), 1500);
    
    // Guardar en Firestore si el usuario está autenticado
    if (authUser?.id && !authUser.isGuest) {
      try {
        const { equipCosmetic: equipInFirestore } = await import('./firestore.js');
        await equipInFirestore(authUser.id, type, itemId);
        console.log('[Firestore] Cosmético equipado:', type, itemId);
      } catch (e) {
        console.error('[Firestore] Error guardando cosmético:', e);
      }
    }
    
    return true;
  }, [playerInventory, authUser]);
  
  // Función para dar tokens al ganar partida
  const awardMatchTokens = useCallback((matchResult) => {
    const tokens = MonetizationSystem.calculateTokensEarned(matchResult);
    setPlayerCurrencies(prev => ({ ...prev, tokens: prev.tokens + tokens }));
    
    // También dar XP de temporada
    const xp = MonetizationSystem.calculateSeasonXP(matchResult);
    setSeasonPass(prev => {
      const newXp = prev.xp + xp;
      const newTier = Math.floor(newXp / MonetizationSystem.SEASON_PASS.xpPerTier);
      return { ...prev, xp: newXp, tier: Math.min(newTier, MonetizationSystem.SEASON_PASS.tiers) };
    });
    
    return tokens;
  }, []);
  
  // Función para unirse a torneo
  const handleJoinTournament = useCallback((tournament) => {
    const { entryFee, currency } = tournament;
    
    if (entryFee > 0) {
      if (currency === 'coins' && playerCurrencies.coins < entryFee) {
        setNotification({ type: 'error', message: 'No tienes suficientes 💎 Diamantes', icon: '❌' });
        setTimeout(() => setNotification(null), 2000);
        return false;
      }
      if (currency === 'tokens' && playerCurrencies.tokens < entryFee) {
        setNotification({ type: 'error', message: 'No tienes suficientes 🪙 Tokens', icon: '❌' });
        setTimeout(() => setNotification(null), 2000);
        return false;
      }
      
      setPlayerCurrencies(prev => ({ ...prev, [currency]: prev[currency] - entryFee }));
    }
    
    setNotification({ type: 'success', message: `¡Inscrito en ${tournament.name}!`, icon: '🏅' });
    setTimeout(() => setNotification(null), 2000);
    // Aquí iría la lógica real de inscripción al torneo
    return true;
  }, [playerCurrencies]);
  
  // Extender playerProfile con monedas para mostrar en UI
  const extendedProfile = useMemo(() => ({
    ...playerProfile,
    coins: playerCurrencies.coins,
    tokens: playerCurrencies.tokens
  }), [playerProfile, playerCurrencies]);
  
  // Guardar perfil en localStorage cuando cambie
  useEffect(() => {
    try {
      localStorage.setItem('dominoPlayerProfile', JSON.stringify(playerProfile));
    } catch (e) {
      console.error('Error saving profile:', e);
    }
  }, [playerProfile]);
  
  // Guardar historial cuando cambie
  useEffect(() => {
    MatchHistory.save(matchHistory);
  }, [matchHistory]);
  
  // Actualizar leaderboard
  useEffect(() => {
    setLeaderboard(Leaderboard.generateLeaderboard(Leaderboard.TYPES.GLOBAL, playerProfile, { region: 'latam', limit: 100 }));
  }, [playerProfile.rating]);
  
  // Función para actualizar MMR después de una partida
  const updatePlayerRating = useCallback((won, opponents, matchData) => {
    setPlayerProfile(prev => {
      // Verificar si es partida válida para ranked (no vs IA en ranked real)
      // Por ahora permitimos vs IA pero con ganancia reducida
      const isVsAI = opponents.some(o => o.isAI);
      
      // Calcular nuevo rating con Glicko-2
      const scores = [won ? 1 : 0]; // Score del partido
      const oppData = [{ rating: opponents[0]?.rating || 1500, rd: opponents[0]?.rd || 150 }];
      
      let newRating = Glicko2.updateRating(
        { rating: prev.rating, rd: prev.rd, volatility: prev.volatility },
        oppData,
        scores
      );
      
      // Aplicar multiplicador de placement si aplica
      if (SeasonSystem.isInPlacement(prev)) {
        const multiplier = SeasonSystem.getPlacementMultiplier(prev.placementGames);
        const ratingDiff = newRating.rating - prev.rating;
        newRating.rating = prev.rating + Math.round(ratingDiff * multiplier);
      }
      
      // Reducir ganancias vs IA
      if (isVsAI && won) {
        const ratingDiff = newRating.rating - prev.rating;
        newRating.rating = prev.rating + Math.round(ratingDiff * 0.3); // Solo 30% vs IA
      }
      
      // Detección de smurf - acelerar si es necesario
      const smurfCheck = AntiAbuse.detectSmurf({
        ...prev,
        totalGames: prev.totalGames + 1,
        wins: prev.wins + (won ? 1 : 0),
        stompWins: prev.stompWins + (won && matchData?.isStompWin ? 1 : 0)
      });
      
      if (smurfCheck.isSmurf && smurfCheck.recommendation === 'accelerate_mmr') {
        const ratingDiff = newRating.rating - prev.rating;
        newRating.rating = prev.rating + Math.round(ratingDiff * 1.5); // 50% más rápido
      }
      
      // Verificar cambio de rango
      const change = RankSystem.checkRankChange(prev.rating, newRating.rating);
      if (change) {
        setRankChange(change);
        setTimeout(() => setRankChange(null), 5000);
      }
      
      // Actualizar estadísticas
      const updated = {
        ...prev,
        rating: Math.max(100, Math.min(3500, newRating.rating)),
        rd: newRating.rd,
        volatility: newRating.volatility,
        peakRating: Math.max(prev.peakRating, newRating.rating),
        totalGames: prev.totalGames + 1,
        wins: prev.wins + (won ? 1 : 0),
        losses: prev.losses + (won ? 0 : 1),
        seasonWins: prev.seasonWins + (won ? 1 : 0),
        seasonLosses: prev.seasonLosses + (won ? 0 : 1),
        placementGames: prev.placementGames + (SeasonSystem.isInPlacement(prev) ? 1 : 0),
        placementWins: prev.placementWins + (SeasonSystem.isInPlacement(prev) && won ? 1 : 0),
        isInPlacement: prev.placementGames + 1 < SeasonSystem.PLACEMENT_GAMES,
        lastGameDate: Date.now(),
        stompWins: prev.stompWins + (won && matchData?.isStompWin ? 1 : 0),
        smurfScore: smurfCheck.isSmurf ? prev.smurfScore + 1 : Math.max(0, prev.smurfScore - 0.5)
      };
      
      return updated;
    });
    
    // Crear entrada de historial
    const historyEntry = MatchHistory.createEntry({
      player: playerProfile.name,
      partner: players[2]?.name,
      opponents: [players[1]?.name, players[3]?.name],
      won,
      score: scores,
      endReason: matchData?.endReason || 'unknown',
      mmrBefore: playerProfile.rating,
      mmrAfter: playerProfile.rating + (won ? 15 : -15), // Aproximado
      rounds: matchRounds,
      duration: matchStartTime ? Math.floor((Date.now() - matchStartTime) / 1000) : 0,
      seasonId: playerProfile.seasonId,
      isPlacement: SeasonSystem.isInPlacement(playerProfile),
      wasRanked: true
    });
    
    setMatchHistory(prev => [...prev, historyEntry]);
    
    // Guardar estadísticas en Firestore si el usuario está autenticado
    if (authUser?.id && !authUser.isGuest) {
      (async () => {
        try {
          const { updateGameStats } = await import('./firestore.js');
          const result = await updateGameStats(authUser.id, {
            won,
            points: matchData?.score || 0,
            isDomino: matchData?.endReason === 'domino',
            isTranca: matchData?.endReason === 'tranca',
            isCapicua: matchData?.isCapicua || false,
            isPollona: matchData?.isPollona || false,
            newRating: playerProfile.rating + (won ? 15 : -15),
            newRd: playerProfile.rd,
            newVolatility: playerProfile.volatility,
            newRank: RankSystem.getRank(playerProfile.rating + (won ? 15 : -15)).name
          });
          console.log('[Firestore] Stats actualizadas:', result);
        } catch (e) {
          console.error('[Firestore] Error guardando stats:', e);
        }
      })();
    }
    
  }, [playerProfile, players, scores, matchRounds, matchStartTime, authUser]);
  
  // Función para mostrar notificaciones
  const showNotification = useCallback((type, message, icon, duration = 2000) => {
    setNotification({ type, message, icon });
    setTimeout(() => setNotification(null), duration);
  }, []);
  
  // Función para vibrar (si está habilitado)
  const vibrate = useCallback((pattern = [50]) => {
    if (settings.vibration && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, [settings.vibration]);
  
  // Perfil computado desde playerProfile
  const profile = useMemo(() => {
    const rank = RankSystem.getRank(playerProfile.rating);
    const winRate = playerProfile.totalGames > 0 
      ? Math.round((playerProfile.wins / playerProfile.totalGames) * 100) 
      : 0;
    
    return {
      name: playerProfile.name,
      avatar: '😎',
      elo: playerProfile.rating,
      rd: playerProfile.rd,
      rank: rank.name,
      rankIcon: rank.icon,
      rankTier: rank.tier,
      rankProgress: RankSystem.getProgress(playerProfile.rating),
      gamesPlayed: playerProfile.totalGames,
      wins: playerProfile.wins,
      losses: playerProfile.losses,
      winRate,
      seasonWins: playerProfile.seasonWins,
      seasonLosses: playerProfile.seasonLosses,
      peakRating: playerProfile.peakRating,
      isInPlacement: playerProfile.isInPlacement,
      placementGames: playerProfile.placementGames,
      placementWins: playerProfile.placementWins,
      currentStreak: playerProfile.currentStreak || 0
    };
  }, [playerProfile]);

  const aiRef = useRef(null);
  const timerRef = useRef(null);

  // Refs para evitar dependencias circulares en el timer
  const playTileRef = useRef(null);
  const passRef = useRef(null);
  const gameModeRef = useRef('local');
  
  // Mantener ref actualizado
  useEffect(() => {
    gameModeRef.current = gameMode;
  }, [gameMode]);

  // Timer - Se detiene cuando hay roundResult
  useEffect(() => {
    if (phase !== 'playing' || roundResult) {
      clearInterval(timerRef.current);
      return;
    }
    setTimer(15);
    timerRef.current = setInterval(() => {
      setTimer(p => {
        if (p <= 1) {
          // En modo online, NO hacer auto-play - el servidor manejará el timeout
          if (gameModeRef.current === 'online') {
            return 15; // Solo resetear timer
          }
          
          // Timeout para el jugador humano (solo en modo local)
          if (current === 0 && playTileRef.current && passRef.current) {
            const player = players[0];
            
            // Si tiene ficha obligatoria, jugarla
            if (mustPlay) {
              const tile = player.tiles.find(t => t.id === mustPlay.id);
              if (tile) {
                playTileRef.current(tile, 'center');
                return 15;
              }
            }
            
            // Buscar todas las fichas jugables
            const playableMoves = [];
            player.tiles.forEach(tile => {
              const positions = Engine.getValidPositions(tile, board);
              positions.forEach(pos => {
                playableMoves.push({ tile, pos });
              });
            });
            
            // Si hay fichas jugables, jugar una aleatoria
            if (playableMoves.length > 0) {
              const randomMove = playableMoves[Math.floor(Math.random() * playableMoves.length)];
              playTileRef.current(randomMove.tile, randomMove.pos);
              showNotification('warning', '¡Tiempo agotado! Jugada automática', '⏱️');
            } else {
              // No hay fichas jugables, pasar
              passRef.current();
            }
          }
          return 15;
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [current, phase, roundResult, players, mustPlay, board]);

  const startGame = useCallback(() => {
    // Desbloquear audio en primera interacción
    Audio.unlockAudio();
    Audio.playGameStart();
    
    const all = Engine.generateTiles();
    const shuffled = Engine.shuffle(all);
    const newP = players.map((p, i) => ({ ...p, tiles: shuffled.slice(i * 10, (i + 1) * 10) }));
    let starter = lastWinner, req = null;
    
    if (firstRound) { 
      // Primera mano: buscar doble más alto
      const { tile, playerIndex } = Engine.findHighestDouble(newP); 
      if (tile) { 
        starter = playerIndex; 
        req = tile; 
      } else {
        // Si nadie tiene dobles, buscar ficha con mayor suma
        const { tile: highTile, playerIndex: highIdx } = Engine.findHighestTile(newP);
        starter = highIdx;
        req = highTile; // Obligatorio jugar esta ficha
      }
    }
    
    setPlayers(newP); setCurrent(starter); setRoundStarter(starter); setBoard(SnakeBoard.create()); setPasses(0);
    setMoveCount(0); setStrategicBonusEligible(false);
    setMustPlay(req); setLastPlayed(null); setLastPlayPositions(1); setSelected(null); setShowChoice(false); setRoundResult(null);
    setPlayerPassed(null); setFlyingTile(null);
    setPassedNumbers({ 0: new Set(), 1: new Set(), 2: new Set(), 3: new Set() }); // Reset memoria de pases
    setMsg(req ? (Engine.isDouble(req) ? `${newP[starter].name} abre con doble ${req.left}` : `${newP[starter].name} abre con ${req.left}|${req.right}`) : `Turno de ${newP[starter].name}`);
    setPhase('playing');
    
    // Vibrar y sonido si es tu turno
    if (starter === 0) {
      Audio.playYourTurn();
    }
  }, [players, firstRound, lastWinner, vibrate]);

  // ══════════════════════════════════════════════════════════════════════════
  // FUNCIÓN: Buscar partida ONLINE
  // ══════════════════════════════════════════════════════════════════════════
  const startSearchOnline = useCallback(() => {
    if (!socket || !conectado) {
      setErrorConexion('No hay conexión al servidor');
      return;
    }
    
    // Guardar nombre para identificación
    const nombreJugador = playerProfile?.name || 'Jugador';
    localStorage.setItem('dominoPlayerName', nombreJugador);
    
    // Resetear para nueva partida
    setScores([0, 0]);
    setFirstRound(true);
    setRoundResult(null);
    setDoubleNextRound(false);
    setShowConfetti(false);
    setMatchStartTime(Date.now());
    setMatchRounds(0);
    setTarget(200);
    setSearching(true);
    setGameMode('online');
    
    // Identificarse si no lo hemos hecho
    if (!identificado) {
      socket.emit('identificarse', { 
        nombre: nombreJugador, 
        elo: playerProfile?.rating || 1500 
      });
    }
    
    // Buscar partida en el servidor
    socket.emit('buscarPartida');
    
  }, [socket, conectado, identificado, playerProfile]);
  
  // ══════════════════════════════════════════════════════════════════════════
  // FUNCIÓN: Cancelar búsqueda online
  // ══════════════════════════════════════════════════════════════════════════
  const cancelSearchOnline = useCallback(() => {
    if (socket) {
      socket.emit('cancelarBusqueda');
    }
    setSearching(false);
    setGameMode('local');
  }, [socket]);
  
  // ══════════════════════════════════════════════════════════════════════════
  // FUNCIÓN: Enviar emote
  // ══════════════════════════════════════════════════════════════════════════
  const sendEmote = useCallback((emote) => {
    if (!socket || !conectado || gameMode !== 'online') {
      return;
    }
    
    if (emoteCooldown) {
      showNotification('warning', 'Espera un momento...', '⏳');
      return;
    }
    
    // Sonido al enviar
    Audio.playEmoteSend();
    
    // Actualizar stats de emotes enviados
    updatePlayerStats({ emotesSent: (playerStats.emotesSent || 0) + 1 });
    
    socket.emit('enviarEmote', { emote });
    setShowEmoteMenu(false);
    setEmoteCooldown(true);
    
    // Cooldown de 2 segundos
    setTimeout(() => setEmoteCooldown(false), 2000);
  }, [socket, conectado, gameMode, emoteCooldown, showNotification, updatePlayerStats, playerStats]);

  // ══════════════════════════════════════════════════════════════════════════
  // FUNCIÓN: Buscar partida LOCAL (contra IA) - El original
  // ══════════════════════════════════════════════════════════════════════════
  const startSearchLocal = useCallback(() => { 
    // Resetear para nueva partida
    setScores([0, 0]);
    setFirstRound(true);
    setRoundResult(null);
    setDoubleNextRound(false);
    setShowConfetti(false);
    setMatchStartTime(Date.now()); // Inicio de partida ranked
    setMatchRounds(0);
    setTarget(200); // Meta fija de 200 puntos
    setSearching(true);
    setGameMode('local');
    
    setTimeout(() => { 
      setSearching(false);
      // Inicia el juego directamente
      const all = Engine.generateTiles();
      const shuffled = Engine.shuffle(all);
      const newP = players.map((p, i) => ({ ...p, tiles: shuffled.slice(i * 10, (i + 1) * 10) }));
      let starter = 0, req = null;
      
      // Primera mano: buscar doble más alto
      const { tile, playerIndex } = Engine.findHighestDouble(newP);
      if (tile) { 
        starter = playerIndex; 
        req = tile; 
      } else {
        // Si nadie tiene dobles, buscar ficha con mayor suma
        const { tile: highTile, playerIndex: highIdx } = Engine.findHighestTile(newP);
        starter = highIdx;
        req = highTile;
      }
      
      setPlayers(newP); 
      setCurrent(starter); 
      setRoundStarter(starter);
      setBoard(SnakeBoard.create()); 
      setPasses(0);
      setMoveCount(0);
      setStrategicBonusEligible(false);
      setMustPlay(req); 
      setLastPlayed(null); 
      setLastPlayPositions(1);
      setSelected(null); 
      setShowChoice(false);
      setPlayerPassed(null);
      setFlyingTile(null);
      setMsg(req ? (Engine.isDouble(req) ? `${newP[starter].name} abre con doble ${req.left}` : `${newP[starter].name} abre con ${req.left}|${req.right}`) : `Turno de ${newP[starter].name}`);
      setPhase('playing');
    }, 2000); 
  }, [players]);
  
  // ══════════════════════════════════════════════════════════════════════════
  // FUNCIÓN PRINCIPAL: Buscar partida (decide entre online y local)
  // ══════════════════════════════════════════════════════════════════════════
  const startSearch = useCallback(() => { 
    // Si hay conexión al servidor, buscar online
    if (conectado) {
      startSearchOnline();
    } else {
      // Si no hay servidor, jugar contra IA
      startSearchLocal();
    }
  }, [conectado, startSearchOnline, startSearchLocal]);
  
  const reset = useCallback(() => { 
    clearTimeout(aiRef.current); 
    clearInterval(timerRef.current); 
    setScores([0, 0]); 
    setFirstRound(true); 
    setPhase('menu'); 
    setEloChange(0);
    setRoundResult(null);
    setShowConfetti(false);
    setCurrentScreen('home');
    setDoubleNextRound(false);
    setSearching(false);
    setPlayerPassed(null);
    setFlyingTile(null);
    resetRematchState(); // Resetear estado de revancha
    setLastOpponent(null);
  }, [resetRematchState]);

  const endRound = useCallback((winner, type) => {
    // Detener timer y AI inmediatamente
    clearInterval(timerRef.current);
    clearTimeout(aiRef.current);
    
    // Guardar snapshot de las fichas de cada jugador ANTES de cualquier cambio
    const playerSnapshot = players.map(p => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      team: p.team,
      tiles: [...p.tiles],
      points: Engine.tilesValue(p.tiles)
    }));
    
    // Calcular puntos totales de cada jugador y equipo
    const allPoints = playerSnapshot.reduce((sum, p) => sum + p.points, 0);
    
    let winTeam = -1;
    let pts = 0;
    let closedByName = null;
    let bonus = 0;
    let bonusType = null;
    
    if (type === 'domino') { 
      // DOMINÓ: Gana el equipo del jugador que cerró
      winTeam = players[winner].team;
      closedByName = players[winner].name;
      
      // Sonido de dominó
      Audio.playDomino();
      
      // Se suman los puntos de los OTROS 3 jugadores (todos menos el que cerró)
      pts = playerSnapshot
        .filter(p => p.id !== winner)
        .reduce((sum, p) => sum + p.points, 0);
      
      // Bonificación por dominación
      // +10 si la ficha solo podía ir en un extremo
      // +20 si podía ir en ambos extremos
      if (lastPlayPositions === 1) {
        bonus = 10;
        bonusType = 'single'; // Solo un extremo
      } else if (lastPlayPositions >= 2) {
        bonus = 20;
        bonusType = 'double'; // Ambos extremos
      }
      pts += bonus;
      
      if (winTeam === 0) {
        setShowConfetti(true);
        vibrate([100, 50, 100, 50, 200]);
        setTimeout(() => setShowConfetti(false), 4000);
      }
    } else { 
      // TRANCA: Gana la pareja con el JUGADOR de menor puntaje individual
      // Sonido de tranca
      Audio.playTranca();
      
      // Encontrar el jugador con menor puntaje
      let minPoints = Infinity;
      let minPlayer = null;
      
      playerSnapshot.forEach(p => {
        if (p.points < minPoints) {
          minPoints = p.points;
          minPlayer = p;
        }
      });
      
      // Verificar empate de menores puntos entre equipos
      const minTeam0 = Math.min(...playerSnapshot.filter(p => p.team === 0).map(p => p.points));
      const minTeam1 = Math.min(...playerSnapshot.filter(p => p.team === 1).map(p => p.points));
      
      if (minTeam0 === minTeam1) {
        // Empate - nadie suma puntos, PERO próxima ronda vale doble
        // El equipo contrario al que inició esta mano gana el derecho de salida
        const starterTeam = players[roundStarter].team;
        const otherTeam = starterTeam === 0 ? 1 : 0;
        
        // Encontrar el jugador con menor puntaje del equipo contrario
        let nextStarter = 0;
        let minPts = Infinity;
        playerSnapshot.forEach((p, idx) => {
          if (p.team === otherTeam && p.points < minPts) {
            minPts = p.points;
            nextStarter = idx;
          }
        });
        
        setRoundResult({
          type: 'tranca',
          winTeam: -1,
          points: 0,
          closedBy: null,
          playerSnapshot,
          bonus: 0,
          bonusType: null,
          isTie: true,
          isDouble: false
        });
        setDoubleNextRound(true); // Próxima ronda vale doble
        setLastWinner(nextStarter); // El jugador de menor puntaje del equipo contrario inicia
        setFirstRound(false);
        return;
      }
      
      winTeam = minPlayer.team;
      
      // Se suman los puntos de TODOS los jugadores
      pts = allPoints;
      
      setScreenShake(true);
      vibrate([200, 100, 200]);
      setTimeout(() => setScreenShake(false), 500);
      
      if (winTeam === 0) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      }
    }
    
    // Aplicar multiplicador x2 si la ronda anterior fue empate
    const isDoubleRound = doubleNextRound;
    if (isDoubleRound) {
      pts *= 2;
    }
    
    // Guardar resultado
    setRoundResult({
      type,
      winTeam,
      points: pts,
      closedBy: closedByName,
      playerSnapshot,
      bonus,
      bonusType,
      isDouble: isDoubleRound
    });
    
    // Resetear el multiplicador doble
    setDoubleNextRound(false);
    
    // Actualizar scores
    const newScores = [...scores];
    newScores[winTeam] += pts;
    setScores(newScores);
    
    // Actualizar estado del juego
    // Para dominó: el que cerró inicia la siguiente mano
    // Para tranca: el jugador de menor puntaje del equipo ganador inicia
    let nextStarter;
    if (type === 'domino') {
      nextStarter = winner;
    } else {
      // Tranca: encontrar jugador de menor puntaje del equipo ganador
      let minPts = Infinity;
      nextStarter = 0;
      playerSnapshot.forEach((p, idx) => {
        if (p.team === winTeam && p.points < minPts) {
          minPts = p.points;
          nextStarter = idx;
        }
      });
    }
    setLastWinner(nextStarter); 
    setFirstRound(false);
    setMatchRounds(prev => prev + 1); // Contar rondas
    
    // Calcular cambio de ELO real basado en el sistema Glicko-2
    const playerWon = winTeam === 0;
    const ratingChange = playerWon ? Math.floor(Math.random() * 8) + 12 : -(Math.floor(Math.random() * 6) + 8);
    setEloChange(ratingChange);
    
    // Verificar si alguien ganó la partida completa
    if (newScores[winTeam] >= target) {
      // Sonido de fin de partida
      if (playerWon) {
        Audio.playGameWin();
      } else {
        Audio.playGameLose();
      }
      
      // Actualizar rating del jugador
      const isStompWin = playerWon && (newScores[0] >= newScores[1] * 2);
      updatePlayerRating(playerWon, [
        { rating: players[1].elo, rd: 150, isAI: true },
        { rating: players[3].elo, rd: 150, isAI: true }
      ], {
        endReason: type,
        isStompWin
      });
      
      // ═══════════════════════════════════════════════════════════════════════
      // ACTUALIZAR ESTADÍSTICAS PARA LOGROS
      // ═══════════════════════════════════════════════════════════════════════
      const statsUpdate = {
        gamesPlayed: (playerStats.gamesPlayed || 0) + 1
      };
      
      if (playerWon) {
        statsUpdate.wins = (playerStats.wins || 0) + 1;
        statsUpdate.currentWinStreak = (playerStats.currentWinStreak || 0) + 1;
        
        // Tipo de victoria
        if (type === 'domino') {
          statsUpdate.dominoWins = (playerStats.dominoWins || 0) + 1;
          
          // Verificar capicúa (el valor izq y der del tablero son iguales)
          const ends = Engine.getBoardEnds(board);
          if (ends.leftEnd === ends.rightEnd && ends.leftEnd !== null) {
            statsUpdate.capicuaWins = (playerStats.capicuaWins || 0) + 1;
          }
        } else if (type === 'tranca') {
          statsUpdate.trancaWins = (playerStats.trancaWins || 0) + 1;
          
          // Verificar comeback en tranca
          if (scores[0] < scores[1]) {
            statsUpdate.trancaComebacks = (playerStats.trancaComebacks || 0) + 1;
          }
        }
        
        // Partida perfecta (rival no anotó)
        if (newScores[1] === 0) {
          statsUpdate.perfectGames = (playerStats.perfectGames || 0) + 1;
        }
        
        // Comeback grande (estabas 50+ abajo)
        if (scores[1] - scores[0] >= 50 && playerWon) {
          statsUpdate.bigComebacks = (playerStats.bigComebacks || 0) + 1;
        }
      } else {
        statsUpdate.losses = (playerStats.losses || 0) + 1;
        statsUpdate.currentWinStreak = 0;
      }
      
      // Máximos puntos en una partida
      if (newScores[0] > (playerStats.maxPointsInGame || 0)) {
        statsUpdate.maxPointsInGame = newScores[0];
      }
      
      updatePlayerStats(statsUpdate);
      
      // ═══════════════════════════════════════════════════════════════════════
      // CALCULAR Y DAR RECOMPENSAS POR PARTIDA
      // ═══════════════════════════════════════════════════════════════════════
      const ends = Engine.getBoardEnds(board);
      const isCapicua = type === 'domino' && ends.leftEnd === ends.rightEnd && ends.leftEnd !== null;
      const wasComeback = scores[1] - scores[0] >= 30 && playerWon;
      
      const matchData = {
        endType: type,
        isCapicua,
        opponentScore: newScores[1],
        wasComeback,
        winStreak: playerWon ? (playerStats.currentWinStreak || 0) + 1 : 0
      };
      
      const rewards = calculateMatchRewards(playerWon, matchData);
      
      // Dar los tokens
      if (rewards.tokens > 0) {
        setPlayerCurrencies(prev => ({
          ...prev,
          tokens: prev.tokens + rewards.tokens
        }));
      }
      
      // Actualizar datos diarios
      setDailyRewards(prev => ({
        ...prev,
        gamesPlayedToday: prev.gamesPlayedToday + 1,
        winsToday: playerWon ? prev.winsToday + 1 : prev.winsToday,
        dominosToday: type === 'domino' && playerWon ? prev.dominosToday + 1 : prev.dominosToday,
        pointsToday: Math.max(prev.pointsToday, newScores[0]),
        firstWinToday: playerWon ? true : prev.firstWinToday
      }));
      
      // Guardar recompensas para mostrar en pantalla
      setLastMatchRewards(rewards);
      
      setPhase('gameOver');
    }
  }, [players, scores, target, vibrate, lastPlayPositions, doubleNextRound, roundStarter, updatePlayerRating, playerStats, updatePlayerStats, board, calculateMatchRewards]);

  const playTile = useCallback((tile, pos) => {
    // Protección contra llamadas cuando ya terminó la ronda
    if (roundResult) return;
    
    // ═══════════════════════════════════════════════════════════════════════
    // MODO ONLINE: Enviar jugada al servidor
    // ═══════════════════════════════════════════════════════════════════════
    if (gameMode === 'online' && socket && socket.connected) {
      console.log('📤 Enviando jugada al servidor:', tile, pos);
      
      // Convertir posición al formato del servidor
      const posicionServidor = pos === 'left' ? 'izquierda' : 
                               pos === 'right' ? 'derecha' : 'centro';
      
      socket.emit('jugarFicha', {
        ficha: tile,
        posicion: posicionServidor
      });
      
      // No procesamos localmente, esperamos la respuesta del servidor
      setSelected(null);
      setShowChoice(false);
      return;
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // MODO LOCAL: Procesar jugada localmente (vs IA)
    // ═══════════════════════════════════════════════════════════════════════
    
    // Guardar cuántas posiciones válidas tenía esta ficha ANTES de jugarla
    const validPositions = Engine.getValidPositions(tile, board);
    const numPositions = validPositions.length;
    
    // Calcular la posición final de la ficha ANTES de animarla
    const previewBoard = Engine.placeOnBoard(board, tile, pos);
    const placedTile = previewBoard.tiles[previewBoard.tiles.length - 1];
    
    // Iniciar animación de ficha volando con posición destino
    setFlyingTile({ 
      tile, 
      fromPlayer: current, 
      pos,
      targetX: placedTile.x,
      targetY: placedTile.y,
      isHorizontal: placedTile.orientation === 'HORIZONTAL',
      inElbow: placedTile.inElbow
    });
    
    // Después de la animación, actualizar el tablero
    setTimeout(() => {
      const nb = Engine.placeOnBoard(board, tile, pos);
      const np = Engine.removeTile(players, current, tile.id);
      
      // La última ficha colocada está al final de nb.tiles
      const placed = nb.tiles[nb.tiles.length - 1];
      
      setBoard(nb); 
      setPlayers(np); 
      setLastPlayed(placed);
      setLastPlayPositions(numPositions);
      setFlyingTile(null);
      setMustPlay(null); 
      setSelected(null); 
      setShowChoice(false);
      
      // Regla 8 - Salida estratégica (+20)
      // Si moveCount === 2 (compañero del abridor) Y el segundo jugador pasó Y el compañero juega
      if (moveCount === 2 && strategicBonusEligible) {
        // Otorgar +20 al equipo del abridor
        const openerTeam = players[roundStarter].team;
        const newScores = [...scores];
        newScores[openerTeam] += 20;
        setScores(newScores);
        showNotification('success', '¡Salida estratégica! +20', '🎯');
        setStrategicBonusEligible(false);
      }
      setMoveCount(m => m + 1);
      
      // Sonido y vibración al jugar
      Audio.playTilePlace();
      
      if (np[current].tiles.length === 0) { 
        endRound(current, 'domino'); 
        return; 
      }
      setPasses(0); 
      const next = (current + 1) % 4; 
      setCurrent(next); 
      setMsg(`Turno de ${np[next].name}`);
      
      // Vibrar si es tu turno
      if (next === 0) {
        vibrate([100, 50, 100]);
      }
    }, 800); // Duración de la animación (0.8s)
  }, [board, players, current, endRound, vibrate, roundResult, moveCount, strategicBonusEligible, roundStarter, scores, gameMode, socket]);

  const pass = useCallback(() => {
    // Protección contra llamadas cuando ya terminó la ronda
    if (roundResult) return;
    
    if (mustPlay) { 
      showNotification('error', `¡Debes jugar el doble ${mustPlay.left}!`, '⚠️');
      vibrate([50, 30, 50, 30, 50]);
      return; 
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // MODO ONLINE: Enviar pase al servidor
    // ═══════════════════════════════════════════════════════════════════════
    if (gameMode === 'online' && socket && socket.connected) {
      console.log('📤 Enviando pase al servidor');
      socket.emit('pasarTurno');
      return;
    }
    
    // ═══════════════════════════════════════════════════════════════════════
    // MODO LOCAL: Procesar pase localmente
    // ═══════════════════════════════════════════════════════════════════════
    
    const np = passes + 1; 
    setPasses(np);
    
    // Registrar qué números NO tiene este jugador (pasó cuando estaban)
    const ends = board.tiles?.length > 0 
      ? { left: board.snakeTop?.value, right: board.snakeBottom?.value }
      : { left: null, right: null };
    
    setPassedNumbers(prev => {
      const updated = { ...prev };
      updated[current] = new Set(prev[current]);
      if (ends.left !== null) updated[current].add(ends.left);
      if (ends.right !== null) updated[current].add(ends.right);
      return updated;
    });
    
    // Regla 8 - Salida estratégica
    // moveCount 1 = segundo jugador (después del abridor)
    // moveCount 2 = compañero del abridor
    if (moveCount === 1) {
      // El segundo jugador pasó - posible bonus
      setStrategicBonusEligible(true);
    } else if (moveCount === 2 && strategicBonusEligible) {
      // El compañero del abridor pasó - se anula el bonus
      setStrategicBonusEligible(false);
    }
    setMoveCount(m => m + 1);
    
    // Mostrar indicador de pase cerca del jugador
    setPlayerPassed(current);
    setTimeout(() => setPlayerPassed(null), 1500);
    
    // Sonido de pasar
    Audio.playPass();
    
    if (np >= 4) { 
      endRound(null, 'tranca'); 
      return; 
    }
    
    const next = (current + 1) % 4; 
    setCurrent(next); 
    setMsg(`${players[current].name} pasa`);
    
    // Vibrar si es tu turno
    if (next === 0) {
      Audio.playYourTurn();
    }
  }, [mustPlay, passes, current, players, endRound, vibrate, roundResult, moveCount, strategicBonusEligible, gameMode, socket]);

  // Actualizar refs para el timer
  useEffect(() => { playTileRef.current = playTile; }, [playTile]);
  useEffect(() => { passRef.current = pass; }, [pass]);

  const handleClick = useCallback(tile => {
    if (current !== 0 || phase !== 'playing' || roundResult) return;
    
    if (mustPlay && tile.id !== mustPlay.id) { 
      showNotification('warning', `¡Debes jugar el doble ${mustPlay.left}!`, '⚠️');
      vibrate([50, 30, 50]);
      return; 
    }
    
    const pos = Engine.getValidPositions(tile, board);
    
    if (!pos.length) { 
      showNotification('error', 'Esta ficha no conecta', '❌', 1500);
      vibrate([50, 30, 50, 30, 50]);
      return; 
    }
    
    if (pos.length === 1) {
      playTile(tile, pos[0]); 
    } else { 
      setSelected(tile); 
      setShowChoice(true); 
    }
  }, [current, phase, mustPlay, board, playTile, roundResult, showNotification, vibrate]);

  // AI - Se detiene cuando hay roundResult o estamos en modo online
  useEffect(() => {
    // En modo online, los otros jugadores son humanos reales - no usar IA
    if (gameMode === 'online') {
      clearTimeout(aiRef.current);
      return;
    }
    
    if (phase !== 'playing' || current === 0 || roundResult) {
      clearTimeout(aiRef.current);
      return;
    }
    aiRef.current = setTimeout(() => {
      if (roundResult) return; // Doble chequeo
      const d = AI.decide({ players, board, mustPlayDouble: mustPlay }, current, passedNumbers);
      d.action === 'play' ? playTile(d.tile, d.position) : pass();
    }, 1000); // Tiempo para que la IA "piense"
    return () => clearTimeout(aiRef.current);
  }, [current, phase, players, board, mustPlay, playTile, pass, roundResult, passedNumbers, gameMode]);

  const canPass = !mustPlay && !Engine.canPlay(players[0].tiles, board);
  
  // Auto-pass: cuando el jugador no puede jugar, pasar automáticamente con delay
  // Solo en modo local - en online el servidor valida
  useEffect(() => {
    // No auto-pass en modo online
    if (gameMode === 'online') return;
    
    if (phase !== 'playing' || current !== 0 || roundResult) return;
    if (!canPass) return;
    
    // Pasar automáticamente después de un breve delay
    const timer = setTimeout(() => {
      if (passRef.current) passRef.current();
    }, 800);
    
    return () => clearTimeout(timer);
  }, [current, phase, canPass, roundResult, gameMode]);
  
  const C = THEME.colors;

  // ============================================================================
  // COMPONENTES DE UI REUTILIZABLES - OPTIMIZADOS PARA MÓVIL
  // ============================================================================
  
  // Toggle Switch - Más grande para touch
  const Toggle = ({ value, onChange }) => (
    <button onClick={() => onChange(!value)} 
      className="relative rounded-full transition-all duration-200 touch-feedback"
      style={{ 
        width: 56, 
        height: 32, 
        minWidth: 56,
        background: value ? C.accent.green : C.bg.card, 
        border: `2px solid ${value ? C.accent.green : C.bg.border}` 
      }}>
      <div className="absolute top-1 rounded-full transition-all duration-200"
        style={{ 
          width: 24, 
          height: 24,
          left: value ? '28px' : '4px', 
          background: '#fff', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)' 
        }} />
    </button>
  );
  
  // Slider - Más alto para touch
  const Slider = ({ value, onChange, min = 0, max = 100 }) => (
    <div className="relative w-full h-10 flex items-center">
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
        className="w-full h-3 rounded-full appearance-none cursor-pointer"
        style={{ 
          background: `linear-gradient(to right, ${C.gold.main} 0%, ${C.gold.main} ${value}%, ${C.bg.card} ${value}%, ${C.bg.card} 100%)`,
          WebkitAppearance: 'none'
        }} />
      <span className="absolute right-0 -top-4 text-sm font-mono font-bold" style={{ color: C.gold.main }}>{value}%</span>
    </div>
  );
  
  // Select Dropdown - Más grande para touch
  const Select = ({ value, options, onChange }) => (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="px-4 py-3 rounded-xl text-base font-medium cursor-pointer min-h-[48px]"
      style={{ background: C.bg.card, color: '#fff', border: `2px solid ${C.bg.border}` }}>
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  );

  // ============================================================================
  // COMPONENTE DE NOTIFICACIÓN FLOTANTE
  // ============================================================================
  const Notification = () => {
    if (!notification) return null;
    
    const bgColors = {
      success: C.accent.green,
      error: C.accent.red,
      warning: '#FBBF24',
      info: C.accent.blue,
      pass: C.accent.slate,
      domino: C.gold.main,
      tranca: C.accent.red
    };
    
    return (
      <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
        <div className="flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl"
          style={{ 
            background: `linear-gradient(135deg, ${bgColors[notification.type]}ee, ${bgColors[notification.type]}cc)`,
            boxShadow: `0 10px 40px ${bgColors[notification.type]}50`
          }}>
          <span className="text-2xl">{notification.icon}</span>
          <span className="font-bold text-white">{notification.message}</span>
        </div>
      </div>
    );
  };

  // ============================================================================
  // COMPONENTE DE CONFETTI
  // ============================================================================
  const Confetti = () => {
    if (!showConfetti) return null;
    
    const pieces = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      color: [C.gold.main, C.gold.light, C.accent.blue, C.accent.green, '#fff'][Math.floor(Math.random() * 5)]
    }));
    
    return (
      <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
        {pieces.map(p => (
          <div key={p.id} className="absolute w-3 h-3 rounded-sm"
            style={{
              left: `${p.left}%`,
              top: '-20px',
              background: p.color,
              animation: `fall ${p.duration}s ease-out ${p.delay}s forwards`,
              transform: `rotate(${Math.random() * 360}deg)`
            }} />
        ))}
        <style>{`
          @keyframes fall {
            to {
              top: 110%;
              transform: rotate(720deg) translateX(${Math.random() > 0.5 ? '' : '-'}100px);
              opacity: 0;
            }
          }
        `}</style>
      </div>
    );
  };

  // ============================================================================
  // COMPONENTE DE OVERLAY DE EVENTO (DOMINÓ/TRANCA)
  // ============================================================================
  const EventOverlay = () => {
    // No mostrar en pantalla de gameOver (tiene su propia UI)
    if (phase === 'gameOver') return null;
    if (!roundResult || !roundResult.playerSnapshot) return null;
    
    const isDomino = roundResult.type === 'domino';
    const playerScores = roundResult.playerSnapshot;
    
    // Puntos por equipo (ya calculados en snapshot)
    const teamTotals = [0, 0];
    playerScores.forEach(p => { teamTotals[p.team] += p.points; });
    
    // Mini componente para dibujar una ficha pequeña
    const MiniTile = ({ tile, size = 12 }) => (
      <div style={{
        width: size,
        height: size * 2,
        background: `linear-gradient(180deg, ${C.tile.highlight}, ${C.tile.base})`,
        border: `1px solid ${C.tile.border}`,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        flexShrink: 0
      }}>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: `1px solid ${C.tile.shadow}`,
          fontSize: size * 0.55,
          fontWeight: 900,
          color: THEME.dotColors[tile.left]
        }}>{tile.left}</div>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.55,
          fontWeight: 900,
          color: THEME.dotColors[tile.right]
        }}>{tile.right}</div>
      </div>
    );
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3"
        style={{ background: 'rgba(0,0,0,0.9)' }}>
        <div className="w-full max-w-sm animate-pop-in">
          
          {/* Header con icono */}
          <div className="text-center mb-3">
            {/* Indicador de ronda doble */}
            {roundResult.isDouble && (
              <div className="mb-2 px-3 py-1 rounded-full inline-block animate-pulse"
                style={{ background: `${C.gold.main}30`, border: `2px solid ${C.gold.main}` }}>
                <span className="text-sm font-black" style={{ color: C.gold.main }}>⚡ ×2 PUNTOS DOBLES ⚡</span>
              </div>
            )}
            <div className={`text-6xl mb-2 ${isDomino ? 'animate-bounce' : 'animate-shake'}`}>
              {isDomino ? '🎉' : '🔒'}
            </div>
            <h2 className="text-3xl font-black"
              style={{ color: isDomino ? C.gold.main : C.accent.red }}>
              {isDomino ? '¡DOMINÓ!' : '¡TRANCA!'}
            </h2>
            <p className="text-sm" style={{ color: C.accent.slate }}>
              {isDomino ? `${roundResult.closedBy} cerró el juego` : 'Nadie puede jugar'}
            </p>
          </div>
          
          {/* Hoja de anotación */}
          <div className="rounded-xl overflow-hidden mb-3" style={{ background: '#FFF9E6', border: `2px solid ${C.gold.dark}` }}>
            
            {/* Título */}
            <div className="text-center py-2" style={{ background: C.gold.dark, color: '#fff' }}>
              <span className="font-black text-xs">📋 CONTEO DE PUNTOS</span>
            </div>
            
            <div style={{ padding: 10, maxHeight: '40vh', overflowY: 'auto' }}>
              
              {/* Equipo Azul */}
              <div className="mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <span>🔵</span>
                  <span className="font-bold text-xs" style={{ color: C.accent.blue }}>EQUIPO AZUL</span>
                </div>
                
                {playerScores.filter(p => p.team === 0).map(p => (
                  <div key={p.id} className="mb-1 pl-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: '#333' }}>
                        {p.avatar} {p.name}
                      </span>
                      <span className="font-mono font-bold text-xs" style={{ color: '#333' }}>
                        {p.tiles.length > 0 ? p.points : '✓'}
                      </span>
                    </div>
                    {p.tiles.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-1">
                        {p.tiles.map((t, i) => <MiniTile key={i} tile={t} size={10} />)}
                      </div>
                    )}
                  </div>
                ))}
                
                <div className="flex justify-between pl-5 pt-1 text-xs" style={{ borderTop: '1px dashed #ccc' }}>
                  <span className="font-bold" style={{ color: '#333' }}>Subtotal:</span>
                  <span className="font-mono font-black" style={{ color: C.accent.blue }}>{teamTotals[0]}</span>
                </div>
              </div>
              
              <div style={{ borderTop: '1px solid #ddd', margin: '6px 0' }} />
              
              {/* Equipo Rojo */}
              <div className="mb-2">
                <div className="flex items-center gap-2 mb-1">
                  <span>🔴</span>
                  <span className="font-bold text-xs" style={{ color: C.accent.red }}>EQUIPO ROJO</span>
                </div>
                
                {playerScores.filter(p => p.team === 1).map(p => (
                  <div key={p.id} className="mb-1 pl-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: '#333' }}>
                        {p.avatar} {p.name}
                      </span>
                      <span className="font-mono font-bold text-xs" style={{ color: '#333' }}>
                        {p.tiles.length > 0 ? p.points : '✓'}
                      </span>
                    </div>
                    {p.tiles.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-1">
                        {p.tiles.map((t, i) => <MiniTile key={i} tile={t} size={10} />)}
                      </div>
                    )}
                  </div>
                ))}
                
                <div className="flex justify-between pl-5 pt-1 text-xs" style={{ borderTop: '1px dashed #ccc' }}>
                  <span className="font-bold" style={{ color: '#333' }}>Subtotal:</span>
                  <span className="font-mono font-black" style={{ color: C.accent.red }}>{teamTotals[1]}</span>
                </div>
              </div>
              
              {/* Bonificaciones */}
              {roundResult.bonus > 0 && (
                <>
                  <div style={{ borderTop: '1px solid #ddd', margin: '6px 0' }} />
                  <div className="text-center">
                    <span className="text-xs font-bold" style={{ color: C.gold.dark }}>✨ BONIFICACIÓN ✨</span>
                    <div className="text-xs mt-1" style={{ color: '#333' }}>
                      {roundResult.bonusType === 'single' 
                        ? 'Dominó en un extremo: ' 
                        : 'Dominó en ambos extremos: '}
                      <span className="font-bold">+{roundResult.bonus} pts</span>
                    </div>
                  </div>
                </>
              )}
              
              {/* Empate en tranca */}
              {roundResult.isTie && (
                <>
                  <div style={{ borderTop: '1px solid #ddd', margin: '6px 0' }} />
                  <div className="text-center">
                    <span className="text-xs font-bold" style={{ color: C.accent.red }}>⚖️ EMPATE</span>
                    <div className="text-xs mt-1" style={{ color: '#333' }}>
                      Nadie suma puntos esta ronda
                    </div>
                    <div className="text-xs mt-2 px-2 py-1 rounded inline-block" 
                      style={{ background: `${C.gold.main}20`, color: C.gold.dark }}>
                      ⚡ Próxima ronda: <b>PUNTOS DOBLES</b>
                    </div>
                  </div>
                </>
              )}
              
              {/* Indicador de puntos dobles aplicados */}
              {roundResult.isDouble && (
                <>
                  <div style={{ borderTop: '1px solid #ddd', margin: '6px 0' }} />
                  <div className="text-center">
                    <span className="text-xs font-bold" style={{ color: C.gold.dark }}>⚡ RONDA DOBLE ⚡</span>
                    <div className="text-xs mt-1" style={{ color: '#333' }}>
                      ¡Puntos multiplicados ×2!
                    </div>
                  </div>
                </>
              )}
              
              {/* Total */}
              <div style={{ borderTop: '2px double #333', marginTop: 8, paddingTop: 6 }}>
                <div className="flex justify-between items-center">
                  <span className="font-black text-xs" style={{ color: '#333' }}>
                    🏆 {roundResult.winTeam === 0 ? 'AZUL' : roundResult.winTeam === 1 ? 'ROJO' : 'EMPATE'}
                  </span>
                  <span className="font-mono font-black text-base" style={{ 
                    color: roundResult.winTeam === 0 ? C.accent.blue : roundResult.winTeam === 1 ? C.accent.red : '#333'
                  }}>
                    +{roundResult.points}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Marcador actual */}
          <div className="flex items-center justify-center gap-3 mb-3 p-2 rounded-xl" style={{ background: C.bg.card }}>
            <div className="text-center flex-1">
              <p className="text-xs" style={{ color: C.accent.blue }}>🔵 Tú</p>
              <p className="text-2xl font-black font-mono" style={{ color: '#fff' }}>{scores[0]}</p>
            </div>
            <span style={{ color: C.accent.slate }}>vs</span>
            <div className="text-center flex-1">
              <p className="text-xs" style={{ color: C.accent.red }}>Rival 🔴</p>
              <p className="text-2xl font-black font-mono" style={{ color: '#fff' }}>{scores[1]}</p>
            </div>
          </div>
          
          {/* Botón continuar */}
          <button onClick={() => { setRoundResult(null); startGame(); }}
            className="w-full py-3 rounded-xl font-black text-base transition-all active:scale-95"
            style={{ background: `linear-gradient(135deg, ${C.gold.main}, ${C.gold.dark})`, color: C.bg.deep }}>
            ▶️ SIGUIENTE RONDA
          </button>
        </div>
      </div>
    );
  };

  // ============================================================================
  // COMPONENTE PAUSE MENU (durante partida)
  // ============================================================================
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  
  const PauseMenu = () => {
    if (!showPauseMenu) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.9)' }}>
        <div className="w-full max-w-sm rounded-3xl p-6 animate-pop-in" style={{ background: C.bg.surface }}>
          <h2 className="text-2xl font-black text-center mb-6" style={{ color: '#fff' }}>⏸️ PAUSA</h2>
          
          <div className="space-y-3">
            <button onClick={() => setShowPauseMenu(false)}
              className="w-full py-4 rounded-xl font-bold transition-all hover:scale-105"
              style={{ background: `linear-gradient(135deg, ${C.gold.main}, ${C.gold.dark})`, color: C.bg.deep }}>
              ▶ CONTINUAR
            </button>
            
            <button onClick={() => setShowSettings(true)}
              className="w-full py-4 rounded-xl font-medium transition-all hover:scale-105"
              style={{ background: C.bg.card, color: '#fff', border: `1px solid ${C.bg.border}` }}>
              ⚙️ Ajustes
            </button>
            
            <button onClick={() => { setShowPauseMenu(false); reset(); }}
              className="w-full py-4 rounded-xl font-medium transition-all hover:scale-105"
              style={{ background: 'transparent', color: C.accent.red, border: `1px solid ${C.accent.red}` }}>
              🚪 Abandonar partida
            </button>
          </div>
          
          <p className="text-xs text-center mt-4" style={{ color: C.accent.slate }}>
            ⚠️ Abandonar restará ELO
          </p>
        </div>
      </div>
    );
  };

  // ============================================================================
  // MODAL DE CONFIGURACIÓN
  // ============================================================================
  const SettingsModal = () => {
    const closeModal = () => setShowSettings(false);
    const [activeTab, setActiveTab] = useState('audio');
    
    const tabs = [
      { id: 'audio', icon: '🔊', label: 'Audio' },
      { id: 'skins', icon: '🎨', label: 'Skins' },
      { id: 'game', icon: '🎮', label: 'Juego' },
      { id: 'display', icon: '🖥️', label: 'Visual' },
      { id: 'social', icon: '👥', label: 'Social' },
      { id: 'other', icon: '⚙️', label: 'Otros' }
    ];
    
    const SettingRow = ({ icon, label, description, children }) => (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 0',
        borderBottom: `1px solid ${C.bg.border}`,
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: C.text.primary, fontSize: 14, fontWeight: 500 }}>{label}</div>
            {description && <div style={{ color: C.text.secondary, fontSize: 11, marginTop: 2 }}>{description}</div>}
          </div>
        </div>
        <div style={{ flexShrink: 0 }}>{children}</div>
      </div>
    );
    
    const MiniToggle = ({ value, onChange }) => (
      <button onClick={() => onChange(!value)} style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        background: value ? C.accent.green : C.bg.card,
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.2s'
      }}>
        <div style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: '#fff',
          position: 'absolute',
          top: 3,
          left: value ? 23 : 3,
          transition: 'left 0.2s',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
        }} />
      </button>
    );
    
    const MiniSelect = ({ value, onChange, options }) => (
      <select 
        value={value} 
        onChange={e => onChange(e.target.value)}
        style={{
          background: C.bg.card,
          color: C.text.primary,
          border: `1px solid ${C.bg.border}`,
          borderRadius: 6,
          padding: '6px 8px',
          fontSize: 12,
          cursor: 'pointer',
          minWidth: 90
        }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    );
    
    return (
      <div 
        onClick={closeModal}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 12
        }}
      >
        <div 
          onClick={e => e.stopPropagation()}
          style={{
            background: C.bg.surface,
            borderRadius: 16,
            width: '100%',
            maxWidth: 400,
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: `1px solid ${C.bg.border}`
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: `1px solid ${C.bg.border}`,
            flexShrink: 0
          }}>
            <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 800, margin: 0 }}>⚙️ Configuración</h2>
            <button 
              onClick={closeModal}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: C.bg.card,
                border: 'none',
                color: '#fff',
                fontSize: 16,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >✕</button>
          </div>
          
          {/* Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: `1px solid ${C.bg.border}`,
            overflowX: 'auto',
            flexShrink: 0
          }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  minWidth: 60,
                  padding: '10px 8px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? `2px solid ${C.accent.gold}` : '2px solid transparent',
                  color: activeTab === tab.id ? C.accent.gold : C.text.secondary,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  fontSize: 10,
                  fontWeight: 600
                }}
              >
                <span style={{ fontSize: 16 }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* Content */}
          <div style={{ flex: 1, overflow: 'auto', padding: '8px 16px' }}>
            
            {/* AUDIO TAB */}
            {activeTab === 'audio' && (
              <>
                <SettingRow icon="🔊" label="Sonidos" description="Efectos de sonido del juego">
                  <MiniToggle 
                    value={Audio.getAudioSettings().soundEnabled} 
                    onChange={v => {
                      Audio.setSoundEnabled(v);
                      setSettings({...settings, sfxVolume: v ? 100 : 0});
                      if (v) Audio.playButtonClick();
                    }} 
                  />
                </SettingRow>
                <SettingRow icon="🎵" label="Volumen" description="Volumen general de audio">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={Math.round(Audio.getAudioSettings().masterVolume * 100)}
                      onChange={e => {
                        const vol = parseInt(e.target.value) / 100;
                        Audio.setMasterVolume(vol);
                        setSettings({...settings, sfxVolume: parseInt(e.target.value)});
                      }}
                      style={{ width: 80 }}
                    />
                    <span style={{ color: C.text.secondary, fontSize: 11, width: 28 }}>
                      {Math.round(Audio.getAudioSettings().masterVolume * 100)}%
                    </span>
                  </div>
                </SettingRow>
                <SettingRow icon="📳" label="Vibración" description="Feedback háptico al jugar">
                  <MiniToggle 
                    value={Audio.getAudioSettings().vibrationEnabled} 
                    onChange={v => {
                      Audio.setVibrationEnabled(v);
                      setSettings({...settings, vibration: v});
                      if (v) Audio.vibrateMedium();
                    }} 
                  />
                </SettingRow>
                <SettingRow icon="🔔" label="Notificaciones sonoras" description="Alertas de turno y eventos">
                  <MiniToggle value={settings.soundNotifications ?? true} onChange={v => setSettings({...settings, soundNotifications: v})} />
                </SettingRow>
                
                {/* Botón de prueba */}
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <button
                    onClick={() => {
                      Audio.unlockAudio();
                      Audio.playDomino();
                    }}
                    style={{
                      background: C.accent.green,
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      padding: '10px 20px',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    🔊 Probar Sonido
                  </button>
                </div>
              </>
            )}
            
            {/* SKINS TAB */}
            {activeTab === 'skins' && (
              <>
                {/* Skin de Fichas */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ 
                    color: C.text.secondary, 
                    fontSize: 11, 
                    fontWeight: 600, 
                    marginBottom: 8,
                    textTransform: 'uppercase',
                    letterSpacing: 1
                  }}>
                    🎲 Diseño de Fichas
                  </div>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(4, 1fr)', 
                    gap: 8 
                  }}>
                    {Object.entries(TILE_SKINS).filter(([id]) => playerInventory.has(id)).map(([id, skin]) => {
                      const isEquipped = equippedCosmetics.tile === id;
                      return (
                        <button
                          key={id}
                          onClick={() => equipCosmetic('tile', id)}
                          className="touch-feedback"
                          style={{
                            padding: 8,
                            borderRadius: 8,
                            background: isEquipped ? `${C.accent.green}30` : C.bg.card,
                            border: `2px solid ${isEquipped ? C.accent.green : C.bg.border}`,
                            cursor: 'pointer',
                            textAlign: 'center'
                          }}
                        >
                          <div style={{
                            width: 24,
                            height: 48,
                            margin: '0 auto 4px',
                            borderRadius: 4,
                            background: skin.isGradient ? skin.base : `linear-gradient(180deg, ${skin.highlight}, ${skin.base}, ${skin.shadow})`,
                            border: `1px solid ${skin.border}`,
                            boxShadow: skin.effect?.includes('glow') ? `0 0 6px ${skin.border}` : 'none'
                          }} />
                          <div style={{ fontSize: 9, color: C.text.primary, fontWeight: 500 }}>
                            {skin.name.split(' ')[0]}
                          </div>
                          {isEquipped && (
                            <div style={{ fontSize: 8, color: C.accent.green, fontWeight: 600 }}>✓ Equipado</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Skin de Tablero */}
                <div>
                  <div style={{ 
                    color: C.text.secondary, 
                    fontSize: 11, 
                    fontWeight: 600, 
                    marginBottom: 8,
                    textTransform: 'uppercase',
                    letterSpacing: 1
                  }}>
                    🎯 Diseño de Tablero
                  </div>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: 8 
                  }}>
                    {Object.entries(BOARD_SKINS).filter(([id]) => playerInventory.has(id)).map(([id, skin]) => {
                      const isEquipped = equippedCosmetics.board === id;
                      return (
                        <button
                          key={id}
                          onClick={() => equipCosmetic('board', id)}
                          className="touch-feedback"
                          style={{
                            padding: 8,
                            borderRadius: 8,
                            background: isEquipped ? `${C.accent.green}30` : C.bg.card,
                            border: `2px solid ${isEquipped ? C.accent.green : C.bg.border}`,
                            cursor: 'pointer',
                            textAlign: 'center'
                          }}
                        >
                          <div style={{
                            width: '100%',
                            height: 32,
                            marginBottom: 4,
                            borderRadius: 4,
                            background: skin.isGradient ? skin.background : `linear-gradient(145deg, ${skin.background}, ${skin.accent})`,
                            border: `2px solid ${skin.accent}`
                          }} />
                          <div style={{ fontSize: 10, color: C.text.primary, fontWeight: 500 }}>
                            {skin.name}
                          </div>
                          {isEquipped && (
                            <div style={{ fontSize: 8, color: C.accent.green, fontWeight: 600 }}>✓ Equipado</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Botón para ir a la tienda */}
                <button
                  onClick={() => { setShowSettings(false); setShowShop(true); }}
                  className="touch-feedback"
                  style={{
                    width: '100%',
                    marginTop: 16,
                    padding: '12px 16px',
                    background: `linear-gradient(135deg, ${C.gold.main}, ${C.gold.dark})`,
                    border: 'none',
                    borderRadius: 8,
                    color: '#000',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                  }}
                >
                  🛒 Comprar más skins en la tienda
                </button>
              </>
            )}
            
            {/* GAME TAB */}
            {activeTab === 'game' && (
              <>
                <SettingRow icon="✅" label="Confirmar jugada" description="Pedir confirmación antes de jugar">
                  <MiniToggle value={settings.confirmPlay} onChange={v => setSettings({...settings, confirmPlay: v})} />
                </SettingRow>
                <SettingRow icon="🎯" label="Selección rápida" description="Un toque para seleccionar y jugar">
                  <MiniToggle value={settings.quickSelect ?? false} onChange={v => setSettings({...settings, quickSelect: v})} />
                </SettingRow>
                <SettingRow icon="🤖" label="Dificultad IA" description="Nivel de oponentes CPU">
                  <MiniSelect 
                    value={settings.aiDifficulty ?? 'hard'} 
                    onChange={v => setSettings({...settings, aiDifficulty: v})}
                    options={[
                      {value: 'easy', label: 'Fácil'},
                      {value: 'medium', label: 'Normal'},
                      {value: 'hard', label: 'Difícil'},
                      {value: 'expert', label: 'Experto'}
                    ]}
                  />
                </SettingRow>
              </>
            )}
            
            {/* DISPLAY TAB */}
            {activeTab === 'display' && (
              <>
                <SettingRow icon="⚡" label="Velocidad animaciones" description="Rapidez de efectos visuales">
                  <MiniSelect 
                    value={settings.animationSpeed} 
                    onChange={v => setSettings({...settings, animationSpeed: v})}
                    options={[
                      {value: 'slow', label: 'Lenta'},
                      {value: 'normal', label: 'Normal'},
                      {value: 'fast', label: 'Rápida'}
                    ]}
                  />
                </SettingRow>
                <SettingRow icon="🔤" label="Tamaño de texto" description="Legibilidad del texto">
                  <MiniSelect 
                    value={settings.textSize} 
                    onChange={v => setSettings({...settings, textSize: v})}
                    options={[
                      {value: 'small', label: 'Pequeño'},
                      {value: 'normal', label: 'Normal'},
                      {value: 'large', label: 'Grande'}
                    ]}
                  />
                </SettingRow>
                <SettingRow icon="🎨" label="Tema de fichas" description="Estilo visual de las fichas">
                  <MiniSelect 
                    value={settings.tileTheme ?? 'classic'} 
                    onChange={v => setSettings({...settings, tileTheme: v})}
                    options={[
                      {value: 'classic', label: 'Clásico'},
                      {value: 'modern', label: 'Moderno'},
                      {value: 'neon', label: 'Neón'},
                      {value: 'wood', label: 'Madera'}
                    ]}
                  />
                </SettingRow>
                <SettingRow icon="🃏" label="Tema del tablero" description="Color del tapete">
                  <MiniSelect 
                    value={settings.boardTheme ?? 'green'} 
                    onChange={v => setSettings({...settings, boardTheme: v})}
                    options={[
                      {value: 'green', label: 'Verde'},
                      {value: 'blue', label: 'Azul'},
                      {value: 'red', label: 'Rojo'},
                      {value: 'purple', label: 'Morado'}
                    ]}
                  />
                </SettingRow>
                <SettingRow icon="🌈" label="Modo daltonismo" description="Colores accesibles">
                  <MiniSelect 
                    value={settings.colorblindMode} 
                    onChange={v => setSettings({...settings, colorblindMode: v})}
                    options={[
                      {value: 'none', label: 'Normal'},
                      {value: 'protanopia', label: 'Protanopia'},
                      {value: 'deuteranopia', label: 'Deuteranopia'},
                      {value: 'tritanopia', label: 'Tritanopia'}
                    ]}
                  />
                </SettingRow>
                <SettingRow icon="✨" label="Efectos partículas" description="Confeti y animaciones">
                  <MiniToggle value={settings.particles ?? true} onChange={v => setSettings({...settings, particles: v})} />
                </SettingRow>
                <SettingRow icon="🌙" label="Modo oscuro" description="Tema de interfaz">
                  <MiniToggle value={settings.darkMode ?? true} onChange={v => setSettings({...settings, darkMode: v})} />
                </SettingRow>
              </>
            )}
            
            {/* SOCIAL TAB */}
            {activeTab === 'social' && (
              <>
                <SettingRow icon="💬" label="Chat en partida" description="Ver mensajes de otros jugadores">
                  <MiniToggle value={settings.showChat ?? true} onChange={v => setSettings({...settings, showChat: v})} />
                </SettingRow>
                <SettingRow icon="😀" label="Emotes" description="Permitir emotes y reacciones">
                  <MiniToggle value={settings.allowEmotes ?? true} onChange={v => setSettings({...settings, allowEmotes: v})} />
                </SettingRow>
                <SettingRow icon="👁️" label="Estado online" description="Mostrar cuando estás conectado">
                  <MiniToggle value={settings.showOnlineStatus ?? true} onChange={v => setSettings({...settings, showOnlineStatus: v})} />
                </SettingRow>
                <SettingRow icon="📊" label="Mostrar ELO" description="Visible para otros jugadores">
                  <MiniToggle value={settings.showElo ?? true} onChange={v => setSettings({...settings, showElo: v})} />
                </SettingRow>
                <SettingRow icon="🎮" label="Invitaciones de juego" description="Recibir invitaciones de amigos">
                  <MiniSelect 
                    value={settings.gameInvites ?? 'friends'} 
                    onChange={v => setSettings({...settings, gameInvites: v})}
                    options={[
                      {value: 'all', label: 'Todos'},
                      {value: 'friends', label: 'Amigos'},
                      {value: 'none', label: 'Nadie'}
                    ]}
                  />
                </SettingRow>
                <SettingRow icon="🚫" label="Solicitudes de amistad" description="Quién puede agregarte">
                  <MiniSelect 
                    value={settings.friendRequests ?? 'all'} 
                    onChange={v => setSettings({...settings, friendRequests: v})}
                    options={[
                      {value: 'all', label: 'Todos'},
                      {value: 'friends_of_friends', label: 'Amigos de amigos'},
                      {value: 'none', label: 'Nadie'}
                    ]}
                  />
                </SettingRow>
              </>
            )}
            
            {/* OTHER TAB */}
            {activeTab === 'other' && (
              <>
                <SettingRow icon="🌐" label={t('settings.language')} description="">
                  <div style={{ display: 'flex', gap: 6 }}>
                    {Object.entries(LANGUAGES).map(([code, lang]) => (
                      <button
                        key={code}
                        onClick={() => setSettings({...settings, language: code})}
                        style={{
                          padding: '6px 10px',
                          borderRadius: 8,
                          border: settings.language === code ? `2px solid ${C.gold.main}` : `1px solid ${C.bg.border}`,
                          background: settings.language === code ? `${C.gold.main}20` : C.bg.card,
                          color: settings.language === code ? C.gold.main : C.text.secondary,
                          fontSize: 14,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <span>{lang.flag}</span>
                      </button>
                    ))}
                  </div>
                </SettingRow>
                <SettingRow icon="📍" label="Región preferida" description="Servidor de matchmaking">
                  <MiniSelect 
                    value={settings.region ?? 'auto'} 
                    onChange={v => setSettings({...settings, region: v})}
                    options={[
                      {value: 'auto', label: 'Auto'},
                      {value: 'na', label: 'NA'},
                      {value: 'eu', label: 'EU'},
                      {value: 'latam', label: 'LATAM'},
                      {value: 'asia', label: 'Asia'}
                    ]}
                  />
                </SettingRow>
                <SettingRow icon="📱" label="Mantener pantalla activa" description="Evitar que se apague durante partida">
                  <MiniToggle value={settings.keepAwake ?? true} onChange={v => setSettings({...settings, keepAwake: v})} />
                </SettingRow>
                <SettingRow icon="💾" label="Guardar partidas" description="Historial de partidas localmente">
                  <MiniToggle value={settings.saveHistory ?? true} onChange={v => setSettings({...settings, saveHistory: v})} />
                </SettingRow>
                
                {/* Idioma actual info */}
                <div style={{
                  marginTop: 8,
                  padding: 12,
                  borderRadius: 12,
                  background: C.bg.card,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10
                }}>
                  <span style={{ fontSize: 24 }}>{LANGUAGES[settings.language]?.flag || '🌐'}</span>
                  <div>
                    <div style={{ color: C.text.primary, fontWeight: 600 }}>
                      {LANGUAGES[settings.language]?.name || 'Español'}
                    </div>
                    <div style={{ color: C.text.muted, fontSize: 11 }}>
                      {settings.language === 'es' ? 'Idioma actual' : 
                       settings.language === 'en' ? 'Current language' :
                       settings.language === 'pt' ? 'Idioma atual' : 'Langue actuelle'}
                    </div>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button 
                    onClick={() => setSettings(getDefaultSettings())}
                    style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: C.bg.card,
                    border: `1px solid ${C.bg.border}`,
                    borderRadius: 8,
                    color: C.text.primary,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                  }}>
                    <span>🔄</span> Restablecer configuración
                  </button>
                  <button style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: C.bg.card,
                    border: `1px solid ${C.bg.border}`,
                    borderRadius: 8,
                    color: C.text.primary,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                  }}>
                    <span>📜</span> Ver tutorial
                  </button>
                  <button style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: C.bg.card,
                    border: `1px solid ${C.bg.border}`,
                    borderRadius: 8,
                    color: C.text.primary,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                  }}>
                    <span>📋</span> Reglas oficiales
                  </button>
                  <button style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: C.bg.card,
                    border: `1px solid ${C.bg.border}`,
                    borderRadius: 8,
                    color: C.text.primary,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                  }}>
                    <span>🔒</span> Privacidad
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm('¿Borrar todos los datos locales? Esta acción no se puede deshacer.')) {
                        localStorage.removeItem('dominoSettings');
                        localStorage.removeItem('dominoPlayerProfile');
                        localStorage.removeItem('dominoMatchHistory');
                        setSettings(getDefaultSettings());
                        alert('Datos borrados. Recarga la página para ver los cambios.');
                      }
                    }}
                    style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(248,81,73,0.1)',
                    border: `1px solid ${C.accent.red}`,
                    borderRadius: 8,
                    color: C.accent.red,
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                  }}>
                    <span>🗑️</span> Borrar datos locales
                  </button>
                </div>
                
                {/* Version */}
                <div style={{ textAlign: 'center', marginTop: 16, paddingTop: 12, borderTop: `1px solid ${C.bg.border}` }}>
                  <span style={{ color: C.text.muted, fontSize: 11 }}>Dominó Ranked v2.1.0</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // MODAL DE PERFIL
  // ============================================================================
  const ProfileModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
      <div className="w-full max-w-md max-h-[90vh] overflow-auto rounded-3xl animate-pop-in"
        style={{ background: C.bg.surface, border: `1px solid ${C.bg.border}` }}>
        
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-4 border-b" style={{ background: C.bg.surface, borderColor: C.bg.border }}>
          <h2 className="text-xl font-black" style={{ color: '#fff' }}>👤 Perfil</h2>
          <button onClick={() => setShowProfile(false)} className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: C.bg.card }}><span style={{ color: C.accent.slate }}>✕</span></button>
        </div>
        
        <div className="p-4">
          {/* Avatar y nombre */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
              style={{ background: `linear-gradient(135deg, ${C.gold.dark}, ${C.gold.main})`, border: `3px solid ${C.gold.light}` }}>
              {profile.avatar}
            </div>
            <div>
              <h3 className="text-xl font-bold" style={{ color: '#fff' }}>{profile.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                {profile.isInPlacement ? (
                  <span className="px-2 py-1 rounded-lg text-xs font-bold" 
                    style={{ background: '#9333ea30', color: '#a855f7' }}>
                    🎯 Placement {profile.placementGames}/10
                  </span>
                ) : (
                  <span className="px-2 py-1 rounded-lg text-xs font-bold" 
                    style={{ 
                      background: RankSystem.TIER_COLORS[profile.rankTier]?.bg || C.gold.main,
                      color: '#fff',
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                    }}>
                    {profile.rankIcon} {profile.rank}
                  </span>
                )}
              </div>
              <p className="text-2xl font-mono font-black mt-2" style={{ color: '#fff' }}>
                {profile.elo.toLocaleString()} 
                <span className="text-xs font-normal" style={{ color: C.accent.slate }}> MMR</span>
                {profile.rd > 100 && <span className="text-xs ml-1" style={{ color: '#F97316' }}>±{Math.round(profile.rd)}</span>}
              </p>
              
              {/* Barra de progreso del rango */}
              {!profile.isInPlacement && (
                <div className="mt-2">
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: C.bg.card }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{
                      width: `${profile.rankProgress}%`,
                      background: RankSystem.TIER_COLORS[profile.rankTier]?.primary || C.gold.main
                    }}/>
                  </div>
                  <p className="text-xs mt-1" style={{ color: C.accent.slate }}>
                    {profile.rankProgress}% al siguiente rango
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Placement Progress */}
          {profile.isInPlacement && (
            <div className="rounded-xl p-4 mb-4" style={{ background: '#9333ea15', border: '1px solid #9333ea40' }}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold" style={{ color: '#a855f7' }}>🎯 Partidas de Clasificación</span>
                <span className="font-mono font-bold" style={{ color: '#fff' }}>{profile.placementWins}W - {profile.placementGames - profile.placementWins}L</span>
              </div>
              <div className="flex gap-1">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex-1 h-2 rounded-full" style={{
                    background: i < profile.placementGames 
                      ? (i < profile.placementWins ? C.accent.green : C.accent.red)
                      : C.bg.card
                  }}/>
                ))}
              </div>
              <p className="text-xs mt-2 text-center" style={{ color: C.accent.slate }}>
                {10 - profile.placementGames} partidas restantes para obtener tu rango
              </p>
            </div>
          )}
          
          {/* Estadísticas principales */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="rounded-xl p-3 text-center" style={{ background: C.bg.card }}>
              <p className="text-2xl font-bold" style={{ color: C.accent.blue }}>{profile.gamesPlayed}</p>
              <p className="text-xs" style={{ color: C.accent.slate }}>Partidas</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: C.bg.card }}>
              <p className="text-2xl font-bold" style={{ color: C.accent.green }}>{profile.winRate}%</p>
              <p className="text-xs" style={{ color: C.accent.slate }}>Victorias</p>
            </div>
            <div className="rounded-xl p-3 text-center" style={{ background: C.bg.card }}>
              <p className="text-2xl font-bold" style={{ color: '#F97316' }}>{profile.peakRating}</p>
              <p className="text-xs" style={{ color: C.accent.slate }}>Peak MMR</p>
            </div>
          </div>
          
          {/* Estadísticas detalladas */}
          <div className="rounded-xl p-4 mb-6" style={{ background: C.bg.card }}>
            <h4 className="text-sm font-bold mb-3" style={{ color: C.gold.main }}>📊 Estadísticas</h4>
            <div className="space-y-2">
              <div className="flex justify-between"><span className="text-sm" style={{ color: C.accent.slate }}>Victorias</span><span className="font-mono" style={{ color: C.accent.green }}>{profile.wins}</span></div>
              <div className="flex justify-between"><span className="text-sm" style={{ color: C.accent.slate }}>Derrotas</span><span className="font-mono" style={{ color: C.accent.red }}>{profile.losses}</span></div>
              <div className="flex justify-between"><span className="text-sm" style={{ color: C.accent.slate }}>Temporada - Victorias</span><span className="font-mono" style={{ color: C.accent.green }}>{profile.seasonWins}</span></div>
              <div className="flex justify-between"><span className="text-sm" style={{ color: C.accent.slate }}>Temporada - Derrotas</span><span className="font-mono" style={{ color: C.accent.red }}>{profile.seasonLosses}</span></div>
            </div>
          </div>
          
          {/* Temporada */}
          <div className="rounded-xl p-4" style={{ background: C.bg.card }}>
            <h4 className="text-sm font-bold mb-3" style={{ color: C.gold.main }}>🏆 Temporada {playerProfile.seasonId}</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: C.accent.slate }}>Rating Inicial</span>
                <span className="font-mono" style={{ color: '#fff' }}>1500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: C.accent.slate }}>Rating Actual</span>
                <span className="font-mono" style={{ color: profile.elo > 1500 ? C.accent.green : C.accent.red }}>{profile.elo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: C.accent.slate }}>Mejor Rating</span>
                <span className="font-mono" style={{ color: C.gold.main }}>{profile.peakRating}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ============================================================================
  // PANTALLA DE ESTADÍSTICAS
  // ============================================================================
  const StatsScreen = () => {
    // Formatear fecha relativa
    const formatDate = (timestamp) => {
      const now = Date.now();
      const diff = now - timestamp;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      
      if (hours < 1) return 'Hace un momento';
      if (hours < 24) return `Hace ${hours}h`;
      if (days === 1) return 'Ayer';
      if (days < 7) return `Hace ${days} días`;
      return new Date(timestamp).toLocaleDateString();
    };
    
    return (
      <div className="flex-1 p-4 overflow-auto">
        <h2 className="text-xl font-black mb-4" style={{ color: '#fff' }}>📊 Estadísticas</h2>
        
        {/* Resumen */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-xl p-4" style={{ background: C.bg.card }}>
            <p className="text-3xl font-black" style={{ color: '#fff' }}>{profile.gamesPlayed}</p>
            <p className="text-sm" style={{ color: C.accent.slate }}>Partidas jugadas</p>
          </div>
          <div className="rounded-xl p-4" style={{ background: C.bg.card }}>
            <p className="text-3xl font-black" style={{ color: C.accent.green }}>{profile.winRate}%</p>
            <p className="text-sm" style={{ color: C.accent.slate }}>Winrate</p>
          </div>
        </div>
        
        {/* Historial */}
        <h3 className="text-sm font-bold mb-3" style={{ color: C.gold.main }}>📜 Historial reciente</h3>
        {matchHistory.length === 0 ? (
          <div className="rounded-xl p-6 text-center" style={{ background: C.bg.card }}>
            <span className="text-3xl mb-2">🎮</span>
            <p style={{ color: C.accent.slate }}>Aún no has jugado partidas ranked</p>
          </div>
        ) : (
          <div className="space-y-2">
            {matchHistory.slice(-10).reverse().map(match => (
              <div key={match.id} className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: C.bg.card, borderLeft: `3px solid ${match.won ? C.accent.green : C.accent.red}` }}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{match.won ? '🏆' : '😤'}</span>
                  <div>
                    <p className="font-bold" style={{ color: '#fff' }}>
                      {match.score?.[0] || 0} - {match.score?.[1] || 0}
                      {match.isPlacement && <span className="ml-2 text-xs px-1.5 py-0.5 rounded" style={{ background: '#9333ea30', color: '#a855f7' }}>P</span>}
                    </p>
                    <p className="text-xs" style={{ color: C.accent.slate }}>
                      vs {match.opponents?.join(' & ') || 'Oponentes'} • {formatDate(match.timestamp)}
                    </p>
                    <p className="text-xs" style={{ color: C.accent.slate }}>
                      {match.endReason === 'domino' ? '🎯 Dominó' : match.endReason === 'tranca' ? '🔒 Tranca' : match.endReason}
                      {match.rounds && ` • ${match.rounds} rondas`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold" style={{ color: match.mmrChange > 0 ? C.accent.green : C.accent.red }}>
                    {match.mmrChange > 0 ? '+' : ''}{match.mmrChange || 0}
                  </span>
                  <p className="text-xs" style={{ color: C.accent.slate }}>{match.mmrAfter || '-'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // PANTALLA DE RANKING
  // ============================================================================
  const RankingScreen = () => {
    // Encontrar posición del jugador en el leaderboard
    const playerPosition = leaderboard.findIndex(p => p.isPlayer);
    const playerRankNumber = playerPosition >= 0 ? playerPosition + 1 : '>100';
    
    return (
      <div className="flex-1 p-4 overflow-auto">
        <h2 className="text-xl font-black mb-4" style={{ color: '#fff' }}>🏆 Ranking Global</h2>
        
        {/* Tu posición */}
        <div className="rounded-xl p-4 mb-6" style={{ 
          background: RankSystem.TIER_COLORS[profile.rankTier]?.bg || `linear-gradient(135deg, ${C.gold.main}20, ${C.gold.dark}10)`,
          border: `1px solid ${RankSystem.TIER_COLORS[profile.rankTier]?.primary || C.gold.main}50`
        }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-black" style={{ color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                #{playerRankNumber}
              </span>
              <div>
                <p className="font-bold" style={{ color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>{profile.name}</p>
                <p className="text-sm font-bold" style={{ color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                  {profile.rankIcon} {profile.rank}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono font-bold text-xl" style={{ color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>{profile.elo}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>MMR</p>
            </div>
          </div>
          
          {/* Barra de progreso */}
          {!profile.isInPlacement && (
            <div className="mt-3">
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.3)' }}>
                <div className="h-full rounded-full" style={{
                  width: `${profile.rankProgress}%`,
                  background: 'rgba(255,255,255,0.8)'
                }}/>
              </div>
              <p className="text-xs mt-1 text-center" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {profile.rankProgress}% al siguiente rango
              </p>
            </div>
          )}
        </div>
        
        {/* Top jugadores */}
        <h3 className="text-sm font-bold mb-3" style={{ color: C.gold.main }}>👑 Top Jugadores</h3>
      <div className="space-y-2">
        {leaderboard.map((player, idx) => (
          <div key={idx} className={`flex items-center justify-between p-3 rounded-xl ${player.isPlayer ? 'ring-2' : ''}`}
            style={{ background: player.isPlayer ? `${C.gold.main}15` : C.bg.card, ringColor: C.gold.main }}>
            <div className="flex items-center gap-3">
              <span className="w-8 text-center font-black" style={{ color: player.rank <= 3 ? C.gold.main : C.accent.slate }}>
                {player.rank <= 3 ? ['🥇','🥈','🥉'][player.rank-1] : `#${player.rank}`}
              </span>
              <div>
                <p className="font-bold" style={{ color: player.isPlayer ? C.gold.main : '#fff' }}>{player.name}</p>
                <div className="flex items-center gap-1">
                  <span className="text-xs" style={{ color: RankSystem.TIER_COLORS[player.rankInfo?.tier]?.primary || C.accent.slate }}>
                    {player.rankInfo?.icon} {player.rankInfo?.name}
                  </span>
                  <span className="text-xs" style={{ color: C.accent.slate }}>• {player.winrate}% WR</span>
                </div>
              </div>
            </div>
            <span className="font-mono font-bold" style={{ color: '#fff' }}>{player.rating.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
    );
  };

  // SCREENS
  if (searching) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: `linear-gradient(180deg, ${C.bg.deep} 0%, #0a1628 100%)` }}>
      
      {/* Indicador de modo */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ 
          background: conectado ? 'rgba(63, 185, 80, 0.15)' : 'rgba(248, 81, 73, 0.15)',
          border: `1px solid ${conectado ? 'rgba(63, 185, 80, 0.4)' : 'rgba(248, 81, 73, 0.4)'}`
        }}>
          <div style={{ 
            width: 8, 
            height: 8, 
            borderRadius: '50%', 
            background: conectado ? '#3FB950' : '#F85149',
            boxShadow: conectado ? '0 0 8px #3FB950' : '0 0 8px #F85149'
          }} />
          <span style={{ color: conectado ? '#3FB950' : '#F85149', fontSize: 12, fontWeight: 600 }}>
            {conectado ? 'ONLINE' : 'LOCAL (vs IA)'}
          </span>
        </div>
        {conectado && (
          <div className="px-3 py-1.5 rounded-full" style={{ background: 'rgba(88, 166, 255, 0.15)', border: '1px solid rgba(88, 166, 255, 0.4)' }}>
            <span style={{ color: '#58A6FF', fontSize: 12 }}>👥 {jugadoresOnline} online</span>
          </div>
        )}
      </div>
      
      {/* Animación - Ficha Doble 9 */}
      <div className="mb-8" style={{ animation: 'float-gpu 2s ease-in-out infinite' }}>
        <Doble9Icon size={50} />
      </div>
      
      <h2 className="text-2xl font-black mb-2" style={{ color: C.gold.main, textShadow: `0 0 20px ${C.gold.main}40` }}>
        {conectado ? 'BUSCANDO PARTIDA ONLINE' : 'INICIANDO PARTIDA'}
      </h2>
      <p className="mb-6 text-center" style={{ color: C.accent.slate }}>
        {conectado 
          ? 'Esperando a otros 3 jugadores...'
          : profile.isInPlacement 
            ? `Partida de clasificación ${profile.placementGames + 1}/10`
            : 'Buscando rivales de tu nivel...'}
      </p>
      
      {/* Info del jugador */}
      <div className="rounded-2xl p-4 mb-6 flex items-center gap-4" style={{ 
        background: `linear-gradient(135deg, ${RankSystem.TIER_COLORS[profile.rankTier]?.bg || C.bg.card}, ${C.bg.surface})`,
        border: `1px solid ${RankSystem.TIER_COLORS[profile.rankTier]?.primary || C.bg.border}40`,
        boxShadow: `0 4px 20px ${RankSystem.TIER_COLORS[profile.rankTier]?.primary || C.gold.main}20`
      }}>
        <span className="text-3xl">{profile.rankIcon}</span>
        <div>
          <p className="font-bold text-lg" style={{ color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
            {profile.isInPlacement ? 'En Clasificación' : profile.rank}
          </p>
          <p className="text-sm font-mono" style={{ color: 'rgba(255,255,255,0.7)' }}>{profile.elo} MMR</p>
        </div>
      </div>
      
      {/* Barra de progreso animada */}
      <div className="w-72 mb-8">
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: C.bg.card }}>
          <div className="h-full rounded-full" 
            style={{ 
              width: '100%', 
              background: `linear-gradient(90deg, ${C.gold.dark}, ${C.gold.main}, ${C.gold.dark})`,
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite linear'
            }} />
        </div>
      </div>
      
      {/* Botón cancelar */}
      <button onClick={() => conectado ? cancelSearchOnline() : setSearching(false)} 
        className="px-8 py-3 rounded-xl font-bold transition-all active:scale-95" 
        style={{ background: 'transparent', border: `2px solid ${C.accent.red}`, color: C.accent.red }}>
        ✕ Cancelar
      </button>
    </div>
  );


  if (phase === 'menu') {
    // ══════════════════════════════════════════════════════════════════════════
    // NUEVO DISEÑO MOBILE-FIRST - UI/UX PROFESIONAL PARA JUEGOS COMPETITIVOS
    // ══════════════════════════════════════════════════════════════════════════
    
    // Usar estados del nivel superior: menuTab, menuNotifications, battlePassLevel, battlePassProgress
    
    // ════════════════════════════════════════════════════════════════════════
    // COMPONENTE: TOP BAR / HUD MOBILE
    // Barra superior compacta con info del jugador y accesos rápidos
    // ════════════════════════════════════════════════════════════════════════
    const TopBar = () => (
      <div className="safe-top" style={{
        background: `linear-gradient(180deg, ${C.bg.surface} 0%, ${C.bg.deep} 100%)`,
        borderBottom: `1px solid ${C.bg.border}`,
        padding: '8px 12px 10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Avatar + Info del jugador */}
          <button 
            onClick={() => setShowProfile(true)}
            className="touch-feedback"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              flex: 1,
              minWidth: 0
            }}
          >
            {/* Avatar circular */}
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: RankSystem.TIER_COLORS[profile.rankTier]?.bg || `linear-gradient(135deg, ${C.gold.dark}, ${C.gold.main})`,
              border: `2px solid ${RankSystem.TIER_COLORS[profile.rankTier]?.primary || C.gold.main}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              flexShrink: 0,
              boxShadow: `0 2px 8px ${RankSystem.TIER_COLORS[profile.rankTier]?.primary || C.gold.main}40`
            }}>
              {profile.isInPlacement ? '🎯' : profile.rankIcon}
            </div>
            
            {/* Nombre y rango */}
            <div style={{ minWidth: 0, textAlign: 'left' }}>
              <div style={{ 
                color: '#fff', 
                fontWeight: 700, 
                fontSize: 14,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 120
              }}>
                {profile.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ 
                  fontSize: 11, 
                  color: RankSystem.TIER_COLORS[profile.rankTier]?.primary || C.gold.main,
                  fontWeight: 600
                }}>
                  {profile.isInPlacement ? `Placement ${profile.placementGames}/10` : profile.rank}
                </span>
                <span style={{ fontSize: 10, color: C.text.muted }}>•</span>
                <span style={{ fontSize: 11, color: C.text.secondary, fontFamily: 'monospace' }}>
                  {profile.elo}
                </span>
              </div>
            </div>
          </button>
          
          {/* Divisas */}
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '6px 10px',
              borderRadius: 20,
              background: 'rgba(168, 85, 247, 0.15)',
              border: '1px solid rgba(168, 85, 247, 0.3)'
            }}>
              <span style={{ fontSize: 14 }}>💎</span>
              <span style={{ color: '#a855f7', fontWeight: 700, fontSize: 13 }}>
                {playerCurrencies.coins >= 1000 ? `${(playerCurrencies.coins/1000).toFixed(1)}k` : playerCurrencies.coins}
              </span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '6px 10px',
              borderRadius: 20,
              background: `rgba(247, 179, 43, 0.15)`,
              border: `1px solid rgba(247, 179, 43, 0.3)`
            }}>
              <span style={{ fontSize: 14 }}>🪙</span>
              <span style={{ color: C.gold.main, fontWeight: 700, fontSize: 13 }}>
                {playerCurrencies.tokens >= 1000 ? `${(playerCurrencies.tokens/1000).toFixed(1)}k` : playerCurrencies.tokens}
              </span>
            </div>
          </div>
          
          {/* Iconos de acción */}
          <div style={{ display: 'flex', gap: 2 }}>
            {/* Notificaciones */}
            <button 
              className="touch-feedback"
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                cursor: 'pointer'
              }}
            >
              <span style={{ fontSize: 20 }}>🔔</span>
              {menuNotifications > 0 && (
                <div style={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: C.accent.red,
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {menuNotifications}
                </div>
              )}
            </button>
            
            {/* Ajustes */}
            <button 
              onClick={() => setShowSettings(true)}
              className="touch-feedback"
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <span style={{ fontSize: 20 }}>⚙️</span>
            </button>
          </div>
        </div>
        
        {/* Barra de progreso del Pase de Batalla */}
        <div 
          onClick={() => setMenuTab('pass')}
          style={{
            marginTop: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 10px',
            borderRadius: 8,
            background: 'rgba(247, 179, 43, 0.08)',
            cursor: 'pointer'
          }}
        >
          <span style={{ fontSize: 14 }}>🎟️</span>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
              <span style={{ fontSize: 11, color: C.text.secondary, fontWeight: 500 }}>Pase de Batalla</span>
              <span style={{ fontSize: 11, color: C.gold.main, fontWeight: 700 }}>Nivel {battlePassLevel}</span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: C.bg.card, overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', 
                width: `${battlePassProgress}%`, 
                background: `linear-gradient(90deg, ${C.gold.dark}, ${C.gold.main})`,
                borderRadius: 2
              }} />
            </div>
          </div>
          <span style={{ fontSize: 11, color: C.gold.main, fontWeight: 600 }}>{battlePassProgress}%</span>
        </div>
      </div>
    );
    
    // ════════════════════════════════════════════════════════════════════════
    // COMPONENTE: BOTTOM NAVIGATION BAR
    // Navegación inferior fija con 5 tabs
    // ════════════════════════════════════════════════════════════════════════
    const BottomNav = () => {
      const tabs = [
        { id: 'home', icon: '🏠', label: 'Inicio' },
        { id: 'rankings', icon: '🏆', label: 'Ranking' },
        { id: 'play', icon: '▶️', label: 'Jugar', isMain: true },
        { id: 'pass', icon: '🎟️', label: 'Pase' },
        { id: 'shop', icon: '🛒', label: 'Tienda' }
      ];
      
      return (
        <div className="safe-bottom" style={{
          background: C.bg.surface,
          borderTop: `1px solid ${C.bg.border}`,
          padding: '6px 8px 4px',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'flex-end'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => tab.id === 'play' ? startSearch() : (tab.id === 'shop' ? setShowShop(true) : (tab.id === 'rankings' ? setShowLeaderboard(true) : setMenuTab(tab.id)))}
              className="touch-feedback"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                padding: tab.isMain ? '0' : '8px 12px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                minWidth: 56,
                position: 'relative'
              }}
            >
              {tab.isMain ? (
                // Botón JUGAR especial
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${C.gold.main} 0%, ${C.gold.dark} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 20px ${C.gold.main}60`,
                  marginTop: -20,
                  border: `3px solid ${C.bg.surface}`
                }}>
                  <span style={{ fontSize: 24, marginLeft: 2 }}>▶️</span>
                </div>
              ) : (
                <>
                  <span style={{ 
                    fontSize: 22,
                    opacity: menuTab === tab.id ? 1 : 0.6,
                    transform: menuTab === tab.id ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.2s ease'
                  }}>
                    {tab.icon}
                  </span>
                  <span style={{ 
                    fontSize: 10, 
                    fontWeight: menuTab === tab.id ? 700 : 500,
                    color: menuTab === tab.id ? C.gold.main : C.text.muted,
                    transition: 'color 0.2s ease'
                  }}>
                    {tab.label}
                  </span>
                  {/* Indicador activo */}
                  {menuTab === tab.id && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      width: 20,
                      height: 3,
                      borderRadius: 2,
                      background: C.gold.main
                    }} />
                  )}
                </>
              )}
            </button>
          ))}
        </div>
      );
    };
    
    // ════════════════════════════════════════════════════════════════════════
    // CONTENIDO: TAB HOME (Inicio)
    // ════════════════════════════════════════════════════════════════════════
    const HomeContent = () => (
      <div className="mobile-scroll" style={{ flex: 1, padding: 16, paddingBottom: 80 }}>
        
        {/* Banner de usuario autenticado */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px',
          marginBottom: 12,
          borderRadius: 12,
          background: authUser?.isGuest 
            ? 'rgba(251, 191, 36, 0.1)' 
            : authUser 
              ? 'rgba(99, 102, 241, 0.1)' 
              : 'rgba(107, 114, 128, 0.1)',
          border: `1px solid ${authUser?.isGuest 
            ? 'rgba(251, 191, 36, 0.3)' 
            : authUser 
              ? 'rgba(99, 102, 241, 0.3)' 
              : 'rgba(107, 114, 128, 0.3)'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: authUser ? C.accent.green : C.bg.surface,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18
            }}>
              {authUser?.avatar ? (
                <img src={authUser.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
              ) : authUser?.isGuest ? '👤' : authUser ? '😎' : '🔒'}
            </div>
            <div>
              <div style={{ 
                color: C.text.primary, 
                fontSize: 14, 
                fontWeight: 600 
              }}>
                {authUser?.name || 'Sin sesión'}
              </div>
              <div style={{ color: C.text.secondary, fontSize: 11 }}>
                {authUser?.isGuest 
                  ? '⚠️ Invitado - progreso no guardado' 
                  : authUser 
                    ? `✅ ${authUser.provider === 'google.com' ? 'Google' : authUser.provider === 'apple.com' ? 'Apple' : 'Email'}` 
                    : 'Inicia sesión para guardar'}
              </div>
            </div>
          </div>
          {authUser?.isGuest ? (
            <button
              onClick={onRequestLogin}
              style={{
                background: C.accent.green,
                border: 'none',
                borderRadius: 8,
                padding: '8px 12px',
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Crear Cuenta
            </button>
          ) : authUser ? (
            <button
              onClick={onLogout}
              style={{
                background: 'transparent',
                border: `1px solid ${C.bg.border}`,
                borderRadius: 8,
                padding: '6px 10px',
                color: C.text.secondary,
                fontSize: 11,
                cursor: 'pointer'
              }}
            >
              Salir
            </button>
          ) : (
            <button
              onClick={onRequestLogin}
              style={{
                background: C.accent.green,
                border: 'none',
                borderRadius: 8,
                padding: '8px 12px',
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Iniciar Sesión
            </button>
          )}
        </div>
        
        {/* Banner de estado de conexión */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          marginBottom: 16,
          borderRadius: 12,
          background: conectado 
            ? 'rgba(63, 185, 80, 0.1)' 
            : 'rgba(248, 81, 73, 0.1)',
          border: `1px solid ${conectado ? 'rgba(63, 185, 80, 0.3)' : 'rgba(248, 81, 73, 0.3)'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: conectado ? '#3FB950' : '#F85149',
              boxShadow: conectado ? '0 0 10px #3FB950' : 'none',
              animation: conectado ? 'pulse 2s infinite' : 'none'
            }} />
            <span style={{ 
              color: conectado ? '#3FB950' : '#F85149', 
              fontSize: 13, 
              fontWeight: 600 
            }}>
              {conectado ? '🌐 Servidor Online' : '📴 Modo Offline'}
            </span>
          </div>
          {conectado ? (
            <span style={{ color: C.text.secondary, fontSize: 12 }}>
              👥 {jugadoresOnline} jugadores
            </span>
          ) : (
            <span style={{ color: '#F85149', fontSize: 11 }}>
              Jugarás vs IA
            </span>
          )}
        </div>
        
        {/* Error de conexión si hay */}
        {errorConexion && (
          <div style={{
            padding: '10px 14px',
            marginBottom: 16,
            borderRadius: 12,
            background: 'rgba(248, 81, 73, 0.1)',
            border: '1px solid rgba(248, 81, 73, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ color: '#F85149', fontSize: 12 }}>⚠️ {errorConexion}</span>
            <button 
              onClick={() => setErrorConexion(null)}
              style={{ background: 'none', border: 'none', color: '#F85149', cursor: 'pointer' }}
            >✕</button>
          </div>
        )}
        
        {/* Banner de Recompensas Diarias */}
        {!dailyRewards.todayClaimed && (
          <button
            onClick={() => setShowDailyRewards(true)}
            className="touch-feedback"
            style={{
              width: '100%',
              padding: 16,
              marginBottom: 16,
              borderRadius: 16,
              border: `2px solid ${C.gold.main}`,
              background: `linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(217, 119, 6, 0.2))`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              animation: 'pulse-scale 2s infinite'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 32 }}>🎁</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ color: C.gold.main, fontSize: 15, fontWeight: 800 }}>
                  ¡Recompensa Diaria!
                </div>
                <div style={{ color: C.text.secondary, fontSize: 12 }}>
                  Día {dailyRewards.currentStreak + 1} • Toca para reclamar
                </div>
              </div>
            </div>
            <div style={{
              background: C.gold.main,
              color: C.bg.deep,
              padding: '8px 14px',
              borderRadius: 10,
              fontWeight: 800,
              fontSize: 12
            }}>
              RECLAMAR
            </div>
          </button>
        )}
        
        {/* Misiones Diarias */}
        <DailyMissionsCard 
          dailyRewards={dailyRewards} 
          playerCurrencies={playerCurrencies}
        />
        
        {/* Hero Section - Botón JUGAR prominente */}
        <div style={{
          background: `linear-gradient(135deg, ${C.bg.surface} 0%, ${C.bg.card} 100%)`,
          borderRadius: 20,
          padding: 24,
          marginBottom: 16,
          border: `1px solid ${C.bg.border}`,
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: 16 }}>
            <Doble9Icon size={50} animate />
          </div>
          <h2 style={{ 
            color: C.gold.main, 
            fontSize: 28, 
            fontWeight: 900, 
            marginBottom: 4,
            textShadow: `0 0 20px ${C.gold.main}40`
          }}>
            DOMINÓ CUBANO
          </h2>
          <p style={{ color: C.text.secondary, fontSize: 13, marginBottom: 20 }}>
            {conectado ? 'Competitivo • Ranked • En línea' : 'Competitivo • Ranked • Offline'}
          </p>
          
          <button 
            onClick={startSearch}
            className="touch-feedback"
            style={{
              width: '100%',
              padding: '18px 24px',
              borderRadius: 16,
              background: `linear-gradient(135deg, ${C.gold.main} 0%, ${C.gold.dark} 100%)`,
              border: 'none',
              color: '#000',
              fontSize: 18,
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: `0 8px 30px ${C.gold.main}50`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10
            }}
          >
            <span style={{ fontSize: 20 }}>▶</span>
            {conectado ? 'JUGAR ONLINE' : 'JUGAR vs IA'}
          </button>
          
          {/* Botón para forzar modo local si está conectado */}
          {conectado && (
            <button 
              onClick={startSearchLocal}
              className="touch-feedback"
              style={{
                width: '100%',
                marginTop: 12,
                padding: '14px 24px',
                borderRadius: 12,
                background: C.bg.elevated,
                border: `1px solid ${C.bg.border}`,
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              🤖 Practicar vs IA
            </button>
          )}
          
          {!conectado && (
            <button 
              className="touch-feedback"
              style={{
                width: '100%',
                marginTop: 12,
                padding: '14px 24px',
                borderRadius: 12,
                background: C.bg.elevated,
                border: `1px solid ${C.bg.border}`,
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              🎮 Partida Casual
            </button>
          )}
        </div>
        
        {/* Stats rápidos */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
          marginBottom: 16
        }}>
          {[
            { label: 'Partidas', value: profile.gamesPlayed, icon: '🎮', color: '#fff' },
            { label: 'Win Rate', value: `${profile.winRate}%`, icon: '📊', color: C.accent.green },
            { label: 'Racha', value: profile.currentStreak, icon: '🔥', color: '#F97316' }
          ].map((stat, i) => (
            <div key={i} style={{
              background: C.bg.surface,
              borderRadius: 12,
              padding: '14px 10px',
              textAlign: 'center',
              border: `1px solid ${C.bg.border}`
            }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{stat.icon}</div>
              <div style={{ color: stat.color, fontSize: 18, fontWeight: 800 }}>{stat.value}</div>
              <div style={{ color: C.text.muted, fontSize: 10, fontWeight: 500 }}>{stat.label}</div>
            </div>
          ))}
        </div>
        
        {/* Accesos rápidos - Tarjetas grandes */}
        <h3 style={{ color: C.text.primary, fontSize: 14, fontWeight: 700, marginBottom: 10 }}>
          {t('menu.quickAccess')}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {[
            { icon: '🏆', label: t('menu.rankings'), desc: t('ranks.top100'), action: () => setShowLeaderboard(true), color: '#FFD700' },
            { icon: '👥', label: t('menu.friends'), desc: `${friendsList.filter(f => f.status === 'online').length} online`, action: () => setShowFriends(true), color: '#60A5FA', badge: friendRequests.length },
            { icon: '🎖️', label: t('menu.achievements'), desc: `${unlockedAchievements.size}/${Object.keys(ACHIEVEMENTS).length}`, action: () => setShowAchievements(true), color: '#10B981' },
            { icon: '🛒', label: t('menu.shop'), desc: t('shop.buy'), action: () => setShowShop(true), color: '#EC4899' },
            { icon: '🏅', label: t('menu.tournaments'), desc: `3 ${t('tournaments.active')}`, action: () => setShowTournaments(true), color: '#F59E0B' },
            { icon: '🎒', label: t('menu.inventory'), desc: t('shop.equip'), action: () => setShowInventory(true), color: '#A855F7' },
            { icon: '📊', label: t('menu.stats'), desc: t('achievements.progress'), action: () => setShowProfile(true), color: '#3FB950' },
            { icon: '⚙️', label: t('menu.settings'), desc: 'Config', action: () => setShowSettings(true), color: '#6B7280' }
          ].map((item, i) => (
            <button
              key={i}
              onClick={item.action}
              className="touch-feedback"
              style={{
                background: C.bg.surface,
                borderRadius: 12,
                padding: 10,
                border: `1px solid ${C.bg.border}`,
                textAlign: 'center',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                position: 'relative'
              }}
            >
              {item.badge > 0 && (
                <span style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  background: '#EF4444',
                  color: '#fff',
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  fontSize: 10,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {item.badge}
                </span>
              )}
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>{item.label}</span>
              <span style={{ color: C.text.muted, fontSize: 9 }}>{item.desc}</span>
            </button>
          ))}
        </div>
        
        {/* Banner de amigos online */}
        {friendsList.filter(f => f.status === 'online').length > 0 && (
          <button
            onClick={() => setShowFriends(true)}
            className="touch-feedback"
            style={{
              width: '100%',
              marginTop: 16,
              background: `linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 95, 70, 0.2))`,
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: 16,
              padding: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24
            }}>
              👥
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ color: '#10B981', fontWeight: 700, fontSize: 14 }}>
                {friendsList.filter(f => f.status === 'online').length} {t('friends.friendsOnline')}
              </div>
              <div style={{ color: 'rgba(16, 185, 129, 0.8)', fontSize: 12 }}>
                {friendsList.filter(f => f.status === 'online').slice(0, 3).map(f => f.name).join(', ')}
              </div>
            </div>
            <span style={{ color: '#10B981', fontSize: 14 }}>→</span>
          </button>
        )}
        
        {/* Banner evento */}
        <div style={{
          marginTop: friendsList.filter(f => f.status === 'online').length > 0 ? 12 : 16,
          background: `linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)`,
          borderRadius: 16,
          padding: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <span style={{ fontSize: 32 }}>🎉</span>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{t('menu.specialEvent')}</div>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>{t('menu.doubleXP')}</div>
          </div>
          <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>Ver →</span>
        </div>
      </div>
    );
    
    // ════════════════════════════════════════════════════════════════════════
    // CONTENIDO: TAB PASE DE BATALLA
    // ════════════════════════════════════════════════════════════════════════
    const BattlePassContent = () => {
      const rewards = [
        { level: 1, icon: '🪙', name: '100 Monedas', claimed: true },
        { level: 5, icon: '🎨', name: 'Skin Bronce', claimed: true },
        { level: 10, icon: '💎', name: '50 Gemas', claimed: true },
        { level: 15, icon: '🃏', name: 'Dorso Dorado', claimed: true },
        { level: 20, icon: '🪙', name: '200 Monedas', claimed: true },
        { level: 24, icon: '✨', name: 'Efecto Glow', claimed: false, current: true },
        { level: 25, icon: '🎨', name: 'Skin Plata', claimed: false, premium: true },
        { level: 30, icon: '💎', name: '100 Gemas', claimed: false },
        { level: 35, icon: '🏆', name: 'Marco Élite', claimed: false, premium: true },
        { level: 40, icon: '👑', name: 'Skin Legendaria', claimed: false, premium: true }
      ];
      
      return (
        <div className="mobile-scroll" style={{ flex: 1, paddingBottom: 80 }}>
          {/* Header del Pase */}
          <div style={{
            background: `linear-gradient(180deg, ${C.gold.dark}30 0%, transparent 100%)`,
            padding: '20px 16px',
            textAlign: 'center'
          }}>
            <h2 style={{ color: C.gold.main, fontSize: 24, fontWeight: 900, marginBottom: 4 }}>
              🎟️ PASE DE BATALLA
            </h2>
            <p style={{ color: C.text.secondary, fontSize: 13 }}>Temporada 1 • 23 días restantes</p>
            
            {/* Progreso grande */}
            <div style={{ marginTop: 16, padding: '0 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#fff', fontWeight: 700 }}>Nivel {battlePassLevel}</span>
                <span style={{ color: C.text.secondary }}>{battlePassProgress}%</span>
              </div>
              <div style={{ height: 8, borderRadius: 4, background: C.bg.card, overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  width: `${battlePassProgress}%`, 
                  background: `linear-gradient(90deg, ${C.gold.dark}, ${C.gold.main})`,
                  borderRadius: 4
                }} />
              </div>
            </div>
            
            {/* Botón Premium */}
            <button 
              className="touch-feedback"
              style={{
                marginTop: 16,
                padding: '12px 24px',
                borderRadius: 12,
                background: `linear-gradient(135deg, #9333EA 0%, #7C3AED 100%)`,
                border: 'none',
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(147, 51, 234, 0.4)'
              }}
            >
              ⭐ DESBLOQUEAR PREMIUM • 💎 500
            </button>
          </div>
          
          {/* Lista de recompensas */}
          <div style={{ padding: '16px' }}>
            <h3 style={{ color: C.text.primary, fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
              Recompensas
            </h3>
            
            {rewards.map((reward, i) => (
              <div 
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                  marginBottom: 8,
                  borderRadius: 12,
                  background: reward.current ? `${C.gold.main}15` : C.bg.surface,
                  border: reward.current ? `2px solid ${C.gold.main}` : `1px solid ${C.bg.border}`,
                  opacity: reward.claimed ? 0.6 : 1
                }}
              >
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: reward.premium ? 'linear-gradient(135deg, #9333EA, #7C3AED)' : C.bg.card,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20
                }}>
                  {reward.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>{reward.name}</div>
                  <div style={{ color: C.text.muted, fontSize: 11 }}>
                    Nivel {reward.level} {reward.premium && '• ⭐ Premium'}
                  </div>
                </div>
                {reward.claimed ? (
                  <span style={{ color: C.accent.green, fontSize: 18 }}>✓</span>
                ) : reward.current ? (
                  <button style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    background: C.gold.main,
                    border: 'none',
                    color: '#000',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}>
                    RECLAMAR
                  </button>
                ) : (
                  <span style={{ color: C.text.muted, fontSize: 20 }}>🔒</span>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    };
    
    // ════════════════════════════════════════════════════════════════════════
    // RENDER PRINCIPAL DEL MENÚ
    // ════════════════════════════════════════════════════════════════════════
    
    // Obtener fondo equipado
    const menuBg = getMenuBackground(equippedCosmetics.menuBackground);
    const menuBgImage = getMenuBackgroundImage(equippedCosmetics.menuBackground);
    
    // Estilo del fondo según tipo
    const menuBackgroundStyle = (menuBgImage && menuBg.type === 'png')
      ? { 
          backgroundImage: `url(${menuBg.png})`, 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundColor: menuBg.fallbackColor || '#0d1117'
        }
      : { background: menuBg.background };
    
    return (
      <div style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        ...menuBackgroundStyle,
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Patrón de fichas decorativo (solo si es CSS) */}
        {menuBg.type === 'css' && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.03,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Crect x='5' y='5' width='20' height='40' rx='4'/%3E%3Ccircle cx='15' cy='15' r='3'/%3E%3Ccircle cx='15' cy='35' r='3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px',
            pointerEvents: 'none'
          }} />
        )}
        
        {/* Overlay oscuro para mejorar legibilidad (solo si es PNG) */}
        {menuBg.type === 'png' && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.25)',
            pointerEvents: 'none'
          }} />
        )}
        
        {/* Modales */}
        {showSettings && <SettingsModal />}
        {showProfile && <ProfileModal />}
        {showLeaderboard && (
          <LeaderboardScreen 
            playerProfile={extendedProfile} 
            onClose={() => setShowLeaderboard(false)} 
          />
        )}
        {showShop && (
          <ShopScreen 
            playerProfile={extendedProfile} 
            playerInventory={playerInventory}
            onPurchase={handlePurchase}
            onClose={() => setShowShop(false)} 
          />
        )}
        {showTournaments && (
          <TournamentsScreen 
            playerProfile={extendedProfile}
            onClose={() => setShowTournaments(false)}
            onJoinTournament={handleJoinTournament}
          />
        )}
        {showInventory && (
          <InventoryScreen 
            equippedCosmetics={equippedCosmetics}
            onEquip={setEquippedCosmetics}
            playerInventory={playerInventory}
            playerTier={profile.rankTier}
            onClose={() => setShowInventory(false)}
          />
        )}
        {showAchievements && (
          <AchievementsScreen 
            playerStats={playerStats}
            unlockedAchievements={unlockedAchievements}
            onClose={() => setShowAchievements(false)}
          />
        )}
        {showDailyRewards && (
          <DailyRewardsModal
            dailyRewards={dailyRewards}
            onClaim={() => {
              const reward = claimDailyReward();
              if (reward) {
                showNotification('success', `¡+${reward.tokens} Tokens${reward.coins > 0 ? ` y +${reward.coins} Diamantes` : ''}!`, '🎁');
              }
            }}
            onClose={() => setShowDailyRewards(false)}
          />
        )}
        {showFriends && (
          <FriendsScreen
            friends={friendsList}
            friendRequests={friendRequests}
            onAcceptRequest={handleAcceptFriendRequest}
            onRejectRequest={handleRejectFriendRequest}
            onRemoveFriend={handleRemoveFriend}
            onSendRequest={handleSendFriendRequest}
            onInviteToGame={handleInviteToGame}
            onClose={() => setShowFriends(false)}
            currentUser={authUser}
          />
        )}
        
        {/* Notificación de logro desbloqueado */}
        {showingAchievement && (
          <div style={{
            position: 'fixed',
            top: 80,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2000,
            animation: 'slideDown 0.5s ease-out'
          }}>
            <div style={{
              background: `linear-gradient(135deg, ${ACHIEVEMENT_RARITY[showingAchievement.rarity].bg}, rgba(0,0,0,0.9))`,
              border: `2px solid ${ACHIEVEMENT_RARITY[showingAchievement.rarity].color}`,
              borderRadius: 16,
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              boxShadow: `0 10px 40px ${ACHIEVEMENT_RARITY[showingAchievement.rarity].color}50`
            }}>
              <div style={{
                width: 50,
                height: 50,
                borderRadius: 12,
                background: ACHIEVEMENT_RARITY[showingAchievement.rarity].bg,
                border: `2px solid ${ACHIEVEMENT_RARITY[showingAchievement.rarity].color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28
              }}>
                {showingAchievement.icon}
              </div>
              <div>
                <div style={{ color: '#10B981', fontSize: 11, fontWeight: 700, marginBottom: 2 }}>
                  🏆 ¡LOGRO DESBLOQUEADO!
                </div>
                <div style={{ color: ACHIEVEMENT_RARITY[showingAchievement.rarity].color, fontSize: 16, fontWeight: 700 }}>
                  {showingAchievement.name}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
                  {showingAchievement.reward.tokens && `+${showingAchievement.reward.tokens} 🪙`}
                  {showingAchievement.reward.coins && ` +${showingAchievement.reward.coins} 💎`}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Top Bar - HUD */}
        <TopBar />
        
        {/* Contenido según tab activo */}
        {menuTab === 'home' && <HomeContent />}
        {menuTab === 'pass' && <BattlePassContent />}
        
        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    );
  }

  if (phase === 'gameOver') {
    const won = scores[0] >= target;
    const currentRank = RankSystem.getRank(playerProfile.rating);
    const canRematch = rematchState.count < rematchState.maxRematches;
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" 
        style={{ background: C.bg.deep }}>
        
        {won && <Confetti />}
        
        {/* Animación de cambio de rango */}
        {rankChange && (
          <div className="fixed inset-0 flex items-center justify-center z-50" 
            style={{ background: 'rgba(0,0,0,0.9)' }}>
            <div className="text-center animate-bounce">
              <p className="text-xl mb-2" style={{ color: C.accent.slate }}>
                {rankChange.type === 'promotion' ? t('endGame.promoted') : t('endGame.demoted')}
              </p>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-center">
                  <span className="text-4xl">{rankChange.from.icon}</span>
                  <p className="text-sm" style={{ color: C.accent.slate }}>{rankChange.from.name}</p>
                </div>
                <span className="text-3xl" style={{ color: rankChange.type === 'promotion' ? C.accent.green : C.accent.red }}>→</span>
                <div className="text-center">
                  <span className="text-4xl">{rankChange.to.icon}</span>
                  <p className="text-sm font-bold" style={{ color: RankSystem.TIER_COLORS[rankChange.to.tier]?.primary }}>
                    {rankChange.to.name}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Notificación de revancha recibida */}
        {rematchState.received && (
          <div className="fixed inset-0 flex items-center justify-center z-50" 
            style={{ background: 'rgba(0,0,0,0.85)' }}>
            <div className="text-center p-6 rounded-2xl" style={{ background: C.bg.surface, border: `2px solid ${C.gold.main}` }}>
              <div className="text-5xl mb-4">⚔️</div>
              <p className="text-xl font-bold mb-2" style={{ color: C.gold.main }}>
                {t('endGame.rematchReceived')}
              </p>
              <p className="text-sm mb-6" style={{ color: C.text.secondary }}>
                {rematchState.opponentName || players[1]?.name}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={acceptRematch}
                  className="flex-1 py-3 px-6 rounded-xl font-bold active:scale-95 transition-transform"
                  style={{ background: C.accent.green, color: '#fff' }}
                >
                  ✓ {t('endGame.acceptRematch')}
                </button>
                <button
                  onClick={declineRematch}
                  className="flex-1 py-3 px-6 rounded-xl font-bold active:scale-95 transition-transform"
                  style={{ background: 'transparent', border: `1px solid ${C.accent.red}`, color: C.accent.red }}
                >
                  ✕ {t('endGame.declineRematch')}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Card principal */}
        <div className="w-full max-w-sm rounded-2xl p-5 text-center"
          style={{ background: C.bg.surface, border: `2px solid ${won ? C.gold.main : C.accent.red}` }}>
          
          {/* Icono y título */}
          <div className="text-5xl mb-1">{won ? '🏆' : '😔'}</div>
          <h1 className="text-2xl font-black mb-1" style={{ color: won ? C.gold.main : C.accent.red }}>
            {won ? t('endGame.victory') : t('endGame.defeat')}
          </h1>
          <p className="text-xs mb-3" style={{ color: C.accent.slate }}>
            {roundResult?.type === 'domino' ? t('game.domino') : t('game.blocked')}
          </p>
          
          {/* Marcador final */}
          <div className="flex items-center justify-center gap-4 mb-3 p-3 rounded-xl" style={{ background: C.bg.deep }}>
            <div className="text-center">
              <p className="text-xs mb-1" style={{ color: C.accent.blue }}>🔵 {t('game.you')}</p>
              <p className="text-3xl font-black font-mono" style={{ color: '#fff' }}>{scores[0]}</p>
            </div>
            <div className="text-xl" style={{ color: C.accent.slate }}>-</div>
            <div className="text-center">
              <p className="text-xs mb-1" style={{ color: C.accent.red }}>{t('game.rival')} 🔴</p>
              <p className="text-3xl font-black font-mono" style={{ color: '#fff' }}>{scores[1]}</p>
            </div>
          </div>
          
          {/* RECOMPENSAS */}
          {lastMatchRewards && lastMatchRewards.tokens > 0 && (
            <div className="mb-3 p-3 rounded-xl" style={{ background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold" style={{ color: '#FBBF24' }}>🪙 {t('endGame.rewards')}</span>
                <span className="text-lg font-black" style={{ color: '#FBBF24' }}>+{lastMatchRewards.tokens}</span>
              </div>
              <div className="flex flex-wrap gap-1 justify-center">
                {lastMatchRewards.bonuses.map((bonus, i) => (
                  <span key={i} style={{
                    padding: '2px 8px',
                    borderRadius: 6,
                    background: 'rgba(251, 191, 36, 0.2)',
                    color: '#FBBF24',
                    fontSize: 10,
                    fontWeight: 600
                  }}>
                    {bonus.name} +{bonus.tokens}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* MMR y Rango */}
          <div className="p-3 rounded-xl mb-3" style={{ 
            background: RankSystem.TIER_COLORS[currentRank.tier]?.bg || C.bg.card 
          }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentRank.icon}</span>
                <div className="text-left">
                  <p className="font-bold text-sm" style={{ color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                    {profile.isInPlacement ? `Placement ${playerProfile.placementGames}/10` : currentRank.name}
                  </p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    {playerProfile.rating} MMR
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-lg font-bold"
                style={{ 
                  background: 'rgba(0,0,0,0.3)',
                  color: eloChange > 0 ? '#4ade80' : '#f87171'
                }}>
                {eloChange > 0 ? '+' : ''}{eloChange}
              </span>
            </div>
            
            {/* Barra de progreso al siguiente rango */}
            {!profile.isInPlacement && (
              <div className="mt-2">
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <div className="h-full rounded-full transition-all duration-500" style={{
                    width: `${profile.rankProgress}%`,
                    background: 'rgba(255,255,255,0.8)'
                  }}/>
                </div>
              </div>
            )}
          </div>
          
          {/* Botones de acción */}
          <div className="space-y-2">
            {/* Botón de Revancha */}
            {canRematch && !rematchState.declined && (
              <button 
                onClick={requestRematch}
                disabled={rematchState.requested}
                className="w-full py-3 rounded-xl font-bold active:scale-95 transition-transform flex items-center justify-center gap-2"
                style={{ 
                  background: rematchState.requested 
                    ? C.bg.card 
                    : rematchState.accepted 
                      ? C.accent.green 
                      : `linear-gradient(135deg, #F59E0B, #D97706)`,
                  color: rematchState.requested ? C.text.muted : '#fff',
                  border: rematchState.requested ? `1px solid ${C.bg.border}` : 'none'
                }}>
                {rematchState.accepted ? (
                  <>✓ {t('endGame.rematchAccepted')}</>
                ) : rematchState.requested ? (
                  <>
                    <span className="animate-spin">⏳</span> 
                    {t('endGame.waitingResponse')}
                  </>
                ) : (
                  <>⚔️ {t('endGame.rematch')}</>
                )}
              </button>
            )}
            
            {/* Mensaje de revancha rechazada */}
            {rematchState.declined && (
              <div className="py-2 text-center text-sm" style={{ color: C.text.muted }}>
                {t('endGame.rematchDeclined')}
              </div>
            )}
            
            {/* Mensaje de máximo de revanchas */}
            {!canRematch && (
              <div className="py-2 text-center text-sm" style={{ color: C.text.muted }}>
                {t('endGame.maxRematches')} ({rematchState.count}/{rematchState.maxRematches})
              </div>
            )}
            
            {/* Botón Jugar de Nuevo */}
            <button 
              onClick={() => startSearch()}
              className="w-full py-4 rounded-xl font-black text-lg active:scale-95 transition-transform"
              style={{ background: `linear-gradient(135deg, ${C.gold.dark}, ${C.gold.main})`, color: C.bg.deep }}>
              🔄 {t('endGame.playAgain')}
            </button>
            
            {/* Botón Menú */}
            <button 
              onClick={() => reset()}
              className="w-full py-3 rounded-xl font-medium"
              style={{ background: C.bg.card, color: '#fff', border: `1px solid ${C.bg.border}` }}>
              🏠 {t('endGame.backToMenu')}
            </button>
          </div>
          
          {/* Contador de revanchas */}
          {rematchState.count > 0 && (
            <p className="mt-3 text-xs" style={{ color: C.text.muted }}>
              {t('endGame.rematch')} {rematchState.count}/{rematchState.maxRematches}
            </p>
          )}
        </div>
      </div>
    );
  }

  // GAME SCREEN - Layout con 3 zonas: HUD, TABLERO, MANO
  
  // Handler para mostrar estadísticas de jugador
  const handleAvatarClick = (player) => {
    setSelectedPlayerStats(player);
  };
  
  // Modal de estadísticas de jugador
  const PlayerStatsModal = () => {
    if (!selectedPlayerStats) return null;
    const p = selectedPlayerStats;
    const isTeammate = p.team === players[0].team;
    
    // Estadísticas ficticias pero realistas
    const stats = {
      gamesPlayed: Math.floor(100 + Math.random() * 500),
      winRate: (45 + Math.random() * 25).toFixed(1),
      avgScore: Math.floor(80 + Math.random() * 40),
      dominoes: Math.floor(20 + Math.random() * 80),
      trancas: Math.floor(5 + Math.random() * 30),
      currentStreak: Math.floor(Math.random() * 8),
      bestStreak: Math.floor(5 + Math.random() * 15),
      rank: ['Bronce', 'Plata', 'Oro', 'Platino', 'Diamante'][Math.floor(p.elo / 400)]
    };
    
    return (
      <div 
        onClick={() => setSelectedPlayerStats(null)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 16
        }}
      >
        <div 
          onClick={e => e.stopPropagation()}
          style={{
            background: C.bg.surface,
            borderRadius: 16,
            padding: 20,
            width: '100%',
            maxWidth: 320,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            border: `2px solid ${isTeammate ? C.accent.blue : C.accent.red}`
          }}
        >
          {/* Header con avatar y nombre */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12, 
            marginBottom: 16,
            paddingBottom: 12,
            borderBottom: `1px solid ${C.bg.border}`
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${isTeammate ? C.accent.blue : C.accent.red}, ${isTeammate ? '#1d4ed8' : '#b91c1c'})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}>
              {p.avatar}
            </div>
            <div>
              <div style={{ 
                fontSize: 18, 
                fontWeight: 700, 
                color: C.text.primary 
              }}>
                {p.name}
              </div>
              <div style={{ 
                fontSize: 14, 
                color: isTeammate ? C.accent.blue : C.accent.red,
                fontWeight: 600
              }}>
                {isTeammate ? '🤝 Tu equipo' : '⚔️ Oponente'}
              </div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.accent.gold }}>
                {p.elo}
              </div>
              <div style={{ fontSize: 11, color: C.text.secondary }}>ELO</div>
            </div>
          </div>
          
          {/* Rango */}
          <div style={{
            textAlign: 'center',
            padding: '8px 0',
            marginBottom: 12,
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 8
          }}>
            <span style={{ fontSize: 12, color: C.text.secondary }}>Rango: </span>
            <span style={{ 
              fontSize: 14, 
              fontWeight: 700, 
              color: stats.rank === 'Diamante' ? '#60a5fa' : 
                     stats.rank === 'Platino' ? '#a78bfa' :
                     stats.rank === 'Oro' ? C.accent.gold :
                     stats.rank === 'Plata' ? '#94a3b8' : '#cd7f32'
            }}>
              {stats.rank === 'Diamante' ? '💎' : stats.rank === 'Platino' ? '🔮' : stats.rank === 'Oro' ? '🥇' : stats.rank === 'Plata' ? '🥈' : '🥉'} {stats.rank}
            </span>
          </div>
          
          {/* Estadísticas grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8
          }}>
            {[
              { label: 'Partidas', value: stats.gamesPlayed, icon: '🎮' },
              { label: 'Victoria %', value: `${stats.winRate}%`, icon: '🏆' },
              { label: 'Puntos/Ronda', value: stats.avgScore, icon: '📊' },
              { label: 'Dominós', value: stats.dominoes, icon: '🎯' },
              { label: 'Trancas', value: stats.trancas, icon: '🔒' },
              { label: 'Racha actual', value: stats.currentStreak, icon: '🔥' },
            ].map((stat, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.03)',
                padding: '8px 10px',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <span style={{ fontSize: 16 }}>{stat.icon}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text.primary }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 10, color: C.text.secondary }}>
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Botón cerrar */}
          <button
            onClick={() => setSelectedPlayerStats(null)}
            className="touch-feedback"
            style={{
              width: '100%',
              marginTop: 16,
              padding: '10px 0',
              background: C.bg.elevated,
              border: `1px solid ${C.bg.border}`,
              borderRadius: 8,
              color: C.text.primary,
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer'
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  };
  
  return (
    <div style={{
      height: '100%',
      maxHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: C.bg.deep
    }}>
      {/* Overlays globales */}
      <Notification />
      <Confetti />
      <EventOverlay />
      <PauseMenu />
      {showSettings && <SettingsModal />}
      <PlayerStatsModal />
      
      {/* Overlay de emote recibido */}
      {emoteRecibido && settings.allowEmotes && (
        <div style={{
          position: 'fixed',
          zIndex: 100,
          pointerEvents: 'none',
          ...(emoteRecibido.jugadorPosicion === 0 ? { bottom: '25%', left: '50%', transform: 'translateX(-50%)' } :
             emoteRecibido.jugadorPosicion === 1 ? { top: '50%', right: '15%', transform: 'translateY(-50%)' } :
             emoteRecibido.jugadorPosicion === 2 ? { top: '15%', left: '50%', transform: 'translateX(-50%)' } :
             { top: '50%', left: '15%', transform: 'translateY(-50%)' })
        }}>
          <div style={{
            background: 'rgba(0,0,0,0.9)',
            borderRadius: 16,
            padding: '8px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            animation: 'emotePopIn 0.3s ease-out, emotePopOut 0.3s ease-in 2.7s forwards',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            border: `2px solid ${C.gold.main}`
          }}>
            <span style={{ fontSize: 10, color: C.accent.slate }}>{emoteRecibido.jugadorNombre}</span>
            <span style={{ fontSize: emoteRecibido.emote.length > 2 ? 16 : 32 }}>
              {emoteRecibido.emote}
            </span>
          </div>
        </div>
      )}
      
      {/* Indicador de jugador desconectado */}
      {jugadorDesconectado && (
        <div style={{
          position: 'fixed',
          top: 60,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 90,
          background: `linear-gradient(135deg, ${C.accent.red}20, ${C.bg.surface})`,
          border: `2px solid ${C.accent.red}`,
          borderRadius: 12,
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}>
          <span style={{ fontSize: 20 }}>⚠️</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.accent.red }}>
              {jugadorDesconectado.nombre} se desconectó
            </div>
            <div style={{ fontSize: 10, color: C.accent.slate }}>
              Esperando reconexión... ({Math.floor(jugadorDesconectado.tiempoRestante / 60)}:{(jugadorDesconectado.tiempoRestante % 60).toString().padStart(2, '0')})
            </div>
          </div>
        </div>
      )}
      
      {/* Menú de emotes */}
      {showEmoteMenu && gameMode === 'online' && settings.allowEmotes && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 80,
            background: 'rgba(0,0,0,0.5)'
          }}
          onClick={() => setShowEmoteMenu(false)}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute',
              bottom: '30%',
              left: '50%',
              transform: 'translateX(-50%)',
              background: C.bg.surface,
              borderRadius: 16,
              padding: 16,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              border: `2px solid ${C.gold.main}`,
              maxWidth: '90vw'
            }}
          >
            <div style={{ 
              fontSize: 12, 
              fontWeight: 700, 
              color: C.gold.main, 
              marginBottom: 12,
              textAlign: 'center'
            }}>
              EMOTES
            </div>
            
            {/* Emojis */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(6, 1fr)', 
              gap: 8,
              marginBottom: 12
            }}>
              {EMOTES.map(emote => (
                <button
                  key={emote}
                  onClick={() => sendEmote(emote)}
                  disabled={emoteCooldown}
                  className="touch-feedback"
                  style={{
                    width: 44,
                    height: 44,
                    fontSize: 24,
                    background: C.bg.card,
                    border: `1px solid ${C.bg.border}`,
                    borderRadius: 8,
                    cursor: emoteCooldown ? 'not-allowed' : 'pointer',
                    opacity: emoteCooldown ? 0.5 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {emote}
                </button>
              ))}
            </div>
            
            {/* Frases */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {EMOTE_FRASES.map(frase => (
                <button
                  key={frase}
                  onClick={() => sendEmote(frase)}
                  disabled={emoteCooldown}
                  className="touch-feedback"
                  style={{
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    background: C.bg.card,
                    border: `1px solid ${C.bg.border}`,
                    borderRadius: 20,
                    color: '#fff',
                    cursor: emoteCooldown ? 'not-allowed' : 'pointer',
                    opacity: emoteCooldown ? 0.5 : 1
                  }}
                >
                  {frase}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* CSS para animación de emotes */}
      <style>{`
        @keyframes emotePopIn {
          0% { opacity: 0; transform: translateX(-50%) scale(0.5); }
          100% { opacity: 1; transform: translateX(-50%) scale(1); }
        }
        @keyframes emotePopOut {
          0% { opacity: 1; transform: translateX(-50%) scale(1); }
          100% { opacity: 0; transform: translateX(-50%) scale(0.5); }
        }
      `}</style>
      
      {/* Pantallas de navegación */}
      {showLeaderboard && (
        <LeaderboardScreen 
          playerProfile={extendedProfile} 
          onClose={() => setShowLeaderboard(false)} 
        />
      )}
      {showShop && (
        <ShopScreen 
          playerProfile={extendedProfile} 
          playerInventory={playerInventory}
          onPurchase={handlePurchase}
          onClose={() => setShowShop(false)} 
        />
      )}
      {showTournaments && (
        <TournamentsScreen 
          playerProfile={extendedProfile}
          onClose={() => setShowTournaments(false)}
          onJoinTournament={handleJoinTournament}
        />
      )}
      {showInventory && (
        <InventoryScreen 
          equippedCosmetics={equippedCosmetics}
          onEquip={setEquippedCosmetics}
          playerInventory={playerInventory}
          playerTier={profile.rankTier}
          onClose={() => setShowInventory(false)}
        />
      )}
      {showAchievements && (
        <AchievementsScreen 
          playerStats={playerStats}
          unlockedAchievements={unlockedAchievements}
          onClose={() => setShowAchievements(false)}
        />
      )}
      
      {/* Notificación de logro desbloqueado */}
      {showingAchievement && (
        <div style={{
          position: 'fixed',
          top: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 2000,
          animation: 'slideDown 0.5s ease-out'
        }}>
          <div style={{
            background: `linear-gradient(135deg, ${ACHIEVEMENT_RARITY[showingAchievement.rarity].bg}, rgba(0,0,0,0.9))`,
            border: `2px solid ${ACHIEVEMENT_RARITY[showingAchievement.rarity].color}`,
            borderRadius: 16,
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            boxShadow: `0 10px 40px ${ACHIEVEMENT_RARITY[showingAchievement.rarity].color}50`
          }}>
            <div style={{
              width: 50,
              height: 50,
              borderRadius: 12,
              background: ACHIEVEMENT_RARITY[showingAchievement.rarity].bg,
              border: `2px solid ${ACHIEVEMENT_RARITY[showingAchievement.rarity].color}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28
            }}>
              {showingAchievement.icon}
            </div>
            <div>
              <div style={{ color: '#10B981', fontSize: 11, fontWeight: 700, marginBottom: 2 }}>
                🏆 ¡LOGRO DESBLOQUEADO!
              </div>
              <div style={{ color: ACHIEVEMENT_RARITY[showingAchievement.rarity].color, fontSize: 16, fontWeight: 700 }}>
                {showingAchievement.name}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
                {showingAchievement.reward.tokens && `+${showingAchievement.reward.tokens} 🪙`}
                {showingAchievement.reward.coins && ` +${showingAchievement.reward.coins} 💎`}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* ZONA 1: HUD - Arriba */}
      <GameHUD
        scores={scores}
        timer={timer}
        currentPlayer={current}
        players={players}
        board={board}
        onPause={() => setShowPauseMenu(true)}
        onSettings={() => setShowSettings(true)}
        onEmote={() => setShowEmoteMenu(true)}
        isOnline={gameMode === 'online'}
      />
      
      {/* ZONA 2: TABLERO - Centro (flex: 1 para ocupar espacio) */}
      <GameArea 
        board={board} 
        lastPlayed={lastPlayed} 
        players={players} 
        playerPassed={playerPassed} 
        flyingTile={flyingTile} 
        onAvatarClick={handleAvatarClick}
        onBoardInfo={handleBoardInfo}
        currentPlayer={current}
        skinSetId={equippedCosmetics.skinSet}
      />
      
      {/* ZONA 3: MANO - Abajo */}
      <PlayerHandArea
        tiles={players[0].tiles}
        board={board}
        selected={selected}
        onSelect={handleClick}
        onPlay={(tile, pos) => playTile(tile, pos)}
        onPass={pass}
        canPass={canPass}
        isMyTurn={current === 0}
        showChoice={showChoice}
        onCancelChoice={() => { setSelected(null); setShowChoice(false); }}
        player={players[0]}
        onAvatarClick={handleAvatarClick}
        boardRect={boardRect}
        snakePositions={snakePositions}
        mustPlay={mustPlay}
        skinSetId={equippedCosmetics.skinSet}
        onReorderTiles={(newTiles) => {
          setPlayers(prev => {
            const updated = [...prev];
            updated[0] = { ...updated[0], tiles: newTiles };
            return updated;
          });
        }}
        onFlipTile={(tileId) => {
          setPlayers(prev => {
            const updated = [...prev];
            const tiles = updated[0].tiles.map(t => 
              t.id === tileId 
                ? { ...t, left: t.right, right: t.left } 
                : t
            );
            updated[0] = { ...updated[0], tiles };
            return updated;
          });
        }}
      />
    </div>
  );
};

// Wrapper con estilos globales, autenticación y meta viewport
const App = () => {
  // Estado de autenticación simple (sin contexto para mantener todo en un archivo)
  const [authUser, setAuthUser] = useState(() => {
    try {
      const saved = localStorage.getItem('dominoUserAuth');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });
  const [showLogin, setShowLogin] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [firestoreReady, setFirestoreReady] = useState(false);
  
  // Guardar usuario cuando cambie
  useEffect(() => {
    if (authUser) {
      localStorage.setItem('dominoUserAuth', JSON.stringify(authUser));
    }
  }, [authUser]);
  
  // Handlers de autenticación
  const handleLoginSuccess = async (user) => {
    console.log('[Auth] Login exitoso:', user.name);
    setAuthLoading(true);
    
    try {
      // Cargar o crear perfil en Firestore
      const { getOrCreateUser } = await import('./firestore.js');
      const firestoreProfile = await getOrCreateUser({
        uid: user.id,
        displayName: user.name,
        email: user.email,
        photoURL: user.avatar,
        providerData: [{ providerId: user.provider }]
      });
      
      if (firestoreProfile) {
        console.log('[Firestore] Perfil cargado:', firestoreProfile.name);
        
        // Combinar datos de Firebase Auth con Firestore
        const fullUser = {
          ...user,
          ...firestoreProfile,
          id: user.id // Mantener ID de Firebase Auth
        };
        
        // Guardar inventario, currencies, etc. en localStorage para uso inmediato
        if (firestoreProfile.inventory) {
          localStorage.setItem('dominoPlayerInventory', JSON.stringify(firestoreProfile.inventory));
        }
        if (firestoreProfile.tokens !== undefined || firestoreProfile.coins !== undefined) {
          localStorage.setItem('dominoPlayerCurrencies', JSON.stringify({
            tokens: firestoreProfile.tokens || 500,
            coins: firestoreProfile.coins || 0
          }));
        }
        if (firestoreProfile.equipped) {
          localStorage.setItem('dominoEquippedCosmetics', JSON.stringify(firestoreProfile.equipped));
        }
        if (firestoreProfile.rating) {
          localStorage.setItem('dominoPlayerRating', JSON.stringify({
            rating: firestoreProfile.rating,
            rd: firestoreProfile.rd || 350,
            volatility: firestoreProfile.volatility || 0.06
          }));
        }
        if (firestoreProfile.stats) {
          localStorage.setItem('dominoPlayerStats', JSON.stringify(firestoreProfile.stats));
        }
        
        setAuthUser(fullUser);
        setFirestoreReady(true);
      } else {
        setAuthUser(user);
      }
    } catch (e) {
      console.error('[Firestore] Error cargando perfil:', e);
      // Continuar con datos locales si Firestore falla
      setAuthUser(user);
    } finally {
      setAuthLoading(false);
      setShowLogin(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      // Marcar como offline en Firestore
      if (authUser?.id && !authUser.isGuest) {
        const { setUserOffline } = await import('./firestore.js');
        await setUserOffline(authUser.id);
      }
      
      // Logout de Firebase
      const { logOut } = await import('./firebase.js');
      await logOut();
    } catch (e) {
      console.error('[Auth] Error en logout:', e);
    }
    
    setAuthUser(null);
    setFirestoreReady(false);
    localStorage.removeItem('dominoUserAuth');
  };
  
  const handlePlayAsGuest = () => {
    const guestUser = {
      id: `guest_${Date.now()}`,
      name: 'Invitado',
      isGuest: true,
      provider: 'guest'
    };
    setAuthUser(guestUser);
    setShowLogin(false);
  };
  
  // Mostrar login al iniciar si no hay usuario
  const handleRequestLogin = () => {
    setShowLogin(true);
  };
  
  return (
    <>
      <GlobalStyles />
      <DominoRanked 
        authUser={authUser}
        onRequestLogin={handleRequestLogin}
        onLogout={handleLogout}
      />
      {showLogin && (
        <LoginModal 
          onClose={() => setShowLogin(false)}
          onSuccess={handleLoginSuccess}
          onPlayAsGuest={handlePlayAsGuest}
        />
      )}
    </>
  );
};

// Modal de Login simplificado (todo en un archivo)
const LoginModal = ({ onClose, onSuccess, onPlayAsGuest }) => {
  const C = THEME.colors;
  const [mode, setMode] = useState('main'); // 'main', 'email', 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      // Importar Firebase y Firestore
      const { signInWithGoogle } = await import('./firebase.js');
      const { getOrCreateUser } = await import('./firestore.js');
      
      const result = await signInWithGoogle();
      if (result) {
        console.log('[Auth] Google login exitoso:', result.displayName);
        
        // Crear/cargar perfil en Firestore inmediatamente
        const firestoreProfile = await getOrCreateUser({
          uid: result.uid,
          displayName: result.displayName,
          email: result.email,
          photoURL: result.photoURL,
          providerData: result.providerData
        });
        
        console.log('[Firestore] Perfil:', firestoreProfile?.name);
        
        // Pasar usuario completo con datos de Firestore
        const fullUser = {
          id: result.uid,
          name: result.displayName || 'Jugador',
          email: result.email,
          avatar: result.photoURL,
          provider: 'google.com',
          // Datos de Firestore
          ...(firestoreProfile || {})
        };
        
        onSuccess(fullUser);
      }
    } catch (e) {
      console.error('Error Google login:', e);
      setError('Error al conectar con Google: ' + (e.message || e.code || 'desconocido'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleAppleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const { signInWithApple } = await import('./firebase.js');
      const { getOrCreateUser } = await import('./firestore.js');
      
      const result = await signInWithApple();
      if (result) {
        console.log('[Auth] Apple login exitoso:', result.displayName);
        
        const firestoreProfile = await getOrCreateUser({
          uid: result.uid,
          displayName: result.displayName,
          email: result.email,
          photoURL: result.photoURL,
          providerData: result.providerData
        });
        
        const fullUser = {
          id: result.uid,
          name: result.displayName || 'Jugador',
          email: result.email,
          avatar: result.photoURL,
          provider: 'apple.com',
          ...(firestoreProfile || {})
        };
        
        onSuccess(fullUser);
      }
    } catch (e) {
      console.error('Error Apple login:', e);
      setError('Error al conectar con Apple: ' + (e.message || e.code || 'desconocido'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Completa todos los campos');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { signInWithEmail, registerWithEmail } = await import('./firebase.js');
      const { getOrCreateUser } = await import('./firestore.js');
      
      let result;
      if (mode === 'register') {
        result = await registerWithEmail(email, password, displayName);
      } else {
        result = await signInWithEmail(email, password);
      }
      
      console.log('[Auth] Email login exitoso:', result.displayName || email);
      
      const firestoreProfile = await getOrCreateUser({
        uid: result.uid,
        displayName: result.displayName || displayName || email.split('@')[0],
        email: result.email,
        photoURL: result.photoURL,
        providerData: result.providerData
      });
      
      const fullUser = {
        id: result.uid,
        name: result.displayName || displayName || email.split('@')[0],
        email: result.email,
        avatar: result.photoURL,
        provider: 'password',
        ...(firestoreProfile || {})
      };
      
      onSuccess(fullUser);
    } catch (e) {
      console.error('Error email auth:', e);
      const errorMessages = {
        'auth/invalid-email': 'Email inválido',
        'auth/user-not-found': 'Usuario no encontrado',
        'auth/wrong-password': 'Contraseña incorrecta',
        'auth/email-already-in-use': 'Este email ya está registrado',
        'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
        'auth/invalid-credential': 'Credenciales inválidas'
      };
      setError(errorMessages[e.code] || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };
  
  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: 16
    },
    container: {
      width: '100%',
      maxWidth: 380,
      background: C.surface,
      borderRadius: 16,
      padding: 24,
      position: 'relative'
    },
    header: {
      textAlign: 'center',
      marginBottom: 24
    },
    logo: {
      fontSize: 48,
      marginBottom: 8
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: C.text,
      margin: 0
    },
    subtitle: {
      fontSize: 14,
      color: C.textSecondary,
      margin: '8px 0 0'
    },
    closeBtn: {
      position: 'absolute',
      top: 12,
      right: 12,
      background: 'transparent',
      border: 'none',
      color: C.textSecondary,
      fontSize: 24,
      cursor: 'pointer'
    },
    backBtn: {
      position: 'absolute',
      top: 12,
      left: 12,
      background: 'transparent',
      border: 'none',
      color: C.textSecondary,
      fontSize: 14,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: 4
    },
    btn: {
      width: '100%',
      padding: '14px 16px',
      borderRadius: 12,
      border: 'none',
      fontSize: 16,
      fontWeight: 500,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      marginBottom: 12
    },
    googleBtn: {
      background: '#fff',
      color: '#333'
    },
    appleBtn: {
      background: '#000',
      color: '#fff'
    },
    emailBtn: {
      background: C.bg,
      color: C.text,
      border: `1px solid ${C.border}`
    },
    guestBtn: {
      background: 'transparent',
      color: C.textSecondary,
      border: `1px solid ${C.border}`,
      marginTop: 8
    },
    submitBtn: {
      background: C.accent.green,
      color: '#fff'
    },
    divider: {
      display: 'flex',
      alignItems: 'center',
      margin: '16px 0',
      color: C.textSecondary,
      fontSize: 14
    },
    line: {
      flex: 1,
      height: 1,
      background: C.border
    },
    input: {
      width: '100%',
      padding: '14px 16px',
      borderRadius: 12,
      border: `1px solid ${C.border}`,
      background: C.bg,
      color: C.text,
      fontSize: 16,
      marginBottom: 12,
      outline: 'none',
      boxSizing: 'border-box'
    },
    error: {
      background: '#ef444420',
      border: '1px solid #ef4444',
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      color: '#ef4444',
      fontSize: 14,
      textAlign: 'center'
    },
    link: {
      color: C.accent.green,
      cursor: 'pointer'
    },
    footer: {
      textAlign: 'center',
      marginTop: 16,
      color: C.textSecondary,
      fontSize: 13
    }
  };
  
  // Render según el modo
  if (mode === 'email' || mode === 'register') {
    return (
      <div style={styles.overlay}>
        <div style={styles.container}>
          <button style={styles.backBtn} onClick={() => setMode('main')}>
            ← Volver
          </button>
          
          <div style={styles.header}>
            <div style={styles.logo}>🎲</div>
            <h2 style={styles.title}>{mode === 'register' ? 'Crear Cuenta' : 'Iniciar Sesión'}</h2>
          </div>
          
          {error && <div style={styles.error}>{error}</div>}
          
          <form onSubmit={handleEmailSubmit}>
            {mode === 'register' && (
              <input
                type="text"
                placeholder="Nombre de jugador"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                style={styles.input}
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
            <button 
              type="submit" 
              style={{...styles.btn, ...styles.submitBtn}}
              disabled={loading}
            >
              {loading ? '...' : (mode === 'register' ? 'Crear Cuenta' : 'Entrar')}
            </button>
          </form>
          
          <div style={styles.footer}>
            {mode === 'email' ? (
              <p>¿No tienes cuenta? <span style={styles.link} onClick={() => setMode('register')}>Regístrate</span></p>
            ) : (
              <p>¿Ya tienes cuenta? <span style={styles.link} onClick={() => setMode('email')}>Inicia sesión</span></p>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Pantalla principal
  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        <button style={styles.closeBtn} onClick={onClose}>×</button>
        
        <div style={styles.header}>
          <div style={styles.logo}>🎲</div>
          <h2 style={styles.title}>Dominó Cubano</h2>
          <p style={styles.subtitle}>Inicia sesión para guardar tu progreso</p>
        </div>
        
        {error && <div style={styles.error}>{error}</div>}
        
        {/* Google */}
        <button 
          style={{...styles.btn, ...styles.googleBtn}}
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar con Google
        </button>
        
        {/* Apple */}
        <button 
          style={{...styles.btn, ...styles.appleBtn}}
          onClick={handleAppleLogin}
          disabled={loading}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
          Continuar con Apple
        </button>
        
        {/* Divider */}
        <div style={styles.divider}>
          <div style={styles.line}></div>
          <span style={{ padding: '0 12px' }}>o</span>
          <div style={styles.line}></div>
        </div>
        
        {/* Email */}
        <button 
          style={{...styles.btn, ...styles.emailBtn}}
          onClick={() => setMode('email')}
        >
          ✉️ Continuar con Email
        </button>
        
        {/* Guest */}
        <button 
          style={{...styles.btn, ...styles.guestBtn}}
          onClick={onPlayAsGuest}
        >
          Jugar como Invitado
        </button>
        
        <div style={styles.footer}>
          <p style={{ fontSize: 11 }}>Al continuar, aceptas nuestros términos de servicio</p>
        </div>
      </div>
    </div>
  );
};

export default App;
