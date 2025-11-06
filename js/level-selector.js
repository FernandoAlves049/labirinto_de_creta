import Usuario from './usuario.js';

const LevelSelector = {
  init({ containerId = 'level-select-overlay', perRow = 6, maxLevels = 30 } = {}) {
    this.container = document.getElementById(containerId);
    this.perRow = perRow;
    this.maxLevels = maxLevels;
    this.createGrid();
  },

  createGrid() {
    if (!this.container) return;
    const grid = document.createElement('div');
    grid.className = 'level-grid';
    for (let i = 1; i <= this.maxLevels; i++) {
      const cell = document.createElement('button');
      cell.className = 'level-cell';
      cell.dataset.level = String(i);
      cell.textContent = String(i);
      if (!Usuario.isLevelUnlocked(i)) {
        cell.classList.add('locked');
        cell.disabled = true;
      } else {
        cell.classList.add('unlocked');
      }
      cell.addEventListener('click', () => this.onSelect(i));
      grid.appendChild(cell);
    }
    // limpar container e anexar
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'level-grid-wrap';
    wrap.appendChild(grid);
    this.container.appendChild(wrap);
  },

  refresh() { this.createGrid(); },

  onSelect(level) {
    // dispara evento custom para o jogo iniciar esse nível
    const ev = new CustomEvent('level:selected', { detail: { level } });
    window.dispatchEvent(ev);
    // fechar overlay
    if (this.container) this.container.classList.remove('active');
  },

  open() { if (this.container) this.container.classList.add('active'); },
  close() { if (this.container) this.container.classList.remove('active'); }
};

export default LevelSelector;
