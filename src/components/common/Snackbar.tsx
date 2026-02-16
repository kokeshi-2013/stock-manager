import { useEffect } from 'react'
import { useUIStore } from '../../store/uiStore'

export function Snackbar() {
  const snackbar = useUIStore((s) => s.snackbar)
  const hideSnackbar = useUIStore((s) => s.hideSnackbar)

  useEffect(() => {
    if (!snackbar) return
    const timer = setTimeout(hideSnackbar, 3000)
    return () => clearTimeout(timer)
  }, [snackbar, hideSnackbar])

  if (!snackbar) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-gray-800 text-white rounded-lg shadow-lg px-4 py-3 flex items-center justify-between">
        <span className="text-sm">{snackbar.message}</span>
        {snackbar.action && (
          <button
            onClick={() => {
              snackbar.action?.()
              hideSnackbar()
            }}
            className="text-primary-light font-medium text-sm ml-4 whitespace-nowrap"
          >
            元に戻す
          </button>
        )}
      </div>
    </div>
  )
}
