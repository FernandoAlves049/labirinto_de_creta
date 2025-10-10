# 🏛️ Labirinto de Creta — O Desafio do Minotauro

Uma experiência HTML5/Canvas onde você guia Teseu (⚔️) pelos corredores brancos de um labirinto gerado proceduralmente, fugindo do Minotauro (🐂) até alcançar a saída.

**Última atualização:** Outubro/2025  
**Versão atual:** 2.2.0  
**Próxima release:** 2.3.0 (refinos de IA e UX)

---

## 🔗 Links

- 🎮 Jogar localmente: http://localhost:8080/index.html
- 📖 Documentação técnica: `docs/`
  - Grid: `docs/README_GRID.md`
  - Player: `docs/README_PLAYER.md`

---

## ✨ Principais features

- 🧭 Labirinto B/W centralizado (paredes pretas, corredores brancos)
- 🤖 Minotauro com A* em grade (4 direções) e replanejamento periódico
- 🧲 Colisão por amostragem (só anda no “branco”), com deslizamento em quina e snap ao centro da célula
- ⚡ Player com corrida (Shift), rastro “Fio de Ariadne” (Space) e movimento por eixo
- 🔊 Áudio procedural (músicas e SFX), volume no HUD (popover) e controle no modal de Configurações
- ⚙️ Modal de Configurações: Música/SFX on/off, Volume, Dificuldade (easy/normal/hard), Fio ao iniciar, Mostrar caminho (debug)
- ❓ Modal “Como Jogar” integrado ao menu

---

## 🗂️ Estrutura

```
labirinto_de_creta/
├─ index.html
├─ css/
│  └─ main.css
├─ js/
│  └─ main.js
└─ docs/
   ├─ README_GRID.md
   └─ README_PLAYER.md
```

---

## � Como executar

Recomendado rodar via um servidor local simples.

Windows (PowerShell):
```powershell
cd labirinto_de_creta
python -m http.server 8080
# Abra: http://localhost:8080/index.html
```

Sem servidor (menos recomendado):
- Abra `index.html` diretamente no navegador.

---

## 🎮 Controles

- WASD / Setas: mover
- Shift: correr (2×)
- Space: Fio de Ariadne (liga/desliga)
- Esc: voltar ao menu

---

## 🧠 IA do Minotauro (resumo)

- Estados: PATROL, HUNT, CHASE, ATTACK
- Pathfinding: A* 4-direções no grid de células (0/1)
- Replanejamento: ~500ms ou quando o objetivo muda
- Dificuldade: ajusta a velocidade base
- Debug opcional: render do caminho no canvas

---

## ⚙️ Configurações (in-game)

Abra em Menu → Configurações.

- Música habilitada: liga/desliga trilhas procedurais
- Efeitos sonoros: liga/desliga SFX
- Volume geral: afeta músicas e SFX
- Dificuldade: easy/normal/hard (impacta a velocidade do Minotauro)
- Fio ao iniciar: entra no nível com o rastro ativo
- Mostrar caminho (debug): desenha o caminho A* do Minotauro

Você também pode ajustar o volume rapidamente pelo botão 🔊 no HUD (canto superior direito).

---

## �️ Tecnologias

- HTML5 Canvas 2D
- JavaScript ES6+
- CSS3 (glassmorphism, responsivo)

---

## � Ajuda rápida

- Jogo não carrega: verifique o Console (F12) e acesse via servidor local.
- Minotauro parado: aguarde replanejamento ou verifique “Mostrar caminho” em Configurações.
- Sem som: ajuste o volume no HUD/Configurações e cheque permissões do navegador.

---

## � Roadmap curto

- [ ] Crossfade suave entre trilhas
- [ ] Minimap opcional
- [ ] Persistência de preferências (localStorage)
- [ ] Tela de login com Google (Firebase Auth)

---

## 📄 Licença

MIT — veja `LICENSE`.

---

“Entre na lenda. Escape do labirinto. Derrote o Minotauro.”