import Usuario from './usuario.js';

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
      inputImportFile: document.getElementById('input-import-file')
    };
  },

  bind() {
    this.el.btnEditProfile?.addEventListener('click', () => this.openEditModal());
    this.el.settingsUsername?.addEventListener('input', (e) => this.onSettingsChange());
    this.el.settingsAvatar?.addEventListener('input', (e) => this.onSettingsChange());
    this.el.btnExport?.addEventListener('click', () => this.exportProfile());
    this.el.btnImport?.addEventListener('click', () => this.el.inputImportFile?.click());
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
  },

  renderProfile() {
    const data = Usuario.get();
    if (this.el.userAvatar) this.el.userAvatar.textContent = data.avatar || '⚔️';
    if (this.el.userName) this.el.userName.textContent = data.name || 'Jogador';
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
