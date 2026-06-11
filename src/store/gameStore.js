import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getBuilding } from '../data/buildings'
import { todayKey } from '../utils/time'

// ─────────────────────────────────────────────────────────────
// Constantes de balanceamento do jogo
// ─────────────────────────────────────────────────────────────
export const CHECKIN_REWARD = { wood: 50, stone: 30, iron: 10 }
export const TURBINE_SKIP_MS = 60 * 60 * 1000 // 1 turbina = pula 1h de obra
export const EXTRA_ACTIVITY_TURBINES = 2 // recompensa por corrida/pedalada extra
export const GRID_SLOTS = 25 // terreno 5x5
export const DEFAULT_GYM_RADIUS = 100 // metros (GPS indoor oscila; 100m ≈ mesmo quarteirão)

// Academia padrão do jogador: Academia Top Up — Av. Augusto dos Anjos, 1140,
// Parangaba/Bonsucesso, Fortaleza-CE (coordenadas geocodificadas do nº 1140 via OSM).
// Para afinar o ponto, use o botão "corrigir o ponto" dentro da própria academia.
export const DEFAULT_GYM = {
  lat: -3.777116,
  lng: -38.576817,
  radius: DEFAULT_GYM_RADIUS,
  name: 'Academia Top Up - Parangaba',
}

// Checagem de custo (usada pela UI e pelo próprio store)
export const canAfford = (player, cost) =>
  player.wood >= (cost.wood ?? 0) &&
  player.stone >= (cost.stone ?? 0) &&
  player.iron >= (cost.iron ?? 0)

const addNpc = (npcs, typeId) =>
  npcs.includes(typeId) ? npcs : [...npcs, typeId]

export const useGameStore = create(
  persist(
    (set, get) => ({
      // ── Estado ────────────────────────────────────────────
      player: { wood: 0, stone: 0, iron: 0, turbines: 0 },
      gymLocation: { ...DEFAULT_GYM },
      buildings: [], // { uid, typeId, slot, status: 'building' | 'done', startedAt, finishesAt }
      npcs: [], // ids de prédios cujo morador já foi desbloqueado
      checkins: [], // { date: 'AAAA-MM-DD', at, photo (thumb base64) }
      pendingLoot: null, // recompensa aguardando o "Coletar" do LootModal
      toast: null,

      // ── Check-in na academia ──────────────────────────────
      setGymLocation: (lat, lng, radius = DEFAULT_GYM_RADIUS, name) =>
        set((s) => ({
          gymLocation: {
            lat,
            lng,
            radius,
            name: name ?? s.gymLocation.name ?? 'Minha academia',
          },
        })),

      // Chamado quando selfie + GPS foram validados na CheckinPage.
      // Guarda a foto (thumbnail) como "prova" no diário de treinos.
      registerCheckin: (photo) =>
        set((s) => ({
          pendingLoot: { ...CHECKIN_REWARD },
          checkins: [
            ...s.checkins,
            { date: todayKey(), at: Date.now(), photo },
          ].slice(-30), // mantém só os últimos 30 p/ não estourar o localStorage
        })),

      collectLoot: () =>
        set((s) => {
          if (!s.pendingLoot) return s
          const { wood, stone, iron } = s.pendingLoot
          return {
            player: {
              ...s.player,
              wood: s.player.wood + wood,
              stone: s.player.stone + stone,
              iron: s.player.iron + iron,
            },
            pendingLoot: null,
          }
        }),

      // ── Construção ────────────────────────────────────────
      startBuilding: (typeId, slot) => {
        const type = getBuilding(typeId)
        const s = get()
        if (!type || !canAfford(s.player, type.cost)) return false
        if (s.buildings.some((b) => b.slot === slot)) return false
        const now = Date.now()
        const instant = type.buildSeconds === 0
        set((st) => ({
          player: {
            ...st.player,
            wood: st.player.wood - (type.cost.wood ?? 0),
            stone: st.player.stone - (type.cost.stone ?? 0),
            iron: st.player.iron - (type.cost.iron ?? 0),
          },
          buildings: [
            ...st.buildings,
            {
              uid: `${typeId}-${now}`,
              typeId,
              slot,
              status: instant ? 'done' : 'building',
              startedAt: now,
              finishesAt: now + type.buildSeconds * 1000,
            },
          ],
          npcs: instant ? addNpc(st.npcs, typeId) : st.npcs,
          toast: instant
            ? `🎉 ${type.name} construído! ${type.npc.name.split(',')[0]} chegou na cidade!`
            : `🔨 ${type.name} em obras!`,
        }))
        return true
      },

      // Chamado a cada segundo pelo App: conclui obras cujo tempo acabou
      tickConstructions: () => {
        const now = Date.now()
        const done = get().buildings.filter(
          (b) => b.status === 'building' && b.finishesAt <= now,
        )
        if (done.length === 0) return
        set((s) => ({
          buildings: s.buildings.map((b) =>
            done.some((d) => d.uid === b.uid) ? { ...b, status: 'done' } : b,
          ),
          npcs: done.reduce((acc, d) => addNpc(acc, d.typeId), s.npcs),
          toast: `🎉 ${getBuilding(done[0].typeId).name} concluído! Novo morador na cidade!`,
        }))
      },

      // ── Turbinas (aceleração de obras) ────────────────────
      useTurbine: (uid) => {
        const s = get()
        const b = s.buildings.find((x) => x.uid === uid)
        if (!b || b.status !== 'building' || s.player.turbines < 1) return
        set((st) => ({
          player: { ...st.player, turbines: st.player.turbines - 1 },
          buildings: st.buildings.map((x) =>
            x.uid === uid ? { ...x, finishesAt: x.finishesAt - TURBINE_SKIP_MS } : x,
          ),
        }))
        get().tickConstructions() // se a obra "pulou" para o passado, conclui na hora
      },

      // FUTURO: substituir por integração real (Strava API ou leitura de
      // trajeto via GPS) para validar corrida/pedalada antes de recompensar.
      addTurbines: (n) =>
        set((s) => ({
          player: { ...s.player, turbines: s.player.turbines + n },
          toast: `⚡ +${n} turbinas! Use-as para acelerar obras.`,
        })),

      // ── UI ────────────────────────────────────────────────
      setToast: (msg) => set({ toast: msg }),
      clearToast: () => set({ toast: null }),
    }),
    {
      name: 'jogo-da-academia-save', // chave do save no localStorage
      version: 1,
      // v1: passou a existir academia padrão (Top Up). Saves v0 eram de teste
      // local, então a localização antiga é substituída pela oficial.
      migrate: (persisted, version) => {
        if (version < 1) {
          return { ...persisted, gymLocation: { ...DEFAULT_GYM } }
        }
        return persisted
      },
      partialize: (s) => ({
        player: s.player,
        gymLocation: s.gymLocation,
        buildings: s.buildings,
        npcs: s.npcs,
        checkins: s.checkins,
        pendingLoot: s.pendingLoot,
      }),
    },
  ),
)
