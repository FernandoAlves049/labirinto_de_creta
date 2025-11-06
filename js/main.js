// JOGO LABIRINTO DE CRETA - VERSÃO SIMPLIFICADA
import { astarGridPath as astar } from './pathfinding.js';
import { generateMazeDynamic, isWall as mazeIsWall, createAdditionalPaths as createExtraPaths, carveMaze as carveMazeAlgo } from './maze.js';
import { AudioManager } from './audio.js';
export class LabirintoDeCreta {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameState = 'menu';
        this.level = 1;
        this.startTime = 0;
        this.gameTime = 0;
        this.maze = null;
        this.player = { x: 1.5, y: 1.5, r: 0.3, trail: [] };
    this.minotaur = { x: 1.5, y: 1.5, state: 'PATROL', vx: 0, vy: 0, lastDir: 0, path: [], nextRepath: 0, pathGoal: null };
        this.keys = new Set();
        this.threadActive = false;
        this.isRunning = false; // Estado de corrida
        this.isTransitioning = false; // Estado de transição entre níveis
        this.cellSize = 30;
        
        // 🎵 ÁUDIO via AudioManager
        this.audio = new AudioManager();
        this.lastTime = 0;
        this.gameLoop = null;
        // Volume mestre padrão (evita NaN antes do controle de volume iniciar)
        this.masterVolume = 0.5;
    }

    init() {
        this.setupEventListeners();
        // Inicializa áudio modular e sincroniza preferências
        this.audio.init().then(() => {
            this.audio.setPrefs({
                musicEnabled: this._prefMusicEnabled ?? true,
                sfxEnabled: this._prefSfxEnabled ?? true,
                masterVolume: this.masterVolume ?? 0.5,
            });
        });
        // Forçar tema escuro permanente (sem alternância)
        try {
            this._prefDarkMode = true;
            this._setDarkStylesheet(true);
        } catch {}
        this.showLoadingProgress();
    }

    // 🎵 SISTEMA DE ÁUDIO COMPLETO
    async initAudio() {
        console.log('🎵 Inicializando sistema de áudio...');
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Criar todas as trilhas e efeitos sonoros
                await this.audio.createSounds();
            
            this.audioInitialized = true;
            console.log('✅ Sistema de áudio inicializado!');
            
        } catch (error) {
            console.warn('⚠️ Áudio não disponível:', error);
        }
    }

    async createSounds() {
        // 🎵 TRILHAS SONORAS PROCEDURAIS
        this.sounds = {
            // Músicas de fundo
            menuMusic: this.createAmbientMusic(220, 'menu'), // Lá menor - misterioso
            gameMusic: this.createAmbientMusic(174, 'game'), // Fá menor - tensão
            chaseMusic: this.createAmbientMusic(196, 'chase'), // Sol menor - perseguição
            victoryMusic: this.createAmbientMusic(261, 'victory'), // Dó maior - vitória
            
            // Efeitos sonoros
            footstep: this.createFootstepSound(),
            runFootstep: this.createRunFootstepSound(),
            minotaurRoar: this.createMinotaurRoar(),
            threadActivate: this.createThreadSound(),
            portalEnter: this.createPortalSound(),
            levelComplete: this.createLevelCompleteSound(),
            gameOver: this.createGameOverSound(),
            buttonClick: this.createButtonClickSound(),
            minotaurAttack: this.createMinotaurAttackSound(),
            heartbeat: this.createHeartbeatSound()
        };
        
        console.log('🎵 Todas as trilhas e efeitos criados!');
    }

    createAmbientMusic(baseFreq, type) {
        if (!this.audioContext) return null;
        
        const music = {
            oscillators: [],
            gainNodes: [],
            intervals: [],
            isPlaying: false,
            type: type
        };
        
        // Criar música ambiente baseada no tipo
        const chords = this.getMusicChords(type);
        
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

    getMusicChords(type) {
        switch(type) {
            case 'menu':
                return [220, 261, 329, 392]; // Lá menor - ambiente misterioso
            case 'game':
                return [174, 207, 261, 311]; // Fá menor - tensão constante
            case 'chase':
                return [196, 233, 294, 349]; // Sol menor - perseguição intensa
            case 'victory':
                return [261, 329, 392, 523]; // Dó maior - vitória gloriosa
            default:
                return [220, 261, 329, 392];
        }
    }

    createFootstepSound() {
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

    createRunFootstepSound() {
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

    createMinotaurRoar() {
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

    createThreadSound() {
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

    createPortalSound() {
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

    createLevelCompleteSound() {
        return () => {
            if (!this.audioContext) return;
            
            const frequencies = [261, 329, 392, 523]; // Acorde de Dó maior
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

    createGameOverSound() {
        return () => {
            if (!this.audioContext) return;
            
            const frequencies = [220, 207, 196, 174]; // Descida triste
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

    createButtonClickSound() {
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

    createMinotaurAttackSound() {
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

    createHeartbeatSound() {
        return () => {
            if (!this.audioContext) return;
            
            // Batida dupla do coração
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

    // 🎵 CONTROLE DE MÚSICA
    playMusic(musicName) {
    if (!this.audioInitialized || !this.sounds[musicName] || !this.audioContext) return;
    if (this._prefMusicEnabled === false) return;

        // Parar música atual com fade-out
    this.audio.stopMusic();

        const music = this.sounds[musicName];

        // Recriar nós (oscillators/gain) sempre que tocar, para evitar start() duplo
        music.oscillators = [];
        music.gainNodes = [];
        music.intervals = [];

        const chords = this.getMusicChords(music.type);
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

            // Iniciar com fade-in e variações sutis
            music.oscillators.forEach((osc, index) => {
                osc.start(this.audioContext.currentTime);
                const gain = music.gainNodes[index];
                gain.gain.setValueAtTime(0, this.audioContext.currentTime);
                gain.gain.linearRampToValueAtTime(this.musicVolume * 0.1 * this.masterVolume, this.audioContext.currentTime + 2);

                const id = setInterval(() => {
                    if (music.isPlaying) {
                        const variation = 0.98 + Math.random() * 0.04;
                        osc.frequency.setValueAtTime(
                            osc.frequency.value * variation,
                            this.audioContext.currentTime
                        );
                    }
                }, 2000 + Math.random() * 2000);
                music.intervals.push(id);
            });

            music.isPlaying = true;
            this.currentMusic = music;
            console.log(`🎵 Tocando música: ${musicName}`);
        } catch (error) {
            console.warn('⚠️ Erro ao tocar música:', error);
        }
    }

    stopCurrentMusic() {
        if (this.currentMusic && this.currentMusic.isPlaying) {
            try {
                // Fade-out
                this.currentMusic.gainNodes.forEach(gain => {
                    try { gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 1); } catch(e) {}
                });

                // Capturar referências atuais para evitar interferir em futuros replays
                const toStopOsc = [...this.currentMusic.oscillators];
                const toStopGains = [...this.currentMusic.gainNodes];
                const toClearIntervals = this.currentMusic.intervals ? [...this.currentMusic.intervals] : [];

                this.currentMusic.isPlaying = false;

                setTimeout(() => {
                    toStopOsc.forEach(osc => { try { osc.stop(); osc.disconnect(); } catch(e) {} });
                    toStopGains.forEach(g => { try { g.disconnect(); } catch(e) {} });
                    toClearIntervals.forEach(id => clearInterval(id));
                }, 1000);

            } catch (error) {
                console.warn('⚠️ Erro ao parar música:', error);
            }
        }
    }

    // 🔊 TOCAR EFEITOS SONOROS
    playSound(soundName) {
    if (!this.audioInitialized || !this.sounds[soundName]) return;
    if (this._prefSfxEnabled === false) return;
        
        try {
            // Aplicar volume mestre aos efeitos sonoros
            const originalVolume = this.masterVolume;
            this.sounds[soundName](originalVolume * 0.7); // 70% do volume mestre para efeitos
        } catch (error) {
            console.warn(`⚠️ Erro ao tocar som ${soundName}:`, error);
        }
    }

    showLoadingProgress() {
        let progress = 0;
        const messages = [
            'Carregando recursos...',
            'Configurando labirinto...',
            'Preparando Minotauro...',
            'Inicializando áudio... 🎵',
            'Pronto para a aventura!'
        ];

        const interval = setInterval(() => {
            progress += 20;
            document.getElementById('loading-progress').style.width = `${progress}%`;
            document.getElementById('loading-text').textContent = messages[Math.floor(progress / 20) - 1] || messages[0];

            // 🎵 Testar áudio na última etapa
            if (progress === 80 && this.audio?.audioInitialized) {
                this.audio.playSound('buttonClick');
                console.log('🎵 Áudio testado com sucesso!');
            }

            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    this.showScreen('menu');
                    this.audio.playMusic('menuMusic'); // 🎵 Música do menu
                }, 1000);
            }
        }, 500);
    }

    // 🏗️ RENDERIZAÇÃO DE PAREDES 3D COM TEXTURAS REAIS
    drawWall3D(x, y, size, gridX, gridY) {
        const wallHeight = size * 0.7; // Altura da parede aumentada (70%)
        const sideOffset = size * 0.2; // Offset 3D aumentado
        
        // � ESCOLHER TEXTURA BASEADA NA POSIÇÃO
        const useOrnate = (gridX + gridY) % 4 === 0; // 25% das paredes ornamentadas
        const wallTexture = useOrnate ? this.textures.wallOrnate : this.textures.wallSimple;
        
        // �🌌 BASE DA PAREDE (FUNDAÇÃO)
        if (this.texturesLoaded && this.textures.floorDetailed) {
            // Usar textura de chão para a base
            const pattern = this.ctx.createPattern(this.textures.floorDetailed, 'repeat');
            this.ctx.fillStyle = pattern;
        } else {
            // Fallback: gradiente
            const baseGradient = this.ctx.createRadialGradient(
                x + size/2, y + size - wallHeight/2,
                0,
                x + size/2, y + size - wallHeight/2,
                size/2
            );
            baseGradient.addColorStop(0, '#5d4e75'); // Roxo pedra
            baseGradient.addColorStop(0.7, '#4a4a4a'); // Cinza escuro
            baseGradient.addColorStop(1, '#2a2a2a'); // Cinza mais escuro
            this.ctx.fillStyle = baseGradient;
        }
        this.ctx.fillRect(x, y + size - wallHeight, size, wallHeight);
        
    }

    // 🧱 RENDERIZAÇÃO DE PAREDES 2D SIMPLES  
    drawWall2D(x, y, size, gridX, gridY) {
        // 🎨 ESCOLHER TEXTURA BASEADA NA POSIÇÃO
        const useOrnate = (gridX + gridY) % 4 === 0; // 25% das paredes ornamentadas
        const wallTexture = useOrnate ? this.textures.wallOrnate : this.textures.wallSimple;
        
        if (this.texturesLoaded && wallTexture) {
            // 🎨 USAR TEXTURA DA PAREDE
            const pattern = this.ctx.createPattern(wallTexture, 'repeat');
            this.ctx.fillStyle = pattern;
            this.ctx.fillRect(x, y, size, size);
            
            // ✨ ADICIONAR LEVE BORDA PARA DEFINIÇÃO
            this.ctx.strokeStyle = '#b7950b';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x, y, size, size);
        } else {
            // 🌆 FALLBACK: GRADIENTE DOURADO SIMPLES
            const wallGradient = this.ctx.createLinearGradient(
                x, y,
                x + size, y + size
            );
            wallGradient.addColorStop(0, '#fbbf24'); // Dourado claro
            wallGradient.addColorStop(0.5, '#f59e0b'); // Dourado médio
            wallGradient.addColorStop(1, '#d97706'); // Dourado escuro
            this.ctx.fillStyle = wallGradient;
            this.ctx.fillRect(x, y, size, size);
            
            // Borda das paredes para definição
            this.ctx.strokeStyle = '#92400e';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x, y, size, size);
        }
    }

    showScreen(screenName) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(`${screenName}-screen`).classList.add('active');
        
        // Controlar visibilidade do HUD
        const hud = document.querySelector('.game-hud');
        if (screenName === 'game') {
            // HUD fica oculto durante o jogo
            hud.classList.remove('show');
            if (!this.canvas) {
                this.initGame();
            }
        } else {
            // HUD fica oculto em outras telas também
            hud.classList.remove('show');
        }
    }

    showOverlay(overlayName) {
        document.getElementById(`${overlayName}-overlay`).style.display = 'flex';
    }

    toggleHUD(show = false) {
        const hud = document.querySelector('.game-hud');
        if (show) {
            hud.classList.add('show');
        } else {
            hud.classList.remove('show');
        }
    }

    hideOverlay(overlayName) {
        document.getElementById(`${overlayName}-overlay`).style.display = 'none';
    }

    setupEventListeners() {
        // Menu buttons
        document.getElementById('btn-start-game').addEventListener('click', () => {
            this.startNewGame();
        });

        document.getElementById('btn-help').addEventListener('click', () => {
            this.showHelp();
        });

        document.getElementById('btn-settings').addEventListener('click', () => {
            this.audio.playSound('buttonClick'); // 🔊 Som de clique
            this.showSettings();
        });

        // Abrir seletor de níveis
        const btnLevels = document.getElementById('btn-levels');
        if (btnLevels) btnLevels.addEventListener('click', () => {
            const overlay = document.getElementById('level-select-overlay');
            if (overlay) overlay.classList.add('active');
            // refresh grid via LevelSelector if disponível
            if (window.LevelSelector) window.LevelSelector.refresh();
        });

        // Game over buttons
        document.getElementById('btn-retry').addEventListener('click', () => {
            this.audio.playSound('buttonClick'); // 🔊 Som de clique
            this.hideOverlay('gameover');
            this.restartLevel();
        });

        document.getElementById('btn-menu-from-gameover').addEventListener('click', () => {
            this.audio.playSound('buttonClick'); // 🔊 Som de clique
            this.hideOverlay('gameover');
            this.showScreen('menu');
            this.audio.playMusic('menuMusic'); // 🎵 Música do menu
            this.stopGame();
        });

        // Victory buttons
        document.getElementById('btn-next-level').addEventListener('click', () => {
            this.audio.playSound('buttonClick'); // 🔊 Som de clique
            this.hideOverlay('victory');
            this.startLevelTransition();
        });

        document.getElementById('btn-menu-from-victory').addEventListener('click', () => {
            this.audio.playSound('buttonClick'); // 🔊 Som de clique
            this.hideOverlay('victory');
            this.showScreen('menu');
            this.audio.playMusic('menuMusic'); // 🎵 Música do menu
            this.stopGame();
        });

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.keys.add(e.code);
            if (e.code === 'Escape' && this.gameState === 'playing') {
                this.showScreen('menu');
                this.stopGame();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys.delete(e.code);
        });
        
        // 🔊 CONTROLE DE VOLUME HUMORÍSTICO
        this.setupVolumeControl();

        // Sem alternância de tema (botão removido do HTML)
    }

    // 🎨 Tema fixo (escuro) — funções de alternância removidas

    _setDarkStylesheet(enable) {
        let link = document.getElementById('dark-theme-css');
        if (!link) {
            // cria link se não existir
            link = document.createElement('link');
            link.id = 'dark-theme-css';
            link.rel = 'stylesheet';
            link.href = 'css/dark.css';
            document.head.appendChild(link);
        }
        // Sempre ativo
        link.disabled = false;
        link.removeAttribute('disabled');
    }

    // 🎨 SISTEMA DE CARREGAMENTO DE TEXTURAS
    loadTextures() {
        const textureData = {
            // Texturas de chão (primeiras duas imagens)
            floorSimple: 'data:image/png;base64,', // Você vai colar o base64 aqui
            floorDetailed: 'data:image/png;base64,', // Segunda textura de chão
            
            // Texturas de parede (últimas duas imagens) 
            wallSimple: 'data:image/png;base64,', // Terceira textura
            wallOrnate: 'data:image/png;base64,' // Quarta textura mais ornamentada
        };
        
        let loadedCount = 0;
        const totalTextures = Object.keys(textureData).length;
        
        Object.keys(textureData).forEach(key => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                loadedCount++;
                console.log(`🎨 Textura carregada: ${key} (${loadedCount}/${totalTextures})`);
                
                if (loadedCount === totalTextures) {
                    this.texturesLoaded = true;
                    console.log('🎨✨ Todas as texturas carregadas com sucesso!');
                }
            };
            
            img.onerror = () => {
                console.warn(`⚠️ Erro ao carregar textura: ${key}`);
                // Usar cor sólida como fallback
                this.textures[key] = null;
            };
            
            // Por enquanto, vamos usar gradientes como placeholder
            // img.src = textureData[key];
            this.textures[key] = img;
        });
        
        // Simular carregamento imediato para teste
        this.texturesLoaded = true;
        console.log('🎨 Sistema de texturas inicializado!');
    }

    // 🔊 CONTROLE DE VOLUME HUMORÍSTICO
    setupVolumeControl() {
        const slider = document.getElementById('volumeSlider');
        const emoji = document.getElementById('volumeEmoji');
        const joke = document.getElementById('volumeJoke');
        const btn = document.getElementById('btn-volume');
        const hudVolume = btn ? btn.closest('.hud-volume') : null;
        
        const jokes = [
            "Shhh... O Minotauro pode te ouvir! 😈",
            "Volume perfeito para acordar vizinhos! 😂",
            "Agora sim, pra incomodar geral! 😎",
            "Tá baixinho... O que você é, um ninja? 🥷",
            "No mínimo pra não assustar o gato 😿",
            "Mudo?! Como vai ouvir o Minotauro chegando? 😱",
            "Volume de biblioteca... Que chato! 😴",
            "Normal... Que sem graça é isso? 😑",
            "Alto! Agora sim, pra acordar o prédio! 😄",
            "MÁXIMO! RIP fones de ouvido! 🔥"
        ];
        
        const updateVolume = (value) => {
            this.masterVolume = value / 100;
            
            // Atualizar volume de músicas ativas
            if (this.currentMusic) {
                this.currentMusic.volume = this.masterVolume * 0.3;
            }
            
            // Emoji baseado no volume
            if (value === 0) emoji.textContent = '🔇';
            else if (value < 20) emoji.textContent = '🔈';
            else if (value < 60) emoji.textContent = '🔉';
            else emoji.textContent = '🔊';
            
            // Piada baseada no volume
            const jokeIndex = Math.floor(value / 10);
            joke.textContent = jokes[Math.min(jokeIndex, jokes.length - 1)];
            
            // Som de feedback
            if (this.audioInitialized) {
                this.audio.playSound('buttonClick');
            }
        };
        
        slider.addEventListener('input', (e) => {
            updateVolume(parseInt(e.target.value));
        });
        
        // Inicializar com volume padrão
        updateVolume(50);
        
        // Toggle do popover
        if (btn && hudVolume) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                hudVolume.classList.toggle('open');
            });

            // Fechar ao clicar fora
            document.addEventListener('click', (e) => {
                if (hudVolume.classList.contains('open') && !hudVolume.contains(e.target)) {
                    hudVolume.classList.remove('open');
                }
            });
        }

        console.log('🔊 Controle de volume no HUD ativado!');
    }

    initGame() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Canvas inicial pequeno - vai crescer com os níveis
        this.canvas.width = 600;
        this.canvas.height = 450;
        this.canvas.style.width = '600px';
        this.canvas.style.height = '450px';
        
        console.log('🎮 Canvas inicializado: 600x450px (cresce com níveis)');
        
        // 🎨 INICIALIZAR SISTEMA DE TEXTURAS
        this.initTextures();
        
        // Ajustar canvas para responsividade apenas
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Forçar HUD aparecer
        const hud = document.querySelector('.game-hud');
        if (hud) {
            hud.style.display = 'flex';
            console.log('🗺️ HUD inicializado!');
        }
    }

    // 🎨 SISTEMA DE TEXTURAS DALL-E
    initTextures() {
        this.textures = {
            floorSimple: null,
            floorDetailed: null, 
            wallSimple: null,
            wallOrnate: null
        };
        
        // Criar canvas temporários para as texturas (apenas procedurais)
        this.createTextureCanvas();
        
        console.log('🎨 Sistema de texturas inicializado!');
    }

    createTextureCanvas() {
        // Canvas para o chão
        const floorCanvas = document.createElement('canvas');
        floorCanvas.width = 128;
        floorCanvas.height = 128;
        const floorCtx = floorCanvas.getContext('2d');

        const floorGrad = floorCtx.createRadialGradient(64, 64, 0, 64, 64, 90);
        floorGrad.addColorStop(0, '#f4e4bc');
        floorGrad.addColorStop(0.5, '#e6d3a3');
        floorGrad.addColorStop(1, '#d4b896');
        floorCtx.fillStyle = floorGrad;
        floorCtx.fillRect(0, 0, 128, 128);

        this.textures.floorSimple = floorCanvas;
        this.textures.floorDetailed = floorCanvas;

        // Canvas para a parede
        const wallCanvas = document.createElement('canvas');
        wallCanvas.width = 128;
        wallCanvas.height = 128;
        const wallCtx = wallCanvas.getContext('2d');

        const wallGrad = wallCtx.createLinearGradient(0, 0, 128, 128);
        wallGrad.addColorStop(0, '#f4d03f');
        wallGrad.addColorStop(0.5, '#f1c40f');
        wallGrad.addColorStop(1, '#d68910');
        wallCtx.fillStyle = wallGrad;
        wallCtx.fillRect(0, 0, 128, 128);

        this.textures.wallSimple = wallCanvas;
        this.textures.wallOrnate = wallCanvas;

        this.texturesLoaded = true;
    }

    // Removido: carregamento de imagens reais (somente texturas procedurais são usadas)

    // Métodos auxiliares para desenhar padrões gregos
    drawSpiral(ctx, centerX, centerY, radius) {
        ctx.beginPath();
        for (let angle = 0; angle < Math.PI * 4; angle += 0.1) {
            const r = (radius * angle) / (Math.PI * 4);
            const x = centerX + r * Math.cos(angle);
            const y = centerY + r * Math.sin(angle);
            if (angle === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }

    drawMeander(ctx, startX, startY, size) {
        ctx.beginPath();
        const segmentSize = size / 6;
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + segmentSize, startY);
        ctx.lineTo(startX + segmentSize, startY + segmentSize);
        ctx.lineTo(startX + segmentSize * 2, startY + segmentSize);
        ctx.lineTo(startX + segmentSize * 2, startY);
        ctx.lineTo(startX + segmentSize * 3, startY);
        ctx.stroke();
    }

    drawGreekCross(ctx, centerX, centerY, size) {
        ctx.beginPath();
        ctx.moveTo(centerX - size, centerY);
        ctx.lineTo(centerX + size, centerY);
        ctx.moveTo(centerX, centerY - size);
        ctx.lineTo(centerX, centerY + size);
        ctx.stroke();
    }

    resizeCanvas() {
        // 🗺️ RESIZE BÁSICO - O TAMANHO DINÂMICO É CONTROLADO PELO NÍVEL
        const container = this.canvas.parentElement;
        
        // Apenas garantir que não ultrapasse o container
        const maxWidth = container.clientWidth - 20;
        const maxHeight = container.clientHeight - 80; // Espaço para HUD
        
        // Se o canvas atual for maior que o container, redimensionar proporcionalmente
        if (this.canvas.width > maxWidth || this.canvas.height > maxHeight) {
            const scaleX = maxWidth / this.canvas.width;
            const scaleY = maxHeight / this.canvas.height;
            const scale = Math.min(scaleX, scaleY, 1); // Não aumentar, apenas diminuir
            
            this.canvas.style.width = `${this.canvas.width * scale}px`;
            this.canvas.style.height = `${this.canvas.height * scale}px`;
            
            console.log(`🗺️ Canvas redimensionado para caber: Scale ${scale.toFixed(2)}x`);
        }
        
        // Não regenerar labirinto no resize - apenas no generateMaze()
    }

    startNewGame() {
    // aceitar level opcional via argumento
    const levelArg = arguments[0];
    this.audio.playSound('buttonClick'); // 🔊 Som de clique
    if (typeof levelArg === 'number') this.level = Math.max(1, Math.floor(levelArg));
    else this.level = 1;
    this.showScreen('game');
    this.audio.playMusic('gameMusic'); // 🎵 Música de jogo
    this.startLevel();
    }

    startLevel() {
        console.log(`🎮🏰 INICIANDO NÍVEL ${this.level} - PREPARA-SE PARA O MINOTAURO!`);
        
        this.generateMaze();
        this.resetPlayer();
        
        // 🐂 GARANTIR QUE O BOSS SEMPRE APAREÇA
        console.log('🔥 Invocando o Minotauro...');
        this.resetMinotaur();
        
        // Verificação de segurança
        if (!this.minotaur.x || !this.minotaur.y) {
            console.error('⚠️ ERRO: Minotauro não foi posicionado! Corrigindo...');
            this.minotaur.x = Math.max(2.5, this.maze.width - 3);
            this.minotaur.y = Math.max(2.5, this.maze.height - 3);
            this.minotaur.state = 'HUNT';
        }
        
        this.startTime = Date.now();
        this.gameTime = 0;
        this.gameState = 'playing';
        
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
        }
        this.gameLoop = requestAnimationFrame((time) => this.update(time));
        
        // 🗺️ GARANTIR QUE O HUD APAREÇA
        const hud = document.querySelector('.game-hud');
        if (hud) {
            hud.classList.add('show');
            hud.style.display = 'flex';
            console.log('🗺️ HUD ativado!');
        }
        
        console.log(`✅ Nível ${this.level} iniciado com BOSS ativo em (${this.minotaur.x.toFixed(1)}, ${this.minotaur.y.toFixed(1)})!`);
        console.log(`🏹 Teseu vs Minotauro - QUE COMECE A CAÇADA!`);
        console.log(`🔥 Canvas dinâmico: ${this.canvas.width}x${this.canvas.height}px - CellSize: ${this.cellSize.toFixed(1)}px`);
    }

    generateMaze() {
        // Usar módulo de geração de labirinto
        const { maze, dims } = generateMazeDynamic(this.level);
        this.maze = maze;
        // Atualizar canvas conforme dimensões calculadas
        this.canvas.width = dims.canvasWidth;
        this.canvas.height = dims.canvasHeight;
        this.canvas.style.width = `${dims.canvasWidth}px`;
        this.canvas.style.height = `${dims.canvasHeight}px`;
        this.cellSize = dims.cellSize;
        console.log(`✅ Labirinto gerado (modular): ${maze.width}x${maze.height} | CellSize: ${this.cellSize.toFixed(1)}px`);
    }

    createAdditionalPaths() {
        // Delegar ao módulo
        createExtraPaths(this.maze);
    }

    carveMaze(x, y) {
        // Delegar ao módulo
        carveMazeAlgo(this.maze, x, y);
    }

    resetPlayer() {
        // 🛡️ POSICIONAMENTO SEGURO DO TESEU
        let startX = 1.5;
        let startY = 1.5;
        
        // Verificar se a posição inicial é válida
        let attempts = 0;
        while (!this.canMoveTo(startX, startY, 0.25) && attempts < 20) {
            startX += 0.5;
            if (startX > 3) {
                startX = 1.5;
                startY += 0.5;
            }
            attempts++;
        }
        
        this.player.x = startX;
        this.player.y = startY;
        this.player.trail = [];
        this.threadActive = false;
        
        console.log(`🏃 Teseu posicionado com segurança em (${startX}, ${startY})!`);
    }

    resetMinotaur() {
        console.log('🐂 INVOCANDO O BOSS CHEFEÃO LENDÁRIO - MINOTAURO!');
        
        // 💪 GARANTIR QUE O MINOTAURO SEMPRE APAREÇA - ELE É O BOSS!
        let found = false;
        let attempts = 0;
        
        // Posições estratégicas para o boss chefeão
        const bossPositions = [
            // Cantos do labirinto - posições de poder
            { x: this.maze.width - 2.5, y: this.maze.height - 2.5, name: 'Canto do Poder' },
            { x: this.maze.width - 3.5, y: this.maze.height - 2.5, name: 'Guardião da Saída' },
            { x: this.maze.width - 2.5, y: this.maze.height - 3.5, name: 'Protetor do Portal' },
            
            // Centro do labirinto - domínio absoluto
            { x: this.maze.width / 2, y: this.maze.height / 2, name: 'Senhor do Centro' },
            { x: (this.maze.width / 2) + 1, y: this.maze.height / 2, name: 'Dominador Central' },
            { x: this.maze.width / 2, y: (this.maze.height / 2) + 1, name: 'Mestre Central' },
            
            // Posições intermediárias - caçador
            { x: this.maze.width * 0.75, y: this.maze.height * 0.75, name: 'Caçador das Sombras' },
            { x: this.maze.width * 0.25, y: this.maze.height * 0.75, name: 'Perseguidor Implacavel' },
            { x: this.maze.width * 0.75, y: this.maze.height * 0.25, name: 'Vigia dos Corredores' },
            
            // Posições de emergência
            { x: 3.5, y: 3.5, name: 'Predador Inicial' },
            { x: 4.5, y: 4.5, name: 'Bestia Despertada' },
            { x: 2.5, y: 3.5, name: 'Terror Primitivo' }
        ];
        
        // Testar cada posição do boss
        for (const pos of bossPositions) {
            attempts++;
            if (!this.isWall(pos.x, pos.y) && 
                pos.x > 0 && pos.x < this.maze.width && 
                pos.y > 0 && pos.y < this.maze.height) {
                this.minotaur.x = pos.x;
                this.minotaur.y = pos.y;
                console.log(`💪 BOSS POSICIONADO: ${pos.name} em (${pos.x.toFixed(1)}, ${pos.y.toFixed(1)})`);
                found = true;
                break;
            }
        }
        
        // SISTEMA DE EMERGÊNCIA - O BOSS SEMPRE DEVE APARECER!
        if (!found) {
            console.warn('⚠️ ATIVAÇÃO DE EMERGÊNCIA - FORÇANDO SPAWN DO BOSS!');
            
            // Varredura completa garantindo que o boss apareça
            outerLoop: for (let y = 2; y < this.maze.height - 1; y += 2) {
                for (let x = 2; x < this.maze.width - 1; x += 2) {
                    attempts++;
                    const testX = x + 0.5;
                    const testY = y + 0.5;
                    
                    if (!this.isWall(testX, testY)) {
                        this.minotaur.x = testX;
                        this.minotaur.y = testY;
                        console.log(`🎆 BOSS EMERGENCIAL SPAWNED em (${testX.toFixed(1)}, ${testY.toFixed(1)})`);
                        found = true;
                        break outerLoop;
                    }
                    
                    // Limite de segurança
                    if (attempts > 100) {
                        // ÚLTIMO RECURSO - Forçar posição
                        this.minotaur.x = Math.max(2.5, Math.min(this.maze.width - 2.5, this.maze.width / 2));
                        this.minotaur.y = Math.max(2.5, Math.min(this.maze.height - 2.5, this.maze.height / 2));
                        console.warn(`🔥 FORÇANDO POSIÇÃO DO BOSS: (${this.minotaur.x.toFixed(1)}, ${this.minotaur.y.toFixed(1)})`);
                        found = true;
                        break outerLoop;
                    }
                }
            }
        }
        
        // Configurar o boss como uma ameaça lendária
        this.minotaur.state = 'HUNT'; // Novo estado mais agressivo
    this.minotaur.vx = 0;
    this.minotaur.vy = 0;
        this.minotaur.lastDir = 0;
    this.minotaur.path = [];
    this.minotaur.nextRepath = 0;
    this.minotaur.pathGoal = null;
        this.minotaur.aggressionLevel = 1.0; // Nível máximo de agressão
        this.minotaur.huntTimer = 0;
        this.minotaur.lastPlayerPos = { x: this.player.x, y: this.player.y };
        
        // Logs do boss lendário
        console.log(`🐂💪 MINOTAURO - O BOSS CHEFEÃO DESPERTA!`);
        console.log(`🏰 Posição Final: (${this.minotaur.x.toFixed(1)}, ${this.minotaur.y.toFixed(1)})`);
        console.log(`🏛️ Arena: ${this.maze.width}x${this.maze.height}`);
        console.log(`✅ Boss Status: ${found ? 'ATIVO E PERIGOSO' : 'ERROR - REPORTE ESTE BUG!'}`);
        console.log(`🎯 Tentativas de Spawn: ${attempts}`);
        console.log(`🔥 Nível de Agressão: ${this.minotaur.aggressionLevel}`);
        
        if (!found) {
            console.error('❌❌❌ ERRO CRÍTICO: BOSS NÃO PÔDE SER SPAWNADO!');
        }
    }

    update(currentTime) {
        if (this.gameState !== 'playing' && this.gameState !== 'transitioning') return;
        if (this.isTransitioning && this.gameState === 'transitioning') return;

        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.gameTime = Date.now() - this.startTime;
        
        // Debug - verificar posição do minotauro (remover depois)
        if (Math.random() < 0.01) { // Log apenas 1% das vezes para não spam
            console.log(`🐂 Minotauro: x=${this.minotaur.x.toFixed(2)}, y=${this.minotaur.y.toFixed(2)}, state=${this.minotaur.state}`);
        }

        // Atualiza estado de corrida (Shift) e movimento com checagem simples de walkable
        this.isRunning = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
        this.updatePlayerMovement(deltaTime / 1000); // converte para segundos
        this.updateMinotaur(deltaTime);
        this.checkCollisions();
        this.updateHUD();
        this.render();

        this.gameLoop = requestAnimationFrame((time) => this.update(time));
    }

    // Exemplo de correção de movimento: movimentação simples + verificação de células andáveis
    updatePlayerMovement(deltaTime) {
        const speed = this.isRunning ? 3.5 : 2.0;
        let dx = 0, dy = 0;

        if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) dy -= speed * deltaTime;
        if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) dy += speed * deltaTime;
        if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) dx -= speed * deltaTime;
        if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) dx += speed * deltaTime;

        const newX = this.player.x + dx;
        const newY = this.player.y + dy;

        // Função auxiliar: verifica se é chão
        const isWalkable = (x, y) => {
            const gridX = Math.floor(x);
            const gridY = Math.floor(y);
            if (!this.maze || !this.maze.walls) return false;
            if (
                gridX < 0 || gridY < 0 ||
                gridY >= this.maze.height || gridX >= this.maze.width
            ) return false;
            return this.maze.walls[gridY][gridX] === 0;
        };

        // Atualiza posição só se o próximo passo for válido (eixos independentes)
    // Além da célula ser andável, confirma com colisão por raio (alinha com tamanho visual ~0.45)
    if (isWalkable(newX, this.player.y) && this.canMoveTo(newX, this.player.y, 0.45)) this.player.x = newX;
    if (isWalkable(this.player.x, newY) && this.canMoveTo(this.player.x, newY, 0.45)) this.player.y = newY;
    }

    updatePlayer(deltaTime) {
        // Verifica se está correndo (Shift pressionado)
        const wasRunning = this.isRunning;
        this.isRunning = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
        
        // Velocidade base e multiplicador de corrida
        const baseSpeed = 0.003;
        const runMultiplier = 2.0; // Corre 2x mais rápido
        const speed = this.isRunning ? baseSpeed * runMultiplier : baseSpeed;
        
        let dx = 0, dy = 0;
        const wasMoving = dx !== 0 || dy !== 0;

        if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) dy -= speed * deltaTime;
        if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) dy += speed * deltaTime;
        if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) dx -= speed * deltaTime;
        if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) dx += speed * deltaTime;

        const wasThreadActive = this.threadActive;
        this.threadActive = this.keys.has('Space');
        
        // 🔊 SOM DO FIO DE ARIADNE
        if (this.threadActive && !wasThreadActive) {
            this.audio.playSound('threadActivate');
        }

        // 🚧 MOVIMENTO COM COLISÃO ULTRA-SEGURA
        const newX = this.player.x + dx;
        const newY = this.player.y + dy;
        
        let actuallyMoved = false;

        // Verificação dupla: canMoveTo + isValidPosition
        if (this.canMoveTo(newX, newY, 0.25) && this.isValidPosition(newX, newY, 0.25)) {
            this.player.x = newX;
            this.player.y = newY;
            actuallyMoved = true;
        } else {
            // Tentar eixos separadamente com verificação dupla
            if (this.canMoveTo(newX, this.player.y, 0.25) && this.isValidPosition(newX, this.player.y, 0.25)) {
                this.player.x = newX;
                actuallyMoved = true;
            }
            if (this.canMoveTo(this.player.x, newY, 0.25) && this.isValidPosition(this.player.x, newY, 0.25)) {
                this.player.y = newY;
                actuallyMoved = true;
            }
        }
        
        // 🛡️ VERIFICAÇÃO FINAL DE SEGURANÇA
        if (!this.canMoveTo(this.player.x, this.player.y, 0.25)) {
            console.warn('🚨 Posição inválida detectada! Corrigindo...');
            // Voltar para posição válida mais próxima
            this.player.x = Math.max(0.5, Math.min(this.maze.width - 0.5, this.player.x));
            this.player.y = Math.max(0.5, Math.min(this.maze.height - 0.5, this.player.y));
        }
        
        // 🔊 SONS DE MOVIMENTO
        if (actuallyMoved && Math.random() < 0.1) { // 10% chance por frame
            if (this.isRunning) {
                this.audio.playSound('runFootstep');
            } else {
                this.audio.playSound('footstep');
            }
        }

        // Add to trail
        if (this.threadActive) {
            const lastPoint = this.player.trail[this.player.trail.length - 1];
            const distThreshold = 0.8;
            if (!lastPoint || Math.hypot(this.player.x - lastPoint.x, this.player.y - lastPoint.y) > distThreshold) {
                this.player.trail.push({ x: this.player.x, y: this.player.y });
            }

            const MAX_TRAIL_LENGTH = 150;
            if (this.player.trail.length > MAX_TRAIL_LENGTH) {
                this.player.trail.shift();
            }
        }
    }

    updateMinotaur(deltaTime) {
        // 🐂💪 AI DO BOSS CHEFEÃO - MINOTAURO LENDÁRIO
    // Dificuldade ajusta a velocidade base do boss
    const diff = this._prefDifficulty || 'normal';
    const baseSpeedMap = { easy: 0.0015, normal: 0.002, hard: 0.0026 };
    const baseSpeed = baseSpeedMap[diff] ?? 0.002;
    const bossSpeed = baseSpeed * (1 + this.level * 0.1); // Fica mais rápido a cada nível
        
        // Calcular distância para Teseu
        const distToPlayer = Math.sqrt(
            Math.pow(this.player.x - this.minotaur.x, 2) + 
            Math.pow(this.player.y - this.minotaur.y, 2)
        );
        
        // Atualizar última posição conhecida do jogador
        if (distToPlayer < 6 || this.hasLineOfSight()) {
            this.minotaur.lastPlayerPos = { x: this.player.x, y: this.player.y };
            this.minotaur.huntTimer = 5000; // Lembrar por 5 segundos
        }
        
        // Reduzir timer de caça
        this.minotaur.huntTimer = Math.max(0, this.minotaur.huntTimer - deltaTime);
        
        // 🎯 ESTADOS DO BOSS:
        // 🔊 SONS BASEADOS NO ESTADO DO MINOTAURO
        const previousState = this.minotaur.state;
        
        if (distToPlayer < 2) {
            // MODO ATAQUE - Muito próximo!
            this.minotaur.state = 'ATTACK';
            const dx = this.player.x - this.minotaur.x;
            const dy = this.player.y - this.minotaur.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            
            // 🔊 Som de ataque se mudou para ATTACK
            if (previousState !== 'ATTACK' && Math.random() < 0.3) {
                this.audio.playSound('minotaurAttack');
            }
            
            // Ataque direcionado muito rápido
            this.minotaur.vx = (dx / dist) * bossSpeed * deltaTime * 3.0;
            this.minotaur.vy = (dy / dist) * bossSpeed * deltaTime * 3.0;
            
        } else if (distToPlayer < 5 && this.hasLineOfSight()) {
            // MODO CAÇA - Pode ver o jogador
            this.minotaur.state = 'CHASE';
            const dx = this.player.x - this.minotaur.x;
            const dy = this.player.y - this.minotaur.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            
            // 🔊 Som de rugido se mudou para CHASE
            if (previousState !== 'CHASE' && Math.random() < 0.2) {
                this.audio.playSound('minotaurRoar');
                this.audio.playMusic('chaseMusic'); // Música mais intensa
            }
            
            // Caça rápida e direcionada
            this.minotaur.vx = (dx / dist) * bossSpeed * deltaTime * 2.0;
            this.minotaur.vy = (dy / dist) * bossSpeed * deltaTime * 2.0;
            
            // 🔊 Batimentos cardíacos quando perseguido
            if (Math.random() < 0.05) { // 5% chance por frame
                this.audio.playSound('heartbeat');
            }
            
        } else if (this.minotaur.huntTimer > 0) {
            // MODO PERSEGUIÇÃO - Vai para última posição conhecida
            this.minotaur.state = 'HUNT';
            const dx = this.minotaur.lastPlayerPos.x - this.minotaur.x;
            const dy = this.minotaur.lastPlayerPos.y - this.minotaur.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            
            if (dist > 0.5) {
                this.minotaur.vx = (dx / dist) * bossSpeed * deltaTime * 1.5;
                this.minotaur.vy = (dy / dist) * bossSpeed * deltaTime * 1.5;
            } else {
                // Chegou na última posição, começar patrulha
                this.minotaur.huntTimer = 0;
            }
            
        } else {
            // 🚶 MODO PATRULHA INTELIGENTE - EXPLORAÇÃO TOTAL DO LABIRINTO
            this.minotaur.state = 'PATROL';
            
            // 🔊 Voltar música normal se saiu da perseguição
            if (previousState === 'CHASE' || previousState === 'ATTACK') {
                this.audio.playMusic('gameMusic');
            }
            
            this.minotaur.lastDir -= deltaTime;
            
            if (this.minotaur.lastDir <= 0) {
                // 🧠 MOVIMENTO INTELIGENTE: Explorar todo o labirinto
                let targetX, targetY;
                
                if (Math.random() < 0.4) {
                    // 40% - Patrulhar pontos estratégicos
                    const strategicPoints = [
                        { x: this.maze.width - 2, y: this.maze.height - 2 }, // Saída
                        { x: this.maze.width / 2, y: this.maze.height / 2 }, // Centro
                        { x: this.maze.width * 0.25, y: this.maze.height * 0.25 }, // Quadrante 1
                        { x: this.maze.width * 0.75, y: this.maze.height * 0.25 }, // Quadrante 2
                        { x: this.maze.width * 0.25, y: this.maze.height * 0.75 }, // Quadrante 3
                        { x: this.maze.width * 0.75, y: this.maze.height * 0.75 }, // Quadrante 4
                        { x: 2, y: 2 }, // Próximo ao início
                    ];
                    
                    const target = strategicPoints[Math.floor(Math.random() * strategicPoints.length)];
                    targetX = target.x;
                    targetY = target.y;
                    
                } else if (Math.random() < 0.7) {
                    // 30% - Movimento aleatório em direções válidas
                    const directions = [];
                    const checkDirs = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];
                    
                    // Verificar direções válidas
                    for (const [dx, dy] of checkDirs) {
                        const testX = this.minotaur.x + dx * 3;
                        const testY = this.minotaur.y + dy * 3;
                        
                        if (testX > 1 && testX < this.maze.width - 1 && 
                            testY > 1 && testY < this.maze.height - 1 &&
                            !this.isWall(testX, testY)) {
                            directions.push([dx, dy]);
                        }
                    }
                    
                    if (directions.length > 0) {
                        const [dx, dy] = directions[Math.floor(Math.random() * directions.length)];
                        targetX = this.minotaur.x + dx * 3;
                        targetY = this.minotaur.y + dy * 3;
                    } else {
                        // Fallback: mover para centro
                        targetX = this.maze.width / 2;
                        targetY = this.maze.height / 2;
                    }
                    
                } else {
                    // 30% - Perseguir áreas não exploradas (simulação)
                    const unexplored = [];
                    for (let attempts = 0; attempts < 10; attempts++) {
                        const randX = 2 + Math.random() * (this.maze.width - 4);
                        const randY = 2 + Math.random() * (this.maze.height - 4);
                        
                        if (!this.isWall(randX, randY)) {
                            unexplored.push({ x: randX, y: randY });
                        }
                    }
                    
                    if (unexplored.length > 0) {
                        const target = unexplored[Math.floor(Math.random() * unexplored.length)];
                        targetX = target.x;
                        targetY = target.y;
                    } else {
                        targetX = this.maze.width / 2;
                        targetY = this.maze.height / 2;
                    }
                }
                
                // Calcular direção para o alvo
                const dx = targetX - this.minotaur.x;
                const dy = targetY - this.minotaur.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                
                this.minotaur.vx = (dx / dist) * bossSpeed * deltaTime;
                this.minotaur.vy = (dy / dist) * bossSpeed * deltaTime;
                this.minotaur.lastDir = 1000 + Math.random() * 2000; // Varia entre 1-3s
            }
        }
        
        // Definir alvo de pathfinding
        let goalCell = null;
        if (this.minotaur.state === 'ATTACK' || this.minotaur.state === 'CHASE') {
            goalCell = { x: Math.floor(this.player.x), y: Math.floor(this.player.y) };
        } else if (this.minotaur.state === 'HUNT') {
            goalCell = { x: Math.floor(this.minotaur.lastPlayerPos.x), y: Math.floor(this.minotaur.lastPlayerPos.y) };
        }

        // Recalcular caminho periodicamente ou quando alvo muda
        const now = Date.now();
        const sameGoal = this.minotaur.pathGoal && goalCell && this.minotaur.pathGoal.x === goalCell.x && this.minotaur.pathGoal.y === goalCell.y;
        if (goalCell && (now > this.minotaur.nextRepath || !this.minotaur.path.length || !sameGoal)) {
            const start = { x: Math.floor(this.minotaur.x), y: Math.floor(this.minotaur.y) };
            this.minotaur.path = this.astarGridPath(start, goalCell);
            this.minotaur.pathGoal = goalCell;
            this.minotaur.nextRepath = now + 750; // repath a cada 750ms
        }

        // Aumentar agressão com o tempo (boss fica mais perigoso)
        this.minotaur.aggressionLevel = Math.min(2.0, 1.0 + (this.gameTime / 30000)); // +100% agressão após 30s

        // Se tem caminho, seguir próximo waypoint; senão, usa vetor atual
        const r = 0.43; // raio lógico ajustado
        if (this.minotaur.path && this.minotaur.path.length) {
            const wp = this.minotaur.path[0];
            const tx = wp.x + 0.5;
            const ty = wp.y + 0.5;
            const dx = tx - this.minotaur.x;
            const dy = ty - this.minotaur.y;
            const dist = Math.sqrt(dx*dx + dy*dy) || 1;
            const step = bossSpeed * deltaTime * 1.8; // ajuste de ritmo
            const moveX = (dx / dist) * step;
            const moveY = (dy / dist) * step;
            let newX = this.minotaur.x + moveX;
            let newY = this.minotaur.y + moveY;

            // Aplicar colisão + fallback em eixos
            if (this.canMoveTo(newX, newY, r)) {
                this.minotaur.x = newX;
                this.minotaur.y = newY;
            } else {
                let moved = false;
                if (this.canMoveTo(newX, this.minotaur.y, r)) { this.minotaur.x = newX; moved = true; }
                if (this.canMoveTo(this.minotaur.x, newY, r)) { this.minotaur.y = newY; moved = true; }
                if (!moved) {
                    // micro deslizamento
                    const eps = 0.05;
                    const signX = Math.sign(moveX) || 1;
                    const signY = Math.sign(moveY) || 1;
                    const candidates = [
                        { x: this.minotaur.x + signX*eps, y: this.minotaur.y },
                        { x: this.minotaur.x, y: this.minotaur.y + signY*eps },
                        { x: this.minotaur.x + signX*eps, y: this.minotaur.y + signY*eps }
                    ];
                    for (const c of candidates) {
                        if (this.canMoveTo(c.x, c.y, r)) { this.minotaur.x = c.x; this.minotaur.y = c.y; break; }
                    }
                }
            }

            // Chegou no waypoint
            if (Math.hypot(tx - this.minotaur.x, ty - this.minotaur.y) < 0.15) {
                this.minotaur.path.shift();
            }

        } else {
            // Move minotaur with collision (vetorial antigo)
            const newX = this.minotaur.x + this.minotaur.vx;
            const newY = this.minotaur.y + this.minotaur.vy;
            if (this.canMoveTo(newX, newY, r)) {
                this.minotaur.x = newX;
                this.minotaur.y = newY;
            } else {
                if (this.canMoveTo(newX, this.minotaur.y, r)) this.minotaur.x = newX; else this.minotaur.vx = -this.minotaur.vx;
                if (this.canMoveTo(this.minotaur.x, newY, r)) this.minotaur.y = newY; else this.minotaur.vy = -this.minotaur.vy;
            }
        }

        // Removido bloco duplicado de colisão que usava variáveis fora de escopo (newX/newY)

        // Snap leve ao centro da célula para reduzir drift que causa travas
        const cx = Math.floor(this.minotaur.x) + 0.5;
        const cy = Math.floor(this.minotaur.y) + 0.5;
        if (Math.abs(this.minotaur.x - cx) < 0.03) this.minotaur.x = cx;
        if (Math.abs(this.minotaur.y - cy) < 0.03) this.minotaur.y = cy;
    }

    hasLineOfSight() {
        if (Math.random() < 0.1) {
            return this._hasClearLineBetween(this.minotaur.x, this.minotaur.y, this.player.x, this.player.y);
        }
        return false;
    }

    // Raycast simples no grid para verificar linha de visão livre entre dois pontos
    _hasClearLineBetween(x0, y0, x1, y1) {
        const dx = x1 - x0;
        const dy = y1 - y0;
        const dist = Math.sqrt(dx*dx + dy*dy) || 1;
        const steps = Math.max(2, Math.ceil(dist * 12)); // amostragem fina por unidade
        for (let i = 1; i < steps; i++) { // ignora os pontos finais
            const t = i / steps;
            const x = x0 + dx * t;
            const y = y0 + dy * t;
            const gx = Math.floor(x);
            const gy = Math.floor(y);
            if (gx < 0 || gy < 0 || gx >= this.maze.width || gy >= this.maze.height) return false;
            if (this.maze.walls[gy]?.[gx] === 1) return false; // parede bloqueia linha de visão
        }
        return true;
    }

    isWall(x, y) {
        return mazeIsWall(this.maze, x, y);
    }

    // 🔎 A* em grade: retorna caminho de células {x,y} do start ao goal (4-direções)
    astarGridPath(start, goal) {
        return astar(this.maze, start, goal);
    }

    // 🚧 Colisão por amostragem no entorno do centro (garante ficar no "branco")
    canMoveTo(x, y, size = 0.35) {
        // Margem e resolução afinadas para evitar travas em quinas
        const margin = 0.02;
        const effectiveSize = size + margin;
        
        // Verificar limites do labirinto com margem de segurança
        if (x - effectiveSize < 0.5 || x + effectiveSize >= this.maze.width - 0.5 || 
            y - effectiveSize < 0.5 || y + effectiveSize >= this.maze.height - 0.5) {
            return false;
        }
        
        // Verificação mais fina reduz travas em quinas
        const checkResolution = 0.1; // Resolução da verificação
        for (let dx = -effectiveSize; dx <= effectiveSize; dx += checkResolution) {
            for (let dy = -effectiveSize; dy <= effectiveSize; dy += checkResolution) {
                const checkX = x + dx;
                const checkY = y + dy;
                
                const gx = Math.floor(checkX);
                const gy = Math.floor(checkY);
                
                // Verificação rigorosa considerando altura das paredes
                if (gx < 0 || gx >= this.maze.width || 
                    gy < 0 || gy >= this.maze.height || 
                    this.maze.walls[gy]?.[gx] === 1) {
                    return false;
                }
            }
        }
        
        return true;
    }

    // 🛡️ VERIFICAÇÃO AUXILIAR PARA PAREDES
    isValidPosition(x, y, size = 0.3) {
        // Método mais conservador - verifica área maior
        const margin = size + 0.1; // Margem extra para segurança
        
        for (let dx = -margin; dx <= margin; dx += 0.1) {
            for (let dy = -margin; dy <= margin; dy += 0.1) {
                const checkX = x + dx;
                const checkY = y + dy;
                
                const gx = Math.floor(checkX);
                const gy = Math.floor(checkY);
                
                if (gx < 0 || gx >= this.maze.width || 
                    gy < 0 || gy >= this.maze.height || 
                    this.maze.walls[gy]?.[gx] === 1) {
                    return false;
                }
            }
        }
        return true;
    }

    checkCollisions() {
        // Não verificar colisões se já está em transição
        if (this.isTransitioning) return;
        // Apenas checar durante o jogo
        if (this.gameState !== 'playing') return;
        
        // Check win condition
        const exitX = this.maze.width - 2;
        const exitY = this.maze.height - 2;
        
        if (Math.abs(this.player.x - exitX - 0.5) < 0.5 && 
            Math.abs(this.player.y - exitY - 0.5) < 0.5) {
            this.gameWon();
            return;
        }

        // Check minotaur collision (soma dos raios + LOS livre)
        const dx = this.player.x - this.minotaur.x;
        const dy = this.player.y - this.minotaur.y;
        const dist2 = dx*dx + dy*dy;
        const playerR = 0.45; // deve bater com o desenho
        const minotaurR = 0.43; // raio lógico do boss
        const capture = playerR + minotaurR - 0.03; // folga pequena
        const capture2 = capture * capture;
        if (dist2 <= capture2 && this._hasClearLineBetween(this.minotaur.x, this.minotaur.y, this.player.x, this.player.y)) {
            this.gameOver();
        }
    }

    gameWon() {
        // 🔊 SONS DE VITÓRIA
    this.audio.playSound('portalEnter');
    this.audio.playSound('levelComplete');
    this.audio.playMusic('victoryMusic');
        
        // Não mudar gameState ainda, apenas iniciar transição
        this.startLevelTransition();
    }

    startLevelTransition() {
        console.log('🎆 Iniciando transição de nível...');
        this.isTransitioning = true;
        this.gameState = 'transitioning'; // Novo estado para transição
        
        const transitionOverlay = document.getElementById('level-transition');
        const transitionText = document.getElementById('transition-text');
        
        if (!transitionOverlay) {
            console.error('❌ Elemento level-transition não encontrado!');
            // Fallback: ir direto para o próximo nível
            this.nextLevel();
            return;
        }
        
        // Atualizar texto da transição
        transitionText.innerHTML = `🏛️ Nível ${this.level} Completo!<br>🌟 Preparando Nível ${this.level + 1}...`;
        
        // Mostrar overlay de transição
        transitionOverlay.classList.add('active');
        console.log('✨ Overlay de transição ativado');
        
        // Aguardar 2 segundos e então ir para o próximo nível
        setTimeout(() => {
            console.log('⏳ Timeout da transição - indo para próximo nível');
            this.nextLevel();
        }, 2000);
    }

    gameOver() {
        // 🔊 SONS DE GAME OVER
    this.audio.playSound('minotaurRoar'); // Rugido de vitória do Minotauro
    this.audio.playSound('gameOver');
    this.audio.stopMusic();
        
        this.gameState = 'gameover';
        this.showOverlay('gameover');
    }

    nextLevel() {
        this.level++;
        this.startLevel();
        
        // Remover overlay de transição após o novo nível carregar
        setTimeout(() => {
            this.endLevelTransition();
        }, 1000);
    }

    endLevelTransition() {
        const transitionOverlay = document.getElementById('level-transition');
        transitionOverlay.classList.remove('active');
        this.isTransitioning = false;
        // Garantir que o gameState volte para playing
        if (this.gameState === 'transitioning') {
            this.gameState = 'playing';
        }
    }

    restartLevel() {
        this.startLevel();
    }

    stopGame() {
        this.gameState = 'menu';
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
    }

    updateHUD() {
        document.getElementById('hud-level').textContent = this.level;
        document.getElementById('hud-time').textContent = `${Math.floor(this.gameTime / 1000)}s`;
        document.getElementById('hud-thread').textContent = this.threadActive ? 'ATIVO' : 'INATIVO';
        document.getElementById('hud-running').textContent = this.isRunning ? '🏃' : '🚶';
        
        // 🐂 STATUS DETALHADO DO BOSS CHEFEÃO
        const minotaurElement = document.getElementById('hud-minotaur');
        let bossStatus = '';
        
        switch(this.minotaur.state) {
            case 'ATTACK':
                bossStatus = '🔥 ATACANDO!';
                break;
            case 'CHASE':
                bossStatus = '🏃‍♂️ CAÇANDO';
                break;
            case 'HUNT':
                bossStatus = '🔍 PERSEGUINDO';
                break;
            case 'PATROL':
                bossStatus = '🚶 PATRULHANDO';
                break;
            default:
                bossStatus = '🐂 ATIVO';
        }
        
        minotaurElement.textContent = bossStatus;
        
        // Mudar cor do HUD baseado no perigo
        if (this.minotaur.state === 'ATTACK') {
            minotaurElement.style.color = '#ef4444';
            minotaurElement.style.fontWeight = 'bold';
        } else if (this.minotaur.state === 'CHASE') {
            minotaurElement.style.color = '#f59e0b';
            minotaurElement.style.fontWeight = 'bold';
        } else {
            minotaurElement.style.color = '#10b981';
            minotaurElement.style.fontWeight = 'normal';
        }
    }

    render() {
        if (!this.ctx || !this.maze) return;

        // Estilo clássico: fundo branco, paredes pretas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Calcular offset para centralizar o labirinto
        const totalMazeWidth = this.maze.width * this.cellSize;
        const totalMazeHeight = this.maze.height * this.cellSize;
        const offsetX = (this.canvas.width - totalMazeWidth) / 2;
        const offsetY = (this.canvas.height - totalMazeHeight) / 2;

        // Área do labirinto (mantém branco)
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(offsetX, offsetY, totalMazeWidth, totalMazeHeight);

        // Desenhar paredes pretas
        for (let y = 0; y < this.maze.height; y++) {
            for (let x = 0; x < this.maze.width; x++) {
                const renderX = offsetX + (x * this.cellSize);
                const renderY = offsetY + (y * this.cellSize);
                
                if (this.maze.walls[y][x] === 1) {
                    // Paredes sólidas pretas
                    this.ctx.fillStyle = '#000000';
                    this.ctx.fillRect(renderX, renderY, this.cellSize, this.cellSize);
                }
            }
        }

        // ⭐ PORTAL DE SAÍDA COM OFFSET CENTRALIZADO
        const exitX = this.maze.width - 2;
        const exitY = this.maze.height - 2;
        const exitRenderX = offsetX + (exitX * this.cellSize) + this.cellSize/2;
        const exitRenderY = offsetY + (exitY * this.cellSize) + this.cellSize/2;
        
        // Glow da saída
        this.ctx.save();
        this.ctx.shadowColor = '#10b981';
        this.ctx.shadowBlur = 20;
        
        // Gradiente da saída centralizado
        const exitGradient = this.ctx.createRadialGradient(
            exitRenderX, exitRenderY, 0,
            exitRenderX, exitRenderY, this.cellSize/2
        );
        exitGradient.addColorStop(0, '#10b981');
        exitGradient.addColorStop(0.7, '#059669');
        exitGradient.addColorStop(1, '#047857');
        
        this.ctx.fillStyle = exitGradient;
        this.ctx.fillRect(
            offsetX + (exitX * this.cellSize) + 2, 
            offsetY + (exitY * this.cellSize) + 2, 
            this.cellSize - 4, 
            this.cellSize - 4
        );
        this.ctx.restore();

        // Draw trail (Fio de Ariadne) com efeito especial
        if (this.threadActive && this.player.trail.length > 1) {
            this.ctx.save();
            this.ctx.shadowColor = '#ffd700';
            this.ctx.shadowBlur = 10;
            
            // Criar gradiente para o fio
            const trailGradient = this.ctx.createLinearGradient(
                offsetX + this.player.trail[0].x * this.cellSize,
                offsetY + this.player.trail[0].y * this.cellSize,
                offsetX + this.player.trail[this.player.trail.length - 1].x * this.cellSize,
                offsetY + this.player.trail[this.player.trail.length - 1].y * this.cellSize
            );
            trailGradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
            trailGradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.8)');
            trailGradient.addColorStop(1, 'rgba(255, 215, 0, 1)');
            
            this.ctx.strokeStyle = trailGradient;
            this.ctx.lineWidth = 4;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.beginPath();
            this.ctx.moveTo(
                offsetX + this.player.trail[0].x * this.cellSize, 
                offsetY + this.player.trail[0].y * this.cellSize
            );
            for (let i = 1; i < this.player.trail.length; i++) {
                this.ctx.lineTo(
                    offsetX + this.player.trail[i].x * this.cellSize, 
                    offsetY + this.player.trail[i].y * this.cellSize
                );
            }
            this.ctx.stroke();
            this.ctx.restore();
        }

        // Draw player (Teseu) - Herói sem efeitos de fumaça
        this.ctx.save();
        
    const playerX = offsetX + (this.player.x * this.cellSize);
    const playerY = offsetY + (this.player.y * this.cellSize);
        
        // Círculo azul simples para o herói
        const playerGradient = this.ctx.createRadialGradient(
            playerX, playerY, 0,
            playerX, playerY, this.cellSize * 0.55
        );
        playerGradient.addColorStop(0, '#60a5fa');
        playerGradient.addColorStop(0.6, '#3b82f6');
        playerGradient.addColorStop(1, '#1d4ed8');
        
        this.ctx.fillStyle = playerGradient;
    this.ctx.beginPath();
    this.ctx.arc(playerX, playerY, this.cellSize * 0.45, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Borda do herói
        this.ctx.strokeStyle = '#1e40af';
    this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        // Ícone do herói (⚔️)
    this.ctx.font = `${this.cellSize * 0.6}px Arial`;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('⚔️', playerX, playerY);
        
        this.ctx.restore();

        // Depuração: mostrar caminho do Minotauro
        if (this._prefShowPath && Array.isArray(this.minotaur.path) && this.minotaur.path.length) {
            this.ctx.save();
            this.ctx.strokeStyle = '#22c55e';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([6, 4]);
            this.ctx.beginPath();
            const first = this.minotaur.path[0];
            this.ctx.moveTo(
                offsetX + (first.x + 0.5) * this.cellSize,
                offsetY + (first.y + 0.5) * this.cellSize
            );
            for (let i = 1; i < this.minotaur.path.length; i++) {
                const wp = this.minotaur.path[i];
                this.ctx.lineTo(
                    offsetX + (wp.x + 0.5) * this.cellSize,
                    offsetY + (wp.y + 0.5) * this.cellSize
                );
            }
            this.ctx.stroke();
            this.ctx.restore();
        }

        // 🐂💪 DESENHAR BOSS CHEFEÃO - MINOTAURO LENDÁRIO CENTRALIZADO
        this.ctx.save();
        
        // Efeitos visuais baseados no estado do boss
        let shadowColor, shadowBlur, glowIntensity;
        switch(this.minotaur.state) {
            case 'ATTACK':
                shadowColor = '#dc2626'; // Vermelho intenso
                shadowBlur = 35;
                glowIntensity = 1.2;
                break;
            case 'CHASE':
                shadowColor = '#ef4444'; // Vermelho
                shadowBlur = 25;
                glowIntensity = 1.0;
                break;
            case 'HUNT':
                shadowColor = '#f59e0b'; // Laranja
                shadowBlur = 20;
                glowIntensity = 0.8;
                break;
            default:
                shadowColor = '#d97706'; // Laranja escuro
                shadowBlur = 15;
                glowIntensity = 0.6;
        }
        
        this.ctx.shadowColor = shadowColor;
        this.ctx.shadowBlur = shadowBlur;
        
        const minotaurX = offsetX + (this.minotaur.x * this.cellSize);
        const minotaurY = offsetY + (this.minotaur.y * this.cellSize);
        
        // Debug - verificar se está dentro da tela
        if (Math.random() < 0.005) { // Log apenas raramente
            console.log(`🎨 Desenhando Minotauro: x=${minotaurX.toFixed(1)}, y=${minotaurY.toFixed(1)}, cellSize=${this.cellSize}`);
        }
        
        // Círculo laranja/vermelho para o minotauro
        const minotaurGradient = this.ctx.createRadialGradient(
            minotaurX, minotaurY, 0,
            minotaurX, minotaurY, this.cellSize * 0.6
        );
        
        // Gradiente dinâmico baseado no estado do boss
        if (this.minotaur.state === 'ATTACK') {
            // Vermelho intenso - PERIGO MÁXIMO!
            minotaurGradient.addColorStop(0, '#fecaca');
            minotaurGradient.addColorStop(0.4, '#ef4444');
            minotaurGradient.addColorStop(0.8, '#dc2626');
            minotaurGradient.addColorStop(1, '#991b1b');
        } else if (this.minotaur.state === 'CHASE') {
            // Vermelho médio - ALERTA!
            minotaurGradient.addColorStop(0, '#fca5a5');
            minotaurGradient.addColorStop(0.6, '#ef4444');
            minotaurGradient.addColorStop(1, '#dc2626');
        } else if (this.minotaur.state === 'HUNT') {
            // Laranja intenso - PERSEGUIÇÃO
            minotaurGradient.addColorStop(0, '#fed7aa');
            minotaurGradient.addColorStop(0.6, '#f59e0b');
            minotaurGradient.addColorStop(1, '#d97706');
        } else {
            // Laranja normal - PATRULHA
            minotaurGradient.addColorStop(0, '#fcd34d');
            minotaurGradient.addColorStop(0.6, '#f59e0b');
            minotaurGradient.addColorStop(1, '#d97706');
        }
        
        this.ctx.fillStyle = minotaurGradient;
        this.ctx.beginPath();
        
        // Boss fica maior e mais imponente com os níveis
    const bossSize = this.cellSize * Math.min(0.55, 0.48 + (this.level * 0.015)); // maior e com leve crescimento
        this.ctx.arc(minotaurX, minotaurY, bossSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Borda do boss mais grossa e dinâmica
        const borderColors = {
            'ATTACK': '#991b1b',
            'CHASE': '#dc2626',
            'HUNT': '#d97706',
            'PATROL': '#92400e'
        };
        
        this.ctx.strokeStyle = borderColors[this.minotaur.state] || '#d97706';
        this.ctx.lineWidth = this.minotaur.state === 'ATTACK' ? 4 : 3;
        this.ctx.stroke();
        
        // Anel adicional para estados perigosos
        if (this.minotaur.state === 'ATTACK' || this.minotaur.state === 'CHASE') {
            this.ctx.beginPath();
            this.ctx.arc(minotaurX, minotaurY, bossSize + 3, 0, Math.PI * 2);
            this.ctx.strokeStyle = this.minotaur.state === 'ATTACK' ? '#fca5a5' : '#fed7aa';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        }
        
        // 🐂💪 ÍCONE DO BOSS CHEFEÃO LENDÁRIO
    const bossFontSize = this.cellSize * Math.min(0.8, 0.65 + (this.level * 0.02)); // Ícone maior
        this.ctx.font = `${bossFontSize}px Arial`;
        this.ctx.fillStyle = this.minotaur.state === 'ATTACK' ? '#ffffff' : '#ffffff';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Efeito de pulsação para estados perigosos
        if (this.minotaur.state === 'ATTACK') {
            const pulse = 1 + Math.sin(Date.now() / 100) * 0.1; // Pulsação rápida
            this.ctx.save();
            this.ctx.scale(pulse, pulse);
            this.ctx.fillText('🐂', minotaurX / pulse, minotaurY / pulse);
            this.ctx.restore();
        } else {
            this.ctx.fillText('🐂', minotaurX, minotaurY);
        }
        
        this.ctx.restore();

        // Efeito de iluminação removido para visual mais limpo
    }

    showHelp() {
    this.audio.playSound('buttonClick');
        const overlay = document.getElementById('help-overlay');
        if (!overlay) return;
        overlay.style.display = 'flex';
        const btnClose = document.getElementById('btn-help-close');
        btnClose.onclick = () => { overlay.style.display = 'none'; };
    }

    showSettings() {
    this.audio.playSound('buttonClick');
        const overlay = document.getElementById('settings-overlay');
        if (!overlay) return;

        // Carregar preferências atuais
    const musicEnabled = (this._prefMusicEnabled ?? true);
        const sfxEnabled = (this._prefSfxEnabled ?? true);
        const masterVol = Math.round((this.masterVolume ?? 0.5) * 100);
        const threadOnStart = (this._prefThreadOnStart ?? false);
        const difficulty = (this._prefDifficulty ?? 'normal');
        const showPath = (this._prefShowPath ?? false);

        // Aplicar nos controles
        document.getElementById('settings-music').checked = musicEnabled;
        document.getElementById('settings-sfx').checked = sfxEnabled;
        document.getElementById('settings-volume').value = String(masterVol);
        document.getElementById('settings-thread').checked = threadOnStart;
        document.getElementById('settings-difficulty').value = difficulty;
    document.getElementById('settings-showpath').checked = showPath;

        // Exibir
        overlay.style.display = 'flex';

        const applyFromUI = () => {
            const music = document.getElementById('settings-music').checked;
            const sfx = document.getElementById('settings-sfx').checked;
            const vol = Number(document.getElementById('settings-volume').value) / 100;
            const thread = document.getElementById('settings-thread').checked;
            const diff = document.getElementById('settings-difficulty').value;
            const dbgPath = document.getElementById('settings-showpath').checked;

            // Persistir em memória
            this._prefMusicEnabled = music;
            this._prefSfxEnabled = sfx;
            this.masterVolume = vol;
            this._prefThreadOnStart = thread;
            this._prefDifficulty = diff;
            this._prefShowPath = dbgPath;

            // Aplicar efeitos imediatos
            // Volume: ajusta os ganhos atuais na faixa atual (vai surtir efeito em novas notas/sons)
            // Música on/off
            if (!music) {
                this.audio.stopMusic();
            } else if (!this.audio.currentMusic?.isPlaying && this.gameState !== 'menu') {
                this.audio.playMusic('gameMusic');
            }
        };

        // Eventos dos controles (aplicar em tempo real)
        const bind = (id, evt='change') => document.getElementById(id).addEventListener(evt, applyFromUI);
        bind('settings-music');
        bind('settings-sfx');
        bind('settings-volume','input');
        bind('settings-thread');
        bind('settings-difficulty');
    bind('settings-showpath');

        // Botão fechar
        const btnClose = document.getElementById('btn-settings-close');
        const onClose = () => {
            overlay.style.display = 'none';
            // Se o usuário ligou o fio por padrão, sincroniza estado se estiver no jogo
            if (this.gameState === 'playing') {
                this.threadActive = !!this._prefThreadOnStart;
            }
        };
        btnClose.onclick = onClose;
    }
}

// Inicializar o jogo quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏛️ Labirinto de Creta - Inicializando...');
    const game = new LabirintoDeCreta();
    game.init();
    
    // Tornar disponível globalmente para debug
    window.game = game;
});

// Tratamento de erros
window.addEventListener('error', (e) => {
    console.error('🚨 Erro no jogo:', e.error);
});
