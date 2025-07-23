import { NextResponse } from 'next/server';
import { runSelect } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month');
  if (!month) {
    return NextResponse.json({ error: 'month required' }, { status: 400 });
  }
  const usedBy = searchParams.get('used_by') || '共有';
  const start = `${month}-01`;
  const end = `${month}-31`;
  let sql = 'SELECT category, SUM(amount) as total FROM expenses WHERE used_at BETWEEN ? AND ?';
  const params: (string | number | null)[] = [start, end];
  if (usedBy !== 'all') {
    sql += ' AND used_by = ?';
    params.push(usedBy);
  }
  sql += ' GROUP BY category ORDER BY category';
  try {
    const rows = runSelect<{ category: string; total: number }>(sql, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'DB取得失敗' }, { status: 500 });
  }
}
