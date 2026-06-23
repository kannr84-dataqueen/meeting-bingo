import { useGameContext } from '../context/GameContext'
import { CATEGORIES } from '../data/categories'
import { getClosestToWin } from '../lib/bingoChecker'
import type { WinningLine } from '../types'
import BingoCard from './BingoCard'
import GameHeader from './GameHeader'
import GameControls from './GameControls'
import TranscriptPanel from './TranscriptPanel'
import UnsupportedBrowser from './UnsupportedBrowser'

interface GameBoardProps {
  onChangeCategory: () => void
}

function formatLineLabel(line: WinningLine): string {
  if (line.type === 'row') return `row ${line.index + 1}`
  if (line.type === 'col') return `column ${line.index + 1}`
  return 'the diagonal'
}

export default function GameBoard({ onChangeCategory }: GameBoardProps) {
  const {
    gameState,
    toggleSquare,
    speechIsSupported,
    isListening,
    transcript,
    interimTranscript,
    lastDetectedWords,
  } = useGameContext()
  const { card, winningLine, category, filledCount, status, startedAt } = gameState

  const categoryName = CATEGORIES.find(c => c.id === category)?.name ?? ''

  if (!card) return null

  const oneAway = status === 'playing' ? getClosestToWin(card) : null
  const showOneAwayHint = oneAway?.squaresNeeded === 1

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 overflow-x-hidden">
      <GameHeader
        categoryName={categoryName}
        filledCount={filledCount}
        status={status}
        startedAt={startedAt}
      />

      <main className="flex-1 flex flex-col items-center justify-center py-2">
        <BingoCard
          card={card}
          winningLine={winningLine}
          oneAwayLine={showOneAwayHint ? oneAway.line : null}
          onSquareClick={(row, col) => toggleSquare(row, col)}
        />

        {showOneAwayHint && (
          <p
            className="mt-2 text-sm font-medium text-amber-700 text-center px-4"
            aria-live="polite"
          >
            One away on {formatLineLabel(oneAway.line)}!
          </p>
        )}
      </main>

      {speechIsSupported ? (
        <TranscriptPanel
          isListening={isListening}
          transcript={transcript}
          interimTranscript={interimTranscript}
          detectedWords={lastDetectedWords}
        />
      ) : (
        <UnsupportedBrowser />
      )}

      <GameControls onChangeCategory={onChangeCategory} />
    </div>
  )
}
