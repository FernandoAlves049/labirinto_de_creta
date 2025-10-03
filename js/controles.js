// Sistema de Controles das Telas
// Gerencia todas as interações e transições entre telas

// Inicializar sistema
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎮 Inicializando sistema de controles...');
  inicializarTelas();
  configurarEventListeners();
  aplicarConfiguracoes();
  mostrarTelaInicial();
});

// Configurar todos os event listeners
function configurarEventListeners() {
  
  // ===== MENU PRINCIPAL =====
  getElementById('btn-jogar')?.addEventListener('click', () => {
    console.log('🎮 Iniciando novo jogo...');
    estadoJogo.nivel = 1;
    estadoJogo.semente = Date.now();
    mudarEstado(ESTADOS.JOGANDO);
    iniciarNovoJogo();
  });
  
  getElementById('btn-continuar')?.addEventListener('click', () => {
    console.log('🎮 Continuando jogo...');
    mudarEstado(ESTADOS.JOGANDO);
    continuarJogoAtual();
  });
  
  getElementById('btn-creditos')?.addEventListener('click', () => {
    mudarEstado(ESTADOS.CREDITOS);
  });
  
  getElementById('btn-configuracoes')?.addEventListener('click', () => {
    mudarEstado(ESTADOS.CONFIGURACOES);
    carregarConfiguracoes();
  });

  // ===== JOGO =====
  getElementById('btn-pausar')?.addEventListener('click', () => {
    pausarJogo();
  });

  // ===== PAUSA =====
  getElementById('btn-continuar-pausa')?.addEventListener('click', () => {
    mudarEstado(ESTADOS.JOGANDO);
  });
  
  getElementById('btn-reiniciar-pausa')?.addEventListener('click', () => {
    reiniciarNivelAtual();
  });
  
  getElementById('btn-configuracoes-pausa')?.addEventListener('click', () => {
    mudarEstado(ESTADOS.CONFIGURACOES);
  });
  
  getElementById('btn-menu-pausa')?.addEventListener('click', () => {
    mudarEstado(ESTADOS.MENU);
  });

  // ===== DERROTA =====
  getElementById('btn-reiniciar-derrota')?.addEventListener('click', () => {
    console.log('🔄 Reiniciando nível após derrota...');
    reiniciarNivelAtual();
  });
  
  getElementById('btn-dica-derrota')?.addEventListener('click', () => {
    mostrarDicaCaminho();
  });
  
  getElementById('btn-menu-derrota')?.addEventListener('click', () => {
    mudarEstado(ESTADOS.MENU);
  });

  // ===== VITÓRIA =====
  getElementById('btn-proximo-nivel')?.addEventListener('click', () => {
    console.log('⬆️ Avançando para próximo nível...');
    avancarProximoNivel();
  });
  
  getElementById('btn-reiniciar-vitoria')?.addEventListener('click', () => {
    reiniciarNivelAtual();
  });
  
  getElementById('btn-menu-vitoria')?.addEventListener('click', () => {
    mudarEstado(ESTADOS.MENU);
  });

  // ===== CRÉDITOS =====
  getElementById('btn-voltar-creditos')?.addEventListener('click', () => {
    mudarEstado(ESTADOS.MENU);
  });

  // ===== CONFIGURAÇÕES =====
  getElementById('btn-salvar-config')?.addEventListener('click', () => {
    salvarConfiguracoes();
    mudarEstado(estadoJogo.anterior || ESTADOS.MENU);
  });
  
  getElementById('btn-resetar-config')?.addEventListener('click', () => {
    resetarConfiguracoes();
  });
  
  getElementById('btn-cancelar-config')?.addEventListener('click', () => {
    mudarEstado(estadoJogo.anterior || ESTADOS.MENU);
  });

  // ===== CONTROLES GLOBAIS =====
  
  // ESC para pausar/menu
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      handleEscapeKey();
    }
  });
  
  // Configurações dinâmicas
  getElementById('config-velocidade')?.addEventListener('input', (e) => {
    const valor = parseFloat(e.target.value);
    getElementById('velocidade-valor').textContent = `${valor.toFixed(1)}x`;
  });
  
  // Impedir fechamento acidental
  window.addEventListener('beforeunload', (e) => {
    if (estadoJogo.atual === ESTADOS.JOGANDO) {
      e.preventDefault();
      e.returnValue = 'Tem certeza que deseja sair do jogo?';
    }
  });
}

