// LABIRINTO DE CRETA - SISTEMA COMPLETO COM TELAS

// Sistema de Sprites
const sprites = {
  player: {
    image: null,
    frameWidth: 32,
    frameHeight: 32,
    animations: {
      idle: { frames: [0], speed: 500 },
      walk: { frames: [0, 1, 2, 3], speed: 150 }
    },
    currentAnim: 'idle',
    currentFrame: 0,
    animTimer: 0
  },
  minotaur: {
    image: null,
    frameWidth: 32,
    frameHeight: 32,
    animations: {
      idle: { frames: [0], speed: 500 },
      walk: { frames: [0, 1, 2, 3], speed: 200 },
      chase: { frames: [0, 1, 2, 3], speed: 100 }
    },
    currentAnim: 'idle',
    currentFrame: 0,
    animTimer: 0
  }
};

// Estado do jogo
const game = {
  level: 1,
  time: 0,
  state: 'menu',
  maze: null,
  player: null,
  minotaur: null,
  fioActive: false,
  seed: Date.now(),
  spritesLoaded: false
};

// Elementos DOM
const elements = {
  menu: document.getElementById('menu'),
  gameContainer: document.getElementById('game-container'),
  canvas: document.getElementById('canvas'),
  level: document.getElementById('level'),
  time: document.getElementById('time'),
  fio: document.getElementById('fio'),
  message: document.getElementById('message'),
  nextLevel: document.getElementById('nextLevel'),
  restart: document.getElementById('restart')
};

// Canvas e contexto
let ctx, lastTime = 0;

// Funcao para carregar sprites
function loadSprites() {
  return new Promise((resolve) => {
    let loadedCount = 0;
    const totalSprites = 2;
    
    function onSpriteLoad() {
      loadedCount++;
      if (loadedCount === totalSprites) {
        game.spritesLoaded = true;
        console.log('🎨 Sprites carregados com sucesso!');
        resolve();
      }
    }
    
    // Criar sprites usando canvas (sprites embutidos)
    sprites.player.image = createPlayerSprite();
    sprites.minotaur.image = createMinotaurSprite();
    
    // Simular carregamento
    setTimeout(() => {
      onSpriteLoad();
      onSpriteLoad();
    }, 100);
  });
}

// Criar sprite do player (Teseu) em pixel art
function createPlayerSprite() {
  const canvas = document.createElement('canvas');
  canvas.width = 128; // 4 frames de 32px
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  
  // Frame 0 - Idle
  drawPlayerFrame(ctx, 0, 0);
  // Frame 1 - Walk 1
  drawPlayerFrame(ctx, 32, 1);
  // Frame 2 - Walk 2
  drawPlayerFrame(ctx, 64, 2);
  // Frame 3 - Walk 3
  drawPlayerFrame(ctx, 96, 3);
  
  return canvas;
}

// Desenhar frame do player
function drawPlayerFrame(ctx, x, frameType) {
  ctx.imageSmoothingEnabled = false;
  
  // Cores do Teseu
  const colors = {
    skin: '#D4A574',
    hair: '#8B4513',
    tunic: '#DAA520',
    cape: '#DC143C',
    sword: '#C0C0C0',
    shield: '#4682B4'
  };
  
  // Cabeça
  ctx.fillStyle = colors.skin;
  ctx.fillRect(x + 12, 4, 8, 8);
  
  // Cabelo
  ctx.fillStyle = colors.hair;
  ctx.fillRect(x + 10, 2, 12, 6);
  
  // Corpo (túnica)
  ctx.fillStyle = colors.tunic;
  ctx.fillRect(x + 10, 12, 12, 12);
  
  // Capa
  ctx.fillStyle = colors.cape;
  ctx.fillRect(x + 8, 14, 4, 10);
  ctx.fillRect(x + 20, 14, 4, 10);
  
  // Braços
  ctx.fillStyle = colors.skin;
  ctx.fillRect(x + 6, 14, 4, 8);
  ctx.fillRect(x + 22, 14, 4, 8);
  
  // Pernas (animação de caminhada)
  const legOffset = frameType === 1 ? 1 : frameType === 3 ? -1 : 0;
  ctx.fillStyle = colors.tunic;
  ctx.fillRect(x + 12 + legOffset, 24, 3, 6);
  ctx.fillRect(x + 17 - legOffset, 24, 3, 6);
  
  // Espada
  ctx.fillStyle = colors.sword;
  ctx.fillRect(x + 24, 10, 2, 8);
  
  // Escudo
  ctx.fillStyle = colors.shield;
  ctx.fillRect(x + 4, 12, 4, 6);
}

// Criar sprite do minotauro
function createMinotaurSprite() {
  const canvas = document.createElement('canvas');
  canvas.width = 128; // 4 frames de 32px
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  
  // Frame 0 - Idle
  drawMinotaurFrame(ctx, 0, 0);
  // Frame 1 - Walk 1
  drawMinotaurFrame(ctx, 32, 1);
  // Frame 2 - Walk 2
  drawMinotaurFrame(ctx, 64, 2);
  // Frame 3 - Walk 3
  drawMinotaurFrame(ctx, 96, 3);
  
  return canvas;
}

