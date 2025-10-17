// /c:/Users/Souza/Downloads/labirinto_de_creta/js/temporizador.js
// Temporizador simples para jogo: start, pause, resume, reset, formatar, ligar a elemento DOM.
// Uso: import Temporizador from './temporizador.js'
// const t = new Temporizador({ selector: '#tempo', onTick: (ms)=>{}, precision: 50 });

export default class Temporizador {
    constructor({ selector = null, onTick = null, precision = 100 } = {}) {
        this.selector = selector;
        this.onTick = typeof onTick === 'function' ? onTick : null;
        this.precision = Math.max(16, precision); // mínimo ~1 frame
        this._startAt = 0;     // timestamp quando iniciado
        this._elapsed = 0;     // ms acumulados quando pausado
        this._running = false;
        this._raf = null;
    }

    // Internal loop usando requestAnimationFrame para precisão
    _loop = (ts) => {
        if (!this._running) return;
        if (!this._startAt) this._startAt = ts - this._elapsed;
        this._elapsed = ts - this._startAt;
        this._tick();
        this._raf = requestAnimationFrame(this._loop);
    };

    _tick() {
        if (this.onTick) this.onTick(this._elapsed);
        if (this.selector) {
            const el = typeof this.selector === 'string'
                ? document.querySelector(this.selector)
                : this.selector;
            if (el) el.textContent = Temporizador.format(this._elapsed);
        }
    }

    // Inicia ou reinicia (mantém elapsed = 0)
    start() {
        this.reset();
        this._running = true;
        this._raf = requestAnimationFrame(this._loop);
    }

    // Pausa mantendo o tempo já acumulado
    pause() {
        if (!this._running) return;
        this._running = false;
        if (this._raf) cancelAnimationFrame(this._raf);
        this._raf = null;
    }

    // Retoma do ponto pausado
    resume() {
        if (this._running) return;
        this._running = true;
        this._raf = requestAnimationFrame(this._loop);
    }

    // Reseta o temporizador para zero e atualiza display
    reset() {
        this.pause();
        this._startAt = 0;
        this._elapsed = 0;
        this._tick();
    }

    // Retorna o tempo atual em ms
    getTime() {
        return Math.floor(this._elapsed);
    }

    // Define/atualiza callback de tick
    setOnTick(fn) {
        this.onTick = typeof fn === 'function' ? fn : null;
    }

    // Liga o temporizador a um elemento DOM (selector string ou element)
    setDisplay(selector) {
        this.selector = selector;
        this._tick();
    }

    // Formata ms para "MM:SS.mmm" (milissegundos ajustáveis)
    static format(ms) {
        const total = Math.max(0, Math.floor(ms));
        const minutes = Math.floor(total / 60000);
        const seconds = Math.floor((total % 60000) / 1000);
        const milliseconds = total % 1000;
        const mm = String(minutes).padStart(2, '0');
        const ss = String(seconds).padStart(2, '0');
        const ms3 = String(milliseconds).padStart(3, '0');
        return `${mm}:${ss}.${ms3}`;
    }
}