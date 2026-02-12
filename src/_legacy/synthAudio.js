// ============================================================================
// GENERADOR DE SONIDOS SINTÉTICOS - DOMINÓ CUBANO
// ============================================================================
// Genera sonidos usando Web Audio API - No requiere archivos externos
// Ideal para desarrollo y como fallback

class SynthAudio {
  constructor() {
    this.ctx = null;
    this.settings = {
      soundEnabled: true,
      musicEnabled: true,
      vibrationEnabled: true,
      masterVolume: 1.0
    };
    this.unlocked = false;
    this.loadSettings();
  }
  
  // Inicializar contexto de audio (requiere interacción del usuario)
  init() {
    if (this.ctx) return true;
    
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.unlocked = true;
      console.log('[SynthAudio] ✅ Contexto de audio inicializado');
      return true;
    } catch (e) {
      console.warn('[SynthAudio] Web Audio API no disponible');
      return false;
    }
  }
  
  unlock() {
    return this.init();
  }
  
  // ========== GENERADORES DE SONIDO ==========
  
  // Crear oscilador básico
  createOscillator(type, frequency, duration, volume = 0.3) {
    if (!this.ctx || !this.settings.soundEnabled) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.value = frequency;
    
    const vol = volume * this.settings.masterVolume;
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }
  
  // Crear ruido
  createNoise(duration, volume = 0.1) {
    if (!this.ctx || !this.settings.soundEnabled) return;
    
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const source = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    
    source.buffer = buffer;
    filter.type = 'lowpass';
    filter.frequency.value = 1000;
    
    const vol = volume * this.settings.masterVolume;
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    source.start();
  }
  
  // ========== SONIDOS DEL JUEGO ==========
  
  // Colocar ficha (sonido de madera/plástico)
  playTilePlace() {
    if (!this.init()) return;
    
    // Click de madera
    this.createNoise(0.05, 0.3);
    
    // Tono bajo de impacto
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150 + Math.random() * 50, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.4 * this.settings.masterVolume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
    
    this.vibrateLight();
  }
  
  // Seleccionar ficha
  playTileSelect() {
    if (!this.init()) return;
    this.createOscillator('sine', 800, 0.05, 0.2);
    this.vibrateLight();
  }
  
  // Pasar turno
  playPass() {
    if (!this.init()) return;
    // Dos tonos descendentes
    this.createOscillator('sine', 400, 0.1, 0.2);
    setTimeout(() => {
      this.createOscillator('sine', 300, 0.15, 0.15);
    }, 100);
  }
  
  // ¡Dominó!
  playDomino() {
    if (!this.init()) return;
    
    // Fanfarria ascendente
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.createOscillator('square', freq, 0.2, 0.25);
      }, i * 100);
    });
    
    this.vibrateSuccess();
  }
  
  // Tranca
  playTranca() {
    if (!this.init()) return;
    
    // Sonido de bloqueo
    this.createOscillator('sawtooth', 200, 0.3, 0.3);
    setTimeout(() => {
      this.createOscillator('sawtooth', 150, 0.2, 0.2);
    }, 150);
    
    this.vibrateMedium();
  }
  
  // Capicúa
  playCapicua() {
    if (!this.init()) return;
    
    // Arpeggio rápido
    const notes = [523, 659, 784, 1047, 784, 659];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.createOscillator('sine', freq, 0.15, 0.2);
      }, i * 60);
    });
    
    this.vibrateSuccess();
  }
  
  // Pollona
  playPollona() {
    if (!this.init()) return;
    
    // Fanfarria épica
    const melody = [
      [392, 0.2], [392, 0.2], [392, 0.2], [523, 0.6]
    ]; // G4, G4, G4, C5
    
    let time = 0;
    melody.forEach(([freq, dur]) => {
      setTimeout(() => {
        this.createOscillator('square', freq, dur, 0.35);
        this.createOscillator('sine', freq / 2, dur, 0.2);
      }, time * 1000);
      time += dur;
    });
    
    this.vibrateHeavy();
  }
  
  // Partida encontrada
  playMatchFound() {
    if (!this.init()) return;
    
    // Sonido de "ding dong"
    this.createOscillator('sine', 880, 0.3, 0.3);
    setTimeout(() => {
      this.createOscillator('sine', 660, 0.4, 0.25);
    }, 300);
    
    this.vibrateDouble();
  }
  
  // Inicio de partida
  playGameStart() {
    if (!this.init()) return;
    
    // Redoble rápido
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.createNoise(0.03, 0.2);
      }, i * 50);
    }
    
    setTimeout(() => {
      this.createOscillator('sine', 523, 0.3, 0.3);
    }, 300);
  }
  
  // Victoria de ronda
  playRoundWin() {
    if (!this.init()) return;
    this.createOscillator('sine', 523, 0.15, 0.3);
    setTimeout(() => this.createOscillator('sine', 659, 0.15, 0.3), 150);
    setTimeout(() => this.createOscillator('sine', 784, 0.3, 0.35), 300);
    this.vibrateMedium();
  }
  
  // Derrota de ronda
  playRoundLose() {
    if (!this.init()) return;
    this.createOscillator('sine', 392, 0.2, 0.2);
    setTimeout(() => this.createOscillator('sine', 330, 0.3, 0.2), 200);
  }
  
  // Victoria de partida
  playGameWin() {
    if (!this.init()) return;
    
    // Fanfarria de victoria
    const melody = [523, 523, 523, 659, 784, 659, 784, 1047];
    const durations = [0.1, 0.1, 0.1, 0.3, 0.1, 0.1, 0.1, 0.5];
    
    let time = 0;
    melody.forEach((freq, i) => {
      setTimeout(() => {
        this.createOscillator('square', freq, durations[i], 0.25);
        this.createOscillator('sine', freq, durations[i], 0.15);
      }, time * 1000);
      time += durations[i] + 0.05;
    });
    
    this.vibrateSuccess();
  }
  
  // Derrota de partida
  playGameLose() {
    if (!this.init()) return;
    
    const melody = [392, 370, 349, 330];
    melody.forEach((freq, i) => {
      setTimeout(() => {
        this.createOscillator('sine', freq, 0.3, 0.2);
      }, i * 300);
    });
  }
  
  // Tu turno
  playYourTurn() {
    if (!this.init()) return;
    this.createOscillator('sine', 660, 0.1, 0.25);
    setTimeout(() => this.createOscillator('sine', 880, 0.15, 0.25), 100);
    this.vibrateLight();
  }
  
  // Advertencia de tiempo
  playTimerWarning() {
    if (!this.init()) return;
    this.createOscillator('sine', 440, 0.1, 0.3);
  }
  
  // Tiempo crítico
  playTimerCritical() {
    if (!this.init()) return;
    this.createOscillator('square', 880, 0.08, 0.35);
    setTimeout(() => this.createOscillator('square', 880, 0.08, 0.35), 150);
    this.vibrateDouble();
  }
  
  // Click de botón
  playButtonClick() {
    if (!this.init()) return;
    this.createOscillator('sine', 600, 0.03, 0.15);
  }
  
  // Abrir menú
  playMenuOpen() {
    if (!this.init()) return;
    this.createOscillator('sine', 400, 0.05, 0.1);
    setTimeout(() => this.createOscillator('sine', 600, 0.08, 0.1), 50);
  }
  
  // Cerrar menú
  playMenuClose() {
    if (!this.init()) return;
    this.createOscillator('sine', 600, 0.05, 0.1);
    setTimeout(() => this.createOscillator('sine', 400, 0.08, 0.1), 50);
  }
  
  // Notificación
  playNotification() {
    if (!this.init()) return;
    this.createOscillator('sine', 880, 0.1, 0.2);
    setTimeout(() => this.createOscillator('sine', 1100, 0.15, 0.2), 100);
  }
  
  // Error
  playError() {
    if (!this.init()) return;
    this.createOscillator('sawtooth', 200, 0.15, 0.3);
    setTimeout(() => this.createOscillator('sawtooth', 150, 0.2, 0.25), 150);
    this.vibrateError();
  }
  
  // Compra
  playPurchase() {
    if (!this.init()) return;
    // Sonido de monedas
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        this.createOscillator('sine', 2000 + Math.random() * 1000, 0.05, 0.15);
      }, i * 50);
    }
    setTimeout(() => this.createOscillator('sine', 880, 0.2, 0.2), 250);
    this.vibrateMedium();
  }
  
  // Recompensa
  playReward() {
    if (!this.init()) return;
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => this.createOscillator('sine', freq, 0.15, 0.25), i * 80);
    });
    this.vibrateSuccess();
  }
  
  // Subir de nivel
  playLevelUp() {
    if (!this.init()) return;
    const melody = [523, 659, 784, 1047, 1319];
    melody.forEach((freq, i) => {
      setTimeout(() => {
        this.createOscillator('square', freq, 0.12, 0.2);
        this.createOscillator('sine', freq, 0.12, 0.15);
      }, i * 100);
    });
    this.vibrateSuccess();
  }
  
  // Subir de rango
  playRankUp() {
    if (!this.init()) return;
    // Fanfarria épica
    setTimeout(() => this.playLevelUp(), 0);
    setTimeout(() => {
      this.createOscillator('sine', 1568, 0.5, 0.3);
    }, 600);
    this.vibrateSuccess();
  }
  
  // Bajar de rango
  playRankDown() {
    if (!this.init()) return;
    this.createOscillator('sine', 392, 0.3, 0.2);
    setTimeout(() => this.createOscillator('sine', 330, 0.4, 0.2), 300);
  }
  
  // Enviar emote
  playEmoteSend() {
    if (!this.init()) return;
    this.createOscillator('sine', 500, 0.05, 0.15);
  }
  
  // Recibir emote
  playEmoteReceive() {
    if (!this.init()) return;
    this.createOscillator('sine', 800, 0.08, 0.15);
    this.vibrateLight();
  }
  
  // Jugador se une
  playPlayerJoin() {
    if (!this.init()) return;
    this.createOscillator('sine', 440, 0.1, 0.15);
    setTimeout(() => this.createOscillator('sine', 550, 0.15, 0.15), 100);
  }
  
  // Jugador se va
  playPlayerLeave() {
    if (!this.init()) return;
    this.createOscillator('sine', 550, 0.1, 0.15);
    setTimeout(() => this.createOscillator('sine', 440, 0.15, 0.15), 100);
  }
  
  // Reconexión
  playReconnect() {
    if (!this.init()) return;
    this.createOscillator('sine', 440, 0.1, 0.2);
    setTimeout(() => this.createOscillator('sine', 660, 0.1, 0.2), 150);
    setTimeout(() => this.createOscillator('sine', 880, 0.2, 0.25), 300);
  }
  
  // ========== VIBRACIÓN ==========
  
  vibrate(pattern) {
    if (!this.settings.vibrationEnabled) return;
    if (!navigator.vibrate) return;
    try {
      navigator.vibrate(pattern);
    } catch (e) {}
  }
  
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
    this.saveSettings();
  }
  
  setVibrationEnabled(enabled) {
    this.settings.vibrationEnabled = enabled;
    this.saveSettings();
  }
  
  setMasterVolume(volume) {
    this.settings.masterVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }
  
  getSettings() {
    return { ...this.settings };
  }
}

