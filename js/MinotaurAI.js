// MinotaurAI.js — Módulo genérico de IA para o Minotauro
// Pode ser usado em JS ou TS (tipos são opcionais)

class MinotaurAI {
  constructor(hooks, cfg) {
    this.hooks = hooks;
    this.cfg = {
      chaseSpeed: cfg.chaseSpeed ?? cfg.speed * 1.25,
      wanderJitter: cfg.wanderJitter ?? 0.2,
      ...cfg,
    };
    
    // Estados internos
    this.state = "PATROL";
    this.path = [];
    this.lastPathCalc = 0;
    this.lastSeenPlayerAt = null;
    this.lastHeardAt = null;
    this.memoryTimer = 0;
    this.searchTimer = 0;
    this.patrolIndex = 0;
    this.facing = { x: 1, y: 0 }; // para FOV
    
    if (!this.cfg.patrolPoints || this.cfg.patrolPoints.length === 0) {
      this.state = "PATROL";
    }
  }

  // === API que o seu jogo chama por frame ===
  update(dt, self, player) {
    // 1) Percepção
    const sees = this.canSee(self, player);
    if (sees) {
      this.lastSeenPlayerAt = { ...player };
      this.memoryTimer = this.cfg.memorySeconds;
      if (this.state !== "CHASE") this.enter("CHASE");
    } else {
      this.memoryTimer = Math.max(0, this.memoryTimer - dt);
    }

    // 2) FSM
    switch (this.state) {
      case "CHASE":   return this.tickChase(dt, self, player);
      case "SEARCH":  return this.tickSearch(dt, self);
      case "PATROL":  return this.tickPatrol(dt, self);
      case "IDLE":    return this.moveAlongPath(dt, self, this.cfg.speed);
      case "STUNNED": return self; // parado (pode ter timer externo)
    }
  }

  // Jogador fez barulho? Notifique aqui.
  onNoise(where, intensity = 1) {
    if (intensity <= 0) return;
    this.lastHeardAt = { ...where };
    
    // QUALQUER ruído força perseguição imediata - sem limite de distância
    this.lastSeenPlayerAt = { ...where }; // Tratar ruído como avistamento
    this.memoryTimer = this.cfg.memorySeconds; // Resetar memória
    
    // SEMPRE ir para CHASE, nunca SEARCH
    if (this.state !== "CHASE" && this.state !== "STUNNED") {
      this.enter("CHASE");
    }
  }

  // Tomou hit? Poderia entrar em STUNNED, por exemplo.
  stun() { this.enter("STUNNED"); }
  wakeUp() { this.enter("PATROL"); }

  // Getter para estado atual (para animações)
  getState() { return this.state; }
  getFacing() { return this.facing; }

  // === Internals ===
  getPosition() {
    // Helper para quando precisamos da posição atual em alguns cálculos
    return this.lastKnownPosition || { x: 0, y: 0 };
  }

  enter(s) {
    this.state = s;
    this.path = [];
    this.lastPathCalc = 0;
    if (s === "SEARCH") this.searchTimer = this.cfg.searchSeconds;
  }

  tickChase(dt, self, player) {
    // PERSEGUIÇÃO IMPLACÁVEL - sempre vai direto para o jogador
    const target = player; // Sempre usar posição atual do jogador, não a última vista
    
    // Replaneja caminho MUITO frequentemente para perseguição precisa
    this.lastPathCalc -= dt;
    if (this.lastPathCalc <= 0) {
      this.path = this.plan(self, target);
      this.lastPathCalc = this.cfg.repathInterval;
    }
    
    // NUNCA desiste da perseguição - sempre mantém o estado CHASE
    // Comentado o código que mudaria para SEARCH ou PATROL
    // if (!this.canSee(self, player) && this.memoryTimer <= 0) {
    //   if (this.lastSeenPlayerAt) this.enter("SEARCH");
    //   else this.enter("PATROL");
    // }
    
    // Se não há caminho, vai direto (ignorar obstáculos temporariamente)
    if (this.path.length === 0) {
      return this.moveDirectlyToPlayer(dt, self, player);
    }
    
    return this.moveAlongPath(dt, self, this.cfg.chaseSpeed);
  }
  
  // Método para movimento direto quando não há caminho
  moveDirectlyToPlayer(dt, self, player) {
    const dx = player.x - self.x;
    const dy = player.y - self.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
      const stepDist = (this.cfg.chaseSpeed * dt) / 1000;
      const direction = { x: dx / distance, y: dy / distance };
      
      // Atualizar direção de olhar
      this.facing = direction;
      
      return {
        x: self.x + direction.x * stepDist,
        y: self.y + direction.y * stepDist
      };
    }
    
