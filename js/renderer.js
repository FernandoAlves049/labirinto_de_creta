let canvas, ctx;
let cellPx = 24;

function initRenderer(){
  canvas = document.getElementById('gameCanvas');
  console.log('🖼️ Canvas encontrado:', !!canvas, canvas);
  if (!canvas) {
    console.error('❌ Canvas não encontrado!');
    return;
  }
  ctx = canvas.getContext('2d');
  console.log('🎨 Context obtido:', !!ctx);
  resize();
}

let resizeTimeout;
function resize(){
  // OTIMIZAÇÃO: Throttling do resize
  if (resizeTimeout) return;
  resizeTimeout = setTimeout(() => {
    resizeTimeout = null;
    const dpr = Math.min(window.devicePixelRatio || 1, 2); // Limitar DPR
    const rect = canvas.getBoundingClientRect();

    // fallback caso rect.width/height sejam 0
    const width = rect.width > 0 ? rect.width : 900;
    const height = rect.height > 0 ? rect.height : 700;

    canvas.width  = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }, 16); // Throttle de 16ms
}

function drawMaze(maze){
  const w = maze.w, h = maze.h;
  const margin = 16;
  const availableW = (canvas.clientWidth - margin*2);
  const availableH = (canvas.clientHeight - margin*2);
  cellPx = Math.floor(Math.min(availableW / w, availableH / h));
  const ox = Math.floor((canvas.clientWidth - cellPx*w)/2);
  const oy = Math.floor((canvas.clientHeight - cellPx*h)/2);

  // piso
  ctx.fillStyle = '#0c0b09';
  ctx.fillRect(0,0,canvas.clientWidth,canvas.clientHeight);

  // paredes
  ctx.fillStyle = '#403828';
  for (let y=0;y<h;y++){
    for (let x=0;x<w;x++){
      if (maze.walls[y][x] === 1){
        ctx.fillRect(ox + x*cellPx, oy + y*cellPx, cellPx, cellPx);
      }
    }
  }
  // saída
  ctx.fillStyle = '#9acd32';
  ctx.fillRect(ox + maze.exitCell.x*cellPx+4, oy + maze.exitCell.y*cellPx+4, cellPx-8, cellPx-8);

  return {ox,oy,cellPx};
}

function drawPlayer(p, geo){
  ctx.fillStyle = '#87cefa';
  const r = Math.floor(geo.cellPx*0.35);
  ctx.beginPath();
  ctx.arc(geo.ox + p.x*geo.cellPx, geo.oy + p.y*geo.cellPx, r, 0, Math.PI*2);
  ctx.fill();
}

function drawMinotaur(m, geo){
  ctx.fillStyle = '#cd5c5c';
  const r = Math.floor(geo.cellPx*0.36);
  ctx.beginPath();
  ctx.arc(geo.ox + m.x*geo.cellPx, geo.oy + m.y*geo.cellPx, r, 0, Math.PI*2);
  ctx.fill();
}

function drawTrail(trail, geo){
  // OTIMIZAÇÃO: Renderizar apenas se trail não for muito grande
  if (trail.length < 2 || trail.length > 100) return;
  
  ctx.strokeStyle = 'rgba(255,215,0,0.6)';
  ctx.lineWidth = Math.max(2, geo.cellPx*0.15);
  ctx.beginPath();
  
  // Otimizar: usar moveTo apenas uma vez
  const first = trail[0];
  ctx.moveTo(geo.ox + first.x*geo.cellPx, geo.oy + first.y*geo.cellPx);
  
  for (let i=1;i<trail.length;i++){
    const b = trail[i];
    ctx.lineTo(geo.ox + b.x*geo.cellPx, geo.oy + b.y*geo.cellPx);
  }
  ctx.stroke();
}

let lightGradient = null;
let renderCount = 0;
function renderFrame(game){
  const {maze, player, minotaur} = game;
  if (!maze || !player || !minotaur) {
    console.log('⚠️ renderFrame: dados faltando', {maze: !!maze, player: !!player, minotaur: !!minotaur});
    return;
  }
  
  // OTIMIZAÇÃO: Evitar renderização se canvas não visível
  if (canvas.clientWidth === 0 || canvas.clientHeight === 0) {
    console.log('⚠️ Canvas sem dimensões:', canvas.clientWidth, canvas.clientHeight);
    return;
  }
  
  renderCount++;
  if (renderCount % 60 === 1) { // Log a cada 60 frames
    console.log('🎨 Renderizando frame:', renderCount);
  }
  
  const geo = drawMaze(maze);

  // trilha
  if (game.fioAtivo && player.trail.length > 1){
    drawTrail(player.trail, geo);
  }

  drawPlayer(player, geo);
  drawMinotaur(minotaur, geo);

  // OTIMIZAÇÃO: Reutilizar gradient quando possível
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(0,0,canvas.clientWidth,canvas.clientHeight);
  ctx.globalCompositeOperation = 'destination-out';
  
  const rx = geo.ox + player.x*geo.cellPx;
  const ry = geo.oy + player.y*geo.cellPx;
  const lightR = geo.cellPx*2.2;
  
  // Cache do gradient para melhor performance
  if (!lightGradient || lightGradient._r !== lightR) {
    lightGradient = ctx.createRadialGradient(rx,ry,lightR*0.3, rx,ry, lightR);
    lightGradient.addColorStop(0,'rgba(0,0,0,0.9)');
    lightGradient.addColorStop(1,'rgba(0,0,0,0)');
    lightGradient._r = lightR;
  }
  
  ctx.fillStyle = lightGradient;
  ctx.beginPath();
  ctx.arc(rx,ry, lightR, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();
}
