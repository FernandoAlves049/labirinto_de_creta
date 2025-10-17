/**
 * nivel.js
 * Helpers para criar e manipular níveis (labirintos) de forma robusta.
 * Uso: import Level, { generateMaze, presets } from './nivel.js'
 *
 * Design em PT-BR, leve, sem dependências externas.
 */

/** Tipos de tile (podem ser números ou strings conforme sua engine) */
export const TILE = {
    WALL: 1,
    FLOOR: 0,
    PLAYER: 'P',
    EXIT: 'E',
    ENEMY: 'M',
    ITEM: 'I'
};

/** Gera números pseudo-aleatórios com seed opcional (Mulberry32) */
export function rng(seed = Date.now()) {
    let t = seed >>> 0;
    return () => {
        t += 0x6D2B79F5;
        let r = Math.imul(t ^ (t >>> 15), 1 | t);
        r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
}

/** Embaralha array in-place */
function shuffle(arr, random = Math.random) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

/** Classe que representa um nível */
export class Level {
    /**
     * @param {number} width largura (colunas)
     * @param {number} height altura (linhas)
     * @param {Array} map 2D array [y][x] com tiles
     * @param {Object[]} entities lista de entidades {type, x, y, data}
     */
    constructor(width, height, map = null, entities = []) {
        this.width = width;
        this.height = height;
        this.map = map || Level.createFilledMap(width, height, TILE.WALL);
        this.entities = entities.slice();
    }

    static createFilledMap(width, height, fill = TILE.WALL) {
        const map = new Array(height);
        for (let y = 0; y < height; y++) {
            map[y] = new Array(width).fill(fill);
        }
        return map;
    }

    get(x, y) {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height) return TILE.WALL;
        return this.map[y][x];
    }

    set(x, y, value) {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
        this.map[y][x] = value;
    }

    clone() {
        const newMap = this.map.map(row => row.slice());
        return new Level(this.width, this.height, newMap, this.entities.map(e => ({ ...e })));
    }

    toJSON() {
        return {
            width: this.width,
            height: this.height,
            map: this.map,
            entities: this.entities
        };
    }

    /** Coloca entidade (respeita tiles válidos) */
    placeEntity(type, x, y, data = {}) {
        if (this.get(x, y) === TILE.FLOOR || this.get(x, y) === TILE.PLAYER || this.get(x, y) === TILE.EXIT) {
            this.entities.push({ type, x, y, data });
            return true;
        }
        return false;
    }

    /** Remove todas as entidades de um tipo */
    removeEntitiesByType(type) {
        this.entities = this.entities.filter(e => e.type !== type);
    }

    /** Busca célula mais distante do ponto (sx, sy) usando BFS */
    findFarthestFrom(sx, sy) {
        const dist = Array.from({ length: this.height }, () => Array(this.width).fill(-1));
        const q = [];
        if (this.get(sx, sy) !== TILE.FLOOR) return null;
        dist[sy][sx] = 0;
        q.push([sx, sy]);
        let far = [sx, sy, 0];
        while (q.length) {
            const [x, y] = q.shift();
            const d = dist[y][x];
            if (d > far[2]) far = [x, y, d];
            for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
                const nx = x + dx, ny = y + dy;
                if (nx < 0 || ny < 0 || nx >= this.width || ny >= this.height) continue;
                if (dist[ny][nx] !== -1) continue;
                if (this.get(nx, ny) !== TILE.FLOOR) continue;
                dist[ny][nx] = d + 1;
                q.push([nx, ny]);
            }
        }
        return { x: far[0], y: far[1], dist: far[2] };
    }

    /** Validação básica do nível */
    validate({ requirePlayer = true, requireExit = true } = {}) {
        // checar dimensões
        if (this.width <= 2 || this.height <= 2) throw new Error('Dimensões inválidas (muito pequenas).');
        // checar bordas como paredes
        for (let x = 0; x < this.width; x++) {
            if (this.get(x, 0) === TILE.FLOOR) throw new Error('Borda superior contém chão.');
            if (this.get(x, this.height - 1) === TILE.FLOOR) throw new Error('Borda inferior contém chão.');
        }
        for (let y = 0; y < this.height; y++) {
            if (this.get(0, y) === TILE.FLOOR) throw new Error('Borda esquerda contém chão.');
            if (this.get(this.width - 1, y) === TILE.FLOOR) throw new Error('Borda direita contém chão.');
        }
        // checar entidades
        const hasPlayer = this.entities.some(e => e.type === TILE.PLAYER);
        const hasExit = this.entities.some(e => e.type === TILE.EXIT);
        if (requirePlayer && !hasPlayer) throw new Error('Jogador não está presente no nível.');
        if (requireExit && !hasExit) throw new Error('Saída não está presente no nível.');
        return true;
    }
}

/**
 * Gera labirinto usando recursive backtracker (carve passages).
 * width/height preferidos como ímpares para formar paredes entre células.
 * options:
 *  - seed: number
 *  - makeOdd: boolean (força dimensões ímpares)
 *  - complexity: 0..1 (não usado por agora, placeholder)
 */
