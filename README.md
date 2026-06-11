# 🏋️ Jogo da Academia — Treine e Construa

Um jogo em navegador para me ajudar a ir pra academia: protótipo de PWA que
transforma a rotina de treinos em um **jogo de construção de cidade** (estilo
fazendinha top-down, inspirado em Stardew Valley).

## O loop do jogo

1. **📸 Check-in:** você vai à academia, abre o app e tira uma **selfie ao vivo**
   (upload de galeria é proibido por design). O GPS confere se você está dentro do
   raio da academia cadastrada (padrão: 100 m).
   > 🏠 Já vem pré-cadastrada a **Academia Top Up — Parangaba** (Av. Augusto dos
   > Anjos, 1140, Fortaleza-CE). Se o ponto geocodificado estiver impreciso, use o
   > botão "corrigir o ponto" na tela de check-in estando dentro da academia.
   > Constante `DEFAULT_GYM` em `src/store/gameStore.js`.
2. **🎁 Recompensa:** check-in validado → **+50 🪵 madeira, +30 🪨 pedra, +10 🔩 ferro**
   (1 check-in recompensado por dia).
3. **🔨 Construção:** gaste materiais para construir prédios no terreno 5x5.
   Alguns são instantâneos, outros levam de 30 min a 4 h.
4. **⚡ Aceleração:** corrida/pedalada fora da academia rende **turbinas** —
   cada uma pula 1 h de obra (no protótipo, a atividade é simulada por um botão).
5. **👥 Coleção:** cada prédio concluído atrai um **morador exclusivo** (NPC com
   frase motivacional) para o seu álbum. Complete os 7!

## Economia (balanceamento atual)

| Prédio               | Custo                  | Tempo  | Morador                  |
| -------------------- | ---------------------- | ------ | ------------------------ |
| 🪑 Banco de Praça     | 20🪵                   | ⚡ já   | 🧓 Seu Zé                |
| 💡 Poste de Luz       | 15🪵 5🔩               | ⚡ já   | 🐈 Vagalume              |
| 🥕 Horta Comunitária  | 40🪵 20🪨              | 30 min | 👩‍🌾 Dona Maria            |
| 🧘 Espaço Zen         | 50🪵 30🪨 5🔩          | 1 h    | 🧘‍♂️ Mestre Zen            |
| 🏋️ Rack de Supino     | 60🪵 40🪨 15🔩         | 2 h    | 💪 Marcos                |
| 🏃 Pista de Corrida   | 80🪵 50🪨 10🔩         | 3 h    | 🏃‍♀️ Ana                   |
| 🤸 Praça de Calistenia| 100🪵 60🪨 20🔩        | 4 h    | 🤸‍♂️ Léo                   |

Constantes de balanceamento em `src/store/gameStore.js` e catálogo em
`src/data/buildings.js` — fácil de ajustar.

## Como rodar

```bash
npm install
npm run dev          # desktop: http://localhost:5173 (câmera/GPS funcionam em localhost)
npm run dev:phone    # celular: https com certificado autoassinado
```

**Para testar no celular:** rode `npm run dev:phone`, conecte o celular na mesma
rede Wi-Fi, abra o endereço `https://SEU-IP:5173` que o Vite mostra no terminal
(linha "Network") e **aceite o aviso de certificado**. Câmera e GPS exigem HTTPS
fora de localhost.

💡 No celular, use "Adicionar à tela inicial" para abrir como app (PWA).

## Deploy (Vercel)

Repositório: [`matheusnorjosa/academia.game`](https://github.com/matheusnorjosa/academia.game).
Importado na [Vercel](https://vercel.com/new), que detecta o framework Vite
automaticamente (build `vite build`, saída `dist/`). A pasta `api/` vira funções
serverless. Cada `git push` na branch `main` publica uma nova versão sozinho.

## Banco de dados (cadastro)

A tela de cadastro guarda **apenas nome e e-mail**, num Postgres gratuito
([Neon](https://neon.tech)) conectado pela própria Vercel:

1. No projeto da Vercel: **Storage → Create Database → Neon (Postgres)** →
   Create & Connect. A env var `DATABASE_URL` é criada sozinha.
2. Redeploy. Pronto — a tabela `players` se cria sozinha no primeiro cadastro.

### 🔒 Política de segredos (regra do projeto)

- **Nenhum segredo no repositório.** O `DATABASE_URL` existe só como variável
  de ambiente na Vercel; `.env*` está no `.gitignore` (exceto `.env.example`,
  que é um modelo sem valores reais).
- **Nenhuma chave no navegador.** Quem fala com o banco é a função serverless
  `api/register.js` — o frontend só faz `POST /api/register`.
- **Só escrita.** Não existe endpoint de leitura: os e-mails cadastrados são
  visíveis apenas para o dono do banco (dashboard Neon/Vercel).
- As selfies de treino nunca saem do aparelho (ficam no `localStorage`).

## Stack

- **Vite + React 19** (JavaScript puro)
- **Tailwind CSS v4** (via plugin `@tailwindcss/vite`, tema no `@theme` do `src/index.css`)
- **Zustand + persist** → save do jogo no `localStorage` (chave `jogo-da-academia-save`)
- **Web APIs nativas:** `getUserMedia` (câmera) e Geolocation (GPS)
- Sem router: alternância de view em `App.jsx`

## O que é real × o que é simulado

| Funcionalidade            | Status                                              |
| ------------------------- | --------------------------------------------------- |
| Cadastro (nome + e-mail)  | ✅ real (Neon Postgres via função serverless)       |
| Câmera ao vivo (selfie)   | ✅ real                                             |
| Validação de raio por GPS | ✅ real (haversine) + 🧪 modo teste p/ desenvolver   |
| Cadastro da academia      | ✅ real (usa a posição atual)                       |
| Economia/obras/turbinas   | ✅ real (persistido localmente)                     |
| Corrida/pedalada extra    | 🧪 simulada (botão) — futura integração Strava/GPS  |
| Anti-mock de GPS          | ❌ futuro (exige validação server-side)             |
| Validação da foto por IA  | ❌ futuro                                           |

Os pontos de integração futura estão marcados com comentários `FUTURO:` no código.

## Estrutura

```
api/
  register.js           ← função serverless (Vercel) que grava o cadastro no Neon
src/
  store/gameStore.js    ← toda a lógica/economia do jogo
  data/buildings.js     ← catálogo de prédios + NPCs (balanceamento)
  pages/CityPage.jsx    ← Tela 1: mapa da cidade (grid 5x5)
  pages/CheckinPage.jsx ← Tela 2: câmera + GPS (anti-enrolação)
  components/           ← LootModal (Tela 3), BuildMenu (Tela 4), álbum, etc.
  utils/                ← haversine/GPS, datas/streak, relógio reativo
```

## Roadmap

- [ ] Integração Strava (ou trajeto GPS) para validar atividade extra
- [ ] Backend (validação server-side do check-in, save na nuvem)
- [ ] Validação da selfie por IA
- [ ] Sprites em pixel art no lugar dos emojis
- [ ] Service worker (offline + instalação completa)
- [ ] Mais prédios, decorações e eventos sazonais
