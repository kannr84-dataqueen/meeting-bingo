import { useGameContext } from '../context/GameContext'
import { Toast } from './ui/Toast'

export default function ToastContainer() {
  const { toasts, dismissToast } = useGameContext()

  if (toasts.length === 0) return null

  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-72 max-w-[calc(100vw-2rem)]"
    >
      {toasts.map(t => (
        <Toast key={t.id} toast={t} onDismiss={dismissToast} />
      ))}
    </div>
  )
}
