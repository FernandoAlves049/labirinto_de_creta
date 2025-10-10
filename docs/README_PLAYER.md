# Como Teseu se move no labirinto

Teseu se desloca pelos corredores brancos com movimentos precisos e previsíveis. O sistema prioriza fluidez: primeiro tenta avançar em um eixo, depois no outro, usando uma checagem de colisão que impede atravessar paredes. Pequenos ajustes (corner sliding e um leve “snap” para o centro da célula) evitam travadas em quinas e mantêm o controle gostoso.

## 🧍 Player — Guia Essencial

Resumo por tópico para ajustar rápido e jogar.

### Estado
- `player.x, player.y` (contínuo, em células)
- `player.r` ≈ 0.45 (alinhado ao tamanho visual)
- `player.speed` (base; pode ter multiplicador de corrida com Shift)
- `trail` opcional (Fio de Ariadne)

### Controles e Movimento
- Teclas: WASD/setas; Shift = correr (se habilitado)
- Atualização por eixos: tenta X, depois Y (evita travas)
- Validação antes de mover: `isWalkable` (célula 0) e `canMoveTo(x,y, r)`
- Corner sliding e leve snap ao centro da célula para fluidez

### Contrato (movimento)
- Entradas: `deltaTime`, estado de teclas
- Efeito: atualiza `player.x/y` apenas se seguro (no branco)
- Evita: atravessar paredes, “escorregar” por fora do corredor, travas em quinas

### Colisão
- `canMoveTo(x,y,0.45)` com margem ≈ 0.02 e passo ≈ 0.1
- Estratégia por eixo: se X falha, tenta Y; inclui corner sliding e snap leve

### Render
- Canvas 2D; círculo com `radius ≈ cellSize*0.45`
- Posição em pixels: `px = offsetX + x*cellSize`, `py = offsetY + y*cellSize`
- Fio (se ativo): rastro simples, discreto

### Integração
- Funções: `updatePlayerMovement`, `canMoveTo`, `render`
- Estados auxiliares: `isRunning` (Shift), `threadActive` (fio)

### Ajustes
- `speed` base e multiplicador de corrida
- `r` e densidade da verificação (precisão vs custo)
- Frequência e limite do `trail`

—

Dica: mantenha `r` coerente com o tamanho visual para colisão consistente.

## Onde está no código (sem extrair trechos)

Arquivo: `js/main.js`

- Estado inicial do player: linha 11 — `this.player = { x, y, r, trail }`.
- setupEventListeners(): linha 644 — registra teclas (keydown/keyup) usadas no movimento.
- resetPlayer(): linha 1199 — posiciona Teseu com segurança na área inicial.
- updatePlayerMovement(deltaTime): linha 1350 — movimento prático por eixo, checando “branco”.
- updatePlayer(deltaTime): linha 1380 — variante com verificação dupla e efeitos (passos, fio).
- canMoveTo(x, y, r): linha 1772 — colisão radial alinhada ao tamanho visual do player.
- render(): linha 1976 — desenha player e rastro (se ativo).

Dica rápida: Ctrl+G no VS Code para ir direto às linhas.

## Trechos de código (extraídos de `js/main.js`)

### Estado inicial do player

```javascript
		this.player = { x: 1.5, y: 1.5, r: 0.3, trail: [] };
```

### setupEventListeners() — teclas

```javascript
	setupEventListeners() {
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
	}
```

### resetPlayer()

```javascript
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
```

### updatePlayerMovement(deltaTime)

```javascript
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
```

### updatePlayer(deltaTime)

```javascript
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
			this.playSound('threadActivate');
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
				this.playSound('runFootstep');
			} else {
				this.playSound('footstep');
			}
		}

		// Add to trail
		if (this.threadActive && this.player.trail.length % 5 === 0) {
			this.player.trail.push({
				x: this.player.x,
				y: this.player.y
			});
			if (this.player.trail.length > 100) {
				this.player.trail.shift();
			}
		}
	}
```

### canMoveTo(x, y, r) — colisão do player

```javascript
	canMoveTo(x, y, size = 0.35) {
		const margin = 0.02;
		const effectiveSize = size + margin;
		if (x - effectiveSize < 0.5 || x + effectiveSize >= this.maze.width - 0.5 || 
			y - effectiveSize < 0.5 || y + effectiveSize >= this.maze.height - 0.5) {
			return false;
		}
		const checkResolution = 0.1;
		for (let dx = -effectiveSize; dx <= effectiveSize; dx += checkResolution) {
			for (let dy = -effectiveSize; dy <= effectiveSize; dy += checkResolution) {
				const gx = Math.floor(x + dx);
				const gy = Math.floor(y + dy);
				if (gx < 0 || gx >= this.maze.width || gy < 0 || gy >= this.maze.height || this.maze.walls[gy]?.[gx] === 1) {
					return false;
				}
			}
		}
		return true;
	}
```