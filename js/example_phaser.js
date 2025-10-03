// EXEMPLO: Integrando MinotaurAI com Phaser.js
// Este arquivo demonstra como usar o MinotaurAI em um jogo Phaser

import { MinotaurAI } from './MinotaurAI.js';

class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    // Seu mapa Phaser (tilemap)
    this.map = this.make.tilemap({ key: 'dungeon' });
    this.tileset = this.map.addTilesetImage('tiles');
    this.wallLayer = this.map.createLayer('walls', this.tileset);
    
    // Player e Minotaur como sprites Phaser
    this.player = this.physics.add.sprite(100, 100, 'player');
    this.minotaur = this.physics.add.sprite(300, 300, 'minotaur');
    
    // Configurar MinotaurAI
    this.setupMinotaurAI();
  }

  setupMinotaurAI() {
    // Hooks específicos do Phaser
    const hooks = {
      isWalkable: (tile) => {
        // Converter coordenadas do mundo para tile
        const tileX = Math.floor(tile.x);
        const tileY = Math.floor(tile.y);
        
        // Verificar se tile existe e não é parede
        const mapTile = this.wallLayer.getTileAt(tileX, tileY);
        return !mapTile || mapTile.index === -1;
      },
      
      hasLineOfSight: (from, to) => {
        // Usar physics raycast do Phaser
        const line = new Phaser.Geom.Line(
          from.x * 32, from.y * 32,  // converter para pixels
          to.x * 32, to.y * 32
        );
        
        // Verificar interseção com tiles de parede
        const tiles = this.wallLayer.getTilesWithinWorldXY(
          line.x1, line.y1, 
          Math.abs(line.x2 - line.x1), 
          Math.abs(line.y2 - line.y1)
        );
        
        return !tiles.some(tile => tile.index !== -1);
      },
      
      getNeighbors: (tile) => {
        const neighbors = [
          { x: tile.x + 1, y: tile.y },
          { x: tile.x - 1, y: tile.y },
          { x: tile.x, y: tile.y + 1 },
          { x: tile.x, y: tile.y - 1 }
        ];
        
        return neighbors.filter(nb => {
          const mapTile = this.wallLayer.getTileAt(nb.x, nb.y);
          return !mapTile || mapTile.index === -1;
        });
      },
      
      // Pathfinding A* customizado para Phaser
      findPath: (from, to) => {
        return this.findPathAStar(from, to);
      }
    };

    // Configuração da IA
    const config = {
      speed: 60,         // pixels por segundo
      chaseSpeed: 90,
      sightRange: 8,     // em tiles
      fovDeg: 120,
      hearingRadius: 6,
      memorySeconds: 4,
      searchSeconds: 10,
      repathInterval: 0.25
    };

    // Inicializar IA
    this.minotaurAI = new MinotaurAI(hooks, config);
    
    // Estado da IA para animações
    this.lastAIState = 'PATROL';
  }

  update(time, delta) {
    // Converter posições de pixels para tiles
    const minotaurPos = {
      x: this.minotaur.x / 32,
      y: this.minotaur.y / 32
    };
    
    const playerPos = {
      x: this.player.x / 32,
      y: this.player.y / 32
    };

    // Atualizar IA
    const newPos = this.minotaurAI.update(delta / 1000, minotaurPos, playerPos);
    
    // Aplicar movimento suave com Phaser tweens
    const targetX = newPos.x * 32;
    const targetY = newPos.y * 32;
    
    if (Math.abs(targetX - this.minotaur.x) > 1 || Math.abs(targetY - this.minotaur.y) > 1) {
      this.physics.moveToObject(this.minotaur, { x: targetX, y: targetY }, 60);
    } else {
      this.minotaur.body.setVelocity(0);
    }

    // Atualizar animações baseadas no estado da IA
    this.updateMinotaurAnimation();
    
    // Sistema de ruído - detectar movimento do player
    this.handlePlayerNoise();
  }

  updateMinotaurAnimation() {
    const currentState = this.minotaurAI.getState();
    
    if (currentState !== this.lastAIState) {
      this.lastAIState = currentState;
      
      switch (currentState) {
        case 'CHASE':
          this.minotaur.play('minotaur_run');
          this.minotaur.setTint(0xff4444); // Vermelho quando caçando
          break;
        case 'SEARCH':
          this.minotaur.play('minotaur_search');
          this.minotaur.setTint(0xffaa44); // Laranja quando procurando
          break;
        case 'PATROL':
          this.minotaur.play('minotaur_walk');
          this.minotaur.clearTint();
          break;
        case 'STUNNED':
          this.minotaur.play('minotaur_stun');
          this.minotaur.setTint(0x4444ff); // Azul quando atordoado
          break;
      }
    }
  }

  handlePlayerNoise() {
    // Gerar ruído baseado na velocidade do player
    const playerVel = Math.abs(this.player.body.velocity.x) + Math.abs(this.player.body.velocity.y);
    
    if (playerVel > 100) { // Se player está correndo
      const intensity = Math.min(playerVel / 200, 2);
      this.minotaurAI.onNoise({
        x: this.player.x / 32,
        y: this.player.y / 32
      }, intensity);
      
      // Efeito visual de ruído
      this.add.circle(this.player.x, this.player.y, intensity * 10, 0xffffff, 0.3)
        .setDepth(100);
    }
  }

  // Implementação A* otimizada para Phaser
  findPathAStar(start, goal) {
    // Implementação similar ao game.js mas adaptada para Phaser
    // ... (código A* aqui)
    
    return []; // placeholder
  }
  
  // Métodos para interação externa
  stunMinotaur() {
    this.minotaurAI.stun();
    
    // Timer para despertar após 3 segundos
    this.time.delayedCall(3000, () => {
      this.minotaurAI.wakeUp();
    });
  }
  
  makeNoise(x, y, intensity = 1) {
    this.minotaurAI.onNoise({ x: x / 32, y: y / 32 }, intensity);
    
    // Efeito visual
    const circle = this.add.circle(x, y, intensity * 20, 0xffff00, 0.5);
    this.tweens.add({
      targets: circle,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 1000,
      onComplete: () => circle.destroy()
    });
  }
}

// Configuração das cenas Phaser
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: GameScene
};

const game = new Phaser.Game(config);

// EXEMPLO DE USO:
// 
// 1. Carregar o MinotaurAI.js como módulo
// 2. Configurar hooks específicos do seu engine
// 3. Adaptar coordenadas (pixels ↔ tiles)
// 4. Integrar com sistema de animação
// 5. Adicionar efeitos visuais e sonoros
//
// O MinotaurAI é agnóstico ao engine - você apenas 
// fornece as funções que ele precisa!