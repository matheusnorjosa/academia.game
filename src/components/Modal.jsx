import { X } from 'lucide-react'

// Casca compartilhada dos modais: overlay escuro + cartão estilo "madeira clara"
export default function Modal({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 p-3 sm:items-center"
      onClick={onClose}
    >
      <div
        className="animate-pop w-full max-w-md rounded-2xl border-2 border-amber-900/20 bg-amber-50 p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-pixel text-xs leading-relaxed text-stone-800">{title}</h2>
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Fechar"
              className="shrink-0 rounded-full bg-stone-200 p-1.5 text-stone-600 active:scale-90"
            >
              <X size={16} />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}
