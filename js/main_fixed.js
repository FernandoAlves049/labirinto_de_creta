// MAIN.JS - GERENCIADOR PRINCIPAL DO LABIRINTO DE CRETA
// Versão corrigida que funciona com a estrutura existente

import { gameState, initGame, updateGame, renderGame } from './game.js';

// Estado da aplicação
const appState = {
    currentScreen: 'loading',
    screens: {
        loading: document.getElementById('loading-screen'),
        menu: document.getElementById('menu-screen'),
        settings: document.getElementById('settings-screen'),
        help: document.getElementById('help-screen'),
        game: document.getElementById('game-screen')
    },
    overlays: {
        pause: document.getElementById('pause-overlay'),
        confirm: document.getElementById('confirm-overlay'),
        gameover: document.getElementById('gameover-overlay'),
        victory: document.getElementById('victory-overlay')
    },
    isInitialized: false
};

// Classe principal do gerenciador do jogo
export class GameManager {
    constructor() {
        this.gameLoop = null;
        this.lastTime = 0;
    }

    async init() {
        console.log('🏛️ Inicializando Labirinto de Creta...');
        
        try {
            // Mostrar progresso de loading
            this.updateLoadingProgress(0, 'Carregando recursos...');
            
            // Inicializar sistema de telas
            this.initScreenSystem();
            this.updateLoadingProgress(25, 'Configurando interface...');
            
            // Inicializar controles e eventos
            this.initEventListeners();
            this.updateLoadingProgress(50, 'Configurando controles...');
            
            // Inicializar sistema de jogo
            await initGame();
            this.updateLoadingProgress(75, 'Preparando labirinto...');
            
            // Configurações finais
            this.initSettings();
            this.updateLoadingProgress(100, 'Pronto!');
            
            // Aguardar um pouco e mostrar o menu
            setTimeout(() => {
                this.showScreen('menu');
            }, 1000);
            
            console.log('✅ Jogo inicializado com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar o jogo:', error);
            this.showError('Erro ao carregar o jogo. Recarregue a página.');
        }
    }

    updateLoadingProgress(percent, message) {
        const progressBar = document.getElementById('loading-progress');
        const loadingText = document.getElementById('loading-text');
        
        if (progressBar) {
            progressBar.style.width = `${percent}%`;
        }
        
        if (loadingText) {
            loadingText.textContent = message;
        }
    }

    initScreenSystem() {
        // Garantir que apenas a tela de loading esteja visível
        Object.values(appState.screens).forEach(screen => {
            if (screen) {
                screen.classList.remove('active');
            }
        });
        
        Object.values(appState.overlays).forEach(overlay => {
            if (overlay) {
                overlay.style.display = 'none';
            }
        });
        
        // Mostrar tela de loading
        if (appState.screens.loading) {
            appState.screens.loading.classList.add('active');
        }
    }

    showScreen(screenName) {
        // Esconder todas as telas
        Object.values(appState.screens).forEach(screen => {
            if (screen) {
                screen.classList.remove('active');
            }
        });
        
        // Mostrar a tela solicitada
        if (appState.screens[screenName]) {
            appState.screens[screenName].classList.add('active');
            appState.currentScreen = screenName;
        }
        
        console.log(`🖥️ Mostrando tela: ${screenName}`);
    }

    showOverlay(overlayName) {
        if (appState.overlays[overlayName]) {
            appState.overlays[overlayName].style.display = 'flex';
        }
    }

    hideOverlay(overlayName) {
        if (appState.overlays[overlayName]) {
            appState.overlays[overlayName].style.display = 'none';
        }
    }

    initEventListeners() {
        // Botões do menu principal
        this.bindButton('btn-start-game', () => this.startNewGame());
        this.bindButton('btn-continue-game', () => this.continueGame());
        this.bindButton('btn-login', () => this.showLogin());
        this.bindButton('btn-settings', () => this.showScreen('settings'));
        this.bindButton('btn-help', () => this.showScreen('help'));

        // Botões de navegação
        this.bindButton('btn-back-from-settings', () => this.showScreen('menu'));
        this.bindButton('btn-back-from-help', () => this.showScreen('menu'));

        // Botões do jogo
        this.bindButton('btn-pause-game', () => this.pauseGame());
        this.bindButton('btn-restart-level', () => this.restartLevel());
        this.bindButton('btn-next-level', () => this.nextLevel());
        this.bindButton('btn-menu-game', () => this.returnToMenu());

        // Botões de overlay
        this.bindButton('btn-resume-game', () => this.resumeGame());
        this.bindButton('btn-restart-from-pause', () => this.restartFromPause());
        this.bindButton('btn-menu-from-pause', () => this.menuFromPause());

        // Confirmação
        this.bindButton('btn-confirm-yes', () => this.confirmAction(true));
        this.bindButton('btn-confirm-no', () => this.confirmAction(false));

        // Game Over
        this.bindButton('btn-retry-level', () => this.retryLevel());
        this.bindButton('btn-menu-from-gameover', () => this.menuFromGameOver());

        // Vitória
        this.bindButton('btn-next-level-victory', () => this.nextLevelFromVictory());
        this.bindButton('btn-replay-level', () => this.replayLevel());
        this.bindButton('btn-menu-from-victory', () => this.menuFromVictory());

        // Configurações
        this.bindButton('btn-save-settings', () => this.saveSettings());
        this.bindButton('btn-reset-settings', () => this.resetSettings());

        // Controles de teclado
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Redimensionamento da janela
        window.addEventListener('resize', () => this.handleResize());
    }

