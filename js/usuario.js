// js/usuario.js
// Gerenciamento simples de dados do jogador com persistência em localStorage.
// API exportada: Usuario (classe singleton-friendly)
// Uso básico:
// import Usuario from './usuario.js'
// Usuario.init();
// Usuario.setProfile({ name: 'Teseu', avatar: '⚔️' });

const STORAGE_KEY = 'labirinto_de_creta_user_v1';

class Usuario {
	constructor() {
		this._data = this._defaultData();
		this._available = this._checkLocalStorage();
		if (this._available) this.load();
	}

	_defaultData() {
		return {
			id: null,
			name: 'Jogador',
			avatar: '⚔️',
			createdAt: Date.now(),
			updatedAt: Date.now(),
			settings: {
				music: true,
				sfx: true,
				volume: 50,
				difficulty: 'normal',
			},
			stats: {
				gamesPlayed: 0,
				wins: 0,
				bestTimeMs: null,
			},
			history: [], // array de objetos { when, level, timeMs, result }
			unlockedLevels: [1] // níveis desbloqueados (começa com 1)
		};
	}

	_checkLocalStorage() {
		try {
			const key = '__ls_test__';
			localStorage.setItem(key, '1');
			localStorage.removeItem(key);
			return true;
		} catch (e) {
			return false;
		}
	}

	init() {
		if (this._available) this.load();
		return this;
	}

	load() {
		if (!this._available) return this;
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (!raw) return this;
			const parsed = JSON.parse(raw);
			// shallow merge to keep any new default fields
			this._data = Object.assign(this._defaultData(), parsed);
		} catch (e) {
			console.warn('Usuario.load: erro ao ler localStorage', e);
		}
		return this;
	}

	save() {
		this._data.updatedAt = Date.now();
		if (this._available) {
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(this._data));
			} catch (e) {
				console.warn('Usuario.save: falha ao gravar localStorage', e);
			}
		}
		return this;
	}

	clear() {
		this._data = this._defaultData();
		if (this._available) localStorage.removeItem(STORAGE_KEY);
		return this;
	}

	get() { return this._data; }

	setProfile({ id = null, name = null, avatar = null } = {}) {
		if (id !== null) this._data.id = id;
		if (name !== null) this._data.name = name;
		if (avatar !== null) this._data.avatar = avatar;
		this.save();
		return this;
	}

	updateSettings(updater) {
		if (typeof updater === 'function') {
			this._data.settings = Object.assign({}, this._data.settings, updater(this._data.settings));
		} else if (typeof updater === 'object') {
			this._data.settings = Object.assign({}, this._data.settings, updater);
		}
		this.save();
		return this;
	}

	// Registra um resultado de jogo
	// result: 'win' | 'loss' | other
	addResult({ level = 1, timeMs = 0, result = 'loss' } = {}) {
		const when = Date.now();
		this._data.history.push({ when, level, timeMs, result });
		this._data.stats.gamesPlayed += 1;
		if (result === 'win') {
			this._data.stats.wins += 1;
			if (this._data.stats.bestTimeMs === null || timeMs < this._data.stats.bestTimeMs) {
				this._data.stats.bestTimeMs = timeMs;
			}
				// desbloquear próximo nível automaticamente
				try {
					const next = Number(level) + 1;
					if (!this._data.unlockedLevels.includes(next)) this._data.unlockedLevels.push(next);
				} catch (e) {}
		}
		this.save();
		return this;
	}

		// Níveis: verificar e desbloquear
		isLevelUnlocked(level) {
			return this._data.unlockedLevels && this._data.unlockedLevels.includes(Number(level));
		}

		unlockLevel(level) {
			const n = Number(level);
			if (!this._data.unlockedLevels) this._data.unlockedLevels = [];
			if (!this._data.unlockedLevels.includes(n)) {
				this._data.unlockedLevels.push(n);
				this.save();
			}
			return this;
		}

	// Exporta os dados do usuário como JSON (string)
	exportJSON() {
		return JSON.stringify(this._data, null, 2);
	}

	// Importa dados (sobrescreve salvo)
	importJSON(json) {
		try {
			const parsed = typeof json === 'string' ? JSON.parse(json) : json;
			this._data = Object.assign(this._defaultData(), parsed);
			this.save();
			return true;
		} catch (e) {
			console.warn('Usuario.importJSON: JSON inválido', e);
			return false;
		}
	}

	// Deleta histórico (opcional)
	clearHistory() {
		this._data.history = [];
		this.save();
		return this;
	}

}

const usuarioInstance = new Usuario();
export default usuarioInstance;
