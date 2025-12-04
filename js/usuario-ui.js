import Usuario from './usuario.js';

// util: formato simples mm:ss de ms
function msToTime(ms) {
  if (ms == null || !Number.isFinite(ms)) return '--';
  const totalSec = Math.floor(ms / 1000);
  const minutes = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const seconds = String(totalSec % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

// Sincroniza DOM com Usuario
const UsuarioUI = {
  init() {
    Usuario.init();
    this.cache();
    this.bind();
    this.renderProfile();
    this.fillSettings();
  },

  cache() {
    this.el = {
      userAvatar: document.getElementById('user-avatar'),
      userName: document.getElementById('user-name'),
      btnEditProfile: document.getElementById('btn-edit-profile'),
      settingsUsername: document.getElementById('settings-username'),
      settingsAvatar: document.getElementById('settings-avatar'),
      btnExport: document.getElementById('btn-export-user'),
      btnImport: document.getElementById('btn-import-user'),
      // quick profile panel elements
      profilePanel: document.getElementById('profile-panel'),
      profileAvatar: document.getElementById('profile-avatar'),
      profileName: document.getElementById('profile-name'),
      profileStats: document.getElementById('profile-stats'),
      btnEditProfileQuick: document.getElementById('btn-edit-profile-quick'),
      btnExportQuick: document.getElementById('btn-export-user-quick'),
      btnImportQuick: document.getElementById('btn-import-user-quick'),
      btnLoginQuick: document.getElementById('btn-login-quick'),
      btnLogoutQuick: document.getElementById('btn-logout-quick'),
      inputImportFile: document.getElementById('input-import-file')
    };
  },

  bind() {
  this.el.btnEditProfile?.addEventListener('click', () => this.openEditModal());
  // quick edit button in profile panel
  this.el.btnEditProfileQuick?.addEventListener('click', () => this.openEditModal());
  // login/logout quick
  this.el.btnLoginQuick?.addEventListener('click', () => this.openLoginModal());
  this.el.btnLogoutQuick?.addEventListener('click', () => this.logout());
    this.el.settingsUsername?.addEventListener('input', (e) => this.onSettingsChange());
    this.el.settingsAvatar?.addEventListener('input', (e) => this.onSettingsChange());
    this.el.btnExport?.addEventListener('click', () => this.exportProfile());
    this.el.btnImport?.addEventListener('click', () => this.el.inputImportFile?.click());
  // quick export/import buttons
  this.el.btnExportQuick?.addEventListener('click', () => this.exportProfile());
  this.el.btnImportQuick?.addEventListener('click', () => this.el.inputImportFile?.click());
    this.el.inputImportFile?.addEventListener('change', (e) => this.importFromFile(e));
    // modal elements
    this.modal = document.getElementById('edit-profile-modal');
    this.modalName = document.getElementById('edit-profile-name');
    this.modalAvatar = document.getElementById('edit-profile-avatar');
    this.modalSave = document.getElementById('edit-profile-save');
    this.modalCancel = document.getElementById('edit-profile-cancel');
    if (this.modalSave) this.modalSave.addEventListener('click', () => this.saveFromModal());
    if (this.modalCancel) this.modalCancel.addEventListener('click', () => this.closeModal());
    if (this.modal) this.modal.addEventListener('click', (e) => { if (e.target === this.modal) this.closeModal(); });

    // login modal elements
    this.loginModal = document.getElementById('login-modal');
    this.loginName = document.getElementById('login-name');
    this.loginAvatar = document.getElementById('login-avatar');
    this.loginSubmit = document.getElementById('login-submit');
    this.loginCancel = document.getElementById('login-cancel');
    if (this.loginSubmit) this.loginSubmit.addEventListener('click', () => this.submitLogin());
    if (this.loginCancel) this.loginCancel.addEventListener('click', () => this.closeLoginModal());
    if (this.loginModal) this.loginModal.addEventListener('click', (e) => { if (e.target === this.loginModal) this.closeLoginModal(); });
  },

  renderProfile() {
    const data = Usuario.get();
    const avatar = data.avatar || '⚔️';
    const name = data.name || 'Jogador';
    if (this.el.userAvatar) this.el.userAvatar.textContent = avatar;
    if (this.el.userName) this.el.userName.textContent = name;
    if (this.el.profileAvatar) this.el.profileAvatar.textContent = avatar;
    if (this.el.profileName) this.el.profileName.textContent = name;

    // Estatísticas rápidas no painel
    if (this.el.profileStats) {
      const stats = data.stats || { gamesPlayed: 0, wins: 0, bestTimeMs: null };
      const best = stats.bestTimeMs == null ? '--' : msToTime(stats.bestTimeMs);
      this.el.profileStats.textContent = `Jogos: ${stats.gamesPlayed} • Vitórias: ${stats.wins} • Melhor: ${best}`;
    }

    // Mostrar/ocultar botões dependendo do estado de login
    const logged = Usuario.isLoggedIn && Usuario.isLoggedIn();
    if (this.el.btnLoginQuick) this.el.btnLoginQuick.style.display = logged ? 'none' : 'inline-flex';
    if (this.el.btnLogoutQuick) this.el.btnLogoutQuick.style.display = logged ? 'inline-flex' : 'none';
    // quando deslogado, ocultar ações sensíveis
    const actionButtons = [this.el.btnEditProfileQuick, this.el.btnExportQuick, this.el.btnImportQuick];
    actionButtons.forEach(b => { if (b) b.style.display = logged ? 'inline-flex' : 'none'; });
  },

  fillSettings() {
    const data = Usuario.get();
    if (this.el.settingsUsername) this.el.settingsUsername.value = data.name || '';
    if (this.el.settingsAvatar) this.el.settingsAvatar.value = data.avatar || '';
  },

  onSettingsChange() {
    const name = this.el.settingsUsername?.value || undefined;
    const avatar = this.el.settingsAvatar?.value || undefined;
    Usuario.setProfile({ name, avatar });
    this.renderProfile();
  },

  openEditModal() {
    const data = Usuario.get();
    if (this.modalName) this.modalName.value = data.name || '';
    if (this.modalAvatar) this.modalAvatar.value = data.avatar || '';
    if (this.modal) this.modal.classList.add('active');
    // focus first input
    setTimeout(() => this.modalName?.focus(), 50);
  },

  openLoginModal() {
    const data = Usuario.get();
    if (this.loginName) this.loginName.value = data.name || '';
    if (this.loginAvatar) this.loginAvatar.value = data.avatar || '';
    if (this.loginModal) this.loginModal.classList.add('active');
    setTimeout(() => this.loginName?.focus(), 50);
  },

  closeLoginModal() {
    if (this.loginModal) this.loginModal.classList.remove('active');
  },

  submitLogin() {
    const name = this.loginName?.value ?? undefined;
    const avatar = this.loginAvatar?.value ?? undefined;
    Usuario.login({ name, avatar });
    this.fillSettings();
    this.renderProfile();
    this.closeLoginModal();
  },

  logout() {
    const ok = confirm('Deseja realmente sair do perfil atual?');
    if (!ok) return;
    Usuario.logout();
    this.renderProfile();
  },

  saveFromModal() {
    const name = this.modalName?.value ?? undefined;
    const avatar = this.modalAvatar?.value ?? undefined;
    Usuario.setProfile({ name, avatar });
    this.fillSettings();
    this.renderProfile();
    this.closeModal();
  },

  closeModal() {
    if (this.modal) this.modal.classList.remove('active');
  },

  exportProfile() {
    const json = Usuario.exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'labirinto_usuario.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },

  importFromFile(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const ok = Usuario.importJSON(reader.result);
        if (ok) {
          this.fillSettings();
          this.renderProfile();
          alert('Perfil importado com sucesso.');
        } else alert('Falha ao importar perfil.');
      } catch (err) {
        console.warn('Import error', err);
        alert('Arquivo inválido.');
      }
    };
    reader.readAsText(f);
  }
};

// Auto-initialize em DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => UsuarioUI.init());

export default UsuarioUI;
