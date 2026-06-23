export type CategoryId = 'agile' | 'corporate' | 'tech'

export interface BingoSquare {
  id: string
  word: string
  isFilled: boolean
  isAutoFilled: boolean
  isFreeSpace: boolean
  filledAt: number | null
  row: number
  col: number
}

export interface BingoCard {
  squares: BingoSquare[][]
  words: string[]
}

export type GameStatus = 'idle' | 'setup' | 'playing' | 'won'

export interface WinningLine {
  type: 'row' | 'col' | 'diag'
  index: number
  squares: string[]
}

export interface GameState {
  status: GameStatus
  category: CategoryId | null
  card: BingoCard | null
  isListening: boolean
  startedAt: number | null
  completedAt: number | null
  winningLine: WinningLine | null
  winningWord: string | null
  filledCount: number
  alreadyFilled: string[]
  transcript: string
  schemaVersion: number
}

export interface Toast {
  id: string
  message: string
  type: 'success' | 'info' | 'warning' | 'error'
  expiresAt: number
}

export type Screen = 'landing' | 'category' | 'game' | 'win'

export const STORAGE_KEY = 'meeting-bingo-v1'
export const SCHEMA_VERSION = 1
