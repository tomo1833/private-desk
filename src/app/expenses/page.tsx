'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Expense } from '@/types/expense';

const ExpenseListPage = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    try {
      const res = await fetch(`/api/expense?month=${month}`);
      if (!res.ok) throw new Error('読み込み失敗');
      const data: Expense[] = await res.json();
      setExpenses(data);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('削除しますか？')) return;
    const res = await fetch(`/api/expense/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setExpenses(expenses.filter((e) => e.id !== id));
    } else {
      alert('削除失敗');
    }
  };

  if (error) return <div>読み込みエラー</div>;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">今月の支出</h1>
      <Link href="/expenses/new" className="bg-blue-500 text-white px-4 py-2 rounded">新規追加</Link>
      <table className="w-full text-sm mt-2 border">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-2 py-1 border">日付</th>
            <th className="px-2 py-1 border">勘定科目</th>
            <th className="px-2 py-1 border">金額</th>
            <th className="px-2 py-1 border">お店</th>
            <th className="px-2 py-1 border">商品名</th>
            <th className="px-2 py-1 border">備考</th>
            <th className="px-2 py-1 border">操作</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((e) => (
            <tr key={e.id} className="border-b">
              <td className="px-2 py-1 border">{e.used_at}</td>
              <td className="px-2 py-1 border">{e.category}</td>
              <td className="px-2 py-1 border text-right">¥{e.amount}</td>
              <td className="px-2 py-1 border">{e.shop}</td>
              <td className="px-2 py-1 border">{e.product_name}</td>
              <td className="px-2 py-1 border whitespace-pre-wrap">{e.remark}</td>
              <td className="px-2 py-1 border text-center space-x-2">
                <button onClick={() => location.href=`/expenses/edit/${e.id}`} className="bg-green-500 text-white px-2 py-1 rounded">編集</button>
                <button onClick={() => handleDelete(e.id)} className="bg-red-500 text-white px-2 py-1 rounded">削除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseListPage;
