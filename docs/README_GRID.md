# 🧱 Grid do Labirinto (Visão Técnica)

Este documento descreve como o labirinto é representado, desenhado e usado para colisão e pathfinding no jogo.

## Estrutura do Grid

- Dimensões: `maze.width` × `maze.height`
- Dados: `maze.walls[y][x]`
  - `0` = corredor (área branca, andável)
  - `1` = parede (área preta, não andável)
- Coordenadas:
  - Grade inteira: `(x, y)` inteiros identificam células.
  - Espaço contínuo (jogo): `(x, y)` reais, onde o centro de uma célula é `x+0.5, y+0.5`.
- Tamanho visual da célula: `cellSize` pixels (usado na renderização e escalas do player/boss).

## Renderização

- Fundo branco e paredes pretas (estilo clássico).
- O labirinto é centralizado no canvas com offsets:
  - `offsetX = (canvas.width - maze.width * cellSize) / 2`
  - `offsetY = (canvas.height - maze.height * cellSize) / 2`
- Para cada célula com parede (`walls[y][x] === 1`):
  - Desenha um retângulo preto em `(offsetX + x*cellSize, offsetY + y*cellSize)` com tamanho `cellSize`.
- A saída fica em `exit = (maze.width-2, maze.height-2)` e recebe um glow verde.

## Andabilidade e Colisão

- Funções chave:
  - `isWall(x, y)`: retorna se uma posição contínua cai numa célula de parede.
  - `canMoveTo(x, y, r)`: amostra o entorno de `(x,y)` com raio `r` e rejeita se tocar parede ou sair dos limites.
- Parâmetros importantes de colisão:
  - Margem de segurança interna: ~`0.02`.
  - Resolução de amostragem: ~`0.1` (densidade da verificação).
  - Limites com borda: movimento inválido se qualquer amostra sair para fora do retângulo útil do labirinto.

### Contrato (helpers)
- Entrada: `x, y` em coordenadas contínuas do jogo; `r` em unidades de célula.
- Saída: `true` se a posição é válida (somente sobre células 0 e sem tocar paredes), `false` caso contrário.
- Erros evitados: atravessar cantos, “colar” em parede, sair do mapa.

## Pathfinding (A*)

- `astarGridPath(start, goal)` opera em células inteiras.
  - Vizinhança: 4-direções (N, S, L, O).
  - Heurística: Manhattan.
  - Caminho retornado: lista de `{x,y}` (células) do início ao objetivo.
- Uso típico:
  - `start = { x: floor(minotaur.x), y: floor(minotaur.y) }`
  - `goal` é célula do jogador ou última posição conhecida.
  - Waypoint alvo é sempre o centro da célula: `tx = wp.x + 0.5`, `ty = wp.y + 0.5`.

## Geração do Labirinto

- O labirinto é gerado de forma procedural ao iniciar/avançar nível, garantindo conectividade.
- Resultado final disponibiliza `maze.width`, `maze.height`, `maze.walls` (0/1) usados por renderização, colisão e A*.

## Integração com o Jogo

- Renderização: usa `maze.walls` e `cellSize` + offsets para desenhar.
- Movimento/Colisão: `canMoveTo` e `isWall` garantem que entidades só se movem nos corredores (branco).
- A*: consome o grid (0/1) e gera caminhos coerentes com a malha de células.

## Pontos de Ajuste

- `cellSize`: altera escala visual de todo o labirinto.
- Densidade da colisão: aumentar a resolução reduz glitches em cantos (custo computacional maior).
- Frequência de replanejamento (A*): controla responsividade do inimigo.

---

Dica: sempre converta coordenadas contínuas para célula com `floor(x)` e use `+0.5` para mirar no centro ao seguir waypoints.
