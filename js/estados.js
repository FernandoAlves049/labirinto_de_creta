// Sistema de Estados do Jogo
// Controla todas as transições entre telas e estados do jogo

const ESTADOS = {
  MENU: 'menu',
  JOGANDO: 'jogando', 
  PAUSA: 'pausa',
  DERROTA: 'derrota',
  VITORIA: 'vitoria',
  CREDITOS: 'creditos',
  CONFIGURACOES: 'configuracoes'
};

const estadoJogo = {
  atual: ESTADOS.MENU,
  anterior: null,
  nivel: 1,
  semente: null,
  stats: {
    tempo: 0,
    passos: 0,
    fioUsado: 0,
    distanciaPercorrida: 0,
    motivoDerrota: ''
  },
  config: {
    som: true,
    dificuldade: 'normal',
    tema: 'escuro'
  },
  loopId: null,
  pausado: false
};

// Elementos DOM das telas
const telas = {
  menu: null,
  jogo: null,
  pausa: null,
  derrota: null,
  vitoria: null,
  creditos: null,
  configuracoes: null
};

// Inicializar referências DOM
function inicializarTelas() {
  telas.menu = document.getElementById('tela-menu');
  telas.jogo = document.getElementById('tela-jogo');
  telas.pausa = document.getElementById('overlay-pausa');
  telas.derrota = document.getElementById('overlay-derrota');
  telas.vitoria = document.getElementById('overlay-vitoria');
  telas.creditos = document.getElementById('tela-creditos');
  telas.configuracoes = document.getElementById('overlay-configuracoes');
}

// Transições entre telas
function mudarEstado(novoEstado, dados = {}) {
  const estadoAnterior = estadoJogo.atual;
  estadoJogo.anterior = estadoAnterior;
  estadoJogo.atual = novoEstado;
  
  // Ocultar todas as telas
  Object.values(telas).forEach(tela => {
    if (tela) {
      tela.classList.add('hidden');
      tela.classList.remove('fade-in', 'slide-in');
    }
  });
  
  // Mostrar tela atual com animação
  const telaAtual = telas[novoEstado];
  if (telaAtual) {
    telaAtual.classList.remove('hidden');
    
    // Aplicar animação baseada no tipo de transição
    if (novoEstado === ESTADOS.PAUSA || novoEstado === ESTADOS.DERROTA || novoEstado === ESTADOS.VITORIA) {
      telaAtual.classList.add('fade-in');
    } else {
      telaAtual.classList.add('slide-in');
    }
  }
  
  // Executar ações específicas do estado
  executarAcoesEstado(novoEstado, dados);
  
  console.log(`🎮 Estado: ${estadoAnterior} → ${novoEstado}`);
}

// Ações específicas para cada estado
function executarAcoesEstado(estado, dados) {
  switch (estado) {
    case ESTADOS.MENU:
      pausarLoop();
      resetarStats();
      break;
      
    case ESTADOS.JOGANDO:
      continuarLoop();
      estadoJogo.pausado = false;
      break;
      
    case ESTADOS.PAUSA:
      pausarLoop();
      estadoJogo.pausado = true;
      break;
      
    case ESTADOS.DERROTA:
      pausarLoop();
      mostrarEstatisticasDerrota(dados);
      tocarSomDerrota();
      break;
      
    case ESTADOS.VITORIA:
      pausarLoop();
      mostrarEstatisticasVitoria(dados);
      tocarSomVitoria();
      break;
      
    case ESTADOS.CREDITOS:
      pausarLoop();
      break;
  }
}

// Controle do loop do jogo
function pausarLoop() {
  if (estadoJogo.loopId) {
    cancelAnimationFrame(estadoJogo.loopId);
    estadoJogo.loopId = null;
  }
}

function continuarLoop() {
  if (!estadoJogo.loopId && window.gameLoop) {
    estadoJogo.loopId = requestAnimationFrame(window.gameLoop);
  }
}

// Utilitários
function resetarStats() {
  estadoJogo.stats = {
    tempo: 0,
    passos: 0,
    fioUsado: 0,
    distanciaPercorrida: 0,
    motivoDerrota: ''
  };
}

