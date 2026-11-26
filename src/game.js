export const GRID = 20

export const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}

const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' }

function placeFood(snake) {
  const taken = new Set(snake.map((s) => s.y * GRID + s.x))
  const free = []
  for (let i = 0; i < GRID * GRID; i++) if (!taken.has(i)) free.push(i)
  if (free.length === 0) return null
  const i = free[Math.floor(Math.random() * free.length)]
  return { x: i % GRID, y: Math.floor(i / GRID) }
}

export function newGame(status = 'idle') {
  const mid = Math.floor(GRID / 2)
  const snake = [
    { x: mid, y: mid },
    { x: mid - 1, y: mid },
    { x: mid - 2, y: mid },
  ]
  return { snake, dir: 'right', queue: [], food: placeFood(snake), score: 0, status }
}

// Enfileira até 2 direções para que viradas rápidas não se percam entre ticks.
export function turn(game, dir) {
  if (game.status !== 'running' || game.queue.length >= 2) return game
  const last = game.queue.at(-1) ?? game.dir
  if (dir === last || dir === OPPOSITE[last]) return game
  return { ...game, queue: [...game.queue, dir] }
}

export function step(game) {
  if (game.status !== 'running') return game

  const [next, ...queue] = game.queue
  const dir = next ?? game.dir
  const head = { x: game.snake[0].x + DIRS[dir].x, y: game.snake[0].y + DIRS[dir].y }

  const hitWall = head.x < 0 || head.y < 0 || head.x >= GRID || head.y >= GRID
  const eating = !hitWall && head.x === game.food.x && head.y === game.food.y
  // A cauda sai do lugar neste tick (a menos que a cobra cresça), então não conta como colisão.
  const body = eating ? game.snake : game.snake.slice(0, -1)
  const hitSelf = body.some((s) => s.x === head.x && s.y === head.y)

  if (hitWall || hitSelf) return { ...game, dir, queue, status: 'over' }

  const snake = [head, ...body]
  if (!eating) return { ...game, snake, dir, queue }

  const food = placeFood(snake)
  return { ...game, snake, dir, queue, food, score: game.score + 1, status: food ? 'running' : 'won' }
}

export function tickMs(score) {
  return Math.max(60, 150 - score * 3)
}
