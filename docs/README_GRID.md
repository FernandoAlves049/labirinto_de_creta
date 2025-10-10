# O Grid do Labirinto

O labirinto é tecnicamente uma matriz bidimensional onde cada célula possui um valor que define se é um corredor andável (0) ou uma parede bloqueada (1). Este grid é a espinha dorsal das mecânicas do jogo:

- Renderização Visual: dita exatamente onde as paredes pretas e os corredores brancos são desenhados no canvas.
- Sistema de Colisão: garante que Teseu não atravesse paredes, verificando o grid ao redor antes de permitir o movimento.
- Inteligência Artificial: o Minotauro usa o mesmo grid para navegar com A*, calculando a rota mais curta até o jogador.


# 🧱 Como o Grid Funciona

Como o labirinto é representado, desenhado e usado para colisão e caminho.

## Como é o Grid

- `maze.walls[y][x]`: 0 corredor (branco), 1 parede (preto)
- Dimensões: `maze.width × maze.height`; célula central em `x+0.5, y+0.5`
- `cellSize` (px) define a escala visual; coords inteiras (célula) vs contínuas (jogo)

## Como desenha na tela

- Estilo: fundo branco, paredes pretas
- Centralização: `offsetX/Y = (canvas - grid*cellSize)/2`
- Desenho: para `walls[y][x]===1` → `fillRect(offsetX + x*cellSize, offsetY + y*cellSize, cellSize, cellSize)`
- Saída: `(width-2, height-2)` com glow verde

## Como checa colisão

- `isWall(x,y)`: posição contínua cai em célula de parede?
- `canMoveTo(x,y,r)`: amostra um raio r; bloqueia se tocar parede/limite
- Parâmetros: margem ≈ 0.02; passo ≈ 0.1; limites estritos

### Em resumo (helpers)
- Entradas: `x,y` contínuos; `r` em células
- Saída: `true` (válido no branco) ou `false` (toca parede/fora)
- Evita: atravessar cantos, grudar em parede, sair do mapa

## Como acha o caminho (A*)

- Opera em células (4 direções); heurística Manhattan
- Retorna lista `{x,y}` do início ao objetivo
- Waypoints miram o centro: `tx = wp.x + 0.5`, `ty = wp.y + 0.5`

## Como o labirinto nasce

- Procedural por nível, garantindo conectividade
- Expõe `width/height/walls` para render, colisão e A*

## Como tudo se conecta no jogo

- Render: usa `walls` + `cellSize` + offsets
- Movimento/Colisão: `canMoveTo`/`isWall` mantêm entidades no branco
- IA: A* consome o grid 0/1 para rotas válidas

## O que dá para ajustar

- `cellSize` (escala visual)
- Densidade da colisão (precisão vs performance)
- Frequência de replanejamento do A* (responsividade)

---

Dica: converta contínuo→célula com `floor(x)` e mire no centro (`+0.5`) ao seguir waypoints.

## Onde está no código (sem extrair trechos)

Arquivo: `js/main.js`

- generateMaze(): linha 1086 — cria e dimensiona o labirinto (matriz walls 0/1) e ajusta `cellSize`.
- createAdditionalPaths(): linha 1152 — abre caminhos extras para melhorar a navegação e a IA.
- carveMaze(x, y): linha 1179 — escava corredores usando backtracking recursivo.
- isWall(x, y): linha 1721 — verifica se a posição cai em célula de parede (1) ou corredor (0).
- astarGridPath(start, goal): linha 1728 — A* em 4 direções com heurística Manhattan, retorna lista de células.
- canMoveTo(x, y, size): linha 1772 — colisão por amostragem para garantir movimento “no branco”.
- isValidPosition(x, y, size): linha 1806 — verificação auxiliar mais conservadora.
- render(): linha 1976 — desenha o grid e as entidades no canvas.

Dica rápida: no VS Code, use Ctrl+G e digite o número da linha para ir direto ao ponto.

## Trechos de código (extraídos de `js/main.js`)

### generateMaze()

