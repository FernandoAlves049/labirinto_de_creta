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