    bindButton(id, callback) {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', callback);
        }
    }

    startNewGame() {
        console.log('🎮 Iniciando novo jogo...');
        this.showScreen('game');
        
        // Inicializar o sistema de jogo
        if (typeof window.startGame === 'function') {
            window.startGame();
        } else {
            console.warn('⚠️ Função startGame não encontrada');
        }
        
        this.startGameLoop();
    }

    continueGame() {
        console.log('📖 Continuando jogo...');
        // Implementar carregamento de save
        this.showScreen('game');
        this.startGameLoop();
    }

    showLogin() {
        alert('🚧 O sistema de login será implementado em breve!\n\nPor enquanto, use "Iniciar Jogo" para jogar como convidado.');
    }

    pauseGame() {
        if (gameState) {
            gameState.state = 'paused';
        }
        this.showOverlay('pause');
        this.stopGameLoop();
    }

    resumeGame() {
        if (gameState) {
            gameState.state = 'playing';
        }
        this.hideOverlay('pause');
        this.startGameLoop();
    }

    restartLevel() {
        this.showConfirm('Reiniciar Nível', 'Tem certeza que deseja reiniciar o nível atual?', () => {
            if (typeof window.restartCurrentLevel === 'function') {
                window.restartCurrentLevel();
            }
            this.resumeGame();
        });
    }

    nextLevel() {
        if (typeof window.nextLevel === 'function') {
            window.nextLevel();
        }
    }

    returnToMenu() {
        this.showConfirm('Voltar ao Menu', 'Tem certeza que deseja voltar ao menu? O progresso será perdido.', () => {
            this.stopGameLoop();
            this.showScreen('menu');
        });
    }

    restartFromPause() {
        this.hideOverlay('pause');
        this.restartLevel();
    }

    menuFromPause() {
        this.hideOverlay('pause');
        this.returnToMenu();
    }

    retryLevel() {
        this.hideOverlay('gameover');
        if (typeof window.restartCurrentLevel === 'function') {
            window.restartCurrentLevel();
        }
        this.resumeGame();
    }

    menuFromGameOver() {
        this.hideOverlay('gameover');
        this.returnToMenu();
    }

    nextLevelFromVictory() {
        this.hideOverlay('victory');
        this.nextLevel();
    }

    replayLevel() {
        this.hideOverlay('victory');
        this.restartLevel();
    }

    menuFromVictory() {
        this.hideOverlay('victory');
        this.returnToMenu();
    }

    showConfirm(title, message, onConfirm) {
        document.getElementById('confirm-title').textContent = title;
        document.getElementById('confirm-message').textContent = message;
        this.pendingConfirmAction = onConfirm;
        this.showOverlay('confirm');
    }

    confirmAction(confirmed) {
        this.hideOverlay('confirm');
        if (confirmed && this.pendingConfirmAction) {
            this.pendingConfirmAction();
        }
        this.pendingConfirmAction = null;
    }

    showGameOver(message = 'O Minotauro te capturou!') {
        document.getElementById('gameover-message').textContent = message;
        this.showOverlay('gameover');
        this.stopGameLoop();
    }

    showVictory(level, time) {
        document.getElementById('victory-level').textContent = level;
        document.getElementById('victory-time').textContent = time;
        this.showOverlay('victory');
        this.stopGameLoop();
    }

    handleKeyDown(e) {
        if (appState.currentScreen === 'game') {
            switch (e.code) {
                case 'Escape':
                    e.preventDefault();
                    if (gameState && gameState.state === 'playing') {
                        this.pauseGame();
                    } else if (gameState && gameState.state === 'paused') {
                        this.resumeGame();
                    }
                    break;
                case 'KeyR':
                    e.preventDefault();
                    this.restartLevel();
                    break;
            }
        }
        
        // Passar evento para o sistema de jogo
        if (typeof window.handleGameInput === 'function') {
            window.handleGameInput(e, 'keydown');
        }
    }

    handleKeyUp(e) {
        // Passar evento para o sistema de jogo
        if (typeof window.handleGameInput === 'function') {
            window.handleGameInput(e, 'keyup');
        }
    }

    handleResize() {
        if (typeof window.handleGameResize === 'function') {
            window.handleGameResize();
        }
    }

    startGameLoop() {
        if (this.gameLoop) return; // Já está rodando
        
        const loop = (currentTime) => {
            const deltaTime = currentTime - this.lastTime;
            this.lastTime = currentTime;
            
            // Atualizar jogo
            if (typeof updateGame === 'function') {
                updateGame(deltaTime);
            }
            
            // Renderizar jogo
            if (typeof renderGame === 'function') {
                renderGame();
            }
            
            // Atualizar HUD
            this.updateHUD();
            
            this.gameLoop = requestAnimationFrame(loop);
        };
        
        this.gameLoop = requestAnimationFrame(loop);
        console.log('🔄 Game loop iniciado');
    }

    stopGameLoop() {
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
            console.log('⏹️ Game loop parado');
        }
    }

    updateHUD() {
        if (!gameState) return;
        
        // Atualizar elementos do HUD
        const hudLevel = document.getElementById('hud-level');
        const hudTime = document.getElementById('hud-time');
        const hudThread = document.getElementById('hud-thread');
        const hudMinotaur = document.getElementById('hud-minotaur');
        
        if (hudLevel) hudLevel.textContent = gameState.level || 1;
        if (hudTime) hudTime.textContent = `${Math.floor((gameState.timeMs || 0) / 1000)}s`;
        if (hudThread) hudThread.textContent = gameState.fioAtivo ? 'ATIVO' : 'INATIVO';
        if (hudMinotaur && gameState.minotaur) {
            hudMinotaur.textContent = gameState.minotaur.state || 'PATRULHA';
        }
    }

    initSettings() {
        // Carregar configurações salvas
        const settings = this.loadSettings();
        this.applySettings(settings);
    }

    loadSettings() {
        const defaultSettings = {
            volumeMaster: 70,
            soundEffects: true,
            backgroundMusic: true,
            controlScheme: 'wasd',
            movementSpeed: 100,
            graphicsQuality: 'high',
            lightingEffects: true,
            particleEffects: true,
            difficulty: 'normal',
            showMinimap: false,
            showHints: true
        };
        
        try {
            const saved = localStorage.getItem('labirinto-settings');
            return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        } catch (e) {
            console.warn('⚠️ Erro ao carregar configurações:', e);
            return defaultSettings;
        }
    }

    applySettings(settings) {
        // Aplicar configurações à interface
        Object.entries(settings).forEach(([key, value]) => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else if (element.type === 'range') {
                    element.value = value;
                    // Atualizar display do valor
                    const display = document.querySelector(`.${key.replace(/([A-Z])/g, '-$1').toLowerCase()}-value`);
                    if (display) {
                        display.textContent = typeof value === 'number' ? `${value}%` : value;
                    }
                } else {
                    element.value = value;
                }
            }
        });
    }

    saveSettings() {
        const settings = {};
        
        // Coletar valores dos controles
        const controls = [
            'volume-master', 'sound-effects', 'background-music',
            'control-scheme', 'movement-speed', 'graphics-quality',
            'lighting-effects', 'particle-effects', 'difficulty',
            'show-minimap', 'show-hints'
        ];
        
        controls.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                const key = id.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                if (element.type === 'checkbox') {
                    settings[key] = element.checked;
                } else if (element.type === 'range') {
                    settings[key] = parseInt(element.value);
                } else {
                    settings[key] = element.value;
                }
            }
        });
        
        try {
            localStorage.setItem('labirinto-settings', JSON.stringify(settings));
            console.log('💾 Configurações salvas:', settings);
            
            // Feedback visual
            const saveBtn = document.getElementById('btn-save-settings');
            if (saveBtn) {
                const originalText = saveBtn.textContent;
                saveBtn.textContent = '✅ Salvo!';
                setTimeout(() => {
                    saveBtn.textContent = originalText;
                }, 2000);
            }
        } catch (e) {
            console.error('❌ Erro ao salvar configurações:', e);
            alert('Erro ao salvar configurações');
        }
    }

    resetSettings() {
        if (confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
            localStorage.removeItem('labirinto-settings');
            this.initSettings();
            console.log('🔄 Configurações restauradas');
        }
    }

    showError(message) {
        console.error('❌', message);
        alert(`❌ ${message}`);
    }
}

// Exportar instância global para compatibilidade
window.GameManager = GameManager;