// Desenhar frame do minotauro
function drawMinotaurFrame(ctx, x, frameType) {
  ctx.imageSmoothingEnabled = false;
  
  // Cores do Minotauro
  const colors = {
    fur: '#8B4513',
    darkFur: '#654321',
    horns: '#F5DEB3',
    eyes: '#FF0000',
    nose: '#000000',
    hooves: '#2F4F4F'
  };
  
  // Corpo principal
  ctx.fillStyle = colors.fur;
  ctx.fillRect(x + 8, 10, 16, 16);
  
  // Pelo mais escuro (sombras)
  ctx.fillStyle = colors.darkFur;
  ctx.fillRect(x + 8, 22, 16, 4);
  
  // Cabeça de touro
  ctx.fillStyle = colors.fur;
  ctx.fillRect(x + 10, 2, 12, 10);
  
  // Chifres
  ctx.fillStyle = colors.horns;
  ctx.fillRect(x + 8, 0, 3, 4);
  ctx.fillRect(x + 21, 0, 3, 4);
  
  // Olhos vermelhos
  ctx.fillStyle = colors.eyes;
  ctx.fillRect(x + 12, 5, 2, 2);
  ctx.fillRect(x + 18, 5, 2, 2);
  
  // Focinho
  ctx.fillStyle = colors.darkFur;
  ctx.fillRect(x + 14, 8, 4, 3);
  
  // Narinas
  ctx.fillStyle = colors.nose;
  ctx.fillRect(x + 15, 9, 1, 1);
  ctx.fillRect(x + 17, 9, 1, 1);
  
  // Braços
  ctx.fillStyle = colors.fur;
  ctx.fillRect(x + 4, 12, 4, 10);
  ctx.fillRect(x + 24, 12, 4, 10);
  
  // Pernas (animação)
  const legOffset = frameType === 1 ? 1 : frameType === 3 ? -1 : 0;
  ctx.fillStyle = colors.fur;
  ctx.fillRect(x + 10 + legOffset, 26, 4, 4);
  ctx.fillRect(x + 18 - legOffset, 26, 4, 4);
  
  // Cascos
  ctx.fillStyle = colors.hooves;
  ctx.fillRect(x + 10 + legOffset, 29, 4, 2);
  ctx.fillRect(x + 18 - legOffset, 29, 4, 2);
}

// CLASSE MAZE
class Maze {
  constructor(size, seed) {
    size = Math.max(15, Math.min(size || 21, 31));
    this.size = size;
    this.seed = seed || game.seed;
    
    this.walls = this.generate();
    this.start = { x: 1, y: 1 };
    this.exit = { x: size - 2, y: size - 2 };
    this.minotaurStart = { x: size - 2, y: 1 };
  }
  
  generate() {
    const { size } = this;
    const walls = Array(size).fill().map(() => Array(size).fill(1));
    
    // Criar corredores básicos
    for (let y = 1; y < size - 1; y += 2) {
      for (let x = 1; x < size - 1; x += 2) {
        walls[y][x] = 0;
      }
    }
    
    // Conectar corredores
    const rng = this.createRNG(this.seed);
    for (let y = 1; y < size - 1; y += 2) {
      for (let x = 1; x < size - 1; x += 2) {
        if (x + 2 < size - 1 && rng() < 0.7) {
          walls[y][x + 1] = 0;
        }
        if (y + 2 < size - 1 && rng() < 0.7) {
          walls[y + 1][x] = 0;
        }
      }
    }
    
    // Garantir caminho para saída
    walls[size - 2][size - 2] = 0;
    walls[size - 2][size - 3] = 0;
    walls[size - 3][size - 2] = 0;
    
    return walls;
  }
  
  createRNG(seed) {
    return function() {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }
  
  isWall(x, y) {
    if (x < 0 || y < 0 || x >= this.size || y >= this.size) return true;
    return this.walls[Math.floor(y)][Math.floor(x)] === 1;
  }
}

// CLASSE PLAYER
class Player {
  constructor(startPos) {
    this.x = startPos.x + 0.5;
    this.y = startPos.y + 0.5;
    this.speed = 3;
    this.trail = [];
    this.trailTimer = 0;
    this.isMoving = false;
    this.direction = 0; // 0=right, 1=down, 2=left, 3=up
  }
  
  update(dt) {
    // Atualizar animação
    const anim = this.isMoving ? 'walk' : 'idle';
    if (sprites.player.currentAnim !== anim) {
      sprites.player.currentAnim = anim;
      sprites.player.currentFrame = 0;
      sprites.player.animTimer = 0;
    }
    
    sprites.player.animTimer += dt;
    const animData = sprites.player.animations[sprites.player.currentAnim];
    if (sprites.player.animTimer > animData.speed) {
      sprites.player.animTimer = 0;
      sprites.player.currentFrame = (sprites.player.currentFrame + 1) % animData.frames.length;
    }
    
    if (game.fioActive) {
      this.trailTimer += dt;
      if (this.trailTimer > 100) {
        this.trailTimer = 0;
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 30) {
          this.trail = this.trail.slice(-30);
        }
      }
    }
    
    this.isMoving = false; // Reset a cada frame
  }
  
  move(dx, dy, dt) {
    const oldX = this.x;
    const oldY = this.y;
    
    const speed = this.speed * dt / 1000;
    const newX = this.x + dx * speed;
    const newY = this.y + dy * speed;
    
    let moved = false;
    
    if (!game.maze.isWall(newX - 0.3, this.y) && !game.maze.isWall(newX + 0.3, this.y)) {
      this.x = newX;
      moved = true;
      this.direction = dx > 0 ? 0 : 2; // direita ou esquerda
    }
    if (!game.maze.isWall(this.x, newY - 0.3) && !game.maze.isWall(this.x, newY + 0.3)) {
      this.y = newY;
      moved = true;
      this.direction = dy > 0 ? 1 : 3; // baixo ou cima
    }
    
    this.isMoving = moved;
    
    // Sistema de ruído - movimento rápido gera ruído para o Minotauro
    if (moved && game.minotaur) {
      const distanceMoved = Math.sqrt((this.x - oldX) ** 2 + (this.y - oldY) ** 2);
      const noiseIntensity = Math.min(distanceMoved * 20, 2); // Ruído proporcional à velocidade
      
      if (noiseIntensity > 0.1) {
        game.minotaur.onPlayerNoise({ x: this.x, y: this.y }, noiseIntensity);
      }
    }
  }
}

