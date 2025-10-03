import { initRenderer, renderFrame, resize } from './modules/renderer.js';
import { initHUD, hudSet, setMessage, bindStatusButtons } from './modules/hud.js';
import { initInput, pollInput, onOnceUserInteract } from './modules/input.js';
import { Maze } from './modules/mazeGenerator.js';
import { Player } from './modules/player.js';
import { Minotaur } from './modules/minotaur.js';
import { loadSprites } from './modules/sprites.js';

export const game = {
  level: 1,
  timeMs: 0,
  state: 'boot', // 'playing' | 'paused' | 'won' | 'lost'
  maze: null, player: null, minotaur: null,
  fioAtivo: false,
  seed: Math.floor(Math.random()*1e9)
};

let last = 0;

function startLevel(n = game.level){
  game.level = n;
  game.timeMs = 0;
  game.state = 'playing';
  const size = Math.min(15 + (n-1)*2, 41);
  game.maze = new Maze(size, size, game.seed + n);
  game.player = new Player(game.maze.startCell);
  game.minotaur = new Minotaur(game.maze.minotaurSpawn, game.maze);
  hudSet({ level: n, fio: game.fioAtivo, minotaur: 'PATROL', time: 0 });
  setMessage('Encontre a saída sem ser pego!');
  resize();
}

function checkWinLose(){
  const p = game.player;
  if (Math.abs(p.x - game.maze.exitCell.x - 0.5) < 0.4 &&
      Math.abs(p.y - game.maze.exitCell.y - 0.5) < 0.4){
    game.state = 'won';
    setMessage('Você escapou! 🎉');
    hudSet({ minotaur: '—' });
    return;
  }
  const dx = game.minotaur.x - p.x;
  const dy = game.minotaur.y - p.y;
  if ((dx*dx + dy*dy) < 0.35*0.35){
    game.state = 'lost';
    setMessage('O Minotauro te pegou! 💀');
    hudSet({ minotaur: '—' });
  }
}

function tick(ts){
  const dt = Math.min(32, ts - last || 16); last = ts;
  if (game.state === 'playing'){
    game.timeMs += dt;
    pollInput(game, dt);
    game.player.update(dt, game.maze);
    game.minotaur.update(dt, game.player, game.maze);
    checkWinLose();
    hudSet({ time: Math.floor(game.timeMs/1000), minotaur: game.minotaur.state });
  }
  renderFrame(game);
  requestAnimationFrame(tick);
}

function bindUI(){
  bindStatusButtons({
    next: ()=> { if (game.state==='won'){ startLevel(game.level+1); } },
    retry:()=> { startLevel(game.level); }
  });
  window.addEventListener('resize', resize);
}

// === SISTEMA DE MENU ===
function showMenu(){
  document.getElementById('menu').classList.remove('hidden');
  document.getElementById('loading').classList.add('hidden');
  document.querySelector('.topbar').classList.add('hidden');
  document.querySelector('.game-wrap').classList.add('hidden');
}

function hideMenu(){
  document.getElementById('menu').classList.add('hidden');
  document.querySelector('.topbar').classList.remove('hidden');
  document.querySelector('.game-wrap').classList.remove('hidden');
}

function startGame(){
  console.log('🎮 Iniciando jogo...');
  hideMenu();
  initGameSystems();
  startLevel(1);
  requestAnimationFrame(tick);
}

function initGameSystems(){
  initRenderer();
  initHUD();
  initInput();
  bindUI();
  onOnceUserInteract(()=>{ /* armar áudio futuro, se houver */ });
}

function bindMenuButtons(){
  const btnGuest = document.getElementById('btnGuest');
  const btnGoogle = document.getElementById('btnGoogle');
  const btnSettings = document.getElementById('btnSettings');
  const btnHelp = document.getElementById('btnHelp');

  btnGuest.addEventListener('click', () => {
    startGame();
  });

  btnGoogle.addEventListener('click', () => {
    alert('🚧 Login com Google será implementado em breve!\n\nPor enquanto, use "Jogar como Convidado".');
  });

  btnSettings.addEventListener('click', () => {
    alert('⚙️ Configurações:\n\n🔊 Som: Ativado\n🎮 Controles: WASD + SPACE\n📱 Responsivo: Sim');
  });

  btnHelp.addEventListener('click', () => {
    alert(`❓ Como Jogar - Labirinto de Creta:

🎯 OBJETIVO:
• Escape do labirinto sem ser capturado pelo Minotauro

🎮 CONTROLES:
• WASD ou Setas: Mover Teseu
• SPACE: Ativar/desativar Fio de Ariadne
• ESC: Pausar jogo
• R: Reiniciar nível

🧵 FIO DE ARIADNE:
• Deixa um rastro do seu caminho
• Use para não se perder no labirinto

🐂 MINOTAURO:
• Patrulha o labirinto procurando por você
• Fica mais agressivo se te vir
• Evite ser capturado!

🏆 DICAS:
• Use as paredes para se esconder
• O Fio de Ariadne te ajuda a voltar
• Seja rápido mas cuidadoso!`);
  });
}

async function boot(){
  await loadSprites();
  bindMenuButtons();
  showMenu();
}

boot();
