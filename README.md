# 🏛️ Labirinto de Creta — O Desafio do Minotauro

Uma experiência HTML5/Canvas onde você guia Teseu (⚔️) pelos corredores brancos de um labirinto gerado proceduralmente, fugindo do Minotauro (🐂) até alcançar a saída.

**Última atualização:** Novembro/2025  
**Versão atual:** 2.2.0

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

## 🛠️ Como executar

Recomendado rodar via um servidor local simples.

Windows (PowerShell):
```powershell
cd "d:\if 4º periodo\labirinto_de_creta"
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
{novo}
## 📅 Manipulação de Datas

Trabalhar com datas em JavaScript é comum (tempo de jogo, histórico, estatísticas). Abaixo há exemplos práticos e dicas.

### Criar e formatar datas

```javascript
// agora
const now = new Date();
console.log(now.toString());

// ISO -> Date e validação
const iso = '2025-11-06T12:30:00Z';
const d = new Date(iso);
if (Number.isNaN(d.getTime())) {
  console.error('Data inválida');
} else {
  console.log(d.toLocaleString('pt-BR'));
}

// formatação localizada
const opts = { dateStyle: 'medium', timeStyle: 'short' };
console.log(new Date().toLocaleString('pt-BR', opts));
```

### Cálculos com datas

```javascript
// somar dias (maneira segura)
function addDays(date, days) {
  const copy = new Date(date.getTime());
  copy.setDate(copy.getDate() + days);
  return copy;
}

const hoje = new Date();
const daqui7 = addDays(hoje, 7);
console.log(daqui7.toLocaleDateString());

// diferença em dias
function daysBetween(a, b) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((b - a) / msPerDay);
}
```

Dica: para fusos, manipulações mais avançadas e regras de calendário (DST), prefira bibliotecas como Luxon. Este projeto inclui um utilitário simples `js/date-utils.js` com helpers básicos reutilizáveis.

---

## 🔒 Mecanismo de Exceção (try / catch)

Tratar exceções corretamente evita que o jogo "quebre" e permite fornecer mensagens amigáveis ao jogador.

### Estrutura básica

```javascript
try {
  const data = JSON.parse(userInput);
  processData(data);
} catch (err) {
  console.error('Falha ao processar entrada do usuário:', err);
  showToast('Ops — houve um problema com seus dados. Tente novamente.');
}
```

### Boas práticas

- Trate erros no nível onde podem ser resolvidos (perto da operação que pode falhar).
- Logue detalhes técnicos (console ou serviço remoto) e mostre mensagens simples ao usuário.
- Evite `catch {}` vazio — sempre registre ou trate o erro.
- Forneça fallbacks quando possível (valores padrão, telas de erro amigáveis).

### Exemplo: parser seguro com fallback

```javascript
function safeParse(json, fallback = {}) {
  try {
    return JSON.parse(json);
  } catch (err) {
    console.warn('JSON inválido, retornando fallback', err);
    return fallback;
  }
}
```

### async/await e tratamento

```javascript
async function loadLevel(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Falha ao carregar nível', err);
    showErrorModal('Não foi possível carregar o nível. Verifique sua conexão.');
    return null;
  }
}
```

### Quando relançar (`throw`)

Relance apenas quando o chamador puder tratar o erro. Caso contrário, trate localmente e forneça informações úteis.



---
{novo}
## 🛟 Ajuda rápida

- Jogo não carrega: verifique o Console (F12) e acesse via servidor local.
- Minotauro captura de longe: verificar debug "Mostrar caminho" e ajustar `maxCellsForCapture` em `js/main.js`.
- Sem som: ajuste o volume no HUD/Configurações e cheque permissões do navegador.

---

## 📄 Licença

MIT — veja `LICENSE`.

---

“Entre na lenda. Escape do labirinto. Derrote o Minotauro.”
