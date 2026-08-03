import { NextResponse } from 'next/server';
import { runSelect } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month');
  if (!month) {
    return NextResponse.json({ error: 'month required' }, { status: 400 });
  }
  const usedBy = searchParams.get('used_by') || '共有';
  let sql = 'SELECT category, SUM(amount) as total FROM expenses WHERE used_at LIKE ?';
  const params: (string | number | null)[] = [`${month}%`];
  if (usedBy !== 'all') {
    sql += ' AND used_by = ?';
    params.push(usedBy);
  }
  sql += ' GROUP BY category ORDER BY category';
  try {
    const rows = await runSelect<{ category: string; total: number | bigint }>(sql, params);
    const formatted = rows.map((r) => ({
      category: r.category,
      total: Number(r.total || 0),
    }));
    return NextResponse.json(formatted);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'DB取得失敗' }, { status: 500 });
  }
}
