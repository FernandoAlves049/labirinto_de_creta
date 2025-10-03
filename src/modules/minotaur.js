import { los } from './vision.js';

export class Minotaur{
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
    if (this.canSee(player, maze)) this.state='CHASE';
    if (this.state==='CHASE'){
      const dx = player.x - this.x, dy = player.y - this.y;
      const len = Math.hypot(dx,dy) || 1;
      this.vx = (dx/len)*this.speed*1.15;
      this.vy = (dy/len)*this.speed*1.15;
      this.moveTry(this.vx, this.vy, dt, maze);
      if (!this.canSee(player, maze)) this.state='PATROL';
    }else{
      this.dirTimer -= dt;
      if (this.dirTimer<=0){ this.chooseDir(maze); this.dirTimer = 900 + Math.random()*1200; }
      this.moveTry(this.vx, this.vy, dt, maze);
    }
  }
}

function shuffle(a){
  for(let i=a.length-1;i>0;i--){ const j=(Math.random()*(i+1))|0; [a[i],a[j]]=[a[j],a[i]]; }
  return a;
}
