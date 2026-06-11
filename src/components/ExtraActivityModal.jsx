import { useGameStore, EXTRA_ACTIVITY_TURBINES } from '../store/gameStore'
import Modal from './Modal'

// Atividade extra (corrida/pedalada) = "tempo skip" das obras.
// No protótipo é um botão de simulação; a validação real entra depois.
export default function ExtraActivityModal({ onClose }) {
  const addTurbines = useGameStore((s) => s.addTurbines)

  const handleSimulate = () => {
    addTurbines(EXTRA_ACTIVITY_TURBINES)
    onClose()
  }

  return (
    <Modal title="🏃 Atividade Extra" onClose={onClose}>
      <div className="flex flex-col gap-3 text-sm text-stone-600">
        <p>
          Correu ou pedalou fora da academia? Isso vale <strong>⚡ turbinas</strong> — cada
          uma pula <strong>1 hora</strong> de qualquer obra em andamento.
        </p>
        {/* FUTURO: conectar com a API do Strava (ou ler o trajeto com
            navigator.geolocation.watchPosition) para validar distância e
            tempo reais da corrida/pedalada antes de dar a recompensa. */}
        <button
          onClick={handleSimulate}
          className="rounded-xl border-b-4 border-sky-700 bg-sky-500 py-3 font-extrabold text-white active:scale-95"
        >
          🧪 Simular corrida de 5km (+{EXTRA_ACTIVITY_TURBINES} ⚡)
        </button>
        <p className="text-center text-xs text-stone-400">
          No protótipo a atividade é simulada — a integração real (Strava/GPS) entra depois.
        </p>
      </div>
    </Modal>
  )
}
