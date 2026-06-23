import { Dialog } from './ui/Dialog'
import { Button } from './ui/Button'

const MIC_PROMPT_KEY = 'meeting-bingo-mic-seen'

export function hasMicPromptBeenSeen(): boolean {
  try {
    return localStorage.getItem(MIC_PROMPT_KEY) === 'true'
  } catch {
    return false
  }
}

export function markMicPromptSeen(): void {
  try {
    localStorage.setItem(MIC_PROMPT_KEY, 'true')
  } catch {
    // localStorage unavailable
  }
}

interface MicPermissionModalProps {
  isOpen: boolean
  onAllowMic: () => void
  onPlayManually: () => void
}

export default function MicPermissionModal({
  isOpen,
  onAllowMic,
  onPlayManually,
}: MicPermissionModalProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onPlayManually} title="Enable Microphone?">
      <p className="text-sm mb-5" style={{ color: '#374151' }}>
        Meeting Bingo uses your microphone to detect buzzwords automatically. Audio is
        processed locally — never recorded or sent anywhere.
      </p>
      <div className="flex flex-col gap-2">
        <Button variant="primary" size="md" onClick={onAllowMic} className="w-full">
          Allow Microphone
        </Button>
        <Button variant="ghost" size="md" onClick={onPlayManually} className="w-full">
          Play Manually
        </Button>
      </div>
    </Dialog>
  )
}
