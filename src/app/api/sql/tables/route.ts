import { NextResponse } from 'next/server';
import { runSelect } from '@/lib/db';
import { requireVaultSession } from '@/lib/passwordVault';

export async function GET(request: Request) {
  const { response } = requireVaultSession(request);
  if (response) return response;
  try {
    const rows = await runSelect<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    );
    return NextResponse.json(rows.map((r) => r.name));
  } catch (error) {
    console.error('Failed to list tables:', error);
    return NextResponse.json({ error: 'failed to list tables' }, { status: 500 });
  }
}
