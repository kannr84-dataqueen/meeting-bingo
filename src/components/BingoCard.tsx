import BingoSquare from './BingoSquare'
import type { BingoCard as BingoCardType, WinningLine } from '../types'

interface BingoCardProps {
  card: BingoCardType
  winningLine: WinningLine | null
  oneAwayLine?: WinningLine | null
  onSquareClick: (row: number, col: number) => void
}

export default function BingoCard({
  card,
  winningLine,
  oneAwayLine,
  onSquareClick,
}: BingoCardProps) {
  const winningIds = new Set(winningLine?.squares ?? [])
  const oneAwayIds = new Set(oneAwayLine?.squares ?? [])

  return (
    <div role="grid" aria-label="Bingo Card" className="flex flex-col gap-0.5 p-2 w-full">
      {card.squares.map((row, ri) => (
        <div key={ri} role="row" className="flex gap-0.5">
          {row.map(square => (
            <BingoSquare
              key={square.id}
              square={square}
              isWinning={winningIds.has(square.id)}
              isOneAway={oneAwayIds.has(square.id)}
              onClick={() => onSquareClick(square.row, square.col)}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
