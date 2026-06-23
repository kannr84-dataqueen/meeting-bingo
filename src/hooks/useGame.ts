import { useState, useCallback, useEffect } from 'react'
import { generateCard } from '../lib/cardGenerator'
import { checkForBingo } from '../lib/bingoChecker'
import type { GameState, CategoryId } from '../types'
import { STORAGE_KEY, SCHEMA_VERSION } from '../types'

const initialState: GameState = {
  status: 'idle',
  category: null,
  card: null,
  isListening: false,
  startedAt: null,
  completedAt: null,
  winningLine: null,
  winningWord: null,
  filledCount: 0,
  alreadyFilled: [],
  transcript: '',
  schemaVersion: SCHEMA_VERSION,
}

function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState
    const parsed = JSON.parse(raw) as Partial<GameState>
    if (parsed.schemaVersion !== SCHEMA_VERSION) return initialState
    return { ...initialState, ...parsed }
  } catch {
    return initialState
  }
}

export function useGame() {
  const [state, setState] = useState<GameState>(loadState)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // localStorage unavailable
    }
  }, [state])

  const startGame = useCallback((categoryId: CategoryId) => {
    const card = generateCard(categoryId)
    setState({
      ...initialState,
      status: 'playing',
      category: categoryId,
      card,
      startedAt: Date.now(),
    })
  }, [])

  const fillSquare = useCallback((row: number, col: number, isAuto = false) => {
    setState(prev => {
      if (!prev.card || prev.status !== 'playing') return prev
      const square = prev.card.squares[row][col]
      if (square.isFilled) return prev

      const newSquares = prev.card.squares.map((r, ri) =>
        r.map((sq, ci) =>
          ri === row && ci === col
            ? { ...sq, isFilled: true, isAutoFilled: isAuto, filledAt: Date.now() }
            : sq
        )
      )
      const newCard = { ...prev.card, squares: newSquares }
      const winningLine = checkForBingo(newCard)
      const newFilledCount = square.isFreeSpace ? prev.filledCount : prev.filledCount + 1
      const newAlreadyFilled =
        isAuto && !square.isFreeSpace ? [...prev.alreadyFilled, square.word] : prev.alreadyFilled

      return {
        ...prev,
        card: newCard,
        filledCount: newFilledCount,
        alreadyFilled: newAlreadyFilled,
        winningLine: winningLine ?? prev.winningLine,
        winningWord: winningLine ? square.word : prev.winningWord,
        status: winningLine ? 'won' : prev.status,
        completedAt: winningLine ? Date.now() : prev.completedAt,
      }
    })
  }, [])

  const toggleSquare = useCallback((row: number, col: number) => {
    setState(prev => {
      if (!prev.card || prev.status !== 'playing') return prev
      const square = prev.card.squares[row][col]
      if (square.isFreeSpace) return prev
      if (square.isFilled && square.isAutoFilled) return prev
      if (square.isFilled && prev.winningLine?.squares.includes(square.id)) return prev

      const nowFilling = !square.isFilled
      const newSquares = prev.card.squares.map((r, ri) =>
        r.map((sq, ci) =>
          ri === row && ci === col
            ? { ...sq, isFilled: nowFilling, filledAt: nowFilling ? Date.now() : null }
            : sq
        )
      )
      const newCard = { ...prev.card, squares: newSquares }
      return {
        ...prev,
        card: newCard,
        filledCount: prev.filledCount + (nowFilling ? 1 : -1),
      }
    })
  }, [])

  const newCard = useCallback(() => {
    setState(prev => {
      if (!prev.category) return prev
      const card = generateCard(prev.category)
      return {
        ...initialState,
        status: 'playing',
        category: prev.category,
        card,
        startedAt: Date.now(),
      }
    })
  }, [])

  const resetGame = useCallback(() => {
    setState(initialState)
  }, [])

  const startListening = useCallback(() => {
    setState(prev => ({ ...prev, isListening: true }))
  }, [])

  const stopListening = useCallback(() => {
    setState(prev => ({ ...prev, isListening: false }))
  }, [])

  const appendTranscript = useCallback((text: string) => {
    setState(prev => ({
      ...prev,
      transcript: (prev.transcript + ' ' + text).slice(-2000).trim(),
    }))
  }, [])

  return {
    gameState: state,
    startGame,
    fillSquare,
    toggleSquare,
    newCard,
    resetGame,
    startListening,
    stopListening,
    appendTranscript,
  }
}