// Instancia global
const synthAudio = new SynthAudio();

// Exportar funciones de conveniencia
export const initAudio = () => synthAudio.init();
export const unlockAudio = () => synthAudio.unlock();

// Sonidos de fichas
export const playTilePlace = () => synthAudio.playTilePlace();
export const playTileSelect = () => synthAudio.playTileSelect();

// Sonidos de juego
export const playPass = () => synthAudio.playPass();
export const playDomino = () => synthAudio.playDomino();
export const playTranca = () => synthAudio.playTranca();
export const playCapicua = () => synthAudio.playCapicua();
export const playPollona = () => synthAudio.playPollona();

// Sonidos de partida
export const playMatchFound = () => synthAudio.playMatchFound();
export const playGameStart = () => synthAudio.playGameStart();
export const playRoundWin = () => synthAudio.playRoundWin();
export const playRoundLose = () => synthAudio.playRoundLose();
export const playGameWin = () => synthAudio.playGameWin();
export const playGameLose = () => synthAudio.playGameLose();

// Sonidos de turno
export const playYourTurn = () => synthAudio.playYourTurn();
export const playTimerWarning = () => synthAudio.playTimerWarning();
export const playTimerCritical = () => synthAudio.playTimerCritical();

// Sonidos de UI
export const playButtonClick = () => synthAudio.playButtonClick();
export const playMenuOpen = () => synthAudio.playMenuOpen();
export const playMenuClose = () => synthAudio.playMenuClose();
export const playNotification = () => synthAudio.playNotification();
export const playError = () => synthAudio.playError();

