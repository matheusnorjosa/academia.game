import { BUILDINGS } from '../data/buildings'
import { useGameStore } from '../store/gameStore'
import Modal from './Modal'

// O álbum de moradores (elemento de coleção/RPG): NPCs desbloqueados
// aparecem com nome e frase; os demais ficam como silhueta "???" com a
// dica de qual prédio construir para atraí-los.
export default function AlbumModal({ onClose }) {
  const npcs = useGameStore((s) => s.npcs)

  return (
    <Modal title={`👥 Moradores (${npcs.length}/${BUILDINGS.length})`} onClose={onClose}>
      <div className="grid max-h-[60vh] grid-cols-2 gap-2 overflow-y-auto pr-1">
        {BUILDINGS.map((b) => {
          const unlocked = npcs.includes(b.id)
          return unlocked ? (
            <div
              key={b.id}
              className="flex flex-col items-center gap-1 rounded-xl border-2 border-violet-200 bg-white p-3 text-center"
            >
              <span className="text-4xl">{b.npc.emoji}</span>
              <p className="text-xs font-extrabold text-stone-700">{b.npc.name}</p>
              <p className="text-[10px] italic text-stone-500">“{b.npc.quote}”</p>
            </div>
          ) : (
            <div
              key={b.id}
              className="flex flex-col items-center gap-1 rounded-xl border-2 border-dashed border-stone-300 bg-stone-100 p-3 text-center"
            >
              <span className="text-4xl opacity-30">❓</span>
              <p className="text-xs font-extrabold text-stone-400">???</p>
              <p className="text-[10px] text-stone-400">Construa: {b.name}</p>
            </div>
          )
        })}
      </div>
    </Modal>
  )
}