// CLASSE MINOTAUR RENOVADA - usando MinotaurAI genérico
class Minotaur {
  constructor(startPos) {
    this.x = startPos.x + 0.5;
    this.y = startPos.y + 0.5;
    this.isMoving = false;
    this.facingDirection = 0; // 0=right, 1=down, 2=left, 3=up
    
    // Configurar hooks para o MinotaurAI
    const aiHooks = {
      // Verificar se um tile é caminhável
      isWalkable: (tile) => {
        return !game.maze.isWall(tile.x, tile.y);
      },
      
      // Verificar linha de visão (ray casting)
      hasLineOfSight: (from, to) => {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.floor(distance * 2);
        
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const checkX = from.x + dx * t;
          const checkY = from.y + dy * t;
          if (game.maze.isWall(checkX, checkY)) return false;
        }
        return true;
      },
      
      // Obter vizinhos caminháveis (4 direções)
      getNeighbors: (tile) => {
        const neighbors = [
          { x: tile.x + 1, y: tile.y },
          { x: tile.x - 1, y: tile.y },
          { x: tile.x, y: tile.y + 1 },
          { x: tile.x, y: tile.y - 1 }
        ];
        return neighbors.filter(nb => !game.maze.isWall(nb.x, nb.y));
      },
      
      // Pathfinding A* customizado para melhor performance
      findPath: (from, to) => {
        return this.aStarPath(from, to);
      }
    };
    
    // Configuração da IA - MINOTAURO IMPLACÁVEL
    const aiConfig = {
      speed: 2200,              // tiles por segundo (convertido para ms)
      chaseSpeed: 3000,         // MUITO mais rápido durante perseguição
      sightRange: 25,           // VISÃO QUASE TOTAL do labirinto
      fovDeg: 300,              // Campo de visão quase completo (360°)
      hearingRadius: 20,        // AUDIÇÃO SUPERNATURAL - escuta tudo
      memorySeconds: 60,        // NUNCA esquece onde viu o jogador (1 minuto)
      searchSeconds: 120,       // Procura por 2 minutos sem parar
      repathInterval: 0.1,      // Recalcula caminho 10x por segundo - MUITO reativo
      wanderJitter: 0.8,        // Movimento mais errático quando procurando
      patrolPoints: []          // Sem patrulha - só perseguição
    };
    
    // Inicializar IA
    this.ai = new MinotaurAI(aiHooks, aiConfig);
  }
  
  update(dt) {
    // Posição atual
    const currentPos = { x: this.x, y: this.y };
    const playerPos = { x: game.player.x, y: game.player.y };
    
    // FORÇAR PERSEGUIÇÃO CONSTANTE - Minotauro sempre sabe onde está o jogador
    this.ai.lastSeenPlayerAt = { ...playerPos };
    this.ai.memoryTimer = this.ai.cfg.memorySeconds; // Resetar memória constantemente
    
    // Garantir que está sempre no modo CHASE
    if (this.ai.getState() !== 'CHASE' && this.ai.getState() !== 'STUNNED') {
      this.ai.enter('CHASE');
    }
    
    // Gerar ruído constante do jogador para manter a perseguição
    this.ai.onNoise(playerPos, 2.0);
    
    // Atualizar IA e obter nova posição
    const newPos = this.ai.update(dt, currentPos, playerPos);
    
    // Verificar se houve movimento
    const moved = (Math.abs(newPos.x - this.x) > 0.01 || Math.abs(newPos.y - this.y) > 0.01);
    this.isMoving = moved;
    
    // Atualizar posição com verificação de colisão
    if (moved) {
      if (!game.maze.isWall(newPos.x - 0.3, this.y) && !game.maze.isWall(newPos.x + 0.3, this.y)) {
        this.x = newPos.x;
        this.facingDirection = newPos.x > this.x ? 0 : 2;
      }
      if (!game.maze.isWall(this.x, newPos.y - 0.3) && !game.maze.isWall(this.x, newPos.y + 0.3)) {
        this.y = newPos.y;
        this.facingDirection = newPos.y > this.y ? 1 : 3;
      }
    }
    
    // Atualizar animação baseada no estado da IA
    const state = this.ai.getState();
    let anim = 'idle';
    
    if (this.isMoving) {
      switch(state) {
        case 'CHASE': anim = 'chase'; break;
        case 'SEARCH': anim = 'chase'; break;
        default: anim = 'walk'; break;
      }
    }
    
    if (sprites.minotaur.currentAnim !== anim) {
      sprites.minotaur.currentAnim = anim;
      sprites.minotaur.currentFrame = 0;
      sprites.minotaur.animTimer = 0;
    }
    
    sprites.minotaur.animTimer += dt;
    const animData = sprites.minotaur.animations[sprites.minotaur.currentAnim];
    if (sprites.minotaur.animTimer > animData.speed) {
      sprites.minotaur.animTimer = 0;
      sprites.minotaur.currentFrame = (sprites.minotaur.currentFrame + 1) % animData.frames.length;
    }
  }
  
  // Implementação A* otimizada
  aStarPath(start, goal) {
    const key = (pos) => `${Math.round(pos.x)},${Math.round(pos.y)}`;
    const heuristic = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    
    const openSet = [start];
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();
    
    gScore.set(key(start), 0);
    fScore.set(key(start), heuristic(start, goal));
    
    while (openSet.length > 0) {
      // Encontrar nó com menor fScore
      let current = openSet[0];
      let currentIndex = 0;
      
      for (let i = 1; i < openSet.length; i++) {
        const currentKey = key(openSet[i]);
        const bestKey = key(current);
        if ((fScore.get(currentKey) || Infinity) < (fScore.get(bestKey) || Infinity)) {
          current = openSet[i];
          currentIndex = i;
        }
      }
      
      if (Math.round(current.x) === Math.round(goal.x) && Math.round(current.y) === Math.round(goal.y)) {
        // Reconstruir caminho
        const path = [];
        let temp = current;
        while (temp) {
          path.unshift(temp);
          temp = cameFrom.get(key(temp));
        }
        return path.slice(1); // Remove posição inicial
      }
      
      openSet.splice(currentIndex, 1);
      
      // Examinar vizinhos
      const neighbors = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 }
      ];
      
      for (const neighbor of neighbors) {
        if (game.maze.isWall(neighbor.x, neighbor.y)) continue;
        
        const neighborKey = key(neighbor);
        const tentativeGScore = (gScore.get(key(current)) || Infinity) + 1;
        
        if (tentativeGScore < (gScore.get(neighborKey) || Infinity)) {
          cameFrom.set(neighborKey, current);
          gScore.set(neighborKey, tentativeGScore);
          fScore.set(neighborKey, tentativeGScore + heuristic(neighbor, goal));
          
          if (!openSet.some(node => key(node) === neighborKey)) {
            openSet.push(neighbor);
          }
        }
      }
      
      // Limite para evitar travamentos
      if (openSet.length > 100) break;
    }
    
    return []; // Nenhum caminho encontrado
  }
  
  // Método para notificar ruído (quando jogador faz barulho)
  onPlayerNoise(position, intensity = 1) {
    this.ai.onNoise(position, intensity);
  }
  
  // Métodos de controle externo
  stun() {
    this.ai.stun();
  }
  
  wakeUp() {
    this.ai.wakeUp();
  }
}

