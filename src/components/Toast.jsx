import { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'

// Avisos rápidos do jogo (obra concluída, turbinas ganhas etc.)
export default function Toast() {
  const toast = useGameStore((s) => s.toast)
  const clearToast = useGameStore((s) => s.clearToast)

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(clearToast, 3500)
    return () => clearTimeout(id)
  }, [toast, clearToast])

  if (!toast) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4">
      <div className="animate-pop rounded-full border-2 border-amber-900/20 bg-stone-800/95 px-4 py-2 text-center text-xs font-bold text-white shadow-xl">
        {toast}
      </div>
    </div>
  )
}
