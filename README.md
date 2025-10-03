# 🏛️ Labirinto de Creta - O Desafio do Minotauro

## 📋 Descrição

Uma implementação moderna e imersiva da lenda grega do Labirinto de Creta, onde você controla Teseu (⚔️) em sua missão para escapar do labirinto sem s**🚀 Última Atualização:** Outubro 2025  
**📈 Próxima Release:** v2.2.0 (Sistema de áudio)

---

## 🔗 Links Úteis

- 🎮 **[Jogar Online](http://localhost:8080/index.html)** - Versão web do jogo
- 📖 **[Documentação](docs/)** - Guias e manuais técnicos
- 🐛 **[Reportar Bug](../../issues)** - Problemas e sugestões
- 💬 **[Discussões](../../discussions)** - Comunidade e feedback
- 📋 **[Roadmap](../../projects)** - Funcionalidades futuras

### 🎯 Quick Start
```bash
git clone https://github.com/FernandoAlves049/labirinto_de_creta.git
cd labirinto_de_creta
python -m http.server 8080
# Abra: http://localhost:8080/index.html
```

**🏛️ Que os deuses gregos estejam com você na sua jornada pelo labirinto! ⚔️🐂** capturado pelo temível Minotauro (🐂).

**Versão Atual: 2.1.0** - Experiência otimizada com visual moderno e jogabilidade aprimorada.

## 🎮 Características do Jogo

### ✨ Principais Features
- **🐂 Minotauro com IA Inteligente** - Patrulha o labirinto e persegue quando detecta o jogador
- **🧵 Fio de Ariadne** - Sistema de marcação de caminhos (ative com SPACE)
- **🎯 Interface Limpa** - HUD ocultável para experiência imersiva
- **� Canvas Responsivo** - Tamanho otimizado (600x450px) para melhor performance
- **🎨 Visual Moderno** - Design glassmorphism com efeitos de luz e gradientes
- **📱 Totalmente Responsivo** - Funciona perfeitamente em desktop e mobile

### 🎯 Mecânicas de Jogo
- **⚔️ Teseu (Jogador)** - Círculo azul brilhante com ícone de espada
- **� Minotauro (Inimigo)** - Círculo laranja que fica vermelho ao perseguir
- **� Estados do Minotauro**:
  - **PATROL** - Movimento aleatório (cor laranja)
  - **CHASE** - Perseguição ativa (cor vermelha)
- **🏁 Objetivo** - Alcançar a saída (quadrado verde) sem ser capturado

## 🗂️ Estrutura do Projeto

```
labirinto_de_creta/
├── 📄 index.html              # Arquivo principal do jogo (USAR ESTE!)
├── � css/                    # Folhas de estilo CSS
│   └── 🎨 game-styles.css    # Estilos modernos organizados
├── 📁 js/                     # Scripts JavaScript (legado/backup)
│   ├── 🎮 main.js            # Motor principal (backup)
│   ├── 🤖 MinotaurAI.js      # IA do Minotauro (backup)
│   ├── 🏗️ mazeGenerator.js   # Gerador de labirintos (backup)
│   └── 🎨 renderer.js        # Renderização (backup)
├── � assets/                 # Recursos gráficos
│   └── 📁 sprites/           # Sprites dos personagens
│       ├── 🖼️ teseu.png     # Sprite do herói
│       └── 🖼️ minotauro.png # Sprite do minotauro
├── 📁 backup/                 # Versões anteriores
├── 📁 docs/                   # Documentação
└── � README.md              # Este arquivo

## 🎯 Arquitetura Atual
- **Arquivo Único**: Todo o jogo está no `index.html` para simplicidade
- **CSS Separado**: Estilos organizados em arquivo externo
- **JavaScript Inline**: Lógica do jogo integrada para facilitar desenvolvimento
- **Recursos Externos**: Sprites opcionais (fallback para ícones)
```

## 🚀 Como Executar

### 🌐 Servidor Web (Recomendado)
```bash
# Navegue até o diretório do projeto
cd labirinto_de_creta

# Inicie um servidor HTTP local (Python 3)
python -m http.server 8080

# Abra no navegador
http://localhost:8080/index.html
```

### 📁 Arquivo Local
- Abra `index.html` diretamente no navegador
- ✅ Funciona perfeitamente sem servidor

## 🕹️ Controles

| Tecla | Ação |
|-------|------|
| `W` `A` `S` `D` | Mover Teseu pelo labirinto |
| `↑` `↓` `←` `→` | Movimento alternativo |
| `SPACE` | Ativar/Desativar Fio de Ariadne |
| `ESC` | Pausar jogo (futuro) |

## 🐂 Como o Minotauro Funciona

### 🎯 Estados de Comportamento
- **� PATROL** (Patrulha) - Movimento aleatório, cor laranja
- **� CHASE** (Perseguição) - Detectou jogador, cor vermelha

### 🧠 Mecânica de IA
- **Detecção por Proximidade** - Minotauro detecta quando jogador está próximo (< 4 células)
- **Movimento Inteligente** - Evita paredes e calcula direção para o jogador  
- **Mudança Visual** - Fica vermelho e mais brilhante quando persegue
- **Posicionamento Estratégico** - Inicia no canto oposto do jogador

## � Características Técnicas

### � Especificações
- **Canvas HTML5** - Renderização suave 60fps
- **Tamanho Otimizado** - 600x450px para melhor performance
- **Algoritmo de Labirinto** - Geração procedural com caminhos garantidos
- **Collision Detection** - Sistema preciso de colisões
- **Responsive Design** - Adapta-se a diferentes tamanhos de tela

## 🛠️ Tecnologias Utilizadas

### 💻 Frontend
- **HTML5** - Estrutura e Canvas API
- **CSS3** - Design moderno com glassmorphism e gradientes
- **JavaScript ES6+** - Lógica do jogo, IA e controles
- **Canvas 2D API** - Renderização gráfica em tempo real

### 🎨 Design
- **Glassmorphism** - Efeitos de vidro fosco
- **Gradientes Radiantes** - Iluminação dinâmica
- **Animações CSS** - Transições suaves
- **Responsive Design** - Compatível com mobile

### 🏗️ Arquitetura do Código
- **Single Page Application** - Todo em um arquivo para simplicidade
- **Event-Driven Programming** - Sistema de eventos para controles
- **Object-Oriented Design** - Classes para jogador, minotauro e labirinto
- **Procedural Generation** - Algoritmo de geração de labirintos

## 🐛 Solução de Problemas

### ❌ Problemas Comuns

**🖼️ Jogo não carrega:**
- Abra o Console do navegador (F12) para ver erros
- Certifique-se de que JavaScript está habilitado

**🐂 Minotauro não aparece:**
- Verifique o Console para mensagens de debug
- O Minotauro aparece no canto inferior direito do labirinto
- Procure por um círculo laranja com ícone 🐂

**🕹️ Controles não funcionam:**
- Clique no canvas do jogo para dar foco
- Use WASD ou setas direcionais
- Pressione SPACE para ativar o Fio de Ariadne

**📱 Problemas no mobile:**
- O jogo é otimizado para desktop
- Use um navegador moderno (Chrome, Firefox, Safari)
- Rotacione para modo paisagem se necessário

## 🚀 Funcionalidades Futuras

### 🎯 Próximas Atualizações
- [ ] **🔊 Sistema de Áudio** - Efeitos sonoros e música ambiente
- [ ] **🏆 Sistema de Conquistas** - Medalhas e objetivos
- [ ] **💾 Save/Load** - Salvar progresso localmente
- [ ] **🎚️ Níveis de Dificuldade** - Múltiplos níveis de desafio
- [ ] **🌐 Multiplayer** - Modo cooperativo online
- [ ] **📊 Estatísticas Avançadas** - Análise detalhada de performance

### 🔮 Visão de Longo Prazo
- **🎮 Versão Mobile Nativa** - App para Android/iOS
- **🎯 Editor de Labirintos** - Criação personalizada
- **🏛️ Mais Mitologias** - Outros labirintos clássicos
- **🎨 Modos Visuais** - Temas alternativos
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
## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. � **Fork** este repositório
2. 🌿 **Crie uma branch** (`git checkout -b feature/nova-feature`)
3. 💻 **Faça suas alterações** e teste thoroughly
4. � **Commit** (`git commit -am 'Add: nova feature'`)
5. 🚀 **Push** (`git push origin feature/nova-feature`)
6. 🔄 **Abra um Pull Request**

### 💡 Ideias para Contribuir
- 🐛 Reportar bugs ou problemas
- � Melhorar o visual ou UX
- 🔧 Otimizar performance
- � Melhorar documentação
- 🎮 Adicionar novas funcionalidades

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Créditos

- **� Conceito Original**: Mitologia Grega - Teseu e o Minotauro
- **💻 Desenvolvimento**: GitHub Copilot Assistant
- **🎨 Design Visual**: Sistema moderno com glassmorphism
- **🔧 Tecnologia**: HTML5 Canvas + JavaScript ES6+
- **🏛️ Inspiração**: Lendas clássicas da Grécia Antiga

---

## 📊 Status do Projeto

| Aspecto | Status | Versão |
|---------|--------|--------|
| 🎮 **Core Game** | ✅ Completo | v2.1.0 |
| 🐂 **IA Minotauro** | ✅ Funcional | v2.1.0 |
| 🎨 **Interface** | ✅ Moderna | v2.1.0 |
| 📱 **Mobile** | ✅ Responsivo | v2.1.0 |
| 🔊 **Áudio** | ⏳ Planejado | v3.0.0 |
| 🏆 **Conquistas** | ⏳ Futuro | v3.0.0 |

**🚀 Última Atualização:** Outubro 2025  
**� Próxima Release:** v2.2.0 (Sistema de áudio)

---

**🏛️ "Entre na lenda. Escape do labirinto. Derrote o Minotauro." 🏛️**