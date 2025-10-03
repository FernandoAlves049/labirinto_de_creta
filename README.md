# 🏛️ Labirinto de Creta - O Desafio do Minotauro

## 📋 Descrição

Uma implementação moderna e imersiva da lenda grega do Labirinto de Creta, onde você controla Teseu em sua missão para escapar do labirinto sem ser capturado pelo Minotauro implacável.

## 🎮 Características

### ✨ Principais Features
- **🐂 IA Avançada do Minotauro** - Comportamento implacável com perseguição inteligente
- **🧵 Sistema de Fio de Ariadne** - Marcação de caminhos para navegação
- **🎯 Sistema de Estados Completo** - Transições suaves entre telas
- **📊 Estatísticas Detalhadas** - Tempo, eficiência, pontuação
- **⚙️ Configurações Avançadas** - Dificuldade, áudio, visual
- **📱 Interface Responsiva** - Design moderno e acessível

### 🎯 Modos de Jogo
- **😊 Fácil** - Minotauro mais lento, ideal para iniciantes
- **😐 Normal** - Experiência balanceada
- **😰 Difícil** - Minotauro mais rápido e agressivo  
- **💀 Pesadelo** - Desafio extremo para veteranos

## 🗂️ Estrutura do Projeto

```
labirinto_de_creta/
├── 📄 index.html              # Arquivo principal
├── 📄 index_completo.html     # Versão completa alternativa
├── 📁 js/                     # Scripts JavaScript
│   ├── 🎮 game.js            # Motor principal do jogo
│   ├── 🤖 MinotaurAI.js      # IA do Minotauro
│   ├── 🏗️ mazeGenerator.js   # Gerador de labirintos
│   ├── 🎨 renderer.js        # Renderização gráfica
│   ├── 🔄 estados.js         # Gerenciamento de estados
│   └── 🎛️ controles.js      # Sistema de controles
├── 📁 css/                    # Folhas de estilo
│   ├── 🎨 style.css          # Estilos principais
│   └── 🖼️ telas.css         # Estilos das interfaces
├── 📁 assets/                 # Recursos gráficos
│   ├── 📁 img/               # Imagens
│   └── 📁 sprites/           # Sprites do jogo
├── 📁 docs/                   # Documentação
│   ├── 📖 README.md          # Este arquivo
│   └── 📄 *.pdf             # Documentos do projeto
├── 📁 backup/                 # Backups e versões antigas
└── 📁 temp/                   # Arquivos temporários
```

## 🚀 Como Executar

### 🌐 Servidor Web (Recomendado)
```bash
# Navegue até o diretório do projeto
cd labirinto_de_creta

# Inicie um servidor HTTP local
python -m http.server 8000

# Abra no navegador
http://localhost:8000
```

### 📁 Arquivo Local
- Abra `index.html` diretamente no navegador
- ⚠️ Algumas funcionalidades podem ter limitações

## 🕹️ Controles

| Tecla | Função |
|-------|--------|
| `WASD` ou `↑↓←→` | Mover Teseu |
| `ESPAÇO` | Ativar/Desativar Fio de Ariadne |
| `ESC` | Pausar/Despausar jogo |

## 🧠 Sistema de IA

### 🐂 Estados do Minotauro
- **🟢 PATRULHANDO** - Movimento lento, procurando pelo jogador
- **🟡 INVESTIGANDO** - Ouviu ruído, movimento mais rápido
- **🔴 PERSEGUINDO** - Viu o jogador, perseguição implacável!

### ⚡ Características da IA
- **Visão Limitada** mas persistente
- **Pathfinding A*** para navegação inteligente
- **Sistema de Memória** lembra da última posição vista
- **Comportamento Emergente** baseado em estímulos

## 🎯 Sistema de Pontuação

