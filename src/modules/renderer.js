let canvas, ctx;
let cellPx = 24;

export function initRenderer(){
  canvas = document.getElementById('game');
  ctx = canvas.getContext('2d');
  resize();
}

export function resize(){
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const cssW = canvas.clientWidth;
  const cssH = canvas.clientHeight;
  canvas.width  = Math.floor(cssW * dpr);
  canvas.height = Math.floor(cssH * dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
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
  ctx.strokeStyle = 'rgba(255,215,0,0.6)';
  ctx.lineWidth = Math.max(2, geo.cellPx*0.15);
  ctx.beginPath();
  for (let i=1;i<trail.length;i++){
    const a = trail[i-1], b = trail[i];
    ctx.moveTo(geo.ox + a.x*geo.cellPx, geo.oy + a.y*geo.cellPx);
    ctx.lineTo(geo.ox + b.x*geo.cellPx, geo.oy + b.y*geo.cellPx);
  }
  ctx.stroke();
}

export function renderFrame(game){
  const {maze, player, minotaur} = game;
  if (!maze) return;
  const geo = drawMaze(maze);

  // trilha
  if (game.fioAtivo && player.trail.length>1){
    drawTrail(player.trail, geo);
  }

  drawPlayer(player, geo);
  drawMinotaur(minotaur, geo);

  // máscara de luz (iluminação simples)
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(0,0,canvas.clientWidth,canvas.clientHeight);
  ctx.globalCompositeOperation = 'destination-out';
  const rx = geo.ox + player.x*geo.cellPx;
  const ry = geo.oy + player.y*geo.cellPx;
  const lightR = geo.cellPx*2.2;
  const grd = ctx.createRadialGradient(rx,ry,lightR*0.3, rx,ry, lightR);
  grd.addColorStop(0,'rgba(0,0,0,0.9)');
  grd.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(rx,ry, lightR, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();
}
