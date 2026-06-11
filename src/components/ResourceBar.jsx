import { useGameStore } from '../store/gameStore'

const ITEMS = [
  { key: 'wood', emoji: '🪵', label: 'Madeira' },
  { key: 'stone', emoji: '🪨', label: 'Pedra' },
  { key: 'iron', emoji: '🔩', label: 'Ferro' },
  { key: 'turbines', emoji: '⚡', label: 'Turbinas' },
]

export default function ResourceBar() {
  const player = useGameStore((s) => s.player)
  return (
    <div className="grid grid-cols-4 gap-2">
      {ITEMS.map((it) => (
        <div
          key={it.key}
          title={it.label}
          className="flex items-center justify-center gap-1 rounded-xl border-2 border-amber-900/20 bg-amber-100 px-2 py-1.5 shadow-sm"
        >
          <span className="text-base">{it.emoji}</span>
          <span className="text-sm font-extrabold text-stone-700">{player[it.key]}</span>
        </div>
      ))}
    </div>
  )
}
