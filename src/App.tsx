import { useState, useEffect } from 'react'
import { useGameContext } from './context/GameContext'
import LandingPage from './components/LandingPage'
import CategorySelect from './components/CategorySelect'
import GameBoard from './components/GameBoard'
import WinScreen from './components/WinScreen'
import ToastContainer from './components/ToastContainer'
import type { Screen } from './types'

function useFadeTransition(screen: Screen) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    setVisible(false)
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [screen])
  return visible
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing')
  const { gameState, resetGame } = useGameContext()
  const visible = useFadeTransition(screen)

  useEffect(() => {
    if (gameState.status === 'won' && screen === 'game') {
      setScreen('win')
    }
  }, [gameState.status, screen])

  return (
    <div
      className="transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {screen === 'landing' && (
        <LandingPage onNewGame={() => setScreen('category')} />
      )}
      {screen === 'category' && (
        <CategorySelect
          onSelectCategory={() => setScreen('game')}
          onBack={() => setScreen('landing')}
        />
      )}
      {screen === 'game' && (
        <GameBoard onChangeCategory={() => setScreen('category')} />
      )}
      {screen === 'win' && (
        <WinScreen
          onPlayAgain={() => {
            resetGame()
            setScreen('category')
          }}
          onNewGame={() => {
            resetGame()
            setScreen('landing')
          }}
        />
      )}
      <ToastContainer />
    </div>
  )
}
