import { useEffect, useState } from 'react'
import CityPage from './pages/CityPage'
import CheckinPage from './pages/CheckinPage'
import LootModal from './components/LootModal'
import Toast from './components/Toast'
import { useGameStore } from './store/gameStore'

export default function App() {
  // Protótipo sem router: alternância simples de view ('city' | 'checkin')
  const [view, setView] = useState('city')
  const tickConstructions = useGameStore((s) => s.tickConstructions)

  // Relógio global das obras: a cada segundo verifica se alguma construção
  // terminou (também roda na abertura do app, p/ obras que acabaram offline)
  useEffect(() => {
    tickConstructions()
    const id = setInterval(tickConstructions, 1000)
    return () => clearInterval(id)
  }, [tickConstructions])

  return (
    <div className="mx-auto min-h-dvh max-w-md bg-gradient-to-b from-sky-200 via-lime-100 to-lime-200 shadow-2xl">
      {view === 'city' ? (
        <CityPage onGoTrain={() => setView('checkin')} />
      ) : (
        <CheckinPage onDone={() => setView('city')} />
      )}
      <LootModal />
      <Toast />
    </div>
  )
}
