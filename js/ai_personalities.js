// EXEMPLO: Diferentes Personalidades de IA usando MinotaurAI
// Este arquivo mostra como criar diferentes tipos de inimigos com o mesmo sistema base

import { MinotaurAI } from './MinotaurAI.js';

// ===== FÁBRICA DE PERSONALIDADES =====

export class AIPersonalities {
  
  // Minotauro Clássico - Balanceado para gameplay tradicional
  static createClassicMinotaur(hooks) {
    return new MinotaurAI(hooks, {
      speed: 2,
      chaseSpeed: 2.5,
      sightRange: 8,
      fovDeg: 120,
      hearingRadius: 6,
      memorySeconds: 3,
      searchSeconds: 8,
      repathInterval: 0.3,
      wanderJitter: 0.3
    });
  }
  
  // Sentinela - Guarda estático com visão aguçada
  static createSentinel(hooks, guardPost) {
    return new MinotaurAI(hooks, {
      speed: 1,
      chaseSpeed: 1.5,
      sightRange: 15,       // Visão muito longa
      fovDeg: 60,           // Campo de visão estreito mas focado
      hearingRadius: 4,
      memorySeconds: 8,     // Lembra por muito tempo
      searchSeconds: 20,    // Procura por muito tempo
      repathInterval: 0.5,
      patrolPoints: guardPost ? [guardPost] : [], // Fica em um posto
      wanderJitter: 0.1     // Movimento muito controlado
    });
  }
  
  // Caçador Ágil - Rápido e persistente
  static createHunter(hooks) {
    return new MinotaurAI(hooks, {
      speed: 3,
      chaseSpeed: 4.5,      // Muito rápido na perseguição
      sightRange: 6,        // Visão menor mas compensa com velocidade
      fovDeg: 180,          // Campo de visão amplo
      hearingRadius: 8,     // Audição aguçada
      memorySeconds: 10,    // Lembra muito bem onde viu o jogador
      searchSeconds: 15,
      repathInterval: 0.15, // Replaneja caminho muito rapidamente
      wanderJitter: 0.5     // Movimento errático durante patrulha
    });
  }
  
  // Brutamontes - Lento mas implacável
  static createBrute(hooks) {
    return new MinotaurAI(hooks, {
      speed: 1.2,
      chaseSpeed: 1.8,
      sightRange: 5,        // Visão curta
      fovDeg: 90,           // Campo de visão limitado
      hearingRadius: 10,    // Mas escuta muito bem
      memorySeconds: 2,     // Esquece rapidamente onde viu
      searchSeconds: 25,    // Mas procura por muito tempo
      repathInterval: 0.8,  // Reação lenta
      wanderJitter: 0.1     // Movimento previsível
    });
  }
  
  // Ninja Sombrio - Furtivo e inteligente
  static createShadowNinja(hooks) {
    return new MinotaurAI(hooks, {
      speed: 2.5,
      chaseSpeed: 3.2,
      sightRange: 12,       // Visão excelente
      fovDeg: 150,          // Campo de visão muito amplo
      hearingRadius: 12,    // Audição supernatural
      memorySeconds: 15,    // Nunca esquece
      searchSeconds: 30,    // Procura incansavelmente
      repathInterval: 0.1,  // Reação instantânea
      wanderJitter: 0.8     // Movimento imprevisível
    });
  }
  
  // Patrulheiro - Segue rotas fixas eficientemente
  static createPatroller(hooks, patrolRoute) {
    return new MinotaurAI(hooks, {
      speed: 2.2,
      chaseSpeed: 2.8,
      sightRange: 7,
      fovDeg: 100,
      hearingRadius: 5,
      memorySeconds: 4,
      searchSeconds: 6,     // Retorna rapidamente à patrulha
      repathInterval: 0.4,
      patrolPoints: patrolRoute, // Rota fixa definida
      wanderJitter: 0.0     // Movimento mecânico e previsível
    });
  }
  