function mostrarEstatisticasDerrota(dados) {
  const motivoElement = document.getElementById('motivo-derrota');
  const statsElement = document.getElementById('stats-derrota');
  
  if (motivoElement) {
    const mensagens = {
      minotauro: '🐂 O Minotauro te capturou!',
      tempo: '⏰ O tempo se esgotou!',
      desistencia: '🚪 Você desistiu da aventura'
    };
    motivoElement.textContent = mensagens[dados.motivo] || 'Derrota misteriosa...';
    motivoElement.className = `motivo-${dados.motivo}`;
  }
  
  if (statsElement) {
    statsElement.innerHTML = `
      <div class="stat-linha">
        <span class="stat-label">🏛️ Nível:</span>
        <span class="stat-valor">${estadoJogo.nivel}</span>
      </div>
      <div class="stat-linha">
        <span class="stat-label">⏱️ Tempo:</span>
        <span class="stat-valor">${formatarTempo(estadoJogo.stats.tempo)}</span>
      </div>
      <div class="stat-linha">
        <span class="stat-label">👣 Passos:</span>
        <span class="stat-valor">${estadoJogo.stats.passos}</span>
      </div>
      <div class="stat-linha">
        <span class="stat-label">🧵 Fio usado:</span>
        <span class="stat-valor">${estadoJogo.stats.fioUsado} nós</span>
      </div>
      <div class="stat-linha">
        <span class="stat-label">📏 Distância:</span>
        <span class="stat-valor">${estadoJogo.stats.distanciaPercorrida.toFixed(1)}m</span>
      </div>
    `;
  }
}

function mostrarEstatisticasVitoria(dados) {
  const statsElement = document.getElementById('stats-vitoria');
  
  if (statsElement) {
    const pontuacao = calcularPontuacao();
    const classificacao = obterClassificacao(pontuacao);
    
    statsElement.innerHTML = `
      <div class="pontuacao-container">
        <div class="pontuacao-principal">${pontuacao} pontos</div>
        <div class="classificacao ${classificacao.classe}">${classificacao.texto}</div>
      </div>
      <div class="stats-grid">
        <div class="stat-linha">
          <span class="stat-label">🏛️ Nível:</span>
          <span class="stat-valor">${estadoJogo.nivel}</span>
        </div>
        <div class="stat-linha">
          <span class="stat-label">⏱️ Tempo:</span>
          <span class="stat-valor">${formatarTempo(estadoJogo.stats.tempo)}</span>
        </div>
        <div class="stat-linha">
          <span class="stat-label">👣 Eficiência:</span>
          <span class="stat-valor">${calcularEficiencia()}%</span>
        </div>
        <div class="stat-linha">
          <span class="stat-label">🧵 Fio usado:</span>
          <span class="stat-valor">${estadoJogo.stats.fioUsado} nós</span>
        </div>
      </div>
    `;
  }
}

// Sistema de pontuação
function calcularPontuacao() {
  const tempoBonus = Math.max(0, 300 - (estadoJogo.stats.tempo / 1000)) * 10;
  const eficienciaBonus = calcularEficiencia() * 5;
  const nivelBonus = estadoJogo.nivel * 100;
  
  return Math.round(tempoBonus + eficienciaBonus + nivelBonus);
}

function calcularEficiencia() {
  const caminhoOtimo = estadoJogo.nivel * 20; // Estimativa
  const passosDados = estadoJogo.stats.passos;
  return Math.max(0, Math.min(100, (caminhoOtimo / passosDados) * 100));
}

function obterClassificacao(pontuacao) {
  if (pontuacao >= 800) return { classe: 'lendario', texto: '🏆 LENDÁRIO' };
  if (pontuacao >= 600) return { classe: 'heroico', texto: '⭐ HEROICO' };
  if (pontuacao >= 400) return { classe: 'veterano', texto: '🎖️ VETERANO' };
  if (pontuacao >= 200) return { classe: 'aventureiro', texto: '🗡️ AVENTUREIRO' };
  return { classe: 'iniciante', texto: '🛡️ INICIANTE' };
}

// Utilitários de formatação
function formatarTempo(ms) {
  const segundos = Math.floor(ms / 1000);
  const minutos = Math.floor(segundos / 60);
  const seg = segundos % 60;
  return `${minutos.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`;
}

// Sistema de som (placeholders)
function tocarSomDerrota() {
  if (estadoJogo.config.som) {
    // Implementar som de derrota
    console.log('🔊 Som: Derrota');
  }
}

function tocarSomVitoria() {
  if (estadoJogo.config.som) {
    // Implementar som de vitória
    console.log('🔊 Som: Vitória');
  }
}

// Exportar para uso global
window.estadoJogo = estadoJogo;
window.mudarEstado = mudarEstado;
window.ESTADOS = ESTADOS;