    return self;
  }

  tickSearch(dt, self) {
    this.searchTimer -= dt;
    const anchor = this.lastSeenPlayerAt ?? this.lastHeardAt;
    if (!anchor) { this.enter("PATROL"); return self; }

    // Se não tem caminho, planeja até o ponto âncora e faz micro-varreduras
    this.lastPathCalc -= dt;
    if (this.path.length === 0 || this.lastPathCalc <= 0) {
      const jitter = this.cfg.wanderJitter;
      const rnd = {
        x: anchor.x + (Math.random() * 2 - 1) * jitter * 4,
        y: anchor.y + (Math.random() * 2 - 1) * jitter * 4,
      };
      this.path = this.plan(self, Math.random() < 0.5 ? anchor : rnd);
      this.lastPathCalc = this.cfg.repathInterval * 1.2;
    }

    if (this.searchTimer <= 0) this.enter("PATROL");
    return this.moveAlongPath(dt, self, this.cfg.speed);
  }

  tickPatrol(dt, self) {
    // Com pontos de patrulha: segue a lista; senão, vaga aleatório controlado
    if (this.cfg.patrolPoints && this.cfg.patrolPoints.length > 0) {
      const target = this.cfg.patrolPoints[this.patrolIndex % this.cfg.patrolPoints.length];
      if (this.path.length === 0) this.path = this.plan(self, target);
      const next = this.moveAlongPath(dt, self, this.cfg.speed);
      if (this.sameTile(next, target)) {
        this.patrolIndex++;
        this.path = [];
      }
      return next;
    } else {
      // Vagar: escolhe um ponto caminhável perto e vai
      if (this.path.length === 0) {
        const wander = {
          x: self.x + Math.round((Math.random() * 2 - 1) * 6),
          y: self.y + Math.round((Math.random() * 2 - 1) * 6),
        };
        this.path = this.plan(self, wander);
      }
      return this.moveAlongPath(dt, self, this.cfg.speed);
    }
  }

  canSee(self, player) {
    const d = this.dist(self, player);
    
    // VISÃO SUPERNATURAL - alcance massivo
    if (d > this.cfg.sightRange) return false;
    
    // IGNORAR paredes para visão quase total (comentado para visão através de paredes)
    // if (!this.hooks.hasLineOfSight(self, player)) return false;
    
    // FOV quase 360 graus - praticamente sempre vê o jogador
    const dir = this.normalize({ x: player.x - self.x, y: player.y - self.y });
    const facingDot = this.facing.x * dir.x + this.facing.y * dir.y; // cos(theta)
    const half = (this.cfg.fovDeg * Math.PI) / 360;
    
    // Com FOV de 300°, quase sempre retorna true
    return facingDot >= Math.cos(half);
  }

  // Avança no caminho conforme velocidade (tile-by-tile simplificado)
  moveAlongPath(dt, self, speed) {
    if (this.path.length === 0) return self;

    const next = this.path[0];
    const stepDist = (speed * dt) / 1000; // tiles/seg * seg = tiles (convertendo dt de ms)
    const dx = next.x - self.x;
    const dy = next.y - self.y;
    const adx = Math.abs(dx);
    const ady = Math.abs(dy);

    let moved = { ...self };
    if (adx + ady <= stepDist + 1e-6) {
      // alcançou o tile alvo
      moved = { ...next };
      this.path.shift();
    } else {
      // movimento axis-aligned simples (ajuste se usa float/physics)
      const dir = this.normalize({ x: dx, y: dy });
      moved = { x: self.x + dir.x * stepDist, y: self.y + dir.y * stepDist };
    }

    // Atualiza "facing"
    const faceDir = this.normalize({ x: next.x - self.x, y: next.y - self.y });
    if (faceDir.x || faceDir.y) this.facing = faceDir;
    return moved;
  }

  // Planejamento com findPath externo ou BFS fallback
  plan(from, to) {
    if (this.hooks.findPath) return this.hooks.findPath(from, to);
    return this.bfsPath(from, to);
  }

  // BFS simples em grid; substitua por A* no seu projeto se quiser
  bfsPath(from, to) {
    const key = (v) => `${Math.round(v.x)},${Math.round(v.y)}`;
    const q = [from];
    const came = new Map();
    came.set(key(from), null);

    while (q.length) {
      const cur = q.shift();
      if (this.sameTile(cur, to)) {
        // reconstrói caminho
        const path = [];
        let k = key(cur);
        let at = cur;
        while (at) {
          path.push(at);
          at = came.get(k) ?? null;
          if (at) k = key(at);
        }
        path.reverse();
        path.shift(); // remove origem
        return path;
      }
      for (const nb of this.hooks.getNeighbors(cur)) {
        if (!this.hooks.isWalkable(nb)) continue;
        const nk = key(nb);
        if (!came.has(nk)) {
          came.set(nk, cur);
          q.push(nb);
        }
      }
    }
    return [];
  }

  // Helpers geom
  dist(a, b) {
    const dx = a.x - b.x, dy = a.y - b.y;
    return Math.hypot(dx, dy);
  }
  
  normalize(v) {
    const m = Math.hypot(v.x, v.y) || 1;
    return { x: v.x / m, y: v.y / m };
  }
  
  sameTile(a, b) {
    return Math.round(a.x) === Math.round(b.x) && Math.round(a.y) === Math.round(b.y);
  }
}