  // Berserker - Fica mais perigoso quando vê o jogador
  static createBerserker(hooks) {
    const ai = new MinotaurAI(hooks, {
      speed: 1.8,
      chaseSpeed: 4.0,      // MUITO rápido quando enfurecido
      sightRange: 6,
      fovDeg: 110,
      hearingRadius: 7,
      memorySeconds: 5,
      searchSeconds: 12,
      repathInterval: 0.2,  // Muito reativo
      wanderJitter: 0.4
    });
    
    // Modificar comportamento - fica mais rápido a cada avistamento
    const originalUpdate = ai.update.bind(ai);
    let rageLevel = 0;
    
    ai.update = function(dt, self, player) {
      const result = originalUpdate(dt, self, player);
      
      // Aumentar rage quando vê o jogador
      if (this.canSee(self, player)) {
        rageLevel = Math.min(rageLevel + dt, 3);
        this.cfg.chaseSpeed = 4.0 + rageLevel;
        this.cfg.repathInterval = Math.max(0.1, 0.2 - rageLevel * 0.05);
      } else {
        rageLevel = Math.max(0, rageLevel - dt * 0.5);
      }
      
      return result;
    };
    
    ai.getRageLevel = () => rageLevel;
    return ai;
  }
  
  // Covarde - Foge do jogador quando muito próximo
  static createCoward(hooks) {
    const ai = new MinotaurAI(hooks, {
      speed: 2.5,
      chaseSpeed: 1.0,      // Mais lento quando "perseguindo"
      sightRange: 10,       // Vê de longe
      fovDeg: 160,          // Campo amplo para detectar ameaças
      hearingRadius: 8,
      memorySeconds: 1,     // Esquece rapidamente
      searchSeconds: 3,     // Procura pouco tempo
      repathInterval: 0.2,
      wanderJitter: 0.6
    });
    
    // Comportamento especial: fugir quando muito próximo
    const originalTickChase = ai.tickChase.bind(ai);
    
    ai.tickChase = function(dt, self, player) {
      const distance = this.dist(self, player);
      
      if (distance < 3) {
        // Muito próximo - FUGIR!
        const fleeDirection = {
          x: self.x - player.x,
          y: self.y - player.y
        };
        const normalized = this.normalize(fleeDirection);
        const fleeTarget = {
          x: self.x + normalized.x * 8,
          y: self.y + normalized.y * 8
        };
        
        this.path = this.plan(self, fleeTarget);
        return this.moveAlongPath(dt, self, this.cfg.speed * 1.5); // Foge rápido
      }
      
      return originalTickChase(dt, self, player);
    };
    
    return ai;
  }
  
  // Pack Leader - Coordena com outros inimigos
  static createPackLeader(hooks, packMembers = []) {
    const ai = new MinotaurAI(hooks, {
      speed: 2.3,
      chaseSpeed: 3.0,
      sightRange: 9,
      fovDeg: 130,
      hearingRadius: 8,
      memorySeconds: 6,
      searchSeconds: 10,
      repathInterval: 0.25,
      wanderJitter: 0.3
    });
    
    // Funcionalidade de líder
    const originalOnNoise = ai.onNoise.bind(ai);
    
    ai.onNoise = function(where, intensity) {
      originalOnNoise(where, intensity);
      
      // Alertar membros da matilha
      packMembers.forEach(member => {
        if (member.ai && typeof member.ai.onNoise === 'function') {
          member.ai.onNoise(where, intensity * 0.7); // Ruído propagado
        }
      });
    };
    
    ai.alertPack = (position) => {
      packMembers.forEach(member => {
        if (member.ai) {
          member.ai.onNoise(position, 1.5);
        }
      });
    };
    
    return ai;
  }
}

// ===== SISTEMA DE DIFICULDADE DINÂMICA =====

export class DifficultyManager {
  
  static applyDifficulty(ai, level) {
    const multipliers = this.getDifficultyMultipliers(level);
    
    // Aplicar multiplicadores
    ai.cfg.speed *= multipliers.speed;
    ai.cfg.chaseSpeed *= multipliers.chaseSpeed;
    ai.cfg.sightRange *= multipliers.sightRange;
    ai.cfg.fovDeg *= multipliers.fov;
    ai.cfg.hearingRadius *= multipliers.hearing;
    ai.cfg.memorySeconds *= multipliers.memory;
    ai.cfg.searchSeconds *= multipliers.search;
    ai.cfg.repathInterval /= multipliers.responsiveness;
    
    return ai;
  }
  
