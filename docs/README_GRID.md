# O Grid do Labirinto

O labirinto é tecnicamente uma matriz bidimensional onde cada célula possui um valor que define se é um corredor andável (0) ou uma parede intransponível (1). Este grid é a espinha dorsal das mecânicas do jogo:

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
