import type { BingoCard, WinningLine } from '../types'

function buildLine(
  card: BingoCard,
  coords: [number, number][],
  type: WinningLine['type'],
  index: number
): WinningLine | null {
  const allFilled = coords.every(([r, c]) => card.squares[r][c].isFilled)
  if (!allFilled) return null
  return {
    type,
    index,
    squares: coords.map(([r, c]) => card.squares[r][c].id),
  }
}

export function checkForBingo(card: BingoCard): WinningLine | null {
  // 5 rows
  for (let r = 0; r < 5; r++) {
    const coords: [number, number][] = [[r,0],[r,1],[r,2],[r,3],[r,4]]
    const line = buildLine(card, coords, 'row', r)
    if (line) return line
  }
  // 5 cols
  for (let c = 0; c < 5; c++) {
    const coords: [number, number][] = [[0,c],[1,c],[2,c],[3,c],[4,c]]
    const line = buildLine(card, coords, 'col', c)
    if (line) return line
  }
  // diagonal top-left → bottom-right
  const diag0 = buildLine(card, [[0,0],[1,1],[2,2],[3,3],[4,4]], 'diag', 0)
  if (diag0) return diag0
  // diagonal top-right → bottom-left
  const diag1 = buildLine(card, [[0,4],[1,3],[2,2],[3,1],[4,0]], 'diag', 1)
  if (diag1) return diag1

  return null
}

export function countFilled(card: BingoCard): number {
  return card.squares.flat().filter((sq) => sq.isFilled).length
}

export function getClosestToWin(
  card: BingoCard
): { squaresNeeded: number; line: WinningLine } | null {
  if (checkForBingo(card)) return null

  const allLines: Array<{ coords: [number, number][]; type: WinningLine['type']; index: number }> = []

  for (let r = 0; r < 5; r++) {
    allLines.push({ coords: [[r,0],[r,1],[r,2],[r,3],[r,4]], type: 'row', index: r })
  }
  for (let c = 0; c < 5; c++) {
    allLines.push({ coords: [[0,c],[1,c],[2,c],[3,c],[4,c]], type: 'col', index: c })
  }
  allLines.push({ coords: [[0,0],[1,1],[2,2],[3,3],[4,4]], type: 'diag', index: 0 })
  allLines.push({ coords: [[0,4],[1,3],[2,2],[3,1],[4,0]], type: 'diag', index: 1 })

  let best: { squaresNeeded: number; line: WinningLine } | null = null

  for (const { coords, type, index } of allLines) {
    const unfilled = coords.filter(([r, c]) => !card.squares[r][c].isFilled).length
    if (best === null || unfilled < best.squaresNeeded) {
      best = {
        squaresNeeded: unfilled,
        line: {
          type,
          index,
          squares: coords.map(([r, c]) => card.squares[r][c].id),
        },
      }
    }
  }

  return best
}
