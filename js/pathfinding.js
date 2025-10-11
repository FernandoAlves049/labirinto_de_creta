// Pathfinding utilities (ES Module)
export function astarGridPath(maze, start, goal) {
  const W = maze.width, H = maze.height;
  const walk = (x, y) => x >= 0 && y >= 0 && x < W && y < H && maze.walls[y][x] === 0;
  if (!walk(goal.x, goal.y) || !walk(start.x, start.y)) return [];
  const h = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  const key = (x, y) => `${x},${y}`;

  const open = [{...start}];
  const g = new Map([[key(start.x, start.y), 0]]);
  const parent = new Map();

  while (open.length) {
    open.sort((a, b) => (g.get(key(a.x,a.y)) + h(a, goal)) - (g.get(key(b.x,b.y)) + h(b, goal)));
    const cur = open.shift();
    if (cur.x === goal.x && cur.y === goal.y) {
      const path = [];
      let k = key(cur.x, cur.y);
      let node = cur;
      while (parent.has(k)) {
        path.push({ x: node.x, y: node.y });
        const p = parent.get(k);
        node = { x: p[0], y: p[1] };
        k = key(node.x, node.y);
      }
      path.reverse();
      return path;
    }
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const nx = cur.x + dx, ny = cur.y + dy;
      if (!walk(nx, ny)) continue;
      const nk = key(nx, ny);
      const tentative = (g.get(key(cur.x, cur.y)) ?? Infinity) + 1;
      if (tentative < (g.get(nk) ?? Infinity)) {
        g.set(nk, tentative);
        parent.set(nk, [cur.x, cur.y]);
        if (!open.find(n => n.x === nx && n.y === ny)) open.push({ x: nx, y: ny });
      }
    }
  }
  return [];
}
