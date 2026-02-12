// ============================================================================
// SISTEMA DE AUDIO - DOMINÓ CUBANO
// ============================================================================
// Maneja todos los efectos de sonido, música y vibración del juego

// ============================================================================
// CONFIGURACIÓN DE SONIDOS
// ============================================================================

const SOUNDS = {
  // Sonidos de fichas
  tile_place: {
    src: '/sounds/tile_place.mp3',
    volume: 0.7,
    variations: 3  // tile_place_1.mp3, tile_place_2.mp3, tile_place_3.mp3
  },
  tile_select: {
    src: '/sounds/tile_select.mp3',
    volume: 0.5
  },
  tile_drag: {
    src: '/sounds/tile_drag.mp3',
    volume: 0.3
  },
  
  // Sonidos de juego
  pass: {
    src: '/sounds/pass.mp3',
    volume: 0.6
  },
  domino: {
    src: '/sounds/domino.mp3',
    volume: 0.9
  },
  tranca: {
    src: '/sounds/tranca.mp3',
    volume: 0.8
  },
  capicua: {
    src: '/sounds/capicua.mp3',
    volume: 0.9
  },
  pollona: {
    src: '/sounds/pollona.mp3',
    volume: 1.0
  },
  
  // Sonidos de partida
  match_found: {
    src: '/sounds/match_found.mp3',
    volume: 0.8
  },
  game_start: {
    src: '/sounds/game_start.mp3',
    volume: 0.7
  },
  round_win: {
    src: '/sounds/round_win.mp3',
    volume: 0.8
  },
  round_lose: {
    src: '/sounds/round_lose.mp3',
    volume: 0.6
  },
  game_win: {
    src: '/sounds/game_win.mp3',
    volume: 1.0
  },
  game_lose: {
    src: '/sounds/game_lose.mp3',
    volume: 0.7
  },
  
  // Sonidos de turno
  your_turn: {
    src: '/sounds/your_turn.mp3',
    volume: 0.6
  },
  timer_warning: {
    src: '/sounds/timer_warning.mp3',
    volume: 0.7
  },
  timer_critical: {
    src: '/sounds/timer_critical.mp3',
    volume: 0.8
  },
  
  // Sonidos de UI
  button_click: {
    src: '/sounds/button_click.mp3',
    volume: 0.4
  },
  menu_open: {
    src: '/sounds/menu_open.mp3',
    volume: 0.3
  },
  menu_close: {
    src: '/sounds/menu_close.mp3',
    volume: 0.3
  },
  notification: {
    src: '/sounds/notification.mp3',
    volume: 0.5
  },
  error: {
    src: '/sounds/error.mp3',
    volume: 0.5
  },
  
  // Sonidos de tienda/recompensas
  purchase: {
    src: '/sounds/purchase.mp3',
    volume: 0.7
  },
  reward: {
    src: '/sounds/reward.mp3',
    volume: 0.8
  },
  level_up: {
    src: '/sounds/level_up.mp3',
    volume: 0.9
  },
  rank_up: {
    src: '/sounds/rank_up.mp3',
    volume: 1.0
  },
  rank_down: {
    src: '/sounds/rank_down.mp3',
    volume: 0.6
  },
  
  // Emotes
  emote_send: {
    src: '/sounds/emote_send.mp3',
    volume: 0.5
  },
  emote_receive: {
    src: '/sounds/emote_receive.mp3',
    volume: 0.4
  },
  
  // Conexión
  player_join: {
    src: '/sounds/player_join.mp3',
    volume: 0.5
  },
  player_leave: {
    src: '/sounds/player_leave.mp3',
    volume: 0.5
  },
  reconnect: {
    src: '/sounds/reconnect.mp3',
    volume: 0.6
  }
};

// Música de fondo
const MUSIC = {
  menu: {
    src: '/music/menu_theme.mp3',
    volume: 0.3,
    loop: true
  },
  game: {
    src: '/music/game_theme.mp3',
    volume: 0.2,
    loop: true
  },
  victory: {
    src: '/music/victory_theme.mp3',
    volume: 0.4,
    loop: false
  },
  defeat: {
    src: '/music/defeat_theme.mp3',
    volume: 0.3,
    loop: false
  }
};

