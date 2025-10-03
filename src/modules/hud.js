const els = {};
export function initHUD(){
  els.time = document.querySelector('[data-hud-time]');
  els.level= document.querySelector('[data-hud-level]');
  els.fio  = document.querySelector('[data-hud-fio]');
  els.min  = document.querySelector('[data-hud-minotaur]');
  els.msg  = document.getElementById('msg');
  els.next = document.getElementById('btnNext');
  els.retry= document.getElementById('btnRetry');
  els.overlay = document.getElementById('overlay');
  els.ovTitle = document.getElementById('ovTitle');
  els.ovText  = document.getElementById('ovText');
  els.ovConfirm = document.getElementById('ovConfirm');
  els.ovCancel  = document.getElementById('ovCancel');
}
export function hudSet(partial){
  if ('time' in partial)  els.time.textContent  = `${partial.time}s`;
  if ('level'in partial)  els.level.textContent = partial.level;
  if ('fio'  in partial)  els.fio.textContent   = partial.fio ? 'ATIVO':'INATIVO';
  if ('minotaur'in partial) els.min.textContent = partial.minotaur;
}
export function setMessage(t){ els.msg.textContent = t || ''; }
export function bindStatusButtons(actions){
  els.next.onclick = ()=> actions.next && actions.next();
  els.retry.onclick= ()=> actions.retry && actions.retry();
}
export function openConfirm(title, text, onOk, onCancel){
  els.ovTitle.textContent = title;
  els.ovText.textContent = text;
  els.overlay.classList.remove('hidden');
  const ok = ()=>{ cleanup(); onOk&&onOk(); };
  const cancel = ()=>{ cleanup(); onCancel&&onCancel(); };
  function cleanup(){
    els.overlay.classList.add('hidden');
    els.ovConfirm.removeEventListener('click', ok);
    els.ovCancel.removeEventListener('click', cancel);
  }
  els.ovConfirm.addEventListener('click', ok);
  els.ovCancel.addEventListener('click', cancel);
}
export { openConfirm as confirmModal };
