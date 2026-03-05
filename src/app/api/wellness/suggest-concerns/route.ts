import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { CONCERNS } from '@/lib/concerns'

const anthropic = new Anthropic()

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title_ja, title_en, content_ja, content_en } = await request.json()

  const concernList = CONCERNS.map(c =>
    `- ${c.id}: ${c.ja} / ${c.en} — ${c.descEn}`
  ).join('\n')

  const articleText = [
    title_ja && `Title (JA): ${title_ja}`,
    title_en && `Title (EN): ${title_en}`,
    content_ja && `Body (JA): ${content_ja.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 600)}`,
    content_en && `Body (EN): ${content_en.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 600)}`,
  ].filter(Boolean).join('\n')

  const prompt = `You are tagging a wellness article for a yoga platform. Based on the article below, select 1–3 concern IDs that best match its content.

Available concerns:
${concernList}

Article:
${articleText}

Reply with ONLY a JSON array of concern IDs, e.g. ["shoulder","stress"]. No explanation.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 128,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '[]'
    const parsed = JSON.parse(text)
    const validIds = new Set(CONCERNS.map(c => c.id))
    const concerns = parsed.filter((id: unknown) => typeof id === 'string' && validIds.has(id))
    return NextResponse.json({ concerns })
  } catch {
    return NextResponse.json({ concerns: [] })
  }
}
