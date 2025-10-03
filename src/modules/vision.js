export function los(x0,y0,x1,y1, maze){
  // Bresenham em grid de células (amostragem simples)
  let x = Math.floor(x0), y = Math.floor(y0);
  const tx = Math.floor(x1), ty = Math.floor(y1);
  const dx = Math.abs(tx - x), dy = Math.abs(ty - y);
  const sx = x < tx ? 1 : -1;
  const sy = y < ty ? 1 : -1;
  let err = dx - dy;
  while (true){
    if (maze.walls[y]?.[x]===1) return false;
    if (x===tx && y===ty) break;
    const e2 = 2*err;
    if (e2 > -dy){ err -= dy; x += sx; }
    if (e2 <  dx){ err += dx; y += sy; }
  }
  return true;
}
