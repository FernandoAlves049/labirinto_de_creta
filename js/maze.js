// Maze generation and utilities (ES Module)
export function generateMazeDynamic(level, canvasWidth, canvasHeight) {
  const baseCellSize = 20;
  const cellSizeReduction = Math.min(8, level * 0.5);
  const targetCellSize = Math.max(8, baseCellSize - cellSizeReduction);

  const levelMultiplier = 1 + (level - 1) * 0.1;
  const baseCanvasWidth = 600;
  const baseCanvasHeight = 450;
  const w = Math.min(1000, baseCanvasWidth * levelMultiplier);
  const h = Math.min(750, baseCanvasHeight * levelMultiplier);

  const width = Math.floor(w / targetCellSize);
  const height = Math.floor(h / targetCellSize);
  const mazeWidth = width % 2 === 0 ? width - 1 : width;
  const mazeHeight = height % 2 === 0 ? height - 1 : height;

  const maze = { width: mazeWidth, height: mazeHeight, walls: [] };
  for (let y = 0; y < mazeHeight; y++) {
    maze.walls[y] = [];
    for (let x = 0; x < mazeWidth; x++) maze.walls[y][x] = 1;
  }
  carveMaze(maze, 1, 1);
  maze.walls[1][1] = 0;
  maze.walls[mazeHeight - 2][mazeWidth - 2] = 0;
  createAdditionalPaths(maze);

  const cellSize = Math.min(w / mazeWidth, h / mazeHeight);
  return { maze, dims: { canvasWidth: w, canvasHeight: h, cellSize } };
}

export function isWall(maze, x, y) {
  const gx = Math.floor(x);
  const gy = Math.floor(y);
  return maze.walls[gy]?.[gx] === 1;
}

export function createAdditionalPaths(maze) {
  const pathsToCreate = Math.floor(maze.width * maze.height * 0.05);
  for (let i = 0; i < pathsToCreate; i++) {
    const x = 1 + Math.floor(Math.random() * (maze.width - 2));
    const y = 1 + Math.floor(Math.random() * (maze.height - 2));
    if (maze.walls[y] && maze.walls[y][x]) {
      maze.walls[y][x] = 0;
      const directions = [[0,1],[1,0],[0,-1],[-1,0]];
      for (const [dx, dy] of directions) {
        const nx = x + dx, ny = y + dy;
        if (nx > 0 && nx < maze.width - 1 && ny > 0 && ny < maze.height - 1) {
          if (Math.random() < 0.3 && maze.walls[ny] && maze.walls[ny][nx]) {
            maze.walls[ny][nx] = 0;
          }
        }
      }
    }
  }
}

export function carveMaze(maze, x, y) {
  const dirs = [[0, 2], [2, 0], [0, -2], [-2, 0]];
  dirs.sort(() => Math.random() - 0.5);
  maze.walls[y][x] = 0;
  for (const [dx, dy] of dirs) {
    const nx = x + dx, ny = y + dy;
    if (nx > 0 && nx < maze.width - 1 && ny > 0 && ny < maze.height - 1 && maze.walls[ny][nx] === 1) {
      maze.walls[y + dy / 2][x + dx / 2] = 0;
      carveMaze(maze, nx, ny);
    }
  }
}
