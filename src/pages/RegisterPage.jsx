import { useState } from 'react'
import { useGameStore } from '../store/gameStore'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Tela de cadastro (primeira abertura): só nome e e-mail, nada além disso.
// O perfil é salvo localmente na hora; o envio ao banco acontece em segundo
// plano via App → syncProfile (e re-tenta nas próximas aberturas se falhar).
export default function RegisterPage() {
  const setProfile = useGameStore((s) => s.setProfile)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const valid = name.trim().length >= 2 && EMAIL_RE.test(email.trim())

  const submit = (e) => {
    e.preventDefault()
    if (!valid) return
    setProfile(name.trim(), email.trim().toLowerCase())
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 p-6">
      <div className="animate-drop text-6xl">🏋️</div>
      <h1 className="font-pixel text-center text-base leading-relaxed text-green-900 drop-shadow-sm">
        Jogo da Academia
      </h1>
      <p className="text-center text-sm font-bold text-stone-600">
        Treine de verdade, construa sua cidade
        <br />e colecione moradores.
      </p>

      <form
        onSubmit={submit}
        className="animate-pop flex w-full max-w-sm flex-col gap-3 rounded-2xl border-2 border-amber-900/20 bg-amber-50 p-4 shadow-xl"
      >
        <label className="text-xs font-extrabold text-stone-600">
          Seu nome
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            placeholder="Como te chamamos?"
            className="mt-1 w-full rounded-xl border-2 border-stone-200 bg-white px-3 py-2.5 text-sm font-bold text-stone-800 outline-none focus:border-green-400"
          />
        </label>
        <label className="text-xs font-extrabold text-stone-600">
          Seu e-mail
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={120}
            placeholder="voce@exemplo.com"
            className="mt-1 w-full rounded-xl border-2 border-stone-200 bg-white px-3 py-2.5 text-sm font-bold text-stone-800 outline-none focus:border-green-400"
          />
        </label>
        <button
          type="submit"
          disabled={!valid}
          className={`mt-1 rounded-xl py-3 font-pixel text-[11px] leading-relaxed text-white transition active:scale-95 ${
            valid ? 'border-b-4 border-green-800 bg-green-600' : 'bg-stone-300'
          }`}
        >
          🎮 Começar minha cidade
        </button>
        <p className="text-center text-[10px] leading-relaxed text-stone-400">
          Guardamos só isso: nome e e-mail.
          <br />
          Suas selfies de treino ficam apenas no seu aparelho. 🔒
        </p>
      </form>
    </div>
  )
}
