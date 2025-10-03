import { game } from '../main.js';
import { openConfirm as confirmModal } from './hud.js';

const pressed = new Set();
let armed = false;

export function initInput(){
  window.addEventListener('keydown', (e)=>{
    pressed.add(e.code);
    if (e.code==='Escape' && game.state==='playing'){
      game.state='paused';
      confirmModal('Pausa', 'Deseja reiniciar o nível?', ()=>{
        pressed.clear();
        document.getElementById('btnRetry').click();
      }, ()=>{
        game.state='playing';
      });
    }
    if (e.code==='KeyR' && (game.state==='playing' || game.state==='lost')){
      game.state='paused';
      confirmModal('Reiniciar', 'Tem certeza que deseja reiniciar?', ()=>{
        document.getElementById('btnRetry').click();
      }, ()=>{ game.state='playing'; });
    }
  });
  window.addEventListener('keyup', (e)=>{
    pressed.delete(e.code);
  });
}

export function onOnceUserInteract(cb){
  const f = ()=>{ if (armed) return; armed=true; cb(); window.removeEventListener('click', f); window.removeEventListener('keydown', f); };
  window.addEventListener('click', f, {once:true});
  window.addEventListener('keydown', f, {once:true});
}

export function pollInput(game, dt){
  if (game.state!=='playing') return;
  const v = game.player.speed * dt/1000;
  let dx=0, dy=0;
  if (pressed.has('KeyW') || pressed.has('ArrowUp'))    dy -= v;
  if (pressed.has('KeyS') || pressed.has('ArrowDown'))  dy += v;
  if (pressed.has('KeyA') || pressed.has('ArrowLeft'))  dx -= v;
  if (pressed.has('KeyD') || pressed.has('ArrowRight')) dx += v;
  game.fioAtivo = pressed.has('Space');
  game.player.tryMove(dx, dy, game.maze);
}