// Sonidos de tienda/recompensas
export const playPurchase = () => synthAudio.playPurchase();
export const playReward = () => synthAudio.playReward();
export const playLevelUp = () => synthAudio.playLevelUp();
export const playRankUp = () => synthAudio.playRankUp();
export const playRankDown = () => synthAudio.playRankDown();

// Emotes
export const playEmoteSend = () => synthAudio.playEmoteSend();
export const playEmoteReceive = () => synthAudio.playEmoteReceive();

// Conexión
export const playPlayerJoin = () => synthAudio.playPlayerJoin();
export const playPlayerLeave = () => synthAudio.playPlayerLeave();
export const playReconnect = () => synthAudio.playReconnect();

// Vibración
export const vibrateLight = () => synthAudio.vibrateLight();
export const vibrateMedium = () => synthAudio.vibrateMedium();
export const vibrateHeavy = () => synthAudio.vibrateHeavy();

// Configuración
export const getAudioSettings = () => synthAudio.getSettings();
export const setSoundEnabled = (v) => synthAudio.setSoundEnabled(v);
export const setMusicEnabled = (v) => synthAudio.setMusicEnabled(v);
export const setVibrationEnabled = (v) => synthAudio.setVibrationEnabled(v);
export const setMasterVolume = (v) => synthAudio.setMasterVolume(v);

export default synthAudio;
