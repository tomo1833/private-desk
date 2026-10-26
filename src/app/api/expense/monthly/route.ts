import { NextResponse } from 'next/server';
import { runSelect } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const yearParam = searchParams.get('year');
  const year = yearParam || String(new Date().getFullYear());
  const usedBy = searchParams.get('used_by') || '共有';

  let sql = 'SELECT substr(used_at, 1, 7) as month, SUM(amount) as total, COUNT(*) as count FROM expenses WHERE used_at LIKE ?';
  const params: (string | number | null)[] = [`${year}-%`];

  if (usedBy !== 'all') {
    sql += ' AND used_by = ?';
    params.push(usedBy);
  }
  sql += ' GROUP BY substr(used_at, 1, 7) ORDER BY month ASC';

  try {
    const rows = await runSelect<{ month: string; total: number | bigint; count: number | bigint }>(sql, params);
    
    // Map rows into a map for fast lookup
    const rowMap = new Map<string, { total: number; count: number }>();
    rows.forEach(r => {
      rowMap.set(r.month, {
        total: Number(r.total || 0),
        count: Number(r.count || 0),
      });
    });

    // Ensure all 12 months for the selected year are present in the response
    const fullYearData = [];
    for (let m = 1; m <= 12; m++) {
      const monthStr = `${year}-${String(m).padStart(2, '0')}`;
      const existing = rowMap.get(monthStr);
      fullYearData.push({
        month: monthStr,
        total: existing ? existing.total : 0,
        count: existing ? existing.count : 0,
      });
    }

    return NextResponse.json(fullYearData);
  } catch (error) {
    console.error('Error fetching monthly expense stats:', error);
    return NextResponse.json({ error: 'DB取得失敗' }, { status: 500 });
  }
}
