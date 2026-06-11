import { useState } from 'react'
import { Activity, Users } from 'lucide-react'
import { useGameStore } from '../store/gameStore'
import { useNow } from '../utils/useNow'
import { hasCheckedInToday, currentStreak } from '../utils/time'
import ResourceBar from '../components/ResourceBar'
import CityGrid from '../components/CityGrid'
import BuildMenu from '../components/BuildMenu'
import TileModal from '../components/TileModal'
import AlbumModal from '../components/AlbumModal'
import ExtraActivityModal from '../components/ExtraActivityModal'

// Tela 1: o mapa da cidade — recursos no topo, grid 5x5 no centro,
// barra de ações fixa no rodapé ("Fui treinar!" + Extra + Álbum).
export default function CityPage({ onGoTrain }) {
  const buildings = useGameStore((s) => s.buildings)
  const checkins = useGameStore((s) => s.checkins)
  const player = useGameStore((s) => s.player)
  const profile = useGameStore((s) => s.profile)
  const now = useNow(1000)

  const [buildSlot, setBuildSlot] = useState(null) // slot vazio clicado
  const [selectedUid, setSelectedUid] = useState(null) // prédio clicado
  const [showAlbum, setShowAlbum] = useState(false)
  const [showExtra, setShowExtra] = useState(false)

  const trainedToday = hasCheckedInToday(checkins)
  const streak = currentStreak(checkins)
  const inProgress = buildings.filter((b) => b.status === 'building').length
  const isEmptyCity = buildings.length === 0 && player.wood === 0

  const handleTile = (slot) => {
    const b = buildings.find((x) => x.slot === slot)
    if (b) setSelectedUid(b.uid)
    else setBuildSlot(slot)
  }

  return (
    <div className="flex min-h-dvh flex-col gap-3 p-3 pb-28">
      <header className="flex items-center justify-between">
        <h1 className="font-pixel text-sm leading-relaxed text-green-900 drop-shadow-sm">
          Jogo da Academia
        </h1>
        <div className="rounded-full border-2 border-orange-300 bg-orange-100 px-3 py-1 text-sm font-extrabold text-orange-700">
          🔥 {streak} {streak === 1 ? 'dia' : 'dias'}
        </div>
      </header>

      <ResourceBar />

      {isEmptyCity && (
        <div className="rounded-2xl border-2 border-dashed border-green-700/40 bg-white/60 p-3 text-center text-sm font-bold text-green-900">
          Bem-vindo(a), {profile?.name?.split(' ')[0] ?? 'atleta'}! Sua cidade está
          vazia — faça seu primeiro check-in na academia para ganhar materiais. 💪
        </div>
      )}

      <CityGrid buildings={buildings} now={now} onTileClick={handleTile} />

      {inProgress > 0 && (
        <div className="flex items-center justify-between rounded-xl border-2 border-yellow-300 bg-yellow-100 px-3 py-2 text-sm font-bold text-yellow-800">
          <span>
            🚧 {inProgress} obra{inProgress > 1 ? 's' : ''} em andamento
          </span>
          <span>⚡ {player.turbines} p/ acelerar</span>
        </div>
      )}

      {/* Barra de ações fixa no rodapé */}
      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md p-3">
        <div className="flex gap-2 rounded-2xl border-2 border-amber-900/20 bg-amber-50/95 p-2 shadow-2xl backdrop-blur">
          <button
            onClick={() => setShowExtra(true)}
            className="flex flex-col items-center justify-center rounded-xl bg-sky-100 px-3 py-2 text-sky-700 active:scale-95"
          >
            <Activity size={20} />
            <span className="text-[10px] font-extrabold">Extra</span>
          </button>
          <button
            onClick={onGoTrain}
            disabled={trainedToday}
            className={`flex-1 rounded-xl py-3 font-pixel text-[11px] leading-relaxed text-white shadow-lg transition active:scale-95 ${
              trainedToday
                ? 'bg-stone-400'
                : 'border-b-4 border-green-800 bg-green-600'
            }`}
          >
            {trainedToday ? '✅ Treino feito!' : '📸 Fui treinar!'}
          </button>
          <button
            onClick={() => setShowAlbum(true)}
            className="flex flex-col items-center justify-center rounded-xl bg-violet-100 px-3 py-2 text-violet-700 active:scale-95"
          >
            <Users size={20} />
            <span className="text-[10px] font-extrabold">Álbum</span>
          </button>
        </div>
      </div>

      {buildSlot !== null && <BuildMenu slot={buildSlot} onClose={() => setBuildSlot(null)} />}
      {selectedUid && <TileModal uid={selectedUid} onClose={() => setSelectedUid(null)} />}
      {showAlbum && <AlbumModal onClose={() => setShowAlbum(false)} />}
      {showExtra && <ExtraActivityModal onClose={() => setShowExtra(false)} />}
    </div>
  )
}
