# ⚔️ Player (Teseu) – Movimento, Colisão e Renderização

Este documento detalha como o jogador (Teseu) é controlado, como interage com o grid e como é desenhado na tela.

## Representação

- Estado principal: `this.player = { x, y, r, trail }`
  - `x, y` em coordenadas contínuas (centro do jogador, em unidades de célula)
  - `r` é o raio lógico para colisão (≈ 0.45, alinhado ao tamanho visual)
  - `trail`: pontos do Fio de Ariadne quando ativo
- Tamanho visual no canvas: proporcional a `cellSize`.

## Movimento

- Teclas: `WASD` / setas
- Corrida: `Shift` (dobra a velocidade)
- Atualização: `updatePlayerMovement(deltaTime)`
  - Calcula deslocamentos `dx/dy` conforme entradas
  - Aplica atualização por eixo (x depois y) para evitar empurrar quinas
  - Antes de mover, valida com:
    - `isWalkable(gridX, gridY)` → célula precisa ser `0`
    - `canMoveTo(x, y, 0.45)` → amostragem fina para colisão

### Contrato (movimento)
- Entrada: `deltaTime` (segundos), estado de teclas
- Saída: atualiza `player.x/y` se o movimento proposto for válido
- Erros evitados: atravessar paredes, “deslizar” por fora do corredor, ficar preso em quinas

## Colisão

- Usa `canMoveTo(x, y, 0.45)` (ver README_GRID)
- Estratégia por eixo: se `x` não puder, tenta `y` e vice‑versa
- Margens e resolução ajustadas para evitar travas

## Fio de Ariadne

- Atalho: `Space` ativa/desativa o rastro
- Quando ativo, adiciona pontos periodicamente ao `player.trail`
- Renderização do fio: gradiente dourado com efeito de glow

## Renderização

- Canvas 2D, visual claro e legível
- Cálculo de posição em pixels:
  - `px = offsetX + player.x * cellSize`
  - `py = offsetY + player.y * cellSize`
- Desenho do herói:
  - Círculo com gradiente azul
  - Borda azul escura
  - Ícone “⚔️” centralizado
- Tamanho visual aproximado: `radius ≈ cellSize * 0.45`

## Interação com o Labirinto

- O jogador só se move sobre células `0` (corredores brancos)
- Condição de vitória: alcançar a célula de saída `(width-2, height-2)`
- Checagens adicionais garantem que a posição final permanece válida

## Integração no Código

- Funções envolvidas:
  - `updatePlayerMovement(deltaTime)` – movimento + colisão
  - `canMoveTo(x, y, r)` – checagem de colisão
  - `render()` – desenha player e trilha com offsets
- Estados auxiliares:
  - `this.isRunning` – atualizado a partir do estado do Shift
  - `this.threadActive` – estado do Fio de Ariadne

## Pontos de Ajuste

- `speed` base ao caminhar e multiplicador de corrida
- `r` (raio de colisão) e densidade da verificação (trade‑off entre fluidez e custo)
- Frequência de pontos do `trail` e tamanho máximo do histórico

---

Dica: ao ajustar o tamanho visual do player, mantenha o raio lógico (`r`) coerente com o novo tamanho para evitar “sobreposição” visual com paredes.
