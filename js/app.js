import { LabirintoDeCreta } from './main.js';
import LevelSelector from './level-selector.js';

window.addEventListener('DOMContentLoaded', () => {
  const game = new LabirintoDeCreta();
  game.init();

  // Inicializar seletor de níveis
  LevelSelector.init({ containerId: 'level-select-overlay', perRow: 6, maxLevels: 30 });
  window.LevelSelector = LevelSelector;

  // Quando um nível é selecionado no seletor, iniciar o jogo nesse nível
  window.addEventListener('level:selected', (e) => {
    const lvl = e.detail && e.detail.level ? Number(e.detail.level) : 1;
    game.startNewGame(lvl);
  });
});
