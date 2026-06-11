import { neon } from '@neondatabase/serverless'

// Função serverless da Vercel: POST /api/register { name, email }
//
// SEGURANÇA: a string de conexão (DATABASE_URL) existe SOMENTE como variável
// de ambiente na Vercel (criada automaticamente pela integração Neon).
// Nunca vai para o repositório nem para o JavaScript do navegador.
// Esta função apenas INSERE — não existe endpoint de leitura, então os
// e-mails cadastrados só são visíveis para o dono do banco.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'use POST' })
  }

  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!url) {
    // banco ainda não conectado na Vercel (Storage → Create Database → Neon)
    return res.status(503).json({ error: 'banco não configurado' })
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body ?? {})
    const name = String(body.name ?? '').trim().slice(0, 60)
    const email = String(body.email ?? '').trim().toLowerCase().slice(0, 120)

    if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'nome ou e-mail inválido' })
    }

    const sql = neon(url)
    // idempotente: cria a tabela no primeiro uso (dispensa setup manual de SQL)
    await sql`CREATE TABLE IF NOT EXISTS players (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ DEFAULT now()
    )`
    const rows = await sql`
      INSERT INTO players (name, email) VALUES (${name}, ${email})
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id`

    return res.status(200).json({ ok: true, id: rows[0].id })
  } catch (err) {
    console.error('register error:', err)
    return res.status(500).json({ error: 'erro interno' })
  }
}