// RENDERER
class Renderer {
  constructor() {
    this.cellSize = 20;
    this.offsetX = 0;
    this.offsetY = 0;
  }
  
  render() {
    if (!ctx || !game.maze) return;
    
    const canvas = elements.canvas;
    const { width, height } = canvas;
    
    // Background com gradiente
    const bgGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height));
    bgGradient.addColorStop(0, '#1a1a1a');
    bgGradient.addColorStop(1, '#000000');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
    const mazePixelSize = game.maze.size * this.cellSize;
    this.offsetX = (width - mazePixelSize) / 2;
    this.offsetY = (height - mazePixelSize) / 2;
    
    this.drawMaze();
    this.drawTrail();
    this.drawPlayer();
    this.drawMinotaur();
    this.drawExit();
    this.drawEffects();
  }
  
  drawMaze() {
    const { maze } = game;
    const { walls } = maze;
    
    for (let y = 0; y < maze.size; y++) {
      for (let x = 0; x < maze.size; x++) {
        const px = this.offsetX + x * this.cellSize;
        const py = this.offsetY + y * this.cellSize;
        
        if (walls[y][x] === 1) {
          // Parede com gradiente
          const wallGradient = ctx.createLinearGradient(px, py, px + this.cellSize, py + this.cellSize);
          wallGradient.addColorStop(0, '#5a5a5a');
          wallGradient.addColorStop(0.5, '#3a3a3a');
          wallGradient.addColorStop(1, '#2a2a2a');
          ctx.fillStyle = wallGradient;
          ctx.fillRect(px, py, this.cellSize, this.cellSize);
          
          // Borda da parede
          ctx.strokeStyle = '#1a1a1a';
          ctx.lineWidth = 1;
          ctx.strokeRect(px, py, this.cellSize, this.cellSize);
        } else {
          // Chão com textura sutil
          const floorGradient = ctx.createRadialGradient(
            px + this.cellSize/2, py + this.cellSize/2, 0,
            px + this.cellSize/2, py + this.cellSize/2, this.cellSize
          );
          floorGradient.addColorStop(0, '#0f0f0f');
          floorGradient.addColorStop(1, '#050505');
          ctx.fillStyle = floorGradient;
          ctx.fillRect(px, py, this.cellSize, this.cellSize);
        }
      }
    }
  }
  
  drawTrail() {
    if (!game.fioActive || game.player.trail.length < 2) return;
    
    const trail = game.player.trail;
    
    // Desenhar o brilho do fio
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ffd700';
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    const first = trail[0];
    ctx.moveTo(
      this.offsetX + first.x * this.cellSize,
      this.offsetY + first.y * this.cellSize
    );
    
    // Desenhar com gradiente de opacidade
    for (let i = 1; i < trail.length; i++) {
      const point = trail[i];
      const alpha = i / trail.length; // Mais transparente no começo
      ctx.globalAlpha = alpha * 0.8 + 0.2;
      
      ctx.lineTo(
        this.offsetX + point.x * this.cellSize,
        this.offsetY + point.y * this.cellSize
      );
    }
    
    ctx.stroke();
    
    // Reset
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
  
  drawPlayer() {
    const { player } = game;
    if (!game.spritesLoaded || !sprites.player.image) return;
    
    const px = this.offsetX + (player.x - 0.5) * this.cellSize;
    const py = this.offsetY + (player.y - 0.5) * this.cellSize;
    
    // Halo do jogador (efeito de brilho)
    const radius = this.cellSize * 0.6;
    const haloGradient = ctx.createRadialGradient(px + this.cellSize/2, py + this.cellSize/2, 0, px + this.cellSize/2, py + this.cellSize/2, radius);
    haloGradient.addColorStop(0, 'rgba(218, 165, 32, 0.3)');
    haloGradient.addColorStop(1, 'rgba(218, 165, 32, 0)');
    ctx.fillStyle = haloGradient;
    ctx.beginPath();
    ctx.arc(px + this.cellSize/2, py + this.cellSize/2, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Desenhar sprite do player
    ctx.save();
    
    // Aplicar transformação baseada na direção
    const centerX = px + this.cellSize/2;
    const centerY = py + this.cellSize/2;
    
    ctx.translate(centerX, centerY);
    
    // Espelhar se estiver indo para a esquerda
    if (player.direction === 2) {
      ctx.scale(-1, 1);
    }
    
    // Desenhar sprite
    const animData = sprites.player.animations[sprites.player.currentAnim];
    const frameIndex = animData.frames[sprites.player.currentFrame];
    const srcX = frameIndex * sprites.player.frameWidth;
    
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      sprites.player.image,
      srcX, 0,
      sprites.player.frameWidth, sprites.player.frameHeight,
      -this.cellSize/2, -this.cellSize/2,
      this.cellSize, this.cellSize
    );
    
    ctx.restore();
  }
  
  drawMinotaur() {
    const { minotaur } = game;
    if (!game.spritesLoaded || !sprites.minotaur.image) return;
    
    const mx = this.offsetX + (minotaur.x - 0.5) * this.cellSize;
    const my = this.offsetY + (minotaur.y - 0.5) * this.cellSize;
    
    // Usar estado da nova IA
    const aiState = minotaur.ai ? minotaur.ai.getState() : 'PATROL';
    const isChasing = aiState === 'CHASE';
    const isSearching = aiState === 'SEARCH';
    
    // AURA IMPLACÁVEL - sempre vermelha e intensa quando usando nova IA
    const auraRadius = isChasing ? this.cellSize * 2 : (isSearching ? this.cellSize * 1.5 : this.cellSize * 1);
    let auraColor;
    
    if (isChasing) {
      auraColor = 'rgba(255, 0, 0, 0.8)'; // Vermelho sangue intenso
    } else if (isSearching) {
      auraColor = 'rgba(255, 100, 0, 0.6)'; // Laranja quando procurando
    } else {
      auraColor = 'rgba(139, 69, 19, 0.4)'; // Marrom quando patrulhando
    }
    
    const auraGradient = ctx.createRadialGradient(mx + this.cellSize/2, my + this.cellSize/2, 0, mx + this.cellSize/2, my + this.cellSize/2, auraRadius);
    auraGradient.addColorStop(0, auraColor);
    auraGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
    ctx.fillStyle = auraGradient;
    ctx.beginPath();
    ctx.arc(mx + this.cellSize/2, my + this.cellSize/2, auraRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // EFEITO DRAMATICO - sombra vermelha pulsante quando perseguindo
    if (isChasing) {
      ctx.shadowBlur = 20 + Math.sin(Date.now() / 100) * 5; // Pulsação
      ctx.shadowColor = '#FF0000';
      
      // Linhas de energia emanando do Minotauro
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const x1 = mx + this.cellSize/2 + Math.cos(angle) * this.cellSize * 0.8;
        const y1 = my + this.cellSize/2 + Math.sin(angle) * this.cellSize * 0.8;
        const x2 = mx + this.cellSize/2 + Math.cos(angle) * this.cellSize * 1.5;
        const y2 = my + this.cellSize/2 + Math.sin(angle) * this.cellSize * 1.5;
        
        ctx.strokeStyle = `rgba(255, 0, 0, ${0.3 + Math.sin(Date.now() / 50 + i) * 0.3})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    } else if (isSearching) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#FF6600';
    } else {
      ctx.shadowBlur = 5;
      ctx.shadowColor = '#8B4513';
    }
    
    // Desenhar sprite do minotauro
    ctx.save();
    
    // Aplicar transformação baseada na direção
    const centerX = mx + this.cellSize/2;
    const centerY = my + this.cellSize/2;
    
    ctx.translate(centerX, centerY);
    
    // Espelhar se estiver indo para a esquerda
    if (minotaur.facingDirection === 2) {
      ctx.scale(-1, 1);
    }
    
    // Aplicar tint vermelho quando perseguindo
    if (isChasing) {
      ctx.filter = 'hue-rotate(20deg) saturate(150%) brightness(110%)';
    }
    
    // Desenhar sprite
    const animData = sprites.minotaur.animations[sprites.minotaur.currentAnim];
    const frameIndex = animData.frames[sprites.minotaur.currentFrame];
    const srcX = frameIndex * sprites.minotaur.frameWidth;
    
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      sprites.minotaur.image,
      srcX, 0,
      sprites.minotaur.frameWidth, sprites.minotaur.frameHeight,
      -this.cellSize/2, -this.cellSize/2,
      this.cellSize, this.cellSize
    );
    
    ctx.filter = 'none';
    ctx.shadowBlur = 0;
    ctx.restore();
    
    // Efeito de olhos brilhantes quando perseguindo
    if (isChasing) {
      ctx.fillStyle = '#FFFF00';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#FFFF00';
      
      // Olhos brilhantes
      ctx.beginPath();
      ctx.arc(mx + this.cellSize * 0.3, my + this.cellSize * 0.25, 2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(mx + this.cellSize * 0.7, my + this.cellSize * 0.25, 2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.shadowBlur = 0;
    }
  }
  
  drawExit() {
    const { exit } = game.maze;
    const ex = this.offsetX + (exit.x + 0.5) * this.cellSize;
    const ey = this.offsetY + (exit.y + 0.5) * this.cellSize;
    const size = this.cellSize * 0.8;
    
    // Animação pulsante
    const time = Date.now() * 0.005;
    const pulse = Math.sin(time) * 0.1 + 1;
    const glowSize = size * pulse;
    
    // Brilho da saída
    const exitGlow = ctx.createRadialGradient(ex, ey, 0, ex, ey, glowSize);
    exitGlow.addColorStop(0, 'rgba(255, 215, 0, 0.6)');
    exitGlow.addColorStop(0.5, 'rgba(255, 215, 0, 0.3)');
    exitGlow.addColorStop(1, 'rgba(255, 215, 0, 0)');
    
    ctx.fillStyle = exitGlow;
    ctx.beginPath();
    ctx.arc(ex, ey, glowSize, 0, Math.PI * 2);
    ctx.fill();
    
    // Saída principal
    const exitGradient = ctx.createLinearGradient(ex - size/2, ey - size/2, ex + size/2, ey + size/2);
    exitGradient.addColorStop(0, '#FFEB3B');
    exitGradient.addColorStop(0.5, '#FFD700');
    exitGradient.addColorStop(1, '#FFA000');
    
    ctx.fillStyle = exitGradient;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#FFD700';
    
    ctx.fillRect(
      ex - size/2,
      ey - size/2,
      size,
      size
    );
    
    // Borda dourada
    ctx.strokeStyle = '#FF8F00';
    ctx.lineWidth = 3;
    ctx.strokeRect(
      ex - size/2,
      ey - size/2,
      size,
      size
    );
    
    ctx.shadowBlur = 0;
  }
  
  drawEffects() {
    // Partículas flutuantes ambientais
    const time = Date.now() * 0.001;
    
    for (let i = 0; i < 20; i++) {
      const x = (Math.sin(time + i) * 50) + (i * 40) % elements.canvas.width;
      const y = (Math.cos(time * 0.7 + i * 0.5) * 30) + (i * 30) % elements.canvas.height;
      const opacity = (Math.sin(time * 2 + i) + 1) * 0.1;
      
      ctx.fillStyle = `rgba(255, 215, 0, ${opacity})`;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// INPUT
const keys = new Set();

function setupInput() {
  window.addEventListener('keydown', (e) => {
    keys.add(e.code);
    
    if (e.code === 'Escape' && game.state === 'playing') {
      game.state = 'paused';
      showMessage('Jogo pausado. Pressione ESC novamente para continuar.');
    } else if (e.code === 'Escape' && game.state === 'paused') {
      game.state = 'playing';
      showMessage('Encontre a saida!');
    }
  });
  
  window.addEventListener('keyup', (e) => {
    keys.delete(e.code);
  });
}

function processInput(dt) {
  if (game.state !== 'playing') return;
  
  let dx = 0, dy = 0;
  
  if (keys.has('KeyW') || keys.has('ArrowUp')) dy = -1;
  if (keys.has('KeyS') || keys.has('ArrowDown')) dy = 1;
  if (keys.has('KeyA') || keys.has('ArrowLeft')) dx = -1;
  if (keys.has('KeyD') || keys.has('ArrowRight')) dx = 1;
  
  game.fioActive = keys.has('Space');
  
  if (dx !== 0 || dy !== 0) {
    game.player.move(dx, dy, dt);
  }
}

// GAME LOGIC
function startLevel(level, customSeed = null) {
  console.log(`🏰 Iniciando nível ${level}${customSeed ? ' (semente fixa)' : ''}`);
  
  game.level = level;
  game.time = 0;
  game.state = 'playing';
  
  // Usar semente customizada ou gerar nova
  if (customSeed) {
    game.seed = customSeed;
  } else {
    game.seed = Date.now() + level * 12345;
  }
  
  // Atualizar estado global se disponível
  if (window.estadoJogo) {
    estadoJogo.semente = game.seed;
    estadoJogo.nivel = level;
    
    // Resetar estatísticas
    estadoJogo.stats.tempo = 0;
    estadoJogo.stats.passos = 0;
    estadoJogo.stats.fioUsado = 0;
    estadoJogo.stats.distanciaPercorrida = 0;
  }
  
  if (game.player) game.player.trail = [];
  
  const size = Math.min(15 + (level - 1) * 2, 31);
  game.maze = new Maze(size, game.seed + level);
  game.player = new Player(game.maze.start);
  game.minotaur = new Minotaur(game.maze.minotaurStart);
  
  // Aplicar configurações de dificuldade
  aplicarDificuldade();
  
  updateHUD();
  
  // Mostrar mensagem de início
  mostrarMensagemTemporaria('Encontre a saída sem ser capturado pelo Minotauro!');
  
  console.log('Nivel ' + level + ' iniciado - Maze ' + size + 'x' + size);
}

function aplicarDificuldade() {
  if (!window.estadoJogo || !game.minotaur?.ai) return;
  
  const dificuldade = estadoJogo.config?.dificuldade || 'normal';
  
  // Resetar para valores padrão antes de aplicar modificadores
  const configBase = {
    speed: 2200,
    chaseSpeed: 3000,
    sightRange: 25,
    memorySeconds: 60,
    repathInterval: 0.1
  };
  
  let multiplicador = 1;
  
  switch (dificuldade) {
    case 'facil':
      multiplicador = 0.7;
      game.minotaur.ai.cfg.sightRange = 15;
      game.minotaur.ai.cfg.memorySeconds = 30;
      break;
    case 'dificil':
      multiplicador = 1.3;
      game.minotaur.ai.cfg.sightRange = 30;
      game.minotaur.ai.cfg.memorySeconds = 90;
      break;
    case 'pesadelo':
      multiplicador = 1.8;
      game.minotaur.ai.cfg.sightRange = 35;
      game.minotaur.ai.cfg.memorySeconds = 120;
      game.minotaur.ai.cfg.repathInterval = 0.05;
      break;
  }
  
  // Aplicar modificador de velocidade
  game.minotaur.ai.cfg.speed = configBase.speed * multiplicador;
  game.minotaur.ai.cfg.chaseSpeed = configBase.chaseSpeed * multiplicador;
  
  console.log(`⚔️ Dificuldade aplicada: ${dificuldade} (${multiplicador}x)`);
}

function mostrarMensagemTemporaria(texto) {
  const messageEl = document.getElementById('game-message');
  const textEl = document.getElementById('message-text');
  
  if (messageEl && textEl) {
    textEl.textContent = texto;
    messageEl.classList.remove('hidden');
    
    setTimeout(() => {
      messageEl.classList.add('hidden');
    }, 3000);
  } else {
    // Fallback para sistema antigo
    showMessage(texto);
  }
}

function checkCollisions() {
  const playerCell = {
    x: Math.floor(game.player.x),
    y: Math.floor(game.player.y)
  };
  
  // Vitória - chegada na saída
  if (playerCell.x === game.maze.exit.x && playerCell.y === game.maze.exit.y) {
    game.state = 'won';
    
    // Atualizar estatísticas finais
    if (window.estadoJogo) {
      estadoJogo.stats.tempo = game.time;
      estadoJogo.stats.passos = game.player.trail?.length || 0;
      estadoJogo.stats.fioUsado = game.fioActive ? game.player.trail?.length || 0 : 0;
      estadoJogo.stats.distanciaPercorrida = calcularDistanciaPercorrida();
    }
    
    // Mostrar tela de vitória
    if (window.mostrarVitoria) {
      window.mostrarVitoria({ 
        nivel: game.level,
        tempo: game.time,
        eficiencia: calcularEficiencia()
      });
    } else {
      // Fallback para sistema antigo
      showMessage('Nivel ' + game.level + ' completo!');
      elements.nextLevel?.classList.remove('hidden');
    }
    return;
  }
  
  // Derrota - captura pelo Minotauro
  const dx = game.player.x - game.minotaur.x;
  const dy = game.player.y - game.minotaur.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance < 0.6) {
    game.state = 'lost';
    
    // Atualizar estatísticas finais
    if (window.estadoJogo) {
      estadoJogo.stats.tempo = game.time;
      estadoJogo.stats.passos = game.player.trail?.length || 0;
      estadoJogo.stats.fioUsado = game.fioActive ? game.player.trail?.length || 0 : 0;
      estadoJogo.stats.motivoDerrota = 'minotauro';
    }
    
    // Mostrar tela de derrota
    if (window.mostrarDerrota) {
      window.mostrarDerrota({ motivo: 'minotauro' });
    } else {
      // Fallback para sistema antigo
      showMessage('Voce foi capturado pelo Minotauro!');
      elements.restart?.classList.remove('hidden');
    }
  }
}

// Funções auxiliares para estatísticas
function calcularDistanciaPercorrida() {
  if (!game.player.trail || game.player.trail.length < 2) return 0;
  
  let distancia = 0;
  for (let i = 1; i < game.player.trail.length; i++) {
    const p1 = game.player.trail[i - 1];
    const p2 = game.player.trail[i];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    distancia += Math.sqrt(dx * dx + dy * dy);
  }
  
  return distancia * 20; // Converter para "metros" (escala aproximada)
}

function calcularEficiencia() {
  const caminhoOtimo = game.maze.size * 1.5; // Estimativa do caminho ótimo
  const passosDados = game.player.trail?.length || 1;
  return Math.max(0, Math.min(100, (caminhoOtimo / passosDados) * 100));
}

function updateHUD() {
  // Atualizar elementos individuais se existirem
  const levelEl = document.getElementById('level');
  const timeEl = document.getElementById('time');
  const fioEl = document.getElementById('fio');
  
  if (levelEl) levelEl.textContent = game.level;
  if (timeEl) timeEl.textContent = formatarTempoHUD(game.time);
  if (fioEl) fioEl.textContent = game.fioActive ? 'ON' : 'OFF';
  
  // Atualizar sistema de estados se disponível
  if (window.atualizarHUD) {
    window.atualizarHUD({
      nivel: game.level,
      tempo: game.time,
      fio: game.fioActive,
      passos: game.player.trail?.length || 0,
      fioUsado: game.fioActive ? game.player.trail?.length || 0 : 0
    });
  }
  
  // Mostrar estado do Minotauro
  mostrarStatusMinotauro();
}

function formatarTempoHUD(ms) {
  const segundos = Math.floor(ms / 1000);
  const minutos = Math.floor(segundos / 60);
  const seg = segundos % 60;
  return `${minutos.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`;
}

function mostrarStatusMinotauro() {
  if (!game.minotaur || !game.minotaur.ai) return;
  
  const aiState = game.minotaur.ai.getState();
  let statusElement = document.getElementById('minotaur-status');
  
  if (!statusElement) {
    statusElement = createMinotaurStatusElement();
  }
  
  switch(aiState) {
    case 'CHASE':
      statusElement.textContent = '🔥 MINOTAURO PERSEGUINDO!';
      statusElement.className = 'minotaur-status chase';
      break;
    case 'SEARCH':
      statusElement.textContent = '👁️ Minotauro procurando...';
      statusElement.className = 'minotaur-status search';
      break;
    case 'STUNNED':
      statusElement.textContent = '💫 Minotauro atordoado';
      statusElement.className = 'minotaur-status stunned';
      break;
    default:
      statusElement.textContent = '🚶 Minotauro patrulhando';
      statusElement.className = 'minotaur-status patrol';
  }
}

function createMinotaurStatusElement() {
  const statusDiv = document.createElement('div');
  statusDiv.id = 'minotaur-status';
  statusDiv.className = 'minotaur-status';
  
  // Adicionar CSS inline para compatibilidade
  statusDiv.style.cssText = `
    position: absolute;
    top: 80px;
    left: 20px;
    padding: 8px 16px;
    background: rgba(0, 0, 0, 0.85);
    color: white;
    border-radius: 12px;
    font-size: 14px;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    z-index: 1000;
    border: 2px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(5px);
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  `;
  
  // Inserir no container correto
  const gameContainer = document.getElementById('tela-jogo') || document.body;
  gameContainer.appendChild(statusDiv);
  
  return statusDiv;
}

function showMessage(text) {
  elements.message.textContent = text;
}

// GAME LOOP
const renderer = new Renderer();

function gameLoop(currentTime) {
  const dt = Math.min(16, currentTime - lastTime);
  lastTime = currentTime;
  
  if (game.state === 'playing') {
    game.time += dt;
    
    processInput(dt);
    game.player.update(dt);
    
    // MINOTAURO SEMPRE SABE ONDE ESTÁ O JOGADOR
    // Gerar "batimento cardíaco" do jogador que o Minotauro sempre detecta
    if (game.minotaur && game.player) {
      // Simular que o jogador sempre está fazendo ruído (respiração, batimentos cardíacos)
      game.minotaur.onPlayerNoise({ x: game.player.x, y: game.player.y }, 1.5);
      
      // A cada segundo, o Minotauro "sente" a presença do jogador
      if (Math.floor(currentTime / 1000) !== Math.floor((currentTime - dt) / 1000)) {
        game.minotaur.onPlayerNoise({ x: game.player.x, y: game.player.y }, 2.0);
      }
    }
    
    game.minotaur.update(dt);
    checkCollisions();
    
    if (Math.floor(currentTime / 16) % 10 === 0) {
      updateHUD();
    }
  }
  
  renderer.render();
  requestAnimationFrame(gameLoop);
}

// INICIALIZACAO
async function initGame() {
  ctx = elements.canvas.getContext('2d');
  
  // Carregar sprites primeiro
  await loadSprites();
  
  const resizeCanvas = () => {
    const container = elements.canvas.parentElement;
    elements.canvas.width = container.clientWidth - 20;
    elements.canvas.height = container.clientHeight - 20;
  };
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  setupInput();
  
  elements.nextLevel.addEventListener('click', () => {
    elements.nextLevel.classList.add('hidden');
    startLevel(game.level + 1);
  });
  
  elements.restart.addEventListener('click', () => {
    elements.restart.classList.add('hidden');
    startLevel(game.level);
  });
  
  console.log('🎮 Jogo inicializado com sprites pixel art!');
}

async function startGame() {
  elements.menu.classList.add('hidden');
  elements.gameContainer.classList.remove('hidden');
  
  // Mostrar loading
  showMessage('🎨 Carregando sprites pixel art...');
  
  await initGame();
  startLevel(1);
  requestAnimationFrame(gameLoop);
}

function showHelp() {
  alert(`🏛️ LABIRINTO DE CRETA - GUIA ÉPICO 🏛️

🎯 OBJETIVO:
• Escape do labirinto mortal de Creta
• Chegue ao portal dourado (quadrado brilhante)
• Evite ser capturado pelo temível Minotauro!

🎮 CONTROLES:
• WASD ou Setas: Mover Teseu (herói verde)
• SPACE: Ativar/desativar Fio de Ariadne
• ESC: Pausar/despausar o jogo

🧵 FIO DE ARIADNE (Poder Lendário):
• Cria um rastro dourado brilhante
• Te ajuda a não se perder no labirinto
• Use com sabedoria para escapar!

🐂 O MINOTAURO:
• Criatura vermelha que patrulha o labirinto
• Fica furioso (mais vermelho) quando te vê
• Possui visão limitada - use isso a seu favor!

⚡ DICAS DE SOBREVIVÊNCIA:
• Use paredes para quebrar linha de visão
• O Fio de Ariadne brilha mais quando ativo
• Cada nível aumenta o tamanho do labirinto
• Seja rápido mas cauteloso!

🏆 BOA SORTE, HERÓI! 🏆`);
}

// INTEGRAÇÃO COM SISTEMA DE TELAS
function definirFuncoesGlobais() {
  // Funções para serem chamadas pelo sistema de telas
  window.iniciarJogo = function(seed) {
    console.log('🎮 Iniciando jogo via sistema de telas');
    startGame(seed);
  };
  
  window.pausarJogo = function() {
    if (game.state === 'playing') {
      game.state = 'paused';
      console.log('⏸️ Jogo pausado');
    }
  };
  
  window.retomarJogo = function() {
    if (game.state === 'paused') {
      game.state = 'playing';
      console.log('▶️ Jogo retomado');
    }
  };
  
  window.reiniciarJogo = function() {
    console.log('🔄 Reiniciando jogo');
    startLevel(game.level);
  };
  
  window.proximoNivel = function() {
    console.log('➡️ Avançando para próximo nível');
    startLevel(game.level + 1);
  };
  
  window.voltarMenu = function() {
    console.log('🏠 Voltando ao menu');
    game.state = 'menu';
  };
  
  // Função para mostrar telas de resultado
  window.mostrarVitoria = function(dados) {
    if (window.mudarEstado) {
      mudarEstado('VITORIA', dados);
    }
  };
  
  window.mostrarDerrota = function(dados) {
    if (window.mudarEstado) {
      mudarEstado('DERROTA', dados);
    }
  };
}

// Função para aplicar configurações vindas do sistema de telas
function aplicarConfiguracoes(config) {
  if (!config) return;
  
  console.log('⚙️ Aplicando configurações:', config);
  
  // Aplicar configurações de áudio
  if (config.volume !== undefined) {
    // TODO: Implementar controle de volume
  }
  
  // Aplicar configurações visuais
  if (config.qualidade) {
    // TODO: Implementar controle de qualidade gráfica
  }
  
  // Aplicar dificuldade
  aplicarDificuldade();
}

// EVENT LISTENERS
document.getElementById('btnStart')?.addEventListener('click', startGame);
document.getElementById('btnHelp')?.addEventListener('click', showHelp);

// Suporte para tecla ESC (pausa)
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    if (game.state === 'playing' && window.mudarEstado) {
      mudarEstado('PAUSA');
    } else if (game.state === 'paused' && window.mudarEstado) {
      mudarEstado('JOGANDO');
    }
  }
});

// Inicializar sistema de integração
definirFuncoesGlobais();

console.log('🏛️ Labirinto de Creta carregado com sistema de telas integrado!');