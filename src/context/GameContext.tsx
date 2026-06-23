import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { useGame } from '../hooks/useGame'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { detectWordsWithAliases } from '../lib/wordDetector'
import { getCardWords } from '../lib/cardGenerator'
import type { GameState, CategoryId, Toast } from '../types'

interface GameContextType {
  // Game state and mutations
  gameState: GameState
  startGame: (categoryId: CategoryId) => void
  fillSquare: (row: number, col: number, isAuto?: boolean) => void
  toggleSquare: (row: number, col: number) => void
  newCard: () => void
  resetGame: () => void
  appendTranscript: (text: string) => void
  // Speech
  speechIsSupported: boolean
  isListening: boolean
  transcript: string
  interimTranscript: string
  speechError: string | null
  lastDetectedWords: string[]
  startListening: () => void
  stopListening: () => void
  // Toasts
  toasts: Toast[]
  addToast: (message: string, type: Toast['type'], duration?: number) => void
  dismissToast: (id: string) => void
}

const GameContext = createContext<GameContextType | null>(null)

export function GameContextProvider({ children }: { children: React.ReactNode }) {
  const game = useGame()
  const speech = useSpeechRecognition()
  const [toasts, setToasts] = useState<Toast[]>([])
  const [lastDetectedWords, setLastDetectedWords] = useState<string[]>([])

  // Ref to latest game state — avoids stale closures in speech callback
  const gameStateRef = useRef(game.gameState)
  useEffect(() => {
    gameStateRef.current = game.gameState
  }, [game.gameState])

  // Stable refs for game callbacks so speech handler doesn't go stale
  const fillSquareRef = useRef(game.fillSquare)
  useEffect(() => {
    fillSquareRef.current = game.fillSquare
  }, [game.fillSquare])

  const addToast = useCallback((message: string, type: Toast['type'], duration = 3000) => {
    const toast: Toast = {
      id: Math.random().toString(36).slice(2),
      message,
      type,
      expiresAt: Date.now() + duration,
    }
    setToasts(prev => [...prev, toast])
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // Show toast when mic is denied (only once per session)
  const micDeniedShown = useRef(false)
  useEffect(() => {
    if (speech.error === 'not-allowed' && !micDeniedShown.current) {
      micDeniedShown.current = true
      addToast('Microphone access denied — playing in manual mode', 'error')
    }
  }, [speech.error, addToast])

  // Destructure stable callbacks to satisfy exhaustive-deps
  const { startListening: gameStartListening, stopListening: gameStopListening } = game
  const { startListening: speechStartListening } = speech

  // Mirror speech isListening into gameState
  useEffect(() => {
    if (speech.isListening) {
      gameStartListening()
    } else {
      gameStopListening()
    }
  }, [speech.isListening, gameStartListening, gameStopListening])

  // Handle a finalized speech transcript chunk
  const handleSpeechResult = useCallback((finalText: string) => {
    const { card, alreadyFilled, status } = gameStateRef.current
    if (!card || status !== 'playing') return

    const cardWords = getCardWords(card)
    const detected = detectWordsWithAliases(finalText, cardWords, alreadyFilled)
    setLastDetectedWords(detected)

    for (const word of detected) {
      const sq = card.squares.flat().find(s => s.word === word && !s.isFilled)
      if (sq) {
        fillSquareRef.current(sq.row, sq.col, true)
      }
    }
  }, [])

  const startListening = useCallback(() => {
    speechStartListening(handleSpeechResult)
  }, [speechStartListening, handleSpeechResult])

  const value: GameContextType = {
    gameState: game.gameState,
    startGame: game.startGame,
    fillSquare: game.fillSquare,
    toggleSquare: game.toggleSquare,
    newCard: game.newCard,
    resetGame: game.resetGame,
    appendTranscript: game.appendTranscript,
    speechIsSupported: speech.isSupported,
    isListening: speech.isListening,
    transcript: speech.transcript,
    interimTranscript: speech.interimTranscript,
    speechError: speech.error,
    lastDetectedWords,
    startListening,
    stopListening: speech.stopListening,
    toasts,
    addToast,
    dismissToast,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGameContext(): GameContextType {
  const ctx = useContext(GameContext)
  if (!ctx) {
    throw new Error('useGameContext must be used within a GameContextProvider')
  }
  return ctx
}
