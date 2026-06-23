import { useState, useEffect } from 'react'
import type { GameStatus } from '../types'

interface GameHeaderProps {
  categoryName: string
  filledCount: number
  status: GameStatus
  startedAt: number | null
}

function formatElapsed(ms: number): string {
  const s = Math.floor(ms / 1000)
  const mm = Math.floor(s / 60).toString().padStart(2, '0')
  const ss = (s % 60).toString().padStart(2, '0')
  return `${mm}:${ss}`
}

export default function GameHeader({
  categoryName,
  filledCount,
  status,
  startedAt,
}: GameHeaderProps) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (status !== 'playing' || !startedAt) return

    const tick = () => setElapsed(Date.now() - startedAt)
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [status, startedAt])

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Category</p>
        <p className="text-sm font-semibold text-gray-900">{categoryName}</p>
      </div>
      <div className="text-center">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Squares</p>
        <p className="text-sm font-semibold text-gray-900">{filledCount} / 24</p>
      </div>
      <div className="text-right">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Time</p>
        <p className="text-sm font-semibold tabular-nums text-gray-900">
          {formatElapsed(elapsed)}
        </p>
      </div>
    </header>
  )
}
