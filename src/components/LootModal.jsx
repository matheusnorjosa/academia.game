import { useGameStore } from '../store/gameStore'

const ROWS = [
  { key: 'wood', emoji: '🪵', label: 'Madeira' },
  { key: 'stone', emoji: '🪨', label: 'Pedra' },
  { key: 'iron', emoji: '🔩', label: 'Ferro' },
]

// Tela 3: recompensa pós-treino estilo RPG. Aparece sozinha quando há
// `pendingLoot` no store (setado pelo registerCheckin) e só credita os
// materiais quando o jogador clica em "Coletar".
export default function LootModal() {
  const pendingLoot = useGameStore((s) => s.pendingLoot)
  const collectLoot = useGameStore((s) => s.collectLoot)

  if (!pendingLoot) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="animate-pop w-full max-w-sm rounded-3xl border-4 border-yellow-400 bg-amber-50 p-5 text-center shadow-2xl">
        <h2 className="font-pixel text-sm leading-relaxed text-green-800">
          Treino validado! 💪
        </h2>
        <p className="mt-1 text-xs text-stone-500">Sua cidade agradece. Materiais recebidos:</p>
        <div className="my-4 flex flex-col gap-2">
          {ROWS.map((r, i) => (
            <div
              key={r.key}
              className="animate-drop flex items-center justify-between rounded-xl bg-white px-4 py-2 shadow"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <span className="text-2xl">{r.emoji}</span>
              <span className="text-sm font-bold text-stone-600">{r.label}</span>
              <span className="font-pixel text-xs text-green-700">+{pendingLoot[r.key]}</span>
            </div>
          ))}
        </div>
        <button
          onClick={collectLoot}
          className="w-full rounded-xl border-b-4 border-green-800 bg-green-600 py-3 font-pixel text-xs text-white active:scale-95"
        >
          Coletar 🎁
        </button>
      </div>
    </div>
  )
}
