# 🏛️ Labirinto de Creta - O Desafio do Minotauro

## 📋 Sobre o Projeto

Este é um jogo baseado na mitologia grega onde você controla Teseu em sua missão de escapar do labirinto de Creta sem ser capturado pelo terrível Minotauro. Use o fio de Ariadne para não se perder!

## ✅ Correções Implementadas

### 🔧 Problemas Resolvidos

1. **Servidor HTTP**: Corrigido o problema de inicialização do servidor Python
2. **Estrutura de Arquivos**: Organizada a estrutura do projeto
3. **JavaScript**: Criada versão funcional auto-suficiente
4. **Responsividade**: Interface adaptável para diferentes tamanhos de tela
5. **Sistema de Telas**: Menu, jogo e overlays funcionando perfeitamente

### 🆕 Melhorias Adicionadas

- ✨ Interface moderna e responsiva
- 🎮 Controles intuitivos (WASD + SPACE)
- 🌟 Efeitos visuais (iluminação dinâmica)
- 📱 Suporte para dispositivos móveis
- 🏆 Sistema de níveis progressivos
- 💾 Sistema de overlays para game over e vitória

## 🎮 Como Jogar

### 🎯 Objetivo
Escape do labirinto encontrando a saída (quadrado verde) sem ser capturado pelo Minotauro.

### 🎮 Controles
- **WASD** ou **Setas**: Mover Teseu
- **SPACE** (segurar): Ativar Fio de Ariadne
- **ESC**: Voltar ao menu / Pausar

### 🧵 Fio de Ariadne
- Deixa um rastro dourado do seu caminho
- Use para não se perder no labirinto
- Ative apenas quando necessário

### 🐂 Minotauro
- **Azul**: Estado de patrulha (movimento aleatório)
- **Vermelho**: Estado de perseguição (mais rápido e agressivo)
- Se aproxime com cuidado e use as paredes para se esconder

## 🚀 Como Executar

### 📋 Pré-requisitos
- Python 3.x instalado
- Navegador web moderno

### 🔧 Instalação e Execução

1. **Iniciar o servidor**:
   ```bash
   # Windows (PowerShell)
   cd "C:\Users\Souza\Downloads\labirinto_de_creta"
   python -m http.server 8080

   # OU execute o arquivo iniciar.bat
   ./iniciar.bat
   ```

2. **Abrir no navegador**:
   - Acesse: http://localhost:8080
   - Ou clique no link que aparece no terminal

3. **Jogar**:
   - Clique em "Iniciar Jogo" no menu
   - Use os controles para mover Teseu
   - Encontre a saída verde!

## 📁 Estrutura do Projeto

```
labirinto_de_creta/
├── index.html              # Arquivo principal (CORRIGIDO)
├── iniciar.bat             # Script para iniciar o servidor
├── project.json            # Configurações do projeto
├── README.md               # Este arquivo
├── css/                    # Estilos CSS
│   ├── style.css           # Estilos principais
│   └── telas.css           # Estilos das telas
├── js/                     # Scripts JavaScript
│   ├── game.js             # Lógica principal do jogo
│   ├── main.js             # Gerenciador principal
│   └── ...                 # Outros módulos
├── assets/                 # Recursos (imagens, sons)
├── backup/                 # Backups de versões anteriores
├── docs/                   # Documentação
└── temp/                   # Arquivos temporários
```

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura e Canvas para renderização
- **CSS3**: Estilos modernos com gradientes e animações
- **JavaScript (ES6+)**: Lógica do jogo e interatividade
- **Canvas API**: Renderização 2D do jogo
- **LocalStorage**: Salvamento de configurações (futuro)

## 🎨 Características Técnicas

### 🖥️ Renderização
- Canvas HTML5 para gráficos 2D
- Iluminação dinâmica com gradientes radiais
- Animações suaves com requestAnimationFrame
- Sistema de partículas para o fio de Ariadne

### 🧠 Inteligência Artificial
- IA simples do Minotauro com dois estados
- Sistema de linha de visão
- Patrulhamento aleatório e perseguição inteligente

### 🏗️ Geração de Labirintos
- Algoritmo de geração procedimental
- Tamanho crescente baseado no nível
- Garantia de caminho válido para a saída

## 🐛 Resolução de Problemas

### ❌ Servidor não inicia
```bash
# Verificar se Python está instalado
python --version

# Se não estiver instalado, baixe de: https://python.org
```

### ❌ Jogo não carrega
- Verifique se o servidor está rodando na porta 8080
- Tente acessar http://127.0.0.1:8080
- Verifique o console do navegador (F12) para erros

### ❌ Controles não funcionam
- Clique na área do jogo para focar
- Verifique se o JavaScript está habilitado
- Recarregue a página (F5)

## 🔮 Funcionalidades Futuras

- 🔊 Sistema de áudio com efeitos sonoros
- 💾 Sistema de save/load
- 🏆 Sistema de pontuação e recordes
- 📱 Controles touch para mobile
- 🌐 Multiplayer online
- 🎨 Temas visuais alternativos
- 🧩 Editor de labirintos customizados

## 📞 Suporte

Se você encontrar algum problema:

1. Verifique se seguiu todos os passos de instalação
2. Consulte a seção "Resolução de Problemas"
3. Verifique o console do navegador para erros
4. Reinicie o servidor e recarregue a página

## 🎖️ Créditos

- **Desenvolvimento**: GitHub Copilot Team
- **Mitologia**: Baseado na lenda grega de Teseu e o Minotauro
- **Inspiração**: Jogos clássicos de labirinto e mitologia grega

## 📄 Licença

Este projeto é licenciado sob a Licença MIT - veja o arquivo LICENSE para detalhes.

---

### 🎮 Status do Projeto: ✅ FUNCIONANDO

**Última atualização**: 03/10/2025
**Versão**: 2.1.0
**Status**: Estável e jogável

🏛️ **Que a sabedoria de Atena e a coragem de Teseu te guiem pelo labirinto!** ⚔️