// ===== FUNÇÕES DE CONTROLE =====

function handleEscapeKey() {
  switch (estadoJogo.atual) {
    case ESTADOS.JOGANDO:
      pausarJogo();
      break;
    case ESTADOS.PAUSA:
      mudarEstado(ESTADOS.JOGANDO);
      break;
    case ESTADOS.CONFIGURACOES:
      mudarEstado(estadoJogo.anterior || ESTADOS.MENU);
      break;
    case ESTADOS.DERROTA:
    case ESTADOS.VITORIA:
      // Não permitir ESC durante telas de resultado
      break;
    default:
      // Outras telas voltam ao menu
      mudarEstado(ESTADOS.MENU);
  }
}

function pausarJogo() {
  console.log('⏸️ Pausando jogo...');
  atualizarStatsPausa();
  mudarEstado(ESTADOS.PAUSA);
}

function atualizarStatsPausa() {
  const nivelEl = getElementById('pause-nivel');
  const tempoEl = getElementById('pause-tempo');
  
  if (nivelEl) nivelEl.textContent = `Nível ${estadoJogo.nivel}`;
  if (tempoEl) tempoEl.textContent = formatarTempo(estadoJogo.stats.tempo);
}

// ===== FUNÇÕES DO JOGO =====

function iniciarNovoJogo() {
  resetarEstatisticas();
  if (window.startGame) {
    window.startGame();
  } else {
    console.warn('⚠️ Função startGame() não encontrada');
  }
  mostrarBotaoContinuar();
}

function continuarJogoAtual() {
  if (window.game && window.game.state === 'paused') {
    window.game.state = 'playing';
  }
}

function reiniciarNivelAtual() {
  console.log(`🔄 Reiniciando nível ${estadoJogo.nivel}...`);
  
  // Manter a mesma semente para reprodutibilidade
  if (window.startLevel) {
    window.startLevel(estadoJogo.nivel, estadoJogo.semente);
  }
  
  mudarEstado(ESTADOS.JOGANDO);
}

function avancarProximoNivel() {
  estadoJogo.nivel++;
  estadoJogo.semente = Date.now(); // Nova semente para novo nível
  
  console.log(`⬆️ Avançando para nível ${estadoJogo.nivel}...`);
  
  if (window.startLevel) {
    window.startLevel(estadoJogo.nivel, estadoJogo.semente);
  }
  
  mudarEstado(ESTADOS.JOGANDO);
}

function mostrarDicaCaminho() {
  console.log('💡 Mostrando dica de caminho...');
  
  // Implementar visualização de caminho ótimo
  if (window.mostrarCaminhoOtimo) {
    window.mostrarCaminhoOtimo();
  }
  
  // Esconder botão após uso
  getElementById('btn-dica-derrota')?.classList.add('hidden');
  
  // Reiniciar após mostrar dica
  setTimeout(() => {
    reiniciarNivelAtual();
  }, 3000);
}

// ===== CONFIGURAÇÕES =====

function carregarConfiguracoes() {
  const config = estadoJogo.config;
  
  // Carregar valores salvos
  getElementById('config-som').checked = config.som;
  getElementById('config-dificuldade').value = config.dificuldade;
  getElementById('config-tema').value = config.tema;
  getElementById('config-animacoes').checked = config.animacoes !== false;
  
  // Carregar do localStorage se existir
  const configSalva = localStorage.getItem('labirinto-config');
  if (configSalva) {
    const configObj = JSON.parse(configSalva);
    Object.assign(estadoJogo.config, configObj);
    
    // Aplicar aos elementos
    getElementById('config-som').checked = configObj.som ?? true;
    getElementById('config-dificuldade').value = configObj.dificuldade ?? 'normal';
    getElementById('config-tema').value = configObj.tema ?? 'escuro';
    getElementById('config-animacoes').checked = configObj.animacoes !== false;
    getElementById('config-velocidade').value = configObj.velocidade ?? 1.0;
    getElementById('velocidade-valor').textContent = `${(configObj.velocidade ?? 1.0).toFixed(1)}x`;
  }
}

