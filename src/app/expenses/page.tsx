'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import type { Expense } from '@/types/expense';

const ExpenseListPage = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const params = new URLSearchParams({ month });
    if (categoryFilter) params.append('category', categoryFilter);
    try {
      const res = await fetch(`/api/expense?${params.toString()}`);
      if (!res.ok) throw new Error('読み込み失敗');
      const data: Expense[] = await res.json();
      setExpenses(data);
      if (!categoryFilter) {
        setCategories([...new Set(data.map((d) => d.category))]);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }, [categoryFilter, month]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: number) => {
    if (!confirm('削除しますか？')) return;
    const res = await fetch(`/api/expense/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setExpenses(expenses.filter((e) => e.id !== id));
    } else {
      alert('削除失敗');
    }
  };

  const formatMonth = (m: string) => {
    const [y, mm] = m.split('-');
    return `${y}年${mm}月`;
  };

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalCount = expenses.length;

  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  if (error) return <div className="text-rose-400 text-center p-6 card-basic">読み込みエラー: {error}</div>;

  return (
    <div className="space-y-6 page-wrap">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            💰 {formatMonth(month)}の支出管理
          </h1>
          <p className="text-xs text-slate-300 mt-1">家計簿支出ログと月次集計</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/expenses/new" className="btn btn-primary">➕ 新規追加</Link>
          <Link href="/expenses/stats" className="btn btn-secondary">📊 月次集計詳細</Link>
        </div>
      </div>

      {/* フィルター＆コントロール */}
      <div className="card-basic p-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300 font-semibold">対象月:</span>
            <input
              type="month"
              value={month}
              onChange={(e) => {
                setMonth(e.target.value);
                setCategoryFilter('');
              }}
              className="px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300 font-semibold">カテゴリ:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">すべてのカテゴリ</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-mono font-medium">
          登録件数: <span className="font-bold text-white">{totalCount}</span> 件
        </div>
      </div>

      {/* 当月サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-basic bg-gradient-to-br from-teal-900/40 to-slate-800/60 border border-teal-500/30 p-4">
          <div className="text-xs font-medium text-teal-200 uppercase tracking-wider">当月合計金額</div>
          <div className="text-2xl sm:text-3xl font-bold text-white mt-1">
            ¥{totalAmount.toLocaleString()}
          </div>
        </div>

        <div className="card-basic bg-gradient-to-br from-cyan-900/40 to-slate-800/60 border border-cyan-500/30 p-4">
          <div className="text-xs font-medium text-cyan-200 uppercase tracking-wider">件数</div>
          <div className="text-2xl sm:text-3xl font-bold text-white mt-1">
            {totalCount} <span className="text-xs text-slate-300">件</span>
          </div>
        </div>

        <div className="card-basic bg-gradient-to-br from-indigo-900/40 to-slate-800/60 border border-indigo-500/30 p-4">
          <div className="text-xs font-medium text-indigo-200 uppercase tracking-wider mb-2">カテゴリ別内訳</div>
          <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
            {Object.keys(categoryTotals).length === 0 ? (
              <span className="text-xs text-slate-400">データなし</span>
            ) : (
              Object.entries(categoryTotals).map(([cat, amt]) => (
                <span key={cat} className="inline-block px-2 py-0.5 bg-indigo-500/20 text-indigo-200 rounded-lg text-xs border border-indigo-500/30 font-mono">
                  {cat}: ¥{amt.toLocaleString()}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {/* テーブル */}
      <div className="table-container">
        <table className="table-basic">
          <thead>
            <tr>
              <th className="table-header">日付</th>
              <th className="table-header">勘定科目</th>
              <th className="table-header text-right">金額</th>
              <th className="table-header">お店</th>
              <th className="table-header">利用者</th>
              <th className="table-header">商品名</th>
              <th className="table-header">備考</th>
              <th className="table-header text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={8} className="table-cell text-center text-slate-400 py-8">
                  該当する支出記録がありません
                </td>
              </tr>
            ) : (
              expenses.map((e) => (
                <tr key={e.id} className="table-row">
                  <td className="table-cell font-mono text-xs text-slate-300">{e.used_at}</td>
                  <td className="table-cell font-medium text-slate-200">{e.category}</td>
                  <td className="table-cell font-mono font-bold text-teal-300 text-right">¥{e.amount.toLocaleString()}</td>
                  <td className="table-cell text-xs text-slate-300">{e.shop || '-'}</td>
                  <td className="table-cell text-xs text-slate-300">{e.used_by || '-'}</td>
                  <td className="table-cell text-xs text-slate-200 font-medium">{e.product_name || '-'}</td>
                  <td className="table-cell text-xs text-slate-400 whitespace-pre-wrap">{e.remark || '-'}</td>
                  <td className="table-cell text-right space-x-2">
                    <Link href={`/expenses/edit/${e.id}`} className="btn btn-sm btn-success">編集</Link>
                    <button onClick={() => handleDelete(e.id)} className="btn btn-sm btn-danger">削除</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseListPage;
