import { CATEGORIES } from '../data/categories'
import type { BingoCard, BingoSquare, CategoryId } from '../types'

export function fisherYatesShuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function generateCard(categoryId: CategoryId): BingoCard {
  const category = CATEGORIES.find((c) => c.id === categoryId)
  if (!category) throw new Error(`Unknown categoryId: ${categoryId}`)

  const shuffled = fisherYatesShuffle(category.words)
  const selected = shuffled.slice(0, 24)

  const squares: BingoSquare[][] = []
  let wordIndex = 0

  for (let row = 0; row < 5; row++) {
    const rowSquares: BingoSquare[] = []
    for (let col = 0; col < 5; col++) {
      if (row === 2 && col === 2) {
        rowSquares.push({
          id: '2-2',
          word: 'FREE',
          isFilled: true,
          isAutoFilled: false,
          isFreeSpace: true,
          filledAt: Date.now(),
          row: 2,
          col: 2,
        })
      } else {
        const word = selected[wordIndex++]
        rowSquares.push({
          id: `${row}-${col}`,
          word,
          isFilled: false,
          isAutoFilled: false,
          isFreeSpace: false,
          filledAt: null,
          row,
          col,
        })
      }
    }
    squares.push(rowSquares)
  }

  return { squares, words: selected }
}

export function getCardWords(card: BingoCard): string[] {
  return card.words
}
