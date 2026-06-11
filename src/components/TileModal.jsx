import { useGameStore } from '../store/gameStore'
import { getBuilding } from '../data/buildings'
import { formatDuration } from '../utils/time'
import { useNow } from '../utils/useNow'
import Modal from './Modal'

// Detalhe de um prédio: se em obras → progresso + botão de acelerar (turbina);
// se pronto → cartão do morador (NPC) com a frase motivacional.
export default function TileModal({ uid, onClose }) {
  const building = useGameStore((s) => s.buildings.find((b) => b.uid === uid))
  const turbines = useGameStore((s) => s.player.turbines)
  const useTurbine = useGameStore((s) => s.useTurbine)
  const now = useNow(1000)

  if (!building) return null
  const type = getBuilding(building.typeId)

  if (building.status === 'building') {
    const remaining = building.finishesAt - now
    const pct = Math.min(
      100,
      ((now - building.startedAt) / (building.finishesAt - building.startedAt)) * 100,
    )
    return (
      <Modal title={`🚧 ${type.name}`} onClose={onClose}>
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="text-5xl opacity-50 grayscale">{type.emoji}</div>
          <p className="text-sm font-bold text-stone-600">
            Pronto em <span className="text-orange-600">{formatDuration(remaining)}</span>
          </p>
          <div className="h-3 w-full overflow-hidden rounded-full bg-stone-200">
            <div
              className="h-full rounded-full bg-yellow-400 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <button
            onClick={() => useTurbine(uid)}
            disabled={turbines < 1}
            className={`w-full rounded-xl py-3 text-sm font-extrabold text-white transition ${
              turbines > 0
                ? 'border-b-4 border-sky-700 bg-sky-500 active:scale-95'
                : 'bg-stone-300'
            }`}
          >
            ⚡ Acelerar 1h (você tem {turbines})
          </button>
          {turbines === 0 && (
            <p className="text-xs text-stone-500">
              Corra ou pedale fora da academia para ganhar ⚡ turbinas!
            </p>
          )}
        </div>
      </Modal>
    )
  }

  return (
    <Modal title={type.name} onClose={onClose}>
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="animate-drop text-6xl">{type.npc.emoji}</div>
        <p className="font-pixel text-[10px] leading-relaxed text-green-800">{type.npc.name}</p>
        <p className="rounded-xl bg-white p-3 text-sm italic text-stone-600">
          “{type.npc.quote}”
        </p>
        <p className="text-xs text-stone-400">{type.desc}</p>
      </div>
    </Modal>
  )
}