function salvarConfiguracoes() {
  const novaConfig = {
    som: getElementById('config-som')?.checked ?? true,
    dificuldade: getElementById('config-dificuldade')?.value ?? 'normal',
    tema: getElementById('config-tema')?.value ?? 'escuro',
    animacoes: getElementById('config-animacoes')?.checked ?? true,
    velocidade: parseFloat(getElementById('config-velocidade')?.value ?? 1.0)
  };
  
  // Salvar no estado do jogo
  Object.assign(estadoJogo.config, novaConfig);
  
  // Salvar no localStorage
  localStorage.setItem('labirinto-config', JSON.stringify(novaConfig));
  
  // Aplicar configurações imediatamente
  aplicarConfiguracoes();
  
  console.log('💾 Configurações salvas:', novaConfig);
}

function resetarConfiguracoes() {
  const configPadrao = {
    som: true,
    dificuldade: 'normal',
    tema: 'escuro',
    animacoes: true,
    velocidade: 1.0
  };
  
  // Aplicar aos elementos
  getElementById('config-som').checked = configPadrao.som;
  getElementById('config-dificuldade').value = configPadrao.dificuldade;
  getElementById('config-tema').value = configPadrao.tema;
  getElementById('config-animacoes').checked = configPadrao.animacoes;
  getElementById('config-velocidade').value = configPadrao.velocidade;
  getElementById('velocidade-valor').textContent = `${configPadrao.velocidade.toFixed(1)}x`;
}

function aplicarConfiguracoes() {
  const config = estadoJogo.config;
  
  // Aplicar tema
  document.body.className = `tema-${config.tema}`;
  
  // Aplicar velocidade do jogo
  if (window.game) {
    window.game.speedMultiplier = config.velocidade;
  }
  
  // Aplicar configurações de som
  if (window.audioManager) {
    window.audioManager.enabled = config.som;
  }
  
  console.log('⚙️ Configurações aplicadas:', config);
}

// ===== FUNÇÕES UTILITÁRIAS =====

function resetarEstatisticas() {
  estadoJogo.stats = {
    tempo: 0,
    passos: 0,
    fioUsado: 0,
    distanciaPercorrida: 0,
    motivoDerrota: ''
  };
}

function mostrarBotaoContinuar() {
  getElementById('btn-continuar')?.classList.remove('hidden');
}

function mostrarTelaInicial() {
  // Verificar se há jogo salvo
  const jogoSalvo = localStorage.getItem('labirinto-save');
  if (jogoSalvo) {
    mostrarBotaoContinuar();
  }
  
  mudarEstado(ESTADOS.MENU);
}

function getElementById(id) {
  return document.getElementById(id);
}

// ===== FUNÇÕES EXPOSTAS GLOBALMENTE =====

// Para integração com o game.js existente
window.mostrarDerrota = (dados) => {
  console.log('💀 Mostrando tela de derrota:', dados);
  estadoJogo.stats.motivoDerrota = dados.motivo;
  mudarEstado(ESTADOS.DERROTA, dados);
};

window.mostrarVitoria = (dados) => {
  console.log('🏆 Mostrando tela de vitória:', dados);
  mudarEstado(ESTADOS.VITORIA, dados);
};

window.atualizarHUD = (dados) => {
  // Atualizar HUD durante o jogo
  if (dados.nivel) getElementById('level').textContent = dados.nivel;
  if (dados.tempo) getElementById('time').textContent = formatarTempo(dados.tempo);
  if (dados.fio !== undefined) getElementById('fio').textContent = dados.fio ? 'ON' : 'OFF';
  
  // Atualizar estatísticas internas
  if (dados.tempo) estadoJogo.stats.tempo = dados.tempo;
  if (dados.passos) estadoJogo.stats.passos = dados.passos;
  if (dados.fioUsado) estadoJogo.stats.fioUsado = dados.fioUsado;
  if (dados.distanciaPercorrida) estadoJogo.stats.distanciaPercorrida = dados.distanciaPercorrida;
};

// Exportar funções necessárias
window.estadoControles = {
  pausarJogo,
  reiniciarNivelAtual,
  avancarProximoNivel,
  mostrarTelaInicial
};

console.log('🎮 Sistema de controles inicializado!');
