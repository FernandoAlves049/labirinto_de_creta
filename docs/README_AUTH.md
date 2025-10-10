# 🔐 Autenticação — Login com Google (Proposta)

Este documento descreve o plano técnico para adicionar uma tela de login com Google usando Firebase Authentication.

## Objetivos
- Permitir que o jogador se autentique com a conta Google
- Preparar terreno para recursos futuros (ranking, progresso salvo, conquistas)

## Stack sugerida
- Firebase Authentication (Google)
- (Opcional) Firebase Hosting para deploy simples

## Fluxo de UI
1. Botão “Entrar com Google” na tela de menu (ou modal dedicado)
2. Popup/redirect de login do Google
3. Ao sucesso: exibir avatar/nome no HUD (ou no menu) e habilitar recursos autenticados
4. Ao sair: “Sair” no mesmo local

## Passos de configuração
1. Criar projeto no Firebase Console
2. Habilitar “Authentication” → Provedor Google
3. Adicionar aplicativo Web e copiar as credenciais (apiKey, authDomain, etc.)
4. Criar `firebase-config.js` (não commitar chaves privadas sensíveis) com:
```js
export const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  appId: "...",
};
```
5. Load no `index.html` (de forma segura) e inicializar no `main.js`:
```html
<script src="https://www.gstatic.com/firebasejs/10.14.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.14.0/firebase-auth-compat.js"></script>
<script type="module" src="firebase-config.js"></script>
```
```js
// main.js (trecho)
import { firebaseConfig } from './firebase-config.js';
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();
```

## API de autenticação (padrão)
```js
async function signInWithGoogle() {
  try {
    const result = await auth.signInWithPopup(provider);
    const user = result.user; // displayName, photoURL, uid
    // Atualizar UI (HUD/menu)
  } catch (err) {
    console.error('Erro no login Google:', err);
  }
}

async function signOut() {
  await auth.signOut();
  // limpar estado de usuário na UI
}
```

## Segurança
- Restringir origens autorizadas no Firebase Auth
- Não commitar secrets; usar variáveis de ambiente ao publicar
- Tratar erros e timeouts de popup/redirect

## Critérios de aceite
- Botão “Entrar com Google” visível no menu
- Login e logout funcionam (popup)
- Avatar/nome exibidos quando logado
- Estado persiste na sessão

## Próximos passos (opcionais)
- Salvar progresso/estatísticas por usuário
- Ranking global via Firestore/RTDB
- Gate de recursos (ex.: modo difícil apenas logado)
