import { useState } from 'react'
import { useGameContext } from '../context/GameContext'
import { Button } from './ui/Button'
import { Dialog } from './ui/Dialog'
import MicPermissionModal, {
  hasMicPromptBeenSeen,
  markMicPromptSeen,
} from './MicPermissionModal'

interface GameControlsProps {
  onChangeCategory: () => void
}

export default function GameControls({ onChangeCategory }: GameControlsProps) {
  const { gameState, newCard, resetGame, speechIsSupported, isListening, startListening, stopListening } =
    useGameContext()
  const [showNewCardDialog, setShowNewCardDialog] = useState(false)
  const [showMicModal, setShowMicModal] = useState(false)

  function handleNewCard() {
    if (gameState.filledCount > 0) {
      setShowNewCardDialog(true)
    } else {
      newCard()
    }
  }

  function handleConfirmNewCard() {
    setShowNewCardDialog(false)
    newCard()
  }

  function handleChangeCategory() {
    resetGame()
    onChangeCategory()
  }

  function handleListenClick() {
    if (isListening) {
      stopListening()
    } else if (!hasMicPromptBeenSeen()) {
      setShowMicModal(true)
    } else {
      startListening()
    }
  }

  return (
    <div className="flex items-center justify-between gap-2 px-4 py-3 bg-white border-t border-gray-200">
      <Button variant="ghost" size="sm" onClick={handleChangeCategory}>
        ← Categories
      </Button>

      <Button variant="secondary" size="sm" onClick={handleNewCard}>
        New Card
      </Button>

      {speechIsSupported && (
        <Button
          variant={isListening ? 'secondary' : 'primary'}
          size="sm"
          onClick={handleListenClick}
          aria-pressed={isListening}
        >
          {isListening ? '⏹ Stop' : '🎤 Listen'}
        </Button>
      )}

      <Dialog
        isOpen={showNewCardDialog}
        onClose={() => setShowNewCardDialog(false)}
        title="New Card?"
      >
        <p className="text-sm mb-4" style={{ color: '#374151' }}>
          Start a new card? Your current progress will be lost.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowNewCardDialog(false)}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleConfirmNewCard}>
            New Card
          </Button>
        </div>
      </Dialog>

      <MicPermissionModal
        isOpen={showMicModal}
        onAllowMic={() => {
          markMicPromptSeen()
          setShowMicModal(false)
          startListening()
        }}
        onPlayManually={() => {
          markMicPromptSeen()
          setShowMicModal(false)
        }}
      />
    </div>
  )
}
