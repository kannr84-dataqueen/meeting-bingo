import { describe, it, expect } from 'vitest'
import { checkForBingo, countFilled, getClosestToWin } from '../bingoChecker'
import { generateCard } from '../cardGenerator'
import type { BingoCard } from '../../types'

function fillSquares(card: BingoCard, coords: [number, number][]): BingoCard {
  const squares = card.squares.map((row) => row.map((sq) => ({ ...sq })))
  for (const [r, c] of coords) {
    squares[r][c] = { ...squares[r][c], isFilled: true }
  }
  return { ...card, squares }
}

function fillAll(card: BingoCard): BingoCard {
  const squares = card.squares.map((row) =>
    row.map((sq) => ({ ...sq, isFilled: true }))
  )
  return { ...card, squares }
}

describe('checkForBingo', () => {
  it('returns null for a fresh card (only FREE filled)', () => {
    const card = generateCard('agile')
    expect(checkForBingo(card)).toBeNull()
  })

  it('detects a row win on row 0', () => {
    let card = generateCard('agile')
    card = fillSquares(card, [[0,0],[0,1],[0,2],[0,3],[0,4]])
    const result = checkForBingo(card)
    expect(result).not.toBeNull()
    expect(result!.type).toBe('row')
    expect(result!.index).toBe(0)
    expect(result!.squares).toHaveLength(5)
  })

  it('detects a col win on column 2', () => {
    let card = generateCard('agile')
    card = fillSquares(card, [[0,2],[1,2],[2,2],[3,2],[4,2]])
    const result = checkForBingo(card)
    expect(result).not.toBeNull()
    expect(result!.type).toBe('col')
    expect(result!.index).toBe(2)
  })

  it('detects diagonal top-left to bottom-right (index 0)', () => {
    let card = generateCard('agile')
    card = fillSquares(card, [[0,0],[1,1],[2,2],[3,3],[4,4]])
    const result = checkForBingo(card)
    expect(result).not.toBeNull()
    expect(result!.type).toBe('diag')
    expect(result!.index).toBe(0)
  })

  it('detects diagonal top-right to bottom-left (index 1)', () => {
    let card = generateCard('agile')
    card = fillSquares(card, [[0,4],[1,3],[2,2],[3,1],[4,0]])
    const result = checkForBingo(card)
    expect(result).not.toBeNull()
    expect(result!.type).toBe('diag')
    expect(result!.index).toBe(1)
  })

  it('returns null when only 4 of 5 in a row are filled', () => {
    let card = generateCard('agile')
    card = fillSquares(card, [[0,0],[0,1],[0,2],[0,3]])
    expect(checkForBingo(card)).toBeNull()
  })
})

describe('countFilled', () => {
  it('returns 1 for a fresh card (only FREE)', () => {
    const card = generateCard('agile')
    expect(countFilled(card)).toBe(1)
  })

  it('returns 25 when all squares are filled', () => {
    const card = fillAll(generateCard('agile'))
    expect(countFilled(card)).toBe(25)
  })
})

describe('getClosestToWin', () => {
  it('returns squaresNeeded=1 when one square away from a line', () => {
    let card = generateCard('agile')
    // fill row 0 positions 0-3 (4 of 5); FREE is at [2][2] so row 2 needs less
    card = fillSquares(card, [[0,0],[0,1],[0,2],[0,3]])
    const result = getClosestToWin(card)
    expect(result).not.toBeNull()
    expect(result!.squaresNeeded).toBe(1)
  })

  it('returns null when a bingo already exists', () => {
    let card = generateCard('agile')
    card = fillSquares(card, [[0,0],[0,1],[0,2],[0,3],[0,4]])
    expect(getClosestToWin(card)).toBeNull()
  })
})
