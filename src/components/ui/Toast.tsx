import { useEffect, useState } from 'react'
import { cn } from '../../lib/utils'
import type { Toast as ToastType } from '../../types'

interface ToastProps {
  toast: ToastType
  onDismiss: (id: string) => void
}

const variantClasses: Record<ToastType['type'], string> = {
  success: 'bg-green-50 border-green-400 text-green-800',
  info: 'bg-blue-50 border-blue-400 text-blue-800',
  warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
  error: 'bg-red-50 border-red-400 text-red-800',
}

function Toast({ toast, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const showTimer = requestAnimationFrame(() => setVisible(true))

    const remaining = toast.expiresAt - Date.now()
    const hideTimer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onDismiss(toast.id), 300)
    }, Math.max(remaining, 0))

    return () => {
      cancelAnimationFrame(showTimer)
      clearTimeout(hideTimer)
    }
  }, [toast.id, toast.expiresAt, onDismiss])

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        'flex items-start gap-3 rounded-lg border px-4 py-3 shadow-md transition-all duration-300',
        variantClasses[toast.type],
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      )}
    >
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => {
          setVisible(false)
          setTimeout(() => onDismiss(toast.id), 300)
        }}
        aria-label="Dismiss notification"
        className="shrink-0 text-current opacity-60 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current rounded"
      >
        ×
      </button>
    </div>
  )
}

export { Toast }
export type { ToastProps }
