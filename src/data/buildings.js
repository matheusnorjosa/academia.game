// ─────────────────────────────────────────────────────────────
// Catálogo de prédios do Jogo da Academia (balanceamento da economia)
// Cada prédio atrai um morador (NPC) exclusivo para o álbum.
// buildSeconds = 0 → construção instantânea
// ─────────────────────────────────────────────────────────────
export const BUILDINGS = [
  {
    id: 'banco',
    name: 'Banco de Praça',
    emoji: '🪑',
    desc: 'Um cantinho para descansar entre as séries.',
    cost: { wood: 20 },
    buildSeconds: 0,
    npc: {
      name: 'Seu Zé, o Contemplativo',
      emoji: '🧓',
      quote: 'Descansar também faz parte do treino, meu jovem.',
    },
  },
  {
    id: 'poste',
    name: 'Poste de Luz',
    emoji: '💡',
    desc: 'Ilumina a cidade para os treinos noturnos.',
    cost: { wood: 15, iron: 5 },
    buildSeconds: 0,
    npc: {
      name: 'Vagalume, o Gato Noturno',
      emoji: '🐈',
      quote: 'Miau! (Tradução: treino à noite também conta.)',
    },
  },
  {
    id: 'horta',
    name: 'Horta Comunitária',
    emoji: '🥕',
    desc: 'Comida de verdade para alimentar os músculos.',
    cost: { wood: 40, stone: 20 },
    buildSeconds: 1800, // 30 min
    npc: {
      name: 'Dona Maria, a Nutricionista',
      emoji: '👩‍🌾',
      quote: 'Sem combustível bom, não há músculo que cresça!',
    },
  },
  {
    id: 'yoga',
    name: 'Espaço Zen',
    emoji: '🧘',
    desc: 'Alongamento, respiração e paz interior.',
    cost: { wood: 50, stone: 30, iron: 5 },
    buildSeconds: 3600, // 1h
    npc: {
      name: 'Mestre Zen',
      emoji: '🧘‍♂️',
      quote: 'Inspira... expira... e não pula o alongamento.',
    },
  },
  {
    id: 'rack',
    name: 'Rack de Supino',
    emoji: '🏋️',
    desc: 'O altar sagrado do dia de peito.',
    cost: { wood: 60, stone: 40, iron: 15 },
    buildSeconds: 7200, // 2h
    npc: {
      name: 'Marcos, o Halterofilista',
      emoji: '💪',
      quote: 'Hoje é dia de peito. Amanhã também. 😤',
    },
  },
  {
    id: 'pista',
    name: 'Pista de Corrida',
    emoji: '🏃',
    desc: 'Para quem gosta de sentir o vento no rosto.',
    cost: { wood: 80, stone: 50, iron: 10 },
    buildSeconds: 10800, // 3h
    npc: {
      name: 'Ana, a Maratonista',
      emoji: '🏃‍♀️',
      quote: 'Devagar e sempre... mas de preferência rápido!',
    },
  },
  {
    id: 'calistenia',
    name: 'Praça de Calistenia',
    emoji: '🤸',
    desc: 'Barras, paralelas e muita força com o peso do corpo.',
    cost: { wood: 100, stone: 60, iron: 20 },
    buildSeconds: 14400, // 4h
    npc: {
      name: 'Léo, o Rei da Barra',
      emoji: '🤸‍♂️',
      quote: 'A gravidade é só uma sugestão.',
    },
  },
]

export const getBuilding = (id) => BUILDINGS.find((b) => b.id === id)