// ============================================================================
// CLASE PRINCIPAL DE AUDIO
// ============================================================================

class AudioManager {
  constructor() {
    this.sounds = new Map();
    this.music = null;
    this.currentMusic = null;
    
    // Configuración
    this.settings = {
      soundEnabled: true,
      musicEnabled: true,
      vibrationEnabled: true,
      masterVolume: 1.0,
      soundVolume: 1.0,
      musicVolume: 0.5
    };
    
    // Estado
    this.initialized = false;
    this.unlocked = false;
    
    // Cargar configuración guardada
    this.loadSettings();
  }
  
  // ========== INICIALIZACIÓN ==========
  
  async init() {
    if (this.initialized) return;
    
    console.log('[Audio] Inicializando sistema de audio...');
    
    // Precargar sonidos más usados
    await this.preloadEssentialSounds();
    
    this.initialized = true;
    console.log('[Audio] ✅ Sistema de audio listo');
  }
  
  async preloadEssentialSounds() {
    const essential = [
      'tile_place', 'tile_select', 'pass', 'domino', 
      'your_turn', 'button_click', 'notification'
    ];
    
    for (const key of essential) {
      await this.loadSound(key);
    }
  }
  
  async loadSound(key) {
    const config = SOUNDS[key];
    if (!config || this.sounds.has(key)) return;
    
    try {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = config.src;
      audio.volume = config.volume * this.settings.soundVolume * this.settings.masterVolume;
      
      await new Promise((resolve, reject) => {
        audio.oncanplaythrough = resolve;
        audio.onerror = () => resolve(); // No fallar si no existe
        setTimeout(resolve, 2000); // Timeout
      });
      
      this.sounds.set(key, { audio, config });
    } catch (e) {
      console.warn(`[Audio] No se pudo cargar: ${key}`);
    }
  }
  
  // Desbloquear audio (requiere interacción del usuario en móvil)
  unlock() {
    if (this.unlocked) return;
    
    // Crear y reproducir audio silencioso para desbloquear
    const silentAudio = new Audio();
    silentAudio.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYoRwmHAAAAAAD/+9DEAAAIAANIAAAAgAADSAAAAATEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//tQxBkAAADSAAAAAAAAANIAAAAATEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
    silentAudio.play().then(() => {
      this.unlocked = true;
      console.log('[Audio] 🔓 Audio desbloqueado');
    }).catch(() => {});
    
    return this.unlocked;
  }
  
  // ========== REPRODUCCIÓN DE SONIDOS ==========
  
  play(key, options = {}) {
    if (!this.settings.soundEnabled) return;
    if (!this.unlocked) this.unlock();
    
    const sound = this.sounds.get(key);
    
    if (sound) {
      this.playFromCache(sound, options);
    } else {
      // Cargar y reproducir
      this.loadSound(key).then(() => {
        const loaded = this.sounds.get(key);
        if (loaded) this.playFromCache(loaded, options);
      });
    }
  }
  
  playFromCache(sound, options = {}) {
    try {
      const { audio, config } = sound;
      
      // Clonar para permitir múltiples reproducciones simultáneas
      const clone = audio.cloneNode();
      clone.volume = (options.volume || config.volume) * 
                     this.settings.soundVolume * 
                     this.settings.masterVolume;
      
      // Variaciones de pitch para más naturalidad
      if (options.pitchVariation) {
        clone.playbackRate = 0.9 + Math.random() * 0.2;
      }
      
      clone.play().catch(() => {});
      
      // Vibración opcional
      if (options.vibrate && this.settings.vibrationEnabled) {
        this.vibrate(options.vibrate);
      }
    } catch (e) {
      console.warn('[Audio] Error reproduciendo:', e);
    }
  }
  
  // Sonido con variación (ej: colocar ficha)
  playWithVariation(baseKey, count = 3) {
    const variation = Math.floor(Math.random() * count) + 1;
    const key = `${baseKey}_${variation}`;
    
    // Si existe la variación, usarla; si no, usar el base
    if (SOUNDS[key]) {
      this.play(key, { pitchVariation: true });
    } else {
      this.play(baseKey, { pitchVariation: true });
    }
  }
  
