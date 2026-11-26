import { useCallback, useEffect, useRef, useState } from 'react'
import { GRID, newGame, step, tickMs, turn } from './game.js'
import './App.css'

const KEYS = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
}

const BEST_KEY = 'snake-best-score'

function loadBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0
  } catch {
    return 0
  }
}

const MESSAGES = {
  idle: { title: 'Jogo da Cobrinha', hint: 'Pressione Espaço ou toque para começar' },
  paused: { title: 'Pausado', hint: 'Pressione Espaço ou toque para continuar' },
  over: { title: 'Fim de jogo', hint: 'Pressione Espaço ou toque para jogar de novo' },
  won: { title: 'Você venceu! 🎉', hint: 'Pressione Espaço ou toque para jogar de novo' },
}

const cellStyle = ({ x, y }) => ({
  left: `${(x * 100) / GRID}%`,
  top: `${(y * 100) / GRID}%`,
  width: `${100 / GRID}%`,
  height: `${100 / GRID}%`,
})

export default function App() {
  const [game, setGame] = useState(newGame)
  const [best, setBest] = useState(loadBest)
  const gameRef = useRef(game)
  const bestRef = useRef(best)
  const touchStart = useRef(null)

  const update = useCallback((fn) => {
    const next = fn(gameRef.current)
    if (next === gameRef.current) return
    gameRef.current = next
    setGame(next)
    if (next.score > bestRef.current) {
      bestRef.current = next.score
      setBest(next.score)
      try {
        localStorage.setItem(BEST_KEY, String(next.score))
      } catch {
        // sem armazenamento disponível: o recorde vale só para esta sessão
      }
    }
  }, [])

  const toggle = useCallback(() => {
    update((g) => {
      if (g.status === 'running') return { ...g, status: 'paused' }
      if (g.status === 'paused') return { ...g, status: 'running' }
      if (g.status === 'idle') return { ...g, status: 'running' }
      return newGame('running')
    })
  }, [update])

  const steer = useCallback((dir) => update((g) => turn(g, dir)), [update])

  const { status, score } = game
  const speed = tickMs(score)

  useEffect(() => {
    if (status !== 'running') return
    const id = setInterval(() => update(step), speed)
    return () => clearInterval(id)
  }, [status, speed, update])

  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
      if (key === ' ' || key === 'Enter') {
        e.preventDefault()
        if (!e.repeat) toggle()
      } else if (KEYS[key]) {
        e.preventDefault()
        steer(KEYS[key])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggle, steer])

  useEffect(() => {
    const onBlur = () => update((g) => (g.status === 'running' ? { ...g, status: 'paused' } : g))
    window.addEventListener('blur', onBlur)
    return () => window.removeEventListener('blur', onBlur)
  }, [update])

  const onTouchStart = (e) => {
    const t = e.touches[0]
    touchStart.current = { x: t.clientX, y: t.clientY }
  }

  const onTouchEnd = (e) => {
    const start = touchStart.current
    touchStart.current = null
    if (!start) return
    const t = e.changedTouches[0]
    const dx = t.clientX - start.x
    const dy = t.clientY - start.y
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return
    e.preventDefault() // evita o clique sintético que pausaria o jogo
    if (Math.abs(dx) > Math.abs(dy)) steer(dx > 0 ? 'right' : 'left')
    else steer(dy > 0 ? 'down' : 'up')
  }

  const message = MESSAGES[status]

  return (
    <main className="app">
      <header className="hud">
        <h1>🐍 Cobrinha</h1>
        <div className="scores">
          <div>
            <span>Pontos</span>
            <strong>{score}</strong>
          </div>
          <div>
            <span>Recorde</span>
            <strong>{best}</strong>
          </div>
        </div>
      </header>

      <div
        className="board"
        onClick={toggle}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        role="application"
        aria-label="Tabuleiro do jogo da cobrinha"
      >
        {game.food && <div className="cell food" style={cellStyle(game.food)} />}
        {game.snake.map((seg, i) => (
          <div
            key={i}
            className={i === 0 ? `cell snake head ${game.dir}` : 'cell snake'}
            style={cellStyle(seg)}
          />
        ))}
        {message && (
          <div className="overlay">
            <h2>{message.title}</h2>
            {(status === 'over' || status === 'won') && <p className="final">Pontuação: {score}</p>}
            <p>{message.hint}</p>
          </div>
        )}
      </div>

      <div className="dpad" aria-label="Controles">
        <button className="up" onClick={() => steer('up')} aria-label="Cima">▲</button>
        <button className="left" onClick={() => steer('left')} aria-label="Esquerda">◀</button>
        <button className="mid" onClick={toggle} aria-label="Iniciar ou pausar">
          {status === 'running' ? '⏸' : '▶'}
        </button>
        <button className="right" onClick={() => steer('right')} aria-label="Direita">▶</button>
        <button className="down" onClick={() => steer('down')} aria-label="Baixo">▼</button>
      </div>

      <p className="help">Setas ou WASD para mover · Espaço para pausar · Deslize o dedo no celular</p>
    </main>
  )
}
