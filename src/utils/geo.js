// Distância Haversine em metros entre duas coordenadas (lat/lng em graus)
export function haversineMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000 // raio da Terra em metros
  const toRad = (deg) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

// Promise wrapper para a Geolocation API do navegador.
// FUTURO: a validação de raio deve ser refeita no servidor (anti-mock de GPS),
// e aqui também entraria a leitura de trajeto (watchPosition) para validar
// corrida/pedalada de verdade no sistema de turbinas.
export function getPosition(
  options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalização não suportada neste navegador.'))
      return
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, options)
  })
}