  // ========== MÚSICA ==========
  
  playMusic(key) {
    if (!this.settings.musicEnabled) return;
    if (!this.unlocked) this.unlock();
    
    const config = MUSIC[key];
    if (!config) return;
    
    // Detener música actual
    this.stopMusic();
    
    try {
      this.music = new Audio(config.src);
      this.music.volume = config.volume * this.settings.musicVolume * this.settings.masterVolume;
      this.music.loop = config.loop;
      this.currentMusic = key;
      
      this.music.play().catch(() => {
        console.warn('[Audio] No se pudo reproducir música');
      });
    } catch (e) {
      console.warn('[Audio] Error con música:', e);
    }
  }
  
  stopMusic(fadeOut = true) {
    if (!this.music) return;
    
    if (fadeOut) {
      // Fade out gradual
      const fadeInterval = setInterval(() => {
        if (this.music && this.music.volume > 0.05) {
          this.music.volume = Math.max(0, this.music.volume - 0.05);
        } else {
          clearInterval(fadeInterval);
          if (this.music) {
            this.music.pause();
            this.music = null;
            this.currentMusic = null;
          }
        }
      }, 50);
    } else {
      this.music.pause();
      this.music = null;
      this.currentMusic = null;
    }
  }
  
  pauseMusic() {
    if (this.music) {
      this.music.pause();
    }
  }
  
  resumeMusic() {
    if (this.music && this.settings.musicEnabled) {
      this.music.play().catch(() => {});
    }
  }
  
  // ========== VIBRACIÓN ==========
  
  vibrate(pattern) {
    if (!this.settings.vibrationEnabled) return;
    if (!navigator.vibrate) return;
    
    try {
      navigator.vibrate(pattern);
    } catch (e) {}
  }
  
  // Patrones de vibración predefinidos
  vibrateLight() { this.vibrate(10); }
  vibrateMedium() { this.vibrate(25); }
  vibrateHeavy() { this.vibrate(50); }
  vibrateDouble() { this.vibrate([20, 50, 20]); }
  vibrateSuccess() { this.vibrate([30, 50, 30, 50, 50]); }
  vibrateError() { this.vibrate([100, 30, 100]); }
  
  // ========== CONFIGURACIÓN ==========
  
  loadSettings() {
    try {
      const saved = localStorage.getItem('dominoAudioSettings');
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    } catch (e) {}
  }
  
  saveSettings() {
    try {
      localStorage.setItem('dominoAudioSettings', JSON.stringify(this.settings));
    } catch (e) {}
  }
  
  setSoundEnabled(enabled) {
    this.settings.soundEnabled = enabled;
    this.saveSettings();
  }
  
  setMusicEnabled(enabled) {
    this.settings.musicEnabled = enabled;
    if (!enabled) {
      this.stopMusic(false);
    }
    this.saveSettings();
  }
  
  setVibrationEnabled(enabled) {
    this.settings.vibrationEnabled = enabled;
    this.saveSettings();
  }
  
  setMasterVolume(volume) {
    this.settings.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
    this.saveSettings();
  }
  
  setSoundVolume(volume) {
    this.settings.soundVolume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
    this.saveSettings();
  }
  
  setMusicVolume(volume) {
    this.settings.musicVolume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
    this.saveSettings();
  }
  
  updateVolumes() {
    // Actualizar volumen de música actual
    if (this.music && this.currentMusic) {
      const config = MUSIC[this.currentMusic];
      if (config) {
        this.music.volume = config.volume * this.settings.musicVolume * this.settings.masterVolume;
      }
    }
  }
  
  getSettings() {
    return { ...this.settings };
  }
}

// ============================================================================
// INSTANCIA GLOBAL
// ============================================================================

const audioManager = new AudioManager();

// ============================================================================
// FUNCIONES DE CONVENIENCIA (para usar en el juego)
// ============================================================================

// Inicializar (llamar al cargar la app)
export const initAudio = () => audioManager.init();

// Desbloquear (llamar en primer click/touch del usuario)
export const unlockAudio = () => audioManager.unlock();

