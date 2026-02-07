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

  if (error) return <div>読み込みエラー</div>;
  return (
    <div className="space-y-4 page-wrap">
      <h1 className="text-2xl font-bold text-white">{formatMonth(month)}の支出</h1>
      <div className="flex gap-2 items-center flex-wrap">
        <Link href="/expenses/new" className="btn btn-primary">新規追加</Link>
        <Link href="/expenses/stats" className="btn btn-secondary">月次集計</Link>
        <input
          type="month"
          value={month}
          onChange={(e) => {
            setMonth(e.target.value);
            setCategoryFilter('');
          }}
          className="border border-gray-300 p-2 rounded-lg bg-white text-gray-900"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-gray-300 p-2 rounded-lg bg-white text-gray-900"
        >
          <option value="">すべてのカテゴリ</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm mt-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg overflow-hidden shadow-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700">
              <th className="py-4 px-3 border-b border-gray-200 dark:border-gray-600">日付</th>
              <th className="py-4 px-3 border-b border-gray-200 dark:border-gray-600">勘定科目</th>
              <th className="py-4 px-3 border-b border-gray-200 dark:border-gray-600">金額</th>
              <th className="py-4 px-3 border-b border-gray-200 dark:border-gray-600">お店</th>
              <th className="py-4 px-3 border-b border-gray-200 dark:border-gray-600">利用者</th>
              <th className="py-4 px-3 border-b border-gray-200 dark:border-gray-600">商品名</th>
              <th className="py-4 px-3 border-b border-gray-200 dark:border-gray-600">備考</th>
              <th className="py-4 px-3 border-b border-gray-200 dark:border-gray-600">操作</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-600">
                <td className="py-4 px-3 border-b border-gray-200 dark:border-gray-600">{e.used_at}</td>
                <td className="py-4 px-3 border-b border-gray-200 dark:border-gray-600">{e.category}</td>
                <td className="py-4 px-3 border-b border-gray-200 dark:border-gray-600 text-right">¥{e.amount}</td>
                <td className="py-4 px-3 border-b border-gray-200 dark:border-gray-600">{e.shop}</td>
                <td className="py-4 px-3 border-b border-gray-200 dark:border-gray-600">{e.used_by}</td>
                <td className="py-4 px-3 border-b border-gray-200 dark:border-gray-600">{e.product_name}</td>
                <td className="py-4 px-3 border-b border-gray-200 dark:border-gray-600 whitespace-pre-wrap">{e.remark}</td>
                <td className="py-4 px-3 border-b border-gray-200 dark:border-gray-600 text-center space-x-2">
                  <button onClick={() => location.href=`/expenses/edit/${e.id}`} className="btn btn-sm btn-success">編集</button>
                  <button onClick={() => handleDelete(e.id)} className="btn btn-sm btn-danger">削除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseListPage;