```javascript
	generateMaze() {
		// 🏛️ CANVAS DINÂMICO BASEADO NO NÍVEL! 😂
        
		// Tamanho da célula diminui conforme avança nos níveis (mais difícil)
		const baseCellSize = 20; // Começa com células grandes
		const cellSizeReduction = Math.min(8, this.level * 0.5); // Reduz gradualmente
		const targetCellSize = Math.max(8, baseCellSize - cellSizeReduction);
        
		console.log(`🎮 Nível ${this.level}: CellSize = ${targetCellSize}px (Base: ${baseCellSize}, Redução: ${cellSizeReduction})`);
        
		// Tamanho do canvas cresce com o nível
		const levelMultiplier = 1 + (this.level - 1) * 0.1; // Cresce 10% por nível
		const baseCanvasWidth = 600;
		const baseCanvasHeight = 450;
        
		const canvasWidth = Math.min(1000, baseCanvasWidth * levelMultiplier); // Máx 1000px
		const canvasHeight = Math.min(750, baseCanvasHeight * levelMultiplier); // Máx 750px
        
		// Atualizar tamanho do canvas
		this.canvas.width = canvasWidth;
		this.canvas.height = canvasHeight;
		this.canvas.style.width = `${canvasWidth}px`;
		this.canvas.style.height = `${canvasHeight}px`;
        
		console.log(`🗺️ Canvas Nivel ${this.level}: ${canvasWidth}x${canvasHeight}px (Mult: ${levelMultiplier.toFixed(1)}x)`);
        
		// Calcular dimensões do labirinto
		const width = Math.floor(canvasWidth / targetCellSize);
		const height = Math.floor(canvasHeight / targetCellSize);
        
		// Garantir que seja ímpar para algoritmo de labirinto
		const mazeWidth = width % 2 === 0 ? width - 1 : width;
		const mazeHeight = height % 2 === 0 ? height - 1 : height;
        
		console.log(`🏛️ Gerando labirinto: ${mazeWidth}x${mazeHeight} (Canvas: ${canvasWidth}x${canvasHeight})`);
        
		this.maze = {
			width: mazeWidth,
			height: mazeHeight,
			walls: []
		};

		// Initialize maze with walls
		for (let y = 0; y < mazeHeight; y++) {
			this.maze.walls[y] = [];
			for (let x = 0; x < mazeWidth; x++) {
				this.maze.walls[y][x] = 1;
			}
		}

		// Create paths using recursive backtracking
		this.carveMaze(1, 1);
        
		// Garantir que início e fim estejam livres
		this.maze.walls[1][1] = 0;
		this.maze.walls[mazeHeight - 2][mazeWidth - 2] = 0;
        
		// Criar mais caminhos para o Minotauro se mover
		this.createAdditionalPaths();
        
		// Calcular tamanho da célula para renderização
		this.cellSize = Math.min(canvasWidth / mazeWidth, canvasHeight / mazeHeight);
        
		console.log(`✅ Labirinto gerado! CellSize: ${this.cellSize.toFixed(1)}px`);
	}
```

### createAdditionalPaths()

```javascript
	createAdditionalPaths() {
		// Criar caminhos adicionais para melhor movimentação do Minotauro
		const pathsToCreate = Math.floor(this.maze.width * this.maze.height * 0.05); // 5% de caminhos extras
        
		for (let i = 0; i < pathsToCreate; i++) {
			const x = 1 + Math.floor(Math.random() * (this.maze.width - 2));
			const y = 1 + Math.floor(Math.random() * (this.maze.height - 2));
            
			// Criar pequenos caminhos extras
			if (this.maze.walls[y] && this.maze.walls[y][x]) {
				this.maze.walls[y][x] = 0;
                
				// Conectar com caminhos vizinhos se possível
				const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
				for (const [dx, dy] of directions) {
					const nx = x + dx;
					const ny = y + dy;
					if (nx > 0 && nx < this.maze.width - 1 && ny > 0 && ny < this.maze.height - 1) {
						if (Math.random() < 0.3 && this.maze.walls[ny] && this.maze.walls[ny][nx]) {
							this.maze.walls[ny][nx] = 0;
						}
					}
				}
			}
		}
	}
```

### carveMaze(x, y)

```javascript
	carveMaze(x, y) {
		const dirs = [[0, 2], [2, 0], [0, -2], [-2, 0]];
		dirs.sort(() => Math.random() - 0.5);

		this.maze.walls[y][x] = 0;

		for (const [dx, dy] of dirs) {
			const nx = x + dx;
			const ny = y + dy;

			if (nx > 0 && nx < this.maze.width - 1 && 
				ny > 0 && ny < this.maze.height - 1 && 
				this.maze.walls[ny][nx] === 1) {
                
				this.maze.walls[y + dy / 2][x + dx / 2] = 0;
				this.carveMaze(nx, ny);
			}
		}
	}
```

### isWall(x, y)

```javascript
	isWall(x, y) {
		const gx = Math.floor(x);
		const gy = Math.floor(y);
		return this.maze.walls[gy]?.[gx] === 1;
	}
```

### astarGridPath(start, goal)

```javascript
	astarGridPath(start, goal) {
		const W = this.maze.width, H = this.maze.height;
		const walk = (x, y) => x >= 0 && y >= 0 && x < W && y < H && this.maze.walls[y][x] === 0;
		if (!walk(goal.x, goal.y) || !walk(start.x, start.y)) return [];
		const h = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
		const key = (x, y) => `${x},${y}`;

		const open = [{...start}];
		const g = new Map([[key(start.x, start.y), 0]]);
		const parent = new Map();

		while (open.length) {
			open.sort((a, b) => (g.get(key(a.x,a.y)) + h(a, goal)) - (g.get(key(b.x,b.y)) + h(b, goal)));
			const cur = open.shift();
			if (cur.x === goal.x && cur.y === goal.y) {
				// reconstruir caminho
				const path = [];
				let k = key(cur.x, cur.y);
				let node = cur;
				while (parent.has(k)) {
					path.push({ x: node.x, y: node.y });
					const p = parent.get(k);
					node = { x: p[0], y: p[1] };
					k = key(node.x, node.y);
				}
				path.reverse();
				return path;
			}
			for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
				const nx = cur.x + dx, ny = cur.y + dy;
				if (!walk(nx, ny)) continue;
				const nk = key(nx, ny);
				const tentative = (g.get(key(cur.x, cur.y)) ?? Infinity) + 1;
				if (tentative < (g.get(nk) ?? Infinity)) {
					g.set(nk, tentative);
					parent.set(nk, [cur.x, cur.y]);
					if (!open.find(n => n.x === nx && n.y === ny)) open.push({ x: nx, y: ny });
				}
			}
		}
		return [];
	}
```

### canMoveTo(x, y, size)

```javascript
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
```

### isValidPosition(x, y, size)

```javascript
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
```