### 📊 Métricas Calculadas
- **⏱️ Tempo** - Rapidez na conclusão
- **📏 Eficiência** - Otimalidade do caminho
- **🧵 Uso do Fio** - Estratégia de navegação
- **🎚️ Dificuldade** - Multiplicador de pontos

### 🏆 Ranking
- **S** - Desempenho excepcional (90-100%)
- **A** - Muito bom (80-89%)
- **B** - Bom (70-79%)
- **C** - Regular (60-69%)
- **D** - Precisa melhorar (<60%)

## 🔧 Configurações Técnicas

### 🎮 Jogabilidade
- **Dificuldade** - 4 níveis disponíveis
- **Semente** - Mapas determinísticos ou aleatórios
- **Controles** - Personalizáveis

### 🔊 Áudio
- **Volume Geral** - Controle deslizante
- **Efeitos Sonoros** - Sons de passos, Minotauro
- **Música** - Trilha ambiente (planejado)

### 🎨 Visual
- **Qualidade Gráfica** - Baixa/Média/Alta
- **Animações** - Suaves ou simplificadas
- **Efeitos** - Sombras, partículas

## 🛠️ Desenvolvimento

### 🏗️ Arquitetura
- **Modular** - Componentes independentes
- **Escalável** - Fácil adição de features
- **Performático** - Otimizado para web

### 🧪 Tecnologias
- **JavaScript ES6+** - Lógica principal
- **HTML5 Canvas** - Renderização gráfica
- **CSS3** - Interface e animações
- **Web APIs** - Audio, Storage, etc.

### 📈 Performance
- **60 FPS** - Renderização suave
- **Baixa Latência** - Controles responsivos
- **Memória Otimizada** - Garbage collection eficiente

## 🐛 Solução de Problemas

### ❌ Problemas Comuns

**🖼️ Jogo não carrega:**
- Verifique se todos os arquivos estão na estrutura correta
- Use um servidor HTTP local
- Verifique o console do navegador para erros

**🎮 Controles não funcionam:**
- Certifique-se que o jogo está em foco
- Recarregue a página
- Verifique as configurações de controles

**🐌 Performance baixa:**
- Reduza a qualidade gráfica nas configurações
- Feche outras abas do navegador
- Desative animações se necessário

## 📋 TODO / Roadmap

### 🎯 Próximas Features
- [ ] 🔊 Sistema de áudio completo
- [ ] 🗺️ Minimap opcional
- [ ] 💾 Sistema de save/load
- [ ] 🏆 Tabela de recordes online
- [ ] 🎨 Temas visuais alternativos
- [ ] 📱 Controles touch para mobile
- [ ] 🌐 Multiplayer cooperativo

### 🔧 Melhorias Técnicas
- [ ] ⚡ Web Workers para IA
- [ ] 🎮 Suporte a gamepad
- [ ] 📊 Analytics detalhados
- [ ] 🔄 Auto-save progresso
- [ ] 🎨 Shaders customizados

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:

1. 🍴 Fork o projeto
2. 🌟 Crie uma branch para sua feature
3. 💻 Implemente suas mudanças
4. ✅ Teste thoroughly
5. 📤 Faça um Pull Request

## 📄 Licença

Este projeto é open source e está disponível sob a licença MIT.

## 👥 Créditos

- **🎮 Desenvolvimento**: GitHub Copilot & Assistant
- **🎨 Design**: Interface moderna responsiva
- **🏛️ Inspiração**: Mitologia grega clássica
- **🔧 Tecnologia**: JavaScript vanilla + Canvas API

---

## 🏆 Estatísticas do Projeto

- **📁 Arquivos**: ~15 arquivos organizados
- **💾 Tamanho**: ~500KB total
- **⚡ Performance**: 60fps target
- **🌐 Compatibilidade**: Navegadores modernos
- **📱 Responsivo**: Desktop/Tablet/Mobile

---

**🏛️ "Entre na lenda. Escape do labirinto. Derrote o Minotauro." 🏛️**