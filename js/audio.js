// Audio Manager (ES Module)
export class AudioManager {
  constructor() {
    this.audioContext = null;
    this.sounds = {};
    this.musicVolume = 0.3;
    this.sfxVolume = 0.5;
    this.masterVolume = 0.5;
    this.currentMusic = null;
    this.audioInitialized = false;
    this._prefMusicEnabled = true;
    this._prefSfxEnabled = true;
  }

  async init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      await this._createSounds();
      this.audioInitialized = true;
      console.log('✅ Áudio inicializado (AudioManager)');
    } catch (e) {
      console.warn('⚠️ Áudio não disponível:', e);
    }
  }

  getPrefs() {
    return {
      musicEnabled: this._prefMusicEnabled,
      sfxEnabled: this._prefSfxEnabled,
      masterVolume: this.masterVolume,
    };
  }

  setPrefs({ musicEnabled, sfxEnabled, masterVolume }) {
    if (typeof musicEnabled === 'boolean') this._prefMusicEnabled = musicEnabled;
    if (typeof sfxEnabled === 'boolean') this._prefSfxEnabled = sfxEnabled;
    if (typeof masterVolume === 'number') this.masterVolume = Math.max(0, Math.min(1, masterVolume));
  }

  // --- Música ---
  playMusic(musicName) {
    if (!this.audioInitialized || !this.sounds[musicName] || !this.audioContext) return;
    if (this._prefMusicEnabled === false) return;

    this.stopMusic();
    const music = this.sounds[musicName];

    music.oscillators = [];
    music.gainNodes = [];
    music.intervals = [];

    const chords = this._getMusicChords(music.type);
    try {
      chords.forEach((freq, index) => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filterNode = this.audioContext.createBiquadFilter();

        oscillator.type = index % 2 === 0 ? 'sine' : 'triangle';
        oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);

        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(800, this.audioContext.currentTime);

        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);

        oscillator.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        music.oscillators.push(oscillator);
        music.gainNodes.push(gainNode);
      });

      music.oscillators.forEach((osc, index) => {
        osc.start(this.audioContext.currentTime);
        const gain = music.gainNodes[index];
        gain.gain.setValueAtTime(0, this.audioContext.currentTime);
        gain.gain.linearRampToValueAtTime(this.musicVolume * 0.1 * this.masterVolume, this.audioContext.currentTime + 2);

        const id = setInterval(() => {
          if (music.isPlaying) {
            const variation = 0.98 + Math.random() * 0.04;
            try {
              osc.frequency.setValueAtTime(
                osc.frequency.value * variation,
                this.audioContext.currentTime
              );
            } catch {}
          }
        }, 2000 + Math.random() * 2000);
        music.intervals.push(id);
      });

      music.isPlaying = true;
      this.currentMusic = music;
    } catch (error) {
      console.warn('⚠️ Erro ao tocar música:', error);
    }
  }

  stopMusic() {
    if (this.currentMusic && this.currentMusic.isPlaying) {
      try {
        this.currentMusic.gainNodes.forEach(gain => {
          try { gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 1); } catch(e) {}
        });

        const toStopOsc = this.currentMusic.oscillators;
        const toStopGains = this.currentMusic.gainNodes;
        const toClearIntervals = this.currentMusic.intervals || [];

        this.currentMusic.isPlaying = false;

        setTimeout(() => {
          toStopOsc.forEach(osc => {
            try {
              osc.stop();
              osc.disconnect();
            } catch(e) {}
          });
          toStopGains.forEach(g => {
            try {
              g.disconnect();
            } catch(e) {}
          });
          toClearIntervals.forEach(id => clearInterval(id));
        }, 1000);

        this.currentMusic.oscillators = [];
        this.currentMusic.gainNodes = [];
        this.currentMusic.intervals = [];

      } catch (error) {
        console.warn('⚠️ Erro ao parar música:', error);
      }
    }
  }

  // --- SFX ---
  playSound(soundName) {
    if (!this.audioInitialized || !this.sounds[soundName]) return;
    if (this._prefSfxEnabled === false) return;
    try {
      const originalVolume = this.masterVolume;
      this.sounds[soundName](originalVolume * 0.7);
    } catch (error) {
      console.warn(`⚠️ Erro ao tocar som ${soundName}:`, error);
    }
  }

  async _createSounds() {
    this.sounds = {
      menuMusic: this._createAmbientMusic(220, 'menu'),
      gameMusic: this._createAmbientMusic(174, 'game'),
      chaseMusic: this._createAmbientMusic(196, 'chase'),
      victoryMusic: this._createAmbientMusic(261, 'victory'),

      footstep: this._createFootstepSound(),
      runFootstep: this._createRunFootstepSound(),
      minotaurRoar: this._createMinotaurRoar(),
      threadActivate: this._createThreadSound(),
      portalEnter: this._createPortalSound(),
      levelComplete: this._createLevelCompleteSound(),
      gameOver: this._createGameOverSound(),
      buttonClick: this._createButtonClickSound(),
      minotaurAttack: this._createMinotaurAttackSound(),
      heartbeat: this._createHeartbeatSound(),
    };
  }

  _createAmbientMusic(baseFreq, type) {
    if (!this.audioContext) return null;
    const music = { oscillators: [], gainNodes: [], intervals: [], isPlaying: false, type };
    const chords = this._getMusicChords(type);
    chords.forEach((freq, index) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      const filterNode = this.audioContext.createBiquadFilter();
      oscillator.type = index % 2 === 0 ? 'sine' : 'triangle';
      oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(800, this.audioContext.currentTime);
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      oscillator.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      music.oscillators.push(oscillator);
      music.gainNodes.push(gainNode);
    });
    return music;
  }

  _getMusicChords(type) {
    switch (type) {
      case 'menu': return [220, 261, 329, 392];
      case 'game': return [174, 207, 261, 311];
      case 'chase': return [196, 233, 294, 349];
      case 'victory': return [261, 329, 392, 523];
      default: return [220, 261, 329, 392];
    }
  }

  _createFootstepSound() {
    return () => {
      if (!this.audioContext) return;
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      const filterNode = this.audioContext.createBiquadFilter();
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(80, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(40, this.audioContext.currentTime + 0.1);
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(200, this.audioContext.currentTime);
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.sfxVolume * 0.2, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
      oscillator.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.1);
    };
  }

  _createRunFootstepSound() {
    return () => {
      if (!this.audioContext) return;
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(120, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(60, this.audioContext.currentTime + 0.05);
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.sfxVolume * 0.3, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.05);
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.05);
    };
  }

  _createMinotaurRoar() {
    return () => {
      if (!this.audioContext) return;
      const oscillator1 = this.audioContext.createOscillator();
      const oscillator2 = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      const filterNode = this.audioContext.createBiquadFilter();
      oscillator1.type = 'sawtooth';
      oscillator1.frequency.setValueAtTime(50, this.audioContext.currentTime);
      oscillator1.frequency.exponentialRampToValueAtTime(30, this.audioContext.currentTime + 0.5);
      oscillator2.type = 'square';
      oscillator2.frequency.setValueAtTime(75, this.audioContext.currentTime);
      oscillator2.frequency.exponentialRampToValueAtTime(45, this.audioContext.currentTime + 0.5);
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(300, this.audioContext.currentTime);
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.sfxVolume * 0.6, this.audioContext.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(this.sfxVolume * 0.4, this.audioContext.currentTime + 0.3);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
      oscillator1.connect(filterNode);
      oscillator2.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      oscillator1.start(this.audioContext.currentTime);
      oscillator2.start(this.audioContext.currentTime);
      oscillator1.stop(this.audioContext.currentTime + 0.5);
      oscillator2.stop(this.audioContext.currentTime + 0.5);
    };
  }

  _createThreadSound() {
    return () => {
      if (!this.audioContext) return;
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(880, this.audioContext.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.sfxVolume * 0.3, this.audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.2);
    };
  }

  _createPortalSound() {
    return () => {
      if (!this.audioContext) return;
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          const oscillator = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(200 + i * 100, this.audioContext.currentTime);
          gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(this.sfxVolume * 0.2, this.audioContext.currentTime + 0.1);
          gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
          oscillator.connect(gainNode);
          gainNode.connect(this.audioContext.destination);
          oscillator.start(this.audioContext.currentTime);
          oscillator.stop(this.audioContext.currentTime + 0.3);
        }, i * 50);
      }
    };
  }

  _createLevelCompleteSound() {
    return () => {
      if (!this.audioContext) return;
      const frequencies = [261, 329, 392, 523];
      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          const oscillator = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();
          oscillator.type = 'triangle';
          oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
          gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(this.sfxVolume * 0.4, this.audioContext.currentTime + 0.1);
          gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1);
          oscillator.connect(gainNode);
          gainNode.connect(this.audioContext.destination);
          oscillator.start(this.audioContext.currentTime);
          oscillator.stop(this.audioContext.currentTime + 1);
        }, index * 100);
      });
    };
  }

  _createGameOverSound() {
    return () => {
      if (!this.audioContext) return;
      const frequencies = [220, 207, 196, 174];
      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          const oscillator = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();
          oscillator.type = 'sawtooth';
          oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
          gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(this.sfxVolume * 0.3, this.audioContext.currentTime + 0.2);
          gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.8);
          oscillator.connect(gainNode);
          gainNode.connect(this.audioContext.destination);
          oscillator.start(this.audioContext.currentTime);
          oscillator.stop(this.audioContext.currentTime + 0.8);
        }, index * 200);
      });
    };
  }

  _createButtonClickSound() {
    return () => {
      if (!this.audioContext) return;
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.sfxVolume * 0.2, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.1);
    };
  }

  _createMinotaurAttackSound() {
    return () => {
      if (!this.audioContext) return;
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      const filterNode = this.audioContext.createBiquadFilter();
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);
      oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.3);
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(500, this.audioContext.currentTime);
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.sfxVolume * 0.7, this.audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
      oscillator.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.3);
    };
  }

  _createHeartbeatSound() {
    return () => {
      if (!this.audioContext) return;
      for (let i = 0; i < 2; i++) {
        setTimeout(() => {
          const oscillator = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(60, this.audioContext.currentTime);
          gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(this.sfxVolume * 0.4, this.audioContext.currentTime + 0.05);
          gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
          oscillator.connect(gainNode);
          gainNode.connect(this.audioContext.destination);
          oscillator.start(this.audioContext.currentTime);
          oscillator.stop(this.audioContext.currentTime + 0.2);
        }, i * 150);
      }
    };
  }
}
