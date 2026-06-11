import { useEffect, useState } from 'react'

// Relógio reativo: re-renderiza o componente a cada `intervalMs`
// (usado para barras de progresso e contagem regressiva das obras)
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}
