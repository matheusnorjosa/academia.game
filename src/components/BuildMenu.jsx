import { BUILDINGS } from '../data/buildings'
import { useGameStore, canAfford } from '../store/gameStore'
import { buildTimeLabel } from '../utils/time'
import Modal from './Modal'

const COST_EMOJI = { wood: '🪵', stone: '🪨', iron: '🔩' }

// Tela 4: menu de construção — lista o catálogo, mostra custo/tempo/NPC
// e desconta os materiais do store ao construir no slot escolhido.
export default function BuildMenu({ slot, onClose }) {
  const player = useGameStore((s) => s.player)
  const startBuilding = useGameStore((s) => s.startBuilding)

  const handleBuild = (typeId) => {
    if (startBuilding(typeId, slot)) onClose()
  }

  return (
    <Modal title="🔨 Construir" onClose={onClose}>
      <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto pr-1">
        {BUILDINGS.map((b) => {
          const affordable = canAfford(player, b.cost)
          return (
            <div
              key={b.id}
              className={`flex items-center gap-3 rounded-xl border-2 p-2 ${
                affordable
                  ? 'border-green-300 bg-white'
                  : 'border-stone-200 bg-stone-100 opacity-70'
              }`}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-lime-200 text-2xl">
                {b.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold text-stone-800">{b.name}</p>
                <p className="truncate text-[11px] text-stone-500">
                  Atrai: {b.npc.emoji} {b.npc.name.split(',')[0]}
                </p>
                <div className="mt-0.5 flex flex-wrap gap-x-2 text-[11px] font-bold">
                  {Object.entries(b.cost).map(
                    ([k, v]) =>
                      v > 0 && (
                        <span key={k} className={player[k] >= v ? 'text-stone-600' : 'text-red-500'}>
                          {COST_EMOJI[k]} {v}
                        </span>
                      ),
                  )}
                  <span className="text-sky-600">{buildTimeLabel(b.buildSeconds)}</span>
                </div>
              </div>
              <button
                onClick={() => handleBuild(b.id)}
                disabled={!affordable}
                className={`shrink-0 rounded-lg px-3 py-2 text-xs font-extrabold text-white transition ${
                  affordable
                    ? 'border-b-2 border-green-800 bg-green-600 active:scale-95'
                    : 'bg-stone-300'
                }`}
              >
                Construir
              </button>
            </div>
          )
        })}
      </div>
    </Modal>
  )
}
