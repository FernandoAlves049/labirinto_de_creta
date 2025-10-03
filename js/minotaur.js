// Função de linha de visão (Line of Sight)
function los(maze, x1, y1, x2, y2) {
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  const sx = x1 < x2 ? 1 : -1;
  const sy = y1 < y2 ? 1 : -1;
  let err = dx - dy;
  
  let currentX = Math.floor(x1);
  let currentY = Math.floor(y1);
  const targetX = Math.floor(x2);
  const targetY = Math.floor(y2);
  
  while (currentX !== targetX || currentY !== targetY) {
    if (maze.get(currentX, currentY) === 1) {
      return false; // Parede bloqueando
    }
    
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      currentX += sx;
    }
    if (e2 < dx) {
      err += dx;
      currentY += sy;
    }
  }
  
  return true;
}

class Minotaur{
  constructor(cell, maze){
    this.x = cell.x + 0.5;
    this.y = cell.y + 0.5;
    this.speed = 4.2;
    this.state = 'PATROL';
    this.dirTimer = 0;
    this.vx = 0; this.vy = 0;
    this.sight = 8.5; // células
  }
  canSee(player, maze){
    const dx = player.x - this.x, dy = player.y - this.y;
    const dist2 = dx*dx + dy*dy;
    if (dist2 > this.sight*this.sight) return false;
    return los(this.x, this.y, player.x, player.y, maze);
  }
  chooseDir(maze){
    // escolhe direção livre aleatória
    const dirs = shuffle([[1,0],[-1,0],[0,1],[0,-1]]);
    for (const [dx,dy] of dirs){
      if (!maze.solidAt(this.x+dx*0.6, this.y+dy*0.6)){
        this.vx = dx*this.speed; this.vy = dy*this.speed;
        return;
      }
    }
    this.vx = this.vy = 0;
  }
  moveTry(vx,vy,dt,maze){
    const dx = vx*dt/1000, dy = vy*dt/1000;
    const nx = this.x+dx, ny=this.y+dy;
    if (!maze.solidAt(nx, this.y)) this.x=nx;
    if (!maze.solidAt(this.x, ny)) this.y=ny;
  }
  update(dt, player, maze){
    // OTIMIZAÇÃO: Reduzir frequência de cálculos de visão
    this.visionTimer = (this.visionTimer || 0) + dt;
    if (this.visionTimer > 100) { // Checar visão apenas a cada 100ms
      this.visionTimer = 0;
      if (this.canSee(player, maze)) this.state='CHASE';
    }
    
    if (this.state==='CHASE'){
      const dx = player.x - this.x, dy = player.y - this.y;
      const len = Math.hypot(dx,dy) || 1;
      this.vx = (dx/len)*this.speed*1.15;
      this.vy = (dy/len)*this.speed*1.15;
      this.moveTry(this.vx, this.vy, dt, maze);
      
      // Checar perda de visão menos frequentemente
      if (this.visionTimer === 0 && !this.canSee(player, maze)) this.state='PATROL';
    }else{
      this.dirTimer -= dt;
      if (this.dirTimer<=0){ this.chooseDir(maze); this.dirTimer = 1200 + Math.random()*800; }
      this.moveTry(this.vx, this.vy, dt, maze);
    }
  }
}

function shuffle(a){
  for(let i=a.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}
