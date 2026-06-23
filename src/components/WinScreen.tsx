import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import { useGameContext } from '../context/GameContext'
import { buildShareText } from '../lib/shareUtils'
import BingoCard from './BingoCard'
import { Button } from './ui/Button'

interface WinScreenProps {
  onPlayAgain: () => void
  onNewGame: () => void
}

function formatElapsed(startedAt: number | null, completedAt: number | null): string {
  if (!startedAt || !completedAt) return '00:00'
  const s = Math.floor((completedAt - startedAt) / 1000)
  const mm = Math.floor(s / 60).toString().padStart(2, '0')
  const ss = (s % 60).toString().padStart(2, '0')
  return `${mm}:${ss}`
}

export default function WinScreen({ onPlayAgain, onNewGame }: WinScreenProps) {
  const { gameState, stopListening, addToast } = useGameContext()
  const { card, winningLine, winningWord, filledCount, startedAt, completedAt } = gameState

  const headingRef = useRef<HTMLHeadingElement>(null)
  const confettiFiredRef = useRef(false)

  // Move focus to heading immediately on mount
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  // Stop speech recognition on win screen mount
  useEffect(() => {
    stopListening()
  }, [stopListening])

  // Fire confetti once — ref guard prevents double-fire in Strict Mode
  useEffect(() => {
    if (
      !confettiFiredRef.current &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      confettiFiredRef.current = true
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } })
    }
  }, [])

  async function handleShare() {
    const appUrl = import.meta.env.VITE_APP_URL ?? window.location.origin
    const text = buildShareText(gameState, appUrl)

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Meeting Bingo', text })
      } catch {
        // user cancelled native share — no action needed
      }
    } else {
      try {
        await navigator.clipboard.writeText(text)
        addToast('Copied to clipboard!', 'success')
      } catch {
        addToast('Could not copy to clipboard', 'error')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4 gap-6">
      <div className="text-center">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-5xl font-black text-green-500 focus:outline-none"
        >
          BINGO!
        </h2>
        <p className="text-lg font-semibold text-gray-700 mt-1">You got it!</p>
      </div>

      {/* Game stats */}
      <div className="w-full max-w-xs grid grid-cols-3 gap-3 text-center">
        <div className="bg-white rounded-xl shadow-sm p-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Time</p>
          <p className="text-lg font-bold tabular-nums text-gray-900">
            {formatElapsed(startedAt, completedAt)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Word</p>
          <p className="text-sm font-bold text-gray-900 truncate" title={winningWord ?? ''}>
            {winningWord ?? '—'}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Filled</p>
          <p className="text-lg font-bold text-gray-900">{filledCount}/24</p>
        </div>
      </div>

      {/* Winning card */}
      {card && (
        <div className="w-full max-w-sm">
          <BingoCard card={card} winningLine={winningLine} onSquareClick={() => undefined} />
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Button variant="primary" size="lg" onClick={handleShare} className="w-full">
          Share Result
        </Button>
        <Button variant="secondary" size="md" onClick={onPlayAgain} className="w-full">
          Play Again
        </Button>
        <Button variant="ghost" size="md" onClick={onNewGame} className="w-full">
          Home
        </Button>
      </div>
    </div>
  )
}
