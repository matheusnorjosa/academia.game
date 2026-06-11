// Chave de dia local (AAAA-MM-DD) — usa fuso do aparelho, não UTC
export const todayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export const hasCheckedInToday = (checkins) =>
  checkins.some((c) => c.date === todayKey())

// Sequência de dias consecutivos de treino (streak 🔥)
export function currentStreak(checkins) {
  const days = new Set(checkins.map((c) => c.date))
  const d = new Date()
  // se hoje ainda não treinou, a sequência válida termina ontem
  if (!days.has(todayKey(d))) d.setDate(d.getDate() - 1)
  let streak = 0
  while (days.has(todayKey(d))) {
    streak += 1
    d.setDate(d.getDate() - 1)
  }
  return streak
}

export function formatDuration(ms) {
  if (ms <= 0) return '0s'
  const total = Math.ceil(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}min`
  if (m > 0) return `${m}min ${String(s).padStart(2, '0')}s`
  return `${s}s`
}

export const buildTimeLabel = (seconds) =>
  seconds === 0 ? '⚡ instantâneo' : `⏱ ${formatDuration(seconds * 1000)}`
