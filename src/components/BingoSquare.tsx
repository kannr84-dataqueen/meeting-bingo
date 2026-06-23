import { cn } from '../lib/utils'
import type { BingoSquare as BingoSquareType } from '../types'

interface BingoSquareProps {
  square: BingoSquareType
  isWinning: boolean
  isOneAway: boolean
  onClick: () => void
}

function getSquareStyle(
  isFilled: boolean,
  isAutoFilled: boolean,
  isFreeSpace: boolean,
  isWinning: boolean
): { bgVar: string; textColor: string } {
  if (isWinning) return { bgVar: '--color-square-winning', textColor: 'white' }
  if (isFreeSpace) return { bgVar: '--color-square-free', textColor: '#6b7280' }
  if (isFilled && isAutoFilled) return { bgVar: '--color-square-auto', textColor: 'white' }
  if (isFilled) return { bgVar: '--color-square-filled', textColor: 'white' }
  return { bgVar: '--color-square-default', textColor: '#374151' }
}

export default function BingoSquare({ square, isWinning, isOneAway, onClick }: BingoSquareProps) {
  const { word, isFilled, isAutoFilled, isFreeSpace, row, col } = square
  const { bgVar, textColor } = getSquareStyle(isFilled, isAutoFilled, isFreeSpace, isWinning)
  const showOneAwayRing = isOneAway && !isFilled && !isWinning

  const ariaLabel = isFreeSpace
    ? 'Free Space'
    : `${word}, row ${row + 1}, column ${col + 1}`

  return (
    <button
      role="gridcell"
      onClick={isFreeSpace ? undefined : onClick}
      aria-label={ariaLabel}
      aria-pressed={!isFreeSpace ? isFilled : undefined}
      aria-disabled={isFreeSpace ? 'true' : undefined}
      title={!isFreeSpace ? word : undefined}
      className={cn(
        'flex-1 aspect-square flex items-center justify-center rounded p-0.5',
        'text-xs font-medium leading-tight transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1',
        isFreeSpace && 'cursor-default',
        isAutoFilled && isFilled && !isWinning && 'motion-safe:animate-pulse',
        showOneAwayRing && 'ring-2 ring-amber-400 ring-inset'
      )}
      style={{ background: `var(${bgVar})`, color: textColor }}
    >
      <span className="w-full text-center truncate px-0.5">
        {isFreeSpace ? 'FREE' : word}
      </span>
    </button>
  )
}