  static getDifficultyMultipliers(level) {
    const base = {
      speed: 1.0,
      chaseSpeed: 1.0,
      sightRange: 1.0,
      fov: 1.0,
      hearing: 1.0,
      memory: 1.0,
      search: 1.0,
      responsiveness: 1.0
    };
    
    switch (level) {
      case 'easy':
        return {
          ...base,
          speed: 0.8,
          chaseSpeed: 0.7,
          sightRange: 0.8,
          fov: 0.8,
          memory: 0.7,
          responsiveness: 0.8
        };
        
      case 'normal':
        return base;
        
      case 'hard':
        return {
          ...base,
          speed: 1.2,
          chaseSpeed: 1.3,
          sightRange: 1.2,
          fov: 1.1,
          hearing: 1.2,
          memory: 1.3,
          search: 1.2,
          responsiveness: 1.3
        };
        
      case 'nightmare':
        return {
          ...base,
          speed: 1.4,
          chaseSpeed: 1.6,
          sightRange: 1.4,
          fov: 1.3,
          hearing: 1.5,
          memory: 2.0,
          search: 1.5,
          responsiveness: 1.8
        };
        
      default:
        return base;
    }
  }
}

// ===== EXEMPLO DE USO =====

// Criar diferentes tipos de inimigos
function setupEnemies(gameHooks) {
  const enemies = [];
  
  // Minotauro principal
  const minotaur = {
    entity: createMinotaurSprite(100, 100),
    ai: AIPersonalities.createClassicMinotaur(gameHooks),
    type: 'minotaur'
  };
  
  // Guardas nos portões
  const guards = [
    {
      entity: createGuardSprite(50, 200),
      ai: AIPersonalities.createSentinel(gameHooks, {x: 50, y: 200}),
      type: 'sentinel'
    },
    {
      entity: createGuardSprite(350, 50),
      ai: AIPersonalities.createSentinel(gameHooks, {x: 350, y: 50}),
      type: 'sentinel'
    }
  ];
  
  // Patrulheiros nas rotas principais
  const patroller = {
    entity: createPatrollerSprite(150, 150),
    ai: AIPersonalities.createPatroller(gameHooks, [
      {x: 150, y: 150},
      {x: 250, y: 150},
      {x: 250, y: 250},
      {x: 150, y: 250}
    ]),
    type: 'patroller'
  };
  
  // Caçador para níveis avançados
  const hunter = {
    entity: createHunterSprite(300, 300),
    ai: DifficultyManager.applyDifficulty(
      AIPersonalities.createHunter(gameHooks),
      'hard'
    ),
    type: 'hunter'
  };
  
  return [minotaur, ...guards, patroller, hunter];
}

// Atualizar todos os inimigos
function updateEnemies(enemies, deltaTime, playerPosition) {
  enemies.forEach(enemy => {
    const currentPos = { x: enemy.entity.x, y: enemy.entity.y };
    const newPos = enemy.ai.update(deltaTime, currentPos, playerPosition);
    
    // Aplicar movimento
    enemy.entity.x = newPos.x;
    enemy.entity.y = newPos.y;
    
    // Animações específicas por tipo
    updateEnemyAnimation(enemy);
  });
}

function updateEnemyAnimation(enemy) {
  const state = enemy.ai.getState();
  const facing = enemy.ai.getFacing();
  
  // Animações específicas por personalidade
  switch (enemy.type) {
    case 'minotaur':
      enemy.entity.animation = state === 'CHASE' ? 'charge' : 'walk';
      break;
    case 'sentinel':
      enemy.entity.animation = state === 'CHASE' ? 'alert' : 'guard';
      break;
    case 'hunter':
      enemy.entity.animation = state === 'CHASE' ? 'sprint' : 'prowl';
      break;
  }
  
  // Orientação baseada na direção
  enemy.entity.facing = Math.atan2(facing.y, facing.x);
}

/*
 * VANTAGENS DESTE SISTEMA MODULAR:
 * 
 * ✅ Reutilização: Um código base, múltiplas personalidades
 * ✅ Flexibilidade: Cada inimigo pode ter comportamento único
 * ✅ Balanceamento: Ajustar dificuldade sem reescrever código
 * ✅ Escalabilidade: Fácil adicionar novos tipos de inimigo
 * ✅ Manutenção: Bugs corrigidos em um lugar beneficiam todos
 * ✅ Performance: Sistema otimizado compartilhado
 * 
 * CASOS DE USO:
 * 
 * 🎮 Tower Defense: Diferentes tipos de torres inimigas
 * 🎮 RPG: NPCs com personalidades distintas
 * 🎮 Stealth Games: Guardas com diferentes padrões
 * 🎮 Survival Horror: Monstros com comportamentos únicos
 * 🎮 Strategy Games: Unidades com IA especializada
 */