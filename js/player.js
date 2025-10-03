class Player {
  constructor(cell){
    this.x = cell.x + 0.5;
    this.y = cell.y + 0.5;
    this.speed = 5.0; // cells/s
    this.r = 0.35;
    this.trail = [];
    this.trailTimer = 0;
  }
  cell(){ return {cx: Math.floor(this.x), cy: Math.floor(this.y)}; }
  tryMove(dx,dy, maze){
    const nx = this.x + dx;
    const ny = this.y + dy;
    // X
    if (!maze.solidAt(nx + Math.sign(dx)*this.r, this.y)) this.x = nx;
    // Y
    if (!maze.solidAt(this.x, ny + Math.sign(dy)*this.r)) this.y = ny;
  }
  update(dt){
    this.trailTimer += dt;
    if (this.trailTimer > 150){ // Menos frequente
      this.trailTimer = 0;
      this.trail.push({x:this.x,y:this.y});
      // CRÍTICO: Limitar trail a 50 pontos máximo
      if (this.trail.length > 50) {
        this.trail.splice(0, this.trail.length - 50);
      }
    }
  }
}
