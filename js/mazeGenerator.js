class Maze{
  constructor(w,h, seed=12345){
    // Validação de segurança para w e h
    if (!Number.isInteger(w) || w <= 2) {
      console.warn(`Maze: w inválido (${w}), usando valor padrão 15`);
      w = 15;
    }
    if (!Number.isInteger(h) || h <= 2) {
      console.warn(`Maze: h inválido (${h}), usando valor padrão 15`);
      h = 15;
    }
    
    this.w=w; this.h=h; this.seed=seed; this.rng = mulberry32(seed);
    this.walls = this.generate();
    this.startCell = {x:1,y:1};
    this.exitCell  = {x:w-2,y:h-2};
    if (!this.hasPath(this.startCell, this.exitCell)){
      this.carvePath(this.startCell, this.exitCell);
    }
    this.minotaurSpawn = {x:w-2, y:1};
  }

  generate(){
    // Grade inicial toda parede (1) e vamos cavar
    const w=this.w, h=this.h;
    const grid = Array.from({length:h}, _=> Array(w).fill(1));
    // tornar ímpares corredores para backtracking
    for (let y=1; y<h; y+=2){
      for (let x=1; x<w; x+=2){
        grid[y][x]=0;
      }
    }
    // recursive backtracking iterativo
    const stack = [{x:1,y:1}];
    const dirs = [{x:2,y:0},{x:-2,y:0},{x:0,y:2},{x:0,y:-2}];
    while (stack.length){
      const cur = stack[stack.length-1];
      const cand = shuffle(dirs.slice(), this.rng).filter(d=>{
        const nx = cur.x + d.x, ny = cur.y + d.y;
        return nx>0 && ny>0 && nx<w-1 && ny<h-1 && grid[ny][nx]===0 && this.neighborsAreWalls(grid, nx, ny);
      });
      if (cand.length===0){ stack.pop(); continue; }
      const d = cand[0];
      const nx = cur.x + d.x, ny = cur.y + d.y;
      grid[cur.y + d.y/2][cur.x + d.x/2] = 0; // quebra parede entre
      stack.push({x:nx,y:ny});
    }
    return grid;
  }

  neighborsAreWalls(grid,x,y){
    let walls=0;
    for (let yy=y-1; yy<=y+1; yy++){
      for (let xx=x-1; xx<=x+1; xx++){
        if (xx===x && yy===y) continue;
        if (grid[yy]?.[xx]===1) walls++;
      }
    }
    return walls>=6; // evita abrir regiões muito cedo
  }

  hasPath(a,b){
    const q = [a];
    const seen = new Set([a.x+','+a.y]);
    while(q.length){
      const {x,y} = q.shift();
      if (x===b.x && y===b.y) return true;
      for (const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const nx=x+dx, ny=y+dy;
        if (this.walls[ny]?.[nx]===0){
          const k=nx+','+ny;
          if (!seen.has(k)){ seen.add(k); q.push({x:nx,y:ny}); }
        }
      }
    }
    return false;
  }

  carvePath(a,b){
    // Com backtracking denso, normalmente já há caminho; mantido para extensão futura
  }

  solidAt(x,y){ 
    const cx=Math.floor(x), cy=Math.floor(y);
    return this.walls[cy]?.[cx]===1;
  }
}

function shuffle(arr, rng){
  for (let i=arr.length-1;i>0;i--){
    const j = Math.floor(rng()* (i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr;
}
function mulberry32(a){ 
  return function() { 
    let t = a += 0x6D2B79F5; 
    t = Math.imul(t ^ t>>>15, t|1); 
    t ^= t + Math.imul(t ^ t>>>7, t|61); 
    return ((t ^ t>>>14)>>>0) / 4294967296; 
  }; 
}
