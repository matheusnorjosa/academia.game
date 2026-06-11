import { GRID_SLOTS } from '../store/gameStore'
import { getBuilding } from '../data/buildings'

// O terreno da cidade: grid 5x5 estilo fazendinha top-down.
// Tile vazio → abre o menu de construção; tile ocupado → abre detalhes.
export default function CityGrid({ buildings, now, onTileClick }) {
  const bySlot = new Map(buildings.map((b) => [b.slot, b]))

  return (
    <div className="grid grid-cols-5 gap-1.5 rounded-2xl border-4 border-amber-900/30 bg-lime-700/20 p-2">
      {Array.from({ length: GRID_SLOTS }, (_, slot) => {
        const b = bySlot.get(slot)
        const alt = (slot + Math.floor(slot / 5)) % 2 === 0 // xadrez de grama
        const grass = alt ? 'bg-grass-1' : 'bg-grass-2'

        if (!b) {
          return (
            <button
              key={slot}
              onClick={() => onTileClick(slot)}
              aria-label={`Terreno vazio ${slot + 1}`}
              className={`${grass} group flex aspect-square items-center justify-center rounded-lg border-b-4 border-black/10 transition active:scale-95`}
            >
              <span className="text-lg font-bold text-white/0 transition group-hover:text-white/70 group-active:text-white/70">
                ＋
              </span>
            </button>
          )
        }

        const type = getBuilding(b.typeId)
        const inProgress = b.status === 'building'
        const pct = inProgress
          ? Math.min(100, ((now - b.startedAt) / (b.finishesAt - b.startedAt)) * 100)
          : 100

        return (
          <button
            key={slot}
            onClick={() => onTileClick(slot)}
            aria-label={type.name}
            className={`${grass} relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border-b-4 border-black/10 transition active:scale-95`}
          >
            <span className={`text-2xl ${inProgress ? 'opacity-40 grayscale' : 'animate-drop'}`}>
              {type.emoji}
            </span>
            {inProgress && (
              <>
                <span className="absolute right-0.5 top-0.5 text-[10px]">🚧</span>
                <span className="absolute inset-x-1 bottom-1 h-1 overflow-hidden rounded bg-black/30">
                  <span
                    className="block h-full rounded bg-yellow-300"
                    style={{ width: `${pct}%` }}
                  />
                </span>
              </>
            )}
          </button>
        )
      })}
    </div>
  )
}
