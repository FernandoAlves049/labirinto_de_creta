# Labirinto de Creta (Versão Canvas/ESM)

Projeto de jogo 2D top‑down em HTML5 Canvas com JS (ES Modules). Gera labirintos procedurais, possui campo de visão/iluminação simples, IA do Minotauro com detecção de linha‑de‑visão (LOS) e perseguição, HUD consolidada e controles responsivos.

## 🎮 Como jogar
- **Mover**: WASD ou setas
- **Fio de Ariadne** (rastro): segure **Espaço**
- **Pausar**: **Esc** (confirma reinício)
- **Reiniciar**: **R** (com confirmação)
- **Objetivo**: sair do labirinto (quadrado verde) sem ser pego pelo Minotauro.

## 🚀 Rodando localmente
1. Qualquer servidor estático já serve. Exemplos:
   ```bash
   # Python 3
   cd labirinto_de_creta_game_full
   python -m http.server 8080
   # Acesse http://localhost:8080
   ```
2. Ou use extensões como “Live Server” (VS Code).

> Importante: usamos **ES Modules**. Abrir `index.html` direto no arquivo (sem servidor) pode falhar por CORS.

## 🧩 Arquitetura
```
/assets
  /img        (reservado para sprites/fundos futuros)
  /sfx        (reservado para áudio futuro)
/docs         (documentação complementar)
/src
  main.js                 (loop do jogo e orquestração)
  /modules
    renderer.js           (canvas, desenho, iluminação)
    hud.js                (HUD + modais)
    input.js              (teclado, pausa, confirmação)
    mazeGenerator.js      (backtracking + verificação de caminho)
    player.js             (movimento + rastro do Fio)
    minotaur.js           (patrulha + perseguição com LOS)
    vision.js             (linha-de-visão por Bresenham)
    sprites.js            (loader futuro de sprites)
index.html
style.css
README.md
```

## 🧠 Mecânicas
- **Geração Procedural**: Recursive backtracking sobre grade ímpar; garante caminho viável entre entrada `(1,1)` e saída `(w-2,h-2)` via BFS.
- **Colisão**: AABB simplificada por eixo; evita “corner cutting”.
- **Iluminação**: máscara com `destination-out` centrada no jogador.
- **IA do Minotauro**: dois estados (`PATROL`/`CHASE`); visão por LOS; perseguição levemente mais rápida que o jogador; patrulha com escolha de direção segura e timer.
- **Escalonamento de nível**: tamanho do labirinto aumenta gradualmente até 41x41.

## ✅ Qualidade / Sem bugs conhecidos
- HUD atualizada por **única fonte de verdade** (`hudSet`).
- Inputs registrados **uma vez**; polling no loop.
- Timer baseado em `requestAnimationFrame` (`timeMs`), não em `setInterval`.
- Render em alta resolução com `devicePixelRatio`.
- Sobreposição de loading escondida no `boot`.

## 📌 Próximos passos (sugeridos)
- Sprites reais (player/Minotauro), sons contextuais.
- Dificuldade adaptativa (campo de visão, velocidade).
- “Santuários” e “fragmentos de história” como salas especiais.
- Tela inicial e sistema de save (Firebase) — módulo pronto para integrar.
