import { describe, it, expect } from 'vitest'
import { fisherYatesShuffle, generateCard, getCardWords } from '../cardGenerator'

describe('fisherYatesShuffle', () => {
  it('returns a new array without mutating the original', () => {
    const original = [1, 2, 3, 4, 5]
    const shuffled = fisherYatesShuffle(original)
    expect(shuffled).toHaveLength(5)
    expect(original).toEqual([1, 2, 3, 4, 5])
    expect(shuffled).not.toBe(original)
  })
})

describe('generateCard', () => {
  it('returns a 5x5 grid', () => {
    const card = generateCard('agile')
    expect(card.squares).toHaveLength(5)
    card.squares.forEach((row) => expect(row).toHaveLength(5))
  })

  it('contains exactly 24 non-free unique words plus 1 FREE space', () => {
    const card = generateCard('agile')
    const flat = card.squares.flat()
    expect(flat).toHaveLength(25)
    const freeSquares = flat.filter((sq) => sq.isFreeSpace)
    const wordSquares = flat.filter((sq) => !sq.isFreeSpace)
    expect(freeSquares).toHaveLength(1)
    expect(wordSquares).toHaveLength(24)
    const uniqueWords = new Set(wordSquares.map((sq) => sq.word))
    expect(uniqueWords.size).toBe(24)
  })

  it('places FREE at position [2][2]', () => {
    const card = generateCard('agile')
    const free = card.squares[2][2]
    expect(free.isFreeSpace).toBe(true)
    expect(free.row).toBe(2)
    expect(free.col).toBe(2)
    expect(free.id).toBe('2-2')
  })

  it('FREE space is pre-filled', () => {
    const card = generateCard('agile')
    expect(card.squares[2][2].isFilled).toBe(true)
  })

  it('all non-free squares start unfilled and not auto-filled', () => {
    const card = generateCard('agile')
    card.squares.flat().filter((sq) => !sq.isFreeSpace).forEach((sq) => {
      expect(sq.isFilled).toBe(false)
      expect(sq.isAutoFilled).toBe(false)
      expect(sq.filledAt).toBeNull()
    })
  })

  it('square IDs match row-col format', () => {
    const card = generateCard('agile')
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        expect(card.squares[r][c].id).toBe(`${r}-${c}`)
      }
    }
  })

  it('produces different orderings across multiple calls (probabilistic)', () => {
    const results = Array.from({ length: 10 }, () =>
      generateCard('agile').words.join(',')
    )
    const unique = new Set(results)
    expect(unique.size).toBeGreaterThan(1)
  })
})

describe('getCardWords', () => {
  it('returns a flat array of exactly 24 strings', () => {
    const card = generateCard('corporate')
    const words = getCardWords(card)
    expect(words).toHaveLength(24)
    words.forEach((w) => expect(typeof w).toBe('string'))
  })
})
