import { NextResponse } from 'next/server';
import { runSelect } from '@/lib/db';

export async function GET() {
  try {
    const rows = runSelect<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    );
    return NextResponse.json(rows.map((r) => r.name));
  } catch (error) {
    console.error('Failed to list tables:', error);
    return NextResponse.json({ error: 'failed to list tables' }, { status: 500 });
  }
}
