import { NextResponse } from 'next/server';
import { runSelect, runExecute } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const sql: string = body.sql;
    if (!sql || typeof sql !== 'string') {
      return NextResponse.json({ error: 'sql is required' }, { status: 400 });
    }
    const trimmed = sql.trim();
    const firstWord = trimmed.split(/\s+/)[0].toUpperCase();
    if (['SELECT', 'PRAGMA', 'WITH'].includes(firstWord)) {
      const rows = runSelect<any>(sql);
      return NextResponse.json({ rows });
    }
    runExecute(sql);
    return NextResponse.json({ message: 'ok' });
  } catch (error) {
    console.error('SQL execution error:', error);
    return NextResponse.json({ error: 'execution failed' }, { status: 500 });
  }
}