// Sonidos de fichas
export const playTilePlace = () => {
  audioManager.playWithVariation('tile_place', 3);
  audioManager.vibrateLight();
};

export const playTileSelect = () => {
  audioManager.play('tile_select');
  audioManager.vibrateLight();
};

// Sonidos de juego
export const playPass = () => audioManager.play('pass');

export const playDomino = () => {
  audioManager.play('domino');
  audioManager.vibrateSuccess();
};

export const playTranca = () => {
  audioManager.play('tranca');
  audioManager.vibrateMedium();
};

export const playCapicua = () => {
  audioManager.play('capicua');
  audioManager.vibrateSuccess();
};

export const playPollona = () => {
  audioManager.play('pollona');
  audioManager.vibrateHeavy();
};

// Sonidos de partida
export const playMatchFound = () => {
  audioManager.play('match_found');
  audioManager.vibrateDouble();
};

export const playGameStart = () => audioManager.play('game_start');

export const playRoundWin = () => {
  audioManager.play('round_win');
  audioManager.vibrateMedium();
};

export const playRoundLose = () => audioManager.play('round_lose');

export const playGameWin = () => {
  audioManager.play('game_win');
  audioManager.vibrateSuccess();
};

export const playGameLose = () => {
  audioManager.play('game_lose');
  audioManager.vibrateMedium();
};

// Sonidos de turno
export const playYourTurn = () => {
  audioManager.play('your_turn');
  audioManager.vibrateLight();
};

export const playTimerWarning = () => {
  audioManager.play('timer_warning');
  audioManager.vibrateLight();
};

export const playTimerCritical = () => {
  audioManager.play('timer_critical');
  audioManager.vibrateDouble();
};

// Sonidos de UI
export const playButtonClick = () => {
  audioManager.play('button_click');
};

export const playMenuOpen = () => audioManager.play('menu_open');
export const playMenuClose = () => audioManager.play('menu_close');
export const playNotification = () => audioManager.play('notification');
export const playError = () => {
  audioManager.play('error');
  audioManager.vibrateError();
};

// Sonidos de tienda/recompensas
export const playPurchase = () => {
  audioManager.play('purchase');
  audioManager.vibrateMedium();
};

export const playReward = () => {
  audioManager.play('reward');
  audioManager.vibrateSuccess();
};

export const playLevelUp = () => {
  audioManager.play('level_up');
  audioManager.vibrateSuccess();
};

export const playRankUp = () => {
  audioManager.play('rank_up');
  audioManager.vibrateSuccess();
};

export const playRankDown = () => audioManager.play('rank_down');

// Emotes
export const playEmoteSend = () => audioManager.play('emote_send');
export const playEmoteReceive = () => {
  audioManager.play('emote_receive');
  audioManager.vibrateLight();
};

// Conexión
export const playPlayerJoin = () => audioManager.play('player_join');
export const playPlayerLeave = () => audioManager.play('player_leave');
export const playReconnect = () => audioManager.play('reconnect');

// Música
export const playMenuMusic = () => audioManager.playMusic('menu');
export const playGameMusic = () => audioManager.playMusic('game');
export const playVictoryMusic = () => audioManager.playMusic('victory');
export const playDefeatMusic = () => audioManager.playMusic('defeat');
export const stopMusic = () => audioManager.stopMusic();
export const pauseMusic = () => audioManager.pauseMusic();
export const resumeMusic = () => audioManager.resumeMusic();

// Vibración directa
export const vibrateLight = () => audioManager.vibrateLight();
export const vibrateMedium = () => audioManager.vibrateMedium();
export const vibrateHeavy = () => audioManager.vibrateHeavy();

// Configuración
export const getAudioSettings = () => audioManager.getSettings();
export const setSoundEnabled = (v) => audioManager.setSoundEnabled(v);
export const setMusicEnabled = (v) => audioManager.setMusicEnabled(v);
export const setVibrationEnabled = (v) => audioManager.setVibrationEnabled(v);
export const setMasterVolume = (v) => audioManager.setMasterVolume(v);
export const setSoundVolume = (v) => audioManager.setSoundVolume(v);
export const setMusicVolume = (v) => audioManager.setMusicVolume(v);

// Exportar manager para uso avanzado
export default audioManager;
