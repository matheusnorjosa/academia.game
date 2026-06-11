import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, Camera, MapPin, RefreshCcw } from 'lucide-react'
import { useGameStore } from '../store/gameStore'
import { getPosition, haversineMeters } from '../utils/geo'
import { hasCheckedInToday } from '../utils/time'

// Tela 2: verificação anti-enrolação.
// Regra de ouro: a foto SEMPRE vem da câmera ao vivo (getUserMedia).
// Nunca existe upload de galeria — é proibido por design.
export default function CheckinPage({ onDone }) {
  const gym = useGameStore((s) => s.gymLocation)
  const checkins = useGameStore((s) => s.checkins)
  const registerCheckin = useGameStore((s) => s.registerCheckin)
  const setGymLocation = useGameStore((s) => s.setGymLocation)
  const setToast = useGameStore((s) => s.setToast)

  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [cameraError, setCameraError] = useState(null)
  const [photo, setPhoto] = useState(null) // dataURL da selfie tirada
  const [gps, setGps] = useState({ status: 'asking' }) // asking | ok | far | error | no_gym
  const [simulate, setSimulate] = useState(false) // 🧪 modo teste p/ desenvolver sem estar na academia

  const alreadyDone = hasCheckedInToday(checkins)

  // ── Câmera frontal ao vivo ─────────────────────────────────
  useEffect(() => {
    if (alreadyDone) return
    let cancelled = false
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
      } catch {
        setCameraError(
          'Não foi possível acessar a câmera. Verifique as permissões do navegador.',
        )
      }
    }
    startCamera()
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [alreadyDone])

  // ── GPS: o jogador está dentro do raio da academia? ────────
  const checkGps = useCallback(async () => {
    if (gym.lat == null) {
      setGps({ status: 'no_gym' })
      return
    }
    setGps({ status: 'asking' })
    try {
      const pos = await getPosition()
      const distance = haversineMeters(
        pos.coords.latitude,
        pos.coords.longitude,
        gym.lat,
        gym.lng,
      )
      // FUTURO: refazer esta validação no servidor para evitar mock de GPS
      setGps({ status: distance <= gym.radius ? 'ok' : 'far', distance: Math.round(distance) })
    } catch {
      setGps({ status: 'error' })
    }
  }, [gym])

  useEffect(() => {
    if (!alreadyDone) checkGps()
  }, [checkGps, alreadyDone])

  // Cadastra/corrige a academia para a posição atual do jogador.
  // Útil para afinar o ponto geocodificado estando dentro da academia.
  const registerGymHere = async () => {
    try {
      const pos = await getPosition()
      setGymLocation(pos.coords.latitude, pos.coords.longitude, gym.radius)
      setToast('📍 Ponto da academia atualizado para sua posição!')
      // FUTURO: tela própria com mapa para buscar/ajustar o ponto e o raio
    } catch {
      setToast('Não consegui ler o GPS. Ative a localização e tente de novo.')
    }
  }

  // Captura um frame do vídeo → thumbnail JPEG leve (cabe no localStorage)
  const takePhoto = () => {
    const video = videoRef.current
    if (!video || !video.videoWidth) return
    const canvas = document.createElement('canvas')
    const width = 480
    canvas.width = width
    canvas.height = Math.round((video.videoHeight / video.videoWidth) * width)
    const ctx = canvas.getContext('2d')
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1) // espelha, igual ao preview da selfie
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    setPhoto(canvas.toDataURL('image/jpeg', 0.6))
  }

  const gpsOk = gps.status === 'ok' || simulate

  const confirm = () => {
    if (!photo || !gpsOk) return
    // FUTURO: validação extra da foto por IA (é mesmo uma academia? é a mesma pessoa?)
    registerCheckin(photo)
    onDone() // volta pra cidade — o LootModal abre sozinho via pendingLoot
  }

  // Já treinou hoje: bloqueia novo check-in recompensado
  if (alreadyDone) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="text-6xl">✅</div>
        <h2 className="font-pixel text-sm leading-relaxed text-green-800">
          Treino de hoje já validado!
        </h2>
        <p className="text-sm text-stone-500">
          Volte amanhã para mais materiais. Que tal uma corrida extra para ganhar ⚡?
        </p>
        <button
          onClick={onDone}
          className="rounded-xl border-b-4 border-green-800 bg-green-600 px-6 py-3 font-extrabold text-white active:scale-95"
        >
          Voltar à cidade
        </button>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-dvh flex-col bg-black">
      {/* Preview da câmera (sempre montado p/ não perder o stream) */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 h-full w-full -scale-x-100 object-cover"
      />
      {photo && (
        <img
          src={photo}
          alt="Sua selfie de treino"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      {cameraError && !photo && (
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm font-bold text-white/80">
          {cameraError}
        </div>
      )}

      {/* Topo: voltar + status do GPS */}
      <div className="relative z-10 flex flex-col gap-2 p-3">
        <div className="flex items-center justify-between">
          <button
            onClick={onDone}
            aria-label="Voltar"
            className="rounded-full bg-black/50 p-2 text-white active:scale-90"
          >
            <ArrowLeft size={20} />
          </button>
          <GpsChip gps={gps} radius={gym.radius} onRetry={checkGps} />
        </div>

        {gym.lat != null && (
          <p className="self-end rounded-full bg-black/40 px-3 py-1 text-[10px] font-bold text-white/80">
            📍 {gym.name ?? 'Minha academia'}
          </p>
        )}

        {(gps.status === 'no_gym' || gps.status === 'far') && (
          <button
            onClick={registerGymHere}
            className="rounded-xl bg-amber-400 px-4 py-3 text-sm font-extrabold text-amber-950 shadow-lg active:scale-95"
          >
            {gps.status === 'no_gym'
              ? '📍 Estou na academia agora — cadastrar este local'
              : '📍 Estou na academia — corrigir o ponto p/ minha posição'}
          </button>
        )}

        {(gps.status === 'far' || gps.status === 'error') && (
          <label className="flex items-center gap-2 self-start rounded-full bg-black/50 px-3 py-1.5 text-xs font-bold text-white">
            <input
              type="checkbox"
              checked={simulate}
              onChange={(e) => setSimulate(e.target.checked)}
            />
            🧪 Modo teste (simular GPS)
          </label>
        )}
      </div>

      {/* Rodapé: tirar foto / confirmar */}
      <div className="relative z-10 mt-auto flex flex-col items-center gap-3 p-5">
        {!photo ? (
          <>
            <p className="rounded-full bg-black/50 px-4 py-1.5 text-xs font-bold text-white">
              Tire uma selfie para validar o treino 🤳
            </p>
            <button
              onClick={takePhoto}
              disabled={!!cameraError}
              aria-label="Tirar foto"
              className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-white/30 backdrop-blur active:scale-90 disabled:opacity-40"
            >
              <Camera size={32} className="text-white" />
            </button>
          </>
        ) : (
          <div className="flex w-full gap-2">
            <button
              onClick={() => setPhoto(null)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/20 py-3 font-extrabold text-white backdrop-blur active:scale-95"
            >
              <RefreshCcw size={18} /> Repetir
            </button>
            <button
              onClick={confirm}
              disabled={!gpsOk}
              className={`flex-[2] rounded-xl py-3 font-pixel text-[11px] leading-relaxed text-white transition active:scale-95 ${
                gpsOk ? 'border-b-4 border-green-800 bg-green-600' : 'bg-stone-500/70'
              }`}
            >
              {gpsOk ? '✅ Validar treino!' : 'Aguardando GPS...'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function GpsChip({ gps, radius, onRetry }) {
  const map = {
    asking: { text: 'Lendo GPS…', cls: 'bg-black/50 text-white' },
    ok: { text: 'Na academia ✅', cls: 'bg-green-500 text-white' },
    far: { text: `Fora do raio (${gps.distance}m > ${radius}m)`, cls: 'bg-red-500 text-white' },
    error: { text: 'GPS indisponível', cls: 'bg-orange-500 text-white' },
    no_gym: { text: 'Academia não cadastrada', cls: 'bg-amber-400 text-amber-950' },
  }
  const m = map[gps.status]
  return (
    <button
      onClick={onRetry}
      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-extrabold shadow ${m.cls}`}
    >
      <MapPin size={14} /> {m.text}
    </button>
  )
}
