import { CATEGORIES } from '../data/categories'
import type { GameState } from '../types'

function formatElapsed(startedAt: number | null, completedAt: number | null): string {
  if (!startedAt || !completedAt) return '00:00'
  const totalSeconds = Math.floor((completedAt - startedAt) / 1000)
  const mm = Math.floor(totalSeconds / 60).toString().padStart(2, '0')
  const ss = (totalSeconds % 60).toString().padStart(2, '0')
  return `${mm}:${ss}`
}

export function buildShareText(game: GameState, appUrl: string): string {
  const elapsed = formatElapsed(game.startedAt, game.completedAt)
  const category = CATEGORIES.find((c) => c.id === game.category)
  const categoryName = category?.name ?? 'Unknown'
  const winningWord = game.winningWord ?? ''
  const filledCount = game.filledCount

  return [
    `Meeting Bingo — BINGO in ${elapsed}!`,
    `Winning word: "${winningWord}" | ${filledCount}/24 squares`,
    `Category: ${categoryName}`,
    `Play at: ${appUrl}`,
  ].join('\n')
}

export async function shareResult(game: GameState, appUrl: string): Promise<void> {
  const text = buildShareText(game, appUrl)

  if (navigator.share) {
    try {
      await navigator.share({ title: 'Meeting Bingo', text })
    } catch {
      // user cancelled or share failed — not an error
    }
    return
  }

  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // clipboard unavailable — silently fail
  }
}
