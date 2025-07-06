import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: 'prompt required' }, { status: 400 });
    }
    const host = process.env.OLLAMA_HOST || 'localhost';
    const port = process.env.OLLAMA_PORT || '11434';
    const res = await fetch(`http://${host}:${port}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'Gemma3:12b', prompt, stream: false }),
    });
    if (!res.ok) {
      return NextResponse.json({ error: 'LLM request failed' }, { status: 500 });
    }
    const data = await res.json();
    console.log('✅ Ollamaからの応答:', data);
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'LLM fetch error' }, { status: 500 });
  }
}