export function generateMaze(width, height, options = {}) {
    const { seed = Date.now(), makeOdd = true } = options;
    if (makeOdd) {
        if (width % 2 === 0) width--;
        if (height % 2 === 0) height--;
    }
    const rand = rng(seed);

    // iniciar tudo como parede
    const lvl = new Level(width, height);
    // marcar celulas de "passage" em posições ímpares
    for (let y = 1; y < height; y += 2) {
        for (let x = 1; x < width; x += 2) {
            lvl.set(x, y, TILE.FLOOR);
        }
    }

    // recursive backtracker iterativo sobre "cells" (x,y pares de indices em grid de células)
    const cellStack = [];
    const visited = new Set();
    function cellKey(cx, cy) { return cx + ',' + cy; }

    // lista inicial de células (todas posições ímpares)
    const cells = [];
    for (let y = 1; y < height; y += 2) for (let x = 1; x < width; x += 2) cells.push([x, y]);
    // começar por uma célula aleatória
    shuffle(cells, rand);
    const [sx, sy] = cells[0];
    cellStack.push([sx, sy]);
    visited.add(cellKey(sx, sy));

    while (cellStack.length) {
        const [cx, cy] = cellStack[cellStack.length - 1];
        // vizinhos possíveis a 2 de distancia
        const neighbors = [];
        for (const [dx, dy] of [[2,0],[-2,0],[0,2],[0,-2]]) {
            const nx = cx + dx, ny = cy + dy;
            if (nx > 0 && ny > 0 && nx < width && ny < height && !visited.has(cellKey(nx, ny))) {
                neighbors.push([nx, ny]);
            }
        }
        if (neighbors.length === 0) {
            cellStack.pop();
        } else {
            shuffle(neighbors, rand);
            const [nx, ny] = neighbors[0];
            // remover parede entre cx,cy e nx,ny
            const wallX = cx + (nx - cx) / 2;
            const wallY = cy + (ny - cy) / 2;
            lvl.set(wallX, wallY, TILE.FLOOR);
            visited.add(cellKey(nx, ny));
            cellStack.push([nx, ny]);
        }
    }

    // Garantir bordas como parede (já estão, mas reforçar)
    for (let x = 0; x < width; x++) { lvl.set(x, 0, TILE.WALL); lvl.set(x, height - 1, TILE.WALL); }
    for (let y = 0; y < height; y++) { lvl.set(0, y, TILE.WALL); lvl.set(width - 1, y, TILE.WALL); }

    // colocar jogador na primeira célula livre (1,1) se possível
    const playerPos = (lvl.get(1,1) === TILE.FLOOR) ? { x: 1, y: 1 } : lvl.findFarthestFrom(1,1) || { x: 1, y: 1 };
    lvl.entities = [];
    lvl.entities.push({ type: TILE.PLAYER, x: playerPos.x, y: playerPos.y, data: {} });

    // colocar saída na célula mais distante do jogador
    const far = lvl.findFarthestFrom(playerPos.x, playerPos.y);
    if (far) {
        lvl.entities.push({ type: TILE.EXIT, x: far.x, y: far.y, data: {} });
    }

    return lvl;
}

/** Carrega nível a partir de blueprint (matriz ou string) */
export function loadFromBlueprint(blueprint) {
    // blueprint pode ser: array de strings, array de arrays, ou objeto JSON {map, entities}
    if (Array.isArray(blueprint)) {
        // array de strings ou array de arrays com símbolos: '#' parede, '.' chão, 'P' jogador, 'E' saída
        const height = blueprint.length;
        const width = Math.max(...blueprint.map(r => r.length));
        const map = Level.createFilledMap(width, height, TILE.WALL);
        const entities = [];
        for (let y = 0; y < height; y++) {
            const row = blueprint[y];
            for (let x = 0; x < width; x++) {
                const ch = (typeof row === 'string') ? (row[x] || '#') : (row[x] ?? '#');
                switch (ch) {
                    case '#': map[y][x] = TILE.WALL; break;
                    case '.': map[y][x] = TILE.FLOOR; break;
                    case 'P': map[y][x] = TILE.FLOOR; entities.push({ type: TILE.PLAYER, x, y }); break;
                    case 'E': map[y][x] = TILE.FLOOR; entities.push({ type: TILE.EXIT, x, y }); break;
                    case 'M': map[y][x] = TILE.FLOOR; entities.push({ type: TILE.ENEMY, x, y }); break;
                    case 'I': map[y][x] = TILE.FLOOR; entities.push({ type: TILE.ITEM, x, y }); break;
                    default:
                        map[y][x] = TILE.FLOOR; // assume chão por padrão para outros símbolos
                }
            }
        }
        return new Level(width, height, map, entities);
    } else if (typeof blueprint === 'object' && blueprint.map) {
        return new Level(blueprint.width || blueprint.map[0].length, blueprint.height || blueprint.map.length, blueprint.map, blueprint.entities || []);
    } else {
        throw new Error('Blueprint inválido');
    }
}

/** Presets convenientes */
export const presets = {
    easy: (seed) => generateMaze(21, 15, { seed }),
    medium: (seed) => generateMaze(31, 21, { seed }),
    hard: (seed) => generateMaze(41, 31, { seed })
};

/** Exemplos rápidos:
const lvl = generateMaze(31,21, { seed:12345 });
console.log(JSON.stringify(lvl.toJSON()));
*/

/* Export padrão */
export default Level;